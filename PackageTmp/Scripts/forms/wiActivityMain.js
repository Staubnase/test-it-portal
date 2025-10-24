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

//let's let the user know that things are happening
app.lib.mask.apply();
$("body").css("cursor", "wait");
$(document).ajaxStop(function () {
    $("body").css("cursor", "auto");
});

require(["forms/taskBuilder", "forms/headerBuilder", "forms/formBuilder", "forms/formHelper"], function (taskBuilder, headerBuilder, formBuilder, formHelper, messagesStructure) {

    var saveUrl = pageForm.saveUrl;
    var mainContainer = $(pageForm.container);
    var headerContainer = $('.page_bar').empty(); //use new page header div, just clear it out before adding things
    var formContainer = $('<div/>').addClass("page-form");
    var taskContainer = $('<div data-bind="affix:{top:auto}" class="task-panel task-panel-narrow"></div>');
    var dataVM = kendo.observable(pageForm.viewModel);
    var current;
    var isAnalystAndValidAPLicense = session.user.Analyst && session.consoleSetting.AnalystPortalLicense.IsValid;
    var userPickerControl = require("forms/fields/userPicker/controller");
    var bEnableActionLog = (pageForm.type === 'ManualActivity') ? session.consoleSetting.MAEnableActionLog : session.consoleSetting.RAEnableActionLog;
    var bEnableReAssignment = (pageForm.type === 'ManualActivity') ? session.consoleSetting.MAEnableReAssignment : session.consoleSetting.RAEnableReAssignment;
    var bEnableViewUserDetails = (pageForm.type === 'ManualActivity') ? session.consoleSetting.MAEnableViewAffectedUserDetails : session.consoleSetting.RAEnableViewAffectedUserDetails;
    var bCanEditActivity = (pageForm.type === 'ManualActivity') ? session.user.Security.CanEditManualActivity : session.user.Security.CanEditReviewActivity;

    var actionLogControl = require("forms/predefined/actionLog/controller");
    var enumPickerControl = require("forms/fields/enum/controller");


    //check for errors
    if (!_.isUndefined(pageForm.viewModel.WorkItemErrorMessage)) {
        var jumbotron = $('<div/>').addClass('jumbotron');
        jumbotron.append($('<h1 />').addClass("error uppercase").html("<i class='fa fa-frown-o'></i> " + localization.Failed));
        jumbotron.append($('<p />').addClass("error").html(pageForm.viewModel.WorkItemErrorMessage));

        mainContainer.parent().append(jumbotron);
        $("#form").css("display", "none");

        app.lib.mask.remove();
        $("body").css("cursor", "auto");
        return;
    }

    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
    if (app.isMobile()) {
        pageForm.headerTemplate = {
            rows: [
                {
                    columns: [
                        { View: "approval" },
                    ]
                }
            ]
        };
    } else {
        pageForm.headerTemplate = {
            rows: [
                {
                    columns: [
                        { View: "sticky" },
                    ]
                }
            ]
        };
    }


    pageForm.taskTemplate = { tasks: [] };
    if (pageForm.type === 'ManualActivity') {
        pageForm.taskTemplate = {
            tasks: [
                { Task: "analystByGroup", Label: localization.AssignToAnalystByGroup, Access: isAnalystAndValidAPLicense && session.consoleSetting.MAEnableGroupAssign && bCanEditActivity, Configs: { propertyName: pageForm.MASupportGroupField, enumId: pageForm.MASupportGroupGuid } }
            ]
        };
    }

    pageForm.formTemplate = {};



    var init = function () {



        if (!app.isMobile()) {
            var alertContainer = $('#alertMessagesContainer');
            alertContainer.addClass("sticky-header");
            formContainer.addClass("sticky-header-activity");
            taskContainer.addClass("sticky-header-activity");
            headerContainer.addClass("sticky-header");

            //add dynamic containers to main container
            mainContainer.append(formContainer);
            mainContainer.before(taskContainer);
        } else {
            mainContainer.append(formContainer);
            mainContainer.after(taskContainer);
        }

        //build out tasks
        if (pageForm.taskTemplate.tasks.length > 0) {
            taskContainer.append("<h2>" + localization.Tasks + "</h2>");
            taskBuilder.build(pageForm, function (view) {
                taskContainer.append(view);
            });
        }

        //build and add header container
        headerBuilder.build(pageForm, function (view) {
            headerContainer.append(view);
        });

        //build and add form from json definition
        formBuilder.build(pageForm, function (html) {
            //if any, display notification messages
            app.lib.handleMessages();

            //get the topmost parent workitem
            var getActivityParentWorkItem = function (activityId) {
                return $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: "/Search/GetActivityParentWorkItem",
                    data: {
                        id: activityId
                    }
                });
            }

            //get the topmost parent workitem details
            var getParentWorkItem = function (parentWorkItem) {
                return $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: "/Search/GetObjectProjectionByWorkItemID",
                    data: {
                        workitemId: parentWorkItem.ParentWorkItemId,
                        workitemType: parentWorkItem.ParentWorkItemType
                    }
                });
            }

            getActivityParentWorkItem(dataVM.BaseId).then(function (data) {
                getParentWorkItem(data).then(function (result) {
                    //set parent workitem
                    dataVM.set("ParentWorkItem", result);
                    pageForm.jsonRaw.ParentWorkItem = result;
                    pageForm.viewModel.NameRelationship.unshift({ Name: "ParentWorkItem", RelationshipId: "2da498be-0485-b2b2-d520-6ebd1698e61b" });
                    pageForm.jsonRaw.NameRelationship.unshift({ Name: "ParentWorkItem", RelationshipId: "2da498be-0485-b2b2-d520-6ebd1698e61b" });
                    //2DA498BE-0485-B2B2-D520-6EBD1698E61B
                    //dataVM.set("ApprovalModel", pageForm.view.approvalModel);
                    //if (dataVM."dae75d12-89ac-a8d8-4fe3-516c2a6a26f7")

                    //add edit link urls to viewModel
                    dataVM.ActivityEditUrl = app.lib.getLinkUrl(dataVM.ClassName.split(".").pop(), dataVM.Id);
                    dataVM.WorkItemEditUrl = app.lib.getLinkUrl(dataVM.ParentWorkItem.ClassName.split(".").pop(), dataVM.ParentWorkItem.Id);
                    dataVM.EnableParentLink = session.consoleSetting.AnalystPortalLicense.IsValid;
                    dataVM.DisableParentLink = !session.consoleSetting.AnalystPortalLicense.IsValid;
                    dataVM.EnableReAssignment = bEnableReAssignment && bCanEditActivity;
                    dataVM.EnableViewAffectedUserDetails = bEnableViewUserDetails;

                    var review = _.find(pageForm.viewModel.Reviewer, function (reviewItem) {
                        if (_.isUndefined(reviewItem.User)) {
                            return null;
                        }
                        var group = _.find(pageForm.userGroup, function (group) {
                            return reviewItem.User.BaseId == group.Id;
                        });
                        return !_.isUndefined(reviewItem.User) && (reviewItem.User.BaseId == session.user.Id || !_.isUndefined(group));
                    });
                    dataVM.RAReviewerTemp = (review) ? review.User : null;

                    //build and add user input panel bar 
                    var userInputs = [];
                    var prop = (!_.isNull(dataVM.ParentWorkItem.UserInput)) ? dataVM.ParentWorkItem.UserInput.UserInputs.UserInput : null;
                    if (!_.isUndefined(prop) && !_.isNull(prop)) {
                        if (prop.length) {
                            userInputs = prop;
                        } else if (_.isObject(prop)) {
                            userInputs.push(prop);
                        }
                    }

                    //format display text for dates, enums, and query results
                    _.each(userInputs, function (userInput) {
                        switch (userInput.Type) {
                            case "datetime":
                                userInput.Answer = app.lib.getFormattedLocalDateTime(userInput.Answer);
                                break;
                            case "enum":
                                app.lib.getEnumDisplayName(userInput.Answer, function (data) {
                                    userInput.Answer = data;
                                });
                                break;
                            case "System.SupportingItem.PortalControl.InstancePicker":
                                userInput.Answer = app.lib.getQueryResultDisplayText(userInput);
                                break;
                            default:
                                break;
                        }
                    });

                    var userInputViewModel = new kendo.observable({
                        Count: userInputs.length,
                        UserInputs: userInputs
                    });

                    var template = kendo.template($("#panelbar-template").html());
                    var result = template(userInputViewModel);
                    $(".user-input-panel").html(result);

                    //default description to "No Description" if empty
                    if ((_.isNull(dataVM.Description)) || (dataVM.Description == "")) { dataVM.set("Description", localization.NoDescription); }
                    if ((_.isNull(dataVM.ParentWorkItem.Description)) || (dataVM.ParentWorkItem.Description == "")) { dataVM.ParentWorkItem.set("Description", localization.NoDescription); }

                    //apply controls to form
                    app.controls.apply($("#form"), { localize: true, vm: dataVM, bind: true });

                    //This will add action log to activity form
                    //This should be created last to avoid conflict when creating action log UI and funtions to the default one.
                    if (bEnableActionLog && session.user.Analyst && (!_.isEmpty(pageForm.viewModel.ParentWorkItem.AppliesToTroubleTicket) || !_.isEmpty(pageForm.viewModel.ParentWorkItem.AppliesToWorkItem))) {
                        var actionLogTemplate = $("#action-log-template").html();

                        $("#ra-activity-action-log").html(actionLogTemplate);
                        buildActionLog($('#ra-activity-action-log'), { Disabled: false }, dataVM.ParentWorkItem);
                    }

                    //build out userpicker controls
                    if (bEnableReAssignment) {
                        if (pageForm.type == "ManualActivity") {
                            buildUserPicker($('#ma-assigned-workitem'), { PropertyName: "AssignedWorkItem", PropertyDisplayName: "ActivityImplementer", Disabled: dataVM.Status.Id != '11fc3cef-15e5-bca4-dee0-9c1155ec8d83', vm: dataVM });
                        }
                        if (pageForm.type == "ReviewActivity") {
                            buildUserPicker($('#ra-assign-reviewer'), { PropertyName: "RAReviewerTemp", PropertyDisplayName: "Reviewer", Disabled: (review && review.Decision.Id == 'dae75d12-89ac-a8d8-4fe3-516c2a6a26f7') ? false : true, vm: dataVM });
                        }
                    }

                    if (bEnableViewUserDetails) {
                        buildUserPicker($('#wi-assigned-workitem'), { PropertyName: "AssignedWorkItem", PropertyDisplayName: "AssignedUser", Disabled: true, vm: dataVM.ParentWorkItem });
                        buildUserPicker($('#wi-requested-workitem'), { PropertyName: "RequestedWorkItem", PropertyDisplayName: "AffectedUser", Disabled: true, vm: dataVM.ParentWorkItem });
                    }

                    if (pageForm.type == "ManualActivity") {
                        //build out status picker control
                        var isDisabled = pageForm.viewModel.Status.Id == app.constants.workItemStatuses.ManualActivity.Completed ||
                            pageForm.viewModel.Status.Id == app.constants.workItemStatuses.ManualActivity.Failed;
                        if (!!pageForm.MASupportGroupField) {
                            buildEnumPicker($('.wi-supportgroup'), { Disabled: isDisabled, PropertyDisplayName: "SupportGroup", PropertyName: pageForm.MASupportGroupField, EnumId: pageForm.MASupportGroupGuid, vm: dataVM }, dataVM);
                        }
                    }

                });
            });


            //build out the review status section 
            if (!_.isUndefined(dataVM.Reviewer) && dataVM.Reviewer.length > 0) {
                var notYetVoted = "dae75d12-89ac-a8d8-4fe3-516c2a6a26f7";
                var review = _.find(pageForm.viewModel.Reviewer, function (reviewItem) {
                    if (_.isUndefined(reviewItem.User)) {
                        return null;
                    }
                    var group = _.find(pageForm.userGroup, function (group) {
                        return reviewItem.User.BaseId == group.Id;
                    });

                    return !_.isUndefined(reviewItem.User) && (reviewItem.User.BaseId == session.user.Id || !_.isUndefined(group));
                });

                if (!review) return;

                var bIsReviewed = review.Decision.Id !== notYetVoted;

                dataVM.set("isReviewed", bIsReviewed);
                dataVM.set("reviewDetails", {
                    fullDetails: review,
                    decisionDate: kendo.toString(new Date(review.DecisionDate), "g")
                });
            }
            formContainer.show();
        });

        // Disable the approval buttons if the reviewer is changed.
        $(() => {
            if (typeof pageForm !== 'undefined') {
                pageForm?.viewModel?.bind("change", (e) => {
                    if (e.field === 'reviewDetails.fullDetails.User.BaseId') {
                        const assignedReviewer = pageForm.viewModel.get(e.field);
                        if (assignedReviewer != session.user.Id) {
                            pageForm.view.approvalHeaderModel.set("disabledButtons", true);
                            $(".btn-review").prop('disabled', true);
                        }
                    }
                    if (e.field === 'AssignedWorkItem.BaseId') {
                        const assignedUser = pageForm.viewModel.get(e.field);
                        if (assignedUser != session.user.Id) {
                            pageForm.view.approvalHeaderModel.set("disabledMAButtons", true);
                            $(".btn-manual").prop('disabled', true);
                        }
                    }
                })
            }
        });


        //var $taskPanel = $('.task-panel').first();
        //$taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });


        if (typeof (drawermenu) != 'undefined') {
            if (bEnableReAssignment || bEnableActionLog || session.consoleSetting.MAEnableGroupAssign) {
                createButtons();
            }
        } else {
            app.events.subscribe("drawerCreated", function () {
                if (bEnableReAssignment || bEnableActionLog || session.consoleSetting.MAEnableGroupAssign) {
                    createButtons();
                }
            });
        }

        // prevent 'enter' key from submitting form on older browsers.
        formContainer.on('keypress', function (e) {
            app.lib.stopEnterKeySubmitting(e);
        });

        if (!app.isMobileDevice()) {
            var $taskPanel = $('.task-panel').first();
            $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });
            kendo.data.binders.yScrollOnResize($taskPanel[0], { yScrollOnResize: { path: { top: 'auto', bottom: 50 } } }, {});
        }

        app.lib.CleanPageFormViewModel(pageForm.viewModel);

        //let them in
        app.lib.mask.remove();
    }

    var buildActionLog = function (container, props, vmModel) {
        actionLogControl.build(vmModel, props, function (enumControl) {
            container.html(enumControl);
            app.controls.apply(container, {
                localize: true,
                vm: vmModel,
                bind: true
            });
        });
    };

    var buildUserPicker = function (container, props, vmModel) {
        userPickerControl.build(vmModel, props, function (enumControl) {
            container.html(enumControl);
            app.controls.apply(container, {
                localize: true,
                vm: vmModel,
                bind: true
            });
        });
    };

    var buildEnumPicker = function (container, props, vmModel) {
        enumPickerControl.build(vmModel, props, function (enumControl) {
            container.html(enumControl);
            app.controls.apply(container, {
                localize: true,
                vm: vmModel,
                bind: true
            });
        });
    };

    var createButtons = function () {
        // Save Failure
        var saveFailure = function (exceptionMessage) {
            if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                app.lib.message.add(exceptionMessage, "danger");
            } else {
                //fallback to generic message
                app.lib.message.add(localization.PleaseCorrectErrors, "danger");
            }
            app.lib.message.show();
        }

        // Save Button
        drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {
            save(function (data) {
                var message = "";
                var link = "";
                switch (pageForm.type) {
                    case "ManualActivity":
                        message = localization.ManualActivitySavedMessage;
                        link = "/ManualActivity/Complete/" + dataVM.Id;
                        break;
                    case "ReviewActivity":
                        message = localization.ReviewActivitySavedMessage;
                        link = "/ReviewActivity/Approval/" + dataVM.Id;
                        break;
                    default:
                        message = localization.WorkItemSavedMessage;
                        break;
                }

                if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                    var queryStringParams = app.lib.getQueryParams();
                    if (!_.isUndefined(queryStringParams.activityid) && !_.isNull(queryStringParams.activityid)) {
                        link = link + "?activityId=" + queryStringParams.activityid + "&tab=activity";
                        message = localization.WorkItemSavedMessage;
                        app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + queryStringParams.activityid + "</strong></a> ", "success");
                    } else {
                        app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + dataVM.Id + "</strong></a> ", "success");
                    }
                } else {
                    app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + dataVM.Id + "</strong></a> ", "success");
                }

                app.lib.gotoFormReturnUrl();
                return;

            }, saveFailure);
        });

        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {
            save(function (data) {
                app.lib.message.add(localization.ChangesApplied, "success");

                var link = "";
                switch (pageForm.type) {
                    case "ManualActivity":
                        link = "/ManualActivity/Complete/" + dataVM.Id;
                        break;
                    case "ReviewActivity":
                        link = "/ReviewActivity/Approval/" + dataVM.Id;
                        break;
                    default:
                        location.href = "/WorkItems/MyItems/";
                        break;
                }

                if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                    var queryStringParams = app.lib.getQueryParams();
                    if (!_.isUndefined(queryStringParams.activityid) && !_.isNull(queryStringParams.activityid)) {
                        link = link + "?activityId=" + queryStringParams.activityid + "&tab=activity";
                    };
                }
                location.href = link;

            }, saveFailure);
        });

        // Cancel Button
        drawermenu.addButton(localization.Cancel, "fa fa-times cs-form__drawer--cancel", function () {
            if (dataVM.get("isDirty")) {
                $.when(kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: localization.UnsavedDataMessage,
                    icon: "fa fa-exclamation"
                })
                ).done(function (response) {
                    if (response.button === "ok") {
                        //make sure we set the dirty flag off
                        dataVM.set("isDirty", false);

                        app.lib.gotoFormReturnUrl();
                        return;
                    }
                });
            } else {
                app.lib.gotoFormReturnUrl();
                return;
            }
        });

        //Create Mobile Tasks button
        if (pageForm.taskTemplate.tasks.length > 0) formHelper.mobileDrawerTaskButton(taskContainer);


        if (pageForm.isNew == false) {
            drawermenu.addButton(localization.Delete, "fa fa-trash cs-form__drawer--delete", function () {
                $.when(kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: localization.DeleteAnnouncement,
                    icon: "fa fa-exclamation"
                })
                ).done(function (response) {
                    if (response.button === "ok") {
                        $.ajax({
                            type: "DELETE",
                            url: app.lib.addUrlParam(pageForm.deleteUrl, "announcementId", getObjectId()),
                            success: function () {
                                location.href = "/View/903eb5d5-fea1-4e4d-85ba-f4c386a6e054";
                            }
                        });
                    }
                });
            });
        }
    }

    var getDisplayName = function () {
        switch (pageForm.type) {
            default:
                return dataVM.Title;
        }
    }

    var getPostObject = function (postData) {
        switch (pageForm.type) {
            case "Announcement":
                var formData = postData.current;
                var announcement = {
                    Id: formData.Id,
                    Title: formData.Title,
                    Priority: formData.Priority,
                    Body: formData.Body,
                    AccessGroupId: formData.AccessGroupId,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    Locale: session.user.LanguageCode
                }
                return JSON.stringify(announcement);
            default:
                return encodeURIComponent(JSON.stringify(postData));
        }
    }

    var getObjectId = function () {
        switch (pageForm.type) {
            case "Announcement":
                return dataVM.Id;
            default:
                return dataVM.BaseId;
        }
    }


    var saveNow = function (success, failure, current, original, reloadPage) {
        if (pageForm.type !== "ReviewActivity") {
            //RAs Reviewer field doesnt get updated when it hits this line
            app.lib.optimizeFormMultiObject.BeforeSave(current, original);
        }
        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: current.toJSON(),
            original: original
        }));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: pageForm.saveUrl,
            data: "formJson=" + postData,
            success: function (data, status, xhr) {
                if (data.search('loginForm') < 0) { // Logged out check    
                    success(data);
                } else {
                    //session expired
                    window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //do we have a data conflict
                if (xhr.status == 409) {

                    $.when(kendo.ui.ExtYesNoDialog.show({
                        title: localization.DataConflict,
                        message: localization.DataConflictError + "<br/><br/><small>(" + localization.DataConflictDescription + ")</small>",
                        icon: "fa fa-exchange text-danger",
                        width: "500px",
                        height: "175px"
                    })
                    ).done(function (response) {
                        if (reloadPage) {
                            if (response.button === "yes") {
                                //open in new tab, may not work this way in all browsers
                                window.open(window.location.pathname);
                            } else {
                                //refresh page
                                location.href = window.location.pathname;
                            }
                        }
                    });

                } else if (xhr.status == 503) { //SDK unavailable
                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.ReconnectRequired;
                    if (jsonRsp.exception && jsonRsp.exception.length > 0) {
                        errorMsg = jsonRsp.exception;
                    }
                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });
                } else if (xhr.status == 403) { //user does not have access
                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (jsonRsp.exception && jsonRsp.exception.length > 0) {
                        errorMsg = jsonRsp.exception;
                    }
                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });

                } else {
                    console && app.lib.log(localization.RequestFailed);
                    app.lib.log(thrownError);

                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);

                    var errorMsg = localization.RequestFailed;
                    if (jsonRsp.exception && jsonRsp.exception.length > 0) {
                        errorMsg = jsonRsp.exception;
                    }

                    kendo.ui.ExtAlertDialog.show({
                        title: localization.ErrorDescription,
                        message: errorMsg,
                        icon: "fa fa-exclamation"
                    });
                }
            },
            processData: false,
            async: false
        });
    }


    // Ajax Save Method (to be moved)
    var save = function (success, failure) {

        //save parent when action log is enabled
        if (bEnableActionLog) {
            saveNow(success, failure, pageForm.viewModel.ParentWorkItem, pageForm.jsonRaw.ParentWorkItem, false);
        }

        delete pageForm.viewModel.ParentWorkItem;
        delete pageForm.jsonRaw.ParentWorkItem;
        delete pageForm.viewModel.Description;
        delete pageForm.jsonRaw.Description;

        var reviewer = pageForm.jsonRaw.Reviewer;
        if (pageForm.type == "ReviewActivity" && dataVM.RAReviewerTemp !== null && dataVM.RAReviewerTemp.BaseId !== session.user.Id && !dataVM.isReviewed) {
            var model = {
                "Comments": null,
                "Decision": {
                    "Id": null,
                    "Name": null
                },
                "DecisionDate": null,
                "DisplayName": null,
                "MustVote": false,
                "ReviewerId": null,
                "Veto": true,
                "ClassTypeId": null,
                "BaseId": null,
                "FullName": null,
                "Path": null,
                "TimeAdded": null,
                "ClassName": null,
                "LastModified": null,
                "LastModifiedBy": null,
                "User": {
                    "Id": null,
                    "Name": null
                },
                "VotedBy": {
                    "Id": null,
                    "Name": null
                }
            }
            $.ajax({
                url: "/api/V3/Enum/GetList",
                dataType: 'json',
                async: false,
                data: { Id: "717a1f99-9587-fa8c-aa60-14906933d457" },
                success: function (data) {
                    enums = data;
                    // get clone of model
                    var mdl = {}; $.extend(true, mdl, model);
                    // get user data from picker
                    mdl.User = dataVM.RAReviewerTemp;
                    // get checkbox values
                    mdl.Veto = false;
                    mdl.MustVote = false;
                    mdl.Decision = app.lib.getArrayItemById(enums, "dae75d12-89ac-a8d8-4fe3-516c2a6a26f7");
                    mdl.Decision.Name = mdl.Decision.Text;
                    //remove current reviewer
                    reviewer = _.filter(reviewer, function (rev) {
                        return rev.User.BaseId !== session.user.Id;
                    });
                    //push new reviewer
                    var checkIfExist = _.filter(reviewer, function (rev) {
                        return rev.User.BaseId === dataVM.RAReviewerTemp.BaseId;
                    });
                    if (checkIfExist.length == 0) {
                        reviewer.push(mdl)
                        pageForm.viewModel.set("Reviewer", reviewer);
                    }
                    saveNow(success, failure, pageForm.viewModel, pageForm.jsonRaw, true);
                }
            });
        } else {
            saveNow(success, failure, pageForm.viewModel, pageForm.jsonRaw, true);
        }

        saveNow(success, failure, pageForm.viewModel.ParentWorkItem, pageForm.jsonRaw.ParentWorkItem, false);
    }

    init();
});