/**
activities
**/

define(function (require) {
    var tpl = require("text!forms/predefined/activities/view.html");   

    var definition = {
        template: tpl,
        build: function (viewModel, node, callback) {
            var built = _.template(tpl);
            var view = new kendo.View();
            var vm = node.vm;
            var kendoTabStrip;
            var loaded = false;
            var properties = {
                Disabled: node.disabled
            };

            $.extend(true, properties, node);

            vm.view.buildActivity = function () {
                $.extend(true, properties, node);
                var template = $(built(properties));
                const sortNav = items => {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].Activity && items[i].Activity.length) {
                            items[i].Activity = sortNav(items[i].Activity);
                        }
                    }
                    let result = [...items].sort(function (a, b) {
                        if (a.SequenceId < b.SequenceId) {
                            return -1;
                        }
                        if (a.SequenceId > b.SequenceId) {
                            return 1;
                        }
                        return 0;
                    })
                    return result;
                };
                //when archived, ensure that activities are sorted by sequence id 
                if (properties.Disabled) {
                    vm.Activity = sortNav(vm.Activity ??= []);
                }

                //build activity diagram
                var activityDiagram = {
                    drawDiagram: function (vm, element, top) {
                        if (top) {
                            element.append('<div id="activityDiagram""></div>');
                            var parent = $('#activityDiagram');
                        }
                        else {
                            var parent = element;
                        }

                        if (_.isUndefined(vm.Activity)) vm.Activity = [];


                        if (vm.Activity.length <= 0) {
                            if (!properties.Disabled) {
                                parent.append('<div class="activityWrapper"><div class="lineClass"><span class="fa activityMenuDiagram" title="Add Activity"></span></div><span>' + localizationHelper.localize("AddNewActivity", "Add New Activity") + '</span></div>');
                                var activity = null;
                                activityDiagram.appendAddMenuControls(activity);
                            }
                        }

                        //draw activity diagram (IR, PR)
                        if (viewModel.ClassName == "System.WorkItem.Incident" || viewModel.ClassName == "System.WorkItem.Problem") {
                            if (vm.Activity.length > 0) {
                                //define header
                                var head = [
                                    "<div class=\"activityHeader\" >",
                                    "<div class=\"pull-right activityActions\"></div>",
                                    "</div>"
                                ].join('');

                                parent.append('<div class="activityWrapper"><div class="ParallelActivity activityParentBox"><div>' + head + '<div class="activityContent"></div></div></div>');

                                var header = '.activityHeader'
                              
                                //if (!properties.Disabled) {
                                     $('<div class=\"pull-right childActivityMenu\"></div><div class="classImage"><ul class=\"fa activityMenuDiagram\" title=\"Add Activity\"></ul></div>  ').insertAfter(header);
                                //}
                               

                                $.each(vm.Activity, function (i, activity) {
                                    var sc = activity.ClassName.split('.');
                                    var title = activity.Title ? activity.Title : "";
                                    var iconName = activityDiagram.getIconName(activity.ClassName);
                                    var status = activity.Status.Name.replace(' ', '').toLowerCase();
                                    var statusTooltip = localizationHelper.localize(activity.Status.Name.replace(' ', ''), status)

                                    var status = activity.Status.Name.replace(' ', '').toLowerCase();

                                    if (status == "") {
                                        status = "nullStatus";
                                        statusTooltip = localization.New;
                                    }

                                    if (activity.Skip) {
                                        status = "skipped";
                                        statusTooltip = localization.Skipped;
                                    }

                                    if (status == "rerun") {
                                        statusTooltip = localization.Rerun;
                                    }

                                    //define assigned user/reviewer
                                    var assignedUsers = ""
                                    if (!_.isUndefined(activity.Activity) && activity.Activity.length <= 0) {
                                        if (activity.ClassName == "System.WorkItem.Activity.ReviewActivity") {
                                            if (_.isUndefined(activity.Reviewer)) {
                                                activity.Reviewer = [];
                                            }
                                            assignedUsers = "<p data-click=\"showReviewer\" review-id='" + activity.Id + "' class='reviewer assignedUser'>Reviewers: " + activity.Reviewer.length + "</p>";
                                        }
                                        else {
                                            if (!_.isUndefined(activity.AssignedWorkItem) && !_.isNull(activity.AssignedWorkItem.DisplayName)) {
                                                assignedUsers = "<p  data-click=\"showReviewer\" class='assignedUser'>" + activity.AssignedWorkItem.DisplayName + "</p>";
                                            }
                                        }
                                    }

                                    //define header
                                    var activityHeader = [
                                        "<div class=\"activityHeader\" >",
                                        "<div class=\"activityID\">",
                                        "<img class=\"diagramIcon\" src=\"/Content/Images/Icons/WorkTypeIcons/" + iconName + "\" alt=\"" + iconName + "\"/>",
                                        "<i data-toggle=\"tooltip\" title=\"" + statusTooltip + "\"><img class=\"activityImage\" src=\"/Content/Images/Activity Status/" + status + ".svg\"/></i><span data-click=\"showActivity\" class=\"activityIDLink\" id=\"" + activity.Id + "\">" + activity.Id + " </span><div class=\"pull-right activityActions\"></div>" + assignedUsers,
                                        "<p class=\"activityTitle\">" + title + "</p>",
                                        "</div>"
                                    ].join('');

                                    var content = ".activityContent";
                                    $(content).append('<div class="activityWrapper"><div data-sequence-id="' + activity.SequenceId + '"id ="' + activity.Id + '" class="childActivity activityBox ' + sc[sc.length - 1] + " " + status + '"><div id="activityBoxContent-' + activity.Id + '">' + activityHeader + '</div></div></div>');

                                    if (!properties.Disabled) {
                                        activityDiagram.setShowSkipIconProperty(activity);

                                        if (activity.ClassName == "System.WorkItem.Activity.ParallelActivity") {
                                            $('#' + activity.Id).find(".activityActions").append('<a id="addChildMenu-' + activity.Id + '" data-sequence-id="' + activity.SequenceId + '" class="activityChildMenuDiagram" title="Add Child Activity"></a></div>');
                                        }

                                        if (activity.ShowSkipIcon) {
                                            var skipActivityIcon = '<a data-click=\"skip\" class="skip-activity " data-activity-id=' + activity.Id + '><i class="fa fa-share-square-o fa-lg" title="Skip"></i></a>'
                                            $('#' + activity.Id).find(".activityActions").append(skipActivityIcon);
                                        }
                                        if (activity.ShowUnskipIcon) {
                                            var unskipActivityIcon = '<a data-click=\"unskip\" class="unskip-activity " data-activity-id=' + activity.Id + '><i class="fa fa-share-square-o fa-lg fa-flip-horizontal" title="UnSkip"></i></a>'
                                            $('#' + activity.Id).find(".activityActions").append(unskipActivityIcon);
                                        }
                                        if (activity.ShowReturnIcon) {
                                            var returnActivityIcon = '<a data-click=\"rerun\" class="return-activity " data-activity-id=' + activity.Id + '><i class="fa fa-reply-all fa-lg" title="Return"></i></a>'
                                            $('#' + activity.Id).find(".activityActions").append(returnActivityIcon);
                                        }

                                        if (activity.Status.Id == app.constants.workItemStatuses.Activity.InProgress && activity.ClassName == "System.WorkItem.Activity.ManualActivity") {
                                            var completedIcon = '<a data-click=\"complete\" class="complete-activity " data-activity-id=' + activity.Id + '><i class="fa fa-check fa-lg" title="Mark as Completed"></i></a>'
                                            $('#' + activity.Id).find(".activityActions").append(completedIcon);

                                            var failedIcon = '<a data-click=\"fail\" class="fail-activity " data-activity-id=' + activity.Id + '><i class="fa fa-times fa-lg" title="Mark as Failed"></i></a>'
                                            $('#' + activity.Id).find(".activityActions").append(failedIcon);
                                        }
                                    }

                                });


                                activityDiagram.appendAddMenuControls(null);
                                
                            }
                            
                          
                            
                        } else {
                            //draw activity diagram (SR, CR, RR)
                            $.each(vm.Activity, function (i, activity) {
                                var sc = activity.ClassName.split('.');
                                var title = activity.Title ? activity.Title : "";
                                var additionalClass = top ? "" : "childActivity";
                                var iconName = activityDiagram.getIconName(activity.ClassName);
                                var status = activityDiagram.getStatusIconName(activity.Id, activity.Status); 
                                var statusTooltip = localizationHelper.localize(activity.Status.Name.replace(' ', ''), status)

                                if (status == "" || status=="nullStatus") {
                                    status = "nullStatus";
                                    statusTooltip = localization.New;
                                }

                                if (activity.Skip) {
                                    status = "skipped";
                                    statusTooltip = localization.Skipped;
                                }

                                if (status == "rerun") {
                                    statusTooltip = localization.Rerun;
                                }

                                //define assigned user/reviewer
                                var assignedUsers = ""
                                if (!_.isUndefined(activity.Activity) && activity.Activity.length <= 0) {
                                    if (activity.ClassName == "System.WorkItem.Activity.ReviewActivity") {
                                        if (_.isUndefined(activity.Reviewer)) {
                                            activity.Reviewer = [];
                                        }
                                        assignedUsers = "<p data-click=\"showReviewer\" review-id='" + activity.Id + "' class='reviewer assignedUser'>Reviewers: " + activity.Reviewer.length + "</p>";
                                    }
                                    else {
                                        if (!_.isUndefined(activity.AssignedWorkItem) && !_.isNull(activity.AssignedWorkItem.DisplayName)) {
                                            assignedUsers = "<p  data-click=\"showReviewer\" class='assignedUser'>" + activity.AssignedWorkItem.DisplayName + "</p>";
                                        }
                                    }
                                }

                                var activityClassBoxStyle = " activityBox ";
                                var activityActionParrallelClass = " ";
                                if (activity.ClassName == "System.WorkItem.Activity.ParallelActivity" || activity.ClassName == "System.WorkItem.Activity.SequentialActivity") {
                                    activityClassBoxStyle = " activityParentBox ";
                                    activityActionParrallelClass = " activityActions-parallel";
                                }


                                //define header
                                var head = [
                                    "<div class=\"activityHeader\" >",
                                    "<div class=\"activityID\">",
                                    "<img class=\"diagramIcon\" src=\"/Content/Images/Icons/WorkTypeIcons/" + iconName + "\" alt=\"" + iconName + "\" onerror=\"this.src = '/Content/Images/Icons/WorkTypeIcons/ManualActivity.svg'\"/>",
                                    "<i data-toggle=\"tooltip\" title=\"" + statusTooltip + "\"><img class=\"activityImage\" src=\"/Content/Images/Activity Status/" + status + ".svg\"/></i><span data-click=\"showActivity\" class=\"activityIDLink\" id=\"" + activity.Id + "\">" + activity.Id + " </span><div class=\"pull-right activityActions " + activityActionParrallelClass + "\"></div>" + assignedUsers,
                                    "<p class=\"activityTitle\">" + title + "</p>",
                                    "</div>"
                                ].join('');

                                parent.append('<div class="activityWrapper"><div data-sequence-id="' + activity.SequenceId + '"id ="' + activity.Id + '" class="' + sc[sc.length - 1] + activityClassBoxStyle + additionalClass + " " + status + '"><div id="activityBoxContent-' + activity.Id + '">' + head + '</div></div></div>');

                                var content = [
                                    "<p class=\"activityTitle\">" + title + "</p>",
                                ].join('');

                                $('#activityBoxContent-' + activity.Id).append('<div class="activityContent"></div>');
                                //$('#' + activity.Id).append('<div class="activityActions"><span class="fa fa-envelope activitySendEmail" title="Send Email"></span></div>');
                                //$('#' + activity.Id).append('<div class="activityActions"><ul><li><span class="fa fa-envelope activitySendEmail" title="Send Email"></span><li><li><span class="fa fa-plus activityMenuDiagram" title="Add Activity"></span><li><ul></div>');

                                if (!properties.Disabled) {
                                    activityDiagram.setShowSkipIconProperty(activity);

                                    if (activity.ClassName == "System.WorkItem.Activity.ParallelActivity") {
                                        $('#' + activity.Id).find(".activityActions").append('<a id="addChildMenu-' + activity.Id + '" data-sequence-id="' + activity.SequenceId + '" class="activityChildMenuDiagram" title="Add Child Activity"></a></div>');
                                    }

                                    if (activity.ShowSkipIcon) {
                                        var skipActivityIcon = '<a data-click=\"skip\" class="skip-activity " data-activity-id=' + activity.Id + '><i class="fa fa-share-square-o fa-lg" title="Skip"></i></a>'
                                        $('#' + activity.Id).find(".activityActions").append(skipActivityIcon);
                                    }
                                    if (activity.ShowUnskipIcon) {
                                        var unskipActivityIcon = '<a data-click=\"unskip\" class="unskip-activity " data-activity-id=' + activity.Id + '><i class="fa fa-share-square-o fa-lg fa-flip-horizontal" title="UnSkip"></i></a>'
                                        $('#' + activity.Id).find(".activityActions").append(unskipActivityIcon);
                                    }
                                    if (activity.ShowReturnIcon) {
                                        var returnActivityIcon = '<a data-click=\"rerun\" class="return-activity " data-activity-id=' + activity.Id + '><i class="fa fa-reply-all fa-lg" title="Return"></i></a>'
                                        $('#' + activity.Id).find(".activityActions").append(returnActivityIcon);
                                    }

                                    if (activity.Status.Id == app.constants.workItemStatuses.Activity.InProgress && activity.ClassName == "System.WorkItem.Activity.ManualActivity") {
                                        var completedIcon = '<a data-click=\"complete\" class="complete-activity " data-activity-id=' + activity.Id + '><i class="fa fa-check fa-lg" title="Mark as Completed"></i></a>'
                                        $('#' + activity.Id).find(".activityActions").append(completedIcon);

                                        var failedIcon = '<a data-click=\"fail\" class="fail-activity " data-activity-id=' + activity.Id + '><i class="fa fa-times fa-lg" title="Mark as Failed"></i></a>'
                                        $('#' + activity.Id).find(".activityActions").append(failedIcon);
                                    }
                                }

                                //define child activities
                                if (activity.Activity) {
                                    if (activity.Activity.length) {
                                        var header = '#' + activity.Id + ' .activityHeader';
                                        var Id = header + ' .activityID';
                                        //$(Id).css('display', 'inline');

                                        $(header).append('<span class="activityCount">(' + activity.Activity.length + ')</span>');

                                        if (!_.isUndefined(activity.AssignedWorkItem) && !_.isNull(activity.AssignedWorkItem.DisplayName)) {
                                            $(header).append("<br><span class='assignedUser'>" + activity.AssignedWorkItem.DisplayName + "</span>");
                                        }

                                        $('<div class=\"pull-right childActivityMenu\"></div><div class="classImage"><img src="/Images/' + sc[sc.length - 1].toLowerCase().replace('activity', '') + '.png" heigh="25" width="25" /></div>  ').insertAfter(header);
                                        var content = '#' + activity.Id + ' .activityContent';

                                        activityDiagram.drawDiagram(activity, $(content), false);
                                    }
                                }
                                else {
                                    //$('#' + activity.Id).css('width', '150px');
                                }

                                //define line seperator
                                if (top) {
                                    if (!properties.Disabled) {
                                        var canAddActivity = (session.user.Analyst) &&
                                            (session.user.Security.CanAddManualActivity || session.user.Security.CanAddReviewActivity || session.user.Security.CanAddParallelActivity);

                                        if (canAddActivity) {
                                            $('#' + activity.Id).parent().append('<div class="lineClass"><ul id="addMenu-' + activity.Id + '" class="fa activityMenuDiagram" title="Add Activity"></ul></div>');
                                        } else {
                                            $('#' + activity.Id).parent().append('<div class="lineClass"></div>');
                                        }
                                       
                                    }
                                    else {
                                        $('#' + activity.Id).parent().append('<div class="lineClass"></div>');
                                    }
                                } else {
                                    $('#' + activity.Id).parent().append('<div class="lineClass"></div>');
                                }


                                activityDiagram.appendAddMenuControls(activity);
                            })
                        }

                        


                        //bind diagram control events
                        var actions = {
                            showActivity: function () {
                                activityDiagram.showActivityForm($(this).attr("id")); 
                            },
                            showReviewer: function () {
                                activityDiagram.showActivityForm($(this).attr("review-id"));
                            },
                            skip: function(){
                                var activityId = $(this).attr("data-activity-id");
                                activityDiagram.triggerActivityAction(vm.Activity, activityId);
                            },
                            unskip: function () {
                                var activityId = $(this).attr("data-activity-id");
                                activityDiagram.triggerActivityAction(vm.Activity, activityId, $("#activityStatus"));
                            },
                            rerun: function () {
                                var activityId = $(this).attr("data-activity-id");
                                activityDiagram.triggerActivityAction(vm.Activity, activityId, $("#activityStatus"));
                            },
                            complete: function () {
                                var activityId = $(this).attr("data-activity-id");
                                activityDiagram.triggerActivityAction(vm.Activity, activityId, $("#activityStatus"), "complete");
                            },
                            fail: function () {
                                var activityId = $(this).attr("data-activity-id");
                                activityDiagram.triggerActivityAction(vm.Activity, activityId, $("#activityStatus"), "fail");
                            }
                        }

                        element.find('[data-click]:not(.dataClickedBound)').each(function () {
                            if (actions[$(this).attr('data-click')]) {
                                $(this).addClass('dataClickedBound').click(actions[$(this).attr('data-click')]);
                            }
                        });
                    },
                    getIconName: function (className) {
                        var name = className.split(".");
                        var iconName = name[name.length - 1];

                        if (iconName == "Activity") {
                            iconName = "ManualActivity";
                        }

                        return iconName + ".svg";
                    },
                    getStatusIconName: function (id, status) {
                        var statusIconName = "nullStatus";
                        if (!_.isNull(status.Id)) {
                            switch (status.Id) {
                                case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83":
                                    statusIconName = "InProgress";
                                    break;
                                case "9de908a1-d8f1-477e-c6a2-62697042b8d9":
                                    statusIconName = "Completed";
                                    break;
                                case "144bcd52-a710-2778-2a6e-c62e0c8aae74":
                                    statusIconName = "Failed";
                                    break;
                                case "89465302-2a23-d2b6-6906-74f03d9b7b41":
                                    statusIconName = "Cancelled";
                                    break;
                                case "50c667cf-84e5-97f8-f6f8-d8acd99f181c":
                                    statusIconName = "Pending";
                                    break;
                                case "eaec5899-b13c-d107-3e1a-955da6bf9fa7":
                                    statusIconName = "Skipped";
                                    break;
                                case "d544258f-24da-1cf3-c230-b057aaa66bed":
                                    statusIconName = "OnHold";
                                    break;
                                case "baa948b5-cc6a-57d7-4b56-d2012721b2e5":
                                    statusIconName = "Rerun";
                                    break;
                                default:
                                    statusIconName = "nullStatus";
                                    break;
                            }
                        } 

                        return statusIconName;
                    },
                    appendAddMenuControls: function (activity) {

                        var data = [{
                            text: "<i class='fa fa-plus-circle cursor-pointer' title='" + localization.AddRootActivity + "'></i>",
                            encoded: false,
                            items: []
                        }];

                        if (session.user.Security.CanAddManualActivity) {
                            data[0].items.push({
                                text: localization.ManualActivity,
                                attr: {
                                    type: 'manualactivity',
                                }
                            });
                        }

                        if (session.user.Security.CanAddReviewActivity) {
                            data[0].items.push({
                                text: localization.ReviewActivity,
                                attr: {
                                    type: 'reviewactivity',
                                }
                            })
                        }

                        if (session.user.Security.CanAddParallelActivity) {
                            data[0].items.push({
                                text: localization.ParallelActivity,
                                attr: {
                                    type: 'parallelactivity',
                                }
                            });
                        }

                        if ((boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem")) {
                            if (session.user.Security.CanAddManualActivity) {
                                data = [{
                                    text: "<i class='fa fa-plus-circle cursor-pointer' title='" + localization.AddRootActivity + "'></i>",
                                    encoded: false,
                                    items: [{
                                        text: localization.ManualActivity,
                                        attr: {
                                            type: 'manualactivity',
                                        }
                                    }]
                                }];
                            } else {
                                data = [];
                            }
                        }

                        /**Add activity section **/
                        var addMenu = $(".activityMenuDiagram").kendoMenu({
                            openOnClick: true,
                            dataSource: data,
                            select: function (e) {
                                if (!_.isUndefined(e.item.attributes["type"])) {
                                    var type = e.item.attributes["type"].value;
                                    switch (type) {
                                        case "childreviewactivity":
                                        case "reviewactivity":
                                            templateNameKey = "DefaultReviewActivityTemplate";
                                            break;
                                        case "parallelactivity":
                                            templateNameKey = "DefaultParallelActivityTemplate";
                                            break;
                                        case "childmanualactivity":
                                        case "manualactivity":
                                        default:
                                            templateNameKey = "DefaultManualActivityTemplate";
                                            break;
                                    }
                                    $.ajax({
                                        url: "/api/V3/Settings/GetSetting",
                                        type: "get",
                                        data: { settingKey: templateNameKey },
                                        async: true
                                    }).done(function (data) {
                                        if (!_.isUndefined(data)) {
                                            var templateName = data.Value;
                                            $.ajax({
                                                url: "/api/V3/Projection/CreateProjectionByTemplateName",
                                                type: "get",
                                                data: { templateName: templateName, createdById: session.user.Id },
                                                async: true
                                            }).done(function (newActivity) {
                                                if (!_.isUndefined(newActivity)) {
                                                    var index = 0;
                                                    if (!_.isUndefined(activity) && !_.isNull(activity)) {
                                                        index = parseInt(activity.SequenceId) + 1;
                                                    }
                                                    
                                                    var updatedActivityList = pageForm.viewModel.Activity;
                                                    var jsonRawActivityList = updatedActivityList;

                                                    newActivity.ParentWorkItemClass = pageForm.viewModel.ClassName;
                                                    newActivity.ParentWorkItemStatus = pageForm.viewModel.Status;
                                                    newActivity.SequenceId = index;
                                                    newActivity.isDirty = true;

                                                    if (boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem") {
                                                        newActivity.Status.Id = app.constants.workItemStatuses.Activity.InProgress;
                                                        newActivity.Status.Name = localizationHelper.localize("InProgress", "In Progress");
                                                    }

                                                    if (_.isUndefined(newActivity.Activity)) {
                                                        newActivity.Activity = [];
                                                    }

                                                    updatedActivityList.splice(index, 0, newActivity);

                                                    //re-order activity sequence
                                                    _.each(updatedActivityList, function (item, i) {
                                                        if (parseInt(item.SequenceId) >= index && item.Id != newActivity.Id) {
                                                            item.set("SequenceId", parseInt(item.SequenceId) + 1);
                                                            item.set("isDirty", true);
                                                        }
                                                    });

                                                    //add action log entry 
                                                    var actionLogEntry = {
                                                        EnteredBy: session.user.Name,
                                                        Title: localization.Analyst + " " + localization.Comment,
                                                        IsPrivate: true,
                                                        EnteredDate: new Date().toISOString(),
                                                        LastModified: new Date().toISOString(),
                                                        Description: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                                        DescriptionDisplay: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                                        Image: (true) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                                        ActionType: "AnalystComment"
                                                    }

                                                    if ((boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem")) {
                                                        boundObj.AppliesToTroubleTicket.push(actionLogEntry);
                                                    } else {
                                                        boundObj.AppliesToWorkItem.push(actionLogEntry);
                                                    }

                                                    pageForm.viewModel.set(name, updatedActivityList);

                                                    //on edit, add to pageForm.original viewModel also.
                                                    if (pageForm.newWI == false) {
                                                        var jsonRawActivityList = pageForm.jsonRaw.Activity;
                                                        var jsonRawActivity = newActivity;
                                                        jsonRawActivity.SequenceId = -1;
                                                        if (!_.isUndefined(jsonRawActivityList)) {
                                                            jsonRawActivityList.splice(index, 0, jsonRawActivity);
                                                        }

                                                        if (!_.isUndefined(pageForm.jsonRaw.Activity)) {
                                                            pageForm.jsonRaw.Activity = jsonRawActivityList;
                                                        } else {
                                                            pageForm.jsonRaw.Activity = [];
                                                            pageForm.jsonRaw.Activity.push(newActivity);
                                                        }
                                                    }

                                                }

                                                $('#activity-diagram').html("");
                                                activityDiagram.drawDiagram(pageForm.viewModel, $('#activity-diagram'), true);

                                                try {
                                                    $("#activity-list").html("");
                                                    app.controls.activityDisplay($("#activity-list"), pageForm.viewModel, "Activity");

                                                    setTimeout(function () {
                                                        $(".header-open span[data-click='toggle']").click().parent().removeClass("header-open");
                                                        $("div[data-activity-id='" + newActivity.Id + "'] span[data-click='toggle']").click();
                                                    }, 300);
                                                }
                                                catch (ex) { console.log(ex); }

                                            });
                                        }
                                    });
                                }
                            }
                        }).data("kendoMenu");

                        var childData = [{
                            text: "<i class='fa fa-plus-circle cursor-pointer'></i>",
                            encoded: false,
                            items: []
                        }];

                        if (session.user.Security.CanAddManualActivity) {
                            childData[0].items.push({
                                text: localization.ManualActivity,
                                attr: {
                                    type: 'manualactivity',
                                }
                            });
                        }

                        if (session.user.Security.CanAddReviewActivity) {
                            childData[0].items.push({
                                text: localization.ReviewActivity,
                                attr: {
                                    type: 'reviewactivity',
                                }
                            })
                        }


                        var addChildMenu = $(".activityChildMenuDiagram").kendoMenu({
                            openOnClick: true,
                            dataSource: childData,
                            select: function (e) {
                                if (!_.isUndefined(e.item.attributes["type"])) {
                                    var type = e.item.attributes["type"].value;
                                    var sequenceId = $(e.item).parent().parent().parent().parent().attr("data-sequence-id");

                                    switch (type) {
                                        case "reviewactivity":
                                            templateNameKey = "DefaultReviewActivityTemplate";
                                            break;
                                        case "manualactivity":
                                        default:
                                            templateNameKey = "DefaultManualActivityTemplate";
                                            break;
                                    }

                                    $.ajax({
                                        url: "/api/V3/Settings/GetSetting",
                                        type: "get",
                                        data: { settingKey: templateNameKey },
                                        async: true
                                    }).done(function (data) {
                                        if (!_.isUndefined(data)) {
                                            var templateName = data.Value;

                                            $.ajax({
                                                url: "/api/V3/Projection/CreateProjectionByTemplateName",
                                                type: "get",
                                                data: { templateName: templateName, createdById: session.user.Id },
                                                async: true
                                            }).done(function (newActivity) {
                                                if (!_.isUndefined(newActivity)) {

                                                    var index = parseInt(sequenceId) + 1;
                                                    var updatedActivityList = boundObj.Activity;

                                                    newActivity.ParentWorkItemClass = boundObj.ClassName;
                                                    newActivity.ParentWorkItemStatus = boundObj.Status;
                                                   
                                                    newActivity.SequenceId = index;
                                                    newActivity.isDirty = true;

                                                    newActivity.Status.Id = app.constants.workItemStatuses.Activity.InProgress;
                                                    newActivity.Status.Name = localizationHelper.localize("InProgress", "In Progress");

                                                    updatedActivityList[sequenceId].set("isDirty", true);
                                                    updatedActivityList[sequenceId].Activity.push(newActivity)
                                                   
                                                    //add action log entry 
                                                    var actionLogEntry = {
                                                        EnteredBy: session.user.Name,
                                                        Title: localization.Analyst + " " + localization.Comment,
                                                        IsPrivate: true,
                                                        EnteredDate: new Date().toISOString(),
                                                        LastModified: new Date().toISOString(),
                                                        Description: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                                        DescriptionDisplay: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                                        Image: (true) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                                        ActionType: "AnalystComment"
                                                    }

                                                    if ((boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem")) {
                                                        boundObj.AppliesToTroubleTicket.push(actionLogEntry);
                                                    } else {
                                                        boundObj.AppliesToWorkItem.push(actionLogEntry);
                                                    }

                                                    boundObj[name] = updatedActivityList;

                                                    //on edit, add to pageForm.original viewModel also.
                                                    if (pageForm.newWI == false) {
                                                        pageForm.jsonRaw.Activity[sequenceId].Activity.push(newActivity)
                                                    }

                                                    //redraw activity forms
                                                    $('#activity-diagram').html("");
                                                    activityDiagram.drawDiagram(pageForm.viewModel, $('#activity-diagram'), true);

                                                    try {
                                                        $("#activity-list").html("");
                                                        app.controls.activityDisplay($("#activity-list"), pageForm.viewModel, "Activity");
                                                        if (newActivity.ClassName != "System.WorkItem.Activity.ParallelActivity") {
                                                            //showActivity(newActivity.Id);
                                                        }

                                                    }
                                                    catch (ex) { console.log(ex); }
                                                }
                                            });
                                        }

                                    });

                                }
                            }
                        }).data("kendoMenu");
                       
                        /**Add activity section **/
                    },
                    showActivityForm: function (propId) {
                        kendoTabStrip.select(1);
                        
                        $(".header-open span[data-click='toggle']").click().parent().removeClass("header-open");
                        $("div[data-activity-id='" + propId + "'] span[data-click='toggle']").click();
                    },
                    triggerActivityAction: function (activityList, activityId, statusEle, actionType) {
                        _.each(activityList, function (activity) {
                            if (activity.Id == activityId) {
                                activityDiagram.showCommentWindow(activity, statusEle, actionType);
                            }

                            if (activity.Activity.length > 0) {
                                activityDiagram.triggerActivityAction(activity.Activity, activityId);
                            }
                        });
                    },
                    showCommentWindow: function (vm, statusEle, actionType) {
                        if (_.isUndefined(vm)) { return; }
                        const isReturnActivity = !_.isUndefined(statusEle) ? true : false;
                        let msg = "";
                        switch (actionType) {
                            case "complete":
                                msg = localization.CompleteActivityMessage;
                                break;
                            case "fail":
                                msg = localization.FailActivityMessage;
                                break;
                            case "skip":
                            default:
                                if (_.isUndefined(vm.Skip)) {
                                    vm.Skip = false;
                                }
                                msg = isReturnActivity ? localization.ReturnActivityCommentMessage : (vm.Skip ? localization.UnSkipActivityCommentMessage : localization.SkipActivityCommentMessage)
                                break;
                        }
                        const notes = vm.get('Notes') ? vm.get('Notes') + '\n' : '';
                        const charactersRemaining = 4000 - notes.length;

                        $.when(app.controls.ManualActivityCommentDialog.show({
                            title: localization.Comments,
                            message: session.consoleSetting.RequireImplementationNotes ? localization.ImplementationdetailsRequired : localization.DoYouHaveComments,
                            required: session.consoleSetting.RequireImplementationNotes,
                            charactersRemaining: charactersRemaining,
                        })
                        ).done(function (response) {
                            if (response.button === "yes") {
                                vm.set('Notes', notes + response.input);
                                //set actual end date
                                vm.set('ActualEndDate', new Date().toISOString());
                                switch (actionType) {
                                    case "complete":
                                        vm.Status.set("Id", app.constants.workItemStatuses.Activity.Completed);
                                        vm.Status.set("Name", localization.Completed);
                                        break;
                                    case "fail":
                                        vm.Status.set("Id", app.constants.workItemStatuses.Activity.Failed);
                                        vm.Status.set("Name", localization.Failed);
                                        break;
                                    case "skip":
                                    default:
                                        //set skip property
                                        if (!isReturnActivity)
                                            vm.set("Skip", !vm.Skip);

                                        //set status to rerun or in progress (for IR only) on return activity
                                        if (isReturnActivity) {
                                            if (vm.ParentWorkItemClass.toLowerCase() == "System.WorkItem.Incident".toLowerCase()) {
                                                vm.Status.set("Id", "11fc3cef-15e5-bca4-dee0-9c1155ec8d83");
                                                vm.Status.set("Name", localization.InProgress);
                                            } else {
                                                vm.Status.set("Id", "baa948b5-cc6a-57d7-4b56-d2012721b2e5");
                                                vm.Status.set("Name", localization.Rerun);
                                            }
                                            vm.set('ActualEndDate', null);

                                            //when return to activity is called on a skipped activity reset skip to false
                                            if (vm.Skip) {
                                                vm.set("Skip", !vm.Skip);
                                            }

                                            statusEle.html(vm.Status.Name);
                                        }
                                        break;
                                }
                                vm.isDirty = true;
                                activityDiagram.setShowSkipIconProperty(vm);

                                $('#activity-diagram').html("");
                                activityDiagram.drawDiagram(pageForm.viewModel, $('#activity-diagram'), true);
                                $("#activity-list").html("");
                                app.controls.activityDisplay($("#activity-list"), pageForm.viewModel, "Activity");
                            }
                            win.close();
                            $(".k-window").hide();
                            $(".k-overlay").hide();
                        });
                    },
                    setShowSkipIconProperty: function (vm) {
                        var isCompleted = vm.Status.Id === "9de908a1-d8f1-477e-c6a2-62697042b8d9";
                        var isInProgress = vm.Status.Id === "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
                        var isPending = vm.Status.Id === "50c667cf-84e5-97f8-f6f8-d8acd99f181c";
                        var isCancelled = vm.Status.Id === "89465302-2a23-d2b6-6906-74f03d9b7b41";

                        var workitemClosedStatus = [
                            app.constants.workItemStatuses.Incident.Closed,
                            app.constants.workItemStatuses.ServiceRequest.Closed,
                            app.constants.workItemStatuses.ChangeRequest.Closed,
                            app.constants.workItemStatuses.Problem.Closed,
                            app.constants.workItemStatuses.Incident.Closed,
                        ];
                        var isWorkItemClosed = (_.indexOf(workitemClosedStatus, vm.ParentWorkItemStatus.Id) > -1);

                        //use direct assignment on initial (first) page loading, vm.set bogs down initial loading if there too many activities attached the workitem
                        if (_.isUndefined(vm.ShowSkipIcon)) {
                            vm.ShowSkipIcon = session.user.Analyst && !isCompleted && !isCancelled && !vm.Skip && !isWorkItemClosed;
                            vm.ShowUnskipIcon = session.user.Analyst && vm.Skip && !isWorkItemClosed;
                            vm.ShowReturnIcon = session.user.Analyst && !isInProgress && !isPending && vm.Status.Id != null && !isWorkItemClosed;
                            vm.HeaderCss = vm.Skip ? "text-warning" : "";
                            vm.IconTitle = vm.Skip ? localization.Unskip : localization.Skip;
                            vm.IconReturnTitle = localization.ReturntoActivity;

                        } else {
                            vm.set("ShowSkipIcon", session.user.Analyst && !isCompleted && !isCancelled && !vm.Skip && !isWorkItemClosed);
                            vm.set("ShowUnskipIcon", session.user.Analyst && vm.Skip && !isWorkItemClosed);
                            vm.set("ShowReturnIcon", session.user.Analyst && !isInProgress && !isPending && vm.Status.Id != null && !isWorkItemClosed);
                            vm.set("HeaderCss", vm.Skip ? "text-warning" : "");
                            vm.set("IconTitle", vm.Skip ? localization.Unskip : localization.Skip);
                        }
                    }
                }

                
               

                //build activity forms
                view = new kendo.View(template, { wrap: false, model: vm });
                callback(view.render());

                //render toggle
                _.defer(function () {
                    //when accessing from links, redirect to form instead of diagram
                    var queryStringParams = app.lib.getQueryParams();
                    if (!_.isUndefined(queryStringParams.activityid) && !_.isNull(queryStringParams.activityid)) {
                        node.defaultview = "";
                    }

                    kendoTabStrip = $("#activity-tabstrip").kendoTabStrip({
                        select: function () {
                            var currentView = kendoTabStrip.select().index() == 1 ? "diagram" : "list";
                            app.storage.activityDiagram.set('view', currentView);
                        },
                        activate: function () {
                            var activityView = app.storage.activityDiagram.get('view');

                            if (_.isNull(activityView)) {
                                if (!_.isUndefined(node.defaultview)) {
                                    activityView = node.defaultview;
                                } else {
                                    activityView = "list";
                                }
                            }

                            if (!loaded) {
                                kendoTabStrip.select(activityView == "diagram" ? 0 : 1);
                            }
                            loaded = true;

                            if (loaded) {
                                //show activity tabstrip after everything is loaded
                                $("#activity-tabstrip").show();
                            }
                        },
                        show: function () {
                            $('#activity-diagram').html("");
                            activityDiagram.drawDiagram(pageForm.viewModel, $('#activity-diagram'), true);

                            var workItemsWithActivityRestrictions = ["System.WorkItem.ServiceRequest", "System.WorkItem.ChangeRequest", "System.WorkItem.ReleaseRecord"];
                            var hasActivityRestriction = _.contains(workItemsWithActivityRestrictions, viewModel.ClassName);

                            if (hasActivityRestriction) {
                                _.each(vm.Activity, function (activity) {
                                    var invalidStatus = [
                                        app.constants.workItemStatuses.Activity.Completed,
                                        app.constants.workItemStatuses.Activity.Failed,
                                        app.constants.workItemStatuses.Activity.Skipped,
                                    ];

                                    var isInvalid = _.contains(invalidStatus, activity.Status.Id);
                                    var addMenuId = "#addMenu-" + activity.Id;
                                    var addMenu = $(addMenuId).data("kendoMenu");

                                    if (isInvalid || activity.Skip) {
                                        if (!_.isUndefined(addMenu)) {
                                            addMenu.enable(addMenu.element.children("li").eq(0), false);
                                        }
                                    }

                                    if (activity.ClassName == "System.WorkItem.Activity.ParallelActivity") {
                                        //var inValidStatus = [
                                        //    app.constants.workItemStatuses.Activity.Completed,
                                        //    app.constants.workItemStatuses.Activity.InProgress,
                                        //    app.constants.workItemStatuses.Activity.Skipped
                                        //];
                                        //var isInvalid = _.contains(inValidStatus, activity.Status.Id);
                                        if (activity.Skip) {
                                            var activityChildMenuId = "#addChildMenu-" + activity.Id;
                                            var addChildMenu = $(activityChildMenuId).data("kendoMenu");
                                            if (!_.isUndefined(addChildMenu)) {
                                                addChildMenu.enable(addChildMenu.element.children("li"), false);
                                            }
                                        }
                                    }
                                });
                            }
                            
                            var inValidWorkItemStatus = [
                                app.constants.workItemStatuses.ReleaseRecord.Closed,
                                app.constants.workItemStatuses.ReleaseRecord.Cancelled,
                                app.constants.workItemStatuses.ReleaseRecord.Completed,
                                app.constants.workItemStatuses.ReleaseRecord.Failed,
                                //app.constants.workItemStatuses.ReleaseRecord.OnHold,
                               // app.constants.workItemStatuses.ReleaseRecord.InProgress,
                                app.constants.workItemStatuses.Incident.Resolved,
                                app.constants.workItemStatuses.Incident.Closed,
                                app.constants.workItemStatuses.Problem.Resolved,
                                app.constants.workItemStatuses.Problem.Closed
                            ];
                            var isInvalid = _.contains(inValidWorkItemStatus, viewModel.Status.Id);
                            if (isInvalid) {
                                _.each($(".activityMenuDiagram"), function (addMenuElement) {
                                    var addMenu = $(addMenuElement).data("kendoMenu");
                                    if (!_.isUndefined(addMenu)) {
                                        addMenu.enable(addMenu.element.children("li"), false);
                                    }
                                });

                            }
                        }
                    }).data("kendoTabStrip");
                });


            }

            vm.view.buildActivity();

        }
    }

    return definition;

});