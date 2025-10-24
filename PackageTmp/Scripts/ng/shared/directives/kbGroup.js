define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('kbGroup', function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                kbData: '=',
                kbLocalization: '=',
                kbGroupby: '@',
                kbClass: '@',
                kbNoresult: '='
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/kbGroup.html",
            link: function (scope, element, attrs, state) {
                scope.toggleBar = function ($event) {
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
            }
        };
    });
});

