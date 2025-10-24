/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function AdvancedCountDataService($http, $q, navigationNodeService, viewPanelService, dashboardQueryService) {
            return {
                getData: function (chartQuery, dataSource) {
                    var deferred = $q.defer();
                    var url = '/Dashboard/GetDashboardQueryData';
                    var data = { query: chartQuery }
                    var qry = chartQuery;

                    if (chartQuery) {
                        if (chartQuery.indexOf("@createdFilter") > -1) {
                            qry = chartQuery.replace(/@createdFilter/gi, "1=1");
                            data = { query: qry }
                        }
                        if (chartQuery.indexOf("@xdaysFilter") > -1) {
                            qry = chartQuery.replace(/@xdaysFilter/gi, "1=1");
                            data = { query: qry }
                        }

                        //append user section
                        if (chartQuery.indexOf("@UserId") > -1) {
                            var setUserId = "DECLARE @UserId as uniqueidentifier SET @UserId='" + session.user.Id + "' ";
                            var isScoped = "DECLARE @IsScoped as bit SET @IsScoped='" + (session.user.Security.IsWorkItemScoped ? 1 : 0) + "' ";

                            qry = setUserId.concat(qry);
                            qry = isScoped.concat(qry);

                            data = { query: qry }
                        }

                        //append language section
                        if (chartQuery.indexOf("@LanguageCode") > -1) {
                            var setUserLanguageCode = "DECLARE @LanguageCode as nvarchar(3) SET @LanguageCode='" + session.user.Preferences.LanguageCode.Id + "' ";
                            qry = setUserLanguageCode.concat(qry);
                            data = { query: qry }
                        }
                    }
                    if (dataSource) {
                        if (dataSource.length > 0) {
                            url = '/DataSourceConfiguration/GetDashboardQueryDataFromDataSource';
                            data.dataSource = dataSource;
                        }
                    }

                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getDashboardData: function (selectedQuery) {
                    var deferred = $q.defer();
                    var url = '/api/V3/Dashboard/GetDashboardDataById';
                    var data = {
                        queryId: selectedQuery.Id,
                        dateFilterType: selectedQuery.DateFilterType || "NoFilter"
                    }

                    $.getJSON(url, data, function (result) {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
            };
        }

        function AdvancedCountController($sce, $scope, config, countDataService, localizationService, dashboardQueryService) {
            config.count = config.count || 0;
            var vm = this;
            angular.extend(vm, {
                title: config.title,
                currentQuery: config.countQuery,
                dateOptions: ["NoFilter", "Yesterday", "ThisWeek", "ThisMonth", "ThisQuarter", "LastQuarter", "YTD", "LastYear"],
                dateSelected: localizationService.getValue('NoFilter'),
                selectDateOption: function (option) {
                    vm.dateSelected = localizationService.getValue(option);
                    if (config.countQuery.indexOf("@createdFilter") > -1 || config.countQuery.indexOf("@xdaysFilter") > -1) {
                        vm.currentQuery = vm.getFilterClause(option);
                    }
                    config.selectedQuery.DateFilterType = option;
                    vm.getCount();
                },
                getFilterClause: function (option) {
                    var dateField = "created";
                    var whereClause = ' DATEADD(dd, DATEDIFF(dd, 0, "' + dateField + '")+0, 0) ';
                    var min = "GETDATE()";
                    var max = "GETDATE()";
                    var qry = config.countQuery;
                    switch (option) {
                        case vm.dateOptions[1]:
                            whereClause += '= convert(varchar(10), GETDATE()-1, 120) ';
                            break;
                        case vm.dateOptions[2]:
                            min = "DATEADD(wk,DATEDIFF(wk,0,GETDATE()),0)";
                            max = "DATEADD(wk,DATEDIFF(wk,0,GETDATE()),6) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        case vm.dateOptions[3]:
                            min = "DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0)";
                            max = "DATEADD(ms,- 3,DATEADD(mm,0,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+1,0))) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        case vm.dateOptions[4]:
                            min = "DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0)";
                            max = "DATEADD (dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) +1, 0)) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        case vm.dateOptions[5]:
                            min = "DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) - 1, 0)";
                            max = "DATEADD(dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0)) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        case vm.dateOptions[6]:
                            min = "DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0)";
                            max = "DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE())+1,0))) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        case vm.dateOptions[7]:
                            min = "DATEADD(yy,-1,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))";
                            max = "DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))) ";
                            whereClause += 'between ' + min + '  and ' + max;
                            break;
                        default:
                            min = 0;
                            whereClause = '1=1';

                    }

                    if (qry.indexOf("@xdaysFilter") > -1) {
                        var xdays = ' DATEADD(dd, DATEDIFF(dd, 0, "' + dateField + '")+0, 0) ' + "< "+ min;
                        qry = qry.replace(/@xdaysFilter/gi, xdays);
                    }
                    return qry.replace(/@createdFilter/gi, whereClause);
                },
                getCount: function () {
                    
                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            vm.setCountValue(data);
                        });
                    } else {
                        countDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                            vm.setCountValue(data);
                        });
                    }
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                setCountValue: function (data) {
                    var value = _.values(data[0])[0];

                    //Make sure that the value return is number.
                    if (!_.isNaN(value / 2) && !_.isUndefined(value) && !_.isNull(value)) {
                        config.count = value;
                    } 
                }
            });

            if (config.selectedQuery || config.countQuery) {

                //Filter Control is not part of configuration and so not saved, always default to NoFilter on refresh/reset
                if (vm.dateSelected === localizationService.getValue("NoFilter") && (!_.isUndefined(config.selectedQuery) && !_.isUndefined(config.selectedQuery.DateFilterType) && config.selectedQuery.DateFilterType !== "NoFilter")) {
                    config.selectedQuery.DateFilterType = "NoFilter";
                }

                vm.getCount();
            }
        }

        function AdvancedCountEditController($sce, $scope, config, countDataService, localizationService, notificationService, dashboardQueryService) {
            $scope.config = angular.extend(config, {
                selectedQueryBuilder: config.selectedQueryBuilder || null,
                countQuery: config.countQuery || '',
                count: config.count || 0,
                enableScopingSelected: config.enableScopingSelected || false,
                dataSource: config.dataSource || null
        });

            var vm = this;
            angular.extend(vm, {
                dataSources: [],
                dataSource: config.dataSource || 'ServiceManagement',
                validateQuery: function (datasourceQuery) {
                    var isValid = true;
                    var message = '';

                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {

                        var invalid_words = ["delete", "exec", "insert", "update", "alter", "create", "drop", "truncate"];

                        var query = datasourceQuery.trim().toLowerCase();

                        var invalid_found = _.intersection(query.split(/[ ,]+/), invalid_words);

                        if (invalid_found.length > 0) {
                            isValid = false;
                            message = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                        } else {
                            var numericFunctions = ["count(", "count (", "avg(", "avg ("];
                            var functionFound = _.intersection(query.split(/[ ,]+/), numericFunctions);

                            if (functionFound.length > 0) {
                                isValid = false;
                                message = localizationHelper.localize('MissingCountFunction');
                            }
                        }

                    }

                    return { 'isValid': isValid, 'message': message };
                },
                getCount: function () {
                    return countDataService.getData(config.countQuery, config.dataSource).then(function (data) {
                        var value = _.values(data[0])[0];
                        if (!_.isUndefined(value) && !_.isNull(value)) {
                            config.count = value;
                        }else config.count = 0;
                    });
                },
                onQueryBuilderSelect: function () {
    
                    var validation = vm.validateQuery(config.countQuery);

                    if (validation.isValid) {
                        vm.displayError(false, '');
                        vm.getCount();
                        vm.onEnableScoping();
                    } else {
                        vm.displayError(true, validation.message);
                    }
                },
                onEnableScoping: function () {
                    var query = config.chartQuery || "";

                    if (!_.isNull(config.selectedQuery)) {
                        var item = _.find(vm.dsQueriesUnfiltered, function (x) { return x.Id == config.selectedQuery.Id; });
                        if (!_.isUndefined(item)) {
                            query = item.Query;
                        }
                    }
                    if (_.isUndefined(query) || _.isNull(query)) {
                        return;
                    }

                    if (query.indexOf("@createdFilter") == -1 && $scope.config.enableScopingSelected) {
                        vm.displayError(true, localizationHelper.localize('NoScopingParameter'));
                    } else {
                        vm.displayError(false, '');
                    }
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                displayError: function (show, message) {
                    if (show) {
                        vm.errorHandler = { 'show': true, 'message': message };
                        $('#saveAdfDialog').attr("disabled", "disabled");
                    } else {
                        vm.errorHandler = { 'show': false, 'message': '' };
                        $('#saveAdfDialog').removeAttr("disabled");
                    }
                },
                onDataSourceSelect: function () {
                    vm.getDashboardQueries();
                },
                getDashboardQueries: function () {
                    dashboardQueryService.getDashboardQueries().then(function (data) {
                        var dSource = config.dataSource || "ServiceManagement";
                        var queryList = [];
                        var filteredQueries = _.filter(data, function (item) {
                            return (item.Name != "" && item.DataSource.Name == dSource);
                        });

                        _.each(filteredQueries, function (item) {
                            queryList.push({
                                Id: item.Id,
                                Name: item.Name,
                                DataSource: { Id: item.DataSource.Id, Name: item.DataSource.Name },
                                Parameters:[]
                            });
                        });

                        vm.dsQueriesUnfiltered = data;
                        vm.dsQueries = queryList;

                        
                    });
                },
                dsQueriesUnfiltered:[],
                dsQueries: [],
                onQuerySelect: function () {
                    if (!_.isNull(config.selectedQuery)) {
                        vm.displayError(false, '');
                        vm.onEnableScoping();
                        vm.enableQueryParamOption();


                        //This is for bug-24522
                        //This will make sure that the new query will get the parameter
                        if (vm.dashboardQuery.model.IsNew) {
                            config.selectedQuery.Parameters = [];
                            var queryParamKeys = _.uniq(config.selectedQuery.Query.match(/{{([^}]+)}}/g));
                            _.each(queryParamKeys, function (key) {
                                config.selectedQuery.Parameters.push({ Key: key.replace('{{', '').replace('}}', ''), Value: null });
                            });
                        }
                    }
                },
                dashboardQuery: {
                    showCreateWindow: false,
                    formInvalid: false,
                    hasDuplicateName: false,
                    canSubmit: false,
                    model: null,
                    save: function () {
                        var dSourceName = config.dataSource || vm.dashboardQuery.model.DataSource.Name;
                        dashboardQueryService.getDataSourceObject(dSourceName).then(function (dSourceData) {
                            vm.dashboardQuery.model.DataSource = dSourceData[0];
                            dashboardQueryService.saveQuery(vm.dashboardQuery.model).then(function (result) {
                                if (result.success) {
                                    vm.onDataSourceSelect();
                                    vm.setSelectedQuery();
                                    vm.onQuerySelect();
                                    vm.dashboardQuery.close();
                                }
                            });
                        });
                    },
                    cancel: function () {
                        vm.dashboardQuery.close();
                    },
                    close: function () {
                        if (vm.dashboardQuery.windowType == "add") {
                            vm.dashboardQuery.model.Name = null;
                            vm.dashboardQuery.model.Query = null;
                        }
                        $scope.dashboardQueryWindow.close();
                    },
                    isNameValid: function () {
                        if (_.isNull(vm.dashboardQuery.model.Name)) {
                            vm.dashboardQuery.hasDuplicateName = false;
                        } else {
                            dashboardQueryService.getDashboardQueryByName(vm.dashboardQuery.model.Name).then(function (result) {
                                vm.dashboardQuery.hasDuplicateName = (result.length <= 0) ? false : true;;
                                vm.dashboardQuery.setCanSubmit();
                            });
                        }
                    },
                    setCanSubmit: function () {
                        vm.dashboardQuery.canSubmit = ((!_.isNull(vm.dashboardQuery.model.Name) && vm.dashboardQuery.hasDuplicateName == false) &&
                            (!_.isNull(vm.dashboardQuery.model.Name) && vm.validateQuery(vm.dashboardQuery.model.Query))) ? true : false;
                    },
                    open: function (mode) {
                        vm.dashboardQuery.windowType = mode;
                        switch (mode) {
                            case "add":
                                vm.dashboardQuery.model = {
                                    Id: app.lib.newGUID(),
                                    Name: null,
                                    DataSource: { Id: "0", Name: "ServiceManagement" },
                                    Query: null,
                                    IsNew: true
                                };
                                $scope.dashboardQueryWindow.title(localizationHelper.localize('AddNewDashboardQuery', 'New Dashboard Query'));
                                break;
                            case "edit":
                                var selectedItem = _.find(vm.dsQueriesUnfiltered, function (item) { return item.Id == config.selectedQuery.Id; });
                                if (!_.isUndefined(selectedItem) && !_.isNull(selectedItem)) {
                                    vm.dashboardQuery.model = selectedItem;
                                    vm.dashboardQuery.model.IsNew = false;
                                }
                                $scope.dashboardQueryWindow.title(localizationHelper.localize('EditDashboardQuery', 'Edit Dashboard Query'));
                                break;
                            default:
                                break;
                        }
                        vm.dashboardQuery.setCanSubmit();
                        $scope.dashboardQueryWindow.open();
                    },
                    editQueryWarning: localizationHelper.localize('EditQueryWarning', 'Modifying this query will affect all other dashboards that use this query.'),
                    windowType: null
                },
                setSelectedQuery: function () {
                    //assigning the model object directly to selectedQuery does not work. Have to specifically set each property
                    config.selectedQuery = {
                        Id: vm.dashboardQuery.model.Id,
                        Name: vm.dashboardQuery.model.Name,
                        DataSource: vm.dashboardQuery.model.DataSource,
                        Query: vm.dashboardQuery.model.Query,
                        Parameters:[]
                    }

                    //if old query config still exists, empty it out
                    if (!_.isUndefined(config.chartQuery) && !_.isNull(config.chartQuery)) {
                        config.chartQuery = '';
                    }
                },
                enableQueryParamOption: function () {
                    var selectedItem = _.find(vm.dsQueriesUnfiltered, function (item) { return !_.isUndefined(config.selectedQuery) && item.Id == config.selectedQuery.Id; });
                    if (!_.isUndefined(selectedItem)) {
                        config.selectedQuery.Parameters = [];
                        var queryParamKeys = _.uniq(selectedItem.Query.match(/{{([^}]+)}}/g));
                        _.each(queryParamKeys, function (key) {
                            config.selectedQuery.Parameters.push({ Key: key.replace('{{', '').replace('}}', ''), Value: null });
                        });
                    } else if (!_.isUndefined(config.selectedQuery) && !_.isUndefined(config.selectedQuery.Parameters) && config.selectedQuery.Parameters.length > 1) {
                        //ensure we save unique parameter token on config file 
                        config.selectedQuery.Parameters = _.uniq(config.selectedQuery.Parameters, false, function (p) { return p.Key; });
                    }
                }
            });

            //if old query config exists, convert it to the new way
            if (!_.isUndefined(config.chartQuery) && !_.isNull(config.chartQuery) && config.chartQuery != '') {
                if (_.isUndefined(config.selectedQuery) || _.isNull(config.selectedQuery)) {
                    vm.dashboardQuery.model = {
                        Id: app.lib.newGUID(),
                        Name: null,
                        DataSource: { Id: "0", Name: "ServiceManagement" },
                        Query: config.chartQuery,
                        IsNew: true,
                        Parameters:[]
                    };
                    vm.dashboardQuery.save();
                }
            }

            var validation = vm.validateQuery(config.countQuery);

            if (validation.isValid) {
                vm.displayError(false, '');
                vm.getCount();
                vm.enableQueryParamOption();
            } else {
                vm.displayError(true, validation.message);
            }
            
            dashboardQueryService.getDataSources().then(function (data) {
                vm.dataSources = data;
                var defaultVal = _.find(data, function (el) { return el.indexOf('ServiceManagement') != -1 });

                if (defaultVal && config.dataSource == null) vm.dataSource = defaultVal;

                vm.getDashboardQueries();
            });

        }

        angular.module('adf.widget.advanced.count', ['adf.provider'])
          .config(["dashboardProvider", function (dashboardProvider) {
              dashboardProvider
                .widget('advanced-count', {
                    title: localizationHelper.localize('AdfAdvancedCountWidgetTitle','SQL Count Widget'),
                    description: localizationHelper.localize('AdfAdvancedCountCountWidgetDescription', 'Add a count widget based on a SQL database query.'),
                    templateUrl: '{widgetsPath}/advanced-count/src/view.html',
                    controller: 'AdvancedCountController',
                    controllerAs: 'vm',
                    edit: {
                        controller: 'AdvancedCountEditController',
                        controllerAs: 'vm',
                        templateUrl: '{widgetsPath}/advanced-count/src/edit.html'
                    },
                    reload: true,
                    ordinal: 4
                });
          }])
          .factory('AdvancedCountDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'DashboardQueryService', AdvancedCountDataService])
          .controller('AdvancedCountController', ['$sce', '$scope', 'config', 'AdvancedCountDataService', 'LocalizationService', 'DashboardQueryService', AdvancedCountController])
          .controller('AdvancedCountEditController', ['$sce', '$scope', 'config', 'AdvancedCountDataService', 'LocalizationService', 'notificationService', 'DashboardQueryService', AdvancedCountEditController]);

        var editViewTemplate = [
        	"<form role=form>",
                "<div class=form-group>",
                    "<label for=query>{{ ::vm.localize('DataSource') }}</label>",
                    "<select id=dataSource ng-disabled=\"vm.dataSources.length == 0\" ng-options=\"q for q in vm.dataSources track by q\" ng-model=config.dataSource ng-change=vm.onDataSourceSelect() class=\"form-control input-sm\"></select>",
                "</div>",
                "<div class=form-group>",
        			"<label for=sqlquery>{{ ::vm.localize('QueryName') }}</label>",
                    "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
        			"<select id=sqlquery ng-options=\"c.Name for c in vm.dsQueries track by c.Id\" ng-model=config.selectedQuery ng-change=vm.onQuerySelect() class=\"form-control input-sm\"></select>",
                    "<a ng-click=\"vm.dashboardQuery.open('add')\">{{ ::vm.localize('CreateNewSQLQuery') }}</a> <span ng-show=\"(config.selectedQuery!=null)\"> | <a ng-click=\"vm.dashboardQuery.open('edit')\"> {{ ::vm.localize('EditSQLQuery') }}</a> </span>",
    			"</div>",
               "<div class=\"form-horizontal\">",
                    "<div class=form-group ng-if=\"config.selectedQuery.Parameters.length>0\">",
        			   "<ul id=\"param-content\"><li ng-repeat=\"param in config.selectedQuery.Parameters  track by $index\">",
                            "<div class=\"query-param\">",
                                "<label class=\"margin-l50\">{{param.Key}}</label>",
                            "</div>",
                            "<div class=\"col-sm-12 pad-bot-1\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
                        "</li></ul>",
    			    "</div>",
                "</div>",
                "<div class=form-group>",
                    "<div class=checkbox checkbox-inline>",
                        "<input type=checkbox ng-model=config.enableScopingSelected ng-change='vm.onEnableScoping()'>",
                        "<label class=\"control-label\" for=enableScoping ng-click='config.enableScopingSelected=!config.enableScopingSelected;vm.onEnableScoping()'>",
                             "{{ ::vm.localize('EnableChartScoping') }}",
                        "</label>",
                    "</div>",
    			"</div>",
    		"</form>",
            "<div createDashboardQuery></div>",
                "<div class=\"task-window cireson-window defined-form\" kendo-window=\"dashboardQueryWindow\" k-visible=\"vm.dashboardQuery.showCreateWindow\" k-width=\"550\" k-actions=\"[]\">",
                    "<div class=\"cireson-window--wrapper\">",
                        "<div class=\"cireson-window--body\">",
                            "<div class=\"alert alert-danger\" ng-show=\"vm.dashboardQuery.formInvalid\">{{ ::vm.localize('RequiredFieldsErrorMessage') }}</div>",
                            "<div class=\"form-group\">",
                                "<label class=\"control-label\" for=\"Name\">",
                                    "<span>{{ ::vm.localize('Name') }}</span>",
                                    " (<span>{{ ::vm.localize('Required') }}</span>)",
                                "</label>",
                            "<input type=\"text\" class=\"k-textbox form-control input-sm\" ng-model=\"vm.dashboardQuery.model.Name\" ng-blur=\"vm.dashboardQuery.isNameValid()\" required>",
                            "<p class=\"help-block\" ng-show= \"vm.dashboardQuery.hasDuplicateName\">{{ ::vm.localize('NameAlreadyExists') }}</p>",
                            "</div>",
                            "<div class=\"form-group\">",
                                 "<label class=\"control-label\" for=\"SQLQueryContent\">",
                                    "<span>{{ ::vm.localize('SQLQuery') }}</span>",
                                    " (<span>{{ ::vm.localize('Required') }}</span>)",
                                "</label>",
                                "<textarea class=\"k-textbox form-control input-sm textarea-resize-none\" rows=\"6\" ng-model=\"vm.dashboardQuery.model.Query\" ng-blur=\"vm.dashboardQuery.setCanSubmit()\" required></textarea>",
                                "<p class='help-block' style='color: red' ng-if='!vm.dashboardQuery.model.IsNew'>{{ vm.dashboardQuery.editQueryWarning }}</p>",
                            "</div>",
                            "<div class=\"cireson-window--footer window-buttons\">",
                                "<button type=\"button\" ng-click=\"vm.dashboardQuery.save()\" class=\"btn btn-primary k-button\" ng-disabled=\"!vm.dashboardQuery.canSubmit\">",
                                    "{{ ::vm.localize('Save') }}",
                                "</button>",
                                "<button type=\"button\" ng-click=\"vm.dashboardQuery.cancel()\" class=\"btn btn-default k-button\">",
                                    "{{ ::vm.localize('Cancel') }}",
                                "</button>",
                            "</div>",
                        "</div>",
                    "</div>",
                "</div>"
        ].join('');

        var mainViewTemplate = [
             "<div ng-show=\"config.enableScopingSelected\" class='dropdown pull-right'>",
                  "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                  "<ul class='dropdown-menu'>",
                       "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                  "</ul>",
            "</div>",
            "<div class=\"count-widget-container\">",
                 "<div class=\"content\">{{config.count}}</div>",
             "</div>"
        ].join('');

        angular.module("adf.widget.advanced.count").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/advanced-count/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/advanced-count/src/view.html", mainViewTemplate);
        }]);
    });
})();