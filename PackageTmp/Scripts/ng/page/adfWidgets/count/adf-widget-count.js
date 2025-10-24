/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function CountDataService($http, $q, navigationNodeService, viewPanelService, savedSearchService) {
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

                    var currentQueryBuilder = this.findCurrentQueryBuilder(queryBuilder.navNodeId);
                    queryBuilder = (currentQueryBuilder) ? currentQueryBuilder : queryBuilder;

                    var deferred = $q.defer();
                    var url = '/search/GetAdHocResults';
                    var data = {
                        filterCriteria: JSON.stringify(savedSearchService.updateQueryWithRelativeValue(queryBuilder.query)),
                        dataTable: 'WorkItem'
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
                findCurrentQueryBuilder: function (navNodeId) {
                    var currQueryBuilder = _.findWhere(this.getQueryBuilders(), { navNodeId: navNodeId });
                    return currQueryBuilder;
                }
            };
        }

        function CountController($sce, $scope, config, countDataService, localizationService) {
            var vm = this;
           
            angular.extend(vm, {
                title: config.title,
                subtitle: config.subtitle,
                count: 0,
                color: "#385E72",
                operator: config.selectedOperator,
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                getCount: function () {  
                    return countDataService.getData(config.selectedQueryBuilder).then(function (data) {
                        if (!_.isUndefined(data) && !_.isNull(data)) {
                            vm.count = (!_.isUndefined(data.length)) ? data.length : (!_.isUndefined(data.Total) ? data.Total : 0);
                            vm.setColor();
                        }
                    });
                },
                setColor: function() {
                    var thresholdValue = config.threshold;
                    var thresholdColor = config.color;
                    var operator = (!_.isUndefined(config.selectedOperator) && !_.isNull(config.selectedOperator)) ? config.selectedOperator : "";
                    var bSwitchColor = false;
                    
                    switch (operator.name) {
                        case "eq":
                            bSwitchColor = (vm.count == thresholdValue);
                            break;
                        case "gt":
                            bSwitchColor = (vm.count > thresholdValue);
                            break;
                        case "lt":
                            bSwitchColor = (vm.count < thresholdValue);
                            break;
                        case "gte":
                            bSwitchColor = (vm.count >= thresholdValue);
                            break;
                        case "lte":
                            bSwitchColor = (vm.count <= thresholdValue);
                            break;
                        default:
                            break;
                    }

                    if (bSwitchColor) {
                        vm.color = thresholdColor;
                    }
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
                vm.getCount();
            }
        }

        function CountEditController($sce, $scope, config, countDataService, localizationService) {
            $scope.config = angular.extend(config, {
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                threshold: config.threshold || 0,
                selectedOperator: config.selectedOperator || null
        });

            var vm = this;
            angular.extend(vm, {
                queryBuilders: countDataService.getQueryBuilders(),
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

        angular.module('adf.widget.count', ['adf.provider'])
          .config(["dashboardProvider", function (dashboardProvider) {
              dashboardProvider
                .widget('count', {
                    title: localizationHelper.localize('AdfCountWidgetTitle','Count Tile'),
                    description: localizationHelper.localize('AdfCountWidgetDescription', 'Create count tile widget based on a saved search '),
                    templateUrl: '{widgetsPath}/count/src/view.html',
                    controller: 'CountController',
                    controllerAs: 'vm',
                    edit: {
                        controller: 'CountEditController',
                        controllerAs: 'vm',
                        templateUrl: '{widgetsPath}/count/src/edit.html'
                    },
                    ordinal: 1
                });
          }])
          .factory('CountDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'SavedSearchService', CountDataService])
          .controller('CountController', ['$sce', '$scope', 'config', 'CountDataService', 'LocalizationService', CountController])
          .controller('CountEditController', ['$sce', '$scope', 'config', 'CountDataService','LocalizationService', CountEditController]);

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
                        "<select id=operator ng-options=\"q.display for q in vm.operators track by q.name\" ng-model=config.selectedOperator class=\"form-control input-sm\"></select>",
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
                "<a href=\"{{vm.getSavedSearchLink()}}\" target=\"_blank\">",
                    "<div class=\"content\" style=\"color:{{vm.color}}\">{{vm.count}}</div>",
                    "<div class=\"footer\">{{vm.subtitle}}</div>",
                "</a>",
             "</div>"
        ].join('');

        angular.module("adf.widget.count").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/count/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/count/src/view.html", mainViewTemplate);
        }]);
    });
})();