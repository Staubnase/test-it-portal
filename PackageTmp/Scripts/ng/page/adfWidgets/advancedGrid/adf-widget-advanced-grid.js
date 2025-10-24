/* global define: true */
/* global _: true */

(function () {

    'use strict';

    define([
        'app'
    ], function ( /*app*/) {

        function AdvancedGridDataService($http, $q, navigationNodeService, viewPanelService, dashboardQueryService) {
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

        function AdvancedGridEditController($scope, config, advancedGridConfigService, advancedGridDataService, localizationService, dashboardQueryService) {

            $scope.config = angular.extend(config, {
                chartQuery: config.chartQuery || '',
                configurationName: "advancedChartConfig",
                enableScopingSelected: config.enableScopingSelected || false,
                dataSource: config.dataSource || null,
                gridColumns: []
            });

            var vm = this;
            angular.extend(vm, {
                dataSources: [],
                dataSource: config.dataSource || 'ServiceManagement',
                localize: function (key) {
                    return localizationService.getValue(key);
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
                onQueryBuilderSelect: function () {

                    if (vm.validateQuery(config.chartQuery)) {
                        vm.displayError(false, '');
                        vm.onEnableScoping();
                        vm.getGridData();
                    } else {
                        var errorMessage = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                        vm.displayError(true, errorMessage);
                    }
                },
                validateQuery: function (datasourceQuery) {
                    var isValid = true;

                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {

                        var invalid_words = ["delete", "exec", "insert", "update", "alter", "create", "drop", "truncate"];

                        var query = datasourceQuery.trim().toLowerCase();

                        var invalid_found = _.intersection(query.split(/[ ,]+/), invalid_words);

                        if (invalid_found.length > 0) isValid = false;
                    }

                    return isValid;
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
                                Parameters: []
                            });
                        });

                        vm.dsQueriesUnfiltered = data;
                        vm.dsQueries = queryList;

                    });
                },
                dsQueriesUnfiltered: [],
                dsQueries: [],
                onQuerySelect: function () {
                    if (!_.isNull(config.selectedQuery)) {
                        vm.displayError(false, '');
                        vm.onEnableScoping();
                        vm.enableQueryParamOption();
                        vm.getGridData();

                        //This is for bug-24522
                        //This will make sure that the new query will get the parameter
                        if (!_.isNull(vm.dashboardQuery.model) && vm.dashboardQuery.model.IsNew) {
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
                        Parameters: []
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
                },
                getGridData: function () {
                    var configName = config.configurationName || "advancedChartConfig";
                    vm.gridStateId = config.stateGuid;

                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            console.log(data)
                            vm.buildColumnTranslations(data);
                        });
                    } else {
                        advancedGridDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                            vm.buildColumnTranslations(data);
                        });
                    }
                },
                buildColumnTranslations: function (columnData) {
                    var columnKeys = _.keys(columnData[0]);
                    var keys = [];

                    for (var i in columnKeys) {
                        var item = columnKeys[i];

                        var locKey = $scope.config.stateGuid + "_col_" + item;
                        var localeItem = _.where(config.gridColumns, { localizationKey: locKey });

                        var localeModel = [];

                        if (localeItem.length <= 0) {
                            localeModel = {
                                field: item,
                                localizationKey: $scope.config.stateGuid + "_col_" + item,
                                translations: []
                            };
                        };
                        keys.push(locKey);

                        config.gridColumns.push(localeModel);

                    }


                    //Optimize the load query for bug 24546
                    localizationService.getAvailableLocale(keys.join()).then(function (localizations) {
                        for (var i in config.gridColumns) {
                            var localeModel = config.gridColumns[i];
                            var loc = _.filter(localizations, function (item) { return item.Key == localeModel.localizationKey; });
                            _.each(loc, function (localizationItem) {
                                if (localizationItem.Locale.toLowerCase() == "enu" && localizationItem.Translation == "") {
                                    localizationItem.Translation = localeModel.field;
                                }
                            });
                            localeModel.translations = loc;
                        }
                    });

                },
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
                        Parameters: []
                    };
                    vm.dashboardQuery.save();
                }
            }

            if (vm.validateQuery(config.chartQuery)) {
                vm.displayError(false, '');
                vm.enableQueryParamOption();
                vm.getGridData();
            } else {
                var errorMessage = localizationHelper.localize('InvalidSQLQueryMessage', 'Invalid SQL Query. Query should contain "SELECT" statements only.');
                vm.displayError(true, errorMessage);
            }

            dashboardQueryService.getDataSources().then(function (data) {
                vm.dataSources = data;
                var defaultVal = _.find(data, function (el) { return el.indexOf('ServiceManagement') != -1 });

                if (defaultVal && config.dataSource == null) vm.dataSource = defaultVal;

                vm.getDashboardQueries();
            });
        }

        function AdvancedGridController($scope, config, advancedGridConfigService, advancedGridDataService, localizationService, dashboardQueryService) {
            $scope.stateGuid = config.stateGuid;
            $scope.$on("kendoWidgetCreated", function (event, widget) {
                if (widget === event.currentScope.grid) {
                    var gridId = event.currentScope.stateGuid;
                    var currentState = app.gridUtils.savedState.getCurrentState(gridId);

                    if (currentState) {
                        if (currentState.columns.length > 0) {
                            widget.dataSource.group(currentState.group);

                            if (!_.isUndefined(widget.dataSource.pageSize())) {
                                widget.dataSource.pageSize(currentState.pageSize);
                            }

                            if (!_.isUndefined(widget.dataSource.page())) {
                                widget.dataSource.page(currentState.page);
                            }

                            widget.dataSource.sort(currentState.sort);
                            widget.dataSource.filter(currentState.filter);
                        }
                    }

                    $('.clear-filters-' + gridId).on('click', function () {
                        app.gridUtils.savedState.removeSavedState(gridId);
                        vm.getGridOptions();
                        document.location.reload(false);
                    });
                }

                widget.bind("columnResize", function (e) {
                    vm.onColumnChange(e);
                });

                widget.bind("dataBinding", function (e) {
                    vm.onColumnChange(e);
                });

                widget.bind("group", function (e) {
                    vm.onColumnChange(e);
                });

                widget.bind("filter", function (e) {
                    vm.onColumnChange(e);
                });

                widget.bind("sort", function (e) {
                    vm.onColumnChange(e);
                });

                widget.bind("columnReorder", function (e) {
                    vm.onColumnChange(e);
                });
                
                
                

                if (!_.isUndefined(widget.pager)) {
                    var pageSizesDdl = $(widget.pager.element).find("[data-role='dropdownlist']").data("kendoDropDownList");
                    pageSizesDdl.bind("change", function (e) {
                        var gridId = widget.$angular_scope.stateGuid;
                        var grid = widget;
                        _.defer(function () {
                            app.gridUtils.saveColumnState(gridId, grid, false, e);
                        });
                    });
                }
            });
            var vm = this;
            angular.extend(vm, {
                gridOptions: null,
                currentQuery: config.chartQuery,
                dateOptions: ["NoFilter", "Yesterday", "ThisWeek", "ThisMonth", "ThisQuarter", "LastQuarter", "YTD", "LastYear"],
                dateSelected: localizationService.getValue('NoFilter'),
                selectDateOption: function (option) {
                    vm.dateSelected = localizationService.getValue(option);
                    if (config.chartQuery.indexOf("@createdFilter") > -1) {
                        vm.currentQuery = config.chartQuery.replace(/@createdFilter/gi, vm.getFilterClause(option));
                    }
                    config.selectedQuery.DateFilterType = option;
                    vm.getGridOptions();
                },
                getFilterClause: function (option) {
                    var dateField = "created";
                    var whereClause = ' DATEADD(dd, DATEDIFF(dd, 0, "' + dateField + '")+0, 0) ';
                    switch (option) {
                        case vm.dateOptions[1]:
                            return whereClause + '= convert(varchar(10), GETDATE()-1, 120) ';
                            break;
                        case vm.dateOptions[2]:
                            return whereClause + 'between DATEADD(wk,DATEDIFF(wk,0,GETDATE()),0)  and  DATEADD(wk,DATEDIFF(wk,0,GETDATE()),6) ';
                            break;
                        case vm.dateOptions[3]:
                            return whereClause + 'between DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0) and DATEADD(ms,- 3,DATEADD(mm,0,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[4]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0) and DATEADD (dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) +1, 0)) ';
                            break;
                        case vm.dateOptions[5]:
                            return whereClause + 'between DATEADD(qq, DATEDIFF(qq, 0, GETDATE()) - 1, 0) and DATEADD(dd, -1, DATEADD(qq, DATEDIFF(qq, 0, GETDATE()), 0)) ';
                            break;
                        case vm.dateOptions[6]:
                            return whereClause + 'between DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0)  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE())+1,0))) ';
                            break;
                        case vm.dateOptions[7]:
                            return whereClause + 'between DATEADD(yy,-1,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))  and DATEADD(ms,-3,DATEADD(yy,0,DATEADD(yy,DATEDIFF(yy,0,GETDATE()),0))) ';
                            break;
                        default:
                            return whereClause = '1=1';

                    }
                },
                getGridOptions: function () {
                    var configName = config.configurationName || "advancedChartConfig";
                    vm.gridStateId = config.stateGuid;
                    advancedGridConfigService.getGridConfig(configName).then(function (response) {
                        vm.gridOptions = response;

                        if (config.selectedQuery) {
                            dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                                vm.buildColumns(data);
                            });
                        } else {
                            advancedGridDataService.getData(config.chartQuery, config.dataSource).then(function (data) {
                                vm.buildColumns(data);
                            });
                        }
                    });
                },
                onColumnChange: function (e) {
                    var gridId = this.gridStateId;
                    var grid = e.sender;
                    _.defer(function () {
                        app.gridUtils.saveColumnState(gridId, grid, false, e);
                    });

                },
                validateQuery: function (datasourceQuery) {
                    var isValid = true;
                    if (!_.isUndefined(datasourceQuery) && !_.isNull(datasourceQuery) && datasourceQuery != "") {
                        var query = datasourceQuery.trim().toLowerCase();

                        if (query.substring(0, 6) != "select") { isValid = false; }

                        if ((query.indexOf("delete ") > 0) || (query.indexOf(" delete") > 0)) { isValid = false; }
                        if ((query.indexOf("exec ") > 0) || (query.indexOf(" exec") > 0)) { isValid = false; }
                        if ((query.indexOf("insert ") > 0) || (query.indexOf(" insert") > 0)) { isValid = false; }
                        if ((query.indexOf("update ") > 0) || (query.indexOf(" update") > 0)) { isValid = false; }

                        if ((query.indexOf("alter ") > 0) || (query.indexOf(" alter") > 0)) { isValid = false; }
                        if ((query.indexOf("create ") > 0) || (query.indexOf(" create") > 0)) { isValid = false; }
                        if ((query.indexOf("drop ") > 0) || (query.indexOf(" drop") > 0)) { isValid = false; }
                        if ((query.indexOf("truncate table ") > 0) || (query.indexOf(" truncate table") > 0)) { isValid = false; }
                    }

                    return isValid;
                },
                openWorkItem: function (workitemId) {
                    $.ajax({
                        type: "GET",
                        url: "/Search/GetSearchObjectByWorkItemID",
                        data: { searchText: workitemId },
                        success: function (result) {
                            (result.search('loginForm') < 0) ?
                                location.href = result :
                                window.location = "/Login/Login?ReturnUrl=" + window.location.pathname; //redirect to login page if session expires.
                        }
                    });
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                buildColumns: function (data) {
                    //build out the grid's datasource 
                    vm.gridOptions.dataSource.data = data;

                    var dbColumns = [];
                    var currentState = app.gridUtils.savedState.getCurrentState(vm.gridStateId);

                    //if there is a savestate, use it else build out the columns based on the fields returned by the query
                    if (currentState && currentState.columns.length > 0) {

                        vm.gridOptions.columns = currentState.columns;
                    } else {
                        var idColumnName = null;
                        var guidColumnName = null;
                        var dataType = '';
                        var hasLink = true;
                        angular.forEach(_.keys(data[0]), function (item, index) {
                            var templ = "#= (" + item + ") ? " + item + " : '' #";
                            var val = data[0][item];
                            var valString = "";
                            if (!val) {
                                for (var i = 1; i < data.length; i++) {
                                    if (data[i][item]) {
                                        val = data[i][item];
                                        i = data.length
                                    }
                                }
                            }

                            //check if value is null, if not then convert to string to prevent  error in replace and regex methods
                            if (val) {
                                valString = val.toString();

                                //trim white spaces to prevent parsing strings ending with a number as date
                                valString = valString.replace(/\s+/, "");

                                //prevent parsing number objects and link strings as date 
                                if (Date.parse(valString) && /^\d+$/.test(valString) == false && parseFloat(valString)) {
                                    templ = "#= (" + item + ") ? kendo.toString(new Date(" + item + "), kendo.culture().calendar.patterns.g) : '' #";
                                    dataType = 'date';
                                } else if (parseFloat(val) && !isNaN(val) && typeof val === 'number') {
                                    templ = "#= (" + item + ") ? " + kendo.toString(item, 'n') + " : 0 #";
                                    dataType = 'number';
                                } else {
                                    dataType = 'string';
                                }
                            }

                            var isHidden = false;

                            if (item.toLowerCase() === "workitemid" || item.toLowerCase() === "id") {
                                idColumnName = item;
                            } else if (item.toLowerCase() === "guid") {
                                guidColumnName = item;
                                isHidden = true;
                            }

                            if (index === 0 || index === 1) {
                                if (!_.isNull(idColumnName)) {
                                    templ = "<a href='/Search/RedirectToWorkItem?searchText=#:" + idColumnName + "#''>" + templ + "</a>"; //append the workitem id value
                                } else if (!_.isNull(guidColumnName)) {
                                    templ = "<a href='/DynamicData/Edit/#:" + guidColumnName + "#''>" + templ + "</a>";
                                } else {
                                    hasLink = false;
                                }
                            }

                            var locKey = $scope.config.stateGuid + "_col_" + item;
                            var localizedTitle = localizationHelper.localize(locKey, locKey);

                            var columnConfig = {
                                field: item,
                                title: (localizedTitle != locKey) ? localizedTitle : localizationHelper.localize(item, item),
                                attributes: {
                                    "class": (index == 0 && hasLink) ? "grid-highlight-column" : (index == 1 && hasLink) ? "grid-highlight-column grid-highlight-column-title" : ""
                                },
                                template: templ,
                                hidden: isHidden,
                                DataType: dataType
                            };

                            if (item.toLowerCase() === "workitemid" || item.toLowerCase() === "id") {
                                //Fix BUG 23713: SQL Widgets do not sort WorkItemId in Numeric Order
                                //Custom Sort: sort alphanumeric WorkItemId in numeric order

                                columnConfig = angular.extend(columnConfig, {
                                    sortable: {
                                        compare: function (a, b) {
                                            return app.lib.sortAlphanumeric(a[item].toString(), b[item].toString());
                                        }
                                    }
                                });
                            }

                            dbColumns.push(columnConfig);
                        });
                        vm.gridOptions.columns = dbColumns;

                        
                    }

                    var fields = {};
                    angular.forEach(vm.gridOptions.columns,
                        function (item) {
                            if (item.DataType == "date") {
                                fields[item.field] = {
                                    type: item.DataType,
                                    parse: function (date) {
                                        if (_.isNull(date) || _.isUndefined(date)) {
                                            return '';
                                        } else {
                                            return new Date(date.toString().split('.')[0].concat('Z'));
                                        }
                                    }
                                };
                            } else
                                fields[item.field] = { type: item.DataType };

                        });

                    vm.gridOptions.dataSource.schema = {
                        model: {
                            id: "id",
                            fields: fields
                        }
                    }

                }
            });

            if (config.selectedQuery || config.chartQuery) {

                //Filter Control is not part of configuration and so not saved, always default to NoFilter on refresh/reset
                if (vm.dateSelected === localizationService.getValue("NoFilter") && (!_.isUndefined(config.selectedQuery) && !_.isUndefined(config.selectedQuery.DateFilterType) && config.selectedQuery.DateFilterType !== "NoFilter")) {
                    config.selectedQuery.DateFilterType = "NoFilter";
                }

                localizationService.getKendoMessageUrl().then(function (kendoMessageUrl) {
                    $.getScript(kendoMessageUrl,
                        function () {
                            vm.getGridOptions();
                        });
                });
            }

        }

        angular.module('adf.widget.advanced.grid', ['adf.provider'])
            .config(["dashboardProvider", function (dashboardProvider) {
                dashboardProvider
                    .widget('advanced-grid', {
                        title: localizationHelper.localize('AdfAdvancedTableWidgetTitle', 'Advanced SQL Table Widget'), //localization key
                        description: localizationHelper.localize('AdfAdvancedTableWidgetDescription', 'Add a table based on a SQL database query'), //localization key
                        templateUrl: '{widgetsPath}/advanced-grid/src/view.html',
                        controller: 'AdvancedGridController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/advanced-grid/src/edit.html',
                            controller: 'AdvancedGridEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 5
                    });
            }])
            .factory('AdvancedGridDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'DashboardQueryService', AdvancedGridDataService])
            .controller('AdvancedGridController', ['$scope', 'config', 'AdvancedGridConfigService', 'AdvancedGridDataService', 'LocalizationService', 'DashboardQueryService', AdvancedGridController])
            .controller('AdvancedGridEditController', ['$scope', 'config', 'AdvancedGridConfigService', 'AdvancedGridDataService', 'LocalizationService', 'DashboardQueryService', AdvancedGridEditController]);

        angular.module("adf.widget.advanced.grid").run(["$templateCache", function ($templateCache) {

            var editTemplate = [
                "<form role=form>",
                "<div class=form-group>",
                "<label for=query>{{ ::vm.localize('DataSource') }}</label>",
                "<select id=dataSource ng-disabled=\"vm.dataSources.length == 0\" ng-options=\"q for q in vm.dataSources track by q\" ng-model=config.dataSource ng-change=vm.onDataSourceSelect() class=\"form-control input-sm\"></select>",
                "</div>",
                "<div class=form-group>",
                "<label for=sqlquery>{{ ::vm.localize('QueryName') }}</label>",
                "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
                "<select id=sqlquery ng-options=\"c.Name for c in vm.dsQueries track by c.Id\" ng-model=config.selectedQuery ng-change=vm.onQuerySelect() class=\"form-control input-sm\"></select>",
                "<a ng-click=\"vm.dashboardQuery.open('add')\">{{ ::vm.localize('CreateNewSQLQuery') }}</a> <span ng-show=\"(config.selectedQuery!=null)\"> | <a ng-click=\"vm.dashboardQuery.open('edit')\"> {{ ::vm.localize('EditSQLQuery') }}</a> |  <a ng-click=\"config.isSetColumnTranslation = !config.isSetColumnTranslation;\">{{ ::vm.localize('EnterColumnTranslations') }}</a></span>",
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

                "<div class=\"modal-showtranslation\" ng-if=\"config.isSetColumnTranslation\">",
                "<div>",
                "<table>",
                "<tr ng-repeat=\"c in config.gridColumns\">",
                "<td>",
                "<label style=\"word-break: break-all\">",
                "<i class=\"fa fa-plus-circle\" ng-show=\"!c.showTranslation\" ng-click=\"c.showTranslation = !c.showTranslation;\" ></i>",
                "<i class=\"fa fa-minus-circle\" ng-show=\"c.showTranslation\" ng-click=\"c.showTranslation = !c.showTranslation;\" ></i>  {{ c.field }} ",
                "</label>",
                "<table ng-if=\"c.showTranslation\">",
                "<tr ng-repeat=\"t in c.translations\">",
                "<td>{{t.Locale}}</td>",
                "<td><input ng-model=\"t.Translation\"/></td>",
                "</tr>",
                "</table>",
                "</td>",
                "</tr>",
                "</table>",
                "</div>",
                "</div>",

                "<div class=form-group>",
                "<div class=checkbox checkbox-inline>",
                "<input type=checkbox ng-model='config.enableScopingSelected' ng-change='vm.onEnableScoping()'/>",
                "<label class=control-label for=enableScoping ng-click='config.enableScopingSelected = !config.enableScopingSelected;vm.onEnableScoping()'>",
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

            $templateCache.put("{widgetsPath}/advanced-grid/src/edit.html", editTemplate);

            var viewTemplate = [

                "<div class=\"clearfix\">",
                "<div class=\"pull-right\">",
                "<div ng-show=\"config.enableScopingSelected\" class='dropdown margin-t10 pull-left'>",
                "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='dropToggle'>{{vm.dateSelected}} <span class='caret'></span></button>",
                "<ul class='dropdown-menu'>",
                "<li ng-repeat='option in vm.dateOptions' ng-click='vm.selectDateOption(option)'><a href='#'>{{::vm.localize(option)}}</a></li>",
                "</ul>",
                "</div>",
                "<a class=\"margin-l10 margin-t10 btn clear-filters-{{vm.gridStateId}}\">" + localization.ResetState + "</a>",
                "</div>",
                "</div>",
                "<div adf-grid-state-id={{vm.gridStateId}} ",
                "kendo-grid=grid k-options=vm.gridOptions k-rebind=vm.gridOptions >",
                "</div>"
            ].join("");
            $templateCache.put("{widgetsPath}/advanced-grid/src/view.html", viewTemplate);
        }]);
    });
})();