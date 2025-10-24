/**
Header Sticky
**/
define(function (require) {
    var tpl = require("text!forms/header/sticky/view.html");
    var attachmentPickerFlyout = require("forms/flyout/fileAttachmentsFlyout/controller");
    var userPickerControl = require("forms/fields/userPicker/controller");
    var enumPickerControl = require("forms/fields/enum/controller");
    var remoteManageWidget = require("forms/flyout/remoteManageWidget/controller");

    if (app.featureSet.isActive("HeaderAttachments"))
        var headerAttachmentWidget = require("forms/flyout/headerAttachmentWidget/controller");
    const buildUserPicker = function (container, props, vmModel) {
        userPickerControl.build(vmModel, props, function (userControl) {
            container.html(userControl);
            app.controls.apply(container, {
                localize: true,
                vm: vmModel,
                bind: true
            });
        });
    };
    const buildEnumPicker = function (container, props, vmModel) {
        enumPickerControl.build(vmModel, props, function (enumControl) {
            container.html(enumControl);
            app.controls.apply(container, {
                localize: true,
                vm: vmModel,
                bind: true
            });
        });
    };

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //add FileAttachment on viewModel if not found
            if (_.isUndefined(vm.viewModel.FileAttachment)) {
                vm.viewModel.set("FileAttachment", []);
            }

            vm.view.showAttachments = app.featureSet.isActive("HeaderAttachments");

            vm.view.statusVisible = function () {
                if (vm.newWI) {
                    return false;
                } else {
                    return true;
                }
            }

            vm.view.showRemoteManageIcon = (session.consoleSetting.TrueControlCenterURL && !app.isMobile() && session.user.Analyst) ? true : false;

            //this section is for the ma/ra approval header buttons
            var rejected = "107fc6bd-2bb3-0282-4425-f43b5b32ef13";
            var approve = "0e856c6c-04e5-0a8e-6041-bc7715b4747e";
            var notYetVoted = "dae75d12-89ac-a8d8-4fe3-516c2a6a26f7";
            vm.view.approvalHeaderModel = new kendo.observable({
                IsActivityHeader: pageForm.type == "ReviewActivity" || pageForm.type == "ManualActivity",
                EnableParentLink: session.consoleSetting.AnalystPortalLicense.IsValid,
                ActivityEditUrl: app.lib.getLinkUrl(vm.viewModel.ClassName.split(".").pop(), vm.viewModel.Id),
                ActivityText: localization.Activity,
                decisionEnumId: null,
                comments: "",
                onRejectClick: function () {
                    vm.view.approvalHeaderModel.decisionEnumId = rejected;
                    vm.view.approvalHeaderModel.updateStatus();
                },
                onApproveClick: function () {
                    vm.view.approvalHeaderModel.decisionEnumId = approve;
                    vm.view.approvalHeaderModel.updateStatus();
                },
                onCompleteClick: function () {
                    var status = { Id: app.constants.workItemStatuses.ManualActivity.Completed, Name: localization.Completed };
                    vm.view.approvalHeaderModel.updateManualActivity(status);
                },
                onFailClick: function () {
                    var status = { Id: app.constants.workItemStatuses.ManualActivity.Failed, Name: localization.Failed }
                    vm.view.approvalHeaderModel.updateManualActivity(status);
                },
                updateStatus: function () {
                    if (vm.view.approvalHeaderModel.isReviewActivity) {
                        vm.view.approvalHeaderModel.updateReviewActivity();
                    }

                    if (vm.view.approvalHeaderModel.isManualActivity) {
                        vm.view.approvalHeaderModel.updateManualActivity();
                    }
                },
                handleError: (xhr, thrownError) => {
                    const jsonResponse = xhr.responseText;
                    switch (xhr.status) {
                        case 409: {
                            $.when(kendo.ui.ExtYesNoDialog.show({
                                title: localization.DataConflict,
                                message: localization.DataConflictError + "<br/><br/><small>(" + localization.DataConflictDescription + ")</small>",
                                icon: "fa fa-exchange text-danger",
                                width: "500px",
                                height: "175px"
                            })
                            ).done(function (response) {
                                if (response.button === "yes") {
                                    //open in new tab, may not work this way in all browsers
                                    window.open(window.location.pathname, '_blank');
                                } else {
                                    //refresh page
                                    location.href = window.location.pathname;
                                }
                            });
                            break;
                        }
                        case 503: {
                            app.lib.log(jsonResponse);
                            //determine error Message
                            const errorMsg = localization.ReconnectRequired;
                            if (jsonResponse.exception && jsonResponse.exception.length > 0) {
                                errorMsg = jsonResponse.exception;
                            }
                            //alert the user
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.Failed,
                                message: errorMsg,
                                icon: "fa fa-times-circle text-danger"
                            });
                            break;
                        }
                        case 403: {
                            app.lib.log(jsonResponse);
                            //determine error Message
                            const errorMsg = localization.RequestFailed;
                            if (jsonResponse.exception && jsonResponse.exception.length > 0) {
                                errorMsg = jsonResponse.exception;
                            }
                            //alert the user
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.Failed,
                                message: errorMsg,
                                icon: "fa fa-times-circle text-danger"
                            });
                            break;
                        }
                        default: {
                            console && app.lib.log(localization.RequestFailed);
                            app.lib.log(thrownError);
                            app.lib.log(jsonResponse);

                            var errorMsg = localization.RequestFailed;
                            if (jsonResponse.exception && jsonResponse.exception.length > 0) {
                                errorMsg = jsonResponse.exception;
                            }

                            kendo.ui.ExtAlertDialog.show({
                                title: localization.ErrorDescription,
                                message: errorMsg,
                                icon: "fa fa-exclamation"
                            });
                        }
                    }
                },
                generatePostData: (originalActivity, modifiedActivity) => {
                    return encodeURIComponent(JSON.stringify({
                        isDirty: true,
                        current: modifiedActivity,
                        original: originalActivity,
                    }));
                },
                updateReviewActivity: function () {
                    $.when(app.controls.ReviewDecisionCommentDialog.show({
                        title: localization.Comments,
                        message: localization.DoYouHaveComments,
                        required: true,
                        height: 250
                    })
                    ).done(function (response) {
                        if (response.button === "yes") {
                            vm.view.approvalHeaderModel.comments = response.input;
                        }

                        _.each(pageForm.viewModel.Reviewer, function (reviewItem) {
                            var group = _.find(pageForm.userGroup, function (group) {
                                return (!_.isUndefined(reviewItem.User)) ? reviewItem.User.BaseId == group.Id : false;
                            });

                            if (reviewItem.Decision.Id == notYetVoted
                                && ((!_.isUndefined(reviewItem.User) && reviewItem.User.BaseId == session.user.Id)
                                    || !_.isUndefined(group))) {
                                const reviewer = pageForm.jsonRaw.Reviewer.find(
                                    (element) => element.BaseId === reviewItem.BaseId
                                );
                                const simpleReviewer = {
                                    BaseId: reviewItem.BaseId,
                                    TimeAdded: reviewItem.TimeAdded,
                                    Decision: { Id: reviewItem.Decision?.Id },
                                    DecisionDate: reviewItem.DecisionDate,
                                    Comments: reviewItem.Comments,
                                    VotedBy: { BaseId: reviewItem.VotedBy?.Id },
                                    NameRelationship: [
                                        { Name: "VotedBy", RelationshipId: "9441a6d1-1317-9520-de37-6c54512feeba" },
                                    ],
                                };
                                var comment = "";
                                if (!!reviewItem.Comments) {
                                    comment = reviewItem.Comments + "\n" + vm.view.approvalHeaderModel.comments;
                                }
                                else {
                                    comment = vm.view.approvalHeaderModel.comments;
                                }
                                const decisionDate = new Date().toISOString();

                                const original = {
                                    ...simpleReviewer,
                                };
                                const current = {
                                    ...simpleReviewer,
                                    DecisionDate: decisionDate,
                                    Decision: { Id: vm.view.approvalHeaderModel.decisionEnumId },
                                    Comments: comment,
                                    VotedBy: { BaseId: session.user.Id },
                                };
                                const reviewerObject = vm.view.approvalHeaderModel.generatePostData(original, current);
                                $.ajax({
                                    type: 'POST',
                                    dataType: 'text',
                                    url: pageForm.saveUrl,
                                    data: "formJson=" + reviewerObject,
                                })
                                    .done((data) => {
                                        if (data.indexOf('loginForm') < 0) { // Logged out check    
                                            var successMessage = vm.view.approvalHeaderModel.decisionEnumId == "0e856c6c-04e5-0a8e-6041-bc7715b4747e" ?
                                                localization.ReviewActivityApprovedMessage : localization.ReviewActivityRejectedMessage;
                                            app.lib.message.add(successMessage.replace("{0}", vm.viewModel.Id), "success");
                                            app.lib.handleMessages();

                                            // Disable the Reviewer change control
                                            buildUserPicker($('#ra-assign-reviewer'), { PropertyName: "RAReviewerTemp", PropertyDisplayName: "Reviewer", Disabled: true, vm: vm.viewModel });
                                        } else {
                                            //session expired
                                            window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                                        }
                                        $(".btn-review").prop('disabled', true);
                                        reviewer.VotedBy = { BaseId: session.user.Id };
                                        reviewer.Decision = { Id: vm.view.approvalHeaderModel.decisionEnumId };
                                        reviewer.Comments = comment;
                                        reviewer.DecisionDate = decisionDate;
                                        reviewItem.VotedBy = { BaseId: session.user.Id };
                                        reviewItem.Decision = { Id: vm.view.approvalHeaderModel.decisionEnumId };
                                        reviewItem.set("Comments", comment);
                                        reviewItem.set("DecisionDate", decisionDate);
                                    })
                                    .fail((xhr, ajaxOptions, thrownError) => {
                                        vm.view.approvalHeaderModel.handleError(xhr, thrownError);
                                    })
                            }
                        });
                    })
                },
                updateManualActivity: function (status) {
                    $.when(kendo.ui.ExtYesNoTextAreaDialog.show({
                        title: session.consoleSetting.RequireImplementationNotes ? localization.ImplementationdetailsRequired : localization.Implementationdetails,
                        buttons: [
                            {
                                name: localization.Save,
                                click: function (e) {
                                    var $inputText = $("#extInputDialog .k-ext-input-dialog-input");
                                    var comment = $("#extInputDialog .k-ext-input-dialog-input").val();
                                    var currentNotes = (!!pageForm.viewModel.Notes) ? pageForm.viewModel.Notes + "\n" : "";

                                    if (e.dialog.options.required && $inputText.val().length == 0) {
                                        $inputText.addClass(e.dialog.options.requiredCss);
                                    } else {
                                        const actualEndDate = new Date().toISOString();

                                        const modifiedActivity = {
                                            BaseId: pageForm.viewModel.BaseId,
                                            TimeAdded: pageForm.viewModel.TimeAdded,
                                            Status: status,
                                            ActualEndDate: actualEndDate,
                                            Notes: currentNotes + comment,
                                        }
                                        const originalActivity = {
                                            BaseId: pageForm.jsonRaw.BaseId,
                                            TimeAdded: pageForm.jsonRaw.TimeAdded,
                                            Status: pageForm.jsonRaw.Status,
                                            ActualEndDate: pageForm.jsonRaw.ActualEndDate,
                                            Notes: pageForm.jsonRaw.Notes,
                                        }
                                        if (!!pageForm.MASupportGroupGuid) {
                                            originalActivity[pageForm.MASupportGroupField] = {};
                                            originalActivity[pageForm.MASupportGroupField].Id = pageForm.jsonRaw[pageForm.MASupportGroupField]?.Id;
                                            modifiedActivity[pageForm.MASupportGroupField] = {};
                                            modifiedActivity[pageForm.MASupportGroupField].Id = pageForm.viewModel[pageForm.MASupportGroupField]?.Id;
                                        }

                                        var postData = encodeURIComponent(JSON.stringify({
                                            isDirty: true,
                                            current: modifiedActivity,
                                            original: originalActivity
                                        }));

                                        $.ajax({
                                            type: 'POST',
                                            dataType: 'text',
                                            url: pageForm.saveUrl,
                                            data: "formJson=" + postData,
                                        })
                                            .done((data) => {
                                                if (data.search('loginForm') < 0) { // Logged out check
                                                    pageForm.viewModel.set("Status", status)
                                                    pageForm.viewModel.set("ActualEndDate", actualEndDate);
                                                    pageForm.viewModel.set("Notes", modifiedActivity.Notes);
                                                    pageForm.jsonRaw.Status = status;
                                                    pageForm.jsonRaw.ActualEndDate = actualEndDate;
                                                    pageForm.jsonRaw.Notes = modifiedActivity.Notes;
                                                    const successMessage = (pageForm.viewModel.Status.Id == app.constants.workItemStatuses.ManualActivity.Completed) ?
                                                        localization.ManualActivityCompletedMessage :
                                                        localization.ManualActivityFailedMessage;

                                                    app.lib.message.add(successMessage.replace("{0}", vm.viewModel.Id), "success");
                                                    app.lib.handleMessages();
                                                    $(".btn-manual").prop('disabled', true);

                                                    // Disable the Activity Implementer User Picker and Support Group controls
                                                    buildUserPicker($('#ma-assigned-workitem'), { PropertyName: "AssignedWorkItem", PropertyDisplayName: "ActivityImplementer", Disabled: true, vm: vm.viewModel });
                                                    if (!!pageForm.MASupportGroupField) {
                                                        buildEnumPicker($('.wi-supportgroup'), { Disabled: true, PropertyDisplayName: "SupportGroup", PropertyName: pageForm.MASupportGroupField, EnumId: pageForm.MASupportGroupGuid, vm: vm.viewModel }, vm.viewModel);
                                                    }

                                                } else {
                                                    //session expired
                                                    window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                                                }
                                            })
                                            .fail((xhr, ajaxOptions, thrownError) => {
                                                vm.view.approvalHeaderModel.handleError(xhr, thrownError);
                                            })
                                        e.dialog.close();
                                    }
                                },
                                cls: "btn-primary"
                            },
                            {
                                name: localization.Cancel,
                                click: function (e) {
                                    e.dialog.close();
                                }
                            }],
                        required: session.consoleSetting.RequireImplementationNotes,
                        requiredCss: "k-ext-required"
                    })
                    );
                },
                pageDataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    serverSorting: true,
                    transport: {
                        read: {
                            url: (pageForm.viewModel.ClassName && pageForm.viewModel.ClassName.toLowerCase().indexOf("reviewactivity") > -1) ? "/api/V3/WorkItem/GetGridWorkItemsMyApprovals/" : "/api/V3/WorkItem/GetGridWorkItemsMyManualActivities/",
                            xhrFields: {
                                withCredentials: true
                            },
                            data: {
                                userId: session.user.Id,
                                isScoped: session.user.Security.IsWorkItemScoped,
                                showInActives: false
                            },
                            cache: true
                        }
                    },
                    requestEnd: function (e) {
                        vm.view.approvalHeaderModel.updatePageDetails(e.response);
                    }
                }),
                updatePageDetails: function (data) {
                    //FIX Bug 23756: Only include activities that are not yet voted and are still in progress.
                    var activeData = [];
                    if (pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity") {
                        activeData = _.where(data, { Decision: localization.NotYetVoted, StatusId: "11fc3cef-15e5-bca4-dee0-9c1155ec8d83" });
                    }
                    else {
                        activeData = data;
                    }
                    var index = 0;
                    var pageCount = (!!activeData) ? activeData.length || 1 : 1;

                    _.find(activeData, function (item, idx) {
                        if (item.Id == vm.viewModel.Id) {
                            index = idx;
                        }
                    });

                    var pageString = (index + 1) + " / " + pageCount;
                    vm.view.approvalHeaderModel.set("currentPage", index);
                    vm.view.approvalHeaderModel.set("toatPage", pageCount);
                    vm.view.approvalHeaderModel.set("pageText", pageString);
                    vm.view.approvalHeaderModel.set("disablePrevious", (index == 0) ? true : false);
                    vm.view.approvalHeaderModel.set("disableNext", (index == pageCount - 1) ? true : false);

                    var statusInProgress = vm.viewModel.Status.Id === "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";

                    if (!statusInProgress || (!_.isUndefined(vm.viewModel.reviewDetails) && (vm.viewModel.reviewDetails.fullDetails.Decision.Id == approve || vm.viewModel.reviewDetails.fullDetails.Decision.Id == rejected) && (vm.viewModel.reviewDetails.fullDetails.User.BaseId == session.user.Id))) {
                        vm.view.approvalHeaderModel.set("disabledButtons", true);
                    }
                    else {
                        var review = _.find(pageForm.viewModel.Reviewer, function (reviewItem) {
                            if (_.isUndefined(reviewItem.User)) {
                                return null;
                            }
                            var group = _.find(pageForm.userGroup, function (group) {
                                return reviewItem.User.BaseId == group.Id;
                            });

                            return !_.isUndefined(reviewItem.User) && reviewItem.Decision.Id == notYetVoted && (reviewItem.User.BaseId == session.user.Id || !_.isUndefined(group));
                        });

                        if (!statusInProgress || (_.isUndefined(review) || _.isNull(review))) {
                            vm.view.approvalHeaderModel.set("disabledButtons", true);
                        }
                    }

                    $(".page-text").text(vm.view.approvalHeaderModel.pageText);
                    $(".page-next").prop('disabled', vm.view.approvalHeaderModel.disableNext);
                    $(".page-prev").prop('disabled', vm.view.approvalHeaderModel.disablePrevious);
                    $(".btn-review").prop('disabled', vm.view.approvalHeaderModel.disabledButtons);
                    $(".btn-manual").prop('disabled', vm.view.approvalHeaderModel.disabledMAButtons);

                    //rebind to element to update values
                    kendo.bind($(".content-header__container"), vm);
                },
                nextClick: function () {
                    var index = vm.view.approvalHeaderModel.get("currentPage") + 1;
                    vm.view.approvalHeaderModel.navigate(index);
                },
                previousClick: function () {
                    var index = vm.view.approvalHeaderModel.get("currentPage") - 1;
                    vm.view.approvalHeaderModel.navigate(index);
                },
                navigate: function (index) {
                    vm.view.approvalHeaderModel.pageDataSource.read();
                    var dSource = vm.view.approvalHeaderModel.pageDataSource.data();

                    var activeData = [];
                    if (pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity") {
                        activeData = _.where(dSource, { Decision: localization.NotYetVoted, StatusId: "11fc3cef-15e5-bca4-dee0-9c1155ec8d83" });
                    }
                    else {
                        activeData = dSource;
                    }

                    var nextItem = activeData[index];
                    var url = vm.view.approvalHeaderModel.isReviewActivity ? "/ReviewActivity/Approval/" : "/ManualActivity/Complete/";
                    var approvalUrl = url + nextItem.Id;

                    location.href = approvalUrl;
                },
                currentPage: 0,
                toatPage: 0,
                pageText: "",
                disablePrevious: false,
                disableNext: false,
                title: vm.view.title,
                workItemId: vm.viewModel.Id,
                statusVisible: vm.view.statusVisible,
                statusName: vm.viewModel.Status.Name,
                isParent: vm.viewModel.IsParent,
                isDesktopView: !app.isMobile(),
                isMobileView: app.isMobile(),
                disabledButtons: false,
                reviewResult: null,
                reviewId: 0,
                SupportGroupVisible: pageForm.MASupportGroupField !== "",
                SupportGroupEnumId: pageForm.MASupportGroupGuid,
                SupportGroupFieldValue: vm.viewModel[pageForm.MASupportGroupField],
                isManualActivity: pageForm.viewModel.ClassName == "System.WorkItem.Activity.ManualActivity",
                isReviewActivity: pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity",
                disabledMAButtons: pageForm.viewModel.Status.Id == app.constants.workItemStatuses.ManualActivity.Completed ||
                    pageForm.viewModel.Status.Id == app.constants.workItemStatuses.ManualActivity.Failed,
                displayApprovalHeader: (pageForm.viewModel.ClassName == "System.WorkItem.Activity.ManualActivity") ||
                    (pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity"),
            });


            vm.view.approvalHeaderModel.pageDataSource.read();
            var view = new kendo.View(built(), {
                wrap: false,
                init: function () {

                    setTimeout(function () {
                        DoWork();
                        if ($("#expanded_widget").length === 0 && vm.view.showRemoteManageIcon) {
                            remoteManageWidget.getWidget(vm);
                        }
                        if ($("#attachment_widget").length === 0 && vm.view.showAttachments) {
                            headerAttachmentWidget.getWidget(vm);
                        }
                        vm.view.approvalHeaderModel.updatePageDetails(vm.view.approvalHeaderModel.pageDataSource._data)
                    }, 100);
                },
                model: vm
            });

            //this function is called from the link parent task so we need to allow callback function to be an input
            vm.view.buildParentHeaderView = function (viewCallBack) {
                //build template using underscore.js so that we can interpret kendo template vars if needed
                var built = _.template(tpl);

                //modify vm for this view
                vm.view.controller = {
                    parentIncident: (vm.type === "ReleaseRecord") ? localization.ParentRecord : localization.Parentincident,
                    editHref: "/" + vm.type + "/Edit/" + vm.viewModel.ParentWorkItem.Id + "/",
                    editLink: vm.viewModel.ParentWorkItem.Id + "-" + vm.viewModel.ParentWorkItem.Title,
                    unlinkParent: function () {
                        $.when(kendo.ui.ExtYesNoDialog.show({
                            title: localization.UnlinkToParent,
                            message: localization.SureUnlinkToParent
                        })
                        ).done(function (response) {
                            if (response.button === "yes") {
                                delete vm.viewModel.ParentWorkItem;
                                vm.viewModel.set("isDirty", true);
                                vm.view.controller.isParent = false;
                                view.destroy();
                                view = new kendo.View(built(), {
                                    wrap: false,
                                    init: function () {

                                        setTimeout(function () {
                                            DoWork();
                                            if ($("#expanded_widget").length === 0 && vm.view.showRemoteManageIcon) {
                                                remoteManageWidget.getWidget(vm);
                                            }
                                            if ($("#attachment_widget").length === 0 && vm.view.showAttachments) {
                                                headerAttachmentWidget.getWidget(vm);
                                            }
                                        }, 100);
                                    },
                                    model: vm
                                });

                                callback(view.render());
                            }
                        });
                    },
                    isParent: (vm.viewModel.ParentWorkItem) ? true : false,
                    isAnalystUser: (session.user.Analyst) ? true : false
                }
                view.destroy();

                view = new kendo.View(built(), {
                    wrap: false,
                    init: function () {

                        setTimeout(function () {
                            DoWork();
                            if ($("#expanded_widget").length === 0 && vm.view.showRemoteManageIcon) {
                                remoteManageWidget.getWidget(vm);
                            }
                            if ($("#attachment_widget").length === 0 && vm.view.showAttachments) {
                                headerAttachmentWidget.getWidget(vm);
                            }
                        }, 100);
                    },
                    model: vm
                });


                viewCallBack(callback(view.render()));
            }

            vm.view.isSLOopen = false;

            vm.view.toggleSLODropdown = function () {
                vm.view.isSLOopen = !vm.view.isSLOopen;

                if (vm.view.isSLOopen)
                    $(".content-header__collapser__dropdown").addClass("content-header__collapser__dropdown--show");
                else
                    $(".content-header__collapser__dropdown").removeClass("content-header__collapser__dropdown--show");
            }

            window.closeSLODropdown = function () {
                vm.view.toggleSLODropdown();
            }

            var DoWork = function () {

                if (vm.viewModel["SLO"] && vm.viewModel["SLO"].length > 0) {

                    var first_sloObjects = [vm.viewModel["SLO"][0]],
                        first_sloContainer = $(".first-header-slo-container");

                    DoWorkSLOHeader(true, first_sloContainer, first_sloObjects, false);

                    var sloContainer = $(".header-slo-container"),
                        sloObjects = vm.viewModel["SLO"];

                    DoWorkSLOHeader(false, sloContainer, sloObjects, true);

                } else {
                    $(".first-header-slo-container").parent().hide();
                }
            }

            var DoWorkSLOHeader = function (headerslo, sloContainer, sloObjects, isDropdown) {
                var sloActive = "SLAInstance.Status.Active",
                    sloPaused = "SLAInstance.Status.Paused",
                    sloMet = "SLAInstance.Status.Met",
                    sloWarning = "SLAInstance.Status.Warning",
                    sloBreached = "SLAInstance.Status.Breached",
                    sloNotReady = "SLAInstance.Status.NotReady";

                for (var key in sloObjects) {
                    if (sloObjects[key].DisplayName == null) continue;
                    var isMet = false;
                    var isPaused = false;

                    //var sloTemplate = kendo.template(sloViewObj.find("#slo-template").html());
                    var sloTemplate = (isDropdown) ? kendo.template($("#header-slo-template").html()) : kendo.template($("#first-header-slo-template").html());

                    var sloObj = {};
                    sloObj.index = key;
                    sloObj.count = vm.viewModel["SLO"].length;
                    sloObj.Id = sloObjects[key].DisplayName.replace(" ", "");
                    sloObj.Title = sloObjects[key].DisplayName;

                    switch (sloObjects[key].Status) {
                        case sloActive:
                            sloObj.imageClass = "fa-clock-o text-primary";
                            break;
                        case sloPaused:
                        case sloNotReady:
                            isPaused = true;
                            sloObj.imageClass = "fa-pause text-info";
                            break;
                        case sloMet:
                            sloObj.imageClass = "fa-check-circle-o text-success";
                            //vm.view.controller.isMet = true;
                            isMet = true;
                            break;
                        case sloWarning:
                            sloObj.imageClass = "fa-exclamation-circle text-warning";
                            break;
                        case sloBreached:
                            sloObj.imageClass = "fa-bell text-danger";
                            isBreach = true;
                            break;
                    }

                    var sloImg = sloObj.imageClass; //should remove

                    var addAttr = (headerslo) ? "slo-displayed" : "slo-dropdown-" + key;

                    var clone = $('<div/>').addClass("content-header__collapser").attr('id', addAttr);

                    clone.html(sloTemplate(sloObj));

                    //alert(sloObjects[key].Time.Hours);
                    SLOCoundown(addAttr, clone, isMet, isPaused, sloObjects[key].Time.Hours, sloObjects[key].Time.Minutes, sloObjects[key].Time.Seconds,
                        eval(sloObjects[key].WarningDate), eval(sloObjects[key].ServerDatetimeNow), false);
                    sloContainer.append(clone);
                }
            }

            var SLOCoundown = function (elementAttr, sloCloned, isMetStat, isPaused, hours, minutes, seconds, warningDate, serverCurrentDate, isBreach) {
                //force warning image
                var elementContainer = $($("#" + elementAttr, sloCloned).prevObject);
                elementContainer.find(".header-slo-icon").first().addClass(elementAttr)
                elementContainer.find(".header-slo-timer").first().addClass(elementAttr)

                var sloIcon = $(".header-slo-icon." + elementAttr);
                var sloTimer = $(".header-slo-timer." + elementAttr);

                if (!isMetStat && !isBreach && warningDate <= serverCurrentDate) {
                    //reset all classes 
                    sloIcon.attr('class', "header-slo-icon fa fa-exclamation-circle text-warning fa-lg");
                }

                //set breached
                if (!isMetStat && (seconds <= 0 && minutes <= 0 && hours <= 0)) {
                    isBreach = true;
                    sloIcon.attr('class', "header-slo-icon fa fa-bell text-danger fa-lg");
                    sloTimer.addClass("text-danger");
                }

                //set time in view
                if (!isMetStat) {
                    var secs = (Math.abs(seconds) < 10) ? "0" + Math.abs(seconds) : Math.abs(seconds);
                    var mins = (Math.abs(minutes) < 10) ? "0" + Math.abs(minutes) : Math.abs(minutes);
                    var hrs = (Math.abs(hours) < 10) ? "0" + Math.abs(hours) : Math.abs(hours);
                    if (isBreach) {
                        sloTimer.html("");
                    } else
                        sloTimer.first().html((isBreach ? "-" : "") + Math.abs(hrs) + ":" + mins + ":" + secs);
                    //return;
                } else {
                    sloTimer.html("&nbsp;");
                    return;
                }

                if (isPaused) return;

                //make the fancy js countdown
                serverCurrentDate.setSeconds(serverCurrentDate.getSeconds() + 1);
                seconds = parseInt(seconds) - 1;


                if (seconds <= 0 && minutes <= 0 && hours <= 0) {
                    if (seconds <= -60) {
                        seconds = 0;
                        minutes = parseInt(minutes) - 1;
                    }

                    if (minutes <= -60) {
                        minutes = 0;
                        hours = parseInt(hours) - 1;
                    }
                } else {
                    if (minutes < 0) {
                        minutes = 59;
                        hours = parseInt(hours) - 1;
                    }

                    if (seconds < 0) {
                        seconds = 59;
                        minutes = parseInt(minutes) - 1;
                    }
                }


                setTimeout(function () {
                    SLOCoundown(elementAttr, sloCloned, isMetStat, isPaused, hours, minutes, seconds,
                        warningDate, serverCurrentDate, isBreach);
                }, 1000);
            }

            vm.view.doClick = function (e) {
                if ($(e.currentTarget).hasClass("btn-icon-stack--active"))
                    $(e.currentTarget).removeClass("btn-icon-stack--active");
                else
                    $(e.currentTarget).addClass("btn-icon-stack--active");
                remoteManageWidget.toggle(vm);
            }

            vm.view.toggleMore = function () {
                $('#openmore').modal('show');

                $('#openmore').on('shown.bs.modal',
                    function () {
                        $('.modal-backdrop').each(function (i, obj) {
                            $('#openmore').before(obj);
                        });
                    });
            }

            vm.view.viewAttachments = function (e) {
                if ($(e.currentTarget).hasClass("btn-icon-stack--active"))
                    $(e.currentTarget).removeClass("btn-icon-stack--active");
                else
                    $(e.currentTarget).addClass("btn-icon-stack--active");
                headerAttachmentWidget.toggle(vm);
            }

            //set page <title>
            document.title = vm.view.title + ' - ' + vm.view.id;

            if (!_.isNull(vm.viewModel.ParentWorkItem) &&
                !_.isUndefined(vm.viewModel.ParentWorkItem)) {
                vm.view.buildParentHeaderView(function (tpl) {
                });
            } else {
                vm.view.controller = {
                    isParent: (vm.viewModel.ParentWorkItem) ? true : false
                }
            }

            //This will count the attachment and display it to the badge.
            _.defer(function () {
                var headerAttachmentBtnBadge = $("#headerAttachmentBtn .content-header__collapser__icon-badge");
                function showBadge() {
                    if (vm.viewModel.FileAttachment.length > 0) {
                        headerAttachmentBtnBadge.html(vm.viewModel.FileAttachment.length);
                        headerAttachmentBtnBadge.show();
                    }
                    else {
                        headerAttachmentBtnBadge.hide();
                    }
                }
                showBadge();

                vm.viewModel.FileAttachment.bind("change", function (e) {
                    showBadge();
                });
            });


            var mouseDownActionIsCloseFlyout = false;
            function mounseEventAction(e) {

                if (e.type == "mousedown") {
                    //This will prevent unnecessary closing of the flyout. Bug22849
                    mouseDownActionIsCloseFlyout = false;
                }

                if (e.target.id === 'expanded_widget' || $(e.target).parents('#expanded_widget').length > 0)
                    return;

                if (e.target.id === 'remoteManageBtn' || $(e.target).parents('#remoteManageBtn').length > 0)
                    return;

                if ($(e.target).hasClass("support-tools__widget__action") || $(e.target).parents('.support-tools__widget__action').length > 0)
                    return;

                if ($(e.target).hasClass("multi-query__list__selected-items") || $(e.target).parents('.multi-query__list__selected-items').length > 0)
                    return;

                if (e.target.id === 'attachment_widget' || $(e.target).parents('#attachment_widget').length > 0)
                    return;

                if (e.target.id === 'headerAttachmentContainer' || $(e.target).parents('#headerAttachmentContainer').length > 0)
                    return;

                if (e.target.id === 'headerAttachmentBtn' || $(e.target).parents('#headerAttachmentBtn').length > 0)
                    return;

                if ($(e.target).hasClass("thumbnail-file") || $(e.target).parents('.thumbnail-file').length > 0)
                    return;


                if (e.type == "mousedown") {
                    //This will prevent unnecessary closing of the flyout. Bug22849
                    mouseDownActionIsCloseFlyout = true;
                }

                if (!(mouseDownActionIsCloseFlyout)) {
                    //This will prevent unnecessary closing of the flyout. Bug22849
                    return;
                }

                if (vm.widget) vm.widget.open = false;
                $("#remoteManageBtn").removeClass('btn-icon-stack--active');
                $("#expanded_widget").removeClass('content-header__flyout--open');
                $("#content-header-backdrop").removeClass('content-header__flyout__overlay--open');

                if (vm.attachmentWidget) vm.attachmentWidget.open = false;
                $("#headerAttachmentBtn").removeClass('btn-icon-stack--active');
                $("#attachment_widget").removeClass('content-header__flyout--open');
            }

            $('body').mousedown(function (e) {
                //This will prevent unnecessary closing of the flyout. Bug22849
                mounseEventAction(e);
            });

            $('body').click(function (e) {
                //This will prevent unnecessary closing of the flyout. Bug22849
                mounseEventAction(e);
            });

            callback(view.render());
        }
    }

    return definition;
});
