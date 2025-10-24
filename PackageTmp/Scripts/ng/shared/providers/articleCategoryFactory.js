define(['angularAMD'], function (angularAMD) {
    angularAMD.factory('articleCategoryFactory', ['$resource', function ($resource) {
        return $resource('/api/V3/ArticleCategory', {}, {
            GetTree: { method: 'GET', isArray: false },
            GetBreadcrumbs: { method: 'GET', params: {categoryId: '@categoryId'}, isArray: true }
        });
    }]);
});