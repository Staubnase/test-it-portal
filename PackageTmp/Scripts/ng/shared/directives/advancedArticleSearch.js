define(['angularAMD'],
    function (angularAMD) {

        angularAMD.directive('cireAdvancedSearch', ['$rootScope', '$window', 'articleCategoryFactory', 'articleTypeFactory', 'articleListFactory', function ($rootScope, $window, articleCategoryFactory, articleTypeFactory, articleListFactory) {
            return {
                restrict: "E",
                templateUrl: "/Scripts/ng/shared/directives/templates/advancedArticleSearch.html",
                link: function (scope, element, attrs) {
                    scope.localization = localization;
                    scope.showEmptySearchMessage = false;
                    scope.searchText = '';
                    scope.selectedCategories = [];
                    scope.selectedTypes = [];
                    scope.showAppliedFiltersIcon = false;

                    scope.onFilterChanged = function () {
                        scope.showAppliedFiltersIcon =
                            _.any(scope.categories, function (filterObj) {
                                return filterObj.selected;
                            }) || _.any(scope.types, function (filterObj) {
                                return filterObj.selected;
                            });
                    };

                    /*
                     * Check for scope.state. Need to due to our use of true ng and the shimmed ng + viewBuilder pages.
                     * scope.state should exist if on a page utilizing ui-router, otherwise we assume viewBuilder.
                     * Semi-kludge, yes.
                     */

                    if (!_.isUndefined(scope.state)) {
                        //state is in there so try to assign values (carefully)
                        scope.searchText = scope.state.params.searchText || '';
                        if (!_.isUndefined(scope.state.params.selectedCategories) && !_.isUndefined(scope.state.params.selectedTypes)) {

                            //due to ui-router treating empty parameters as a blank string we need to check if 
                            //these are there and the value is not empty string
                            scope.selectedCategories = scope.state.params.selectedCategories.length > 0
                                ? scope.state.params.selectedCategories.split('&')
                                : [];

                            scope.selectedTypes = scope.state.params.selectedTypes.length > 0
                                ? scope.state.params.selectedTypes.split('&')
                                : [];

                            scope.showAppliedFiltersIcon = scope.selectedCategories.length > 0 || scope.selectedTypes.length > 0;
                        }

                    };

                    /*
                     * GET list of checkboxes to filter on
                     */

                    articleCategoryFactory.GetTree(null, function (data) {
                        scope.categories = scope.mapEnum(data.Categories);
                    });

                    articleTypeFactory.GetRootTypes(null, function (data) { 
                        scope.types = _.map(data, function (type) {
                            return {
                                name: type.Name, id: type.Id, selected: _.indexOf(scope.selectedTypes, type.Id) > -1
                            };
                        });
                    });

                    scope.mapEnum = function (data) {
                        return _.map(data, function (cat) {
                            return { name: cat.label, id: cat.nodeId, selected: _.indexOf(scope.selectedCategories, cat.nodeId) > -1, children: scope.mapEnum(cat.children) }
                        });
                    };


                    /* slide filter setup */

                    scope.toggleShowFilters = function ($event) {
                        $event.stopPropagation();
                        $('.filters-wrapper').slideToggle(450);
                    };

                    //stop prop inside the div and the input ele 
                    $('.filters-wrapper').click(function (e) {
                        e.stopPropagation();
                    });
                    $('.search-wrapper input').click(function (e) {
                        e.stopPropagation();
                    });

                    //when we click anywhere else, close the filter div
                    $(document).click(function () {
                        $('.filters-wrapper').slideUp(100);
                    });

                    /* search event setup */

                    scope.search = function (keyEvent) {
                        if (keyEvent.type === 'click' || (keyEvent.type === 'keypress' && keyEvent.keyCode === 13)) {
                            //check that they have a value in required searchText input
                            if (scope.searchText.length <= 0) {
                                scope.showEmptySearchMessage = true;
                                return;
                            } else {
                                scope.showEmptySearchMessage = false;
                            }

                            $('.filters-wrapper').slideUp(100);

                            var flatcategories = [];
                            var flattypes = [];
                            var flattenEnum = function (enumSelected, arr) {
                                _.each(_.filter(enumSelected, function (cat) { return cat.selected; }), function (item) {
                                    arr.unshift(item);
                                    _.each(item.children, function (child) {
                                        child.selected = true;
                                    });
                                    flattenEnum(item.children,arr);
                                });
                            };

                            flattenEnum(scope.categories, flatcategories);
                            flattenEnum(scope.types, flattypes);


                            //grab the guid of whatever is selected in the filters
                            //scope.selectedCategories = _.pluck(_.filter(scope.categories, function (cat) { return cat.selected; }), 'id');
                            scope.selectedCategories = _.pluck(flatcategories, 'id');
                            scope.selectedTypes = _.pluck(flattypes, 'id');

                            //NOTE: encodeURIComponent() on searchText is needed to prevent breaking back button
                            $window.location.href =
                                '/KnowledgeBase/Listing#/search/' + encodeURIComponent(scope.searchText) + '/'
                                + scope.selectedCategories.join('&') + '/'
                                + scope.selectedTypes.join('&');
                        };
                    };




                    /*
                     * NOTE TO DEVS:    
                     *      This may not be the proper way to get ui-router and this dir to work (almost certain it isn't proper).  
                     *      There is something going on with either this control or the listing page config/composition that is making
                     *      this part of the listing Ctrl for the root abstract route. Could be a more proper solution in there somewhere
                     *      but.... no. 
                     * 
                     * WHAT DIS DO:
                     *      What we are doing in this event is taking the $state (added via the page controllers to scope.state)
                     *      and using that to update the checkbox 'selected' property (so the UI shows it correctly), set searchText,
                     *      and set the selected filters. If $state has the parameters applicable to the search directive, we 
                     *      explicitly update values on the scope here in order to achieve the look and behaviour of it 'just working'.
                     *      Second benefit is when $state doesn't have the params this directive uses then it does a psuedo reset and sets 
                     *      all search and filter values to empty. 
                     */
                    $rootScope.$on('$stateChangeSuccess',
                        function (event, toState, toParams, fromState, fromParams) {
                            scope.searchText = scope.state.params.searchText || '';

                            scope.selectedTypes = !_.isUndefined(scope.state.params.selectedTypes)
                                ? scope.state.params.selectedTypes.split('&')
                                : [];
                            scope.selectedCategories = !_.isUndefined(scope.state.params.selectedCategories)
                                ? scope.state.params.selectedCategories.split('&')
                                : [];

                            _.each(scope.categories, function (cat) {
                                cat.selected = _.indexOf(scope.selectedCategories, cat.id) > -1;
                            });
                            _.each(scope.types, function (typ) {
                                typ.selected = _.indexOf(scope.selectedTypes, typ.id) > -1;
                            });

                            scope.showAppliedFiltersIcon = _.any(scope.categories, function (filterObj) {
                                return filterObj.selected;
                            }) || _.any(scope.types, function (filterObj) {
                                return filterObj.selected;
                            });

                        });
                }
            };
        }]);
    });
