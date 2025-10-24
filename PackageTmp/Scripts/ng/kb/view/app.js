// kb->view->app
define([
    'angularAMD',
    'angular-ui-router',
    'angular-resource',
    'angular-sanitize',
    '../../../scripts/libs/highlight.min.js'
], function (angularAMD) {
    'use strict';
    var app = angular.module("kbView", ['ui.router', 'ngResource','ngSanitize']);
    app.config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('view',angularAMD.route({
                url: '/',
                templateUrl: '/Scripts/ng/kb/view/kbViewView.html',
                controller: 'kbViewController',
                controllerUrl: '/Scripts/ng/kb/view/kbViewController.js'
            }));
 
        $urlRouterProvider.otherwise("/");
    });

    return angularAMD.bootstrap(app);

});