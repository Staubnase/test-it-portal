define(['angularAMD', '../filters/caseInsensitiveFilter.js', '../filters/sortableObjectFilter.js'], function (angularAMD) {
    angularAMD.directive('serviceTree', function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                categorydata: '=',
                searchtext: '=',
                favorites: '@'
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/serviceTree.html",
            link: function (scope, element, attrs) {
              
                scope.toggleBar = function ($event) {
                    $event.preventDefault();
                    var _this = $event.currentTarget;
                    var elementCollapse = $(_this).siblings();
                    var elementToggle = $(_this).children()[1];
                    var left = 'fa fa-chevron-left';
                    var down = 'fa fa-chevron-down';

                    function collapseFunction() {
                        $(elementToggle).removeClass(left);
                        $(elementToggle).addClass(down);
                        $(elementCollapse).show(100);
                    }

                    function hideFunction() {
                        $(elementToggle).removeClass(down);
                        $(elementToggle).addClass(left);
                        $(elementCollapse).hide(100);
                    }
                 
                    if ($(elementCollapse).hasClass('hidden')) {
                        $(elementCollapse).removeClass('hidden');
                        collapseFunction();
                        return;
                    }

                    if ($(elementCollapse).hasClass('show')) {
                        $(elementCollapse).removeClass('show');
                        hideFunction();
                    } else {
                        if ($(elementToggle).hasClass(left)) {
                            collapseFunction();
                        } else {
                            hideFunction();
                        }
                    }
                }
            }
        };
    });
});

