/* global define: true */
(function() {
    
    'use strict';

    // page->app
    define([
        'angularAMD',
        'Sortable',
        'angular-resource',
        'angular-ui-router',
        'angular-sanitize',
        'angular-bootstrap',
        'angular-bootstrap-templates',
        'angular-dashboard-framework',
        'adf-structures-base',
        'adf-widget-grid',
        'adf-widget-saved-search-combo',
        'adf-widget-html',
        //'adf-widget-iframe', //remove iframe for now
        'adf-widget-advanced-chart',
        'adf-widget-advanced-grid',
        'adf-widget-advanced-count',
        'adf-widget-count',
        'adf-widget-advanced-calendar',
        'adf-widget-odata-grid',
        'adf-widget-odata-chart',
        'adf-widget-odata-count',
        'adf-widget-odata-calendar',
        'kendo'
    ], function (angularAMD, Sortable) {

        var appModuleName = 'app';
        angular.module(appModuleName, [
            'ui.router', 
            'ngResource', 
            'ngSanitize',
            'adf',
            'adf.structures.base',
            'adf.widget.grid',
            'adf.widget.saved.search.combo',
            'adf.widget.html',
            'kendo.directives',
            //'adf.widget.iframe', //remove iframe for now
            'adf.widget.advanced.chart',
            'adf.widget.advanced.grid',
            'adf.widget.advanced.count',
            'adf.widget.count',
            'adf.widget.advanced.calendar',
            'adf.widget.odata.grid',
            'adf.widget.odata.chart',
            'adf.widget.odata.count',
            'adf.widget.odata.calendar',
        ]).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.hashPrefix('');
            $stateProvider.state('view', angularAMD.route({
				resolve:{
					sessionStorageReady: function ($q, $interval) {
						var d = $q.defer();
						if (window.app.isSessionStored()) {
							d.resolve("ready");
							return d.promise;
						}
						var stop = $interval(function() {
							if (window.app.isSessionStored()) {
								$interval.cancel(stop);
								stop = undefined;
								d.resolve("ready");
							}
						}, 100, 300);
						return d.promise;
					}
				},
                url: '/',
                templateUrl: '/Scripts/ng/page/pageView.html',
                controller: 'PageController',
                controllerAs: 'vm',
                controllerUrl: '/Scripts/ng/page/page.controller.js'
            }));

            $urlRouterProvider.otherwise('/');
        }).config(function($stateProvider) {
            $stateProvider.state('errorNotFound', angularAMD.route({
                url: '/errorNotFound',
                templateUrl: '/Scripts/ng/page/pageViewErrorNotFound.html',
                controller: 'PageErrorController',
                controllerAs: 'vm',
                controllerUrl: '/Scripts/ng/page/page.error.controller.js'
            }));
        });
        
        if (!session.isRightToLeft) {
            window.Sortable = Sortable; //angular-dashboard-frameworks assumes Sortable is in the global space
        }
        
        return angularAMD.bootstrap(angular.module(appModuleName));
    });

})();