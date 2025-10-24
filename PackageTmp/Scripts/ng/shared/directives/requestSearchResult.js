define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('requestSearchResult', function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                requestData: '=',
                localization: '=',
                loading: '='
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/requestSearchResult.html",
            link: function (scope, element, attrs) {
               //This directive will be more functional in future development.
            }
        };
    });
});

