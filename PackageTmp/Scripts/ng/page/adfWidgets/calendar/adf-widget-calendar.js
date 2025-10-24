/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function CalendarDataService($http, $q, navigationNodeService, viewPanelService, savedSearchService) {
            return {
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
                getData: function (queryBuilder) {

                    var deferred = $q.defer();
                    var url = '/search/GetAdHocResults';
                    var data = {
                        filterCriteria: JSON.stringify(savedSearchService.updateQueryWithRelativeValue(queryBuilder.query)),
                        dataTable: 'WorkItem'
                    };

                    $http.post(url, data)
                        .success(function (response) {
                            deferred.resolve(response.Data);
                        }).error(function (data) {
                            console.warn(data);
                        });
                    return deferred.promise;
                }
            };
        }

        function CalendarController($sce, $scope, config, calendarDataService, localizationService) {
            var vm = this;

            angular.extend(vm, {
                title: config.title,
                subtitle: config.subtitle,
                count: 0,
                data: null,
                color: "#385E72",
                operator: config.selectedOperator,
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                getData: function () {
                    return calendarDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        if (!_.isUndefined(data) && !_.isNull(data)) {
                            vm.data = data;
                        }
                    });
                },
                getSavedSearchLink: function () {
                    var link = '';
                    if (config.selectedQueryBuilder) {
                        link = '/View/' + config.selectedQueryBuilder.navNodeId;
                    }

                    return link;
                }
            });

            if (config.selectedQueryBuilder) {
                vm.getData();
            }
            
            console.log("vm", vm);

            
            $scope.startDate = new Date();
            $scope.endDate = new Date();
            $scope.maxEndDate = new Date();

            $scope.$watch("startDate", function (val) {
                var maxEndDate = new Date(val);
                maxEndDate.setDate(maxEndDate.getDate() + 14);
                $scope.maxEndDate = maxEndDate;
                delete $scope.endDate;
            });

        }

        function CalendarEditController($sce, $scope, config, calendarDataService, localizationService) {
            $scope.config = angular.extend(config, {
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                threshold: config.threshold || 0,
                selectedOperator: config.selectedOperator || null
        });

            var vm = this;
            angular.extend(vm, {
                queryBuilders: calendarDataService.getQueryBuilders(),
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                operators: [
                    { name: "eq", display: localizationHelper.localize("Isequalto") },
                    { name: "gt", display: localizationHelper.localize("GreaterThan")},
                    { name: "lt", display: localizationHelper.localize("LessThan")},
                    { name: "gte", display: localizationHelper.localize("GreaterOrEqual") },
                    { name: "lte", display: localizationHelper.localize("LessOrEqual") }
                ]
            });
        }

        angular.module('adf.widget.calendar', ['adf.provider', 'kendo.directives'])
          .config(["dashboardProvider", function (dashboardProvider,$scope) {
              dashboardProvider
                .widget('calendar', {
                    title: "Calendar Widget", //localizationHelper.localize('AdfCountWidgetTitle','Count Tile'),
                    description: localizationHelper.localize('AdfCountWidgetDescription', 'Create count tile widget based on a saved search '),
                    templateUrl: '{widgetsPath}/calendar/src/view.html',
                    controller: 'CalendarController',
                    controllerAs: 'vm',
                    edit: {
                        controller: 'CalendarEditController',
                        controllerAs: 'vm',
                        templateUrl: '{widgetsPath}/calendar/src/edit.html'
                    },
                    ordinal: 1
                  });

              

          }])
            .factory('CalendarDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'SavedSearchService', CalendarDataService])
            .controller('CalendarController', ['$sce', '$scope', 'config', 'CalendarDataService', 'LocalizationService', CalendarController])
            .controller('CalendarEditController', ['$sce', '$scope', 'config', 'CalendarDataService', 'LocalizationService', CalendarEditController]);

        var editViewTemplate = [
        	"<form role=form>",
            "<div class=form-group>",
        			"<label for=threshold>{{vm.localize('Subtitle')}}</label>",
        			"<input type=text class=\"form-control input-sm\" id=threshold ng-model=config.subtitle>",
        		"</div>",
        		"<div class=form-group>",
        			"<label for=query>{{ ::vm.localize('SavedSearchContent') }}</label>",
        			"<select id=query ng-options=\"q.displayString for q in vm.queryBuilders track by q.navNodeId\" ng-model=config.selectedQueryBuilder class=\"form-control input-sm\"></select>",
                    "<p class='help-block'>{{ ::vm.localize('SavedSearchChartHelpText')  }} <a href='/View/0316e159-2806-43b2-9018-b695f7bc1088' target='_blank'>{{ ::vm.localize('CreateNewSavedSearch')  }}</a></p>",
    			"</div>",
        		"<div class=form-group>",
        			"<label for=threshold>{{vm.localize('Threshold')}}</label>",
                    "<div class=\"row\">",
                    "<div class=\"col-md-4 threshold-operator\">",
                        "<select id=query ng-options=\"q.display for q in vm.operators track by q.name\" ng-model=config.selectedOperator class=\"form-control input-sm\"></select>",
                    "</div>",
                    "<div class=\"col-md-4 threshold-count\">",
        			    "<input kendo-numeric-text-box k-min=\"0\" k-max=\"100\" k-ng-model=\"config.threshold\" />",
                    "</div>",
                    "<div class=\"col-md-4 threshold-color\">",
                        "<input kendo-color-picker  k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\"  ng-model=\"config.color\" />",
                    "</div>",
                    "</div>",
        		"</div>",
    		"</form>"
        ].join('');

        var mainViewTemplate = [
            "<div class=\"count-widget-container\">",
            "<div>",
            '<kendo-calendar ></kendo-calendar>',
            "</div>",
             "</div>"
        ].join('');

        angular.module("adf.widget.calendar").run(["$templateCache", function ($templateCache, $scope) {
            $templateCache.put("{widgetsPath}/calendar/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/calendar/src/view.html", mainViewTemplate);

           
            
            console.log("test 2");
        }]);
    });
})();