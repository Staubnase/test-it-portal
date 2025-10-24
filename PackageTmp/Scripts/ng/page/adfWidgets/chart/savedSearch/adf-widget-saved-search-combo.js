/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function SavedSearchComboDataService($http, $q, navigationNodeService, viewPanelService, savedSearchService) {
            return {
                findQueryBuilderViewPanels: function () {
                    return viewPanelService.findQueryBuilderViewPanels();
                },
                getData: function (queryBuilder) {

                    var currentQueryBuilder = this.findCurrentQueryBuilder(queryBuilder.navNodeId);
                    queryBuilder = (currentQueryBuilder) ? currentQueryBuilder : queryBuilder;

                    var deferred = $q.defer();
                    var url = '/search/GetAdHocResults';
                    /*
                      data.dataTable is from Scripts/viewPanels/querybuilder/controller.js, about line 373
                      couldn't/shouldn't the dataTable be dynamic, or will we only ever search for work items?
                    */
                    var data = {
                        filterCriteria: JSON.stringify(savedSearchService.updateQueryWithRelativeValue(queryBuilder.query)),
                        dataTable: 'WorkItem'  //hard-coded string?!?  not good, Maverick.  not good.
                    };

                    //$http.post(url, data)
                    //    .success(function (response /*, status, headers, config*/) {
                    //        deferred.resolve(response.Data);
                    //    }).error(function (data /*, status, headers, config*/) {
                    //        alert(data);
                    //    });

                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: url,
                        data: data,
                        success: function (data, status, xhr) {

                            deferred.resolve(data);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            alert(xhr);
                        },
                        async: true
                    });
                    return deferred.promise;
                },
                getQueryBuilders: function () {

                    var viewPanels = this.findQueryBuilderViewPanels();
                    var queryBuilders = [];

                    function createQueryBuilder(viewPanel) {
                        var navNodeId = viewPanel.Definition.content.navigationNodeId;
                        if (navNodeId) {
                            var navNode = navigationNodeService.findNodeById(navNodeId);
                            if (navNode) {
                                var queryBuilder = {
                                    navNodeId: navNodeId,
                                    displayString: navNode.DisplayString,
                                    query: viewPanel.Definition.content.query,
                                    configurationName: viewPanel.Definition.content.configurationName
                                };
                                queryBuilders.push(queryBuilder);
                            }
                        }
                    }

                    _.each(viewPanels, createQueryBuilder);

                    return queryBuilders;
                },
                findCurrentQueryBuilder: function (navNodeId) {
                    var currQueryBuilder = _.findWhere(this.getQueryBuilders(), { navNodeId: navNodeId });
                    return currQueryBuilder;
                }
            };
        }

        function SavedSearchComboMainController($scope, config, savedSearchComboDataService, gridConfigService, chartConfigService, localizationService) {

            var vm = this;
            var colorIndex = 0;

            angular.extend(vm, {
                //setting chartOptions to null by default results in a kendo bad
                //number formatter exception, so it is necessary to provide a
                //placeholder until the async call can be made for the real options.
                //kendo, you so cray-cray.
                chartOptions: chartConfigService.getDefaultChartOptions(),
                gridOptions: null, // gridHasOptions ? $scope.grid.options : null,
                isGridVisible: false,
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
                    chartConfigService.getConfig(config.selectedQueryBuilder.configurationName, config.groupByColumn, config.chartType).then(function (chartOptions) {
                        vm.chartOptions = chartOptions;
                        (config.chartType.Id == "pie") ? vm.getPieChartData() : vm.getChartData();
                    });
                },
                getChartData: function () {
                    savedSearchComboDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        vm.chartOptions.dataSource.data = data.Data;

                        var seriesData = [];
                        var dataSource = new kendo.data.DataSource({
                            data: data.Data,
                            group: {
                                field: config.groupByColumn.field,
                                aggregates: [
                                    { field: "Index", aggregate: "count" }
                                ]
                            }
                        });

                        dataSource.read();

                        var categories = [];
                        angular.forEach(dataSource.view(), function (item) {
                            categories.push(item.value);
                            seriesData.push({ category: item.value, value: item.aggregates.Index.count, color: vm.getColor(item.value) });
                        });

                        var series = [{
                            data: seriesData,
                            type: config.chartType.Id
                        }];

                        vm.chartOptions.categoryAxis.categories = categories;

                        vm.chartOptions.series = series;
                    });
                },
                getColor: function (seriesValue) {
                    var colors = vm.chartOptions.seriesColors;
                    var randomDefaultColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    if (!_.isUndefined(seriesValue)) {
                        var seriesColorItem = _.findWhere(config.seriesColor, { Key: seriesValue });
                        if (!_.isUndefined(seriesColorItem))
                            return !_.isNull(seriesColorItem.ColorValue) ? seriesColorItem.ColorValue: randomDefaultColor;
                    }

                    return randomDefaultColor;
                },
                getPieChartData: function () {
                    savedSearchComboDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        vm.chartOptions.series = chartConfigService.getPieChartSeries(config, data.Data);
                        vm.chartOptions.tooltip = {
                            visible: true,
                            template: "#= dataItem.category # - #= value #"
                        };
                    });
                },
                getGridData: function (gridFilter) {

                    return savedSearchComboDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        var unfilteredData = data.Data;
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


                },
                getGridOptions: function () {
                    gridConfigService.getGridConfig(config.selectedQueryBuilder.configurationName).then(function (response) {
                        vm.gridOptions = response;

                        var fields = {};
                        angular.forEach(vm.gridOptions.columns,
                            function (item) {
                                if (item.DataType.toLowerCase() === "date" || item.DataType.toLowerCase() === "datetime") {
                                    fields[item.field] = {
                                        type: "date",
                                        parse: function (dateString) {
                                            if (_.isNull(dateString) || _.isUndefined(dateString)) {
                                                return '';
                                            } else {
                                                return new Date(dateString);
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
                getSavedSearchLink: function () {
                    var link = '';
                    if (config.selectedQueryBuilder) {
                        link = '/View/' + config.selectedQueryBuilder.navNodeId;
                    }

                    return link;
                },
                getSavedSearchLinkText: function () {
                    return localizationService.getValue('ViewContentSource');
                },
                hideGrid: function () {
                    vm.isGridVisible = false;
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                onGridRowClick: function (e) {
                    var grid = e.sender;
                    var selectedData = grid.dataItem(grid.select());
                    var workItemType = selectedData.WorkItemType.split('.').pop();
                    var forwardLink = "/" + workItemType + "/Edit/" + selectedData.Id;

                    //for activities, use parentworkitem type and id
                    if (workItemType.indexOf("Activity") > -1) {
                        forwardLink = "/" + selectedData.ParentWorkItemType + "/Edit/" + selectedData.ParentWorkItemId + "?activityId=" + selectedData.Id + "&tab=activity";
                    }

                    window.location.href = forwardLink;
                },
                onSeriesClick: function (e) {
                    if ($scope.config.drillIntoSelectedChartSegment) {
                        var gridFilter = {};
                        var category = (config.chartType.Id == "pie") ? e.dataItem.category : e.category;
                        gridFilter[vm.chartOptions.categoryAxis.baseUnit] = category;
                        vm.getGridData(gridFilter).then(vm.showGrid);
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

            if (config.selectedQueryBuilder && config.groupByColumn && config.chartType) {
                vm.getChartOptions();
                vm.getGridOptions();
            }

            $(window).on("resize", function () {
                kendo.resize($(".chart-resize-wrapper"));
            });
        }

        function SavedSearchComboEditController($scope, config, savedSearchComboDataService, gridConfigService, chartConfigService, localizationService) {
            $scope.config = angular.extend(config, {
                drillIntoSelectedChartSegment: config.drillIntoSelectedChartSegment || false,
                groupByColumn: config.groupByColumn || null,
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                chartType: config.chartType || null,
                seriesColor: config.seriesColor || [],
                savedConfigColors: []
            });
            
            var vm = this;
            angular.extend(vm, {
                chartOptions: chartConfigService.getDefaultChartOptions(),
                queryBuilders: savedSearchComboDataService.getQueryBuilders(),
                columns: [],
                data: [],
                getColumns: function () {
                    gridConfigService.getGridConfig(config.selectedQueryBuilder.configurationName).then(function (gridConfig) {
                        vm.columns = gridConfig.columns;
                    });
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                onQueryBuilderSelect: function () {
                    $scope.config.groupByColumn = null;
                    vm.getColumns();
                },
                chartTypes: chartConfigService.getChartTypes(),
                onChartTypeSelect: function () {
                    $scope.config.chartType = config.chartType;
                },
                onColumnSelect: function () {
                    if (vm.data.length <= 0) {
                        vm.getData();
                    }
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
                },
                getData: function () {
                    savedSearchComboDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        vm.data = data;
                        vm.updateSeriesColors(false);
                    });
                }

            });
            
            if (config.selectedQueryBuilder) {
                vm.getColumns();
                vm.getData();
            }
        }

        angular.module('adf.widget.saved.search.combo', ['adf.provider'])
            .config(['dashboardProvider', function (dashboardProvider) {
                dashboardProvider
                    .widget('saved-search-combo', {
                        title: localizationHelper.localize('AdfChartWidgetTitle'), //localization key
                        description: localizationHelper.localize('AdfChartWidgetNewDescription'), //localization key
                        templateUrl: '{widgetsPath}/saved-search-combo/src/view.html',
                        controller: 'SavedSearchComboMainController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/saved-search-combo/src/edit.html',
                            controller: 'SavedSearchComboEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 3
                    });
            }])
            .factory('SavedSearchComboDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'SavedSearchService', SavedSearchComboDataService])
            .controller('SavedSearchComboMainController', ['$scope', 'config', 'SavedSearchComboDataService', 'GridConfigService', 'ChartConfigService', 'LocalizationService', SavedSearchComboMainController])
            .controller('SavedSearchComboEditController', ['$scope', 'config', 'SavedSearchComboDataService', 'GridConfigService', 'ChartConfigService', 'LocalizationService', SavedSearchComboEditController]);


        var editViewTemplate = [
        	"<form role=form>",
        		"<div class=form-group>",
        			"<label for=\"query\">{{ ::vm.localize('SavedSearchContent') }}</label>",
        			"<select id=\"query\" ng-options=\"q.displayString for q in vm.queryBuilders track by q.navNodeId\" ng-model=config.selectedQueryBuilder ng-change=\"vm.onQueryBuilderSelect()\" class=\"form-control input-sm\"></select>",
                    "<p class='help-block'>{{ ::vm.localize('SavedSearchChartHelpText')  }} <a href='/View/0316e159-2806-43b2-9018-b695f7bc1088' target='_blank'>{{ ::vm.localize('CreateNewSavedSearch')  }}</a></p>",
        		"</div>",
        		"<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('GroupBy') }}</label>",
        			"<select id=groupBy ng-disabled=!config.selectedQueryBuilder ng-options=\"c.title for c in vm.columns track by c.field\" ng-model=config.groupByColumn ng-change=vm.onColumnSelect() class=\"form-control input-sm\"></select>",
    			"</div>",
                "<div class=form-group>",
        			"<label for=groupBy>{{ ::vm.localize('ChartType') }}</label>",
        			"<select id=chartType ng-options=\"t.Name for t in vm.chartTypes track by t.Id\" ng-model=config.chartType ng-change=vm.onChartTypeSelect() class=\"form-control input-sm\"></select>",
                "</div>",
                "<div class=form-group ng-if=\"config.seriesColor.length>0\">",
                    "<label for=groupBy>{{ ::vm.localize('SeriesColor') }}</label>",
                    "<ul id=\"param-content\"><li ng-repeat=\"item in config.seriesColor  track by $index\">",
                    "<div class=\"query-param row\">",
                    "<label class=\"col-sm-4\">{{item.Key}}</label>",
                    "<div class=\"col-sm-2\"><input kendo-color-picker k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\"  ng-model=item.ColorValue /></div>",
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
    			"</div>",
                
    		"</form>"
        ].join('');

        var mainViewTemplate = [
            "<div class=\"clearfix\">",
                "<h5 class=\"pull-left\">{{vm.getChartHeaderText()}}</h5>",
                "<div class=\"pull-right\">",
                    "<h5><a ng-if=\"vm.getSavedSearchLink()\" href={{vm.getSavedSearchLink()}} target=_blank>{{ vm.getSavedSearchLinkText() }}</a></h5>",
                "</div>",
            "</div>",
        	"<div class=\"chart-resize-wrapper\">",
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
                    "<div kendo-grid=grid k-options=\"vm.gridOptions\" k-rebind=\"vm.gridOptions\" k-selectable=true k-on-change=vm.onGridRowClick(kendoEvent)></div>",
                "</div>",
            "</div>"
        ].join('');

        angular.module("adf.widget.saved.search.combo").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/saved-search-combo/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/saved-search-combo/src/view.html", mainViewTemplate);
        }]);

    });

})();