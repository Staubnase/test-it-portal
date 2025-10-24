
define([
    'angularAMD',
    'angular-ui-router',
    'angular-resource',
    'angular-sanitize',
    'infinite-scroll'
], function (angularAMD) {
    'use strict';
    var app = angular.module("scListing", ['ui.router', 'ngResource', 'ngSanitize', 'infinite-scroll']);
    app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        
        $locationProvider.hashPrefix(''); //this fix the bug-24830,24833
        $stateProvider
            .state('listing', angularAMD.route({
                url: '/',
                // With abstract set to true, that means this state can not be explicitly activated.
                // It can only be implicitly activated by activating one of its children.
                abstract: true,
                templateUrl: '/Scripts/ng/sc/listing/scListingLayout.html',
                controller: 'scLayoutController',
                controllerUrl: '/Scripts/ng/sc/listing/scListingController.js'
            }))

            .state('listing.index', angularAMD.route({
                url: '',
                views: {
                    '': {
                        templateUrl: '/Scripts/ng/sc/listing/scListingIndexView.html',
                        controller: 'scIndexController',
                        controllerUrl: '/Scripts/ng/sc/listing/scListingController.js'
                    }
                }
            }))

            .state('listing.search', angularAMD.route({
                url: 'Search/searchText=:searchText&searchType=:searchType',
                views: {
                    '': {
                        templateUrl: '/Scripts/ng/sc/listing/scListingSearchView.html',
                        controller: 'scSearchController',
                        controllerUrl: '/Scripts/ng/sc/listing/scListingController.js'
                    }
                }
            }))

            .state('listing.service', angularAMD.route({
                url: 'Service/:serviceId',
                views: {
                    '': {
                        templateUrl: '/Scripts/ng/sc/listing/scListingSOView.html',
                        controller: 'scSOController',
                        controllerUrl: '/Scripts/ng/sc/listing/scListingController.js'
                    }
                }
            }))

          .state('listing.favorites', angularAMD.route({
              url: 'Favorites',
              views: {
                  '': {
                      templateUrl: '/Scripts/ng/sc/listing/scListingROFavoriteView.html',
                      controller: 'scROFavoriteController',
                      controllerUrl: '/Scripts/ng/sc/listing/scListingController.js'
                  }
              }
          }));

        //$urlRouterProvider.html5Mode(false);
        //$urlRouterProvider.hashPrefix('!');
        $urlRouterProvider.otherwise("/");
    });
    return angularAMD.bootstrap(app);
});