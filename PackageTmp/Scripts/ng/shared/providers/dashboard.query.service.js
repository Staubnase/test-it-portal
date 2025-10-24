(function () {

    'use strict';

    define([
		'app'
    ], function (ngApp) {

        ngApp.factory('DashboardQueryService', ['$http', '$q', 'LocalizationService', 'notificationService', DashboardQueryService]);

        function DashboardQueryService($http, $q, localizationService, notificationService) {
            return {
                getDataSources: function () {
                    var deferred = $q.defer();
                    var data = {
                        onlyEnabled: true,
                        includeSealed: true
                    };

                    $.get("/DataSourceConfiguration/GetDataSources", data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDashboardQueries: function () {
                    var deferred = $q.defer();

                    $.get("/DashboardQuery/GetDashboardQueries", function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                saveQuery: function (model) {
                    var deferred = $q.defer();
                    $.post("/DashboardQuery/UpsertDashboardQuery", { model: JSON.stringify(model) }, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDataSourceObject: function (dSourceName) {
                    var deferred = $q.defer();

                    $.get("/DataSourceConfiguration/GetDataSourceByName", { name: dSourceName }, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDashboardQueryByName: function (dSourceName) {
                    var deferred = $q.defer();

                    $.get("/DashboardQuery/GetDashboardQueryByName", { name: dSourceName }, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDashboardQueryData: function(selectedQuery) {
                    var deferred = $q.defer();
                    var baseUrl = '/Dashboard/GetDashboardDataById/';
                    var data = {
                        queryId: selectedQuery.Id
                    }

                    //append date filter param
                    var url = app.lib.addUrlParam(baseUrl, "dateFilterType", (selectedQuery.DateFilterType || "NoFilter"));


                    //if available, append additional query params
                    if (!_.isUndefined(selectedQuery.Parameters) && !_.isNull(selectedQuery.Parameters)) {
                        var queryStringJSON = app.lib.getQueryParams();
                        var queryTokens = [];
                        
                        for (var i = 0; i < selectedQuery.Parameters.length; ++i) {
                            //get token key
                            var token = selectedQuery.Parameters[i].Key;

                            //get token value.
                            var tokenValue = selectedQuery.Parameters[i].Value;

                            //query string parameters take precedence over what is defined on the widget configuration
                            if (!_.isUndefined(queryStringJSON[token.toLowerCase()])) {
                                tokenValue = queryStringJSON[token.toLowerCase()];
                            }

                            queryTokens.push(encodeURIComponent(token) + '=' + encodeURIComponent(tokenValue));
                        }
                            
                        var urlParam = queryTokens.length > 0 ? queryTokens.join('&') : null;

                        if (!_.isNull(urlParam)) {
                            url = url + '&' + urlParam;
                        }
                    }

                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                }

            }
        }

    });

})();