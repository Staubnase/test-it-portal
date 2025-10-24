/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define(['app'], function (ngApp) {

        ngApp.factory('ODataGridConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', ODataGridConfigService]);

        function ODataGridConfigService($http, $q, localizationService, notificationService) {

            var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/odataGrid/configFiles/';
            var JSON_FILE_EXT = '.js';
            var configMap = {};

            return {
                // getGridConfig: function(gridType) {
                // 	//NOTE: it is necessary to copy this object!
                // 	//if you do not, when the .dataSource is tacked on later
                // 	//by multiple grid controllers, only the last .dataSource
                // 	//will be bound to all grids (ie, all grids will display the same data)
                // 	var config = angular.copy(GRID_CONFIG[gridType]);
                // 	this.initConfigGridColumns(config);
                // 	return config;
                // },
                getConfigUrl: function (configName) {
                    var url = CONFIG_FILE_BASE_URL + configName + JSON_FILE_EXT;
                    return url;
                },
                getGridConfig: function (configName) {

                    var deferred = $q.defer();
                    var self = this;
                    // if (configMap[configName]) {
                    //     deferred.resolve(this.initConfig(configMap[configName]));
                    // } else {
                    var url = this.getConfigUrl(configName);
                    $http.get(url)
                        .then(function (response) {
                            var config = response.data;
                            config.dataSource.transport.read.beforeSend = function (e, request) {
                                var rewriteURL = self.rewriteFilterParams(request.url);
                                if (rewriteURL) request.url = rewriteURL;
                            };
                            configMap[configName] = config;
                            deferred.resolve(self.initConfig(config));
                        }, function () {
                            notificationService.addError("Could not retrieve config file");
                        });
                    // }

                    return deferred.promise;
                },
                rewriteFilterParams: function (original_url) {
                    var url = original_url;
                    var queryString = url.substr(url.indexOf('?'), url.length);
                    url = url.substr(0, url.indexOf('?')+1);
                    var params = this.getQueryParams(queryString)._wrapped || [];
                    var rewriteURL = url;
                    var filterCount = 0;
                    var filterStr = "$filter=";
                    var otherFiltersStr = "";
                    var topParam = _.find(params, function (item) {
                        return item[0] == "$top";
                    });
                    var bTopParamChange = false;

                    //exportToExcel fetchAll might return > 500 data, thus sets $top > 500
                    //if $top exceeds 500, do not set $top to avoid PlatformCache error ("The limit of '500' for Top query has been exceeded.")
                    if (!_.isUndefined(topParam)) {
                        if (topParam[1] > 500) {
                            params = _.filter(params, function (item) {
                                return item[0] !== "$top";
                            });
                            bTopParamChange = true;
                        }
                    }
                    
                    for (var i in params) {

                        if (params[i][0] == '$filter') {
                            filterStr += params[i][1] + ' and '
                            filterCount++;
                        } else {
                            if (params[i][0].length > 0 && params[i][0] != '$format') {
                                params[i][1] = (params[i][1]) ? params[i][1] : '';
                                otherFiltersStr += params[i][0] + "=" + params[i][1] + "&";
                            }
                        }
                    }

                    if (filterStr == "$filter=") {
                        if (bTopParamChange) {
                            if (otherFiltersStr.length > 0)
                                rewriteURL += otherFiltersStr;
                            else
                                rewriteURL = original_url;
                            return rewriteURL;
                        } else {
                            return original_url;
                        }
                    } else {

                        var checkEnd = filterStr.substr(filterStr.length - 5, filterStr.length);
                        if (checkEnd == ' and ')
                            filterStr = filterStr.substr(0, filterStr.length - 5);

                        if (filterCount > 1) {
                            if (otherFiltersStr.length > 0)
                                rewriteURL += filterStr + '&' + otherFiltersStr;
                            else
                                rewriteURL += filterStr;

                            return rewriteURL;
                        } else {
                            if (bTopParamChange) {
                                if (otherFiltersStr.length > 0)
                                    rewriteURL += filterStr + '&' + otherFiltersStr;
                                else
                                    rewriteURL += filterStr;
                                return rewriteURL;
                            }
                        }

                    }

                    return false;
                },
                getQueryParams: function (queryString) {
                    var query = (queryString || window.location.search).substring(1); // delete ?
                    if (!query) {
                        return false;
                    }
                    return _
                    .chain(query.split('&'))
                    .map(function (params) {
                        var p = params.split('=');
                        return [decodeURIComponent(p[0].toLowerCase()), p[1]];
                    })
                },
                getColumnConfig: function(entity){
                    var deferred = $q.defer();
                    $http.get('/Scripts/ng/page/adfWidgets/odataGrid/columnTemplates/' + entity + '.json')
                      .then(function (response) {
                          deferred.resolve(response.data);
                      }, function () {
                          console.error("Could not retrieve column config file");
                          deferred.resolve({});
                      });

                    return deferred.promise;

                },
                initConfig: function (config) {
                    this.initConfigGridColumns(config);
                    this.initPageableMessages(config);
                    this.initFilterableMessages(config);
                    this.initGroupableMessages(config);
                    this.initColumnMenu(config);
                    this.initEventBinding(config);
                    return angular.copy(config);
                },
                initEventBinding: function (config) {
                    config.dataBound = function (e) {
                        var grid = e.sender;
                        var gridId = e.sender.$angular_scope.stateGuid;
                        var currentState = app.gridUtils.savedState.getCurrentState(gridId);

                        app.gridUtils.denoteAppliedFilters(grid, currentState);
                        app.gridUtils.setDashboardGridState(gridId, grid, grid.dataSource, currentState);
                        app.gridUtils.initDashboardRowClickHandling(gridId, grid);
                        app.gridUtils.handleEmptyResults(grid, grid.dataSource, currentState);
                        app.events.publish('gridBound', grid);
                        app.lib.message.show();
                    };
                },
                initColumnMenu: function (config) {
                    if (config.columnMenu && config.columnMenu.messages) {
                        angular.extend(config.columnMenu.messages, {
                            columns: localizationService.getValue('ChooseColumns'),
                            filter: localizationService.getValue('Filter'),
                            sortAscending: localizationService.getValue('SortAscending'),
                            sortDescending: localizationService.getValue('SortDescending')
                        });
                    }
                },
                initConfigGridColumns: function (config) {
                    var self = this;
                    _.each(config.columns, self.initGridColumn);
                },
                initFilterableMessages: function (config) {

                    if (config.filterable) {

                        if (config.filterable.messages) {
                            angular.extend(config.filterable.messages, {
                                info: localizationService.getValue('Showitemswithvaluethat'),
                                and: localizationService.getValue('And'),
                                or: localizationService.getValue('Or'),
                                filter: localizationService.getValue('Filter'),
                                clear: localizationService.getValue('Clear')
                            });
                        }

                        if (config.filterable.operators) {

                            if (config.filterable.operators.string) {
                                angular.extend(config.filterable.operators.string, {
                                    eq: localizationService.getValue('Isequalto'),
                                    neq: localizationService.getValue('Isnotequalto'),
                                    contains: localizationService.getValue('Contains'),
                                    doesnotcontain: localizationService.getValue('DoesNotContain'),
                                    startswith: localizationService.getValue('Startswith'),
                                    endswith: localizationService.getValue('Endswith')
                                });
                            }

                            if (config.filterable.operators.number) {
                                angular.extend(config.filterable.operators.number, {
                                    eq: localizationService.getValue('Isequalto'),
                                    neq: localizationService.getValue('Isnotequalto'),
                                    gt: localizationService.getValue('GreaterThan'),
                                    gte: localizationService.getValue('GreaterOrEqual'),
                                    lt: localizationService.getValue('LessThan'),
                                    lte: localizationService.getValue('LessOrEqual'),
                                });
                            }

                            if (config.filterable.operators.SLOStatus) {
                                angular.extend(config.filterable.operators.SLOStatus, {
                                    contains: localizationService.getValue('Contains')
                                });
                            }

                            if (config.filterable.operators.date) {
                                angular.extend(config.filterable.operators.date, {
                                    gte: localizationService.getValue('GreaterOrEqual'),
                                    gt: localizationService.getValue('GreaterThan'),
                                    lte: localizationService.getValue('LessOrEqual'),
                                    lt: localizationService.getValue('LessThan')
                                });
                            }
                        }
                    }

                },
                initGridColumn: function (column) {
                    if (!column.title) {
                        column.title = column.field;
                    }
                },
                initGroupableMessages: function (config) {
                    if (config.groupable && config.groupable.messages) {
                        angular.extend(config.groupable.messages, {
                            empty: localizationService.getValue('Dragacolumnheader')
                        });
                    }
                },
                initPageableMessages: function (config) {
                    if (config.pageable && config.pageable.messages) {
                        angular.extend(config.pageable.messages, {

                            empty: localizationService.getValue('Empty'),
                            of: localizationService.getValue('Of'),
                            first: localizationService.getValue('First'),
                            previous: localizationService.getValue('Previous'),
                            next: localizationService.getValue('Next'),
                            last: localizationService.getValue('Last'),
                            itemsPerPage: localizationService.getValue('ItemsPerPage')
                        });
                    }
                },
                setErrorNotification: function (message) {
                    notificationService.addError(message);
                },
                guid: function(){
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                },
                getGuid: function () {
                    var guid = (this.guid() + this.guid() + "-" + this.guid() + "-" + this.guid() + "-" +
this.guid() + "-" + this.guid() + this.guid() + this.guid()).toUpperCase();

                    return guid;
                },
                getQuickActionAddIns: function () {
                    var deferred = $q.defer();
                    var url = "/platform/api/AddInsMetaData"
                    $http.get(url)
                        .then(function (response) {
                            var addIns = response.data.value;
                            var customGridActions = _.where(addIns, { AddInType: "CustomGridAction" });

                            deferred.resolve(customGridActions);

                            //var availableQuickActions = [];
                            //_.each(addIns, function (addIn) {
                            //    if (addIn.AddInType == "CustomGridAction") { 
                                   
                            //        //addIn.Template="<span>YRdy</span>"
                            //        //var templateURL = "/Platform/AddIns/GridQuickAction/GridQuickAction.html"

                            //        availableQuickActions.push(addIn);
                            //        deferred.resolve(availableQuickActions);
                            //        //$http.get(templateURL)
                            //        //    .then(function (response) {
                            //        //        console.log("addin", addIn)
                            //        //        addIn.Template = response.data;
                            //        //        availableQuickActions.push(addIn);
                            //        //        deferred.resolve(availableQuickActions);
                                            
                            //        //    }, function () {
                            //        //        notificationService.addError("Could not retrieve quick action add in template");
                            //        //    });
                                   
                            //    }
                            //});

                            
                        }, function () {
                            notificationService.addError("Could not retrieve quick action add ins");
                        });
                    
                    return deferred.promise;
                    
                },
                getDefaultGridActions: function () {
                    var defaultActions = [{
                        Id: "AssignToMe",
                        DisplayName: "Assign To Me",
                        IsActive: false,
                        IconClass: "fa fa-thin fa-user",
                        IconPath: "",
                        AppliedToClasses: [app.constants.workItemPlatformClassName.Incident,
                        app.constants.workItemPlatformClassName.ServiceRequest,
                        app.constants.workItemPlatformClassName.ChangeRequest,
                        app.constants.workItemPlatformClassName.Problem,
                        app.constants.workItemPlatformClassName.ReleaseRecord,
                        app.constants.workItemPlatformClassName.ManualActivity,
                            "ActiveWork", "MyRequest", "MyWork", "TeamRequest", "TeamWork"]
                    },
                    {
                        Id: "AddComment",
                        DisplayName: "Add Comments",
                        IsActive: false,
                        IconClass: "fa fa-thin fa-file-text-o",
                        IconPath: "",
                        AppliedToClasses: [app.constants.workItemPlatformClassName.Incident,
                        app.constants.workItemPlatformClassName.ServiceRequest,
                        app.constants.workItemPlatformClassName.ChangeRequest,
                        app.constants.workItemPlatformClassName.Problem,
                        app.constants.workItemPlatformClassName.ReleaseRecord,
                        app.constants.workItemPlatformClassName.ManualActivity,
                        app.constants.workItemPlatformClassName.ReviewActivity,
                            "ActiveWork", "MyRequest", "MyWork", "TeamRequest", "TeamWork"
                        ]
                    },
                    {
                        Id: "AddRelatedCI",
                        DisplayName: "Add Related CI",
                        IsActive: false,
                        IconClass: "fa fa-thin fa-desktop",
                        IconPath: "",
                        AppliedToClasses: [app.constants.workItemPlatformClassName.Incident,
                        app.constants.workItemPlatformClassName.ServiceRequest,
                        app.constants.workItemPlatformClassName.ChangeRequest,
                        app.constants.workItemPlatformClassName.Problem,
                        app.constants.workItemPlatformClassName.ReleaseRecord,
                            "ActiveWork", "MyRequest", "MyWork", "TeamRequest", "TeamWork"
                        ]
                    }];

                    return defaultActions;
                },
                defaultGridActions: {
                    AssignToMe: function (dataItem) {
                        //assign workitem to logged in user
                        var workItemData = {
                            AssignedWorkItem: {
                                BaseId: session.user.Id,
                                DisplayName: session.user.Name
                            }
                        }

                        //add record assigned action log
                        var actionLogName = (_.has(dataItem, "System_WorkItem_TroubleTicketHasActionLog_Count")) ? "AppliesToTroubleTicket" : "AppliesToWorkItem";
                        workItemData[actionLogName] = [];
                        workItemData[actionLogName].unshift(new app.dataModels[actionLogName].recordAssigned(session.user.Name));
                        
                        
                        var postData = encodeURIComponent(JSON.stringify(workItemData));

                        $.ajax({
                            url: "/api/v3/WorkItem/Update?BaseId=" + dataItem.Guid + "&ViewModel=" + postData,
                            type: "POST",
                            success: function () {
                                app.lib.message.add(localization.ChangesApplied, "success");
                                app.lib.message.show();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log("'Assign To Me' using grid quick action failed.")
                                console.log(jqXHR, textStatus, errorThrown);
                            }
                        });
                    },
                    AddComments: function (dataItem) {
                        var commentTemplate = "<div id='commentWindow' class='cireson-window--wrapper'>" +
                            "<div class='cireson-window--body'><div class='inline-spacing'>" +
                            "<label>Comment</label><textarea id='commentBox' data-bind='value: actionLogComment, events: {input:textCounter}' data-value-update='input' class='k-textbox' rows=5></textarea>" +
                            "</div>" +
                            "<div class='inline-spacing'>" +
                            "<span data-bind='html:charactersRemaining'></span>" +
                            "<span>Characters Remaining</span>" +
                            "</div>" +
                            "<div class='inline-spacing checkbox checkbox-inline'>" +
                            "<input id='IsPrivate' type='checkbox' data-bind='checked: isPrivate' />" +
                            "<label for='IsPrivate' class='checkbox-label'>"+localization.IsPrivate+"</label>" +
                            "</div>" +
                            "</div >" +
                            "<div class='window-buttons cireson-window--footer'>" +
                            "<button class='btn btn-primary' data-role='button' data-bind='enabled: okEnabled, events: { click: okClick }'> " + localization.OK +" </button>" +
                            "<button class='btn btn-default' data-role='button' data-bind='events: { click: cancelClick }'> " + localization.Cancel +" </button>" +
                            "</div>" +
                            "</div >"

                        $("#main_wrapper").append(commentTemplate)

                        var cont = $("#commentWindow");

                        //this view Model is bound to the window element
                        var _vmWindow = new kendo.observable({
                            dateTimeNow: kendo.toString(new Date(), "g"),
                            dateTimeNowUTC: new Date().toISOString(),
                            actionLogComment: "",
                            isPrivate: false,
                            charactersRemaining: "4000",
                            textCounter: function () {
                                var maximumLength = 4000;
                                var actionLogComment = (this.actionLogComment.length) ? this.actionLogComment
                                    : ($(cont.find("#commentBox")).val().length) ? $(cont.find("#commentBox")).val() : "";
                                var val = actionLogComment.length;

                                if (val > maximumLength) {
                                    if (this.actionLogComment.length)
                                        this.actionLogComment.substring(0, maximumLength);
                                    else
                                        $(cont.find("#commentBox")).val(actionLogComment.substring(0, maximumLength));
                                } else {
                                    this.set("charactersRemaining", maximumLength - val);
                                }
                            },
                            okClick: function () {
                                var actionLogComment = (this.actionLogComment.length) ? this.actionLogComment
                                    : ($(cont.find("#commentBox")).val().length) ? $(cont.find("#commentBox")).val() : "";

                                var actionLogName = null;

                                if (_.has(dataItem, "WIType")) {
                                    switch (dataItem.WIType) {
                                        case "Incident":
                                        case "Problem":
                                            actionLogName = "AppliesToTroubleTicket";
                                            break;
                                        case "Service Request":
                                        case "Change Request":
                                        case "Release Record":
                                            actionLogName = "AppliesToWorkItem";
                                            break;
                                        default:
                                            break;
                                    }
                                } else {
                                    actionLogName = (_.has(dataItem, "System_WorkItem_TroubleTicketHasActionLog_Count")) ? "AppliesToTroubleTicket" : "AppliesToWorkItem";
                                }

                                if (actionLogComment.length > 0 && !_.isNull(actionLogName)) {
                                    var newActionLog = {};
                                    newActionLog[actionLogName] = [];
                                    newActionLog[actionLogName].unshift({
                                        EnteredBy: session.user.Name,
                                        Title: localization.Analyst + " " + localization.Comment,
                                        IsPrivate: this.isPrivate,
                                        EnteredDate: new Date().toISOString(),
                                        LastModified: new Date().toISOString(),
                                        Description: this.actionLogComment,
                                        DescriptionDisplay: actionLogComment,
                                        Image: (this.isPrivate) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                        ActionType: (session.user.Analyst == 1) ? "AnalystComment" : "EndUserComment"
                                    });

                                    var postData = encodeURIComponent(JSON.stringify(newActionLog));

                                    $.ajax({
                                        url: "/api/v3/WorkItem/Update?BaseId=" + dataItem.Guid + "&ViewModel=" + postData,
                                        type: "POST",
                                        success: function () {
                                            app.lib.message.add(localization.ChangesApplied, "success");
                                            app.lib.message.show();
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            console.log("'Add Comments' using grid quick action failed.")
                                            console.log(jqXHR, textStatus, errorThrown);
                                        }
                                    });
                                }

                                win.close();
                            },
                            cancelClick: function () {
                                win.close();
                            }
                        });

                        //add control to the window
                        kendo.bind(cont, _vmWindow);


                        var win = cont.kendoCiresonWindow({
                            title: "Add Comment",
                            actions: []
                        }).data("kendoWindow");

                        win.open();
                    },
                    AddRelatedCI: function (dataItem) {
                        require.config({
                            waitSeconds: 0,
                            urlArgs: "v=" + session.staticFileVersion,
                            baseUrl: "/Scripts/",
                            paths: {
                                text: "require/text"
                            },
                            shim: {
                            }
                        });

                        require(["forms/popups/multipleObjectPickerPopup/controller",], function (multipleObjectPickerPopup) {

                            var popupWindow = multipleObjectPickerPopup.getPopup("62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC", "DisplayName,Path,Status", null, null, true);


                            popupWindow.setSaveCallback(function (object) {
                                var relatedConfigItems = [];
                                relatedConfigItems.push(object);

                                var newRelatedItem = {
                                    RelatesToConfigItem: relatedConfigItems
                                }

                                var postData = encodeURIComponent(JSON.stringify(newRelatedItem));

                                $.ajax({
                                    url: "/api/v3/WorkItem/Update?BaseId=" + dataItem.Guid + "&ViewModel=" + postData,
                                    type: "POST",
                                    success: function () {
                                        app.lib.message.add(localization.ChangesApplied, "success");
                                        app.lib.message.show();
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.log("'Add Comments' using grid quick action failed.")
                                        console.log(jqXHR, textStatus, errorThrown);
                                    }

                                });
                            });

                            popupWindow.open();

                        });
                    }
                }
            };
        }
    });
})();
