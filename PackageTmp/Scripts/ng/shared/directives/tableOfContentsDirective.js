//load and register this directive with AngularAMD
define(['app'], function (app) {
    app.directive('tableOfContents', function ($location, $anchorScroll) {
        return {
            restrict: 'AE',
            scope: {
                content: '=content', //we need this so we know when the content get's updated
                contentClass: '@contentClass',
                isMobileDevice: '='
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/tableOfContents.html",
            link: function (scope, element, attr) {
                scope.updateHeadlines = function () {
                    scope.headlines = [];
                    //setup for scroll to headline
                    $anchorScroll.yOffset = 50;
                    var id = 0;
                    
                    //angular.forEach($('<div></div>').append(scope.content).find('h1,h2,h3,h4,h5,h6'), function (e) {//from lance
                    angular.forEach(angular.element('.' + scope.contentClass).find("h1,h2,h3,h4,h5,h6"), function (e) {
                        //heading counter
                        id++;

                        //add id for scroll spy, maybe
                        var currentElm = angular.element(e);
                        var currentId = "heading-" + id + "-" + scope.contentClass;
                        currentElm.attr('id', currentId);

                        //sanitize the toc link
                        var heading = e.cloneNode(true);
                        heading.innerHTML = heading.innerHTML.replace(/(<([^>]+)>)/ig, "");//remove inner html tags
                        
                        //if we have text to link from, add it 
                        if (heading.innerHTML.length > 0) {
                            scope.headlines.push({
                                level: e.tagName[1],
                                label: angular.element(e).text(),
                                id: currentId,
                                html: heading.outerHTML,
                                element: e
                            });
                        }
                    });
                };


                 // avoid memoryleaks from dom references
                scope.$on('$destroy', function () {
                    scope.headlines = [];
                });

                // scroll to one of the headlines
                scope.scrollTo=function(headline) {
                    // the element you wish to scroll to.
                    $location.hash(headline.id);

                    // call $anchorScroll()
                    $anchorScroll();
                }

                scope.$watch('content', function (newValue, oldValue) {
                    if (newValue !== null && newValue !== undefined) {
                        scope.updateHeadlines();
                    }
                });

            }
        }

    });
});