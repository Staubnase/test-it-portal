/* global define: true */
(function() {

    var sharedProviderPath = '/Scripts/ng/shared/providers/';
    var adfWigetsGridPath = '/Scripts/ng/page/adfWidgets/grid/';
    var adfWidgetsChartPath = '/Scripts/ng/page/adfWidgets/chart/';
    var adfWidgetsAdvancedChartPath = '/Scripts/ng/page/adfWidgets/advancedChart/';
    var adfWigetsAdvancedGridPath = '/Scripts/ng/page/adfWidgets/advancedGrid/';
    var adfWigetsAdvancedCelendarPath = '/Scripts/ng/page/adfWidgets/calendar/';
    var adfWigetsODataGridPath = '/Scripts/ng/page/adfWidgets/odataGrid/';
    var adfWigetsODataChartPath = '/Scripts/ng/page/adfWidgets/odataChart/';

    define([
        'app',
        './page.service.js',
        sharedProviderPath + 'notification.service.js',
        sharedProviderPath + 'localization.service.js',
        sharedProviderPath + 'navigation.node.service.js',
        sharedProviderPath + 'user.service.js',
        sharedProviderPath + 'navigation.guard.service.js',
        sharedProviderPath + 'viewPanel.service.js',
        sharedProviderPath + 'dashboard.query.service.js',
        sharedProviderPath + 'saved.search.service.js',
        adfWigetsGridPath + 'grid.config.service.js',
        adfWidgetsChartPath + 'chart.config.service.js',
        adfWidgetsAdvancedChartPath + 'advanced.chart.config.service.js',
        adfWigetsAdvancedGridPath + 'advanced.grid.config.service.js',
        adfWigetsAdvancedCelendarPath + 'advanced.calendar.config.service.js',
        adfWigetsODataGridPath + 'odata.grid.config.service.js',
        adfWigetsODataChartPath + 'odata.chart.config.service.js'
    ], function(ngApp) {

        'use strict';

        ngApp.controller('PageController', [
            '$scope',
            '$location',
            'pageService',
            'notificationService',
            'LocalizationService',
            'UserService',
            'NavigationGuardService',
            'DashboardQueryService',
            'SavedSearchService',
            PageController
        ]);

        function PageController($scope, $location, pageService, notificationService, LocalizationService) {

            var vm = this;
            angular.extend(vm, {
                dashboard: {
                    model: null
                },
                guid: document.querySelector("#guid").innerHTML,
                getActiveNotifications: function() {
                    return notificationService.getActiveNotifications();
                },
                getNotificationClass: function(notification) {
                    return notificationService.getNotificationClass(notification);
                },
                removeNotification: function (notification) {
                    notificationService.remove(notification);
                },
                setDashboardModelFromNavigationNode: function(navigationNode) {
                    if(navigationNode && navigationNode.Definition) {
                        vm.dashboard.model = navigationNode.Definition;
                        vm.dashboard.model.title = navigationNode.DisplayString;
                    } else {
                        $location.path('/errorNotFound');
                        //notificationService.addError('The page you have requested does not exist, or you are not authorized to view it.');
                    }
                }              
            });

            function onDashboardChange(event, name, model) {
                pageService
                    .updateDefinition(vm.guid, model)
                    .then(function(/*response*/) {
                        notificationService.add({
                            text: LocalizationService.getValue('ChangesSaved'),
                            type: notificationService.NOTIFICATION_TYPE.SUCCESS
                        });
                        //rebuild custom widgets when the dashboard changes
                        app.custom.dashboard.build();
                    });
            }

            $scope.$on('adfDashboardChanged', onDashboardChange);

            pageService.getNavigationNode()
                .then(function(navigationNode) {
                    // vm.dashboard.model = navigationNode.Definition;
                    vm.setDashboardModelFromNavigationNode(navigationNode);
                })["catch"](function() {
                     notificationService.addError(LocalizationService.getValue('ErrorOccured'));
                });            
        } 
    });

})();