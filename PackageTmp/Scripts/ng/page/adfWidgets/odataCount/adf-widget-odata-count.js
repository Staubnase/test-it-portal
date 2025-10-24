/* global define: true */
/* global _: true */

var var_languageField = "LanguageCode";
var lang = (session.user.LanguageCode) ? session.user.LanguageCode : 'ENU';

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function ODataCountController($sce, $scope, config, localizationService, gridConfigService) {
            $scope.config.count = config.count || 0;
            var vm = this;
            var doURL = config.given_url;

            if ($scope.config.gridCollection && $scope.config.gridCollection.length != 0) {
                if (doURL.charAt(doURL.length - 1) !== "/")
                    doURL += "/";
                doURL += $scope.config.gridCollection.field;
            }

            if (doURL) {

                var conString = config.queryString || '';

                if (conString.length > 0) {

                    var urlParams = app.lib.getQueryParams() || {};

                    _.each(config.queryParamKeys,
                        function (item) {
                            var itemKey = item.Key.toLowerCase();
                            if (urlParams.hasOwnProperty(itemKey))
                                conString = conString.replace("{{" + item.Key + "}}", urlParams[itemKey]);
                            else
                                conString = conString.replace("{{" + item.Key + "}}", item.Value);
                        });

                    if (conString.indexOf('@User') != -1) {
                        conString = conString.replace('@User', session.user.Id)
                    }

                    if (conString.indexOf('@Lang') != -1) {
                        conString = conString.replace('@Lang', lang)
                    }
                }

                var invalids = ["$top", "$count", "$format", "$sort"];

                for (var i in invalids) {
                    if (conString.indexOf(invalids[i]) > -1) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Warning,
                            message: localization.ODATAQueryInvalid
                        });
                        return;
                    }
                }

                if (config.filterByCurrentLang && config.showFilterLang) {

                    var langFilter = var_languageField + " eq '" + lang + "'";

                    if (conString.length > 0) {

                        var params = app.lib.getQueryParams(conString) || {};
                        var filterParams = params["$filter"] || "";

                        if (filterParams.length > 0) {
                            conString = "";
                            for (var key in params) {
                                var val = params[key];
                                if (key === "$filter")
                                    val = "(" + val + ") and " + langFilter;

                                conString += (conString.length > 0)
                                    ? "&" + key + "=" + val
                                    : "?" + key + "=" + val;
                            }
                        }

                    } else
                        conString += '?$filter=' + langFilter;
                }

                var extraParams = "$format=json&$top=0&$count=true";

                if (conString.length > 0) {
                    if (conString.indexOf("/Action.") > -1)
                        doURL += conString + '?' + extraParams;
                    else
                        doURL += conString + '&' + extraParams;
                } else
                    doURL += conString + '?' + extraParams;

                $.getJSON(doURL,
                    function (result) {
                        if (result['@odata.count'])
                            $scope.config.count = result['@odata.count'];
                        else
                            $scope.config.count = result.value.length;

                        $scope.$apply();

                    }).fail(function (err) {
                    $scope.config.count = 0;
                    $scope.$apply();
                    console.log(err);
                });
            }
        }

        function ODataCountEditController($sce, $scope, config, localizationService, notificationService) {

            $scope.config = angular.extend(config, {
                given_url: config.given_url || null,
                data_url: config.data_url || null,
                queryString: config.queryString || '',
                gridCollection: config.gridCollection || [],
                queryParamKeys: config.queryParamKeys || [],
                filterByCurrentLang: config.filterByCurrentLang || false,
                showFilterLang: config.showFilterLang || false
            });

            var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));
            //Add new parameters
            _.each(queryParamKeys,
                function (key) {

                    var token = key.replace('{{', '').replace('}}', '');

                    var exist = _.filter(config.queryParamKeys,
                        function (item) {
                            return item.Key === token;
                        });

                    if (exist.length === 0) {
                        config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                    }
                });

            var conString = config.queryString || '';

            if (conString.length > 0) {

                _.each(config.queryParamKeys,
                    function (item) {
                        conString = conString.replace("{{" + item.Key + "}}", item.Value);
                    });

                if (conString.indexOf('@User') != -1) {
                    conString = conString.replace('@User', session.user.Id)
                }

                if (conString.indexOf('@Lang') != -1) {
                    conString = conString.replace('@Lang', lang)
                }
            }

            var vm = this;
            angular.extend(vm, {
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                collections: [$scope.config.gridCollection] || [],
                languageCodeFilter: var_languageField + " eq '" + lang + "'",
                queryInvalid: function() {
                    var invalids = ["$top", "$count", "$format", "$sort"];

                    for (var i in invalids) {
                        if (config.queryString.indexOf(invalids[i]) > -1) {
                            $('#saveAdfDialog').attr("disabled", "disabled");
                            return true;
                        }
                    }
                    $('#saveAdfDialog').removeAttr("disabled");
                    return false;
                },
                setShowFilterLang: function (cols) {
                    if (cols)
                        config.showFilterLang = (cols[0][var_languageField] && config.queryString.indexOf(var_languageField) === -1);
                },
                getCollections: function (init) {
                    $('#collections').attr('disabled', true);

                    var url = config.given_url;
                    var doURL = config.given_url;

                    doURL += "?$format=json&$top=1&$count=true";

                    if (doURL) {
                        $.getJSON(doURL,
                        function (result) {
                            var data = result.value;
                            var sets = data || [];
                            var kind = (data[0]) ? data[0].kind : '';

                            if (kind == 'EntitySet') {
                                $('#collections').removeAttr("disabled");

                                for (var i in sets) {
                                    if (sets[i].name) {
                                        vm.collections.push({
                                            field: sets[i].name,
                                            title: sets[i].name
                                        });
                                    }
                                }

                                if ($scope.config.gridCollection.length != 0) {
                                    if (url.charAt(url.length - 1) !== "/")
                                        url += "/";
                                    url += $scope.config.gridCollection.field;
                                }

                                $scope.config.data_url = url;
                            } else {
                                $scope.config.gridCollection = [];
                                vm.dataOne = result.value;
                            }

                            if (!init) {
                                if (result['@odata.count'])
                                    config.count = result['@odata.count'];
                                else
                                    config.count = result.value.length;
                            }

                            vm.setShowFilterLang(vm.dataOne);

                            $scope.$apply();

                        }).fail(function (err) {
                            $scope.config.gridCollection = [];
                            console.log(err);
                        });

                    }
                },
                onCollectionsChange: function () {
                    var url = config.given_url;
                    if (url.charAt(url.length - 1) !== "/")
                        url += "/";
                    url += $scope.config.gridCollection.field;
                    vm.changeCollection(url);
                },
                changeCollection: function (url) {
                    
                    config.data_url = url;

                    if (url) {

                        var doURL = url;

                        if (config.queryString.indexOf("/Action.") > -1) {
                        }

                        var extraParams = "$format=json&$top=1&$count=true";

                        if (conString.length > 0) {
                            if (conString.indexOf("/Action.") > -1)
                                doURL += conString + '?' + extraParams;
                            else
                                doURL += conString + '&' + extraParams;
                        } else
                            doURL += conString + '?' + extraParams;

                        $.getJSON(doURL,
                        function (result) {
                            vm.dataOne = result.value;

                            if (result['@odata.count'])
                                config.count = result['@odata.count'];
                            else
                                config.count = result.value.length;
                            
                            vm.setShowFilterLang(vm.dataOne);

                            $scope.$apply();
                        }).fail(function (err) {
                            console.log(err);
                        });
                    }
                },
                onChangeQueryString: function () {
                    var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));

                    //Add new parameters
                    _.each(queryParamKeys,
                        function (key) {

                            var token = key.replace('{{', '').replace('}}', '');

                            var exist = _.filter(config.queryParamKeys,
                                function (item) {
                                    return item.Key === token;
                                });

                            if (exist.length === 0) {
                                config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                            }
                        });

                    //Delete unused parameters
                    var i = 0;
                    _.each(config.queryParamKeys,
                        function (item) {

                            var exist = _.filter(queryParamKeys,
                                function (key) {
                                    var token = key.replace('{{', '').replace('}}', '');
                                    return item.Key === token;
                                });

                            if (exist.length === 0)
                                config.queryParamKeys.splice(i, 1);

                            i++;
                        });
                    
                    vm.setShowFilterLang(vm.dataOne);
                }
            });

            vm.getCollections(true);
        }

        angular.module('adf.widget.odata.count', ['adf.provider'])
          .config(["dashboardProvider", function (dashboardProvider) {
              dashboardProvider
                .widget('odata-count', {
                    title: localizationHelper.localize('AdfODataCountWidgetTitle', 'OData Count Widget'), //localization key
                    description: localizationHelper.localize('AdfODataCountWidgetDescription', 'Add a count widget based on an OData End Point'), //localization key
                    templateUrl: '{widgetsPath}/odata-count/src/view.html',
                    controller: 'ODataCountController',
                    controllerAs: 'vm',
                    edit: {
                        templateUrl: '{widgetsPath}/odata-count/src/edit.html',
                        controller: 'ODataCountEditController',
                        controllerAs: 'vm'
                    },
                    reload: true,
                    ordinal: 9
                });
          }])
          .controller('ODataCountController', ['$sce', '$scope', 'config', 'LocalizationService', 'ODataGridConfigService', ODataCountController])
          .controller('ODataCountEditController', ['$sce', '$scope', 'config', 'LocalizationService', 'notificationService', ODataCountEditController]);

        var editViewTemplate = ["<form role=form><div class=form-group>",
                "<label for=url>{{ ::vm.localize('ODataEndPoint') }}</label>",
                "<input type=text id=url ng-model=\"config.given_url\" class=\"form-control input-sm\" ng-change=\"vm.getCollections()\" />",
                "</div><div class=form-group>",
                "<label for=collections>{{ ::vm.localize('ChooseCollection') }}</label>",
                "<select id=collections class=\"form-control input-sm\" ng-model=\"config.gridCollection\" ng-change=\"vm.onCollectionsChange()\" ng-options=\"c.title for c in vm.collections track by c.field\">",
                "</select>",
                "</div><div class=form-group>",
                "<label for=queryString>{{ ::vm.localize('QueryString') }}</label>",
                "<input type=text id=queryString ng-model=\"config.queryString\" class=\"form-control input-sm\" ng-change=\"vm.onChangeQueryString()\"/>",
                "<p class='help-block' style='color: red' ng-if=\"vm.queryInvalid()\">{{ ::vm.localize('ODATAQueryInvalid') }}</p>",
                "</div>",
                "<div class=\"form-horizontal\">",
                    "<div class=form-group ng-if=\"config.queryParamKeys.length>0\">",
                        "<ul id=\"param-content\"><li ng-repeat=\"param in config.queryParamKeys track by $index\">",
                            "<div class=\"query-param\">",
                                "<label class=\"margin-l50\">{{param.Key}}</label>",
                            "</div>",
                             "<div class=\"col-sm-12 pad-bot-1\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
                        "</li></ul>",
                    "</div>",
                "</div>",
                "<div class=form-group ng-if=\"config.showFilterLang\">",
                    "<div class=checkbox checkbox-inline>",
                        "<input id=filterByCurrentLang name=filterByCurrentLang type=checkbox ng-model=\"config.filterByCurrentLang\"/>",
                        "<label class=control-label for=filterByCurrentLang>",
                        "{{ ::vm.localize('FilterByLanguageOption') }}",
                        "</label>",
                        "<p class='help-block margin-l10'>i.e. {{vm.languageCodeFilter}}</p>",
                    "</div>",
                "</div>",
                "</form>"].join("");

        var mainViewTemplate = [
            "<div class=\"count-widget-container\">",
                 "<div class=\"content\">{{config.count}}</div>",
             "</div>"
        ].join('');

        angular.module("adf.widget.odata.count").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/odata-count/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/odata-count/src/view.html", mainViewTemplate);
        }]);
    });
})();