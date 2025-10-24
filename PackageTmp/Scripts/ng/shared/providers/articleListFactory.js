define(['angularAMD'], function (angularAMD) {
    angularAMD.factory('articleListFactory', ['$resource', function ($resource) {
        return $resource('/api/V3/ArticleList/', {}, {

            getByCategory: {
                method: 'GET', params: {
                    categoryId: '@categoryId',
                    skipCount: '@skipCount',
                    takeCount: '@takeCount'
                }, isArray: false
            },

            getSearchResults: {
                method: 'GET',
                params: {
                    searchText: '@searchText',
                    selectedCategories: '@selectedCategories',
                    selectedTypes: '@selectedTypes',
                    skipCount: '@skipCount',
                    takeCount: '@takeCount'
                },
                isArray: true
            }
        });
    }]);
});