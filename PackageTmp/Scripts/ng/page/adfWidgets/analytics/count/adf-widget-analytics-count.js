/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function AnalyticsCountDataService($http, $q, navigationNodeService, viewPanelService) {
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

        function AnalyticsCountController($sce, $scope, config, countDataService, localizationService) {
            config.count = config.count || 0;
            var vm = this;
            angular.extend(vm, {
                title: config.title,
                currentQuery: config.countQuery,
                dateOptions: ["Today", "ThisWeek", "ThisMonth", "ThisQuarter", "LastQuarter", "YTD", "LastYear"],
                dateSelected: "Default",
                selectDateOption: function (option) {
                    vm.dateSelected = option;
                    if (vm.dateSelected != 'Default' && config.countQuery.indexOf("@createdFilter") > -1) {
                        vm.currentQuery = config.countQuery.replace(/@createdFilter/gi, vm.getFilterClause(vm.dateSelected));
                    }
                    vm.getCount();
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
                getCount: function () {
                    return countDataService.getData(vm.currentQuery).then(function (data) {
                        var value = _.values(data[0])[0];
                        if (!_.isUndefined(value) && !_.isNull(value)) {
                            config.count = value;
                        }
                    });
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                }
            });

            if (config.countQuery) {
                vm.getCount();
            }
        }

        function AnalyticsCountEditController($sce, $scope, config, countDataService, localizationService) {
            $scope.config = angular.extend(config, {
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                countQuery: config.countQuery || null,
                count: config.count || 0,
        });

            var vm = this;
            angular.extend(vm, {
                validateQuery: function (datasourceQuery) {
                    var isValid = true;

                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {
                        var query = datasourceQuery.trim().toLowerCase();

                        //if (query.substring(0, 6) != "select") { isValid = false; }

                        if ((query.indexOf("delete ") > -1) || (query.indexOf(" delete") > -1)) { isValid = false; }
                        if ((query.indexOf("exec ") > -1 ) || (query.indexOf(" exec") > -1)) { isValid = false; }
                        if ((query.indexOf("insert ") > -1) || (query.indexOf(" insert") > -1)) { isValid = false; }
                        if ((query.indexOf("update ") > -1) || (query.indexOf(" update") > -1)) { isValid = false; }

                        if ((query.indexOf("alter ") > -1) || (query.indexOf(" alter") > -1)) { isValid = false; }
                        if ((query.indexOf("create ") > -1) || (query.indexOf(" create") > -1)) { isValid = false; }
                        if ((query.indexOf("drop ") > -1) || (query.indexOf(" drop") > -1)) { isValid = false; }
                        if ((query.indexOf("truncate table ") > -1) || (query.indexOf(" truncate table") > -1)) { isValid = false; }
                    }

                    return isValid;
                },
                getCount: function () {
                    return countDataService.getData(config.countQuery).then(function (data) {
                        var value = _.values(data[0])[0];
                        if (!_.isUndefined(value) && !_.isNull(value)) {
                            config.count = value;
                        }
                    });
                },
                onQueryBuilderSelect: function () {
                    if (vm.validateQuery(config.countQuery)) {
                        vm.getCount();
                    } else {
                        var errorMessage = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                        alert(errorMessage);
                    }
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                }
            });

            if (vm.validateQuery(config.countQuery)) {
                vm.getCount();
            } else {
                var errorMessage = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                alert(errorMessage);
            }

        }

        angular.module('adf.widget.analytics.count', ['adf.provider'])
          .config(["dashboardProvider", function (dashboardProvider) {
              dashboardProvider
                .widget('analytics-count', {
                    title: localizationHelper.localize('AdfAnalyticsCountWidgetTitle','Analytics Count Widget'),
                    description: localizationHelper.localize('AdfAnalyticsCountCountWidgetDescription', 'Add a count widget based on an SQL database query, with data coming from the analytics database.'),
                    templateUrl: '{widgetsPath}/analytics-count/src/view.html',
                    controller: 'AnalyticsCountController',
                    controllerAs: 'vm',
                    edit: {
                        controller: 'AnalyticsCountEditController',
                        controllerAs: 'vm',
                        templateUrl: '{widgetsPath}/analytics-count/src/edit.html'
                    }
                });
          }])
          .factory('AnalyticsCountDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', AnalyticsCountDataService])
          .controller('AnalyticsCountController', ['$sce', '$scope', 'config', 'AnalyticsCountDataService', 'LocalizationService', AnalyticsCountController])
          .controller('AnalyticsCountEditController', ['$sce', '$scope', 'config', 'AnalyticsCountDataService', 'LocalizationService', AnalyticsCountEditController]);

        var editViewTemplate = [
        	"<form role=form>",
                "<div class=form-group>",
                    "<label for=query>{{ ::vm.localize('AnalyticsQueryNewContent') }}</label>",
                    "<textArea id=query ng-model=config.countQuery ng-change=\"vm.onQueryBuilderSelect()\" class=\"form-control input-sm\" rows=\"10\"></textArea>",
                    "<p class='help-block'>{{ ::vm.localize('AnalyticsQueryHelpText') }}</p>",
                "</div>",
    		"</form>"
        ].join('');

        var mainViewTemplate = [
            "<div class=\"count-widget-container\">",
                "<div class='dropdown'>",
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                    "<ul class='dropdown-menu'>",
                      "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                    "</ul>",
                "</div>",
                 "<div class=\"content\">{{config.count}}</div>",
             "</div>"
        ].join('');

        angular.module("adf.widget.analytics.count").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/analytics-count/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/analytics-count/src/view.html", mainViewTemplate);
        }]);
    });
})();