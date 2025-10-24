/**
analystByGroup
**/

define(function (require) {
    //we only need the achor template for this task
    var anchorTemplate = require("text!forms/tasks/anchor/view.html");
    var windowTemplate = require("text!forms/tasks/analystByGroup/view.html");
    var enumPickerControl = require("forms/fields/enum/controller");
    var drawerTaskTemplate = require("text!forms/tasks/drawerTask/view.html");

    var definition = {
        template: windowTemplate,
        build: function (vm, node, callback) {
            var callerType = vm.type; //"Incident", "ServiceRequest", "BulkEdit"
            var isBulkEdit = vm.type == "BulkEdit";
            var originalAssignedName = null;
            var originalAssignedId = null;
            var originalSupportGroup = null; //Todo: made need to initialize as an object
            var originalSupportName = "";
            var originalSupportId = "00000000-0000-0000-0000-000000000000";
            var configEnumId;
            var configPropertyName;



            //viewModel set up
            var getTaskViewModel = function (modalView) {
                //this view Model is bound to the anchor element 
                var taskVm = kendo.observable({
                    //this is the func that fires on link click
                    analystByGroup: function () {
                        if (isBulkEdit) {
                            configPropertyName = taskVm.selectedWorkItem.groupPropertyName;
                            configEnumId = taskVm.selectedWorkItem.groupPropertyEnumId;
                        } else {
                            configPropertyName = node.Configs.propertyName;
                            configEnumId = node.Configs.enumId;
                        }
                        var modalEle = modalView.element.clone();
                        var modalControl = modalEle.kendoCiresonWindow({
                            title: localization.AssignToAnalystByGroup,
                            width: 500,
                            height: 300,
                            actions: []
                        }).data("kendoWindow");

                        //this view Model is bound to the window element
                        var windowViewModal = kendo.observable({
                            propertyName: configPropertyName,       //IR: "TierQueue", SR: "SupportGroup"
                            enumId: configEnumId,                   //IR: IncidentTierQueue (enum), SR: ServiceRequestSupportGroup (enum)
                            assignToDataSource: getUserDataSource("00000000-0000-0000-0000-000000000000"),
                            assignedWorkItem: { BaseId: null, DisplayName: null },
                            userEnabled: ((vm.viewModel && vm.viewModel.SupportGroup && vm.viewModel.SupportGroup.Id)
                                || (vm.viewModel && vm.viewModel.TierQueue && vm.viewModel.TierQueue.Id)
                                || (vm.viewModel && vm.viewModel[pageForm.CRSupportGroupField] && vm.viewModel[pageForm.CRSupportGroupField].Id)
                                || (vm.viewModel && vm.viewModel[pageForm.PRSupportGroupField] && vm.viewModel[pageForm.PRSupportGroupField].Id)
                                || (vm.viewModel && vm.viewModel[pageForm.MASupportGroupField] && vm.viewModel[pageForm.MASupportGroupField].Id)
                                || (vm.viewModel && vm.viewModel.AssignedWorkItem && vm.viewModel.AssignedWorkItem.BaseId)) ? true : false,
                            okEnabled: false,
                            userChange: function (e) {
                                windowViewModal.set("okEnabled", true);
                                if (isBulkEdit) {
                                    taskVm.set("assignedWorkItem.displayName", e.sender.text());
                                    taskVm.set("assignedWorkItem.baseId", e.sender.value());
                                } else {
                                    if (vm.type == "ManualActivity") {
                                        //clear them out first
                                        vm.viewModel.AssignedWorkItem.set("DisplayName", null);
                                        vm.viewModel.AssignedWorkItem.set("BaseId", null);

                                        vm.viewModel.AssignedWorkItem.set("DisplayName", e.sender.text());
                                        vm.viewModel.AssignedWorkItem.set("BaseId", e.sender.value());
                                    }

                                    windowViewModal.assignedWorkItem.set("DisplayName", e.sender.text());
                                    windowViewModal.assignedWorkItem.set("BaseId", e.sender.value());
                                }
                            },
                            okClick: function () {
                                modalControl.close();
                                if (isBulkEdit) {
                                    app.lib.mask.apply();
                                    var postData = {
                                        ProjectionId: taskVm.selectedWorkItem.projectionId,
                                        UpdateServiceManagement: true,
                                        ItemIds: _.pluck(taskVm.currentSelection, 'BaseId'),
                                        EditedFields: getBulkEditedFieldData(taskVm)
                                    }

                                    $.ajax({
                                        url: '/api/v3/workitem/BulkEditWorkItems/',
                                        data: JSON.stringify(postData),
                                        dataType: 'json',
                                        contentType: 'application/json',
                                        type: "POST",
                                        success: function () {
                                            onBulkEditSaveSuccess(taskVm);
                                        },
                                        error: function () {
                                            onBulkEditSaveFailure();
                                        }
                                    });

                                } else {
                                    debugger
                                    //form task:
                                    //clear out assigned workitem  first
                                    vm.viewModel.AssignedWorkItem.set("DisplayName", null);
                                    vm.viewModel.AssignedWorkItem.set("BaseId", null);

                                    //assigned new user 
                                    vm.viewModel.AssignedWorkItem.set("DisplayName", windowViewModal.assignedWorkItem.DisplayName);
                                    vm.viewModel.AssignedWorkItem.set("BaseId", windowViewModal.assignedWorkItem.BaseId);

                                    if (vm.type == "Incident" && !_.isUndefined(vm.viewModel.TierQueue)) {
                                        originalSupportGroup = vm.viewModel.get("TierQueue");
                                    } else if (vm.type == "ServiceRequest" && !_.isUndefined(vm.viewModel.SupportGroup)) {
                                        originalSupportGroup = vm.viewModel.get("SupportGroup");
                                    } else if (vm.type == "ChangeRequest" && !_.isUndefined(vm.viewModel[pageForm.CRSupportGroupField])) {
                                        originalSupportGroup = vm.viewModel.get(pageForm.CRSupportGroupField);
                                    } else if (vm.type == "Problem" && !_.isUndefined(vm.viewModel[pageForm.PRSupportGroupField])) {
                                        originalSupportGroup = vm.viewModel.get(pageForm.PRSupportGroupField);
                                    } else if (vm.type == "ManualActivity" && !_.isUndefined(vm.viewModel[pageForm.MASupportGroupField])) {
                                        originalSupportGroup = vm.viewModel.get(pageForm.MASupportGroupField);
                                    }

                                    //replace original values with new saved values
                                    originalAssignedName = vm.viewModel.AssignedWorkItem.get("DisplayName");
                                    originalAssignedId = vm.viewModel.AssignedWorkItem.get("BaseId");

                                }
                            },
                            cancelClick: function () {
                                modalControl.close();
                                if (isBulkEdit) {
                                    taskVm.set("assignedWorkItem.displayName", null);
                                    taskVm.set("assignedWorkItem.baseId", null);
                                } else {
                                    //lets clean the model
                                    vm.viewModel.AssignedWorkItem.set("DisplayName", null);
                                    vm.viewModel.AssignedWorkItem.set("BaseId", null);

                                    vm.viewModel.AssignedWorkItem.set("DisplayName", originalAssignedName);
                                    vm.viewModel.AssignedWorkItem.set("BaseId", originalAssignedId);


                                    if (vm.type == "Incident" && !_.isUndefined(vm.viewModel.TierQueue)) {
                                        vm.viewModel.set("TierQueue", originalSupportGroup);
                                    } else if (vm.type == "ServiceRequest" && !_.isUndefined(vm.viewModel.SupportGroup)) {
                                        vm.viewModel.set("SupportGroup", originalSupportGroup);
                                    } else if (vm.type == "ChangeRequest" && !_.isUndefined(vm.viewModel[pageForm.CRSupportGroupField])) {
                                        vm.viewModel.set(pageForm.CRSupportGroupField, originalSupportGroup);
                                    } else if (vm.type == "ManualActivity" && !_.isUndefined(vm.viewModel[pageForm.MASupportGroupField])) {
                                        vm.viewModel.set(pageForm.MASupportGroupField, originalSupportGroup);
                                    } else if (vm.type == "Problem" && !_.isUndefined(vm.viewModel[pageForm.PRSupportGroupField])) {
                                        vm.viewModel.set(pageForm.PRSupportGroupField, originalSupportGroup);
                                    }
                                }
                            },
                        });

                        var createGroupPicker = function (windowViewModal, modalEle) {
                            var groupProperties = {
                                PropertyName: windowViewModal.propertyName,
                                PropertyDisplayName: "SupportGroup",
                                EnumId: windowViewModal.enumId
                            };
                            buildEnumPicker(modalEle.find('#groupPicker'), groupProperties, vm.viewModel);

                            //get the enum picker elm
                            var groupPicker = modalEle.find('div[data-role="' + windowViewModal.propertyName + '"]');

                            //make sure we have a group picker object and we don't error
                            if (groupPicker) {
                                //get got handlers for event binding
                                var groupDropDownControl = groupPicker.data().handler._dropdown;
                                var groupTreeViewControl = groupPicker.data().handler._treeview;

                                //bind group picker changes events
                                groupDropDownControl.bind("change", function (e) {
                                    var item = this.dataItem(this.select());
                                    var assignToCombobox = modalEle.find("#assignedToCombo").data("kendoComboBox");
                                    setSupportGroupUsers(item, windowViewModal, assignToCombobox);
                                    taskVm.set("assignedSupportGroup", item);
                                });
                                groupTreeViewControl.bind("change", function (e) {
                                    var item = this.dataItem(this.current());
                                    var assignToCombobox = modalEle.find("#assignedToCombo").data("kendoComboBox");
                                    setSupportGroupUsers(item, windowViewModal, assignToCombobox);
                                    taskVm.set("assignedSupportGroup", item);
                                });

                                var item1 = (vm.viewModel && vm.viewModel[windowViewModal.propertyName]) ? vm.viewModel[windowViewModal.propertyName] : null;
                                if (item1 && !_.isNull(item1.Id)) {
                                    windowViewModal.set("assignToDataSource", getUserDataSource(item1.Id));
                                    if (vm.viewModel.AssignedWorkItem.DisplayName) {
                                        var assignToCombobox1 = modalEle.find("#assignedToCombo").data("kendoComboBox");
                                        assignToCombobox1.text(vm.viewModel.AssignedWorkItem.DisplayName);
                                    }
                                }
                            }
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


                        //bind window element to window viewModel
                        kendo.bind(modalEle, windowViewModal);
                        //create status enumPicker
                        createGroupPicker(windowViewModal, modalEle);

                        modalEle.removeClass('hide');
                        modalEle.show();

                        modalControl.refresh();
                        modalControl.open();
                    }
                });

                return taskVm;
            };
            //addition viewModel set up for bulk task
            var setAdditionBulkTaskProperties = function (anchorViewModel) {
                var drawerTaskVm = anchorViewModel;
                //this view Model is bound to the anchor element 
                drawerTaskVm.currentSelection = [];
                drawerTaskVm.selectedWorkItem = {
                    type: '',
                    projectionId: '',
                    groupPropertyName: '',
                    groupPropertyEnumId: '',
                };
                drawerTaskVm.assignedWorkItem = {
                    displayName: "",
                    baseId: ""
                },
                    drawerTaskVm.isEnabled = false;
                drawerTaskVm.showTooltip = true;
                drawerTaskVm.setEnabled = function (enabled) {
                    this.set('isEnabled', enabled);
                    this.set('showTooltip', !enabled);
                };;
                drawerTaskVm.targetControlId = '';
                drawerTaskVm.onTargetControlChange = function (grid) {
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
                        onExceedSelectionCount();
                    }

                    anchorViewModel.set('currentSelection', selectedDataItems);

                    //if nothing is selected disabled the item
                    if (selectedDataItems.length <= 0 || selectedDataItems.length > 10) {
                        drawerTaskVm.setEnabled(false);
                    } else {
                        var selectedTypes = _.pluck(selectedDataItems, "WorkItemType");
                        var selectedStatusNames = _.pluck(selectedDataItems, "Status");

                        //return false if multiple selected, otherwise returns string values
                        var singleSelectedType = _.reduce(selectedTypes, function (memo, currentVal) {
                            return (memo === currentVal) ? memo : false;
                        });
                        drawerTaskVm.set("selectedWorkItem.type", singleSelectedType);

                        var singleSelectedStatusName = _.reduce(selectedStatusNames, function (memo, currentVal) {
                            return (memo === currentVal) ? memo : false;
                        });

                        if (singleSelectedType) {
                            switch (singleSelectedType) {
                                case "System.WorkItem.ServiceRequest":
                                    drawerTaskVm.setTrimmedWiType();
                                    drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemServiceRequestViewModel);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyName', 'SupportGroup');
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyEnumId', app.constants.enumPickerIds.ServiceRequestSupportGroup);
                                    //if SR is closed do not allow status change from here (TFS 3560)
                                    if (singleSelectedStatusName === "Closed") {
                                        drawerTaskVm.setEnabled(false);
                                    } else {
                                        drawerTaskVm.setEnabled(true);
                                    }
                                    break;
                                case "System.WorkItem.Incident":
                                    drawerTaskVm.setTrimmedWiType();
                                    drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemIncidentViewModel);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyName', 'TierQueue');
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyEnumId', app.constants.enumPickerIds.IncidentTierQueue);
                                    drawerTaskVm.setEnabled(true);
                                    break;
                                case "System.WorkItem.ChangeRequest":
                                    drawerTaskVm.setTrimmedWiType();
                                    drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemChangeRequestViewModel);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyName', session.consoleSetting.CRSupportGroupField);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyEnumId', session.consoleSetting.CRSupportGroupGuid);

                                    if (!_.isNull(session.consoleSetting.CRSupportGroupField) && session.consoleSetting.CRSupportGroupField!="") {
                                        drawerTaskVm.setEnabled(true);
                                    } else {
                                        drawerTaskVm.setEnabled(false);
                                    }
                                    
                                    break;
                                case "System.WorkItem.Problem":
                                    drawerTaskVm.setTrimmedWiType();
                                    drawerTaskVm.set('selectedWorkItem.projectionId', app.constants.projectionIds.SystemWorkItemProblemViewModel);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyName', session.consoleSetting.PRSupportGroupField);
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyEnumId', session.consoleSetting.PRSupportGroupGuid);
                                    if (!_.isNull(session.consoleSetting.PRSupportGroupField) && session.consoleSetting.PRSupportGroupField != "") {
                                        drawerTaskVm.setEnabled(true);
                                    } else {
                                        drawerTaskVm.setEnabled(false);
                                    }
                                    break;
                                default:
                                    drawerTaskVm.set('selectedWorkItem.projectionId', '');
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyName', '');
                                    drawerTaskVm.set('selectedWorkItem.groupPropertyEnumId', '');
                                    // not a supported bulk edit Type, disable the edit button
                                    drawerTaskVm.setEnabled(false);
                            }
                        } else {
                            //not same type && status
                            drawerTaskVm.setEnabled(false);
                        }
                    }
                };
                anchorViewModel.setTrimmedWiType = function () {
                    this.set('selectedWorkItem.trimmedType', this.selectedWorkItem.type.split(/[\s.]+/).pop());
                };


            };
            //helper functions
            var getBulkEditedFieldData = function (viewModel) {
                var json = [];

                switch (viewModel.selectedWorkItem.trimmedType) {
                    case "Incident":
                        json = [
                            {
                                PropertyName: "TierQueue",
                                EditedValue: viewModel.assignedSupportGroup.Id,
                                PropertyType: "enum"
                            },
                            {
                                PropertyName: "AssignedWorkItem",
                                EditedValue: viewModel.assignedWorkItem.baseId,
                                PropertyType: "singleCardinalityObject",
                                PropertyRelationshipId: "15e577a3-6bf9-6713-4eac-ba5a5b7c4722" //magic guid
                            },
                            {
                                PropertyName: "AppliesToTroubleTicket",
                                PropertyType: "multiplecardinalityobject",
                                PropertyRelationshipId: "a860c62e-e675-b121-f614-e52fcbd9ef2c", //more magic!
                                EditedValue: {
                                    ActionType: {
                                        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65", //magic?
                                        Name: "Record Assigned"
                                    },
                                    Description: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    DescriptionDisplay: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    EnteredBy: session.user.Name,
                                    EnteredDate: new Date().toISOString(),
                                    LastModified: new Date().toISOString(),
                                    Title: localization.RecordAssigned,
                                    Image: app.config.iconPath + app.config.icons["Record Assigned"]
                                }
                            }
                        ];
                        break;
                    case "ServiceRequest":
                        json = [
                            {
                                PropertyName: "SupportGroup",
                                EditedValue: viewModel.assignedSupportGroup.Id,
                                PropertyType: "enum"
                            },
                            {
                                PropertyName: "AssignedWorkItem",
                                EditedValue: viewModel.assignedWorkItem.baseId,
                                PropertyType: "singleCardinalityObject",
                                PropertyRelationshipId: "15e577a3-6bf9-6713-4eac-ba5a5b7c4722" //magic guid
                            },
                            {
                                PropertyName: "AppliesToWorkItem",
                                PropertyType: "multiplecardinalityobject",
                                PropertyRelationshipId: "79d27435-5917-b0a1-7911-fb2b678f32a6", //more magic!
                                EditedValue: {
                                    ActionType: {
                                        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65", //magic?
                                        Name: "Record Assigned"
                                    },
                                    Description: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    DescriptionDisplay: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    EnteredBy: session.user.Name,
                                    EnteredDate: new Date().toISOString(),
                                    LastModified: new Date().toISOString(),
                                    Title: localization.RecordAssigned,
                                    Image: app.config.iconPath + app.config.icons["Record Assigned"]
                                }
                            }
                        ];
                        break;
                    case "ChangeRequest":
                        json = [
                            {
                                PropertyName: pageForm.CRSupportGroupField,
                                EditedValue: viewModel.assignedSupportGroup.Id,
                                PropertyType: "enum"
                            },
                            {
                                PropertyName: "AssignedWorkItem",
                                EditedValue: viewModel.assignedWorkItem.baseId,
                                PropertyType: "singleCardinalityObject",
                                PropertyRelationshipId: "15e577a3-6bf9-6713-4eac-ba5a5b7c4722" //magic guid
                            },
                            {
                                PropertyName: "AppliesToWorkItem",
                                PropertyType: "multiplecardinalityobject",
                                PropertyRelationshipId: "79d27435-5917-b0a1-7911-fb2b678f32a6", //more magic!
                                EditedValue: {
                                    ActionType: {
                                        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65", //magic?
                                        Name: "Record Assigned"
                                    },
                                    Description: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    DescriptionDisplay: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    EnteredBy: session.user.Name,
                                    EnteredDate: new Date().toISOString(),
                                    LastModified: new Date().toISOString(),
                                    Title: localization.RecordAssigned,
                                    Image: app.config.iconPath + app.config.icons["Record Assigned"]
                                }
                            }
                        ];
                        break;
                    case "Problem":
                        json = [
                            {
                                PropertyName: pageForm.PRSupportGroupField,
                                EditedValue: viewModel.assignedSupportGroup.Id,
                                PropertyType: "enum"
                            },
                            {
                                PropertyName: "AssignedWorkItem",
                                EditedValue: viewModel.assignedWorkItem.baseId,
                                PropertyType: "singleCardinalityObject",
                                PropertyRelationshipId: "15e577a3-6bf9-6713-4eac-ba5a5b7c4722" //magic guid
                            },
                            {
                                PropertyName: "AppliesToWorkItem",
                                PropertyType: "multiplecardinalityobject",
                                PropertyRelationshipId: "79d27435-5917-b0a1-7911-fb2b678f32a6", //more magic!
                                EditedValue: {
                                    ActionType: {
                                        Id: "b04370d9-3d4f-3981-61bb-ac9462a1fe65", //magic?
                                        Name: "Record Assigned"
                                    },
                                    Description: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    DescriptionDisplay: localization.RecordAssignedDescription.replace("{0}", session.user.Name).replace("{1}", viewModel.assignedWorkItem.displayName),
                                    EnteredBy: session.user.Name,
                                    EnteredDate: new Date().toISOString(),
                                    LastModified: new Date().toISOString(),
                                    Title: localization.RecordAssigned,
                                    Image: app.config.iconPath + app.config.icons["Record Assigned"]
                                }
                            }
                        ];
                        break;
                    default:
                }

                return json;
            }
            var onExceedSelectionCount = function () {
                kendo.ui.ExtAlertDialog.show({
                    title: localizationHelper.localize('Warning'),
                    message: localizationHelper.localize('BulkEditExceedMessage')
                });
            }
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
            var getOriginalFormValues = function () {
                if (!_.isUndefined(vm.viewModel.AssignedWorkItem)) {
                    originalAssignedName = vm.viewModel.AssignedWorkItem.DisplayName;
                    originalAssignedId = vm.viewModel.AssignedWorkItem.BaseId;
                }


                if (callerType == "Incident") {
                    originalSupportGroup = vm.viewModel.TierQueue;
                    originalSupportName = (!_.isNull(vm.viewModel.TierQueue) && !_.isUndefined(vm.viewModel.TierQueue))
                        ? vm.viewModel.TierQueue.Name
                        : "";
                    originalSupportId = (!_.isNull(vm.viewModel.TierQueue) && !_.isUndefined(vm.viewModel.TierQueue))
                        ? vm.viewModel.TierQueue.Id
                        : "00000000-0000-0000-0000-000000000000";
                } else if (callerType == "ServiceRequest") {
                    originalSupportGroup = vm.viewModel.SupportGroup;
                    originalSupportName = (!_.isNull(vm.viewModel.SupportGroup) && !_.isUndefined(vm.viewModel.SupportGroup))
                        ? vm.viewModel.SupportGroup.Name : "";
                    originalSupportId = (!_.isNull(vm.viewModel.SupportGroup) && !_.isUndefined(vm.viewModel.SupportGroup))
                        ? vm.viewModel.SupportGroup.Id : "00000000-0000-0000-0000-000000000000";
                }

                if (!_.isUndefined(originalSupportGroup) && !_.isNull(originalSupportGroup)) {
                    originalSupportGroup.Text = originalSupportGroup.Name; //Need this so mapping works later on :-( .  
                }
            }
            var getUserDataSource = function (selectedSupportGroupId) {
                var userDataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: app.lib.addUrlParam("/api/V3/User/GetSupportGroupUsers", "id", selectedSupportGroupId),
                            xhrFields: {
                                withCredentials: true
                            },
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                Id: { type: "string" },
                                Name: { type: "string" }
                            }
                        }
                    }
                });
                return userDataSource;
            }
            var resetAssignToField = function (asssignToComboBox) {
                asssignToComboBox.focus();
                asssignToComboBox.value("");
                asssignToComboBox.input.attr("placeholder", localization.ChooseOne);
                
                if (vm.type == "ManualActivity") {
                    vm.viewModel.AssignedWorkItem.set("BaseId", null);
                    vm.viewModel.AssignedWorkItem.set("DisplayName", null);
                }
            }

            var setSupportGroupUsers = function (item, vmWindow, asssignToComboBox) {
                if (_.isUndefined(item)) {
                    return;
                }

                if (!isBulkEdit) {
                    if (vm.type == "Incident" && !_.isUndefined(vm.viewModel.TierQueue)) {
                        vm.viewModel.set("TierQueue", item);
                    } else if (vm.type == "ServiceRequest" && !_.isUndefined(vm.viewModel.SupportGroup)) {
                        vm.viewModel.set("SupportGroup", item);
                    } else if (vm.type == "ChangeRequest" && !_.isUndefined(vm.viewModel[pageForm.CRSupportGroupField])) {
                        vm.viewModel.set(pageForm.CRSupportGroupField, item);
                    } else if (vm.type == "Problem" && !_.isUndefined(vm.viewModel[pageForm.PRSupportGroupField])) {
                        vm.viewModel.set(pageForm.PRSupportGroupField, item);
                    }

                }
                vmWindow.set("userEnabled", true);
                vmWindow.set("okEnabled", true);

                resetAssignToField(asssignToComboBox);

                vmWindow.set("assignToDataSource", getUserDataSource(item.Id));

                if (originalAssignedName) {
                    $("#assignedToCombo-list").hide();
                    setTimeout(function () {
                        if (vmWindow.assignToDataSource.data().length > 0) {
                            var userData = vmWindow.assignToDataSource.data();
                            var user = _.where(userData, { Id: originalAssignedId });

                            //fill in user dropdown with current/selected assigned user only when user is part of the group, else reset the user dropdown
                            if (user.length > 0) {
                                asssignToComboBox.value(originalAssignedId);
                                asssignToComboBox.text(originalAssignedName);
                            } else {
                                resetAssignToField(asssignToComboBox);
                            }
                        }

                        if (asssignToComboBox.items().length === 0) {
                            resetAssignToField(asssignToComboBox);
                            vm.viewModel.AssignedWorkItem.set("DisplayName", null);
                            vm.viewModel.AssignedWorkItem.set("BaseId", null);
                        }
                    }, 550);
                }

            }
            var buildAndRender = {
                windowEle: function () {
                    //build the template for the window
                    var built = _.template(windowTemplate);
                    var view = new kendo.View(built(), { wrap: false });
                    //add in hidden window
                    callback(view.render());
                    view.destroy();//there is some issue with the cloned element if we don't destroy the view
                    return view;
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
            /* initialization code*/
            function initTask() {
                //build and render window
                var modalView = buildAndRender.windowEle();
                //save orig values for defined form
                if (!isBulkEdit) {
                    getOriginalFormValues();
                }
                //get the view models
                var formTaskViewModel = getTaskViewModel(modalView);

                if (isBulkEdit) {
                    setAdditionBulkTaskProperties(formTaskViewModel);
                    buildAndRender.taskListItem({ onClick: "analystByGroup", toolTipMessage: localizationHelper.localize('MustSelectSameType') }, formTaskViewModel, drawerTaskTemplate);
                    /*subscribe to events*/
                    if (!app.isMobile()) {
                        //called on grid row clicks
                        app.events.subscribe("gridChange", function (event, grid) {
                            formTaskViewModel.onTargetControlChange(grid);
                            formTaskViewModel.targetControlId = $(grid.wrapper).attr('id');
                        });

                        //for initial grid load listen to this event so we can set persisted state information
                        app.events.subscribe("gridBound", function (event, grid) {
                            formTaskViewModel.onTargetControlChange(grid);
                            formTaskViewModel.targetControlId = $(grid.wrapper).attr('id');
                        });
                    } else {
                        //called on mobile listview checkbox selection
                        app.events.subscribe("mobileWiListSelectionChange", function (event, listView) {
                            if (!_.isUndefined(listView)) {
                                formTaskViewModel.onTargetControlChange(listView.selectedCards);
                                formTaskViewModel.targetControlId = listView.controlId;
                            }
                        });
                        app.events.subscribe("mobileWiListInit", function (event, listView) {
                            if (!_.isUndefined(listView)) {
                                formTaskViewModel.onTargetControlChange(listView.selectedCards);
                                formTaskViewModel.targetControlId = listView.controlId;
                            }
                        });
                    }
                    /*END subscribe to events*/


                } else {
                    //build and render the link
                    buildAndRender.taskListItem({ Target: "analystByGroup" }, formTaskViewModel, anchorTemplate);
                }

            };

            /* END initialization code*/

            //do it
            initTask();
        }
    }

    return definition;
});