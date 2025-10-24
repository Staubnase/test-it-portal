/* global define: true */
/* global _:true */

(function () {

    'use strict';

    define([
        'app'
    ], function(app) {
        app.factory("SavedSearchService", ['$http', '$q', SavedSearchService]);

        function SavedSearchService($http, $q) {

            return {
                updateQueryWithRelativeValue: function (query) {
                    var me = this;
                    _.each(query, function (item) {
                        if (!_.isUndefined(item["criteriaRoot"]) && !_.isNull(item["criteriaRoot"])) {
                            if (!_.isUndefined(item["criteriaRoot"].items) && !_.isNull(item["criteriaRoot"].items)) {
                                _.each(item["criteriaRoot"].items, function(criteriaItem) {
                                    //if operator is the "me" option, set the value to the current user
                                    if (criteriaItem.operator == "isme" || criteriaItem.operator == "isnotme") {
                                        criteriaItem.value.userValue = { Id: session.user.Id, Name: session.user.Name };
                                    }

                                    //if relative date, update date/time accordingly
                                    if (!_.isUndefined(criteriaItem.value) && !_.isUndefined(criteriaItem.value.isRelative) && criteriaItem.value.isRelative == true) {
                                        var relativeType = criteriaItem.value.relativeDateValue;
                                        var offsetValue = criteriaItem.value.numericValue;
                                        var relativeDateTime = me.getRelativeDate(relativeType, offsetValue);

                                        /*
                                        - dateTimeValue is never displayed, variable only used for server search, so format does not need to conform with user specified
                                        - 'M/d/yyyy hh:mm:ss zzz' has to be retained as an accepted format for server search to function properly regardless of user datetime settings
                                        */

                                        criteriaItem.value.dateTimeValue = (new Date(relativeDateTime.setHours(0, 0, 0, 0))).toISOString();
                                       

                                        //for between date range, calculate relative end date value
                                        if (criteriaItem.operator == "between") {
                                            var relativeEndType = criteriaItem.value.relativeEndDateValue;
                                            var offsetEndValue = criteriaItem.value.numericEndValue;
                                            var relativeEndDateTime = me.getRelativeDate(relativeEndType, offsetEndValue);
                                            criteriaItem.value.endTimeValue = (new Date(relativeEndDateTime.setHours(0, 0, 0, 0))).toISOString();
                                        }
                                    }
                                });
                            }
                        }
                    });
                    return query;
                },
                getRelativeDate: function (relativeType, offsetValue) {

                    var relativeDate = new Date();
                    var currentDate = new Date();
                    var quarter = Math.round((currentDate.getMonth() - 1) / 3 + 1);

                    switch (relativeType) {
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
                            relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 2) - 1), 1);
                            break;
                        case "lastdayofquarter":
                            relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 1) + 1), 0);
                            break;
                        default:
                            break;
                    }
                    return relativeDate;
                }
            };
        }

    });
})();