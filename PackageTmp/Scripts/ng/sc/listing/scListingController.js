define(['app',
    '../scFactory.js',
    '../../shared/directives/serviceTree.js',
    '../../shared/directives/servicePanel.js',
    '../../shared/directives/kbGroup.js',
    '../../shared/directives/requestSearchResult.js'],
        function (app) {
            'use strict';
            app.controller('scLayoutController', ['$scope', 'scFactory', function ($scope, scFactory) {

                //share for the kids
                $scope.userId = session.user.Id;
                $scope.isSCScoped = session.user.Security.IsServiceCatalogScoped;
                $scope.localization = localization;
                $scope.searchText = '';
                $scope.filterText = '';
                $scope.filterLabel = $scope.localization.SearchAll;
                $scope.searchType = 'All';
                $scope.catalogItems = [];
                $scope.loading = true;
                $scope.fetching = false;
                $scope.showEmptySearchMessage = false;
                $scope.filterItems = [
                    { name: $scope.localization.IWantToReportAnIssue, value: 'Incidents' },
                    { name: $scope.localization.IWantToRequestSomething, value: 'Requests' },
                    { name: $scope.localization.ChooseAFavoriteRequest, value: 'Favorites' }
                ];

                //This will be work when API went messup.... 
                $scope.OnError = function (error) {
                    $scope.loading = false;
                    $scope.fetching = false;
                };

                //Callback function for service category API...
                $scope.scItemsCallback = function (data) {

                    var service = _.uniq(data, function (serv) { return serv.ServiceOfferingId; });
                    var cacheService = {};

                    //Right side panel: Array for service category and its respective service offerings.
                    _.each(service, function (item) {
                        var serviceCategory = [];

                        if (cacheService[item.CategoryId] === undefined) {
                            serviceCategory.push(item);
                            cacheService[item.CategoryId] = { Category: { Name: item.Category, Services: serviceCategory } };
                        } else {
                            cacheService[item.CategoryId].Category.Services.push(item);
                        }
                    });

                    $scope.catalogItems = service;
                    $scope.scData = cacheService;
                };

                //Get the items for service catalog, the value will be appear on the right side panel.
                $scope.scData = {};
                scFactory.scItems().query({ userId: $scope.userId, isScoped: session.user.Security.IsServiceCatalogScoped }, $scope.scItemsCallback);

                //Toggle..............
                $scope.toggleBar = function ($event) {
                    $event.preventDefault();
                    var _this = $event.currentTarget;
                    var elementCollapse = $(_this).siblings();
                    var elementToggle = $(_this).children()[1];
                    var left = 'fa fa-chevron-left';
                    var down = 'fa fa-chevron-down';

                    if ($(elementToggle).hasClass(left)) {
                        $(elementToggle).removeClass(left);
                        $(elementToggle).addClass(down);
                    } else {
                        $(elementToggle).removeClass(down);
                        $(elementToggle).addClass(left);
                    }
                    $(elementCollapse).slideToggle(100);
                };
            }]);

            app.controller('scIndexController', ['$scope', '$state', 'scFactory', function ($scope, $state, scFactory) {
                $scope.featuredArticle = [];
                $scope.popularArticle = [];
                $scope.topRequest = [];
                $scope.favoriteRequest = [];
                $scope.loading = true;

                //Callback to remove the loading when data is ready
                $scope.favoriteRequestCallback = function (data) {
                    $scope.loading = false;
                };

                //Get the featured articles
                var featuredSrvcs = scFactory.articlesPopularity();
                $scope.featuredArticle = featuredSrvcs.query({ count: 5 }), $scope.OnError;
                //Get the popular articles
                var popularArticle = scFactory.articlesView();
                $scope.popularArticle = popularArticle.query({ count: 5 }), $scope.OnError;
                //Get the top request 
                var requestSrvcs = scFactory.topRequest();
                $scope.topRequest = requestSrvcs.query({ userId: $scope.userId, returnAmount: 5, isScoped: $scope.isSCScoped }), $scope.OnError;
                //Get the favorite request
                var favoriteSrvcs = scFactory.favoriteRequest();
                $scope.favoriteRequest = favoriteSrvcs.query({ userId: $scope.userId, returnAmount: 5, isScoped: $scope.isSCScoped }, $scope.favoriteRequestCallback), $scope.OnError;

                $scope.search = function (keyEvent) {
                    if (keyEvent.type === 'click' || (keyEvent.type === 'keypress' && keyEvent.keyCode === 13)) {
                        if ($scope.searchText.length > 0) {
                            $state.go('listing.search', {
                                searchText: $scope.searchText,
                                searchType: $scope.searchType
                            });
                        } else {
                            $scope.showEmptySearchMessage = true;
                        }
                    };
                };

                $scope.onFilterSelect = function ($event) {
                    var _this = $event.currentTarget;
                    var searchtype = $(_this).parent();
                    var filtertext = $(_this).text();
                    $scope.searchType = $(searchtype).attr('searchtype');
                    $scope.filterLabel = filtertext;
                };

            }])

            app.controller('scSOController', ['$scope', '$stateParams', '$state', 'scFactory', function ($scope, $stateParams, $state, scFactory) {
                $scope.soItems = [];
                $scope.soModel = {};
                $scope.kaModel = { Categorys: [], Types: [] };
                $scope.loading = true;

                $scope.categoryModel = {};
                $scope.typeModel = {};
                $scope.serviceCatalog = {};


                //Return nothing if servicdeId is null.
                if (_.isUndefined($stateParams.serviceId)) {
                    $scope.loading = false;
                    return;
                }

                //Callback function for request offerings...
                $scope.requestOfferingCallback = function (data) {
                    $scope.soModel = data;
                    var cacheCategory = {};
                    var cacheType = {};
                    $scope.kbNoResultCategory = true;
                    $scope.kbNoResultType = true;

                    //Knowledge Article by Category...
                    _.each(data.ServiceInfo.KnowledgeArticles, function (item) {
                        var articlesCategory = [];

                        if (!_.isNull(item.KACategory)) {
                            if (cacheCategory[item.KACategory.Id] === undefined) {
                                $scope.kbNoResultCategory = false;
                                articlesCategory.push(item);
                                cacheCategory[item.KACategory.Id] = { Category: { Name: item.KACategory.Name, Count: 1, Articles: articlesCategory } };
                            } else {
                                cacheCategory[item.KACategory.Id].Category.Articles.push(item);
                                cacheCategory[item.KACategory.Id].Category.Count = cacheCategory[item.KACategory.Id].Category.Count + 1;
                            }
                        }
                    });

                    //Knowledge Article by Type...
                    _.each(data.ServiceInfo.KnowledgeArticles, function (item) {
                        var articlesType = [];

                        if (!_.isNull(item.KAType)) {
                            if (cacheType[item.KAType.Id] === undefined) {
                                $scope.kbNoResultType = false;
                                articlesType.push(item);
                                cacheType[item.KAType.Id] = { Type: { Name: item.KAType.Name, Count: 1, Articles: articlesType } };
                            } else {
                                cacheType[item.KAType.Id].Type.Articles.push(item);
                                cacheType[item.KAType.Id].Type.Count = cacheType[item.KAType.Id].Type.Count + 1;
                            }
                        }
                    });

                    $scope.categoryModel = cacheCategory;
                    $scope.typeModel = cacheType;
                    $scope.loading = false;
                };

                //Callback function service category...
                $scope.scItemsCallback = function (data) {
                    //Breadcrumbs: Get the service category by service offering id.....
                    $scope.serviceCatalog = _.first(_.where(data, { ServiceOfferingId: $stateParams.serviceId }));

                    var soItems = _.where(data, { ServiceOfferingId: $stateParams.serviceId });
                    $scope.soItems = soItems;

                    //Redirect to the search page if there service offering have no data...
                    if ($scope.soItems.length === 0) {
                        $scope.loading = false;
                        $state.go('listing.search');
                    }

                    // Get the Service offering information included the knowledge articles relate on him...
                    scFactory.requestOffering().get({
                        requestOfferingId: soItems[0].RequestOfferingId,
                        serviceOfferingId: $stateParams.serviceId,
                        userId: $scope.userId,
                        isScoped: session.user.Security.IsServiceCatalogScoped
                    }, $scope.requestOfferingCallback), $scope.OnError;
                };

                //Query using Service category api to get request offering by userid....
                scFactory.scItems().query({ userId: $scope.userId, isScoped: session.user.Security.IsServiceCatalogScoped }, $scope.scItemsCallback), $scope.OnError;

            }]);

            app.controller('scSearchController', ['$scope', '$state', '$stateParams', 'scFactory', function ($scope, $state, $stateParams, scFactory) {
                $scope.showEmptySearchMessage = false;
                $scope.roLoading = true;

                $scope.requestItems = [];
                $scope.kbBycategory = [];
                $scope.kbBytype = [];
                
                $scope.searchText = $stateParams.searchText.replace('%20', ' ');
                $scope.searchType = $stateParams.searchType;
                var findFilter = _.where($scope.filterItems, { value: $scope.searchType });

                if (findFilter.length === 0 && $scope.searchType !== 'All') {
                    $scope.searchType = 'All';
                    $state.go('listing.search', {
                        searchText: $scope.searchText,
                        searchType: $scope.searchType
                    });
                }

                $scope.filterLabel = $scope.searchType !== 'All' ? findFilter[0].name : $scope.localization.SearchAll;

                $scope.fetchMoreOffering = function fetchMoreOffering() {
                    $scope.fetching = true;

                    //prevent calls and show message when we have all results
                    if ($scope.requestItems && $scope.searchParams.skipCount == $scope.requestItems.length) {
                        $scope.noMoreRequestsMessage = localization.NoMoreRequestsFound;
                        $scope.fetching = false;
                        return;
                    }

                    //update searchParams with new skip count
                    $scope.searchParams.skipCount = $scope.requestItems ? $scope.requestItems.length : 0;

                    //call api to GET the results
                    $scope.noMoreRequestsMessage = '';
                    scFactory.searchRequest().query($scope.searchParams,
                        function (result) {
                            //append the additional offering to the current list
                            _.each(result, function (ro) {
                                $scope.requestItems.push(ro);
                            });
                            $scope.fetching = false;
                        });
                };

                $scope.searchParams = {
                    searchText: $scope.searchText,
                    searchType: $scope.searchType,
                    skipCount: 0,
                    takeCount: 10
                };

                $scope.kbParams = {
                    searchText: $scope.searchText,
                    skipCount: 0
                };

                function serviceFunction() {
                    $scope.searchRequestCallback = function (data) {
                        $scope.requestItems = data;
                        $scope.noResults = $scope.requestItems.length <= 0;
                        $scope.roLoading = false;
                    };

                    //Query using Service category api to get request offering by userid....
                    scFactory.searchRequest().query($scope.searchParams, $scope.searchRequestCallback), $scope.OnError;
                };

                function articleListFunction() {
                    $scope.articleListCallback = function (data) {
                        var cacheCategory = {};
                        var cacheType = {};
                        $scope.kbNoResultCategory = true;
                        $scope.kbNoResultType = true;

                        //Knowledge Article by Category...
                        _.each(data, function (item) {
                            var articlesCategory = [];

                            if (cacheCategory[item.Category.Id] === undefined) {
                                $scope.kbNoResultCategory = false;
                                articlesCategory.push(item);
                                cacheCategory[item.Category.Id] = {
                                    Group: { Name: item.Category.Name, Count: 1, Articles: articlesCategory },
                                    ViewAll: { SearchText: $scope.searchText, Id: item.Category.Id },
                                    isCategory: true,
                                    isExcess: false
                                };
                            } else {
                                if (cacheCategory[item.Category.Id].Group.Count < 5) {
                                    cacheCategory[item.Category.Id].Group.Articles.push(item);
                                    cacheCategory[item.Category.Id].Group.Count = cacheCategory[item.Category.Id].Group.Count + 1;
                                } else {
                                    cacheCategory[item.Category.Id].isExcess = true;
                                    cacheCategory[item.Category.Id].Group.Count = cacheCategory[item.Category.Id].Group.Count + 1;
                                }
                            }
                        });
                        //Knowledge Article by Type...
                        _.each(data, function (item) {
                            var articlesType = [];

                            if (cacheType[item.Type.Id] === undefined) {
                                $scope.kbNoResultType = false;
                                articlesType.push(item);
                                cacheType[item.Type.Id] = {
                                    Group: { Name: item.Type.Name, Count: 1, Articles: articlesType },
                                    ViewAll: { SearchText: $scope.searchText, Id: item.Type.Id },
                                    isType: true,
                                    isExcess: false
                                };
                            } else {
                                if (cacheType[item.Type.Id].Group.Count < 5) {
                                    cacheType[item.Type.Id].Group.Articles.push(item);
                                    cacheType[item.Type.Id].Group.Count = cacheType[item.Type.Id].Group.Count + 1;
                                } else {
                                    cacheType[item.Type.Id].isExcess = true;
                                    cacheType[item.Type.Id].Group.Count = cacheType[item.Type.Id].Group.Count + 1;
                                }
                            }
                        });

                        $scope.kbBycategory = cacheCategory;
                        $scope.kbBytype = cacheType;
                    }

                    scFactory.articleList().query($scope.kbParams, $scope.articleListCallback);
                }

                serviceFunction();
                articleListFunction();

                $scope.search = function (keyEvent) {
                    if (keyEvent.type === 'click' || (keyEvent.type === 'keypress' && keyEvent.keyCode === 13)) {
                        if ($scope.searchText.length > 0) {
                            $scope.roLoading = true;
                            $scope.requestItems = [];
                            $scope.showEmptySearchMessage = false;

                            $scope.searchParams = {
                                searchText: $scope.searchText,
                                searchType: $scope.searchType,
                                skipCount: 0,
                                takeCount: 10
                            };

                            $scope.kbParams.searchText = $scope.searchText;
                            serviceFunction();
                            articleListFunction();
                            //Preventing to load the page when changing the url.
                            $state.go('listing.search', {
                                searchText: $scope.searchText,
                                searchType: $scope.searchType
                            },
                            {
                                location: 'replace',
                                inherit: false,
                                notify: false
                            });

                        } else {
                            $scope.showEmptySearchMessage = true;
                        }
                    };
                };

                $scope.onFilterSelect = function ($event) {
                    var _this = $event.currentTarget;
                    var searchtype = $(_this).parent();
                    var filtertext = $(_this).text();
                    $scope.searchType = $(searchtype).attr('searchtype');
                    $scope.filterLabel = filtertext;
                };
            }]);

            app.controller('scROFavoriteController', ['$scope', 'scFactory', function ($scope, scFactory) {
                $scope.loading = true;
                $scope.favoriteRequests = [];
                $scope.noMoreFavoritesMessage = '';


                $scope.fetchMoreFavorites = function fetchMoreFavorites() {
                    $scope.fetching = true;

                    //prevent calls and show message when we have all results
                    if ($scope.favoriteRequests && $scope.queryParams.skipCount == $scope.favoriteRequests.length) {
                        $scope.noMoreFavoritesMessage = localization.NoMoreRequestsFound;
                        $scope.fetching = false;
                        return;
                    }

                    //update searchParams with new skip count
                    $scope.queryParams.skipCount = $scope.favoriteRequests ? $scope.favoriteRequests.length : 0;

                    //call api to GET the results
                    scFactory.favoriteRequest().query($scope.queryParams, function (result) {
                        //append the additional offering to the current list
                        _.each(result, function (ro) {
                            $scope.favoriteRequests.push(ro);
                        });
                        $scope.fetching = false;
                    }), $scope.OnError;
                };

                $scope.favoriteRequestCallback = function (data) {
                    $scope.favoriteRequests = data;
                    $scope.loading = false;
                };

                $scope.queryParams = {
                    userId: $scope.userId,
                    returnAmount: -1, //-1 to fetch all results
                    isScoped: $scope.isSCScoped,
                    skipCount: 0,
                    takeCount: 10
                };

                //Get favorite ROs
                scFactory.favoriteRequest().query($scope.queryParams, $scope.favoriteRequestCallback), $scope.OnError;
            }]);

            app.filter('localizeDate', function () {

                // Create the return function and set the required parameter as well as an optional paramater
                return function (input) {

                    if (isNaN(input)) {
                        return kendo.toString(new Date(input), 'm') + ', ' + kendo.toString(new Date(input), 'yyyy');
                    } else {
                        return input;
                    }

                }
            });

        });
