/* global define: true */
/* global _: true */

var var_languageField = "LanguageCode";
var lang = (session.user.LanguageCode) ? session.user.LanguageCode : 'ENU';

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function ODataChartDataService($http, $q, navigationNodeService, viewPanelService) {
            return {
                getData: function (url) {
                    var deferred = $q.defer();

                    if (url) {
                        url = (url.indexOf('?') > -1) ? url + "& $format=json&$top=1" : url + "?$format=json&$top=1";

                        if (url.indexOf("/Action.") > -1)
                            url += "&$count=true";
                    }

                    $.getJSON(url,
                    function (result) {
                        deferred.resolve(result.value);
                    });

                    return deferred.promise;
                },
                getAllData: function (url) {
                    var deferred = $q.defer();

                    if (url) {
                        url = (url.indexOf('?') > -1) ? url + "& $format=json" : url + "?$format=json";

                        if (url.indexOf("/Action.") > -1)
                            url += "&$count=true";
                    }

                    $.getJSON(url,
                        function (result) {
                            deferred.resolve(result.value);
                        });

                    return deferred.promise;
                }
            };
        }

        function ODataChartMainController($scope, config, advancedChartDataService, gridConfigService, chartConfigService, localizationService) {

            var vm = this;
            var colorIndex = 0;
            var conString = config.queryString || '';
            var chartLoadingElement;

            $scope.$on("kendoWidgetCreated", function (event, widget) {

                // Spin loading indicator on the element
                var currLoadingEle = $(widget.element).siblings(".chart-loading")[0];
                if (currLoadingEle && !chartLoadingElement && config.data_url) {
                    chartLoadingElement = $(currLoadingEle);
                    kendo.ui.progress(chartLoadingElement, true);
                }
            });

            angular.extend(vm, {
                //setting chartOptions to null by default results in a kendo bad
                //number formatter exception, so it is necessary to provide a
                //placeholder until the async call can be made for the real options.
                //kendo, you so cray-cray.
                processedQueryString: function() {
                    
                    var urlParams = app.lib.getQueryParams();

                    if (conString.length > 0) {

                        _.each(config.queryParamKeys,
                            function (item) {
                                var itemKey = item.Key.toLowerCase();
                                if (urlParams.hasOwnProperty(itemKey))
                                    conString = conString.replace("{{" + item.Key + "}}", urlParams[itemKey]);
                                else
                                    conString = conString.replace("{{" + item.Key + "}}", item.Value);
                            });

                        if (conString.indexOf('@User') != -1) {
                            conString = conString.replace('@User', session.user.Id)
                        }

                        if (conString.indexOf('@Lang') != -1) {
                            conString = conString.replace('@Lang', lang)
                        }
                    }

                    if (conString.indexOf('$select') !== -1) {

                        var selection = app.lib.getQueryParams(conString) || {};
                        var selectItems = selection["$select"] || "";

                        if (selectItems.length === 0) {
                            conString = "";
                            for (var key in selection) {
                                var val = selection[key];
                                if (selection.hasOwnProperty(key) && key !== "$select") {
                                    conString += (conString.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                            }
                        }
                    }

                    return conString;
                },
                chartOptions: chartConfigService.getDefaultChartOptions(),
                gridOptions: null, // gridHasOptions ? $scope.grid.options : null,
                isGridVisible: false,
                getChartOptions: function (queryStr) {

                    conString = queryStr;

                    var ds = {
                        type: "odata-v4",
                        transport: {
                            read: {
                                url: config.data_url + conString,
                                dataType: "json",
                                beforeSend: function (e, request) {
                                    var rewriteURL = chartConfigService.rewriteFilterParams(request.url);
                                    if (rewriteURL) request.url = rewriteURL;
                                }
                            }
                        },
                        serverFiltering: true,
                        requestEnd: function (e) {
                            if (chartLoadingElement) {
                                // Clear up the loading indicator for this chart
                                $(chartLoadingElement[0]).empty();
                            }
                        },
                        schema: {
                            data: function (response) {

                                //function to iterate call to @odata.nextLink when data fetched < Odata count
                                //return all data when data fetched = Odata count 
                                function iterateNextData(nextLink, totalCount, allData) {
                                    var currentCount = allData.length;

                                    if (currentCount < totalCount) {
                                        $.ajax({
                                            url: nextLink,
                                            type: 'GET',
                                            async: false,
                                            success: function (res) {
                                                Array.prototype.push.apply(allData, res.value);
                                                iterateNextData(res["@odata.nextLink"], totalCount, allData);
                                            }
                                        });
                                    }

                                    return allData;
                                };

                                var data = response.value;

                                if (response["@odata.nextLink"])
                                    data = iterateNextData(response["@odata.nextLink"], response["@odata.count"], data);

                                return data;
                            }
                        }
                    };

                    if (config.applyGrouping) {
                        ds.group = {
                            field: config.groupByColumn.field,
                            aggregates: [
                                { field: "Index", aggregate: "count" }
                            ]
                        }
                    }

                    var dataSource = new kendo.data.DataSource(ds);

                    switch (config.chartType.Id) {
                        case "donut":
                            vm.buildPercentageChart(dataSource);
                            break;
                        case "stackedarea":
                        case "stackedbar":
                        case "stackedcolumn":
                            vm.buildStackChart(dataSource);
                            break;
                        default:
                            vm.buildChart(dataSource);
                    }
                },
                buildChart: function (dataSource) {

                    dataSource.read();

                    dataSource.bind("change", function (e) {

                        var self = this;

                        chartConfigService.getConfig(config.configurationName, config.groupByColumn, config.chartType).then(function (chartOptions) {
    
                            vm.chartOptions = chartConfigService.getCustomChartOptions(self, config, chartOptions);
                        });
                    });
                },
                buildStackChart: function (dataSource) {

                    dataSource.read();

                    dataSource.bind("change", function (e) {

                        var self = this;

                        chartConfigService.getConfig(config.configurationName, config.groupByColumn, config.chartType).then(function (chartOptions) {

                            vm.chartOptions = chartOptions;

                            var stackby = config.stackByColumn.field;

                            var data_series = {};
                            var categories = [];
                            var cnt = 0;
                            angular.forEach(self.view(), function (item) {

                                var data = (config.applyGrouping) ? item.items : [item];
                                var category = (config.applyGrouping) ? item.value : item[config.label.field];

                                var stackdata = _.groupBy(data, function (num) {

                                    return num[stackby];
                                });

                                angular.forEach(stackdata, function (val, key) {
                                    var seriesdata = data_series[key] || [];
                                    seriesdata[cnt] = stackdata[key].length;
                                    data_series[key] = seriesdata;

                                });

                                categories.push(category);
                                cnt++;
                            });

                            var series = [];

                            angular.forEach(data_series, function (val, key) {
                                series.push({ name: key, data: val, color: chartConfigService.getChartColor(config, key) });
                            });

                            var chartType = config.chartType.Id.split("stacked")[1];
                            vm.chartOptions.seriesDefaults = {
                                type: chartType,
                                stack: true
                            };

                            vm.chartOptions.categoryAxis.categories = categories;

                            vm.chartOptions.series = series;
                        });

                    });
                    
                },
                getColor: function () {
                    var colors = vm.chartOptions.seriesColors;
                    return colors[colorIndex++ % colors.length];
                },
                buildPercentageChart: function (dataSource) {

                    dataSource.read();

                    dataSource.bind("change", function (e) {

                        var self = this;

                        chartConfigService.getConfig(config.configurationName, config.groupByColumn, config.chartType).then(function (chartOptions) {
                            vm.chartOptions = chartOptions;
                            var data = self.data();

                            vm.chartOptions.tooltip.visible = false;
                            vm.chartOptions.legend.visible = false;
                            vm.chartOptions.seriesDefaults.labels.visible = false;

                            var value = _.values(data[0])[0];
                            var key = _.keys(data[0])[0];
                            var emptyObj = {};
                            emptyObj[key] = 100 - value;
                            data.push(emptyObj);
                            var center;
                            var radius;
                            vm.chartOptions.series[0].visual = function (e) {
                                // Obtain parameters for the segments
                                // Will run many times, but that's not an issue
                                center = e.center;
                                radius = e.radius;

                                // Create default visual
                                return e.createVisual();
                            }
                            vm.chartOptions.render = function (e) {
                                var draw = kendo.drawing;
                                var geom = kendo.geometry;
                                var chart = e.sender;

                                // The center and radius are populated by now.
                                // We can ask a circle geometry to calculate the bounding rectangle for us.
                                //
                                // http://docs.telerik.com/kendo-ui/api/javascript/geometry/circle#methods-bbox
                                var circleGeometry = new geom.Circle(center, radius);
                                var bbox = circleGeometry.bbox();

                                // Render the text
                                //
                                // http://docs.telerik.com/kendo-ui/api/javascript/dataviz/drawing/text
                                var text = new draw.Text(value + '%', [0, 0], {
                                    font: "18px Verdana,Arial,sans-serif"
                                });

                                // Align the text in the bounding box
                                //
                                // http://docs.telerik.com/kendo-ui/api/javascript/drawing#methods-align
                                // http://docs.telerik.com/kendo-ui/api/javascript/drawing#methods-vAlign
                                draw.align([text], bbox, "center");
                                draw.vAlign([text], bbox, "center");

                                // Draw it on the Chart drawing surface
                                e.sender.surface.draw(text);
                            }
                            vm.chartOptions.seriesColors[1] = "transparent";

                        });

                    });
                },
                hideGrid: function () {
                    vm.isGridVisible = false;
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                onSeriesClick: function (e) {

                    if ($scope.config.drillIntoSelectedChartSegment) {

                        var searchValue = (config.applyGrouping) ? e.category : e.value;

                        gridConfigService.getGridConfig("odataGridConfig").then(function (response) {

                            vm.gridOptions = response;
                            vm.gridOptions.autoBind = true;
                            var ds = {
                                type: "odata-v4",
                                transport: {
                                    read: {
                                        url: config.data_url + conString,
                                        dataType: "json",
                                        beforeSend: function (e, request) {
                                            var rewriteURL = chartConfigService.rewriteFilterParams(request.url);
                                            if (rewriteURL) request.url = rewriteURL;
                                        }
                                    }
                                },
                                serverFiltering: true,
                                serverPaging: true,
                                serverSorting: true,
                                filter: [
                                    {
                                        field: (!config.applyGrouping) ? config.label.field : vm.chartOptions.categoryAxis.baseUnit,
                                        operator: "eq",
                                        value: (!config.applyGrouping) ? e.category : searchValue
                                    }
                                ]
                            };

                            var el = document.createElement('a');
                            el.href = config.data_url;
                            var path = el.pathname;
                            vm.entity = path.substring(path.lastIndexOf("/") + 1, path.length);

                            gridConfigService.getColumnConfig(vm.entity).then(function (res) {

                                var columns = (config.gridColumns.length > 0) ? config.gridColumns : config.allColumns || [];

                                var selection2 = app.lib.getQueryParams(conString) || {};
                                var selectItems = selection2["$select"] || "";
                                if (selectItems.length > 0) {
                                    selectItems = selectItems.split(',');
                                    columns = [];
                                    for (var n in selectItems) {
                                        var col = _.filter(config.allColumns,
                                            function(el) {
                                                return el.field === selectItems[n];
                                            });

                                        if (col.length > 0) columns.push(col[0]);
                                    }
                                }

                                var idx = 0;

                                vm.gridOptions.reorderable = false;
                                vm.gridOptions.columnMenu.columns = false;
                                vm.gridOptions.dataSource = ds;
                                vm.gridOptions.columns = _.map(columns, function (column) {
                                    //apply grid highlight on the first two columns
                                    var attr = (idx == 0) ? "grid-highlight-column" : (idx == 1) ? "grid-highlight-column grid-highlight-column-title" : "";
                                    attr = { "class": attr }

                                    var tpl =  (column.template && column.template.length > 0) ? column.template : "#= (" + columns[0].field + ") ? " + columns[0].field + " : '' #";

                                    if (idx == 0 || idx == 1) {
                                        tpl = "<a href=\"/DynamicData/Edit/#:" + column.field + "#\">" + tpl + "</a>";
                                    }

                                    column = {
                                        DataType: column.DataType,
                                        field: column.field,
                                        hidden: column.hidden,
                                        template: tpl,
                                        title: column.title,
                                        attributes: attr
                                    }
                                    idx++;
                                    return column;
                                });

                                if ($("#" + vm.entity + "_tpl").html()) {
                                    vm.gridOptions.rowTemplate =
                                        $.proxy(kendo.template($("#" + vm.entity + "_tpl").html()), vm.gridOptions);
                                }

                                var fields = {};
                                angular.forEach(columns, function (item) {
                                    if (item.DataType == "date") {
                                        fields[item.field] = {
                                            type: item.DataType,
                                            parse: function (dateString) {
                                                if (_.isNull(dateString) || _.isUndefined(dateString)) {
                                                    return '';
                                                } else {
                                                    return Date.parse(dateString);
                                                }
                                            }
                                        };
                                    } else
                                        fields[item.field] = { type: item.DataType };

                                });

                                vm.gridOptions.dataSource.schema = {
                                    model: {
                                        id: "id",
                                        fields: fields
                                    }
                                }

                                vm.showGrid();
                                ds = new kendo.data.DataSource(ds);

                            });
                        });

                        $scope.grid.dataSource.query({
                            page: 1,
                            pageSize: $scope.grid.dataSource.pageSize()
                        });
                    }
                },
                showGrid: function () {
                    vm.isGridVisible = true;
                }
            });

            if (config.data_url) {
                var queryStr = vm.processedQueryString() || "";

                var invalids = ["$top", "$count", "$format", "$sort"];

                for (var i in invalids) {
                    if (queryStr.indexOf(invalids[i]) > -1) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Warning,
                            message: localization.ODATAQueryInvalid
                        });
                        return false;
                    }
                }

                var langCodeField = _.filter(config.allColumns, function (el) {
                    return el.field === var_languageField;
                });

                if ((config.filterByCurrentLang && config.showFilterLang) ||
                    (typeof config.filterByCurrentLang === 'undefined' && typeof config.showFilterLang === 'undefined' && langCodeField.length > 0)) {

                    var langFilter = var_languageField + " eq '" + lang + "'";
                    if (queryStr.length > 0) {
                        var params = app.lib.getQueryParams(queryStr) || {};
                        var filterParams = params["$filter"] || "";
                        if (filterParams.length > 0) {
                            queryStr = "";
                            for (var key in params) {
                                var val = params[key];
                                if (key === "$filter")
                                    val = "(" + val + ") and " + langFilter;
                                queryStr += (queryStr.length > 0)
                                    ? "&" + key + "=" + val
                                    : "?" + key + "=" + val;
                            }
                        }
                    } else
                        queryStr += '?$filter=' + langFilter;
                }

                vm.getChartOptions(queryStr);
            }

            $(window).on("resize", function () {
                kendo.resize($(".chart-resize-wrapper"));
            });
        }

        function ODataChartEditController($scope, config, ODataChartDataService, chartConfigService, ODataGridConfigService, localizationService) {
            $scope.config = angular.extend(config, {
                drillIntoSelectedChartSegment: config.drillIntoSelectedChartSegment || false,
                applyGrouping: config.applyGrouping || false,
                chartType: config.chartType || null,
                given_url: config.given_url || null,
                data_url: config.data_url || null,
                queryString: config.queryString || '',
                groupByColumn: config.groupByColumn || null,
                gridColumns: config.gridColumns || [],
                allColumns: config.allColumns || [],
                gridCollection: config.gridCollection || [],
                visibleStackByColumn: (false || (config.stackByColumn != null)),
                stackByColumn: config.stackByColumn || null,
                configurationName: "odataChartConfig",
                chartOptions: config.chartOptions || null,
                queryParamKeys: config.queryParamKeys || [],
                filterByCurrentLang: config.filterByCurrentLang || false,
                showFilterLang: config.showFilterLang || false,
                seriesColor: config.seriesColor || [],
                savedConfigColors: []
            });

            var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));
            //Add new parameters
            _.each(queryParamKeys,
                function (key) {

                    var token = key.replace('{{', '').replace('}}', '');

                    var exist = _.filter(config.queryParamKeys,
                        function (item) {
                            return item.Key === token;
                        });

                    if (exist.length === 0) {
                        config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                    }
                });

            var vm = this;
            angular.extend(vm, {
                languageCodeFilter: var_languageField + " eq '" + lang + "'",
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                drillIntoSelectedChartSegment: $scope.config.drillIntoSelectedChartSegment,
                querySelect: config.queryString.indexOf("$select") > -1 || false,
                queryInvalid: function() {
                    var invalids = ["$top", "$count", "$format", "$sort"];

                    for (var i in invalids) {
                        if (config.queryString.indexOf(invalids[i]) > -1) {
                            $('#saveAdfDialog').attr("disabled", "disabled");
                            return true;
                        }
                    }
                    $('#saveAdfDialog').removeAttr("disabled");
                    return false;
                },
                setShowFilterLang: function() {
                    var langCodeField = _.filter(config.allColumns, function (el) {
                        return el.field === var_languageField;
                    });

                    config.showFilterLang = (langCodeField.length > 0 && config.queryString.indexOf(var_languageField) === -1);
                },
                columns: $scope.config.groupByColumn || [],
                collections: [$scope.config.gridCollection] || [],
                onCollectionsChange: function () {
                    var url = config.given_url;
                    if (url.charAt(url.length - 1) !== "/")
                        url += "/";
                    url += $scope.config.gridCollection.field;
                    vm.getColumns(url);
                },
                gridColumns: _.map(config.gridColumns, function (el) {
                    return el.title;
                }),
                getCollections: function (url) {
                    config.allColumns = [];
                    config.showFilterLang = false;
                    
                    $('#label').attr('disabled', true);
                    $('#groupBy').attr('disabled', true);
                    $('#columns').attr('disabled', true);
                    $('#collections').attr('disabled', true);

                    if ($("#columns").parent().hasClass("k-multiselect")) {
                        $("#columns").parent().replaceWith("<select id=columns disabled class=\"form-control input-sm\" ng-model=\"vm.gridColumns\">")
                    }

                    if (!url)
                        url = config.given_url;

                    ODataChartDataService.getData(config.given_url).then(function (data) {
                        var sets = data || [];

                        if (data[0].kind == 'EntitySet') {
                            $('#collections').removeAttr("disabled");
                            for (var i in sets) {
                                if (sets[i].name) {
                                    vm.collections.push({
                                        field: sets[i].name,
                                        title: sets[i].name
                                    });
                                }
                            }

                            if ($scope.config.gridCollection.length != 0) {
                                if (url.charAt(url.length - 1) !== "/")
                                    url += "/";
                                url += $scope.config.gridCollection.field;

                                if (config.queryString.length > 0)
                                    vm.applyQueryString();
                                else
                                    vm.getColumns(url);
                            }
                        } else {
                            $scope.config.gridCollection = [];
                            $scope.config.data_url = url;

                            if (config.queryString.length > 0)
                                vm.applyQueryString();
                            else
                                vm.setColumns(data, url);
                        }
                    });
                },
                applyQueryString: function () {
                    var conString = config.queryString || '';

                    if (conString.length > 0) {

                        _.each(config.queryParamKeys,
                            function (item) {
                                conString = conString.replace("{{" + item.Key + "}}", item.Value);
                            });

                        if (conString.indexOf('@User') != -1) {
                            conString = conString.replace('@User', session.user.Id);
                        }

                        if (conString.indexOf('@Lang') != -1) {
                            conString = conString.replace('@Lang', lang);
                        }
                    }

                    var url = config.given_url;
                    if (config.gridCollection.field) {
                        if (url.charAt(url.length - 1) !== "/")
                            url += "/";
                        url += $scope.config.gridCollection.field;
                    }

                    var selection2 = app.lib.getQueryParams(conString) || {};
                    var selectItems = selection2["$select"] || "";
                    if (selectItems.length > 0) {
                        url += "?$select=" + selectItems;
                    }

                    if (config.queryString.indexOf("/Action.") > -1) {
                        url += conString;
                    }
                    ODataChartDataService.getData(url).then(function (data) {
                        vm.setColumns(data, url);
                    });
                },
                onChangeQueryString: function() {
                    var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));

                    //Add new parameters
                    _.each(queryParamKeys,
                        function (key) {

                            var token = key.replace('{{', '').replace('}}', '');

                            var exist = _.filter(config.queryParamKeys,
                                function (item) {
                                    return item.Key === token;
                                });

                            if (exist.length === 0) {
                                config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                            } 
                        });

                    //Delete unused parameters
                    var i = 0;
                    _.each(config.queryParamKeys,
                        function (item) {

                            var exist = _.filter(queryParamKeys,
                                function (key) {
                                    var token = key.replace('{{', '').replace('}}', '');
                                    return item.Key === token;
                                });

                            if (exist.length === 0)
                                config.queryParamKeys.splice(i, 1);

                            i++;
                        });

                    if ($("#columns").data("kendoMultiSelect")) $("#columns").data("kendoMultiSelect").destroy();
                    vm.getCollections();
                    vm.querySelect = config.queryString.indexOf("$select") > -1 || false;
                },
                getColumns: function (url) {

                    $scope.config.data_url = url;

                    ODataChartDataService.getData(url).then(function (data) {
                        config.allColumns = [];
                        if (config.queryString.length > 0)
                            vm.applyQueryString();
                        else
                            vm.setColumns(data, url);
                    });
                },
                setColumns: function (data, data_url) {
                    var el = document.createElement('a');
                    el.href = data_url;
                    var path = el.pathname;
                    if (path.lastIndexOf("/") + 1 === path.length)
                        path = path.substring(0, path.length - 1);
                    vm.entity = path.substring(path.indexOf("api/") + 4, path.length);
                    if (config.queryString.indexOf("/Action.") > -1) {
                        vm.entity = path.substring(path.indexOf("api/") + 4, path.lastIndexOf("/"));
                    }

                    $('#columns').removeAttr("disabled");
                    $('#label').removeAttr("disabled");
                    $('#groupBy').removeAttr("disabled");

                    var dbColumns = config.allColumns;

                    if (data.length > 0 && dbColumns.length == 0) {
                        if (config.queryString.indexOf("/Action.") === -1 &&  $("#" + vm.entity + "_tpl").html()) {
                            ODataGridConfigService.getColumnConfig(vm.entity).then(function (res) {
                                vm.columnTemplate(data, res);
                            });
                        } else
                            vm.columnTemplate(data, []);
                    } else {
                        vm.columns = dbColumns;
                        if (config.queryString.indexOf("$select") === -1) vm.configColumnMultiSelect(dbColumns);
                    }
                },
                columnTemplate: function (data, defaultColumns) {

                    var dbColumns = [];
                    angular.forEach(_.keys(data[0]), function (item, index) {
                        if (item != '__metadata') {

                            var templ = "#= (" + item + ") ? " + item + " : '' #";
                            var dataType = '';

                            var val = data[0][item];

                            if (!val) {
                                for (var i = 1; i < data.length; i++) {
                                    if (data[i][item]) {
                                        val = data[i][item];
                                        i = data.length
                                    }
                                }
                            }

                            //check if value is null, if not then convert to string to prevent  error in replace and regex methods
                            if (val) {
                                val = val.toString();

                                //trim white spaces to prevent parsing strings ending with a number as date
                                val = val.replace(/\s+/, "");

                                var guidCheck = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

                                if (Date.parse(val) && /^\d+$/.test(val) == false && parseFloat(val)) {
                                    //prevent parsing number objects and link strings as date 
                                    templ = "#= (" + item + ") ? kendo.toString(new Date(" + item + "), 'M/d/yyyy h:mm tt') : '' #";
                                    dataType = 'date';
                                } else if (parseFloat(val) && !isNaN(val)) {
                                    templ = "#= (" + item + ") ? " + kendo.toString(item, 'n') + " : 0 #";
                                    dataType = 'number';
                                } else if (guidCheck.test(val)) {
                                    dataType = 'GUID';
                                } else {
                                    dataType = 'string';
                                }
                            }
                            
                            dbColumns.push({
                                field: (defaultColumns[item]) ? defaultColumns[item].field : item,
                                title: (defaultColumns[item]) ? localizationHelper.localize(defaultColumns[item].title, defaultColumns[item].title) : localizationHelper.localize(item, item),
                                template: (defaultColumns[item]) ? defaultColumns[item].template : templ,
                                DataType: (defaultColumns[item]) ? defaultColumns[item].DataType : dataType,
                                hidden: (defaultColumns[item]) ? defaultColumns[item].hidden : false
                            });
                        }
                    });
                    vm.columns = dbColumns;
                    config.allColumns = dbColumns;
                    vm.setShowFilterLang();
                    if (config.queryString.indexOf("$select") === -1) vm.configColumnMultiSelect(dbColumns);
                },
                configColumnMultiSelect: function (dbColumns) {

                    if (dbColumns.length > 0) $("#columns").removeClass("form-control input-sm");

                    vm.selectOptions = {
                        placeholder: vm.localize("ChooseColumns"),
                        dataTextField: "title",
                        dataValueField: "title",
                        valuePrimitive: false,
                        autoBind: true,
                        change: function () {
                            var dataItems = $('#columns').data('kendoMultiSelect').dataItems() || [];

                            if (vm.gridColumns.length > 0) {
                                for (var i in vm.gridColumns) {
                                    if (vm.gridColumns[i].tagName == "LI") {
                                        var text = vm.gridColumns[i].innerText;
                                        text = text.substring(0, text.length - 6).toString().toLowerCase();

                                        for (var x in config.gridColumns) {
                                            if (text == config.gridColumns[x].title.toString().toLowerCase()) {
                                                dataItems.push(config.gridColumns[x]);
                                            }
                                        }
                                    }
                                }
                            }
                            config.gridColumns = dataItems;

                            if (dataItems.length > 0)
                                $('.k-multiselect-wrap.k-floatwrap').addClass('columnsselected');
                            else
                                $('.k-multiselect-wrap.k-floatwrap').removeClass('columnsselected');

                            $("#columns_taglist > li").css("cssText", "cursor: pointer; height:inherit !important;");
                            $("#columns_taglist > li > .k-select").css("cursor", "pointer");
                        },
                        dataSource: new kendo.data.DataSource({
                            data: dbColumns
                        }),
                        value: vm.gridColumns
                    };

                    var cols = false;

                    if ($("#columns").parent().hasClass("k-multiselect")) {
                        cols = $("#columns").data("kendoMultiSelect").setDataSource(new kendo.data.DataSource({ data: dbColumns }));
                        $("#columns_taglist > li").css("cssText", "cursor: move; height:inherit !important;");
                        $("#columns_taglist > li > .k-select").css("cursor", "pointer");
                    } else {
                        cols = $("#columns").kendoMultiSelect(vm.selectOptions).data("kendoMultiSelect");
                    }

                    if (config.gridColumns.length > 0)
                        $('.k-multiselect-wrap.k-floatwrap').addClass('columnsselected');
                    else
                        $('.k-multiselect-wrap.k-floatwrap').removeClass('columnsselected');

                    if (cols) {

                        $("#columns_taglist > li").css("cssText", "cursor: pointer; height:inherit !important;");
                        $("#columns_taglist > li > .k-select").css("cursor", "pointer");

                        cols.tagList.kendoSortable({
                            hint: function (element) {
                                return element.clone().addClass("hint");
                            },
                            placeholder: function (element) {
                                return element.clone().addClass("placeholder").text("drop here");
                            },
                            change: function (e) {

                                var listElements = e.sender.element.children();

                                var listValues = [];

                                if (vm.gridColumns.length > 0) {

                                    var dataItems = [];

                                    for (var x in config.gridColumns) {
                                        var found = false;
                                        for (var i in vm.gridColumns) {
                                            var text = vm.gridColumns[i].toString().toLowerCase();
                                            if (text == config.gridColumns[x].title.toString().toLowerCase()) {
                                                dataItems.push(config.gridColumns[x]);
                                                found = true;
                                            }
                                        }
                                        if (!found) dataItems.push(config.gridColumns[x]);
                                    }

                                    config.gridColumns = dataItems;
                                }

                                for (var i in listElements) {
                                    if (listElements[i].tagName == "LI") {
                                        var text = listElements[i].innerText;
                                        text = text.substring(0, text.length - 6).toString().toLowerCase();
                                        for (var x in config.gridColumns) {
                                            if (text == config.gridColumns[x].title.toString().toLowerCase()) {
                                                listValues.push(config.gridColumns[x]);
                                            }
                                        }
                                    }
                                }
                                config.gridColumns = listValues;
                            }
                        });
                    }
                },
                chartTypes: chartConfigService.getChartTypes(),
                onChartTypeSelect: function () {
                    $scope.config.chartType = config.chartType;
                    switch (config.chartType.Id) {
                        case "stackedarea":
                        case "stackedbar":
                        case "stackedcolumn":
                            config.visibleStackByColumn = true;
                            break;
                        default:
                            config.visibleStackByColumn = false;
                            config.stackByColumn = null;
                            break;
                    }
                },
                onColumnSelect: function (e) {
                    var seriesField = !_.isNull(config.stackByColumn) ? config.stackByColumn : (vm.applyGrouping == true ? config.groupByColumn: config.label);
                    if (!_.isUndefined(seriesField)) {
                        ODataChartDataService.getAllData($scope.config.data_url).then(function (data) {
                            var seriesValues = _.pluck(data, seriesField.field);
                            var seriesDefaultColors = chartConfigService.defaultChartSeriesColors;

                            config.seriesColor = [];
                            _.each(seriesValues, function (item, i) {
                                var seriesItem = _.findWhere(config.seriesColor, { Key: item });
                                if (_.isUndefined(seriesItem))
                                    config.seriesColor.push({ Key: item, ColorValue: seriesDefaultColors[i++ % seriesDefaultColors.length] });
                            });
                        });
                    }
                                    },
                data: []
            });

            vm.getCollections();
        }

        angular.module('adf.widget.odata.chart', ['adf.provider'])
            .config(['dashboardProvider', function (dashboardProvider) {
                dashboardProvider
                    .widget('odata-chart', {
                        title: localizationHelper.localize('AdfODataChartWidgetTitle', 'OData Chart Widget'), //localization key
                        description: localizationHelper.localize('AdfODataChartWidgetDescription', 'Add a chart based on an OData End Point, with the option to drill into a work item table.'), //localization key
                        templateUrl: '{widgetsPath}/odata-chart/src/view.html',
                        controller: 'ODataChartMainController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/odata-chart/src/edit.html',
                            controller: 'ODataChartEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 8
                    });
            }])
            .factory('ODataChartDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', ODataChartDataService])
            .controller('ODataChartMainController', ['$scope', 'config', 'ODataChartDataService', 'ODataGridConfigService', 'ODataChartConfigService', 'LocalizationService', ODataChartMainController])
            .controller('ODataChartEditController', ['$scope', 'config', 'ODataChartDataService', 'ODataChartConfigService', 'ODataGridConfigService', 'LocalizationService', ODataChartEditController]);


        var editViewTemplate = ["<form role=form><div class=form-group>",
                "<label for=url>{{ ::vm.localize('ODataEndPoint') }}</label>",
                "<input type=text id=url ng-model=\"config.given_url\" class=\"form-control input-sm\" ng-change=\"vm.getCollections()\" />",
                "</div><div class=form-group>",
                "<label for=collections>{{ ::vm.localize('ChooseCollection') }}</label>",
                "<select id=collections class=\"form-control input-sm\" ng-model=\"config.gridCollection\" ng-change=\"vm.onCollectionsChange()\" ng-options=\"c.title for c in vm.collections track by c.field\">",
                "</select>",
                "</div><div class=form-group>",
                "<label for=queryString>{{ ::vm.localize('QueryString') }}</label>",
                "<input type=text id=queryString ng-model=\"config.queryString\" class=\"form-control input-sm\" ng-change=\"vm.onChangeQueryString()\"/>",
                "<p class='help-block' style='color: red' ng-if=\"vm.queryInvalid()\">{{ ::vm.localize('ODATAQueryInvalid') }}</p>",
                "</div>",
                "<div class=\"form-horizontal\">",
                    "<div class=form-group ng-if=\"config.queryParamKeys.length>0\">",
                        "<ul id=\"param-content\"><li ng-repeat=\"param in config.queryParamKeys track by $index\">",
                            "<div class=\"query-param\">",
                                "<label class=\"margin-l50\">{{param.Key}}</label>",
                            "</div>",
                            "<div class=\"col-sm-12 pad-bot-1\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
                        "</li></ul>",
                    "</div>",
                "</div>",
                "</div><div class=form-group ng-if=\"config.showFilterLang\">",
                    "<div class=checkbox checkbox-inline>",
                        "<input id=filterByCurrentLang name=filterByCurrentLang type=checkbox ng-model=\"config.filterByCurrentLang\"/>",
                        "<label class=control-label for=filterByCurrentLang>",
                        "{{ ::vm.localize('FilterByLanguageOption') }}",
                        "</label>",
                        "<p class='help-block margin-l10'>i.e. {{vm.languageCodeFilter}}</p>",
                    "</div>",
                "</div>",
                "<div class=form-group>",
                    "<label for=applyGrouping>{{ ::vm.localize('Chart Configuration') }}</label>",
                    "<div class=checkbox checkbox-inline>",
                        "<input id=applyGrouping name=applyGrouping type=checkbox ng-model=\"config.applyGrouping\" \"/>",
                        "<label class=control-label for=applyGrouping ng-click=\"vm.applyGrouping = !vm.applyGrouping\">",
                            "{{ ::vm.localize('Group by Value Field') }}",
                        "</label>",
                "</div></div>",
                "<div class=form-group ng-show=\"!config.applyGrouping\">",
        			"<label for=label>{{ ::vm.localize('ChartCategoryField') }}</label>",
        			"<select id=label class=\"form-control input-sm\" ng-model=\"config.label\" ng-options=\"c.title for c in vm.columns track by c.field\" ng-change=\"vm.onColumnSelect()\">",
                    "</select>",
                    "<p class='help-block'>{{ ::vm.localize('CategoryFieldHelpText') }}</p>",
                "</div>",
                "<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('SeriesField') }}</label>",
        			"<select id=groupBy class=\"form-control input-sm\" ng-model=\"config.groupByColumn\" ng-options=\"c.title for c in vm.columns track by c.field\" ng-change=\"vm.onColumnSelect()\">",
                    "</select>",
                    "<p class='help-block'>{{ ::vm.localize('ValueFieldHelpText') }}</p>",
                "</div>",
                "<div class=form-group>",
        			"<label for=chartType>{{ ::vm.localize('ChartType') }}</label>",
        			"<select id=chartType class=\"form-control input-sm\" ng-options=\"t.Name for t in vm.chartTypes track by t.Id\" ng-model=\"config.chartType\" ng-change=\"vm.onChartTypeSelect()\">",
                    "</select>",
                "</div>",
                 "<div class=form-group ng-show=config.visibleStackByColumn >",
        			"<label for=stackBy>{{ ::vm.localize('StackBy') }}</label>",
        			    "<select id=stackBy ng-disabled=config.disableGroupByColumn ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.stackByColumn ng-open=vm.onGroupByColumnSelect() ng-change=\"vm.onColumnSelect()\" class=\"form-control input-sm\"></select>",
                "</div>",
                    "<div class=form-group ng-if=\"config.seriesColor.length>0\">",
                    "<label for=groupBy>{{ ::vm.localize('SeriesColor') }}</label>",
                    "<ul id=\"param-content\"><li ng-repeat=\"item in config.seriesColor  track by $index\">",
                    "<div class=\"query-param row\">",
                    "<label class=\"col-sm-4\">{{item.Key}}</label>",
                    "<div class=\"col-sm-2\"><input kendo-color-picker k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\" ng-model=item.ColorValue /></div>",
                    "</div>",
                    "</li></ul>",
                "</div>",
                "<div class=form-group>",
        			"<label for=drillIntoDetails>{{ ::vm.localize('ContentDetails') }}</label>",
        			"<div class=checkbox checkbox-inline>",
                        "<input id=drillIntoDetails name=drillIntoDetails type=checkbox ng-model=\"config.drillIntoSelectedChartSegment\"/>",
                        "<label class=control-label for=drillIntoDetails ng-click=\"vm.drillIntoSelectedChartSegment = !vm.drillIntoSelectedChartSegment\">",
                            "{{ ::vm.localize('DisplaySelectedItemDetails') }}",
                        "</label>",
                    "</div>",
    			"</div><div class=form-group ng-show=\"vm.drillIntoSelectedChartSegment && !vm.querySelect\">",
                "<label for=columns>{{ ::vm.localize('ChooseColumns') }}</label>",
                "<select id=columns class=\"form-control input-sm\" ng-model=\"vm.gridColumns\">",
                "</select>",
                "</div></form>"].join("");

        var mainViewTemplate = [
        	"<div class=\"chart-resize-wrapper\">",
                "<div ng-show=\"config.enableScopingSelected\" class='dynamicScopingChart dropdown pull-right'>",
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                    "<ul class='dropdown-menu'>",
                      "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                    "</ul>",
                "</div>",
            "<div kendo-chart=chart k-options=vm.chartOptions k-rebind=vm.chartOptions k-series-click=vm.onSeriesClick></div>",
            "<div class=\"chart-loading\"></div>",
        		"<div ng-show=\"vm.isGridVisible\">",
                    "<div class=clearfix>",
                        "<div class=\"pull-left\">",
                            "<h6>{{ vm.localize('SelectedContentDetails') }}</h6>",
                        "</div>",
                        "<div class=\"pull-right\">",
                            "<button ng-click=vm.hideGrid() class=\"btn btn-link\">{{ vm.localize('Hide') }}</button>",
                        "</div>",
                    "</div>",
                    "<div kendo-grid=grid k-options=\"vm.gridOptions\" k-rebind=\"vm.gridOptions\"></div>",
                "</div>",
            "</div>"
        ].join('');

        angular.module("adf.widget.odata.chart").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/odata-chart/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/odata-chart/src/view.html", mainViewTemplate);
        }]);

    });

})();