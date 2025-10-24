/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchorTemplate = require("text!forms/tasks/anchor/view.html");
    var changeStatusTemplate = require("text!forms/tasks/changeStatus/view.html");
    var changeStatusDrawerTemplate = require("text!forms/tasks/changeStatus/view.drawer.html");
    var enumPickerControl = require("forms/fields/enum/controller");
    var txtAreaControl = require("forms/fields/longstring/controller");
    var checkBoxControl = require("forms/fields/boolean/controller");
    var drawerTaskTemplate = require("text!forms/tasks/drawerTask/view.html");

    var definition = {
        template: changeStatusTemplate,
        build: function (vm, node, callback) {
            /*
             * Change mustSelectLeafNode and/or showEnumPath to modify
             * bulk status change enum picker behavior. 
             */
            var mustSelectLeafNode = false;
            var showEnumPath = false;

            //for problem's autoresolve 
            if (vm.type == "Problem" && _.isUndefined(vm.viewModel.IsAutoResolve)) {
                vm.viewModel.set("IsAutoResolve", vm.viewModel.AutoResolve);
            }

            /* variables */
            var resolveChildIncidentSettings;
            if (vm.type != "BulkEdit") {
                //used for cancel click event on form task
                var originalVm = {
                    Status: _.clone(vm.viewModel.Status),
                    ResolutionCategory: !_.isUndefined(vm.viewModel.ResolutionCategory) ? _.clone(vm.viewModel.ResolutionCategory) : null,
                    ResolutionDescription: _.clone(vm.viewModel.ResolutionDescription),
                    ChildWorkItem: _.clone(vm.viewModel.ChildWorkItem),
                    Notes: _.clone(vm.viewModel.Notes),
                    ImplementationResults: !_.isUndefined(vm.viewModel.ImplementationResults) ? _.clone(vm.viewModel.ImplementationResults) : null,
                    RelatesToWorkItem: _.clone(vm.viewModel.RelatesToWorkItem),
                    Resolution: !_.isUndefined(vm.viewModel.Resolution) ? _.clone(vm.viewModel.Resolution) : null,
                    AutoResolve: !_.isUndefined(vm.viewModel.AutoResolve) ? _.clone(vm.viewModel.AutoResolve) : false,
                }
            }
            var workItemStatuses = app.constants.workItemStatuses;
            //map all the status constants to shorter local vars. used in getFormTaskViewModel() and getFormTaskChangeRules()
            var incidentResolved = workItemStatuses.Incident.Resolved;
            var incidentActive = workItemStatuses.Incident.Active;
            var incidentClosed = workItemStatuses.Incident.Closed;
            var incidentActivePending = workItemStatuses.Incident.Pending;
            var serviceRequestCancelled = workItemStatuses.ServiceRequest.Cancelled;
            var serviceRequestCompleted = workItemStatuses.ServiceRequest.Completed;
            var serviceRequestSubmitted = workItemStatuses.ServiceRequest.Submitted;
            var serviceRequestInProgress = workItemStatuses.ServiceRequest.InProgress;
            var serviceRequestOnHold = workItemStatuses.ServiceRequest.OnHold;
            var serviceRequestFailed = workItemStatuses.ServiceRequest.Failed;
            var serviceRequestClosed = workItemStatuses.ServiceRequest.Closed;
            var changeRequestFailed = workItemStatuses.ChangeRequest.Failed;
            var changeRequestClosed = workItemStatuses.ChangeRequest.Closed;
            var changeRequestInProgress = workItemStatuses.ChangeRequest.InProgress;
            var changeRequestOnHold = workItemStatuses.ChangeRequest.OnHold;
            var changeRequestCancelled = workItemStatuses.ChangeRequest.Cancelled;
            var changeRequestSubmitted = workItemStatuses.ChangeRequest.Submitted;
            var changeRequestCompleted = workItemStatuses.ChangeRequest.Completed;
            var problemResolved = workItemStatuses.Problem.Resolved;
            var problemClosed = workItemStatuses.Problem.Closed;
            var releaseRecordClosed = workItemStatuses.ReleaseRecord.Closed;
            var releaseRecordCancelled = workItemStatuses.ReleaseRecord.Cancelled;
            var releaseRecordCompleted = workItemStatuses.ReleaseRecord.Completed;
            var releaseRecordFailed = workItemStatuses.ReleaseRecord.Failed;
            var releaseRecordEditing = workItemStatuses.ReleaseRecord.Editing;
            var releaseRecordOnHold = workItemStatuses.ReleaseRecord.OnHold;
            var releaseRecordInProgress = workItemStatuses.ReleaseRecord.InProgress;
            /* END variables */


            /* functions */
            //main viewModel that holds ALL THE THINGS
            var getFormTaskViewModel = function (modalEle) {
                return kendo.observable({
                    //'changeStatus' function is bound to anchor click event via data-bind="click: blahblah"
                    changeStatus: function () {
                        var modalWindowEle = modalEle.element.clone(); //we have the element in memory so no need use a selector

                        var modalWindowControl = modalWindowEle.kendoCiresonWindow({
                            title: localization.ChangeStatusTask,
                            width: 600,
                            height: 480,
                            actions: [],
                            //activate trigger when window open animation is complete.
                            activate: function () {
                                var selectedWiType = modalWindowViewModel.type;
                                var currentStatusId = vm.viewModel.Status.Id;
                                onModalActivate(selectedWiType, currentStatusId, statusTreeViewControl, statusDropDownControl, modalWindowViewModel.enumId);
                                if (currentStatusId == app.constants.workItemStatuses.Incident.Resolved && !_.isUndefined(vm.viewModel.ResolutionCategory.Id)) {
                                    modalWindowViewModel.set("okEnabled", true);
                                }
                            }
                        }).data("kendoWindow");

                        //this view Model is bound to the window element
                        var modalWindowViewModel = kendo.observable({
                            enumId: node.Configs.statusEnumId,
                            resolutionCategoryEnumId: node.Configs.resolutionCategoryEnumId,
                            type: node.Configs.type,
                            resolveChildSettings: null,
                            letAnalystDecide: false,
                            workItemModel: vm.viewModel,
                            okEnabled: false,
                            requireResolution: false,
                            resolveChildIncident: true,
                            okClick: function () {
                                if (vm.viewModel.ClassName == "System.WorkItem.Incident" &&
                                    (vm.viewModel.Status.Id == app.constants.workItemStatuses.Incident.Resolved || vm.viewModel.Status.Id == app.constants.workItemStatuses.Incident.Closed)) {

                                    var hasInprogress = _.some(vm.viewModel.Activity, function (activity) {
                                        return activity.Status.Id == "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
                                    });
                                    
                                    if (hasInprogress) {
                                        $.when(kendo.ui.ExtOkCancelDialog.show({
                                            title: localization.IRACResolveWarning,
                                            message: localization.IRACResolveWarningMsg,
                                            icon: "fa fa-exclamation"
                                        })
                                        ).done(function (response) {
                                            if (response.button === "ok") {
                                                modalWindowControl.close();
                                            }
                                        });
                                    }
                                    else {
                                        this.updateStatus();
                                    }
                                }
                                else {
                                   this.updateStatus();
                                }

                                
                            },
                            cancelClick: function () {
                                //reset to original values
                                vm.viewModel.set("Status", { Id: originalVm.Status.Id, Name: originalVm.Status.Name });
                                if (node.Configs.type === "Incident") {
                                    vm.viewModel.set("ResolutionCategory", { Id: originalVm.ResolutionCategory.Id, Name: originalVm.ResolutionCategory.Name });
                                    vm.viewModel.set("ResolutionDescription", originalVm.ResolutionDescription);
                                    vm.viewModel.set("ChildWorkItem", originalVm.ChildWorkItem);
                                }
                                if (node.Configs.type === "ServiceRequest") {
                                    vm.viewModel.set("ImplementationResults", { Id: originalVm.ImplementationResults.Id, Name: originalVm.ImplementationResults.Name });
                                    vm.viewModel.set("Notes", originalVm.Notes);
                                }
                                if (node.Configs.type === "Problem") {
                                    vm.viewModel.set("Resolution", { Id: originalVm.Resolution.Id, Name: originalVm.Resolution.Name });
                                    vm.viewModel.set("ResolutionDescription", originalVm.ResolutionDescription);
                                    vm.viewModel.set("RelatedWorkItems", originalVm.RelatesToWorkItem);
                                    vm.viewModel.set("AutoResolve", originalVm.AutoResolve);
                                    vm.viewModel.set("IsAutoResolve", originalVm.AutoResolve);
                                }
                                modalWindowControl.close();
                            },
                            showComment: vm.viewModel.Status.Id == serviceRequestCancelled,
                            showResolution: (vm.viewModel.Status.Id == incidentResolved || vm.viewModel.Status.Id == serviceRequestCompleted || vm.viewModel.Status.Id == problemResolved),
                            showAutoResolve: (vm.viewModel.Status.Id == problemResolved),
                            updateStatus: function (e) {
                                var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                                if (_.isString(vm.viewModel.Status.Name) && vm.viewModel.Status.Name.length < 1) {
                                    vm.viewModel.set("Status", { Id: originalVm.Status.Id, Name: originalVm.Status.Name });
                                } else if (this.requireResolution && (!_.isUndefined(vm.viewModel.ResolutionCategory) && _.isNull(vm.viewModel.ResolutionCategory.Id))) {
                                    modalWindowEle.find('#changeStatusErrorWin').html(localization.RequestCategoryRequiredError);
                                } else if (this.requireResolution && _.isNull(vm.viewModel.Notes) && (vm.type == "ServiceRequest")) {
                                    modalWindowEle.find('#changeStatusErrorWin').html(localization.ImplementationNotesRequiredError);
                                } else if (vm.viewModel.Status.Id === incidentResolved) { //resolved incident
                                    //set resolved date
                                    vm.viewModel.set("ResolvedDate", new Date().toISOString());
                                    var resDateEle = $("input[name='ResolvedDate']");
                                    if (resDateEle.attr('data-control') == 'datePicker') {
                                        resDateEle.val(kendo.toString(new Date(), "d"));
                                    } else if (resDateEle.attr('data-control') == 'dateTimePicker') {
                                        resDateEle.val(kendo.toString(new Date(), "g"));
                                    }

                                    //add to action log
                                    if (actionLogType) {
                                        vm.viewModel[actionLogType].unshift(new app.dataModels["AppliesToTroubleTicket"].recordResolved(vm.viewModel.ResolutionDescription));
                                    }
                                    //set resolved by user 
                                    vm.viewModel.RelatesToTroubleTicket = { BaseId: session.user.Id };

                                    //if incident is a parent, check if we need to resolve its child incidents
                                    if (vm.viewModel.IsParent && (this.resolveChildSettings.ResolveChildIncident || (this.resolveChildSettings.ResolvedLetAnalystDecide && this.resolveChildIncident)))
                                        resolveChildIncidents(this.resolveChildSettings);

                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                } else if (vm.viewModel.Status.Id === incidentClosed || vm.viewModel.Status.Id === serviceRequestClosed || vm.viewModel.Status.Id === problemClosed) { //closed IR or closed SR
                                    //set closed date
                                    vm.viewModel.set("ClosedDate", new Date().toISOString());
                                    var closeDateEle = $("input[name='ClosedDate']");
                                    if (closeDateEle.attr('data-control') == 'datePicker') {
                                        closeDateEle.val(kendo.toString(new Date(), "d"));
                                    } else if (closeDateEle.attr('data-control') == 'dateTimePicker') {
                                        closeDateEle.val(kendo.toString(new Date(), "g"));
                                    }

                                    //set closed by user 
                                    switch (vm.viewModel.Status.Id) {
                                        case problemClosed:
                                            vm.viewModel.RelatesToTroubleTicket_ = { BaseId: session.user.Id };
                                            break;
                                        case incidentClosed:
                                            vm.viewModel.RelatesToTroubleTicket_ = { BaseId: session.user.Id };
                                            vm.viewModel[actionLogType].unshift(new app.dataModels["AppliesToTroubleTicket"].recordClosed());
                                            break;
                                        case serviceRequestClosed:
                                            vm.viewModel.ClosedByUser = { BaseId: session.user.Id };
                                            break;
                                    }

                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                }
                                else if (vm.viewModel.Status.Id === incidentActive) { //activate incident
                                    vm.viewModel.RelatesToTroubleTicket = { BaseId: null };
                                    vm.viewModel.ResolutionCategory.set("Id", null);
                                    vm.viewModel.ResolutionCategory.set("Name", "");
                                    vm.viewModel.set("ResolutionDescription", null);
                                    vm.viewModel.set("ResolvedDate", null);

                                    //add to action log
                                    var actionLogType = app.controls.getWorkItemLogType(vm.viewModel);
                                    if (actionLogType) {
                                        vm.viewModel[actionLogType].unshift(new app.dataModels["AppliesToTroubleTicket"].recordActivated());
                                    }

                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                } else if (vm.viewModel.Status.Id === serviceRequestCompleted) { //completed service request
                                    //set completed date
                                    vm.viewModel.set("CompletedDate", new Date().toISOString());
                                    var comDateEle = $("input[name='CompletedDate']");
                                    if (comDateEle.attr('data-control') == 'datePicker') {
                                        comDateEle.val(kendo.toString(new Date(), "d"));
                                    } else if (comDateEle.attr('data-control') == 'dateTimePicker') {
                                        comDateEle.val(kendo.toString(new Date(), "g"));
                                    }

                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                } else if (vm.viewModel.Status.Id === problemResolved) { //resolved problem
                                    //set resolve date
                                    vm.viewModel.set("ResolvedDate", new Date().toISOString());
                                    var comDateEle = $("input[name='ResolvedDate']");
                                    if (comDateEle.attr('data-control') == 'datePicker') {
                                        comDateEle.val(kendo.toString(new Date(), "d"));
                                    } else if (comDateEle.attr('data-control') == 'dateTimePicker') {
                                        comDateEle.val(kendo.toString(new Date(), "g"));
                                    }

                                    //set resolved by user 
                                    vm.viewModel.RelatesToTroubleTicket = { BaseId: session.user.Id };

                                    if (vm.viewModel.IsAutoResolve) {
                                        resolveRelatedWorkItems();
                                    }

                                    vm.viewModel.set("AutoResolve", vm.viewModel.IsAutoResolve);

                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                } else {
                                    modalWindowEle.find('#changeStatusErrorWin').html("");
                                    modalWindowControl.close();
                                }
                            }
                        });



                        //bind window element to window viewModel
                        kendo.bind(modalWindowEle, modalWindowViewModel);

                        //create status enumPicker
                        createStatusPicker(modalWindowViewModel, modalWindowEle);
                        var statusDropDownControl = modalWindowEle.find('div[data-role="Status"]').data().handler._dropdown;
                        var statusTreeViewControl = modalWindowEle.find('div[data-role="Status"]').data().handler._treeview;

                        //bind status picker changes events
                        statusDropDownControl.bind("change", function (e) {
                            //make sure button is disabled again
                            vm.viewModel.set("okEnabled", false);
                            enableResolutionSettings(vm.viewModel.Status.Id, modalWindowViewModel);
                        });
                        statusTreeViewControl.bind("change", function (e) {
                            //make sure button is disabled again
                            vm.viewModel.set("okEnabled", false);
                            enableResolutionSettings(vm.viewModel.Status.Id, modalWindowViewModel);
                        });


                        /*
                         * conditionally added fields
                         */

                        if (modalWindowViewModel.type === "Incident") {
                            createIncidentResolutionFields(modalWindowViewModel, modalWindowEle);
                        }
                        if (modalWindowViewModel.type === "ServiceRequest") {
                            createResultFields(modalWindowViewModel, modalWindowEle);
                        }
                        if (modalWindowViewModel.type === "Problem") {
                            createProblemResolutionFields(modalWindowViewModel, modalWindowEle);
                        }
                        /*
                         * END conditionally added fields
                         */


                        modalWindowEle.removeClass('hide');
                        modalWindowEle.show();
                        modalWindowControl.open();
                    }
                });
            };


            

            var getDrawerTaskViewModel = function (modalView) {
                //drawerTaskVm is the viewModel that sits between the modal window and the page controls.
                var drawerTaskVm = kendo.observable({
                    currentSelection: [],
                    currentSelectionOfParents: [],
                    containsParents: false,
                    selectedWorkItem: {
                        type: '',
                        trimmedType: '',
                        projectionId: '',
                        currentStatusId: '',
                        currentStatusName: '',
                        statusTypeId: '',
                        resolutionResultEnumId: ''
                    },
                    openModal: function () {
                        if (!this.isEnabled) {
                            return;
                        }
                        var taskVm = this;
                        var modalEle = modalView.element.clone();
                        var modalControl = modalEle.kendoCiresonWindow({
                            title: localization.ChangeStatusTask,
                            actions: [],
                            activate: function () {
                                var selectedWiType = taskVm.selectedWorkItem.trimmedType;
                                var currentStatusId = taskVm.selectedWorkItem.currentStatusId;
                                onModalActivate(selectedWiType, currentStatusId, statusTreeViewControl, statusDropDownControl, taskVm.selectedWorkItem.statusTypeId);
                            }
                        }).data("kendoWindow");

                        //viewModel for the kendo window control and form
                        var modalViewModel = kendo.observable({
                            selectedWorkItems: taskVm.currentSelection,
                            //parent/child IR fields
                            selectedParents: taskVm.currentSelectionOfParents,
                            resolveChildSettings: null,
                            resolveChildIncident: true,
                            //edited form fields
                            newStatusObj: {Id:null, Name:null},                //IR|SR work item status (enum, required)
                            newResolutionId: '',            //IR 'Resolution' (enum, required)
                            resolutionDescription: '',      //IR 'Resolution Description' (textarea)
                            newResultId: '',                //SR Implementation Results (enum)
                            resultNote: '',                 //SR 'Completed' status 'Implementation Notes' (textarea, required)
                            resultComment: '',              //SR 'Cancelled' status 'Comment' (textarea)
                            showPath: showEnumPath,
                            leafNodeOnly: mustSelectLeafNode,
                            //wiStatusTypeId is the enum id for IR or SR used to get there wi status, resolutionResultEnumId is the enum id for IR resolution or SR result
                            wiStatusTypeId: taskVm.selectedWorkItem.statusTypeId,
                            resolutionResultEnumId: taskVm.selectedWorkItem.resolutionResultEnumId,

                            //toggles for fields required and visible
                            irStatusResolved: false,
                            srStatusCompleted: false,
                            srStatusCancelled: false,
                            irCategoryRequired: false,
                            srNotesRequired: false,
                            irResolveChildOption: false,

                            //button events/logic
                            okEnabled: false,
                            okClick: function () {

                                var windowViewModel = this;
                                var isValid = bulkEditFormIsValid(windowViewModel, modalEle);
                                if (isValid) {
                                    //check if we need to handle child wi resolution
                                    if (windowViewModel.irStatusResolved && (resolveChildIncidentSettings.ResolveChildIncident || (windowViewModel.irResolveChildOption && windowViewModel.resolveChildIncident)) && taskVm.containsParents) {
                                        //handles post for IR-resolved parents and children WIs
                                        postBulkEditChangesWithChildren(taskVm, windowViewModel, modalControl);
                                    } else {
                                        //handles post for everything else
                                        var data = {
                                            ProjectionId: taskVm.selectedWorkItem.projectionId,
                                            UpdateServiceManagement: true,
                                            ItemIds: _.pluck(windowViewModel.selectedWorkItems, 'BaseId'),
                                            EditedFields: getDrawerTaskEditedFields(windowViewModel)
                                        }

                                        postBulkEditChanges(data, taskVm, modalControl);
                                    }
                                }
                            },
                            cancelClick: function () {
                                modalControl.close();
                            }
                        });

                        kendo.bind(modalEle, modalViewModel);

                        //create status enumPicker && bind change events
                        var statusDropDownControl = modalEle.find('div[data-role="Status"]').data().handler._dropdown;
                        var statusTreeViewControl = modalEle.find('div[data-role="Status"]').data().handler._treeview;
                        function handleStatusControlChange() {
                            var item = modalViewModel.get("newStatusObj");
                            if (item) {
                                toggleAdditionalFields(item.Id, taskVm.selectedWorkItem.currentStatusId, modalViewModel);
                            }
                        }
                        statusDropDownControl.bind("change", function (e) {
                             handleStatusControlChange();
                        });
                        statusTreeViewControl.bind("change", function (e) {
                            handleStatusControlChange();
                        });
                        
                        //set vis/require depending on the current status 
                        if (taskVm.selectedWorkItem.trimmedType === "Incident" && taskVm.selectedWorkItem.currentStatusId === app.constants.workItemStatuses.Incident.Resolved) {
                            modalViewModel.set('irStatusResolved', true);
                            modalViewModel.set('irCategoryRequired', true);
                        }
                        if (taskVm.selectedWorkItem.trimmedType === "ServiceRequest") {
                            if (taskVm.selectedWorkItem.currentStatusId === app.constants.workItemStatuses.ServiceRequest.Completed) {
                                modalViewModel.set('srStatusCompleted', true);
                                modalViewModel.set('srStatusCancelled', false);
                            } else if (taskVm.selectedWorkItem.currentStatusId === app.constants.workItemStatuses.ServiceRequest.Cancelled) {
                                modalViewModel.set('srStatusCancelled', true);
                                modalViewModel.set('srStatusCompleted', false);
                            }
                        }

                        //show the window
                        modalEle.removeClass('hide');
                        modalEle.show();
                        modalControl.open();
                    },
                    isEnabled: false,
                    showTooltip: true,
                    setEnabled: function (enabled) {
                        this.set('isEnabled', enabled);
                        this.set('showTooltip', !enabled);
                    },
                    targetControlId: '',
                    onTargetControlChange: function (grid) {
                        //empty out parentitems and set to false, readded below if applicable
                        drawerTaskVm.set('currentSelectionOfParents', []);
                        drawerTaskVm.set('containsParents', false);

                        var selectedDataItems = [];
                        if (app.isMobile()) {
                            //grid is selected items array when called from mobile
                            selectedDataItems = grid;
                        } else {
                            selectedDataItems = grid.select().map(function (index, item) {
                                return grid.dataItem($(item));
                            }).toArray();
                        }

                        //we only update 10 items at a time
                        if (selectedDataItems.length > 10) {
                            this.onExceedSelectionCount();
                        }

                        drawerTaskVm.set('currentSelection', selectedDataItems);

                        //if nothing is selected disabled the item
                        if (selectedDataItems.length <= 0 || selectedDataItems.length > 10) {
                            drawerTaskVm.setEnabled(false);
                        } else {
                            var selectedTypes = _.pluck(selectedDataItems, "WorkItemType");
                            var selectedStatusIds = _.pluck(selectedDataItems, "StatusId");
                            var selectedStatusNames = _.pluck(selectedDataItems, "Status");

                            //return false if multiple selected, otherwise returns string values
                            var singleSelectedType = _.reduce(selectedTypes, function (memo, currentVal) {
                                return (memo === currentVal) ? memo : false;
                            });
                            drawerTaskVm.set("selectedWorkItem.type", singleSelectedType);

                            //return false if multiple selected, otherwise returns string values
                            var singleSelectedStatusId = _.reduce(selectedStatusIds, function (memo, currentVal) {
                                return (memo === currentVal) ? memo : false;
                            });
                            var singleSelectedStatusName = _.reduce(selectedStatusNames, function (memo, currentVal) {
                                return (memo === currentVal) ? memo : false;
                            });
                            drawerTaskVm.set("selectedWorkItem.currentStatusId", singleSelectedStatusId);
                            drawerTaskVm.set("selectedWorkItem.currentStatusName", singleSelectedStatusName);


                            if (singleSelectedStatusId && singleSelectedType) {
                                switch (singleSelectedType) {
                                    case "System.WorkItem.ServiceRequest":
                                        drawerTaskVm.setTrimmedWiType();
                                        drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemServiceRequestViewModel);
                                        drawerTaskVm.set('selectedWorkItem.statusTypeId', app.constants.workItemStatuses.ServiceRequest.Id);
                                        drawerTaskVm.set('selectedWorkItem.resolutionResultEnumId', app.constants.enumPickerIds.ServiceRequestImplementationResults);

                                        //allow SR change status on valid AP license only
                                        if (session.consoleSetting.AnalystPortalLicense.IsValid) {
                                            //if SR is closed do not allow status change from here (TFS 3560)
                                            if (singleSelectedStatusName === "Closed") {
                                                drawerTaskVm.setEnabled(false);
                                            } else {
                                                drawerTaskVm.setEnabled(true);
                                            }
                                        } else {
                                            drawerTaskVm.setEnabled(false);
                                        }

                                        break;
                                    case "System.WorkItem.Incident":
                                        var parentItems = [];
                                        _.each(selectedDataItems, function (workItem) {
                                            if (workItem.IsParent) {
                                                drawerTaskVm.set('containsParents', true);
                                                parentItems.push(workItem);
                                            }
                                        });
                                        drawerTaskVm.set('currentSelectionOfParents', parentItems);

                                        drawerTaskVm.setTrimmedWiType();
                                        drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemIncidentViewModel);
                                        drawerTaskVm.set('selectedWorkItem.statusTypeId', app.constants.workItemStatuses.Incident.Id);
                                        drawerTaskVm.set('selectedWorkItem.resolutionResultEnumId', app.constants.enumPickerIds.IncidentResolution);
                                        drawerTaskVm.setEnabled(true);
                                        break;
                                    default:
                                        drawerTaskVm.set('selectedWorkItem.projectionId', '');
                                        drawerTaskVm.set('selectedWorkItem.statusTypeId', '');
                                        drawerTaskVm.set('selectedWorkItem.resolutionResultEnumId', '');
                                        // not a supported bulk edit Type, disable the edit button
                                        drawerTaskVm.setEnabled(false);
                                }
                            } else {
                                //not same type && status
                                drawerTaskVm.setEnabled(false);
                            }
                        }
                    },
                    setTrimmedWiType: function () {
                        this.set('selectedWorkItem.trimmedType', this.selectedWorkItem.type.split(/[\s.]+/).pop());
                    },
                    onExceedSelectionCount: function() {
                        kendo.ui.ExtAlertDialog.show({
                            title: localizationHelper.localize('Warning'),
                            message: localizationHelper.localize('BulkEditExceedMessage')
                        });
                    }
                });

                return drawerTaskVm;
            };

            //executes when modal dialog is opening
            var onModalActivate = function (selectedWiType, currentStatusId, treeControl, dropDownControl, statusEnumId) {
                //determine allowed status changes based on current type and status
                var changeRules = getFormTaskChangeRules();
                var changeRulesFilter = changeRules[selectedWiType][currentStatusId];
                
                //since Incident can have custom enums we need to check here if no rules were set then its not resolved
                if (selectedWiType == "Incident" && _.isUndefined(changeRulesFilter)) {
                    changeRulesFilter = { field: "Id", operator: "neq", value: app.constants.workItemStatuses.Incident.Closed };
                }

                //apply allowed status filtering
                treeControl.dataSource.options.serverFiltering = false;
                treeControl.dataSource.filter(changeRulesFilter);

                //reassign dropdown datasource with filtered data so that users will not be able to access restricted status by typing
                $.get("/api/V3/Enum/GetFlatList/", { id: statusEnumId, itemFilter: "" }, function (data) {
                    var comboDataSource = new kendo.data.DataSource();
                    comboDataSource.data(data);
                    comboDataSource.filter(changeRulesFilter);
                    if (comboDataSource.view().length > 0) {
                        dropDownControl.setDataSource(comboDataSource.view());
                    }
                });
                
                resolveChildIncidentSettings = getResolveChildIncidentSettings();
            };

            //template .build() and view.renderererers.
            var buildAndRender = {
                windowEle: function (windowTemplate) {
                    //build the template for the window
                    var builtModal = _.template(windowTemplate);
                    var ele = new kendo.View(builtModal(), { wrap: false });
                    //send hidden window back to caller (appended in the callback)
                    callback(ele.render());
                    return ele;
                },
                taskListItem: function (properties, anchorViewModel, template) {
                    $.extend(true, properties, node);
                    //build the anchor and bind viewModel to it
                    var builtAnchor = _.template(template);
                    var anchorElm = new kendo.View(builtAnchor(properties), {
                        wrap: false, model: anchorViewModel
                    });
                    //send anchor element back to caller (appended in the callback)
                    callback(anchorElm.render());
                    return anchorElm;
                }
            }
            //creators of controls in the window
            var createProblemResolutionFields = function (modalWindowViewModel, modalWindowEle) {
                var resolutionProperties = {
                    PropertyName: "Resolution",
                    PropertyDisplayName: "Resolution",
                    Required: false,
                    EnumId: modalWindowViewModel.resolutionCategoryEnumId
                };
                buildEnumPicker(modalWindowEle.find('#resolutionPicker'), resolutionProperties, vm.viewModel);

                var implementationNotesProperties = {
                    PropertyName: "ResolutionDescription",
                    PropertyDisplayName: "ResolutionDescription",
                    Required: false,
                    MaxLength: 4000,
                    Rows: 5,
                    vm: vm
                };
                buildTextArea(modalWindowEle.find("#resolutionDescription"), implementationNotesProperties, vm.viewModel);

                var autoResolveProperties = {
                    PropertyName: "IsAutoResolve",
                    PropertyDisplayName: "ProblemAutoResolveIncident",
                    Inline: true,
                    Disabled: false
                };
                buildCheckbox(modalWindowEle.find("#autoResolve"), autoResolveProperties, vm.viewModel);
            };
            var createResultFields = function (modalWindowViewModel, modalWindowEle) {
                var implementationResultProperties = {
                    PropertyName: "ImplementationResults",
                    PropertyDisplayName: "ImplementationResults",
                    Required: false,
                    EnumId: modalWindowViewModel.resolutionCategoryEnumId
                };
                buildEnumPicker(modalWindowEle.find('#resolutionPicker'), implementationResultProperties, vm.viewModel);

                var implementationNotesProperties = {
                    PropertyName: "Notes",
                    PropertyDisplayName: "Implementationnotes",
                    Required: true,
                    MaxLength: 4000,
                    Rows: 5,
                    vm: vm
                };

                buildTextArea(modalWindowEle.find("#resolutionDescription"), implementationNotesProperties, vm.viewModel);

                var commentProperties = {
                    PropertyName: "Notes",
                    PropertyDisplayName: "Comment",
                    Required: false,
                    MaxLength: 4000,
                    Rows: 5,
                    vm: vm
                };
                buildTextArea(modalWindowEle.find("#comment"), commentProperties, vm.viewModel);
            };
            var createIncidentResolutionFields = function (modalWindowViewModel, modalWindowEle) {
                //resolution picker
                var resolutionProperties = {
                    PropertyName: "ResolutionCategory",
                    PropertyDisplayName: "ResolutionCategory",
                    Required: true,
                    EnumId: modalWindowViewModel.resolutionCategoryEnumId
                };
                buildEnumPicker(modalWindowEle.find('#resolutionPicker'), resolutionProperties, vm.viewModel);

                //resolution description
                var resolutionDescriptionProperties = {
                    PropertyName: "ResolutionDescription",
                    PropertyDisplayName: "ResolutionDescription",
                    Required: false,
                    MaxLength: 4000,
                    Rows: 5,
                    vm: vm
                };
                buildTextArea(modalWindowEle.find("#resolutionDescription"), resolutionDescriptionProperties, vm.viewModel);

                var letAnalystDecideProperties = {
                    PropertyName: "resolveChildIncident",
                    PropertyDisplayName: "ResolveChildIncidentMessage",
                    Inline: true,
                    Disabled: false
                };
                buildCheckbox(modalWindowEle.find("#letAnalystDecide"), letAnalystDecideProperties, vm.viewModel);
            };
            var createStatusPicker = function (modalWindowViewModel, modalWindowEle) {
                var statusProperties = {
                    PropertyName: "Status",
                    PropertyDisplayName: "Status",
                    EnumId: modalWindowViewModel.enumId
                };
                buildEnumPicker(modalWindowEle.find('#statusPicker'), statusProperties, vm.viewModel);
            };
            //form field helper
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
            var buildTextArea = function (container, props, vmModel) {
                txtAreaControl.build(vmModel, props, function (cbTxtAreaControl) {
                    container.html(cbTxtAreaControl);
                    app.controls.apply(container, {
                        localize: true,
                        vm: vmModel,
                        bind: true
                    });
                });
            };
            var buildCheckbox = function (container, props, vmModel) {
                checkBoxControl.build(vmModel, props, function (txtCheckboxControl) {
                    container.html(txtCheckboxControl);
                    app.controls.apply(container, {
                        localize: true, vm: vmModel, bind: true
                    });
                });
            }
            var getDrawerTaskChildEditedFields = function (viewModel, resolutionCategoryId) {
                var json = [
                    {
                        PropertyName: "Status",
                        PropertyType: "enum",
                        EditedValue: viewModel.get("newStatusObj").Id
                    },
                    {
                        PropertyName: "ResolutionCategory",
                        PropertyType: "enum",
                        EditedValue: resolutionCategoryId
                    },
                    {
                        PropertyName: "ResolutionDescription",
                        PropertyType: "string",
                        EditedValue: viewModel.get("resolutionDescription")
                    },
                    {
                        PropertyName: "ResolvedDate",
                        PropertyType: "date",
                        EditedValue: new Date().toISOString()
                    },
                    {
                        //resolved by user 
                        PropertyName: "RelatesToTroubleTicket",
                        PropertyType: "singlecardinalityobject",
                        PropertyRelationshipId: "f7d9b385-a84d-3884-7cde-e2c926d931a5", //TroubleTicketResolvedByUserRelationshipString
                        EditedValue: session.user.Id
                    },
                    {
                        //action log for IR resolved.
                        PropertyName: "AppliesToTroubleTicket",
                        PropertyType: "multiplecardinalityobject",
                        propertyRelationshipId: "a860c62e-e675-b121-f614-e52fcbd9ef2c", //TroubleTicketHasActionLogId
                        EditedValue: {
                            ActionType: {
                                Id: "5ca2cfee-6740-1576-540B-ce17222840b8",
                                Name: "Record Resolved"
                            },
                            Description: viewModel.get("resolutionDescription"),
                            DescriptionDisplay: viewModel.get("resolutionDescription"),
                            EnteredBy: session.user.Name,
                            EnteredDate: new Date().toISOString(),
                            LastModified: new Date().toISOString(),
                            Title: localization.RecordResolved,
                            Image: app.config.iconPath + app.config.icons["Record Resolved"]
                        }
                    }];

                return json;
            }
            var getDrawerTaskEditedFields = function (viewModel) {
                var json = [
                    {
                        PropertyName: "Status",
                        PropertyType: "enum",
                        EditedValue: viewModel.get("newStatusObj").Id
                    }
                ];
                switch (viewModel.get("newStatusObj").Id) {
                    case app.constants.workItemStatuses.Incident.Closed:
                        json.push({
                            PropertyName: "ClosedDate",
                            PropertyType: "date",
                            EditedValue: new Date().toISOString()
                        },
                        {
                           //closed by user 
                           PropertyName: "RelatesToTroubleTicket_",
                           PropertyType: "singlecardinalityobject",
                           PropertyRelationshipId: "76bc6c3b-a77b-2468-0a63-169d23dfcdf0", //TroubleTicketClosedByUserRelationshipString
                           EditedValue: session.user.Id
                        });
                        break;
                    case app.constants.workItemStatuses.ServiceRequest.Closed:
                        json.push({
                            PropertyName: "ClosedDate",
                            PropertyType: "date",
                            EditedValue: new Date().toISOString()
                        },
                        {
                            //closed by user 
                            PropertyName: "ClosedByUser",
                            PropertyType: "singlecardinalityobject",
                            PropertyRelationshipId: "ba8180d3-5bf9-1bbd-ae87-145dd8fc520f", //WorkItemClosedByUserRelationshipString
                            EditedValue: session.user.Id
                        });
                        break;
                    case app.constants.workItemStatuses.Incident.Resolved:
                        json.push({
                            PropertyName: "ResolutionCategory",
                            PropertyType: "enum",
                            EditedValue: viewModel.get("newResolutionId").Id
                        },
                        {
                            PropertyName: "ResolutionDescription",
                            PropertyType: "string",
                            EditedValue: viewModel.get("resolutionDescription")
                        },
                        {
                            PropertyName: "ResolvedDate",
                            PropertyType: "date",
                            EditedValue: new Date().toISOString()
                        },
                        {
                            //resolved by user 
                            PropertyName: "RelatesToTroubleTicket",
                            PropertyType: "singlecardinalityobject",
                            PropertyRelationshipId: "f7d9b385-a84d-3884-7cde-e2c926d931a5", //TroubleTicketResolvedByUserRelationshipString
                            EditedValue: session.user.Id
                        },
                        {
                            //action log for IR resolved.
                            PropertyName: "AppliesToTroubleTicket",
                            PropertyType: "multiplecardinalityobject",
                            propertyRelationshipId: "a860c62e-e675-b121-f614-e52fcbd9ef2c", //TroubleTicketHasActionLogId
                            EditedValue: {
                                ActionType: {
                                    Id: "5ca2cfee-6740-1576-540B-ce17222840b8",
                                    Name: "Record Resolved"
                                },
                                Description: viewModel.get("resolutionDescription"),
                                DescriptionDisplay: viewModel.get("resolutionDescription"),
                                EnteredBy: session.user.Name,
                                EnteredDate: new Date().toISOString(),
                                LastModified: new Date().toISOString(),
                                Title: localization.RecordResolved,
                                Image: app.config.iconPath + app.config.icons["Record Resolved"]
                            }
                        });
                        break;
                    case app.constants.workItemStatuses.ServiceRequest.Completed:

                        json.push({
                            PropertyName: "Notes",
                            PropertyType: "string",
                            EditedValue: viewModel.get("resultNote")
                        },
                        {
                            PropertyName: "CompletedDate",
                            PropertyType: "date",
                            EditedValue: new Date().toISOString()
                        });

                        if (!_.isUndefined(viewModel.get("newResultId").Id)) {
                            json.push({
                                PropertyName: "ImplementationResults",
                                PropertyType: "enum",
                                EditedValue: viewModel.get("newResultId").Id
                            });
                        }

                        break;
                    case app.constants.workItemStatuses.ServiceRequest.Cancelled:
                        json.push({
                            PropertyName: "Notes",
                            PropertyType: "string",
                            EditedValue: viewModel.get("resultComment")
                        });
                        break;
                    default:
                }

                return json;
            }
            //resolution funcs
            var getResolveChildIncidentSettings = function () {
                $.get("/api/V3/Projection/GetParentWorkItemSettings", {}, function (data) {
                    resolveChildIncidentSettings = data;
                });
            };
            var toggleAdditionalFields = function (statusId, currentStatusId, vmWindow) {
                
                switch (statusId) {
                    case incidentResolved:
                        vmWindow.set("irStatusResolved", true);
                        vmWindow.set("irCategoryRequired", true);
                        vmWindow.set("irResolveChildOption", vmWindow.selectedParents.length>0 && resolveChildIncidentSettings.ResolvedLetAnalystDecide);
                        break;
                    case serviceRequestCancelled:
                        vmWindow.set("srStatusCancelled", true);
                        vmWindow.set("srStatusCompleted", false);
                        break;
                    case serviceRequestCompleted:
                        vmWindow.set("srStatusCompleted", true);
                        vmWindow.set("srNotesRequired", true);
                        vmWindow.set("srStatusCancelled", false);
                        break;
                    default:
                        vmWindow.set("irStatusResolved", false);
                        vmWindow.set("irCategoryRequired", false);
                        vmWindow.set("srStatusCancelled", false);
                        vmWindow.set("srStatusCompleted", false);
                        vmWindow.set("srNotesRequired", false);
                        break;
                }

                vmWindow.set("okEnabled", true);

            };
            var enableResolutionSettings = function (statusId, vmWindow) {
                switch (statusId) {
                    case incidentResolved: // incident resolved (check for resolve child settings ans how resolution section)
                        vmWindow.set("resolveChildSettings", resolveChildIncidentSettings);
                        vmWindow.set("letAnalystDecide", (resolveChildIncidentSettings.ResolvedLetAnalystDecide && vm.viewModel.IsParent));
                        vmWindow.set("requireResolution", true);
                        vmWindow.set("showResolution", true);
                        break;
                    case serviceRequestCancelled: //sr cancelled (show comment section)
                        vmWindow.set("showComment", true);
                        break;
                    case serviceRequestCompleted: //sr completed (show implementation section)
                        vmWindow.set("showResolution", true);
                        vmWindow.set("requireResolution", true)
                        break;
                    case problemResolved: //problem resolved (show resolution and auto resolve option)
                        vmWindow.set("showResolution", true);
                        vmWindow.set("requireResolution", true);
                        vmWindow.set("showAutoResolve", true);
                        break;
                    default:
                        vmWindow.set("showComment", false);
                        vmWindow.set("showResolution", false);
                        vmWindow.set("requireResolution", false);
                        vmWindow.set("showAutoResolve", false);
                        vmWindow.set("letAnalystDecide", false);
                        break;
                }

                //make sure we have a new value
                if (_.isString(vm.viewModel.Status.Name) && vm.viewModel.Status.Name.length > 0) {
                    vmWindow.set("okEnabled", true);
                } else {
                    vmWindow.set("okEnabled", false); //turn off the button now
                }
            };
            var resolveChildIncidents = function (resolveChildSettings) {
                var resolutionCategoryId = resolveChildSettings.ChildIncidentResolutionCategorySameAsParent
                                           ? vm.viewModel.ResolutionCategory.Id
                                           : resolveChildSettings.ChildIncidentResolutionCategory.Id;

                $.each(vm.viewModel.ChildWorkItem, function (i, item) {
                    item.set("Status", { Id: vm.viewModel.Status.Id, Name: vm.viewModel.Status.Name });
                    item.set("ResolutionCategory", { Id: resolutionCategoryId }); //TODO: I have some concearns here need to ask david -jk
                    item.set("ResolutionDescription", vm.viewModel.ResolutionDescription);
                    item.set("ResolvedDate", vm.viewModel.ResolvedDate);
                });
            };

            var resolveRelatedWorkItems = function () {

                $.each(vm.viewModel.RelatesToWorkItem, function (i, item) {
                    item.set("Status", { Id: incidentResolved, Name: vm.viewModel.Status.Name });
                    item.set("ResolutionDescription", vm.viewModel.ResolutionDescription);
                    item.set("ResolvedDate", vm.viewModel.ResolvedDate);
                });
            };

            //rules on what statuses are available based on current WI status
            var getFormTaskChangeRules = function () {
                //define change rules and states
                var changeRules = new Array();

                /*ServiceRequest*/
                changeRules['ServiceRequest'] = new Array();

                changeRules['ServiceRequest'][serviceRequestSubmitted] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestCompleted },
                        { field: "Id", operator: "eq", value: serviceRequestSubmitted }
                    ]
                };

                changeRules['ServiceRequest'][serviceRequestInProgress] = {
                    logic: "or",
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestCancelled },
                        { field: "Id", operator: "eq", value: serviceRequestInProgress },
                        { field: "Id", operator: "eq", value: serviceRequestOnHold }
                    ]
                };

                changeRules['ServiceRequest'][serviceRequestOnHold] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestOnHold },
                        { field: "Id", operator: "eq", value: serviceRequestCancelled },
                        { field: "Id", operator: "eq", value: serviceRequestInProgress }
                    ]
                };

                changeRules['ServiceRequest'][serviceRequestFailed] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestFailed },
                        { field: "Id", operator: "eq", value: serviceRequestClosed }
                    ]
                };

                changeRules['ServiceRequest'][serviceRequestCancelled] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestCancelled },
                        { field: "Id", operator: "eq", value: serviceRequestClosed }
                    ]
                };

                changeRules['ServiceRequest'][serviceRequestCompleted] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: serviceRequestCompleted },
                        { field: "Id", operator: "eq", value: serviceRequestClosed }
                    ]
                };

                /*END ServiceRequest*/


                /*Release Record*/
                changeRules['ReleaseRecord'] = new Array();

                changeRules['ReleaseRecord'][releaseRecordInProgress] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordCancelled },
                        { field: "Id", operator: "eq", value: releaseRecordEditing },
                        { field: "Id", operator: "eq", value: releaseRecordInProgress },
                        { field: "Id", operator: "eq", value: releaseRecordOnHold }
                    ]
                };

                changeRules['ReleaseRecord'][releaseRecordEditing] = {
                    logic: "or",
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordCancelled },
                        { field: "Id", operator: "eq", value: releaseRecordEditing }
                    ]
                };

                changeRules['ReleaseRecord'][releaseRecordOnHold] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordCancelled },
                        { field: "Id", operator: "eq", value: releaseRecordEditing },
                        { field: "Id", operator: "eq", value: releaseRecordInProgress },
                        { field: "Id", operator: "eq", value: releaseRecordOnHold }
                    ]
                };

                changeRules['ReleaseRecord'][releaseRecordFailed] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordEditing },
                        { field: "Id", operator: "eq", value: releaseRecordFailed },
                        { field: "Id", operator: "eq", value: releaseRecordClosed }
                    ]
                };

                changeRules['ReleaseRecord'][releaseRecordCancelled] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordEditing },
                        { field: "Id", operator: "eq", value: releaseRecordCancelled },
                        { field: "Id", operator: "eq", value: releaseRecordClosed }
                    ]
                };

                changeRules['ReleaseRecord'][releaseRecordCompleted] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: releaseRecordEditing },
                        { field: "Id", operator: "eq", value: releaseRecordClosed },
                        { field: "Id", operator: "eq", value: releaseRecordCompleted }
                    ]
                };

                /*END Release Record*/


                /*Change Request*/
                changeRules['ChangeRequest'] = new Array();

                changeRules['ChangeRequest'][changeRequestSubmitted] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestCompleted },
                        { field: "Id", operator: "eq", value: changeRequestSubmitted }
                    ]
                };

                changeRules['ChangeRequest'][changeRequestInProgress] = {
                    logic: "or",
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestCancelled },
                        { field: "Id", operator: "eq", value: changeRequestInProgress },
                        { field: "Id", operator: "eq", value: changeRequestOnHold }
                    ]
                };

                changeRules['ChangeRequest'][changeRequestOnHold] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestOnHold },
                        { field: "Id", operator: "eq", value: changeRequestCancelled },
                        { field: "Id", operator: "eq", value: changeRequestInProgress }
                    ]
                };

                changeRules['ChangeRequest'][changeRequestFailed] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestFailed },
                        { field: "Id", operator: "eq", value: changeRequestClosed }
                    ]
                };

                changeRules['ChangeRequest'][changeRequestCancelled] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestCancelled },
                        { field: "Id", operator: "eq", value: changeRequestClosed }
                    ]
                };

                changeRules['ChangeRequest'][changeRequestCompleted] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: changeRequestCompleted },
                        { field: "Id", operator: "eq", value: changeRequestClosed }
                    ]
                };
                /*END Change Request*/

                /*Incident*/
                changeRules['Incident'] = new Array();

                changeRules['Incident'][incidentActive] = {
                    field: "Id",
                    operator: "neq",
                    value: incidentClosed
                };

                changeRules['Incident'][incidentActivePending] = {
                    field: "Id",
                    operator: "neq",
                    value: incidentClosed
                };

                changeRules['Incident'][incidentResolved] = {
                    logic: 'or',
                    filters: [
                        { field: "Id", operator: "eq", value: incidentActive },
                        { field: "Id", operator: "eq", value: incidentClosed }
                    ]
                };

                /*END Incident*/

                /*Problem*/
                changeRules['Problem'] = new Array();
                /*END Problem*/


                return changeRules;
            }
            //bulk edit form funcs
            var bulkEditFormIsValid = function (windowViewModel, modalEle) {
                if (windowViewModel.irCategoryRequired
                    && (_.isUndefined(windowViewModel.newResolutionId.Id)
                        || windowViewModel.newResolutionId.Id.length <= 0)) {

                    modalEle.find('#changeStatusErrorWin').html(localization.RequestCategoryRequiredError);
                    return false;
                } else if (windowViewModel.srNotesRequired && windowViewModel.resultNote.length <= 0) {
                    modalEle.find('#changeStatusErrorWin').html(localization.ImplementationNotesRequiredError);
                    return false;
                } else {
                    return true;
                }
            };

            var postBulkEditChangesWithChildren = function (taskVm, windowVm, modalControl) {
                var parentIds = _.pluck(taskVm.currentSelectionOfParents, 'BaseId'); 
                $.ajax({
                    url: '/api/v3/workitem/GetChildWorkItems/',
                    data: JSON.stringify(parentIds),
                    dataType: 'json',
                    contentType: 'application/json',
                    type: "POST",
                    success: function (childIds) {
                        //determine if we set resolution category to same as parent
                        if (resolveChildIncidentSettings.ChildIncidentResolutionCategorySameAsParent) {
                            //parent and non-children wi base ids
                            var itemIds = _.pluck(windowVm.selectedWorkItems, 'BaseId');
                            //add in children
                            _.each(childIds, function (childId) {
                                itemIds.push(childId);
                            });
                            var uniqIds = _.uniq(itemIds);
                            var postData = {
                                ProjectionId: taskVm.selectedWorkItem.projectionId,
                                UpdateServiceManagement: true,
                                ItemIds: uniqIds,
                                EditedFields: getDrawerTaskEditedFields(windowVm)
                            }

                            postBulkEditChanges(postData, taskVm, modalControl);

                        } else {
                            //get child resolution cat
                            var childResolutionCatId = resolveChildIncidentSettings.ChildIncidentResolutionCategory.Id;
                            var childrenPostData = {
                                ProjectionId: taskVm.selectedWorkItem.projectionId,
                                UpdateServiceManagement: true,
                                ItemIds: childIds,
                                EditedFields: getDrawerTaskChildEditedFields(windowVm, childResolutionCatId)
                            }

                            var wiSelectionPostData = {
                                ProjectionId: taskVm.selectedWorkItem.projectionId,
                                UpdateServiceManagement: true,
                                ItemIds: _.pluck(windowVm.selectedWorkItems, 'BaseId'),
                                EditedFields: getDrawerTaskEditedFields(windowVm)
                            }
                            
                            postBulkEditChanges(wiSelectionPostData, taskVm, modalControl, function (success) {
                                if (success) {
                                    postBulkEditChanges(childrenPostData, taskVm, modalControl);
                                }
                            });
                        }
                    }
                });

            };
            var postBulkEditChanges = function (postData, taskVm, modalControl, postCallback) {
                modalControl.close();
                app.lib.mask.apply();
                $.ajax({
                    url: '/api/v3/workitem/BulkEditWorkItems/',
                    data: JSON.stringify(postData),
                    dataType: 'json',
                    contentType: 'application/json',
                    type: "POST",
                    success: function () {
                        if (!_.isUndefined(postCallback)) {
                            postCallback(true);
                        } else {
                            onBulkEditSaveSuccess(taskVm);
                        }
                    },
                    error: function () {
                        if (!_.isUndefined(postCallback)) {
                            postCallback(false);
                        } else {
                            onBulkEditSaveFailure();
                        }
                    }
                });
            };
            var onBulkEditSaveSuccess = function (taskVm) {
                if (app.isMobile()) {
                    var listControl = $("[data-control-id='" + taskVm.targetControlId + "']").data('kendoListView');
                    listControl.dataSource.query();
                } else {
                    //refresh the grid to get updated data.
                    var targetGrid = $('#' + taskVm.targetControlId).data('kendoGrid');
                    var targetGridState = app.gridUtils.savedState.getCurrentState(taskVm.targetControlId);
                    app.lib.recheckGridState(targetGridState, targetGrid);
                    targetGrid.dataSource.query(targetGridState);
                }
                app.lib.message.add(localizationHelper.localize('SaveSuccessMessage'), "success");
                app.lib.mask.remove();
                app.lib.message.show();
            }
            var onBulkEditSaveFailure = function () {
                app.lib.message.add(localizationHelper.localize('SaveErrorMessage'), "danger");
                app.lib.mask.remove();
                app.lib.message.show();
            }
            /* END functions */

            /* initialization code*/
            function initFormTask() {
                var modalEle = buildAndRender.windowEle(changeStatusTemplate);
                var formTaskViewModel = getFormTaskViewModel(modalEle);
                var anchorTemplateProps = { Target: "changeStatus" };
                buildAndRender.taskListItem(anchorTemplateProps, formTaskViewModel, anchorTemplate);
            };

            function initBulkTask() {
                var modalView = buildAndRender.windowEle(changeStatusDrawerTemplate);
                var drawerTaskViewModel = getDrawerTaskViewModel(modalView);
                var anchorEleProps = { onClick: "openModal", titleKey: node.titleKey, toolTipMessage: localizationHelper.localize('MustSelectSameTypeStatus') };
                buildAndRender.taskListItem(anchorEleProps, drawerTaskViewModel, drawerTaskTemplate);

                /*subscribe to events*/
                if (!app.isMobile()) {
                    //called on grid row clicks
                    app.events.subscribe("gridChange", function(event, grid) {
                        drawerTaskViewModel.onTargetControlChange(grid);
                        drawerTaskViewModel.targetControlId = $(grid.wrapper).attr('id');
                    });

                    //for initial grid load listen to this event so we can set persisted state information
                    app.events.subscribe("gridBound", function(event, grid) {
                        drawerTaskViewModel.onTargetControlChange(grid);
                        drawerTaskViewModel.targetControlId = $(grid.wrapper).attr('id');
                    });
                } else {
                    app.events.subscribe("mobileWiListSelectionChange", function (event, listView) {
                        if (!_.isUndefined(listView)) {
                            drawerTaskViewModel.onTargetControlChange(listView.selectedCards);
                            drawerTaskViewModel.targetControlId = listView.controlId;
                        }
                    });
                    app.events.subscribe("mobileWiListInit", function (event, listView) {
                        if (!_.isUndefined(listView)) {
                            drawerTaskViewModel.onTargetControlChange(listView.selectedCards);
                            drawerTaskViewModel.targetControlId = listView.controlId;
                        }
                    });
                }
                /*END subscribe to events*/
            };
            /* END initialization code*/

            //do it
            if (vm.type == "BulkEdit") {
                initBulkTask();
            } else {
                initFormTask();
            }
        }
    }

    return definition;

});