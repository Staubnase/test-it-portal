/* global define: true */
/* global _: true */

(function () {

    'use strict';

    define([
        'app'
    ], function ( /*app*/) {

        function AdvancedCalendarDataService($http, $q, navigationNodeService, viewPanelService, dashboardQueryService) {
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
                }
            };
        }

        function AdvancedCalendarEditController($scope, config, advancedCalendarConfigService, advancedCalendarDataService, localizationService, dashboardQueryService) {

            $scope.config = angular.extend(config, {
                chartQuery: config.chartQuery || '',
                configurationName: "advancedChartConfig",
                enableScopingSelected: config.enableScopingSelected || false,
                dataSource: config.dataSource || null,
                selectedStartDateProperty: config.selectedStartDateProperty || null,
                selectedEndDateProperty: config.selectedEndDateProperty || null,
                filterByProperty: config.filterByProperty || null,
                eventColor: config.eventColor || [],
                
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
                getQueryProperties: function () {
                    if (config.selectedQuery) {
                        dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                            vm.dsQueriesDateProperties = [];
                            vm.dsQueriesProperties = [];
                            vm.dataSourceData = data;

                            if (data.length > 0) {
                                var item = data[0];

                                for (var i in item) {
                                    if (item[i] == null) {
                                        item[i] = "";
                                    }
                                    var itemValue = item[i].toString();
                                    if (!_.isUndefined(itemValue) && !_.isNull(itemValue)) {
                                        if (!_.isNull(kendo.parseDate(itemValue))) {
                                            vm.dsQueriesDateProperties.unshift({ "property": i });
                                        }
                                    }
                                    vm.dsQueriesProperties.unshift({ "property": i });
                                }
                            }

                            if (vm.dsQueriesDateProperties.length <= 0) {
                                vm.dsQueriesDateProperties = vm.dsQueriesProperties;
                            }
                        });
                    }
                },
                onPropertySelect: function () {
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
                        vm.getQueryProperties();
                    });
                },
                dsQueriesUnfiltered: [],
                dsQueries: [],
                dsQueriesDateProperties: [],
                dsQueriesProperties: [],
                onQuerySelect: function () {
                    if (!_.isNull(config.selectedQuery)) {
                        vm.displayError(false, '');
                        vm.onEnableScoping();
                        vm.enableQueryParamOption();
                        vm.getQueryProperties();

                        

                    }
                },
                onUseWIURL: function () {
                    //alert("test");
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
                    var selectedItem = _.find(vm.dsQueriesUnfiltered, function (item) { return item.Id == config.selectedQuery.Id; });
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
                onFilterBySelect: function () {
                    vm.updateEventColors(true);
                },
                updateEventColors: function (bResetColors) {
                    if (!_.isUndefined(config.filterByProperty)) {
                        var seriesValues = _.pluck(vm.dataSourceData, config.filterByProperty.property);
                        var seriesDefaultColors = advancedCalendarConfigService.defaultChartSeriesColors;
                        if (bResetColors) config.eventColor = [];

                        _.each(seriesValues, function (item, i) {
                            var seriesItem = _.findWhere(config.eventColor, { value: item });
                            if (_.isUndefined(seriesItem)) {
                                config.eventColor.push({ text: item, value: item, key: seriesDefaultColors[i++ % seriesDefaultColors.length], IsActive:true })
                            }
                        });
                    }
                },
                dataSourceData: []
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

        function AdvancedCalendarController($scope, config, advancedCalendarConfigService, advancedCalendarDataService, localizationService, dashboardQueryService) {

            var items = null;

            $scope.today = new Date();
            $scope.events = [
            ];

            $scope.isDateExist = function (calDate, arrDate) {
                for (var i in arrDate) {
                    if (calDate == arrDate[i].date) {
                        return arrDate[i];
                    }
                }
            };


            if (config.selectedQuery) {
               
                dashboardQueryService.getDashboardQueryData(config.selectedQuery).then(function (data) {
                    //This will list all properties
                    var properties = [];

                    if (data.length > 0) {
                        var item = data[0];

                        for (var i in item) {
                            properties.unshift(i);
                        }
                    }

                    //This will create patterns for every token found
                    var regPatterns = [];
                    var workitemPropertyKey = "WorkItemID";
                    for (var i in properties) {
                        if (!_.isUndefined(config.navURL) && config.navURL.indexOf("{{" + properties[i] + "}}") >= 0) {
                            regPatterns.unshift({ property: properties[i], pattern: "\\{\\{" + properties[i] + "\\}\\}" });
                        }
                        
                        if (properties[i].toLowerCase() == "workitemid") {
                            workitemPropertyKey = properties[i];
                        }
                    }

                    for (var i in data) {
                        if (_.isUndefined(config.selectedStartDateProperty)) {
                            config.selectedStartDateProperty = "";
                        }
                        if (_.isUndefined(config.selectedEndDateProperty)) {
                            config.selectedStartDateProperty = "";
                        }
                        if (_.isUndefined(config.filterByProperty)) {
                            config.filterByProperty = "";
                        }

                        var startDateString = data[i][config.selectedStartDateProperty.property];
                        var endDateString = data[i][config.selectedEndDateProperty.property];

                        data[i]["start"] = new Date(startDateString);
                        data[i]["end"] = new Date(endDateString); 

                        if (_.isNull(data[i][config.selectedProperty.property])) {
                            data[i][config.selectedProperty.property] = "";
                        }

                        if (config.enableWIURL) {
                            //Determine if the return data is a valid work item to navigate
                            if (!_.isUndefined(data[i][workitemPropertyKey])) {
                                data[i]["SearchKey"] = data[i][workitemPropertyKey];
                            }
                            else {
                                data[i]["SearchKey"] = data[i][config.selectedProperty.property];
                            }
                        }
                        else {
                            //This will replace the token into correct value
                            var tempURL = config.navURL;
                            for (var pat in regPatterns) {
                                tempURL = tempURL.replace(new RegExp(regPatterns[pat].pattern, "g"), data[i][regPatterns[pat].property]);
                            }
                            data[i]["URL"] = tempURL;
                        }
                    }
                    
                    if (_.isUndefined($scope.config.businessHours)) {
                        $scope.config.businessHours = {
                            startTime: "8:00 AM",
                            endTime: "5:00 PM"
                        }
                    }

                    if (config.filterByProperty == null) {
                        config.filterByProperty = { property: "" }
                    }

                    var dateToday = kendo.toString(kendo.date.today(), 'd');
                    var businessStartHourString = dateToday + " " + $scope.config.businessHours.startTime;
                    var businessEndHourString = dateToday + " " + $scope.config.businessHours.endTime;
                   
                    $scope.schedulerOptions = {
                        date: new Date(),
                        height: 600,
                        views: [
                            "day",
                            "week",
                            { type: "month", selected: true },
                            "agenda"
                        ],
                        workDayStart: new Date(businessStartHourString),
                        workDayEnd: new Date(new Date(businessEndHourString).setHours(new Date(businessEndHourString).getHours() + 1)),
                        editable: false,
                        selectable: true,
                        dataSource: {
                            data: data,
                            schema: {
                                model: {
                                    fields: {
                                        title: { from: config.selectedProperty.property, defaultValue: "No title", validation: { required: true } },
                                        start: { type: "date", from: "start" },
                                        end: { type: "date", from: "end" },
                                        filterby: { from: config.filterByProperty.property },
                                        isAllDay: false
                                    }
                                }
                            }
                        },
                        dataBound: function (e) {
                            var scheduler = e.sender;
                            scheduler.wrapper.on("click", function (e) {
                                if (!_.isUndefined(scheduler._selection) && scheduler.data()) {
                                    if (scheduler._selection.events.length) {
                                        var clickedEl = _.filter(scheduler.data(),
                                            function (el) {
                                                return el.uid === scheduler._selection.events[0];
                                            });
                                        var selectedItem = clickedEl[0];
                                        if (selectedItem) {
                                            if (config.enableWIURL) {
                                                location.href = "/Search/RedirectToWorkItem?searchText=" + selectedItem["SearchKey"];
                                            }
                                            else {
                                                window.open(config.navURL, '_blank');
                                            }
                                        }
                                    }
                                }
                            });

                        },
                        //timezone: "Etc/UTC",
                        //resources: [
                        //    {
                        //        field: "filterby",
                        //        dataColorField: "key",
                        //        dataSource: config.eventColor
                        //    }
                        //]
                    };

                    if (config.eventColor) {
                        $scope.schedulerOptions.resources = [
                            {
                                field: "filterby",
                                dataColorField: "key",
                                dataSource: config.eventColor
                            }
                        ]
                    }
                });
                
            } 

            var vm = this;
            angular.extend(vm, {
                gridOptions: null,
                onFilterClick: function (dataItem) {
                    if (_.isUndefined(dataItem.IsActive)) {
                        dataItem.IsActive = true;
                    } else {
                        dataItem.IsActive = !dataItem.IsActive;
                    }

                    var filterData = [];
                    _.each(config.eventColor, function (item) {
                        if (_.isUndefined(item.IsActive)) {
                            item.IsActive = true;
                        }

                        if (item.IsActive)
                            filterData.push({ field: "filterby", operator: "contains", value: item.value });
                    });

                    var filter = {
                        logic: "or",
                        filters: filterData
                    };

                    var calendar = $("#advanceCalendar").data("kendoScheduler");
                    calendar.dataSource.filter(filter);
                    calendar.view(calendar.view().name);
                    
                    if (!dataItem.IsActive) {
                        dataItem.TextColor = "#808080";
                    } else {
                        dataItem.TextColor = "#008ed6";
                    }
                },
            });

           
        }

        angular.module('adf.widget.advanced.calendar', ['adf.provider'])
            .config(["dashboardProvider", function (dashboardProvider) {
                dashboardProvider
                    .widget('advanced-calendar', {
                        title: "SQL Calendar", //localizationHelper.localize('AdfAdvancedTableWidgetTitle', 'Advanced SQL Table Widget'), //localization key
                        description: localizationHelper.localize('AdfAdvancedTableWidgetDescription', 'Add a table based on a SQL database query'), //localization key
                        templateUrl: '{widgetsPath}/advanced-calendar/src/view.html',
                        controller: 'AdvancedCalendarController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/advanced-calendar/src/edit.html',
                            controller: 'AdvancedCalendarEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 5
                    });
            }])
            .factory('AdvancedCalendarDataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', 'DashboardQueryService', AdvancedCalendarDataService])
            .controller('AdvancedCalendarController', ['$scope', 'config', 'AdvancedCalendarConfigService', 'AdvancedCalendarDataService', 'LocalizationService', 'DashboardQueryService', AdvancedCalendarController])
            .controller('AdvancedCalendarEditController', ['$scope', 'config', 'AdvancedCalendarConfigService', 'AdvancedCalendarDataService', 'LocalizationService', 'DashboardQueryService', AdvancedCalendarEditController]);

        angular.module("adf.widget.advanced.calendar").run(["$templateCache", function ($templateCache) {
            
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
                    "<a ng-click=\"vm.dashboardQuery.open('add')\">{{ ::vm.localize('CreateNewSQLQuery') }}</a> <span ng-show=\"(config.selectedQuery!=null)\"> | <a ng-click=\"vm.dashboardQuery.open('edit')\"> {{ ::vm.localize('EditSQLQuery') }}</a> </span>",
    			"</div>",
                "<div class=\"form-horizontal\">",
                    "<div class=form-group ng-if=\"config.selectedQuery.Parameters.length>0\">",
        			   "<ul id=\"param-content\"><li ng-repeat=\"param in config.selectedQuery.Parameters  track by $index\">",
                            "<div class=\"query-param\">",
                                "<label class=\"col-sm-3 control-label\">{{param.Key}}</label>",
                                "<div class=\"col-sm-9\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
                            "</div>",
                        "</li></ul>",
    			    "</div>",
                "</div>",



                "<div class=form-group>",
                "<label for=title>{{ ::vm.localize('stringTitle') }}</label>",
                "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
                "<select id=title ng-options=\"c.property for c in vm.dsQueriesProperties track by c.property\" ng-model=config.selectedProperty ng-change=vm.onPropertySelect() class=\"form-control input-sm\"></select>",
                "</div>",

                "<div class=form-group>",
        			"<label for=startdate>{{ ::vm.localize('StartDate') }}</label>",
                    "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
        			"<select id=startdate ng-options=\"c.property for c in vm.dsQueriesDateProperties track by c.property\" ng-model=config.selectedStartDateProperty ng-change=vm.onPropertySelect() class=\"form-control input-sm\"></select>",
                "</div>",

                "<div class=form-group>",
                "<label for=enddate>{{ ::vm.localize('EndDate') }}</label>",
                "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
                "<select id=enddate ng-options=\"c.property for c in vm.dsQueriesDateProperties track by c.property\" ng-model=config.selectedEndDateProperty ng-change=vm.onPropertySelect() class=\"form-control input-sm\"></select>",
                "</div>",


                "<div class=form-group>",
                "<label for=urlink>{{ ::vm.localize('AppointmentLink') }}</label>",
                "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",

                "<div class=checkbox checkbox-inline>",
                "<input type=checkbox ng-model=config.enableWIURL ng-change='vm.onUseWIURL()'>",
                "<label class=\"control-label\" for=enableScoping ng-click='config.enableWIURL=!config.enableWIURL;vm.onUseWIURL()'>",
                "{{ ::vm.localize('UseWIURL') }}",
                "</label>",
                "</div>",

                "<label for=urlink>{{ ::vm.localize('URL') }}</label>",
                "<input type='text' id='sqlcalendarURL' ng-disabled='config.enableWIURL' ng-model='config.navURL' />",
                "</div>",

                "<div class='form-group'>",
                "<label for=urlink>{{ ::vm.localize('BusinessHours') }}</label>",
                "<input type='text' style='width: 20%' kendo-timepicker id='bStartHour' ng-model='config.businessHours.startTime' /> - ",
                "<input type='text' style='width: 20%' kendo-timepicker id='bEndHour' ng-model='config.businessHours.endTime' /> ",
                "</div>",

                "<div class=form-group>",
                "<label for=filterBy>{{ ::vm.localize('EventColorField') }}</label>",
                "<p class='help-block' style='color: red' ng-if='vm.errorHandler.show'>{{ vm.errorHandler.message }}</p>",
                "<select id=filterBy ng-options=\"c.property for c in vm.dsQueriesProperties track by c.property\" ng-model=config.filterByProperty ng-change=vm.onFilterBySelect() class=\"form-control input-sm\"></select>",
                "</div>",

                "<div class=form-group ng-if=\"config.eventColor.length>0\">",
                "<label>{{ ::vm.localize('EventColor') }}</label>",
                "<ul id=\"param-content\"><li ng-repeat=\"item in config.eventColor  track by $index\">",
                "<div class=\"query-param row\">",
                "<label class=\"col-sm-4\">{{item.text}}</label>",
                "<div class=\"col-sm-2\"><input kendo-color-picker  k-preview=\"true\" k-buttons=\"false\" k-clear-button=\"false\"  ng-model=item.key /></div>",
                "</div>",
                "</li></ul>",
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

            $templateCache.put("{widgetsPath}/advanced-calendar/src/edit.html", editTemplate);

            var viewTemplate = [
            "<div class=\"count-widget-container\">",
                "<div>",
                "<div><ul class='calendar-color-legend'>",
                    "<li ng-repeat='x in config.eventColor'>",
                        "<a  style='color:{{x.TextColor}}' ng-click=vm.onFilterClick(x)><span style='background-color:{{x.key}}'></span>{{x.text}}</a>",
                    "</li>",
                "</ul>",
                "<div>",
                    '<div id="advanceCalendar" kendo-scheduler k-options="schedulerOptions">',
                    "</div>",
                "</div>",
            "</div>"
            ].join("");
            $templateCache.put("{widgetsPath}/advanced-calendar/src/view.html", viewTemplate);
        }]);
    });
})();
