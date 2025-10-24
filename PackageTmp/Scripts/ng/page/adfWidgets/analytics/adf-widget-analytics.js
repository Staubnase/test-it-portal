/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function AnalyticsChartDataService($http, $q, navigationNodeService, viewPanelService) {
            return {
                getData: function (chartQuery) {
                    var deferred = $q.defer();
                    var url = '/Dashboard/GetAnalyticsDashboardQueryData';
                    var data = { query: chartQuery }

                    if (chartQuery) {
                        if (chartQuery.indexOf("@createdFilter") > -1) {
                            var qry = chartQuery.replace(/@createdFilter/gi, "1=1");
                            data = { query: qry }
                        }
                    }
                    

                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                }
            };
        }
        
        function AnalyticsChartController($scope, config, chartDataService, chartConfigService, localizationService) {

            var vm = this;

            angular.extend(vm, {
                chartOptions: chartConfigService.getDefaultChartOptions(),
                currentQuery: config.chartQuery,
                dateOptions: ["Today", "ThisWeek", "ThisMonth", "ThisQuarter", "LastQuarter", "YTD", "LastYear"],
                dateSelected: "Default",
                selectDateOption: function (option) {
                    vm.dateSelected = option;
                    if (vm.dateSelected != 'Default' && config.chartQuery.indexOf("@createdFilter") > -1) {
                        vm.currentQuery = config.chartQuery.replace(/@createdFilter/gi, vm.getFilterClause(vm.dateSelected));
                    }
                    vm.getChartOptions();
                },
                getFilterClause: function (option) {
                    var dateField = "created";
                    var whereClause = ' DATEADD(dd, DATEDIFF(dd, 0, "' + dateField + '")+0, 0) ';
                    switch (option) {
                        case vm.dateOptions[0]:
                            return whereClause + '= convert(varchar(10), GETDATE(), 120) ';
                            break;
                        case vm.dateOptions[1]:
                            return whereClause + 'between DATEADD(wk,DATEDIFF(wk,0,GETDATE()),0)  and  DATEADD(wk,DATEDIFF(wk,0,GETDATE()),6) ';
                            break;
                        case vm.dateOptions[2]:
                            return whereClause + 'between DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0) and DATEADD(ms,- 3,DATEADD(mm,0,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[3]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0) and DATEADD (dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) +1, 0)) ';
                            break;
                        case vm.dateOptions[4]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) - 1, 0) and DATEADD(dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0)) ';
                            break;
                        case vm.dateOptions[5]:
                            return whereClause + 'between DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0)  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[6]:
                            return whereClause + 'between DATEADD(yy,-1,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))) ';
                            break;
                        default:
                            return '';

                    }
                },
                getChartOptions: function () {
                    chartConfigService.getConfig(config).then(function (chartOptions) {
                        vm.chartOptions = chartOptions;
                        (config.chartType.Id == "donut") ? vm.getPercentageData() : vm.getChartData();
                    });
                },
                getChartData: function () {
                    chartDataService.getData(vm.currentQuery).then(function (data) {
                        vm.chartOptions.dataSource.data = data;
                    });
                },
                getPercentageData: function () {

                    vm.chartOptions.tooltip = {
                        visible: false
                    };
                    vm.chartOptions.legend = {
                        visible: false
                    };

                    chartDataService.getData(vm.currentQuery).then(function (data) {
                        var value = _.values(data[0])[0];
                        var key = _.keys(data[0])[0];
                        var emptyObj = {};
                        emptyObj[key] = 100 - value;
                        data.push(emptyObj);
                        var center;
                        var radius;
                        vm.chartOptions.series[0].holeSize = 100;
                        vm.chartOptions.series[0].size = 50;
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
                    });
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                }
            });

            if (config.chartQuery && config.seriesField && config.categoryField && config.chartType) {
                vm.getChartOptions();
            }
        }

        function AnalyticsChartEditController($scope, config, chartDataService, chartConfigService, localizationService) {
            $scope.config = angular.extend(config, {
                drillIntoSelectedChartSegment: config.drillIntoSelectedChartSegment || false,
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                seriesField: config.seriesField || null,
                categoryField: config.categoryField || null,
                chartType: config.chartType || null,
                chartQuery: config.chartQuery || null,
                configurationName: "analyticsChartConfig",
                disableSeriesSelection: true
            });

            var vm = this;
            angular.extend(vm, {
                chartOptions: chartConfigService.getDefaultChartOptions(),
                columns: [],
                getColumns: function () {
                    chartDataService.getData(config.chartQuery).then(function (data) {
                        var dbColumns = [];
                        angular.forEach(_.keys(data[0]), function (item) {
                            var column = {
                                field: item,
                                title: item
                            }
                            dbColumns.push(column);
                        });

                        vm.columns = dbColumns;
                        config.disableSeriesSelection = !(vm.columns.length > 0);
                    });
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                onQueryBuilderSelect: function () {
                    $scope.config.seriesField = null;
                    $scope.config.categoryField = null;
                    vm.getColumns();
                },
                chartTypes: chartConfigService.getChartTypes(),
                onChartTypeSelect: function () {
                    $scope.config.chartType = config.chartType;
                },
                validateQuery: function (datasourceQuery) {
                    var isValid = true;

                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {
                        var query = datasourceQuery.trim().toLowerCase();

                        //if (query.substring(0, 6) != "select") { isValid = false; }

                        if ((query.indexOf("delete ") > 0) || (query.indexOf(" delete") > 0)) { isValid = false; }
                        if ((query.indexOf("exec ") > 0) || (query.indexOf(" exec") > 0)) { isValid = false; }
                        if ((query.indexOf("insert ") > 0) || (query.indexOf(" insert") > 0)) { isValid = false; }
                        if ((query.indexOf("update ") > 0) || (query.indexOf(" update") > 0)) { isValid = false; }

                        if ((query.indexOf("alter ") > 0) || (query.indexOf(" alter") > 0)) { isValid = false; }
                        if ((query.indexOf("create ") > 0) || (query.indexOf(" create") > 0)) { isValid = false; }
                        if ((query.indexOf("drop ") > 0) || (query.indexOf(" drop") > 0)) { isValid = false; }
                        if ((query.indexOf("truncate table ") > 0) || (query.indexOf(" truncate table") > 0)) { isValid = false; }
                    }

                    return isValid;
                }
            });
            
            if (vm.validateQuery(config.chartQuery)) {
                vm.getColumns();
            } else {
                var errorMessage = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                chartConfigService.setErrorNotification(errorMessage);
            }
        }

        var editViewTemplate = [
        	"<form role=form>",
                "<div class=form-group>",
                    "<label for=query>{{ ::vm.localize('AnalyticsQueryNewContent') }}</label>",
                    "<textArea id=query ng-model=config.chartQuery ng-change=\"vm.onQueryBuilderSelect()\" class=\"form-control input-sm\" rows=\"10\"></textArea>",
                    "<p class='help-block'>{{ ::vm.localize('AnalyticsQueryHelpText') }}</p>",
                "</div>",
        		"<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('SeriesField') }}</label>",
        			"<select id=groupBy ng-disabled=config.disableSeriesSelection ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.seriesField ng-open=vm.onGroupByColumnSelect() class=\"form-control input-sm\"></select>",
    			"</div>",
                "<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('CategoryField') }}</label>",
        			"<select id=groupBy ng-disabled=config.disableSeriesSelection ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.categoryField ng-open=vm.onGroupByColumnSelect() class=\"form-control input-sm\"></select>",
    			"</div>",
                "<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('ChartType') }}</label>",
        			"<select id=chartType ng-options=\"t.Name for t in vm.chartTypes track by t.Id\" ng-model=config.chartType ng-change=vm.onChartTypeSelect() class=\"form-control input-sm\"></select>",
    			"</div>",
    		"</form>"
        ].join('');

        var mainViewTemplate = [
        	"<div>",
                "<div class='dropdown'>",
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                    "<ul class='dropdown-menu'>",
                      "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                    "</ul>",
                "</div>",
        		"<div kendo-chart=chart k-options=vm.chartOptions k-rebind=vm.chartOptions></div>",
            "</div>"
        ].join('');

        angular.module('adf.widget.analytics', ['adf.provider'])
            .config(['dashboardProvider', function (dashboardProvider) {
                dashboardProvider
                    .widget('analytics', {
                        title: localizationHelper.localize('AdfAnalyticsWidgetTitle', 'Analytics Dashboard Widget'), //localization key
                        description: localizationHelper.localize('AdfAnalyticsWidgetDescription', 'Analytics Dashboard Widget description.'), //localization key
                        templateUrl: '{widgetsPath}/analytics/src/view.html',
                        controller: 'AnalyticsChartController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/analytics/src/edit.html',
                            controller: 'AnalyticsChartEditController',
                            controllerAs: 'vm'
                        },
                        reload: true
                    });
            }])
            .factory('AnalyticsChartDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', AnalyticsChartDataService])
            .controller('AnalyticsChartController', ['$scope', 'config', 'AnalyticsChartDataService', 'AnalyticsChartConfigService', 'LocalizationService', AnalyticsChartController])
            .controller('AnalyticsChartEditController', ['$scope', 'config', 'AnalyticsChartDataService', 'AnalyticsChartConfigService', 'LocalizationService', AnalyticsChartEditController]);

        angular.module("adf.widget.analytics").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/analytics/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/analytics/src/view.html", mainViewTemplate);
        }]);

    });

})();