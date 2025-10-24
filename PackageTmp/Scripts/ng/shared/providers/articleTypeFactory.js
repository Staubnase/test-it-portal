define(['angularAMD'], function (angularAMD) {
    angularAMD.factory('articleTypeFactory', ['$resource', function ($resource) {
        return $resource('/api/V3/ArticleType', {}, {
            GetRootTypes: { method: 'GET', isArray: true }
        });
    }]);
});