/**
RA Approval controls
**/
define(function (require) {
    var tpl = require("text!forms/header/approval/view.html");
    var userPickerControl = require("forms/fields/userPicker/controller");
    var enumPickerControl = require("forms/fields/enum/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);
            var rejected = "107fc6bd-2bb3-0282-4425-f43b5b32ef13";
            var approve = "0e856c6c-04e5-0a8e-6041-bc7715b4747e";
            var notYetVoted = "dae75d12-89ac-a8d8-4fe3-516c2a6a26f7";

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


            vm.view.approvalModel = new kendo.observable({
                decisionEnumId: null,
                comments: "",
                onRejectClick: function () {
                    vm.view.approvalModel.decisionEnumId = rejected;
                    this.updateStatus();
                },
                onApproveClick: function () {
                    vm.view.approvalModel.decisionEnumId = approve;

                    this.updateStatus();
                },
                onCompleteClick: function () {
                    var status = { Id: app.constants.workItemStatuses.ManualActivity.Completed, Name: localization.Completed };
                    vm.view.approvalModel.updateManualActivity(status);
                },
                onFailClick: function () {
                    var status = { Id: app.constants.workItemStatuses.ManualActivity.Failed, Name: localization.Failed }
                    vm.view.approvalModel.updateManualActivity(status);
                },
                updateStatus: function () {
                    if (vm.view.approvalModel.isReviewActivity) {
                        vm.view.approvalModel.updateReviewActivity();
                    }

                    if (vm.view.approvalModel.isManualActivity) {
                        vm.view.approvalModel.updateManualActivity();
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
                            vm.view.approvalModel.comments = response.input;
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
                                    comment = reviewItem.Comments + "\n" + vm.view.approvalModel.comments;
                                }
                                else {
                                    comment = vm.view.approvalModel.comments;
                                }
                                const decisionDate = new Date().toISOString();

                                const original = {
                                    ...simpleReviewer,
                                };
                                const current = {
                                    ...simpleReviewer,
                                    DecisionDate: decisionDate,
                                    Decision: { Id: vm.view.approvalModel.decisionEnumId },
                                    Comments: comment,
                                    VotedBy: { BaseId: session.user.Id },
                                };
                                const reviewerObject = vm.view.approvalModel.generatePostData(original, current);
                                $.ajax({
                                    type: 'POST',
                                    dataType: 'text',
                                    url: pageForm.saveUrl,
                                    data: "formJson=" + reviewerObject,
                                })
                                    .done((data) => {
                                        if (data.indexOf('loginForm') < 0) { // Logged out check    
                                            var successMessage = vm.view.approvalModel.decisionEnumId == "0e856c6c-04e5-0a8e-6041-bc7715b4747e" ?
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
                                        reviewer.Decision = { Id: vm.view.approvalModel.decisionEnumId };
                                        reviewer.Comments = comment;
                                        reviewer.DecisionDate = decisionDate;
                                        reviewItem.VotedBy = { BaseId: session.user.Id };
                                        reviewItem.Decision = { Id: vm.view.approvalModel.decisionEnumId };
                                        reviewItem.set("Comments", comment);
                                        reviewItem.set("DecisionDate", decisionDate);
                                    })
                                    .fail((xhr, ajaxOptions, thrownError) => {
                                        vm.view.approvalModel.handleError(xhr, thrownError);
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
                                                vm.view.approvalModel.handleError(xhr, thrownError);
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
                                showInActives: true
                            },
                            cache: false
                        }
                    },
                    requestEnd: function (e) {
                        vm.view.approvalModel.updatePageDetails(e.response);
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

                    vm.view.approvalModel.set("currentPage", index);
                    vm.view.approvalModel.set("toatPage", pageCount);
                    vm.view.approvalModel.set("pageText", pageString);
                    vm.view.approvalModel.set("disablePrevious", (index == 0) ? true : false);
                    vm.view.approvalModel.set("disableNext", (index == pageCount - 1) ? true : false);

                    var statusInProgress = vm.viewModel.Status.Id === "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";

                    if (!statusInProgress || (!_.isUndefined(vm.viewModel.reviewDetails) && (vm.viewModel.reviewDetails.fullDetails.Decision.Id == approve || vm.viewModel.reviewDetails.fullDetails.Decision.Id == rejected) && (vm.viewModel.reviewDetails.fullDetails.User.BaseId == session.user.Id))) {
                        vm.view.approvalModel.set("disabledButtons", true);
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
                            vm.view.approvalModel.set("disabledButtons", true);

                            var pageString = "1 / 1";

                            vm.view.approvalModel.set("currentPage", 1);
                            vm.view.approvalModel.set("toatPage", 1);
                            vm.view.approvalModel.set("pageText", pageString);
                            vm.view.approvalModel.set("disablePrevious", true);
                            vm.view.approvalModel.set("disableNext", true);
                        }

                        if (!review) return;
                    }
                },
                nextClick: function () {
                    var index = vm.view.approvalModel.get("currentPage") + 1;
                    vm.view.approvalModel.navigate(index);
                },
                previousClick: function () {
                    var index = vm.view.approvalModel.get("currentPage") - 1;
                    vm.view.approvalModel.navigate(index);
                },
                navigate: function (index) {
                    vm.view.approvalModel.pageDataSource.read();
                    var dSource = vm.view.approvalModel.pageDataSource.data();

                    var activeData = [];
                    if (pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity") {
                        activeData = _.where(dSource, { Decision: localization.NotYetVoted, StatusId: "11fc3cef-15e5-bca4-dee0-9c1155ec8d83" });
                    }
                    else {
                        activeData = dSource;
                    }

                    var nextItem = activeData[index];
                    var url = vm.view.approvalModel.isReviewActivity ? "/ReviewActivity/Approval/" : "/ManualActivity/Complete/";
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
                isReviewActivity: pageForm.viewModel.ClassName == "System.WorkItem.Activity.ReviewActivity"
            });

            vm.view.approvalModel.pageDataSource.read();
            var view = new kendo.View(built(), { wrap: false, model: vm.view.approvalModel });

            callback(view.render());


        }
    }

    return definition;

});