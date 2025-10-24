/**
New Status
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/newStatus/view.html");

    var incidentResolved = "2b8830b6-59f0-f574-9c2a-f4b4682f1681";
    var incidentActive = "5e2d3932-ca6d-1515-7310-6f58584df73e";
    var IncidentClosed = "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf";
    var IncidentActivePending = "b6679968-e84e-96fa-1fec-8cd4ab39c3de";

    var serviceRequestCancelled = "674e87e4-a58e-eab0-9a05-b48881de784c";
    var serviceRequestCompleted = "b026fdfd-89bd-490b-e1fd-a599c78d440f";
    var serviceRequestSubmitted = "72b55e17-1c7d-b34c-53ae-f61f8732e425";
    var serviceRequestInProgress = "59393f48-d85f-fa6d-2ebe-dcff395d7ed1";
    var serviceRequestOnHold = "05306bf5-a6b9-b5ad-326b-ba4e9724bf37";
    var serviceRequestFailed = "21dbfcb4-05f3-fcc0-a58e-a9c48cde3b0e";
    var serviceRequestClosed = "c7b65747-f99e-c108-1e17-3c1062138fc4";

    var releaseRecordInProgress = "1840bfdc-3589-88a5-cea9-67536fd95a3b";

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build the template for the window
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());

            //first add the anchor
            var link = _.template(anchor);

            //make sure we have all the node set
            var properties = {
                Target: "setNewStatus"
            };

            $.extend(true, properties, node);
           
            //all other bound changes to be triggered
            if (!_.isUndefined(node.Configs.otherBoundChanges)) {
                //var otherBoundChanges = $.parseJSON(node.Configs.otherBoundChanges);
                var otherBoundChanges = node.Configs.otherBoundChanges;
            } else {
                var otherBoundChanges = {};
            }

            //create view model 
            var viewModel = kendo.observable({
                setNewStatus: function () {
                    //show comment for cancelled service request
                    if (node.Configs.newStatusId === serviceRequestCancelled || node.Configs.newStatusId === releaseRecordInProgress) {
                        addComment(view.element, node.Configs);
                    } else {
                        $.when(kendo.ui.ExtYesNoDialog.show({
                            title: node.Configs.confirmTitle,
                            message: node.Configs.confirmMessage
                        })).done(function (response) {
                            if (response.button === "yes") {
                                var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);

                                //set new status
                                vm.viewModel.set("Status", { Id: node.Configs.newStatusId, Name: node.Configs.newStatusName });

                                //re-initiate resolution details on re-activate(active status) only
                                if (vm.viewModel.Status.Id == app.constants.workItemStatuses.Incident.Active) {
                                    vm.viewModel.set("ResolutionCategory", { Name: null, Id: null });
                                    vm.viewModel.set("ResolutionDescription", null);
                                    vm.viewModel.set("ResolvedDate", null);

                                   
                                    if (actionLogType) {
                                        vm.viewModel[actionLogType].unshift(new app.dataModels["AppliesToTroubleTicket"].recordActivated());
                                    }
                                }

                                //make other changes
                                $.each(otherBoundChanges, function (index, val) {
                                    vm.viewModel.set(index, val);
                                });

                                //if IR or SR closed set closed date.
                                if (node.Configs.newStatusId == app.constants.workItemStatuses.Incident.Closed || 
                                    node.Configs.newStatusId == app.constants.workItemStatuses.ServiceRequest.Closed) {
                                    vm.viewModel.set("ClosedDate", new Date().toISOString());

                                    //set closed by user 
                                    switch (node.Configs.newStatusId) {
                                        case app.constants.workItemStatuses.Incident.Closed:
                                            vm.viewModel.RelatesToTroubleTicket_ = { BaseId: session.user.Id };
                                            vm.viewModel[actionLogType].unshift(new app.dataModels["AppliesToTroubleTicket"].recordClosed());
                                            break;
                                        case app.constants.workItemStatuses.ServiceRequest.Closed:
                                            vm.viewModel.ClosedByUser = { BaseId: session.user.Id };
                                            break;
                                    }
                                }

                                //reactivating child incidents when a parent is reactivated
                                if (vm.type === "Incident" && vm.viewModel.IsParent && vm.viewModel.Status.Id == incidentActive) {
                                    processChildIncidentReactivation();
                                } else {
                                    save();
                                }
                            } else {
                                //reset the viewModel
                                vm.viewModel.set("Status",{Id: vm.viewModel.Status.Id, Name: vm.viewModel.Status.Name});
                            }

                        });
                    }
                }
            });

            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel });
            callback(anchorElm.render());

            //more functions
            var save = function () {
                //save/apply the current changes
                vm.save(function (data) {
                    app.lib.message.add(localization.ChangesApplied, "success");
                    switch (vm.type) {
                        case "ChangeRequest":
                            location.href = "/ChangeRequest/Edit/" + vm.viewModel.Id + "/";
                            break;
                        case "ServiceRequest":
                            location.href = "/ServiceRequest/Edit/" + vm.viewModel.Id + "/";
                            break;
                        case "Incident":
                            location.href = "/Incident/Edit/" + vm.viewModel.Id + "/";
                            break;
                        case "ReleaseRecord":
                            location.href = "/ReleaseRecord/Edit/" + vm.viewModel.Id + "/";
                            break;
                        case "Problem":
                            location.href = "/Problem/Edit/" + vm.viewModel.Id + "/";
                            break;
                        default:
                            location.href = "/WorkItems/MyItems/";
                            break;
                    }
                }, saveFailure);
            }

            var saveFailure = function (exceptionMessage) {
                if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                    app.lib.message.add(exceptionMessage, "danger");
                } else {
                    //fallback to generic message
                    app.lib.message.add(localization.PleaseCorrectErrors, "danger");
                }
                app.lib.message.show();
            }

            var reactivateChildandSave = function () {
                $.each(vm.viewModel.ChildWorkItem, function (i, item) {
                    item.set("Status", {Name: childIncidentSettings.ChildIncidentReactivatedStatus.Name, Id: childIncidentSettings.ChildIncidentReactivatedStatus.Id});
                    item.set("ResolutionCategory", {Name: null,Id: null});
                    item.set("ResolutionDescription", null);
                    item.set("ResolvedDate", null);
                });
                save();
            }

            var processChildIncidentReactivation = function () {
                var childIncidentSettings;
                $.get("/api/V3/Projection/GetParentWorkItemSettings", {}, function (data) {
                    childIncidentSettings = $.parseJSON(data);

                    if (childIncidentSettings.ReactivateLetAnalystDecide) { //let analyst decide setting
                        $.when(kendo.ui.ExtYesNoDialog.show({
                            title: localization.ReactivateChildIncidentTitle,
                            message: localization.ReactivateChildIncidentMessage
                        })).done(function (response) {
                            if (response.button === "yes") {
                                reactivateChildandSave();
                            } else {
                                save();
                            }
                        });
                    }
                    else if (childIncidentSettings.ReactivateChildIncident) { //automatic reactivate setting
                        reactivateChildandSave();
                    } else { // do nothing setting
                        save();
                    }

                });
            }

            var addComment = function (cont, newStatusConfig) {
                //var cont = view.element; //we have the element in memory so no need use a selector
                win = cont.kendoCiresonWindow({
                    title: localization.Comment,
                    width: 500,
                    height: 410,
                    actions: []
                }).data("kendoWindow");
                
                //this view Model is bound to the window element
                var _vmWindow = new kendo.observable({
                    comment: "",
                    okEnabled: false,
                    charactersRemaining: "4000",
                    textCounter: function () {
                        var maximumLength = 4000;
                        var val = this.comment.length;

                        if (val > maximumLength) {
                            this.comment.substring(0, maximumLength);
                        } else {
                            this.set("charactersRemaining", maximumLength - val);
                        }

                        if (val > 0) {
                            this.set("okEnabled", true);
                        } else {
                            this.set("okEnabled", false);
                        }
                    },
                    okClick: function () {
                        //set new status
                        vm.viewModel.set("Status",{Id: newStatusConfig.newStatusId, Name: newStatusConfig.newStatusName});

                        //set comment
                        var newComment = _.isNull(vm.viewModel.Notes) ? this.comment : vm.viewModel.Notes + "\r\n" + this.comment;
                        vm.viewModel.set("Notes", newComment);

                        //save changes
                        win.close();
                        save();
                    },
                    cancelClick: function () {
                        win.close();
                    },
                    commentMessage: !_.isUndefined(newStatusConfig.commentMessage) ? newStatusConfig.commentMessage : localization.CancelledStatusCommentMessage
                });
                //add control to the window
                kendo.bind(cont, _vmWindow);

                cont.removeClass('hide');
                cont.show();

                win.open();
            }
        }
    }

    return definition;

});