/* global define: true */
/* global _: true */

(function () {

    'use strict';

    define([
        'app'
    ], function ( /*app*/) {

        function GridDataService($http, $q, navigationNodeService, viewPanelService, savedSearchService) {
            return {
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
                findQueryBuilderViewPanels: function () {
                    return viewPanelService.findQueryBuilderViewPanels();
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

        function GridEditController($scope, config, gridDataService, localizationService) {

            $scope.config = angular.extend(config, {
                selectedQueryBuilder: config.selectedQueryBuilder || null
            });

            var vm = this;
            angular.extend(vm, {
                queryBuilders: gridDataService.getQueryBuilders(),
                localize: function (key) {
                    return localizationService.getValue(key);
                },
            });
        }

        function GridController($scope, config, gridConfigService, gridDataService, localizationService) {
            $scope.stateGuid = config.stateGuid;
            $scope.$on("kendoWidgetCreated", function (event, widget) {
                if (widget === event.currentScope.grid) {
                    var gridId = event.currentScope.stateGuid;
                    var currentState = app.gridUtils.savedState.getCurrentState(gridId);
                    if (currentState) {
                        widget.dataSource.group(currentState.group);
                        widget.dataSource.sort(currentState.sort);
                        widget.dataSource.filter(currentState.filter);

                        if (!_.isUndefined(widget.dataSource.pageSize())) {
                            widget.dataSource.pageSize(currentState.pageSize);
                        }
                        if (!_.isUndefined(widget.dataSource.page())) {
                            widget.dataSource.page(currentState.page);
                        }
                    }

                    $('.clear-filters-' + gridId).on('click', function () {
                        app.gridUtils.savedState.removeSavedState(gridId);
                        document.location.reload(false);
                    });

                    widget.bind("columnResize", function (e) {
                        vm.onColumnChange(e);
                    });

                    widget.bind("dataBinding", function (e) {
                        vm.onColumnChange(e);
                    });
                }
            });
            var vm = this;
            angular.extend(vm, {
                getGridData: function (gridFilter) {

                    return gridDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        
                        var unfilteredData = data.Data;
                        var filteredData = _.where(unfilteredData, gridFilter);
                        
                        //BUG: This does not work, even though it should (kendo-grid k-rebind=vm.gridOptions should watch every property on vm.gridOptions and reinitialize
                        //the grid whenever vm.gridOptions changes)

                        vm.gridOptions.dataSource.data = filteredData; //SHOULD WORK; DOESN'T

                        //<rant>So, instead...HACK.  Get the component from the view and force-feed it 
                        //the filtered data.  This is NOT the Angular way.  The view should watch the 
                        //model and respond to changes; the controller should never directly manipulate 
                        //a view element.
                        $scope.grid.dataSource.data(filteredData);
                        
                        //but, hey, it works.  Grrrr, Kendo....grrrrrrr.</rant>
                    });


                },
                getGridOptions: function () {
                    vm.gridStateId = config.stateGuid;
                    gridConfigService.getGridConfig(config.selectedQueryBuilder.configurationName).then(function (response) {
                        var currentState = app.gridUtils.savedState.getCurrentState(vm.gridStateId);
                        if (currentState && !_.isUndefined(currentState) && !_.isNull(currentState) && vm.gridStateId) {
                            response.columns = currentState.columns;
                        }

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

                        vm.getGridData();
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
                onGridRowClick: function (e) {
                    var gridId = this.gridStateId;
                    var grid = e.sender;
                    app.events.publish('gridChange', grid);
                    app.gridUtils.savedState.updateSelectedRows(gridId, grid);
                },
                onColumnChange: function (e) {
                    var gridId = this.gridStateId;
                    var grid = e.sender;
                    _.defer(function () {
                        app.gridUtils.saveColumnState(gridId, grid, false, e);
                    });
                },
                showSavedSearchLink: function(e) {
                    return session.user.Analyst;
                }
            });

            if (config.selectedQueryBuilder) {
                localizationService.getKendoMessageUrl().then(function(kendoMessageUrl) {
                    $.getScript(kendoMessageUrl,
                        function() {
                            //vm.getGridData();
                            vm.getGridOptions();
                        });
                });
            }
        }

        angular.module('adf.widget.grid', ['adf.provider'])
            .config(["dashboardProvider", function (dashboardProvider) {
                dashboardProvider
                    .widget('grid', {
                        title: localizationHelper.localize('AdfTableWidgetTitle'), //localization key
                        description: localizationHelper.localize('AdfTableWidgetDescription'), //localization key
                        templateUrl: '{widgetsPath}/grid/src/view.html',
                        controller: 'GridController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/grid/src/edit.html',
                            controller: 'GridEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 2
                    });
            }])
            .factory('GridDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'SavedSearchService', GridDataService])
            .controller('GridController', ['$scope', 'config', 'GridConfigService', 'GridDataService', 'LocalizationService', GridController])
            .controller('GridEditController', ['$scope', 'config', 'GridDataService', 'LocalizationService', GridEditController]);

        angular.module("adf.widget.grid").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/grid/src/edit.html",
                "<form role=form><div class=form-group><label for=query>{{ ::vm.localize('SavedSearchContent') }}</label><select id=query ng-options=\"q.displayString for q in vm.queryBuilders track by q.navNodeId\" ng-model=config.selectedQueryBuilder class=\"form-control input-sm\"></select><p class='help-block'>{{ ::vm.localize('SavedSearchChartHelpText')  }} <a href='/View/0316e159-2806-43b2-9018-b695f7bc1088' target='_blank'>{{ ::vm.localize('CreateNewSavedSearch')  }}</a></p></div></form>");

            var viewTemplate = [
                "<div class=\"clearfix\">",
                    "<div class=\"pull-right\">",
                        "<a class=\"margin-l10 margin-t10 btn clear-filters-{{vm.gridStateId}}\">" + localization.ResetState + "</a>",
                    "</div>",
                    "<div class=\"pull-right\" ng-if=\"vm.showSavedSearchLink()\">",
                        "<h5><a ng-if=\"vm.getSavedSearchLink()\" href={{vm.getSavedSearchLink()}} target=_blank>{{ vm.getSavedSearchLinkText() }}</a></h5>",
                    "</div>",
                "</div>",
                "<div adf-grid-state-id={{vm.gridStateId}} ",
                "kendo-grid=grid k-options=vm.gridOptions k-rebind=vm.gridOptions ",
                "k-on-change=vm.onGridRowClick(kendoEvent) ",
                "k-on-column-reorder=vm.onColumnChange(kendoEvent) ",
                "k-on-sort=vm.onColumnChange(kendoEvent) ",
                "k-on-filter=vm.onColumnChange(kendoEvent)>",
                "</div>"
            ].join("");
            $templateCache.put("{widgetsPath}/grid/src/view.html", viewTemplate);
        }]);
    });
})();
