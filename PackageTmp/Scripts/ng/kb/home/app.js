// kb->home->app
define([
    'angularAMD',
    'angular-resource',
    '/scripts/ng/shared/directives/abnTreeDirective.js',
    '/scripts/ng/shared/directives/advancedArticleSearch.js',
    '/scripts/ng/shared/providers/articleCategoryFactory.js',
    '/scripts/ng/shared/providers/articleTypeFactory.js',
    '/scripts/ng/shared/providers/articleListFactory.js'
], function (angularAMD) {
    'use strict';
    var app = angular.module("kbHome", ['ngResource']);

    /*
     * category tree setup, need to define a controller for the viewpanel here that matches the name in the definition.
     */
    app.controller('articleCategoryTreeCtrl', ['$scope', '$window', 'articleCategoryFactory', function ($scope, $window, articleCategoryFactory) {

        //for kbhome > listing page. Adding mask makes it feel like it is working when the connection is slow.
        //https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload
        window.addEventListener("beforeunload", function (e) {
            if (location.pathname.indexOf('View') >= 0) {
                this.app.lib.mask.apply();
            }
        });

        //setup category tree
        $scope.treeData = [];
        $scope.kbTreeSelectHandler = function (branch) {
            $window.location.href = '/KnowledgeBase/Listing#/category/' + branch.label + '/' + branch.nodeId;
        };
        articleCategoryFactory.GetTree(null, function (data) {
            $scope.treeData = _.sortBy(data.Categories, 'label');
        });

    }]);

    return angularAMD.bootstrap(app);
});
