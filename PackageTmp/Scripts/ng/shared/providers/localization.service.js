/* global define: true */
/* global localization:true */

(function () {

    'use strict';

    define([
        'app'
    ], function (app) {

        app.provider('LocalizationService', [LocalizationService]);

        function LocalizationService() {

            this.$get = function ($http, $q) {
                var service = {
                    getValue: function (key) {
                        //*localization* exists in the global space, apart from angular 
                        //if the value is found, return it; otherwise return the key,
                        //so at least something meaninful can be displayed
                        var value;
                        if (localization[key]) {
                            value = localization[key];
                        } else {
                            value = key;
                            // $log.info('No localization value found for:', key);
                        }

                        return value;
                    },
                    getKendoMessageUrl: function () {
                        var deferred = $q.defer();
                        $http.get("/Localizations/GetCurrentKendoCulture")
                            .then(function (response) {
                                var url = "/Scripts/kendo/2020.3.1118/messages/kendo.messages." + response.data + ".min.js"
                                deferred.resolve(url);
                            }, function () {
                                notificationService.addError("Could not retrieve culture info");
                            });
                        return deferred.promise;
                    },
                    saveLocalizations: function (localizationModels, callBack) {
                        
                        $.ajax({
                            url: "/Localizations/UpdateLocalizations",
                            type: 'POST',
                            data: { models: localizationModels },
                            async: true
                        }).done(function (data) {
                            _.each(localizationModels, function (local) {
                                if (session.user.LanguageCode == local.Locale) { //This will going to update or add the localization
                                    localization[local.Key] = local.Translation;
                                }
                            });
                            
                            callBack();
                            
                        });
                    },

                    getAvailableLocale: function (key) {
                        var deferred = $q.defer();
                        var data = {
                            localizationKey: key
                        }
                        var config = {
                            params: data
                        }



                        $http.post("/Localizations/GetAvailableLocalization", { localizationKey: key })
                            .then(function (response) {
                                var elementId = key.split("_")[1];
                                var localizationList = [];
                                _.each(response.data, function (item) {
                                    if (item.Id == "00000000-0000-0000-0000-000000000000") {
                                        item.Id = elementId;
                                    }
                                    localizationList.push(item);
                                });
                                deferred.resolve(localizationList);
                            }, function () {
                                notificationService.addError("Could not retrieve locale info");
                            });
                        return deferred.promise;
                    },

                    getAvailableLocaleWaitAsync: function (key) {
                        var deferred = $q.defer();
                        var data = {
                            localizationKey: key
                        }
                        var config = {
                            params: data
                        }
                        var localizationList = [];
                        $.ajax({
                            type: 'POST',
                            dataType: 'json',
                            url: "/Localizations/GetAvailableLocalization",
                            data: { localizationKey: key },
                            success: function (data, status, xhr) {
                                var elementId = key.split("_")[1];

                                _.each(data, function (item) {
                                    if (item.Id == "00000000-0000-0000-0000-000000000000") {
                                        item.Id = elementId;
                                    }
                                    localizationList.push(item);
                                });
                            },
                            async: false
                        });


                        return localizationList;
                    }
                };

                return service;
            };
        }
    });

})();