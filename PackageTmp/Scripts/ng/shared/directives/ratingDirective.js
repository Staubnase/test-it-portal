//load and register this directive with AngularAMD
define(['app'], function (app) {
    app.directive('rating', function () {
        return {
            restrict: 'AE',
            scope: {
                score: '=score',
                max: '=max'
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/rating.html",
            link: function (scope, elements, attr) {

                scope.updateStars = function () {
                    var idx = 0;
                    scope.stars = [];
                    for (idx = 0; idx < scope.max; idx += 1) {
                        scope.stars.push({
                            full: scope.score > idx
                        });
                    }
                };

                scope.hover = function (/** Integer */ idx) {
                    if (attr.readonly == null ) {
                        scope.hoverIdx = idx;
                    }
                };

                scope.stopHover = function () {
                    if (attr.readonly == null) {
                        scope.hoverIdx = -1;
                    }
                };

                scope.starColor = function (/** Integer */ idx) {
                    var starClass = 'rating-normal';
                    if (idx <= scope.hoverIdx) {
                        starClass = 'rating-highlight';
                    }
                    return starClass;
                };

                scope.starClass = function (/** Star */ star, /** Integer */ idx) {
                    var starClass = 'fa-star-o';
                    if (star.full || idx <= scope.hoverIdx) {
                        starClass = 'fa-star';
                    }
                    return starClass;
                };

                scope.setRating = function (idx) {
                    if (attr.readonly == null) {
                        scope.score = idx + 1;
                        scope.stopHover();
                    }
                };

                scope.$watch('score', function (newValue, oldValue) {
                    if (newValue !== null && newValue !== undefined) {
                        scope.updateStars();
                    } else {
                        scope.score = 0;
                    }
                });
            }
        }

    });
});