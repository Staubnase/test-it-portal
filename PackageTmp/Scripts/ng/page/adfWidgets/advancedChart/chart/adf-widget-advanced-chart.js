/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function AdvancedChartDataService($http, $q, navigationNodeService, viewPanelService, dashboardQueryService) {
            return {
                getData: function (chartQuery, dataSource) {
                    var deferred = $q.defer();
                    var url = '/Dashboard/GetDashboardQueryData';
                    var data = { query: chartQuery }
                    var qry = chartQuery;

                    if (chartQuery) {
                        if (chartQuery.indexOf("@createdFilter") > -1) {
                            qry = chartQuery.replace(/@createdFilter/gi, "1=1");
                            data = { query: qry }
                        }

                        //append user section
                        if (chartQuery.indexOf("@UserId") > -1) {
                            var setUserId = "DECLARE @UserId as uniqueidentifier SET @UserId='" + session.user.Id + "' ";
                            var isScoped = "DECLARE @IsScoped as bit SET @IsScoped='" + (session.user.Security.IsWorkItemScoped ? 1 : 0) + "' ";

                            qry = setUserId.concat(qry);
                            qry = isScoped.concat(qry);

                            data = { query: qry }
                        }

                        //append language section
                        if (chartQuery.indexOf("@LanguageCode") > -1) {
                            var setUserLanguageCode = "DECLARE @LanguageCode as nvarchar(3) SET @LanguageCode='" + session.user.Preferences.LanguageCode.Id + "' ";
                            qry = setUserLanguageCode.concat(qry);
                            data = { query: qry }
                        }
                    }

                    if (dataSource) {
                        if (dataSource.length > 0) {
                            url = '/DataSourceConfiguration/GetDashboardQueryDataFromDataSource';
                            data.dataSource = dataSource;
                        }
                    }
                    
                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDashboardData: function (selectedQuery) {
                    var deferred = $q.defer();
                    var url = '/api/V3/Dashboard/GetDashboardDataById';
                    var data = {
                        queryId: selectedQuery.Id,
                        dateFilterType: selectedQuery.DateFilterType || "NoFilter"
                    }

                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
            };
        }

        function AdvancedChartMainController($scope, config, advancedChartDataService, gridConfigService, chartConfigService, localizationService, dashboardQueryService) {

            var vm = this;
            var colorIndex = 0;

            config.chartQuery = config.chartQuery || '';

            angular.extend(vm, {
                //setting chartOptions to null by default results in a kendo bad
                //number formatter exception, so it is necessary to provide a
                //placeholder until the async call can be made for the real options.
                //kendo, you so cray-cray.
                chartOptions: chartConfigService.getDefaultChartOptions(),
                gridOptions: null, // gridHasOptions ? $scope.grid.options : null,
                currentQuery: config.chartQuery,
                isGridVisible: false,
                dateOptions: ["NoFilter", "Yesterday", "ThisWeek", "ThisMonth", "ThisQuarter", "LastQuarter", "YTD", "LastYear"],
                dateSelected: localizationService.getValue('NoFilter'),
                selectDateOption: function (option) {
                    vm.dateSelected = localizationService.getValue(option);
                    if (config.chartQuery.indexOf("@createdFilter") > -1) {
                        vm.currentQuery = config.chartQuery.replace(/@createdFilter/gi, vm.getFilterClause(option));
                    }
                    config.selectedQuery.DateFilterType = option;
                    vm.getChartOptions();
                },
                getFilterClause: function (option) {
                    var dateField = "created";
                    var whereClause = ' DATEADD(dd, DATEDIFF(dd, 0, "' + dateField + '")+0, 0) ';
                    switch (option) {
                        case vm.dateOptions[1]:
                            return whereClause + '= convert(varchar(10), GETDATE()-1, 120) ';
                            break;
                        case vm.dateOptions[2]:
                            return whereClause + 'between DATEADD(wk,DATEDIFF(wk,0,GETDATE()),0)  and  DATEADD(wk,DATEDIFF(wk,0,GETDATE()),6) ';
                            break;
                        case vm.dateOptions[3]:
                            return whereClause + 'between DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0) and DATEADD(ms,- 3,DATEADD(mm,0,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[4]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0) and DATEADD (dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) +1, 0)) ';
                            break;
                        case vm.dateOptions[5]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) - 1, 0) and DATEADD(dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0)) ';
                            break;
                        case vm.dateOptions[6]:
                            return whereClause + 'between DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0)  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[7]:
                            return whereClause + 'between DATEADD(yy,-1,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))) ';
                            break;
                        default:
                            return whereClause = '1=1';


                    }
                },
                getChartHeaderText: function () {
                    var text = '';
                    var title = '';

                    if (config.groupByColumn) {
                        title = config.groupByColumn.title;
                        text = localizationService.getValue('GroupedBy') + ': ' + title;
                    };

                    return text;
                },
                getChartOptions: function () {
                    chartConfigService.getConfig(config.configurationName, config.groupByColumn, config.chartType).then(function (chartOptions) {
                        vm.chartOptions = chartOptions;
                        vm.getChartData();
                    });
                },
                getChartData: function () {
                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            //match api data result
                            var dataKeys = _.keys(data[0]);
                            _.each(dataKeys, function (key) {
                                if (!_.isUndefined(config.groupByColumn) && !_.isNull(config.groupByColumn)) {
                                    if (!_.isNull(config.groupByColumn.field) && (key.toLowerCase() === config.groupByColumn.field.toLowerCase())) {
                                        config.groupByColumn.field = key;
                                    }
                                }
                                if (!_.isUndefined(config.stackByColumn) && !_.isNull(config.stackByColumn)) {
                                    if (!_.isNull(config.stackByColumn.field) && (key.toLowerCase() === config.stackByColumn.field.toLowerCase())) {
                                        config.stackByColumn.field = key;
                                    }
                                }
                                if (!_.isUndefined(config.seriesCategory) && !_.isNull(config.seriesCategory)) {
                                    if (!_.isNull(config.seriesCategory.field) && (key.toLowerCase() === config.seriesCategory.field.toLowerCase())) {
                                        config.seriesCategory.field = key;
                                    }
                                }
                                if (!_.isUndefined(config.seriesValue) && !_.isNull(config.seriesValue)) {
                                    if (!_.isNull(config.seriesValue.field) && (key.toLowerCase() === config.seriesValue.field.toLowerCase())) {
                                        config.seriesValue.field = key;
                                    }
                                }
                            })

                            vm.chartData = data;

                            switch (config.chartType.Id) {
                                case "pie":
                                    (config.selectedQuery.HasGroupByClause) ? vm.buildChart(data) : vm.buildPieChart(data);
                                    break;
                                case "donut":
                                    (config.selectedQuery.HasGroupByClause) ? vm.buildChart(data) : vm.buildPercentageChart(data);
                                    break;
                                case "stackedarea":
                                case "stackedbar":
                                case "stackedcolumn":
                                    vm.buildStackChart(data);
                                    break;
                                default:
                                    vm.buildChart(data);
                            }
                        });
                    } else {
                        advancedChartDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                            vm.chartData = data;
                            switch (config.chartType.Id) {
                                case "pie":
                                    vm.buildPieChart(data);
                                    break;
                                case "donut":
                                    vm.buildPercentageChart(data);
                                    break;
                                case "stackedarea":
                                case "stackedbar":
                                case "stackedcolumn":
                                    vm.buildStackChart(data);
                                    break;
                                default:
                                    vm.buildChart(data);
                            }
                        });
                    }
                },
                buildChart: function (data) {
                    var seriesData = [];
                    var categories = [];
                    var series = [];
                    var groupByField = !_.isNull(config.groupByColumn) ? config.groupByColumn.field : config.seriesCategory.field;


                    if (config.selectedQuery.HasGroupByClause) {
                        //if aggregation happens at sql level, just build out the series data
                        angular.forEach(data, function (item) {
                            var seriesCategoryField = (!_.isUndefined(config.seriesCategory) && !_.isNull(config.seriesCategory)) ? config.seriesCategory.field : "";
                            categories.push(item[seriesCategoryField]);
                            seriesData.push({ category: item[seriesCategoryField], value: item[config.seriesValue.field], color: chartConfigService.getChartColor(config,item[seriesCategoryField]) });
                        });

                        series = [{
                            data: seriesData,
                            type: config.chartType.Id,
                        }];

                        vm.chartOptions.categoryAxis.baseUnit = config.seriesCategory.field;
                    } else {
                        //else, let kendo do the grouping and count
                        var dataSource = new kendo.data.DataSource({
                            data: data,
                            group: {
                                field: groupByField,
                                aggregates: [
                                    { field: "Index", aggregate: "count" }
                                ]
                            }
                        });
                        dataSource.read();
                       
                        angular.forEach(dataSource.view(), function (item) { 
                            categories.push(item.value);
                            seriesData.push({ category: item.value, value: item.aggregates.Index.count, color: chartConfigService.getChartColor(config,item.value) });
                        });

                        series = [{
                            data: seriesData,
                            type: config.chartType.Id,
                        }];
                        
                        vm.chartOptions.categoryAxis.baseUnit = config.groupByColumn.field;
                    }
                   
                    vm.chartOptions.dataSource.data = data;
                    vm.chartOptions.categoryAxis.categories = categories;
                    vm.chartOptions.series = series;
                   
                    if (config.drillIntoSelectedChartSegment)
                        vm.getGridOptions(data);
                },
                buildStackChart: function (data) {
                    vm.chartOptions.dataSource.data = data;

                    if (!config.selectedQuery.HasGroupByClause && !_.isUndefined(config.groupByColumn) && !_.isNull(config.groupByColumn)) {

                        var dataSource = new kendo.data.DataSource({
                            data: data,
                            group: {
                                field: config.groupByColumn.field,
                                aggregates: [
                                    { field: "Index", aggregate: "count" }
                                ]
                            }
                        });

                        dataSource.read();

                        var stackby = config.stackByColumn.field;

                        var data_series = {};
                        var categories = [];
                        var cnt = 0;
                        angular.forEach(dataSource.view(), function (item) {

                            var stackdata = _.groupBy(item.items, function (num) {
                                return num[stackby];
                            });

                            angular.forEach(stackdata, function (val, key) {
                                var seriesdata = data_series[key] || [];
                                seriesdata[cnt] = stackdata[key].length;
                                data_series[key] = seriesdata;
                            });

                            categories.push(item.value);
                            cnt++;
                        });

                    } else {
                        //Build Stack Chart with Query that has a 'group by' clause

                        var dataSource = new kendo.data.DataSource({
                            data: data,
                            group: {
                                field: config.seriesCategory.field
                            }
                        });

                        dataSource.read();
                        
                        var stackby = config.stackByColumn.field;
                        var data_series = {};
                        var categories = [];
                        var cnt = 0;
                        angular.forEach(dataSource.view(), function (item) {

                            var stackdata = _.groupBy(item.items, function (num) {
                                return num[stackby];
                            });

                            angular.forEach(stackdata, function (val, key) {
                                //var seriesValues = _.pluck(val, config.seriesValue.field);
                                //var sumSeriesValues = _.reduce(seriesValues, function (memo, num) { return memo + num; }, 0);
               
                                var seriesdata = data_series[key] || [];
                                seriesdata[cnt] = !isNaN(val[0][config.seriesValue.field]) ? val[0][config.seriesValue.field] : stackdata[key].length;
                                data_series[key] = seriesdata;

                            });

                            categories.push(item.value);
                            cnt++;
                        });

                        vm.chartOptions.categoryAxis.baseUnit = config.seriesCategory.field;
                    }

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

                    if (config.drillIntoSelectedChartSegment)
                        vm.getGridOptions(data);
                },
                buildPieChart: function (data) {
                    vm.chartOptions.series = chartConfigService.getPieChartSeries(config, data);
                    vm.chartOptions.tooltip = {
                        visible: true,
                        template: "#= dataItem.category # - #= value #"
                    };

                    if (config.drillIntoSelectedChartSegment)
                        vm.getGridOptions(data);
                },
                getGridData: function (gridFilter) {
                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            var unfilteredData = data;
                            var filteredData = _.where(unfilteredData, gridFilter);
                            $scope.grid.dataSource.data(filteredData);
                        });
                    } else {
                        advancedChartDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                            var unfilteredData = data;
                            var filteredData = _.where(unfilteredData, gridFilter);

                            //BUG: This does not work, even though it should (kendo-grid k-rebind=vm.gridOptions should watch every property on vm.gridOptions and reinitialize
                            //the grid whenever vm.gridOptions changes)

                            //vm.gridOptions.dataSource.data = filteredData; //SHOULD WORK; DOESN'T

                            //<rant>So, instead...HACK.  Get the component from the view and force-feed it 
                            //the filtered data.  This is NOT the Angular way.  The view should watch the 
                            //model and respond to changes; the controller should never directly manipulate 
                            //a view element.
                            $scope.grid.dataSource.data(filteredData);
                            //but, hey, it works.  Grrrr, Kendo....grrrrrrr.</rant>
                        });
                    }

                },
                buildPercentageChart: function (data) {

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
                    vm.chartOptions.dataSource.data = data;

                    if (config.drillIntoSelectedChartSegment)
                        vm.getGridOptions(data);
                },
                getGridOptions: function (data) {
                    
                    gridConfigService.getGridConfig(config.configurationName).then(function (response) {
                        vm.gridOptions = response;

                        //build out the grid columns based on the fields returned by the query
                        var dbColumns = [];
                        var idColumnName = null;
                        var guidColumnName = null;
                        var dataType = '';
                        var hasLink = true;
                        angular.forEach(_.keys(data[0]), function (item, index) {
                            var templ = "#= (" + item + ") ? " + item + " : '' #";
                           
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

                                //prevent parsing number objects and link strings as date 
                                if (Date.parse(val) && /^\d+$/.test(val) == false && parseFloat(val)) {
                                    templ = "#= (" + item + ") ? kendo.toString(new Date(" + item + "), kendo.culture().calendar.patterns.g) : '' #";
                                    dataType = 'date';
                                } else if (parseFloat(val) && !isNaN(val)) {
                                    templ = "#= (" + item + ") ? " + kendo.toString(item, 'n') + " : 0 #";
                                    dataType = 'number';
                                } else {
                                    dataType = 'string';
                                }
                            }

                            var isHidden = false;

                            if (item.toLowerCase() === "workitemid" || item.toLowerCase() === "id") {
                                idColumnName = item;
                            } else if (item.toLowerCase() === "guid") {
                                guidColumnName = item;
                                isHidden = true;
                            }

                            if (index === 0 || index === 1) {
                                if (!_.isNull(idColumnName)) {
                                    templ = "<a href='/Search/RedirectToWorkItem?searchText=#:" + idColumnName + "#''>" + templ + "</a>"; //append the workitem id value
                                } else if (!_.isNull(guidColumnName)) {
                                    templ = "<a href='/DynamicData/Edit/#:" + guidColumnName + "#''>" + templ + "</a>";
                                } else {
                                    hasLink = false;
                                }
                            }

                            var columnConfig = {
                                field: item,
                                title: localizationHelper.localize(item, item),
                                attributes: {
                                    "class": (index == 0 && hasLink) ? "grid-highlight-column" : (index == 1 && hasLink) ? "grid-highlight-column grid-highlight-column-title" : ""
                                },
                                template: templ,
                                hidden: isHidden,
                                DataType: dataType
                            };

                            if (item.toLowerCase() === "workitemid" || item.toLowerCase() === "id") {
                                //Fix BUG 23713: SQL Widgets do not sort WorkItemId in Numeric Order
                                //Custom Sort: sort alphanumeric WorkItemId in numeric order
                                columnConfig = angular.extend(columnConfig, {
                                    sortable: {
                                        compare: function (a, b) {
                                            return app.lib.sortAlphanumeric(a[item].toString(), b[item].toString());
                                        }
                                    }
                                });
                            }

                            dbColumns.push(columnConfig);
                        });
                        vm.gridOptions.selectable = true;
                        vm.gridOptions.columns = dbColumns;
                        
                        var fields = {};
                        angular.forEach(dbColumns,
                            function (item) {
                                if (item.DataType == "date") {
                                    fields[item.field] = {
                                        type: item.DataType,
                                        parse: function (date) {
                                            if (_.isNull(date) || _.isUndefined(date)) {
                                                return '';
                                            } else {
                                                return new Date(date.toString().split('.')[0].concat('Z'));
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

                        var gridFilter = {};
                        gridFilter[vm.chartOptions.categoryAxis.baseUnit] = e.category;

                        if (vm.chartData.length > 0) {
                            var unfilteredData = vm.chartData;
                            var filteredData = _.where(unfilteredData, gridFilter);
                            $scope.grid.dataSource.data(filteredData);
                            vm.showGrid();
                        } else {
                            vm.getGridData(gridFilter).then(vm.showGrid);
                        }

                        $scope.grid.dataSource.query({
                            page: 1,
                            pageSize: $scope.grid.dataSource.pageSize()
                        });
                    }
                },
                showGrid: function () {
                    vm.isGridVisible = true;
                },
                openWorkItem: function (workitemId) {
                    $.ajax({
                        type: "GET",
                        url: "/Search/GetSearchObjectByWorkItemID",
                        data: { searchText: workitemId },
                        success: function (result) {
                            (result.search('loginForm') < 0) ?
                                location.href = result :
                                window.location = "/Login/Login?ReturnUrl=" + window.location.pathname; //redirect to login page if session expires.
                        }
                    });
                },
                chartData: []
            });

            if ((config.selectedQuery || config.chartQuery) && (config.groupByColumn || (config.seriesValue && config.seriesCategory)) && config.chartType) {

                //Filter Control is not part of configuration and so not saved, always default to NoFilter on refresh/reset
                if (vm.dateSelected === localizationService.getValue("NoFilter") && (!_.isUndefined(config.selectedQuery) && !_.isUndefined(config.selectedQuery.DateFilterType) && config.selectedQuery.DateFilterType !== "NoFilter")) {
                    config.selectedQuery.DateFilterType = "NoFilter";
                }

                vm.getChartOptions();
            }

            $('.dynamicScopingChart').each(function (i) {
                $(this).css('z-index', '1');
            });

            $(window).on("resize", function () {
                kendo.resize($(".chart-resize-wrapper"));
            });
        }

        function AdvancedChartEditController($scope, config, advancedChartDataService, gridConfigService, chartConfigService, localizationService, dashboardQueryService) {
            $scope.config = angular.extend(config, {
                drillIntoSelectedChartSegment: config.drillIntoSelectedChartSegment || false,
                enableScopingSelected: config.enableScopingSelected || false,
                groupByColumn: config.groupByColumn || null,
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                chartType: config.chartType || null,
                chartQuery: config.chartQuery || '',
                configurationName: "advancedChartConfig",
                disableGroupByColumn: true,
                dataSource: config.dataSource || null,
                visibleStackByColumn: (false || (config.stackByColumn != null)),
                stackByColumn: config.stackByColumn || null,
                selectedQuery: config.selectedQuery || null,
                seriesField: config.seriesValue || null,
                categoryField: config.seriesCategory || null,
                seriesColor: config.seriesColor || [],
                savedConfigColors: []
            });
            
            var vm = this;
            angular.extend(vm, {
                chartOptions: chartConfigService.getDefaultChartOptions(),
                columns: [],
                dataSources: [],
                dataSource: config.dataSource || 'ServiceManagement',
                dataSourceData: [],
                getColumns: function () {
                    vm.columns = [];
                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            vm.dataSourceData = data;
                            vm.buildColumns(data);
                        });
                    } else {
                        advancedChartDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                            vm.dataSourceData = data;
                            vm.buildColumns(data);
                        });
                    }
                },
                buildColumns: function (data) {
                    var dbColumns = [];
                    angular.forEach(_.keys(data[0]), function (item) {
                        if (!_.isUndefined(config.groupByColumn) && !_.isNull(config.groupByColumn)) {
                            if (!_.isNull(config.groupByColumn.field) && (item.toLowerCase() === config.groupByColumn.field.toLowerCase())) {
                                config.groupByColumn.field = item;
                            }
                        }
                        if (!_.isUndefined(config.stackByColumn) && !_.isNull(config.stackByColumn)) {
                            if (!_.isNull(config.stackByColumn.field) && (item.toLowerCase() === config.stackByColumn.field.toLowerCase())) {
                                config.stackByColumn.field = item;
                            }
                        }
                        if (!_.isUndefined(config.seriesCategory) && !_.isNull(config.seriesCategory)) {
                            if (!_.isNull(config.seriesCategory.field) && (item.toLowerCase() === config.seriesCategory.field.toLowerCase())) {
                                config.seriesCategory.field = item;
                            }
                        }
                        if (!_.isUndefined(config.seriesValue) && !_.isNull(config.seriesValue)) {
                            if (!_.isNull(config.seriesValue.field) && (item.toLowerCase() === config.seriesValue.field.toLowerCase())) {
                                config.seriesValue.field = item;
                            }
                        }

                        var column = {
                            field: item,
                            title: item
                        }
                        dbColumns.push(column);
                    });

                    vm.columns = dbColumns;                    
                    config.disableGroupByColumn = !(vm.columns.length > 0);

                    vm.updateSeriesColors(false);
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                onEnableScoping: function () {
                    
                    var query = config.chartQuery || "";

                    if (!_.isNull(config.selectedQuery)) {
                        var item = _.find(vm.dsQueriesUnfiltered, function (x) { return x.Id == config.selectedQuery.Id; });
                        if (!_.isUndefined(item)) {
                            query = item.Query;
                        }
                    }
                    if (_.isUndefined(query) || _.isNull(query)) {
                        return;
                    }

                    if (query.indexOf("@createdFilter") == -1 && $scope.config.enableScopingSelected) {
                        vm.displayError(true, localizationHelper.localize('NoScopingParameter'));
                    } else {
                        vm.displayError(false, '');
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
                validateQuery: function (datasourceQuery) {
                    var isValid = true;

                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {

                        var invalid_words = ["delete", "exec", "insert", "update", "alter", "create", "drop", "truncate"];

                        var query = datasourceQuery.trim().toLowerCase();

                        var invalid_found = _.intersection(query.split(/[ ,]+/), invalid_words);

                        if (invalid_found.length > 0) isValid = false;
                    }

                    return isValid;
                },
                displayError: function (show, message) {
                    if (show) {
                        vm.errorHandler = { 'show': true, 'message': message };
                        $('#saveAdfDialog').attr("disabled", "disabled");
                    } else {
                        vm.errorHandler = { 'show': false, 'message': '' };
                        $('#saveAdfDialog').removeAttr("disabled");
                    }
                },
                onDataSourceSelect: function () {
                    vm.getDashboardQueries();
                    vm.getColumns();
                },
                getDashboardQueries: function () {
                    dashboardQueryService.getDashboardQueries().then(function (data) {
                        var dSource = config.dataSource || "ServiceManagement";
                        var queryList = [];
                        var filteredQueries = _.filter(data, function (item) {
                            return (item.Name != "" && item.DataSource.Name == dSource);
                        });

                        //this is what is stored on config file. exclude the exact query and connection string details
                        _.each(filteredQueries, function (item) {
                            queryList.push({
                                Id: item.Id,
                                Name: item.Name,
                                DataSource: { Id: item.DataSource.Id, Name: item.DataSource.Name },
                                HasGroupByClause: item.Query.toLowerCase().lastIndexOf('group by') > 0
                            });
                        });
                        vm.dsQueriesUnfiltered = data;
                        vm.dsQueries = queryList;

                        //vm.enableQueryParamOption();
                    });
                },
                dsQueries: [],
                dsQueriesUnfiltered: [],
                onQuerySelect: function () {
                    config.groupByColumn = null;
                    config.seriesField = null;
                    config.categoryField = null;

                    if (!_.isNull(config.selectedQuery)) {
                        vm.displayError(false, '');
                        vm.getColumns();
                        vm.onEnableScoping();
                        vm.enableQueryParamOption();
                    }
                },
                dashboardQuery: {
                    showCreateWindow: false,
                    formInvalid: false,
                    hasDuplicateName: false,
                    canSubmit: false,
                    model: null,
                    save: function () {
                        var dSourceName = config.dataSource || vm.dashboardQuery.model.DataSource.Name;
                        dashboardQueryService.getDataSourceObject(dSourceName).then(function (dSourceData) {
                            vm.dashboardQuery.model.DataSource = dSourceData[0];
                            dashboardQueryService.saveQuery(vm.dashboardQuery.model).then(function (result) {
                                if (result.success) {
                                    vm.onDataSourceSelect();
                                    vm.setSelectedQuery();
                                    vm.onQuerySelect();
                                    vm.dashboardQuery.close();
                                }
                            });
                        });
                    },
                    cancel: function () {
                        vm.dashboardQuery.close();
                    },
                    close: function () {
                        if (vm.dashboardQuery.windowType == "add") {
                            vm.dashboardQuery.model.Name = null;
                            vm.dashboardQuery.model.Query = null;
                        }
                        $scope.dashboardQueryWindow.close();
                    },
                    isNameValid: function () {
                        if (_.isNull(vm.dashboardQuery.model.Name)) {
                            vm.dashboardQuery.hasDuplicateName = false;
                        } else {
                            dashboardQueryService.getDashboardQueryByName(vm.dashboardQuery.model.Name).then(function (result) {
                                vm.dashboardQuery.hasDuplicateName = (result.length <= 0) ? false : true;;
                                vm.dashboardQuery.setCanSubmit();
                            });
                        }
                    },
                    setCanSubmit: function () {
                        vm.dashboardQuery.canSubmit = ((!_.isNull(vm.dashboardQuery.model.Name) && vm.dashboardQuery.hasDuplicateName == false) &&
                        (!_.isNull(vm.dashboardQuery.model.Name) && vm.validateQuery(vm.dashboardQuery.model.Query))) ? true : false;
                    },
                    open: function (mode) {
                        vm.dashboardQuery.windowType = mode;
                        switch (mode) {
                            case "add":
                                vm.dashboardQuery.model = {
                                    Id: app.lib.newGUID(),
                                    Name: null,
                                    DataSource: { Id: "0", Name: "ServiceManagement" },
                                    Query: null,
                                    IsNew: true
                                };

                                $scope.dashboardQueryWindow.title(localizationHelper.localize('AddNewDashboardQuery', 'New Dashboard Query'));
                                break;
                            case "edit":
                                var selectedItem = _.find(vm.dsQueriesUnfiltered, function (item) { return item.Id == config.selectedQuery.Id; });
                                if (!_.isUndefined(selectedItem) && !_.isNull(selectedItem)) {
                                    vm.dashboardQuery.model = selectedItem;
                                    vm.dashboardQuery.model.IsNew = false;
                                }
                                $scope.dashboardQueryWindow.title(localizationHelper.localize('EditDashboardQuery', 'Edit Dashboard Query'));
                                break;
                            default:
                                break;
                        }
                        vm.dashboardQuery.setCanSubmit();
                        $scope.dashboardQueryWindow.open();
                    },
                    editQueryWarning: localizationHelper.localize('EditQueryWarning', 'Modifying this query will affect all other dashboards that use this query.'),
                    windowType: null
                },
                setSelectedQuery: function () {
                    //assigning the model object directly to selectedQuery does not work. Have to specifically set each property
                    config.selectedQuery = {
                        Id: vm.dashboardQuery.model.Id,
                        Name: vm.dashboardQuery.model.Name,
                        DataSource: { Id: vm.dashboardQuery.model.DataSource.Id, Name: vm.dashboardQuery.model.DataSource.Name },
                        HasGroupByClause: vm.dashboardQuery.model.Query.toLowerCase().indexOf('group by') > 0,
                        Parameters: []
                    }
                    if (!_.isUndefined(vm.dashboardQuery.model.Query)) {
                        var queryParamKeys = vm.dashboardQuery.model.Query.match(/{{([^}]+)}}/g);
                        _.each(queryParamKeys, function (key) {
                            config.selectedQuery.Parameters.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                        });
                    }
                    //if old query config still exists, empty it out
                    if (!_.isUndefined(config.chartQuery) && !_.isNull(config.chartQuery)) {
                        config.chartQuery = '';
                    }
                },
                categoryFieldHelpText: localizationHelper.localize('CategoryFieldHelpText', "Refers to the property or column which will correspond to the chart’s series label"),
                valueFieldHelpText: localizationHelper.localize('ValueFieldHelpText', "Refers to the number property or column which will correspond to the chart’s plotting value"),
                enableQueryParamOption: function () {
                    var selectedItem = _.find(vm.dsQueriesUnfiltered, function (item) { return !_.isNull(config.selectedQuery) && item.Id == config.selectedQuery.Id; });
                    if (!_.isUndefined(selectedItem)) {
                        config.selectedQuery.Parameters = [];
                        var queryParamKeys = _.uniq(selectedItem.Query.match(/{{([^}]+)}}/g));
                        _.each(queryParamKeys, function (key) {
                            config.selectedQuery.Parameters.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                        });
                    } else if (!_.isUndefined(config.selectedQuery.Parameters) && config.selectedQuery.Parameters.length > 1) {
                        //ensure we save unique parameter token on config file 
                        config.selectedQuery.Parameters = _.uniq(config.selectedQuery.Parameters, false, function (p) { return p.Key; });
                    } 
                },
                onColumnSelect: function () {
                    vm.updateSeriesColors(true);
                },
                updateSeriesColors: function (bResetColors) {
                    var seriesField = !_.isNull(config.stackByColumn) ? config.stackByColumn : (config.groupByColumn || config.seriesCategory);
                    if (!_.isUndefined(seriesField)) {
                        var seriesValues = _.pluck(vm.dataSourceData, seriesField.field);
                        var seriesDefaultColors = chartConfigService.defaultChartSeriesColors;
                       
                        if (bResetColors) config.seriesColor = [];

                        _.each(seriesValues, function (item, i) {
                            var seriesItem = _.findWhere(config.seriesColor, { Key: item });
                            if (_.isUndefined(seriesItem)) {
                                config.seriesColor.push({ Key: item, ColorValue: seriesDefaultColors[i++ % seriesDefaultColors.length] });
                            }
                        });
                    }
                }
            });

            //if old query config exists, convert it to the new way
            if (!_.isUndefined(config.chartQuery) && !_.isNull(config.chartQuery) && config.chartQuery != '') {
                if (_.isUndefined(config.selectedQuery) || _.isNull(config.selectedQuery)) {
                    vm.dashboardQuery.model = {
                        Id: app.lib.newGUID(),
                        Name: null,
                        DataSource: { Id: "0", Name: "ServiceManagement" },
                        Query: config.chartQuery,
                        IsNew: true,
                        Parameters: []
                    };
                    vm.dashboardQuery.save();
                }
            }

            if (!_.isNull(config.selectedQuery)) {
                vm.displayError(false, '');
                vm.getColumns();
                vm.enableQueryParamOption();
            }

            if (!_.isNull(config.chartType)) {
                vm.onChartTypeSelect();
            }

            dashboardQueryService.getDataSources().then(function (data) {
                vm.dataSources = data;
                var defaultVal = _.find(data, function (el) { return el.indexOf('ServiceManagement') != -1 });

                if (defaultVal && config.dataSource == null) vm.dataSource = defaultVal;

                vm.getDashboardQueries();
            });
        }

        angular.module('adf.widget.advanced.chart', ['adf.provider'])
            .config(['dashboardProvider', function (dashboardProvider) {
                dashboardProvider
                    .widget('advanced-chart', {
                        title: localizationHelper.localize('AdfAdvancedChartWidgetTitle', 'Advanced SQL Charts Widget'), //localization key
                        description: localizationHelper.localize('AdfAdvancedChartWidgetDescription', 'Add a chart based on a SQL database query, with the option to drill into a work item table.'), //localization key
                        templateUrl: '{widgetsPath}/advanced-chart/src/view.html',
                        controller: 'AdvancedChartMainController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/advanced-chart/src/edit.html',
                            controller: 'AdvancedChartEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 6
                    });
            }])
            .factory('AdvancedChartDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'DashboardQueryService', AdvancedChartDataService])
            .controller('AdvancedChartMainController', ['$scope', 'config', 'AdvancedChartDataService', 'GridConfigService', 'AdvancedChartConfigService', 'LocalizationService', 'DashboardQueryService', AdvancedChartMainController])
            .controller('AdvancedChartEditController', ['$scope', 'config', 'AdvancedChartDataService', 'GridConfigService', 'AdvancedChartConfigService', 'LocalizationService', 'DashboardQueryService', AdvancedChartEditController]);


        var editViewTemplate = [
        	"<form role=form>",
                "<div class=form-group>",
                    "<label for=query>{{ ::vm.localize('DataSource') }}</label>",
                    "<select ng-disabled=\"vm.dataSources.length == 0\" ng-options=\"q for q in vm.dataSources track by q\" ng-model=config.dataSource ng-change=vm.onDataSourceSelect() class=\"form-control input-sm\"></select>",
                "</div>",
                "<div class=form-group>",
        			"<label for=sqlquery>{{ ::vm.localize('QueryName') }}</label>",
                    "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
        			"<select id=sqlquery ng-options=\"c.Name for c in vm.dsQueries track by c.Id\" ng-model=config.selectedQuery ng-change=vm.onQuerySelect() class=\"form-control input-sm\"></select>",
                    "<a ng-click=\"vm.dashboardQuery.open('add')\">{{ ::vm.localize('CreateNewSQLQuery') }}</a> <span ng-show=\"(config.selectedQuery!=null)\"> | <a ng-click=\"vm.dashboardQuery.open('edit')\"> {{ ::vm.localize('EditSQLQuery') }}</a> </span>",
    			"</div>",
               "<div class=\"form-horizontal\">",
                    "<div class=form-group ng-if=\"config.selectedQuery.Parameters.length>0\">",
        			    "<ul id=\"param-content\"><li ng-repeat=\"param in config.selectedQuery.Parameters  track by $index\">",
                            "<div class=\"query-param\">",
                                "<label class=\"margin-l50\">{{param.Key}}</label>",
                            "</div>",
                            "<div class=\"col-sm-12 pad-bot-1\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\" ng-blur=\"vm.getColumns()\"/></div>",
                        "</li></ul>",
    			    "</div>",
                "</div>",
        		"<div ng-if=\"!config.selectedQuery.HasGroupByClause\" class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('GroupBy') }}</label>",
        			"<select id=groupBy ng-disabled=config.disableGroupByColumn ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.groupByColumn ng-open=vm.onGroupByColumnSelect() ng-change=\"vm.onColumnSelect()\" class=\"form-control input-sm\"></select>",
    			"</div>",
                "<div ng-if=\"config.selectedQuery.HasGroupByClause\" class=form-group>",
        			"<label for=categoryField>{{ ::vm.localize('ChartCategoryField') }}</label>",
        			"<select id=categoryField ng-disabled=config.disableGroupByColumn ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.seriesCategory ng-change=\"vm.onColumnSelect()\"  class=\"form-control input-sm\"></select>",
                    "<p class='help-block'>{{ vm.categoryFieldHelpText }}</p>",
    			"</div>",
                 "<div ng-if=\"config.selectedQuery.HasGroupByClause\" class=form-group>",
        			"<label for=seriesField>{{ ::vm.localize('ChartValueField') }}</label>",
        			"<select id=seriesField ng-disabled=config.disableGroupByColumn ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.seriesValue class=\"form-control input-sm\"></select>",
                    "<p class='help-block'>{{ vm.valueFieldHelpText }}</p>",
    			"</div>",
                "<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('ChartType') }}</label>",
        			"<select id=chartType ng-options=\"t.Name for t in vm.chartTypes track by t.Id\" ng-model=config.chartType ng-change=vm.onChartTypeSelect() class=\"form-control input-sm\"></select>",
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
                    "<div class=\"col-sm-2\"><input kendo-color-picker  k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\"  ng-model=item.ColorValue /></div>",
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
                    "<br>",
                    "<div class=checkbox checkbox-inline>",
                        "<input type=checkbox ng-model=config.enableScopingSelected ng-change='vm.onEnableScoping()'>",
                        "<label class=\"control-label\" for=enableScoping ng-click='config.enableScopingSelected=!config.enableScopingSelected;vm.onEnableScoping()'>",
                             "{{ ::vm.localize('EnableChartScoping') }}",
                        "</label>",
                    "</div>",
    			"</div>",
    		"</form>",
            "<div createDashboardQuery></div>",
            "<div class=\"task-window cireson-window defined-form\" kendo-window=\"dashboardQueryWindow\"  k-visible=\"vm.dashboardQuery.showCreateWindow\" k-width=\"550\" k-actions=\"[]\">",
                "<div class=\"cireson-window--wrapper\">",
                    "<div class=\"cireson-window--body\">",
                        "<div class=\"alert alert-danger\" ng-show=\"vm.dashboardQuery.formInvalid\">{{ ::vm.localize('RequiredFieldsErrorMessage') }}</div>",
                        "<div class=\"form-group\">",
                            "<label class=\"control-label\" for=\"Name\">",
                                "<span>{{ ::vm.localize('Name') }}</span>",
                                " (<span>{{ ::vm.localize('Required') }}</span>)",
                            "</label>",
                        "<input type=\"text\" class=\"k-textbox form-control input-sm\" ng-model=\"vm.dashboardQuery.model.Name\" ng-blur=\"vm.dashboardQuery.isNameValid()\" required>",
                        "<p class=\"help-block\" ng-show= \"vm.dashboardQuery.hasDuplicateName\">{{ ::vm.localize('NameAlreadyExists') }}</p>",
                        "</div>",
                        "<div class=\"form-group\">",
                             "<label class=\"control-label\" for=\"SQLQueryContent\">",
                                "<span>{{ ::vm.localize('SQLQuery') }}</span>",
                                " (<span>{{ ::vm.localize('Required') }}</span>)",
                            "</label>",
                            "<textarea class=\"k-textbox form-control input-sm textarea-resize-none\" rows=\"6\" ng-model=\"vm.dashboardQuery.model.Query\" ng-blur=\"vm.dashboardQuery.setCanSubmit()\" required></textarea>",
                            "<p class='help-block' style='color: red' ng-if='!vm.dashboardQuery.model.IsNew'>{{ vm.dashboardQuery.editQueryWarning }}</p>",
                        "</div>",
                        "<div class=\"cireson-window--footer window-buttons\">",
                            "<button type=\"button\" ng-click=\"vm.dashboardQuery.save()\" class=\"btn k-button btn-primary\" ng-disabled=\"!vm.dashboardQuery.canSubmit\">",
                                "{{ ::vm.localize('Save') }}",
                            "</button>",
                            "<button type=\"button\" ng-click=\"vm.dashboardQuery.cancel()\" class=\"btn k-button btn-default\">",
                                "{{ ::vm.localize('Cancel') }}",
                            "</button>",
                        "</div>",
                    "</div>",
                "</div>",
            "</div>"
        ].join('');

        var mainViewTemplate = [
        	"<div class=\"chart-resize-wrapper\">",
                "<div ng-show=\"config.enableScopingSelected\" class='dynamicScopingChart dropdown pull-right'>",
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                    "<ul class='dropdown-menu'>",
                      "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                    "</ul>",
                "</div>",
        		"<div kendo-chart=chart k-options=vm.chartOptions k-rebind=vm.chartOptions k-series-click=vm.onSeriesClick></div>",
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

        angular.module("adf.widget.advanced.chart").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/advanced-chart/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/advanced-chart/src/view.html", mainViewTemplate);
        }]);

    });

})();