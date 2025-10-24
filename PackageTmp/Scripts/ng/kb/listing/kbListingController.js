define(['app',
        '../../shared/directives/advancedArticleSearch.js',
        '../../shared/directives/abnTreeDirective.js',
        '../../shared/providers/articleCategoryFactory.js',
        '../../shared/providers/articleTypeFactory.js',
        '../../shared/providers/articleListFactory.js'
], function (app) {
    'use strict';

    //templateUrl: '/Scripts/ng/kb/listing/kbListingView.html'
    //templateUrl: '/Scripts/ng/kb/listing/kbListingIndexView.html
    app.controller('kbListingController', ['$scope', '$state', 'articleCategoryFactory', '$window', function ($scope, $state, articleCategoryFactory, $window) {
        /*
         * 'root' controller for abstract state, so we can utilize this to:
         *      - provide shared and inherited data to child states
         *      - provide resolved dependencies that child states can use
         *      - more: https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#abstract-states
         * 
         * When adding to scope here, child states $scope will have these in the __proto__ if inspecting in debugger
         * but can be called normally like $scope.localization (no need to $scope.$parent.$whatever). 
         */

        //shared with kids
        $scope.loading = true;
        $scope.localization = localization;
        $scope.state = $state;
        $scope.fetching = false;

        //specific to this view
        $scope.pageTitle = localization.BrowseArticles;
        $window.document.title = localization.BrowseArticles;

        //category tree directive setup
        $scope.treeData = [];
        $scope.breadcrumbs = [];
        $scope.kbTreeControl = {};
        $scope.kbTreeSelectHandler = function (branch) {
            $state.go('listing.category', { categoryName: branch.label, categoryId: branch.nodeId });
        };
        $scope.kbTreeStateHandler = function (branch) {
            return branch.nodeId === $scope.state.params.categoryId;
        };
        articleCategoryFactory.GetTree(null, function (data) {
            $scope.treeData = _.sortBy(data.Categories, 'label');
        });
        //this was the reason why I change the paramenter app to appKB it could not identify the global app.js when it used app parameter.
        //but before doing it I do testing also to assure it will not cause a problems. But I rework and change to other approach instead of this.
        //app.navDropdown();

        //data-bind did not work so decided to put in the code whats on the navDropdown function.
        function rpDropdown() {
            $('.nav-dropdown-trigger').on('click', function () {
                $('.nav-dropdown').toggleClass('show-nav-content');
            });

            var nav_this = $('.nav-dropdown');
            $(document).on('click', function (e) {
                if (!nav_this.is(e.target)
                    && nav_this.has(e.target).length === 0) {

                    nav_this.removeClass('show-nav-content');
                }
            });
        };

        rpDropdown();
    }]);

    //templateUrl: '/Scripts/ng/kb/listing/kbListingCategoryView.html'
    app.controller('kbListingCategoryController', ['$scope', '$stateParams', '$state', 'articleListFactory', 'articleCategoryFactory', '$window', '$timeout', function ($scope, $stateParams, $state, articleListFactory, articleCategoryFactory, $window, $timeout) {
        //update current state in scope
        $scope.state = $state;
        //set window title to generic category browse
        $window.document.title = localization.KnowledgeBase + ' - ' + localization.BrowseByCategory;

        //update the tree for instance where a metadata link was clicked
        if ($scope.state.current.name.indexOf('category') > -1) {
            if (!_.isUndefined($scope.kbTreeControl.initialized)) {
                $scope.kbTreeControl.update_selected_branch($scope.state.params.categoryName);
            };
        };
        
        //set up breadcrumbs if in category state
        if ($scope.state.includes('listing.category')) {
            var catId = $scope.state.params.categoryId;
            articleCategoryFactory.GetBreadcrumbs({ categoryId: catId }, function (data) {
                $timeout(function () {
                    $scope.$apply(function () {
                        //empty current array and repopulate
                        while ($scope.breadcrumbs.length > 0) {
                            $scope.breadcrumbs.pop();
                        };
                        _.each(data, function (crumb) {
                            $scope.breadcrumbs.push(crumb);
                        });

                        //remove last item in breadcrumb result (root enum, KA Category, which we do not show)
                        if (!_.isNull($scope.breadcrumbs)) {
                            $scope.breadcrumbs.splice($scope.breadcrumbs.length - 1, 1);
                        }
                    }, 0);
                });
            });
        }

        //function for lazy loading more articles
        $scope.noMoreArticlesMessage = '';
        $scope.fetchMoreGroupedArticles = function fetchMoreArticles() {
            $scope.fetching = true;

            //prevent calls and show message when we have all results
            if ($scope.skipCount > 0 && $scope.skipCount == $scope.articleList.length) {
                $scope.noMoreArticlesMessage = localization.NoMoreArticlesFound;
                $scope.fetching = false;
                return;
            }

            $scope.skipCount = $scope.articleList ? $scope.articleList.length : 0;
            //make api call to fetch more articles
            articleListFactory.getByCategory({
                categoryId: $scope.state.params.categoryId,
                skipCount: $scope.skipCount,
                takeCount: 20
            },
                function (result) {
                    //append the additional articles to the current list
                    _.each(result.Articles, function (article) {
                        article.LastModifiedDate = kendo.toString(new Date(article.LastModifiedDate), 'd');
                        $scope.articleList.push(article);
                    });
                    $scope.fetching = false;
                });
        };

        //get article list based on selected category
        articleListFactory.getByCategory({
            categoryId: $stateParams.categoryId,
            skipCount: 0,
            takeCount: 20
        },
            function (result) {
                var updatedArticleList = [];
                _.each(result.Articles, function (article) {
                    article.LastModifiedDate = kendo.toString(new Date(article.LastModifiedDate), 'd');
                    updatedArticleList.push(article);
                });

                $scope.articleList = updatedArticleList;
                $scope.noResults = result.Articles.length <= 0;
                $scope.rootGroupCategory = $scope.state.params.categoryName;
                $scope.loading = false;
            },
            function (error) {
                $scope.loading = false;
                $scope.noResults = true;
            });
    }]);

    //templateUrl: '/Scripts/ng/kb/listing/kbListingSearchView.html'
    app.controller('kbListingSearchController', ['$scope', '$stateParams', '$state', 'articleListFactory', '$window', function ($scope, $stateParams, $state, articleListFactory, $window) {
        //update current state in scope
        $scope.state = $state;
        //set window title to generic search title
        $window.document.title = localization.KnowledgeBase + ' - ' + localization.SearchButton + ' ' + localization.KnowledgeArticles;

        //clean up/clear out tree directive selection since state is changing
        if ($scope.state.current.name.indexOf('category') <= -1) {
            if (!_.isUndefined($scope.kbTreeControl.initialized)) {
                $scope.kbTreeControl.clear_selected_branch();
                $scope.kbTreeControl.collapse_all();
            };
        };

        //function for lazy loading more articles
        $scope.fetchMoreArticles = function fetchMoreArticles() {
            $scope.fetching = true;

            //prevent calls and show message when we have all results
            if ($scope.articles && $scope.queryParams.skipCount == $scope.articles.length) {
                $scope.noMoreArticlesMessage = localization.NoMoreArticlesFound;
                $scope.fetching = false;
                return;
            }

            //update queryParams with new skip count
            $scope.queryParams.skipCount = $scope.articles ? $scope.articles.length : 0;

            //call api to GET the results
            $scope.noMoreArticlesMessage = '';
            articleListFactory.getSearchResults($scope.queryParams,
                function (result) {
                    //append the additional articles to the current list
                    _.each(result, function (article) {
                        article.LastModifiedDate = kendo.toString(new Date(article.LastModifiedDate), 'd');
                        $scope.articles.push(article);
                    });
                    $scope.fetching = false;
                });
        };

        //get the params from the url
        $scope.searchText = $stateParams.searchText;
        $scope.queryParams = {
            searchText: $stateParams.searchText,
            selectedCategories: _.isUndefined($stateParams.selectedCategories) ? [""] : $stateParams.selectedCategories.split('&'),
            selectedTypes: _.isUndefined($stateParams.selectedTypes) ? [""] : $stateParams.selectedTypes.split('&'),
            skipCount: 0,
            takeCount: 20
        };

        //call api to GET initial results
        articleListFactory.getSearchResults($scope.queryParams,
            function (result) {
                result = _.map(result,
                    function(el) {
                        el.LastModifiedDate = kendo.toString(new Date(el.LastModifiedDate), 'd');
                        return el;
                    });
                $scope.articles = result;
                $scope.noResults = $scope.articles.length <= 0;

                $scope.loading = false;
                mask.remove();
            },
            function (error) {
                $scope.loading = false;
                $scope.noResults = true;
                mask.remove();
            });
        // -- for some reason using word "page" contains on search text causing a failure to remove the loading section.
        // -- this will assured the loading section will be removed and prevent the same issue but different causes.
        // -- todo: if possible to use the app.lib.mask.remove() much better.
        var mask = new function() {
            this.remove = function () {
                $('div.k-overlay.form-overlay').remove();
            }
        }
    }]);

});

