/* global define: true */
/* global _: true */

var var_languageField = "LanguageCode";
var lang = (session.user.LanguageCode) ? session.user.LanguageCode : 'ENU';

(function () {
    'use strict';

    define([
        'app',
    ], function (/*app*/) {

        function ODataCalendarDataService($http, $q, navigationNodeService, viewPanelService) {
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

        function ODataCalendarController($sce, $scope, config, localizationService, gridConfigService) {

            var vm = this;
            var doURL = config.given_url;

            if ($scope.config.gridCollection && $scope.config.gridCollection.length != 0) {
                if (doURL.charAt(doURL.length - 1) !== "/")
                    doURL += "/";
                doURL += $scope.config.gridCollection.field;
            }

            if (doURL) {

                var conString = config.queryString || '';

                if (conString.length > 0) {

                    var urlParams = app.lib.getQueryParams() || {};

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

                var invalids = ["$top", "$count", "$format", "$sort"];

                for (var i in invalids) {
                    if (conString.indexOf(invalids[i]) > -1) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Warning,
                            message: localization.ODATAQueryInvalid
                        });
                        return;
                    }
                }

                if (config.filterByCurrentLang && config.showFilterLang) {

                    var langFilter = var_languageField + " eq '" + lang + "'";

                    if (conString.length > 0) {

                        var params = app.lib.getQueryParams(conString) || {};
                        var filterParams = params["$filter"] || "";

                        if (filterParams.length > 0) {
                            conString = "";
                            for (var key in params) {
                                var val = params[key];
                                if (key === "$filter")
                                    val = "(" + val + ") and " + langFilter;

                                conString += (conString.length > 0)
                                    ? "&" + key + "=" + val
                                    : "?" + key + "=" + val;
                            }
                        }

                    } else { 
                        conString += '?$filter=' + langFilter;
                    }
                }

                var extraParams = "";

                if (conString.length > 0) {
                    if (conString.indexOf("/Action.") > -1)
                        doURL += conString + '?' + extraParams;
                    else
                        doURL += conString + '&' + extraParams;
                } else
                    doURL += conString + '?' + extraParams;
                
                var scheduler;
                var today = new Date();

                if (_.isUndefined(config.businessHours)) {
                    config.businessHours = {
                        startTime: "8:00 AM",
                        endTime: "5:00 PM"
                    }
                }

                var dateToday = kendo.toString(kendo.date.today(), 'd');
                var businessStartHourString = dateToday + " " + $scope.config.businessHours.startTime;
                var businessEndHourString = dateToday + " " + $scope.config.businessHours.endTime;

                $scope.schedulerOptions = {
                    editable: false,
                    selectable: true,
                    date: new Date(),
                    height: 600,
                    views: [
                        "day",
                        "week",
                        { type: "month", selected: true },
                        "agenda"
                    ],
                    workDayStart: new Date(businessStartHourString),
                    workDayEnd: new Date(new Date(businessEndHourString).setHours(new Date(businessEndHourString).getHours() + 1)),
                    dataBound: function (e) {
                        var element = e.sender.element[0];

                        scheduler = $(element).data("kendoScheduler");

                        $(element).find(".k-event").each(function () {
                            var element = $(this);

                            if (!_.isUndefined(scheduler.data())) {
                                var thisElement = _.filter(scheduler.data(),
                                    function (el) {
                                        return el.uid === element[0].dataset.uid;
                                    });
                                if (thisElement[0]) {
                                    var urlField = thisElement[0].URL;

                                    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                                        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                                        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                                        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

                                    var validURL = pattern.test(urlField);

                                    if (validURL) {
                                        var n = urlField.indexOf("http");
                                        if (n == -1) {
                                            urlField = "http://" + urlField;
                                        }
                                    } else {
                                        urlField = "/DynamicData/Edit/" + thisElement[0].BaseId;
                                    }

                                    element.html("<a target='_blank' style='color:white;' href='" + urlField + "'>" + element.html() + "</a>");
                                }
                            }
                        });
                    },
                    dataSource: {
                        type: "odata-v4",
                        transport: {
                            read: {
                                url: doURL,
                                dataType: "json"
                            }
                        },
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { from: "id" },
                                    title: { from: "title", defaultValue: "No Title", validation: { required: true } },
                                    start: { from: "startDate", type: "date" },
                                    end: { from: "endDate", type: "date" },
                                    filterby: { from: "filterby" }
                                }
                            },
                            parse: function (data) {
                                data = data.value;
                                var rewriteData = [];
                                var cnt = 0;
                                $.each(data, function (idx, elem) {
                                    var urlField = (config.urlField && config.urlField.field) ? elem[config.urlField.field] : "#";
                                    if (config.enableCustomURL && config.customURLField) {
                                        urlField = config.customURLField;
                                        _.each(config.urlParamKeys,
                                            function (item) {
                                                if (item.Value && item.Value.field)
                                                    urlField = urlField.replace("{{" + item.Key + "}}", elem[item.Value.field]);
                                            });
                                    }

                                    var newData = {
                                        id: cnt,
                                        title: (config.titleField && config.titleField.field) ? elem[config.titleField.field] : "No Title",
                                        startDate: (config.startdateField && config.startdateField.field) ? new Date(elem[config.startdateField.field]) : new Date(),
                                        endDate: (config.enddateField && config.enddateField.field) ? new Date(elem[config.enddateField.field]) : new Date(),
                                        URL: urlField,
                                        BaseId:elem["Guid"],
                                        filterby: (config.filterByProperty && config.filterByProperty.field) ? elem[config.filterByProperty.field] : ""
                                    };

                                    rewriteData.push(newData);
                                    cnt++;
                                });
                                return rewriteData;
                            }
                        }
                    },
                    resources: [
                        {
                            field: "filterby",
                            dataColorField: "key",
                            dataSource: config.eventColor
                        }
                    ]
                };


                

                angular.extend(vm, {
                    onFilterClick: function (dataItem) {
                        if (_.isUndefined(dataItem.IsActive)) {
                            dataItem.IsActive = true;
                        } else {
                            dataItem.IsActive = !dataItem.IsActive;
                        }

                        var filterData = [];
                        _.each(config.eventColor, function (item) {
                            if (_.isUndefined(item.IsActive)) {
                                item.IsActive = true;
                            }

                            if (item.IsActive)
                                filterData.push({ field: "filterby", operator: "contains", value: item.value });
                        });

                        var filter = {
                            logic: "or",
                            filters: filterData
                        };

                        var calendar = $("#odataCalendar").data("kendoScheduler");
                        var filteredData = calendar.dataSource.filter(filter);
                       
                        calendar.dataSource.data([])
                        calendar.dataSource.data(filteredData);
                        calendar.view(calendar.view().name);

                        if (!dataItem.IsActive) {
                            dataItem.TextColor = "#808080";
                        } else {
                            dataItem.TextColor = "#008ed6";
                        }
                    },
                });
            }            
        }

        function ODataCalendarEditController($sce, $scope, config, localizationService, notificationService, ODataCalendarDataService, ODataGridConfigService) {

            $scope.config = angular.extend(config, {
                given_url: config.given_url || null,
                data_url: config.data_url || null,
                queryString: config.queryString || '',
                gridColumns: config.gridColumns || [],
                allColumns: config.allColumns || [],
                gridCollection: config.gridCollection || [],
                configurationName: "odataChartConfig",
                chartOptions: config.chartOptions || null,
                queryParamKeys: config.queryParamKeys || [],
                urlParamKeys: config.urlParamKeys || [],
                filterByCurrentLang: config.filterByCurrentLang || false,
                showFilterLang: config.showFilterLang || false,
                enableCustomURL: config.enableCustomURL || false,
                filterByProperty: config.filterByProperty || null,
                eventColor: config.eventColor || [],
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

            if (config.enableCustomURL) {

                var urlParamKeys = _.uniq(config.customURLField.match(/{{([^}]+)}}/g));
                //Add new parameters
                _.each(urlParamKeys,
                    function (key) {

                        var token = key.replace('{{', '').replace('}}', '');

                        var exist = _.filter(config.urlParamKeys,
                            function (item) {
                                return item.Key === token;
                            });

                        if (exist.length === 0) {
                            config.urlParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                        }
                    });

            }

            var vm = this;
            angular.extend(vm, {
                Start: localizationHelper.localize("Start", "Start"),
                End: localizationHelper.localize("End", "End"),
                languageCodeFilter: var_languageField + " eq '" + lang + "'",
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                querySelect: config.queryString.indexOf("$select") > -1 || false,
                queryInvalid: function () {
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
                setShowFilterLang: function () {
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

                    $('#titleField').attr('disabled', true);
                    $('#startdateField').attr('disabled', true);
                    $('#enddateField').attr('disabled', true);
                    $('#urlField').attr('disabled', true);
                    $('#customURLField').attr('disabled', true);
                    $('#collections').attr('disabled', true);

                    if (!url)
                        url = config.given_url;

                    ODataCalendarDataService.getData(config.given_url).then(function (data) {

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
                    ODataCalendarDataService.getData(url).then(function (data) {
                        vm.setColumns(data, url);
                    });
                },
                onChangeQueryString: function () {
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
                    
                    vm.getCollections();
                    vm.querySelect = config.queryString.indexOf("$select") > -1 || false;
                },
                onChangeCustomURLString: function () {
                    var urlParamKeys = _.uniq(config.customURLField.match(/{{([^}]+)}}/g));

                    //Add new parameters
                    _.each(urlParamKeys,
                        function (key) {

                            var token = key.replace('{{', '').replace('}}', '');

                            var exist = _.filter(config.urlParamKeys,
                                function (item) {
                                    return item.Key === token;
                                });

                            if (exist.length === 0) {
                                config.urlParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                            }
                        });

                    //Delete unused parameters
                    var i = 0;
                    _.each(config.urlParamKeys,
                        function (item) {

                            var exist = _.filter(urlParamKeys,
                                function (key) {
                                    var token = key.replace('{{', '').replace('}}', '');
                                    return item.Key === token;
                                });

                            if (exist.length === 0)
                                config.urlParamKeys.splice(i, 1);

                            i++;
                        });
                },
                getColumns: function (url) {

                    $scope.config.data_url = url;

                    ODataCalendarDataService.getData(url).then(function (data) {
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
                    
                    $('#titleField').removeAttr("disabled");
                    $('#startdateField').removeAttr("disabled");
                    $('#enddateField').removeAttr("disabled");
                    $('#urlField').removeAttr("disabled");
                    $('#customURLField').removeAttr("disabled");

                    var dbColumns = config.allColumns;

                    if (data.length > 0 && dbColumns.length == 0) {
                        if (config.queryString.indexOf("/Action.") === -1 && $("#" + vm.entity + "_tpl").html()) {
                            ODataGridConfigService.getColumnConfig(vm.entity).then(function (res) {
                                vm.columnTemplate(data, res);
                            });
                        } else
                            vm.columnTemplate(data, []);
                    } else {
                        vm.columns = dbColumns;
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
                },
                onFilterBySelect: function () {
                    vm.updateEventColors(true);

                  
                },
                updateEventColors: function (bResetColors) {
                    if (!_.isUndefined(config.filterByProperty)) {
                        var conString = $scope.config.data_url;

                        if (config.filterByCurrentLang && config.showFilterLang) {
                            var langFilter = var_languageField + " eq '" + lang + "'";
                            if (conString.length > 0) {
                                var params = app.lib.getQueryParams(conString) || {};
                                var filterParams = params["$filter"] || "";

                                if (filterParams.length > 0) {
                                    conString = "";
                                    for (var key in params) {
                                        var val = params[key];
                                        if (key === "$filter")
                                            val = "(" + val + ") and " + langFilter;

                                        conString += (conString.length > 0)
                                            ? "&" + key + "=" + val
                                            : "?" + key + "=" + val;
                                    }
                                } else {
                                    conString += '?$filter=' + langFilter;
                                }
                            } 
                        }

                        ODataCalendarDataService.getAllData(conString).then(function (data) {
                            var seriesValues = _.pluck(data, config.filterByProperty.field);
                            var seriesDefaultColors = vm.defaultChartSeriesColors;
                            if (bResetColors) config.eventColor = [];

                            _.each(seriesValues, function (item, i) {
                                var seriesItem = _.findWhere(config.eventColor, { value: item });
                                if (_.isUndefined(seriesItem)) {
                                    config.eventColor.push({ text: item, value: item, key: seriesDefaultColors[i++ % seriesDefaultColors.length], IsActive: true })
                                }
                            });
                        });

                  
                    }
                },
                dataSourceData: [],
                defaultChartSeriesColors: [
                    "#4183D7",
                    "#D24D57",
                    "#2ECC71",
                    "#F5D76E",
                    "#D2527F",
                    "#913D88",
                    "#F89406",
                    "#5C97BF",
                    "#D91E18",
                    "#26A65B",
                    "#F7CA18",
                    "#E08283",
                    "#663399",
                    "#E67E22",
                    "#81CFE0",
                    "#EF4836",
                    "#90C695",
                    "#F4D03F",
                    "#8E44AD",
                    "#D35400",
                    "#2C3E50",
                    "#CF000F",
                    "#87D37C",
                    "#F5AB35",
                    "#E26A6A",
                    "#913D88",
                    "#F39C12",
                    "#446CB3",
                    "#96281B",
                    "#1E824C",
                    "#FDE3A7",
                    "#F62459",
                    "#AEA8D3",
                    "#F9690E",
                    "#336E7B",
                    "#4DAF7C",
                    "#F9BF3B",
                    "#EB9532"
                ]
            });

            vm.getCollections();
        }

        angular.module('adf.widget.odata.calendar', ['adf.provider'])
            .config(["dashboardProvider", function (dashboardProvider) {
                dashboardProvider
                    .widget('odata-calendar', {
                        title: localizationHelper.localize('AdfODataCalendarWidgetTitle', 'OData Calendar Widget'), //localization key
                        description: localizationHelper.localize('AdfODataCalendarWidgetDescription', 'Add a calendar widget based on an OData End Point'), //localization key
                        templateUrl: '{widgetsPath}/odata-calendar/src/view.html',
                        controller: 'ODataCalendarController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/odata-calendar/src/edit.html',
                            controller: 'ODataCalendarEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 9
                    });
            }])
            .factory('ODataCalendarDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', ODataCalendarDataService])
            .controller('ODataCalendarController', ['$sce', '$scope', 'config', 'LocalizationService', 'ODataGridConfigService', ODataCalendarController])
            .controller('ODataCalendarEditController', ['$sce', '$scope', 'config', 'LocalizationService', 'notificationService', 'ODataCalendarDataService', 'ODataGridConfigService', ODataCalendarEditController]);

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
            "<label class=\"col-sm-3 control-label\">{{param.Key}}</label>",
            "<div class=\"col-sm-9\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
            "</div>",
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
            "<label for=titleField>{{ ::vm.localize('stringTitle') }}</label>",
            "<select id=titleField class=\"form-control input-sm\" ng-model=\"config.titleField\" ng-options=\"c.title for c in vm.columns track by c.field\">",
            "</select>",
            "</div>",
            "<div class=form-group>",
            "<label for=startdateField>{{ ::vm.localize('StartDate') }}</label>",
            "<select id=startdateField class=\"form-control input-sm\" ng-model=\"config.startdateField\" ng-options=\"c.title for c in vm.columns track by c.field\">",
            "</select>",
            "</div>",
            "<div class=form-group>",
            "<label for=enddateField>{{ ::vm.localize('EndDate') }}</label>",
            "<select id=enddateField class=\"form-control input-sm\" ng-model=\"config.enddateField\" ng-options=\"c.title for c in vm.columns track by c.field\">",
            "</select>",
            "</div>",
            "<div class=form-group>",
            "<div class=checkbox checkbox-inline>",
            "<input type=checkbox id=enableCustomURL ng-model=config.enableCustomURL>",
            "<label class=\"control-label\" for=enableCustomURL>",
            "{{ ::vm.localize('UseCustomURL') }}",
            "</label>",
            "</div>",
            "</div>",
            "<div ng-if='!config.enableCustomURL' class=form-group>",
            "<label for=urlField>{{ ::vm.localize('URL') }}</label>",
            "<select id=urlField class=\"form-control input-sm\" ng-disabled='config.enableCustomURL' ng-model=\"config.urlField\" ng-options=\"c.title for c in vm.columns track by c.field\">",
            "</select>",
            "</div>",
            "<div ng-if='config.enableCustomURL' class=form-group>",
            "<label for=customURLField>{{ ::vm.localize('CustomURL') }}</label>",
            "<input type='text' id='customURLField' ng-model='config.customURLField' ng-disabled='!config.enableCustomURL' ng-change=\"vm.onChangeCustomURLString()\"/>",
            "</div>",
            "<div ng-if='config.enableCustomURL' class=\"form-horizontal\">",
            "<div class=form-group ng-if=\"config.urlParamKeys.length>0\">",
            "<ul id=\"url-param-content\"><li ng-repeat=\"uparam in config.urlParamKeys track by $index\">",
            "<div class=\"query-param\">",
            "<label class=\"col-sm-3 control-label\">{{uparam.Key}}</label>",
            "<div class=\"col-sm-9\">",
            "<select class=\"form-control input-sm\" ng-model=\"uparam.Value\" ng-options=\"c.title for c in vm.columns track by c.field\">",
            "</select>",
            "</div > ",
            "</div>",
            "</li></ul>",
            "</div>",
            "</div>",
            "<div class='form-group'>",
            "<label for=urlink>{{ ::vm.localize('BusinessHours') }}</label>",
            "<input type='text' placeholder={{vm.Start}} style='width: 20%' kendo-timepicker id='bStartHour' ng-model='config.businessHours.startTime' /> - ",
            "<input type='text' placeholder={{vm.End}} style='width: 20%' kendo-timepicker id='bEndHour' ng-model='config.businessHours.endTime' /> ",
            "</div>",
            "<div class=form-group>",
            "<label for=filterBy>{{ ::vm.localize('EventColorField') }}</label>",
            "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
            "<select id=filterBy ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.filterByProperty ng-change=vm.onFilterBySelect() class=\"form-control input-sm\"></select>",
            "</div>",
            "<div class=form-group ng-if=\"config.eventColor.length>0\">",
            "<label>{{ ::vm.localize('EventColor') }}</label>",
            "<ul id=\"param-content\"><li ng-repeat=\"item in config.eventColor  track by $index\">",
            "<div class=\"query-param row\">",
            "<label class=\"col-sm-4\">{{item.text}}</label>",
            "<div class=\"col-sm-2\"><input kendo-color-picker  k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\"  ng-model=item.key /></div>",
            "</div>",
            "</li></ul>",
            "</div>",
            "</div>",
            "</form > "].join("");

        var mainViewTemplate = [
            "<div class=\"odata-calendar-widget-container\">",
            "<div>",
            "<div><ul class='calendar-color-legend'><li ng-repeat='x in config.eventColor'><a  style='color:{{x.TextColor}}' ng-click=vm.onFilterClick(x)><span style='background-color:{{x.key}}'></span>{{x.text}}</a></li></ul><div>",
            '<div id="odataCalendar" kendo-scheduler k-options="schedulerOptions">',
            "</div>",
            "</div>",
            "</div>"
        ].join('');

        angular.module("adf.widget.odata.calendar").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/odata-calendar/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/odata-calendar/src/view.html", mainViewTemplate);
        }]);
    });
})();