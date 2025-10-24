define(['app'], function (app) {
    'use strict';
    app.factory('scFactory', ['$resource', function ($resource) {

        return {
            scItems: function () {
                return $resource('/api/V3/ServiceCatalog/GetServiceCatalog', {}, {
                    query: { method: 'GET', params: { userId: '@userId', isScoped: '@isScoped' }, isArray: true }
                });
            },

            serviceCatalog: function () {
                return $resource('/api/V3/ServiceCatalog/GetByRequestOfferingId', {}, {
                    query: { method: 'GET', params: { requestOfferingId: '@requestOfferingId' }, isArray: false }
                });
            },

            markFavorite: function () {
                return $resource('/api/V3/ServiceCatalog/MarkFavorite', {}, {
                    save: { method: 'POST', params: { requestOfferingId: '@requestOfferingId', userId: '@userId' } }
                });
            },

            requestOffering: function () {
                return $resource('/api/V3/ServiceCatalog/GetRequestOffering', {}, {
                    query: {
                        method: 'GET', params: {
                            requestOfferingId: '@requestOfferingId',
                            serviceOfferingId: '@serviceOfferingId',
                            userId: '@userId',
                            isScoped: '@isScoped'
                        }, isArray: false
                    }
                });
            },

            topRequest: function () {
                return $resource('/api/V3/ServiceCatalog/GetTopRequestOffering', {}, {
                    query: { method: 'GET', params: { userId: '@userId', returnAmount: '@returnAmount', isScoped: '@isScoped' }, isArray: true }
                });
            },

            favoriteRequest: function () {
                return $resource('/api/V3/ServiceCatalog/GetFavoriteRequestOffering', {}, {
                    query: {
                        method: 'GET', params: {
                            userId: '@userId',
                            returnAmount: '@returnAmount',
                            isScoped: '@isScoped',
                            skipCount: '@skipCount',
                            takeCount: '@takeCount'
                        }, isArray: true
                    }
                });
            },

            article: function () {
                return $resource('/api/V3/Article/Get', {
                }, {
                    query: { method: 'GET', params: { articleId: '@Id' }, isArray: false }
                });
            },

            articlesPopularity: function () {
                return $resource('/api/V3/Article/GetTopArticlesByPopularity', {
                }, {
                    query: { method: 'GET', params: { count: '@count' }, isArray: true }
                });
            },

            articlesView: function () {
                return $resource('/api/V3/Article/GetTopArticlesByViewCount', {
                }, {
                    query: { method: 'GET', params: { count: '@count' }, isArray: true }
                });
            },

            articleList: function () {
                return $resource('/api/V3/ArticleList', {
                }, {
                    query: { method: 'GET', params: { searchText: '@searchText', selectedCategories: '@selectedCategories', selectedTypes: '@selectedTypes', skipCount: '@skipCount' }, isArray: true }
                });
            },

            searchRequest: function () {
                return $resource('/api/v3/servicecatalog/search', {
                }, {
                    query: { method: 'GET', params: { searchText: '@searchText', searchType: '@searchType', skipCount: '@skipCount', takeCount: '@takeCount' }, isArray: true }
                });
            }
        };
    }]);
});