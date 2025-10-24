var roApp = angular.module("requestOfferingApp", []);
roApp.controller("requestOfferingController", function ($scope, $element, PageFactory) {
    //method used for conditional display on dates
    $scope.compareDate = function (modelProp, operator, value, endValue, isRelative, offsetValue) {
        var bShow = false;
        var selectedDate = !angular.isUndefined(modelProp) ? kendo.parseDate(modelProp) : null;
        var comparedDate = isRelative ? this.getRelativeDate(value, offsetValue) : (!angular.isUndefined(value) ? kendo.parseDate(value) : null);
        var betweenEndDate = !angular.isUndefined(endValue) ? kendo.parseDate(endValue) : null;
      
        if (selectedDate == null) { return bShow; }
        
        switch (operator) {
            case "==":
                bShow = selectedDate.getTime() == comparedDate.getTime();
                break;
            case "!=":
                bShow = selectedDate.getTime() != comparedDate.getTime();
                break;
            case ">":
                bShow = selectedDate.getTime() > comparedDate.getTime();
                break;
            case "<":
                bShow = selectedDate.getTime() < comparedDate.getTime();
                break;
            case ">=":
                bShow = selectedDate.getTime() >= comparedDate.getTime();
                break;
            case "<=":
                bShow = selectedDate.getTime() <= comparedDate.getTime();
                break;
            case "between":
                bShow = (selectedDate.getTime() > comparedDate.getTime()) && (selectedDate < betweenEndDate.getTime());
                break;
        }

        return bShow;
    }

    $scope.getRelativeDate = function (value, offsetValue) {
        var relativeDate = new Date();
        var currentDate = new Date();
        var quarter = Math.round((currentDate.getMonth() - 1) / 3 + 1);

        switch (value.toLowerCase()) {
            case "tomorrow":
            case "daysfromnow":
                relativeDate.setDate(currentDate.getDate() + offsetValue);
                break;
            case "yesterday":
            case "daysago":
                relativeDate.setDate(currentDate.getDate() - offsetValue);
                break;
            case "monthsfromnow":
                relativeDate.setMonth(currentDate.getMonth() + offsetValue);
                break;
            case "monthsago":
                relativeDate.setMonth(currentDate.getMonth() - offsetValue);
                break;
            case "yearsfromnow":
                relativeDate.setFullYear(currentDate.getFullYear() + offsetValue);
                break;
            case "yearsago":
                relativeDate.setFullYear(currentDate.getFullYear() - offsetValue);
                break;
            case "firstdayofmonth":
                relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                break;
            case "lastdayofmonth":
                relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                break;
            case "firstdayofyear":
                relativeDate = new Date(currentDate.getFullYear(), 0, 1);
                break;
            case "lastdayofyear":
                relativeDate = new Date(currentDate.getFullYear(), 11, 31);
                break;
            case "firstdayofquarter":
                relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 2)-1), 1);
                break;
            case "lastdayofquarter":
                relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 1)+1), 0);
                break;
            default:
                break;
        }

        relativeDate.setHours(0, 0, 0, 0);
        return relativeDate;
    }

    //method to check on regex match
    $scope.regexCheck = function (value, pattern) {
        var regex;
        var regParts = pattern.trim().match(/^\/(.*?)\/([gim]*)$/);
      
        if (regParts) {
            // the parsed pattern had delimiters and modifiers. 
            regex = new RegExp(regParts[1], regParts[2]);
        } else {
            // we got pattern string without delimiters
            regex = new RegExp(pattern);
        }

        return regex.test(value);
    }

    //method to check on query results
    $scope.compareQueryResult = function (modelProp, operator, value, isProjection, classOrProjectionId, conditionId) {
        var bShow = false;
        var selectedValue = !_.isUndefined(modelProp) ? modelProp.split(',') : null;

        if (_.isUndefined($scope[conditionId])) $scope[conditionId] = "";


        if (operator == "advancequery") {
            if ($scope[conditionId]=="") {
                $scope[conditionId] = "true";


                $.ajax({
                    type: 'POST',
                    dataType: 'JSON',
                    url: "/SC/ServiceCatalog/GetItemIdListAdvanceQuery",
                    data: { isProjection: isProjection, classOrProjectionId: classOrProjectionId, criteria: value },
                    success: function (data, status, xhr) {
                        $scope[conditionId] = data.data;
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    },
                    async: false
                });


            }

            var valueToCompare = $scope[conditionId].split(",");
            bShow = (_.intersection(valueToCompare, selectedValue)).length > 0;
        }
        else {
            var valueToCompare = value.split(',');
            


            //remain hidden if no item is selected
            if (selectedValue == null) {
                return false;
            }

            if (operator === "contains") {
                bShow = (_.intersection(valueToCompare, selectedValue)).length > 0;
            }
            else {
                bShow = _.isEqual(valueToCompare, selectedValue);
            }
        }
       

        return bShow;
    }

    $scope.isFirstPage = function () {
       return PageFactory.getCurrentPage() == 0;
    }

    $scope.compareString = function (model, operator, conditionValue) {
        var bResult;

        //the original value is encoded HTML, decode before comparing.
        const decodedConditionValue = new DOMParser().parseFromString(conditionValue, 'text/html').querySelector('html').textContent;
        switch (operator) {
            case "contains":
                bResult = (model != null) && (model.indexOf(decodedConditionValue) > -1);
                break;
            case "regex":
                bResult = (model != null) && ($scope.regexCheck(model, decodedConditionValue));
                break;
            case "!=":
                bResult = (model != null) && (model != decodedConditionValue);
                break;
            case "==":
            default:
                bResult = (model != null) && (model == decodedConditionValue);
                break;
        }
        return bResult;
    }
});

roApp.controller("PageController", function ($scope, $element, PageFactory) {
    var currentIndex = -1;

    $scope.nextEnabled = true;
    $scope.previousEnabled = false;

    $scope.previousText = localization.Previous;
    $scope.nextText = localization.Next;
    $scope.currentIndex = 0;
   
    //move to next page
    $scope.next = function () {
        if (($scope.pageCount === 0) || (currentIndex == ($scope.pageCount - 1))) {
            return;
        }
        
        $scope.currentIndex++;
        this.setButtons();
    };

    //move to previous page
    $scope.previous = function () {
        if (($scope.pageCount === 0) || (currentIndex === 0)) {
            return;
        }
        
        $scope.currentIndex--;
        this.setButtons();
    };

    //disable or enable prev/next button
    $scope.setButtons = function () {
        var currentIndex = $scope.currentIndex;
        var pageLength = $scope.pageCount;
        
        if (currentIndex === 0 && pageLength == 0) { //single page only
            $scope.nextEnabled = false;
            $scope.previousEnabled = false;
        } else if (currentIndex === 0) { //when on first page
            $scope.nextEnabled = true;
            $scope.previousEnabled = false;
        } else if (currentIndex == pageLength - 1) { //when on last page
            $scope.nextEnabled = false;
            $scope.previousEnabled = true;
        } else {
            $scope.nextEnabled = true;
            $scope.previousEnabled = true;
        }
        PageFactory.setCurrentPage(currentIndex);
    };

    //count total number of pages
    $scope.getTotalPageCount = function() {
        var ul = angular.element($element).find("ul.form-wizard-levels");
        var pages = angular.element(ul).find("li").length; //this is looking up into the paging section
        return pages;
    }
    $scope.pageCount = $scope.getTotalPageCount();
    if ($scope.pageCount == 0) {
        $scope.setButtons();
    }
});

roApp.factory('PageFactory', function () {
    var factory = {
        currentPage: 0,
        setCurrentPage: function (index) {
            this.currentPage = index;
        },
        getCurrentPage: function () {
            return this.currentPage;
        }
    };
    return factory;
});

roApp.directive('onhide', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            scope.$watch(attrs.ngShow, function (value) {
                if (!value) {
                    //reset model values if it is hidden
                    var childInputs = element.find("input");
                    angular.forEach(childInputs, function (input) {
                        if (input.hasAttribute('ng-model')) {
                            var ngModel = input.getAttribute('ng-model');
                            $parse(ngModel).assign(scope, null);
                        }
                    });
                    
                    //update grid ui
                    var grids = element.find("table");
                    angular.forEach(grids, function (grid) {
                        if (grid) {
                            $(grid).find('.k-state-selected').each(function () {
                                $(this).removeClass("k-state-selected");
                            });
                        }
                    });

                    //update input ui
                    var inputElem = element.find(".k-input");
                    if (inputElem.length > 0) {
                        var input = $(inputElem)[0];
                        var inputDefaultHolder = $(input).closest("div").find("input").first();
                        var defaultValue = $(inputDefaultHolder).attr('data-default-value') || null;
                        (input.nodeName.toLowerCase() == "span") ? $(input).html(defaultValue) : $(input).val(defaultValue);
                        $(inputDefaultHolder).val("");
                    }

                    //update textarea ui
                    var textAreas = element.find("textarea");
                    angular.forEach(textAreas, function (textArea) {
                        $(textArea).val("");
                    });
                } else {

                    //Fix BUG 21350: ARO: Logic issue on hidden controls
                    //reset model value from null to init value if it is now shown after being hidden
                    var childInputs = element.find("input");
                    angular.forEach(childInputs, function (input) {
                        if (input.hasAttribute('ng-model') && input.hasAttribute('ng-init')) {
                            var ngModel = input.getAttribute('ng-model');
                            var init = input.getAttribute('ng-init').split('=');
                            if (init.length === 2) {
                                var initModel = init[0];


                                //Fixed bug 22458, 22890, 22855
                                //Make sure init returns the correct value.
                                var initVal = scope[initModel.split('.')[0]].value;
                                if (_.isNull(initVal)) {
                                    initVal = init[1].toLowerCase() === 'true' || (init[1].toLowerCase() === 'false' ? false : init[1]);
                                    if (typeof initVal === "string" && initVal.charAt(0) === "'" && initVal.charAt(initVal.length - 1) === "'") {
                                        initVal = initVal.substring(1, initVal.length - 1);
                                    }
                                }

                                initVal = initVal == "null" ? null : initVal;
                                if (ngModel === initModel)
                                    $parse(ngModel).assign(scope, initVal);

                            }
                            
                        }
                    });
                }
            });
        }
    }
}]);