// kb->view->app
define([
    'angularAMD',
    'angular-ui-router',
    'angular-resource',
    'angular-sanitize',
    'infinite-scroll'
], function (angularAMD) {
    'use strict';
    var app = angular.module("kbListing", ['ui.router', 'ngResource','ngSanitize', 'infinite-scroll']);
    app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $locationProvider.hashPrefix(''); //this fix the bug-24830,24833

        $stateProvider
            .state('listing', angularAMD.route({
                url: '^/',
                // With abstract set to true, that means this state can not be explicitly activated.
                // It can only be implicitly activated by activating one of its children.
                abstract: true,
                templateUrl: '/Scripts/ng/kb/listing/kbListingView.html',
                controller: 'kbListingController',
                controllerUrl: '/Scripts/ng/kb/listing/kbListingController.js'
            }))


            .state('listing.index', angularAMD.route({
                // Using an empty url means that this child state will become active
                // when its parent's url is navigated to. Urls of child states are
                // automatically appended to the urls of their parent. So this state's
                // url is '/' (because '/' + '').
                url: '^/',

                // IMPORTANT: Now we have a state that is not a top level state. Its
                // template will be inserted into the ui-view within this state's
                // parent's template; so the ui-view within kbListingView.html. This is the
                // most important thing to remember about templates.
                templateUrl: '/Scripts/ng/kb/listing/kbListingIndexView.html'
            }))

            .state('listing.category', angularAMD.route({
                url: 'category/:categoryName/:categoryId',

                // View names can be relative or absolute. Relative view names do not use an '@'
                // symbol. They always refer to views within this state's parent template.
                // Absolute view names use a '@' symbol to distinguish the view and the state.
                // So 'foo@bar' means the ui-view named 'foo' within the 'bar' state's template.
                views: {
                    // So this one is targeting the unnamed view within the parent state's template.
                    '': {
                        templateUrl: '/Scripts/ng/kb/listing/kbListingCategoryView.html',
                        controller: 'kbListingCategoryController',
                        controllerUrl: '/Scripts/ng/kb/listing/kbListingController.js'
                    }
                }
            }))

            //this fix the bug-24833
            .state('listing.search', angularAMD.route({
                url: 'search/:searchText/',
                views: {
                    // So this one is targeting the unnamed view within the parent state's template.
                    '': {
                        templateUrl: '/Scripts/ng/kb/listing/kbListingSearchView.html',
                        controller: 'kbListingSearchController',
                        controllerUrl: '/Scripts/ng/kb/listing/kbListingController.js'
                    }
                }
            }))

            //this fix the bug-24833
            .state('listing.search/:searchText/:selectedCategories/:selectedTypes', angularAMD.route({
                url: 'search/:searchText/:selectedCategories/:selectedTypes',
                views: {
                    // So this one is targeting the unnamed view within the parent state's template.
                    '': {
                        templateUrl: '/Scripts/ng/kb/listing/kbListingSearchView.html',
                        controller: 'kbListingSearchController',
                        controllerUrl: '/Scripts/ng/kb/listing/kbListingController.js'
                    }
                }
            }));
        
        $urlRouterProvider.otherwise("/");
    });

    return angularAMD.bootstrap(app);

});