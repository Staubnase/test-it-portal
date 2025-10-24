/* global define: true */
/* global _: true */
var tempGridID = null;
(function () {
    'use strict';

    define(['app'], function (ngApp) {

        ngApp.factory('GridConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', GridConfigService]);

        function GridConfigService($http, $q, localizationService, notificationService) {

            var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/grid/configFiles/';
            var JSON_FILE_EXT = '.js';
            var configMap = {};

            return {
                // getGridConfig: function(gridType) {
                // 	//NOTE: it is necessary to copy this object!
                // 	//if you do not, when the .dataSource is tacked on later
                // 	//by multiple grid controllers, only the last .dataSource
                // 	//will be bound to all grids (ie, all grids will display the same data)
                // 	var config = angular.copy(GRID_CONFIG[gridType]);
                // 	this.initConfigGridColumns(config);
                // 	return config;
                // },
                
                getConfigUrl: function (configName) {
                    var url = CONFIG_FILE_BASE_URL + configName + JSON_FILE_EXT;
                    return url;
                },
                getGridConfig: function (configName) {

                    var deferred = $q.defer();
                    var self = this;
                    // if (configMap[configName]) {
                    //     deferred.resolve(this.initConfig(configMap[configName]));
                    // } else {
                    var url = this.getConfigUrl(configName);
                    $http.get(url)
                        .then(function (response) {
                            var config = response.data;
                            configMap[configName] = config;
                            deferred.resolve(self.initConfig(config));
                        }, function () {
                            notificationService.addError("Could not retrieve config file");
                        });
                    // }

                    return deferred.promise;
                },
                initConfig: function (config) {
                    this.initConfigGridColumns(config);
                    this.initPageableMessages(config);
                    this.initFilterableMessages(config);
                    this.initGroupableMessages(config);
                    this.initColumnMenu(config);
                    this.initEventBinding(config);
                    return angular.copy(config);
                },
                initEventBinding: function (config) {
                    config.dataBound = function (e) {

                        var grid = e.sender;
                        var gridId = e.sender.$angular_scope.stateGuid;
                        var currentState = app.gridUtils.savedState.getCurrentState(gridId);

                        app.gridUtils.denoteAppliedFilters(grid, currentState);
                        app.gridUtils.setDashboardGridState(gridId, grid, grid.dataSource, currentState);
                        app.gridUtils.initDashboardRowClickHandling(gridId, grid);
                        app.gridUtils.handleEmptyResults(grid, grid.dataSource, currentState);
                        app.events.publish('gridBound', grid);
                        
                    };

                    config.columnShow = function (e) {
                        var grid = e.sender;
                        var gridId = e.sender.$angular_scope.stateGuid;
                        app.gridUtils.saveColumnState(gridId, grid, true, e);
                    };

                    config.columnHide = function (e) {
                        var grid = e.sender;
                        var gridId = e.sender.$angular_scope.stateGuid;
                        app.gridUtils.saveColumnState(gridId, grid, true, e);
                    };
                },
                initColumnMenu: function (config) {
                    if (config.columnMenu && config.columnMenu.messages) {
                        angular.extend(config.columnMenu.messages, {
                            columns: localizationService.getValue('ChooseColumns'),
                            filter: localizationService.getValue('Filter'),
                            sortAscending: localizationService.getValue('SortAscending'),
                            sortDescending: localizationService.getValue('SortDescending')
                        });
                    }
                },
                initConfigGridColumns: function (config) {
                    var self = this;
                    // _.each(config.gridDefaultConfig.grid.columns, self.initGridColumn);
                    _.each(config.columns, self.initGridColumn);
                },
                initFilterableMessages: function (config) {

                    if (config.filterable) {

                        if (config.filterable.messages) {
                            angular.extend(config.filterable.messages, {
                                info: localizationService.getValue('Showitemswithvaluethat'),
                                and: localizationService.getValue('And'),
                                or: localizationService.getValue('Or'),
                                filter: localizationService.getValue('Filter'),
                                clear: localizationService.getValue('Clear')
                            });
                        }

                        if (config.filterable.operators) {

                            if (config.filterable.operators.string) {
                                angular.extend(config.filterable.operators.string, {
                                    eq: localizationService.getValue('Isequalto'),
                                    neq: localizationService.getValue('Isnotequalto'),
                                    contains: localizationService.getValue('Contains'),
                                    doesnotcontain: localizationService.getValue('DoesNotContain'),
                                    startswith: localizationService.getValue('Startswith'),
                                    endswith: localizationService.getValue('Endswith')
                                });
                            }

                            if (config.filterable.operators.number) {
                                angular.extend(config.filterable.operators.number, {
                                    eq: localizationService.getValue('Isequalto'),
                                    neq: localizationService.getValue('Isnotequalto'),
                                    gt: localizationService.getValue('GreaterThan'),
                                    gte: localizationService.getValue('GreaterOrEqual'),
                                    lt: localizationService.getValue('LessThan'),
                                    lte: localizationService.getValue('LessOrEqual'),
                                });
                            }

                            if (config.filterable.operators.SLOStatus) {
                                angular.extend(config.filterable.operators.SLOStatus, {
                                    contains: localizationService.getValue('Contains')
                                });
                            }

                            if (config.filterable.operators.date) {
                                angular.extend(config.filterable.operators.date, {
                                    gte: localizationService.getValue('GreaterOrEqual'),
                                    gt: localizationService.getValue('GreaterThan'),
                                    lte: localizationService.getValue('LessOrEqual'),
                                    lt: localizationService.getValue('LessThan')
                                });
                            }
                        }
                    }

                },
                initGridColumn: function (column) {
                    
                    if (column.DataType == "String" || column.DataType == "string") {
                        column.sortable = {
                            compare: function (a, b) {
                                return a[column.field].localeCompare(b[column.field], 'en', { numeric: true });
                            }
                        };
                    }

                    if (!column.title) {
                        column.title = localizationService.getValue(column.field);
                    }
                    if (column.DataType.toLowerCase().indexOf('date') > -1) {
                        var templ = "#= kendo.toString(new Date(" + column.field + "), kendo.culture().calendar.patterns.g) #";
                        column.template = templ;
                    }
                },
                initGroupableMessages: function (config) {
                    if (config.groupable && config.groupable.messages) {
                        angular.extend(config.groupable.messages, {
                            empty: localizationService.getValue('Dragacolumnheader')
                        });
                    }
                },
                initPageableMessages: function (config) {
                    if (config.pageable && config.pageable.messages) {
                        angular.extend(config.pageable.messages, {

                            empty: localizationService.getValue('Empty'),
                            of: localizationService.getValue('Of'),
                            first: localizationService.getValue('First'),
                            previous: localizationService.getValue('Previous'),
                            next: localizationService.getValue('Next'),
                            last: localizationService.getValue('Last'),
                            itemsPerPage: localizationService.getValue('ItemsPerPage')
                        });
                    }
                }
            };
        }
    });
})();
