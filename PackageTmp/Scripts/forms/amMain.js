require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        text: "require/text"
    },

    shim: {
        //kendo: {
        //    deps: ['jquery'],
        //    exports: 'kendo'
        //}
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

    var dataVM = pageForm.viewModel;
    var current;


    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
    pageForm.headerTemplate = {
        rows: [
            {
                columns: [
                    { View: "stickyCI", Class: "" }
                    //{ View: "status", Class: "col-md-6 col-xs-12" },
                    //{ View: "spacer", ColSpan: 4 }
                ]
            }
        ]
    };

    pageForm.taskTemplate = {};
    var showChangeStatus = session.user.AssetManager;
    var showChangeStatus = true;
    if (pageForm.type === 'HardwareAsset') {

        pageForm.taskTemplate = {
            tasks: [

                { Task: "associateItem", Label: localization.AssociateCatalogItem, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasCatalogItem" } },
                { Task: "associateItem", Label: localization.AssociateConfigurationItem, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasAssociatedCI" } },
                { Task: "associateItem", Label: localization.AssociateCostCenter, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasCostCenter" } },
                { Task: "associateItem", Label: localization.AssociateCustodian, Access: showChangeStatus, Configs: { relationshipKey: "OwnedBy" } },
                { Task: "associateItem", Label: localization.AssociateInvoice, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasInvoice" } },
                { Task: "associateItem", Label: localization.AssociateLease, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasLease" } },
                { Task: "associateItem", Label: localization.AssociateLocation, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasLocation" } },
                { Task: "associateItem", Label: localization.AssociateOrganization, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasOrganization" } },
                { Task: "associateItem", Label: localization.AssociatePrimaryUser, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasPrimaryUser" } },
                { Task: "associateItem", Label: localization.AssociatePurchaseOrder, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasPurchaseOrder" } },
                { Task: "associateItem", Label: localization.AssociateSupportContract, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasSupportContract" } },
                { Task: "associateItem", Label: localization.AssociateVendor, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasVendor" } },
                { Task: "associateItem", Label: localization.AssociateWarranty, Access: showChangeStatus, Configs: { relationshipKey: "Target_HardwareAssetHasWarranty" } },

                { Task: "amChangeStatus", Label: localization.ChangeStatus, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: "6B7304C4-1B09-BFFC-3FE3-1CFD3EB630CB", enumName: "HardwareAssetStatus" } },
                { Task: "amChangeStatus", Label: localization.ChangeType, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: "F165A798-B232-3509-AF88-61AFBAFE714A", enumName: "HardwareAssetType" } },
                { Task: "setDate", Label: localization.DisposeHardwareAsset, Access: showChangeStatus, Configs: { type: pageForm.type, propertyKey: "DisposalDate", viewType: "hdDisposal", Title: localization.DisposeHardwareAsset } },
                { Task: "setDate", Label: localization.SetMasterLeaseWarrantyStartsDate, Access: showChangeStatus, Configs: { type: pageForm.type, propertyKey: "MasterContractRenewedOn", viewType: "MasterContractRenewedOn", Title: localization.SetMasterLeaseWarrantyStartsDate } },
                { Task: "setDate", Label: localization.SetReceiveDate, Access: showChangeStatus, Configs: { type: pageForm.type, propertyKey: "ReceivedDate", viewType: "hdREcieveDate", Title: localization.SetReceiveDate } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }

            ]
        };
    } else if (pageForm.type === 'SoftwareAsset') {
        pageForm.taskTemplate = {
            tasks: [

                { Task: "associateItem", Label: localization.AssociateCatalogItem, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasCatalogItem" } },
                { Task: "associateItem", Label: localization.AssociateCostCenter, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasCostCenter" } },
                { Task: "associateItem", Label: localization.AssociateCustodian, Access: showChangeStatus, Configs: { relationshipKey: "OwnedBy" } },
                { Task: "associateItem", Label: localization.AssociateInvoice, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasInvoice" } },
                { Task: "associateItem", Label: localization.AssociateLocation, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasLocation" } },
                { Task: "associateItem", Label: localization.AssociateOrganization, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasOrganization" } },
                { Task: "associateItem", Label: localization.AssociatePrimaryUser, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasPrimaryUser" } },
                { Task: "associateItem", Label: localization.AssociatePurchaseOrder, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasPurchaseOrder" } },
                { Task: "associateItem", Label: localization.AssociateSupportContract, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasSupportContract" } },
                { Task: "associateItem", Label: localization.AssociateVendor, Access: showChangeStatus, Configs: { relationshipKey: "Target_SoftwareAssetHasVendor" } },

                { Task: "amChangeStatus", Label: localization.ChangeStatus, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: "2FDA317F-714C-D12C-BBB3-14A1885B92DB", enumName: "SoftwareAssetStatus" } },
                { Task: "amChangeStatus", Label: localization.ChangeType, Access: showChangeStatus, Configs: { type: pageForm.type, statusEnumId: "43BA79D1-14F4-8466-4144-407C7F1D7734", enumName: "SoftwareAssetType" } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };

        if (pageForm.isNew == false) {
            pageForm.taskTemplate.tasks.push({ Task: "copyLicenseAssignments", Label: localization.CopyLicenseAssignments, Access: showChangeStatus, Configs: { type: pageForm.type } });
            pageForm.taskTemplate.tasks.push({ Task: "updateAssetManagement", Label: localization.UpdateSoftwareAsset, Access: showChangeStatus, Configs: { type: pageForm.type } });
        }
    } else if (pageForm.type === 'ContractLease') {
        pageForm.taskTemplate = {
            tasks: [
                { Task: "updateAssetManagement", Label: localization.UpdateLease, Access: showChangeStatus, Configs: { type: pageForm.type } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };
        if (pageForm.isNew == false) {
            pageForm.taskTemplate.tasks.push({ Task: "updateSupersededHardware", Label: localization.UpdateSupersededHardwareAssetLease, Access: showChangeStatus, Configs: { type: pageForm.type, baseId: pageForm.viewModel.BaseId, url: "/AssetManagement/Contract/Lease/UpdateSupersededHardwareAsset/" } });
        }
    } else if (pageForm.type === 'WarrantyContract') {
        pageForm.taskTemplate = {
            tasks: [
                { Task: "updateAssetManagement", Label: localization.UpdateWarranty, Access: showChangeStatus, Configs: { type: pageForm.type } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }
                //{ Task: "updateSupersededHardware", Label: localization.UpdateSuppersededHardwareAssetWarranties, Access: showChangeStatus, Configs: { type: pageForm.type, baseId: pageForm.viewModel.BaseId, url: "/AssetManagement/Contract/Warranty/UpdateSupersededHardwareAsset/" } }
            ]
        };
        if (pageForm.isNew == false) {
            pageForm.taskTemplate.tasks.push({ Task: "updateSupersededHardware", Label: localization.UpdateSupersededHardwareAssetWarranties, Access: showChangeStatus, Configs: { type: pageForm.type, baseId: pageForm.viewModel.BaseId, url: "/AssetManagement/Contract/Warranty/UpdateSupersededHardwareAsset/" } });

        }
    } else if (pageForm.type === 'SupportAndMaintenance') {

        pageForm.taskTemplate = {
            tasks: [
                { Task: "updateAssetManagement", Label: localization.UpdateContract, Access: showChangeStatus, Configs: { type: pageForm.type } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }
                //{ Task: "updateSupersededHardware", Label: localization.UpdateSuppersededAssetSupportContracts, Access: showChangeStatus, Configs: { type: pageForm.type, baseId: pageForm.viewModel.BaseId, url: "/AssetManagement/Contract/SupportandMaintenance/UpdateSupersededHardwareAsset/" } }
            ]
        };
        if (pageForm.isNew == false) {
            pageForm.taskTemplate.tasks.push({ Task: "updateSupersededHardware", Label: localization.UpdateSupersededAssetSupportContracts, Access: showChangeStatus, Configs: { type: pageForm.type, baseId: pageForm.viewModel.BaseId, url: "/AssetManagement/Contract/SupportandMaintenance/UpdateSupersededHardwareAsset/" } });
        }
    } else if (pageForm.type === 'License') {

        pageForm.taskTemplate = {
            tasks: [
                { Task: "updateAssetManagement", Label: localization.UpdateLicense, Access: showChangeStatus, Configs: { type: pageForm.type, percent: pageForm.percent } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }

            ]
        };
    } else if (pageForm.type === 'Consumables') {

        pageForm.taskTemplate = {
            tasks: [
                { Task: "updateAssetManagement", Label: localization.UpdateConsumable, Access: showChangeStatus, Configs: { type: pageForm.type, percent: pageForm.percent } },
                { Task: "increaseAvailableCount", Label: localization.IncreaseAvailableCount, Access: showChangeStatus, Configs: { type: pageForm.type } },
                { Task: "decreaseAvailableCount", Label: localization.DecreaseAvailableCount, Access: showChangeStatus, Configs: { type: pageForm.type } },
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }

            ]
        };
    } else {
        pageForm.taskTemplate = {
            tasks: [
                { Task: "print", Label: localization.Print, Access: true, Configs: {} }
            ]
        };
    }

    //add custom tasks
    var tasks = app.custom.formTasks.get(pageForm.type);
    if (_.isArray(tasks)) {
        $.each(tasks, function (i, task) {
            pageForm.taskTemplate.tasks.push({ Task: "custom", Type: pageForm.type, Label: task.label, Access: true, Configs: { func: task.func } })
        });
    }


    var init = function () {
        // select template
        setTemplateJSONFromSessionAdJSON();

        var alertContainer = $('#alertMessagesContainer');
        alertContainer.addClass("sticky-header");
        formContainer.addClass("sticky-header");
        taskContainer.addClass("sticky-header");
        headerContainer.addClass("sticky-header");

        if (!app.isMobile()) {
            //add dynamic containers to main container
            mainContainer.append(formContainer);

            mainContainer.before(taskContainer);
        } else {
            mainContainer.append(formContainer);
            mainContainer.after(taskContainer);
        }

        if (pageForm.taskTemplate.tasks != null)
            taskContainer.append("<h2>" + localization.Tasks + "</h2>");
        
        taskBuilder.build(pageForm, function (view) {
            taskContainer.append(view);
        });
        

        //build and add header container
        headerBuilder.build(pageForm, function (view) {
            headerContainer.append(view);
        });

        //build and add form from json definition
        formBuilder.build(pageForm, function (html) {

            formContainer.append(html);
            app.controls.apply(formContainer, { localize: true, vm: dataVM, bind: true });
            formContainer.show();

            // make sure we have the drawer before we try to add buttons buttons
            //if (!_.isUndefined(drawermenu)) { //stupid underscore need to move to lo-dash
            if (typeof (drawermenu) != 'undefined') {
                createButtons();
            } else {
                app.events.subscribe("drawerCreated", function () {
                    createButtons();
                });
            }

            app.lib.handleMessages();


            switch (pageForm.type) {
                case "ContractLease":
                case "WarrantyContract":
                    ContractLeaseOrWarranty.MasterContract(dataVM, pageForm);
                    disableFields("Name");
                    break;
                case "SupportAndMaintenance":
                    ContractSupportandMaintenance.Init(dataVM, pageForm);
                    disableFields("Name");
                    break;
                case "HardwareAsset":
                    HardwareAsset.Init(dataVM,mainContainer);
                    disableFields("HardwareAssetID");
                    break;
                case "SoftwareAsset":
                    SoftwareAsset.Init(dataVM, mainContainer);
                    break;
                case "Subnet":
                    Subnet.Init(dataVM);
                    disableFields("Name");
                    break;
                case "PurchaseOrder":
                    var lineItemTotal = !_.isNull(dataVM.get("LineItemsTotal")) ? dataVM.get("LineItemsTotal") : "0.00";
                    pageForm.common.TotalAmountOrCost("Target_PurchaseOrderHasChildPurchaseOrder", "POTotalCost", "Amount", localization.TotalAmountOfChildPO);
                    pageForm.common.TotalAmountOrCost("Target_PurchaseOrderHasInvoices", "InvoiceTotalCost", "TotalAmount", localization.TotalAmountOfInvoices);
                    dataVM.set("PurchaseTotalCost", localization.TotalcostofallLineItems + " " + lineItemTotal);
                    purchaseOrder.Init(dataVM, mainContainer);
                    disableFields("PurchaseOrderNumber");
                    break;
                case "Standard":
                    disableFields("Id");
                    break;
                case "Consumables":
                    disableFields("AssignedCount", "Numeric");
                    Consumable.Init(dataVM);
                    break;
                case "NewNoticeEvent":
                    NoticeEvent.Init(dataVM, mainContainer);
                    break;
                case "License":
                    pageForm.UpdateLicense = function () {
                        var mpeCurrent = "8b2d259d-7acf-11ad-dc56-1267aea07471";
                        var mpeExpired = "4d5f06e7-04ba-e854-c576-9e645057fc9c";
                        var mpeExpiring = "646feb63-e056-203b-8c4a-2fae16f4a539";
                        var licenseTypePerm = "1c74b55c-7147-99cf-377e-922b877b0983";
                        var licenseTypeTemp = "f08b16a4-3cc0-440a-d554-5d4f998becf3";
                        var expiryDateControl = $("input[name='ExpiryDate']").data("kendoDatePicker");
                        var expiryDateLabel = $("label[for='ExpiryDate']");
                        if (pageForm.viewModel["Type"].Id == null) {
                            pageForm.viewModel.set("Status", { Id: mpeCurrent, Name: localization.Current, Text: localization.Current });
                            return pageForm.SetSeatsRemaining(pageForm.viewModel);
                        }

                        switch (pageForm.viewModel["Type"].Id) {
                            case licenseTypePerm:
                                pageForm.viewModel.set("Status", { Id: mpeCurrent, Name: localization.Current, Text: localization.Current });
                                pageForm.viewModel.set("ExpiryDate", null);
                                if (!_.isUndefined(expiryDateControl)) {
                                    expiryDateControl.value('');

                                    //disable date control
                                    expiryDateControl.enable(false);
                                    //remove required from it
                                    expiryDateControl.element.removeAttr("required");
                                    //update the label to not have (Required) on it.
                                    expiryDateLabel.text(localization.ExpiryDate);
                                }
                                break;
                            case licenseTypeTemp:
                                if (!_.isUndefined(expiryDateControl)) {
                                    expiryDateControl.enable(true);
                                    expiryDateControl.element.attr("required", "");
                                    expiryDateLabel.text(localization.ExpiryDate + " (" + localization.Required + ")");
                                }

                                if (pageForm.viewModel["ExpiryDate"] == null) {
                                    pageForm.viewModel.set("Status", { Id: mpeCurrent, Name: localization.Current, Text: localization.Current });
                                    return pageForm.SetSeatsRemaining(pageForm.viewModel);
                                }

                                var currentDate = new Date();
                                var expiryDate = kendo.parseDate(pageForm.viewModel["ExpiryDate"]);
                                var daysUntilExpire = app.lib.GetDaysLeft(currentDate, expiryDate);
                                var expiringStatusThreshold = pageForm.viewModel["LicenceStatusExpiringDays"] ? pageForm.viewModel["LicenceStatusExpiringDays"] : 7;

                                if (expiryDate < currentDate) {
                                    pageForm.viewModel.set("Status", { Id: mpeExpired, Name: localization.Expired, Text: localization.Expired });
                                } else if (expiryDate > currentDate && daysUntilExpire <= expiringStatusThreshold) {
                                    pageForm.viewModel.set("Status", { Id: mpeExpiring, Name: localization.Expiring, Text: localization.Expiring });
                                } else {
                                    pageForm.viewModel.set("Status", { Id: mpeCurrent, Name: localization.Current, Text: localization.Current });
                                }
                                break;
                            default:
                        } // end switch

                        return pageForm.SetSeatsRemaining(pageForm.viewModel);
                    }
                    pageForm.SetSeatsRemaining = function (inst) {
                        var mpeExceeded = "7e94a543-f20a-d39b-33b2-f1432a1e1aa3";
                        var allocatedSeats = inst["AllocatedSeats"] != null ? parseInt(inst["AllocatedSeats"]) : 0;
                        if (allocatedSeats > 0) {

                            var assignedComputers = 0;
                            var assignedUsers = 0;

                            if (inst["CountAssignedComputers"] != null && inst["CountAssignedComputers"] == true && inst["Target_LicenceHasAssignedComputers"] != null) {
                                assignedComputers = inst["Target_LicenceHasAssignedComputers"].length;
                            }

                            if (inst["CountAssignedUsers"] != null && inst["CountAssignedUsers"] == true && inst["Target_LicenceHasAssignedUsers"] != null) {
                                assignedUsers = inst["Target_LicenceHasAssignedUsers"].length;

                            }
                            var remainingSeats = allocatedSeats - (assignedUsers + assignedComputers);
                            
                            inst.set("SeatsRemaining", remainingSeats);

                            if (remainingSeats < 0) {
                                inst.set("Status", { Id: mpeExceeded, Name: localization.Exceeded, Text: localization.Exceeded });
                            }
                        }
                    }
                    disableFields("Name");
                    //we want this running on load to make sure things are required/disabled according to the license type
                    pageForm.UpdateLicense();
                    break;
                case "Invoice":
                    pageForm.common.TotalAmountOrCost("Source_PurchaseOrderHasInvoices", "POTotalCost", "Amount", localization.TotalAmountOfChildPO);
                    pageForm.common.TotalAmountOrCost("Source_PurchaseHasInvoice", "PurchaseTotalCost", "Cost", localization.TotalcostofallPurchases);
                    disableFields("Name");
                    break;
                case "Purchase":
                    PurchaseLineItem.Init(dataVM, mainContainer);
                    break;
                default:
                    disableFields("Name");
                    break;
            }

            //bind change event no that form is built
            dataVM.bind("change", function (e) {
                onVmChange(e, dataVM);
            });
        });

        if (!app.isMobileDevice()) {
            var $taskPanel = $('.task-panel').first();
            $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });
        }

        //manage dirty
        formHelper.manageDirty(dataVM);

        //let them in
        app.lib.mask.remove();
    }

    var disableFields = function (fieldName, type) {
        if (pageForm.isNew == false) {
            var element = $("input[name='" + fieldName + "']");
            if (_.isUndefined(type))
                element.prop("disabled", true).addClass("k-state-disabled");
            else if (type == "Numeric")
                element.data("kendoNumericTextBox").enable(false);
        }
    }

    // Template Decider
    // Chooses template from JSON by session and work item type
    var setTemplateJSONFromSessionAdJSON = function () {
        var type = pageForm.type;
        var defaultName = "Default";
        var json = pageForm.formTemplate;
        var msg = "A '" + defaultName + "' template is required.";
        var customMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found. No Default key is found on the custom template, default template will be used.";
        var defaultMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found.";
        if (json.customTemplate != null && json.customTemplate != '') {
            //This will check if the custom form have the Default key.
            json = pageForm.formTemplate.customTemplate;
            if (!json.Default) { //If Default is not found, it will going to alert for a message stating it will use the Default form/Template.
                if (type) {
                    msg += customMsg;
                }

                //From here, it will going to get the Default template/Form.
                json = pageForm.formTemplate.defaultTemplate;
                if (!json.Default) {
                    if (type) {
                        msg += defaultMsg;
                    }
                }
                
                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }
        else {

            //If the custom template/form is not found, it will used the default form/template.
            json = pageForm.formTemplate;
            if (!json.Default) {
                if (type) {
                    msg += defaultMsg;
                }
                
                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }
        // using a matcher in case something changes on either side
        // this will be easier and faster fix
        // { "formType from work item cshtml": "prop name from session.user that holds template" }
        var typeToSession = {
            "CatalogItem": "CatalogItemForm",
            "Consumable": "ConsumableForm",
            "CostCenter": "CostCenterForm",
            "HardwareAsset": "HardwareAssetForm",
            "Invoice": "InvoiceForm",
            "Lease": "LeaseForm",
            "License": "LicenseForm",
            "LineItem": "LineItemForm",
            "Location": "LocationForm",
            "NoticeEvent": "NoticeEventForm",
            "Organization": "OrganizationForm",
            "PurchaseOrder": "PurchaseOrderForm",
            "SoftwareAsset": "SoftwareAssetForm",
            "Standard": "StandardForm",
            "Subnet": "SubnetForm",
            "SupportContract": "SupportContractForm",
            "Vendor": "VendorForm",
            "Warranty": "WarrantyForm"
        }
        var getTemplateNameFromSession = function () {
            if (type && typeToSession[type] && session && session.user &&
                session.user[typeToSession[type]] && json[session.user[typeToSession[type]]]) {
                return session.user[typeToSession[type]];
            }
            return defaultName;
        }
        var templateName = getTemplateNameFromSession();
        pageForm.formTemplate = json[templateName];


    }

    // Form Buttons
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
            window.scrollTo(0, 0);
        }
        dataVM.saveFailure = saveFailure;
        // Save Button
        drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {
            save(function (data) {
                data = eval("(" + data + ")");
                var message = "";
                app.lib.message.add(getAssetDisplayString() + " " + localization.Saved + "&nbsp;&nbsp;<strong>" + getAssetDisplayName() + "</strong>", "success");

                //app.lib.message.add(getAssetDisplayString() + " " + localization.Saved + "&nbsp;&nbsp;<strong>" + dataVM.Name + "</strong>", "success");

                //forward the user along
                app.lib.gotoFormReturnUrl();
                return;

            }, saveFailure,false);
        });



        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {
            save(function (data) {
                data = eval("(" + data + ")");
                app.lib.message.add(localization.ChangesApplied, "success");
                //location = pageForm.returnEditUrl + getAssetId(data);
                
                if (app.lib.isNewForm()) {
                    location = pageForm.returnEditUrl + data.BaseId;
                }
                else {
                    location.reload();
                }

            }, saveFailure,false);
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
                        //make the form clean so we don't trigger onbeforeunload
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

        
        // mobile task Button
        formHelper.mobileDrawerTaskButton(taskContainer);
    }

    var getAssetDisplayName = function () {
        switch (pageForm.type) {
            case "NewNoticeEvent":
                return dataVM.Title;
            case "PurchaseOrder":
                return dataVM.PurchaseOrderNumber;
            default:
                return dataVM.Name;
        }
    }

    var getAssetDisplayString = function () {
        switch (pageForm.type) {
            case "NewNoticeEvent":
                return localization.NoticeEvent;
            case "CostCenter":
                return localization.CostCenter;
            case "CatalogItem":
                return localization.CatalogItem;
            case "License":
                return localization.License;
            case "Location":
                return localization.Location;
            case "Organization":
                return localization.Organization;
            case "Standard":
                return localization.Standard;
            case "Subnet":
                return localization.Subnet;
            case "Vendor":
                return localization.Vendor;
            case "ContractLease":
                return localization.ContractLease;
            case "SupportAndMaintenance":
                return localization.SupportandMaintenance;
            case "WarrantyContract":
                return localization.Warranty;
            case "HardwareAsset":
                return localization.HardwareAsset;
            case "SoftwareAsset":
                return localization.SoftwareAsset;
            case "Consumables":
                return localization.Consumable;
            default:
                return localization[pageForm.type];
        }
    }

    // Ajax Save Method (to be moved)
    var save = function (success, failure,isValidateFormOnly) {
        //ensure all values inputted have been bound to VM
        //not sure this is even needed and it causes many problems
        //need to delete after regression -JK
        //$(".page_content *").blur();
        
        var valid = true;
        formContainer.find(".form-group").removeClass("has-error");
        formContainer.find("[required]").each(function () {
            var jqEle = $(this);
           
            //This code is to check if enum is required or not for IE9.
            var property = !_.isUndefined(jqEle.attr("data-control-bind")) ? jqEle.attr("data-control-bind") : jqEle[0].name;
            if (_.isUndefined(property) || property != "") {
                if (!_.isUndefined(jqEle[0].kendoBindingTarget) && !_.isUndefined(jqEle[0].kendoBindingTarget.options)) {
                    property = jqEle[0].kendoBindingTarget.options.propertyName;
                }
            }
            
            if (!_.isUndefined(property)) {
                var isEnum = _.isObject(pageForm.viewModel[property]) && !_.isUndefined(pageForm.viewModel[property].Id);
                if ((_.isNull(pageForm.viewModel[property]) || (pageForm.viewModel[property] === "")) ||
                    (_.isObject(pageForm.viewModel[property]) && isEnum && (_.isNull(pageForm.viewModel[property].Id) || pageForm.viewModel[property].Id === "")) ||
                    (((_.isObject(pageForm.viewModel[property]) && !isEnum && (_.isUndefined(pageForm.viewModel[property].BaseId) || _.isNull(pageForm.viewModel[property].BaseId)))))) {
                    valid = false;
                    jqEle.parents(".form-group").addClass("has-error");
                }
            }
            //END This code is to check if enum is required or not for IE9.

            var nodeName = jqEle[0].nodeName.toLowerCase();
            if (nodeName != "input" && nodeName != "textarea") {
                jqEle = jqEle.find("input");
            }
         
            if (jqEle.val() == "") {
                valid = false;
                jqEle.parents(".form-group").addClass("has-error");
            } else {
                //for some reason the numeric control required does not work in mobile device so I use this as alternative solution.
                //it does not affect of other controls. Open for refractor if there is better solution for this.
                if (app.isMobile()) {
                    jqEle.parents(".form-group").removeClass("has-error");
                    jqEle.removeAttr('required');
                }
            }
            
        });

        
        if (!valid) {
            failure(localization.RequiredFieldsErrorMessage);
            return;
        }


        if (!valid) {
            failure(localization.PleaseCorrectErrors);
            return;
        }

        

        current = dataVM.toJSON();
        
        //other validations prior to saving
        switch (pageForm.type) {
            case "ContractLease":
                if (!current.IsMaster && !app.lib.CheckedStartAndEndDate("LeaseStartDate", "LeaseEndDate", localization.LeaseStartDateShouldNotGreaterEndDate))
                    return;
                break;
            case "SupportAndMaintenance":
                if (!app.lib.CheckedStartAndEndDate("ContractStartDate", "ContractEndDate", localization.SupportStartDateShouldNotGreaterEndDate))
                    return;
                break;
            case "WarrantyContract":
                if (!current.IsMaster && !app.lib.CheckedStartAndEndDate("WarrantyStartDate", "WarrantyEndDate", localization.WarrantyStartDateShouldNotGreaterEndDate))
                    return;
                break;
            case "Subnet":
                if (!Subnet.checkIP())
                    valid = false;
                if (!Subnet.checkSubnet())
                    valid = false;
                break;
            case "Organization":
                valid = checkParentChildRelatedItems(current, current.Target_OrganizationContainsOrganization, current.Source_OrganizationContainsOrganization);
                break;
            case "Location":
                valid = checkParentChildRelatedItems(current, current.Target_LocationContainsLocation, current.Source_LocationContainsLocation);
                break;
            case "NewNoticeEvent":
                valid = NoticeEvent.CheckRecipient();
                if (!valid) {
                    failure(localization.RequiredFieldsErrorMessage);
                }
                break;
            case "Consumables":
                //Re-assign actual enum value to Type prop because kendo.observable converts it to normal string type. This is only for the new logs
                //Conversion happens from \Areas\AssetManagement\Views\Consumables\NewAndEdit.cshtml
                var tempLogs = current.Target_ConsumableHasLogs;
                for (var index in tempLogs) {
                    if (_.isUndefined(tempLogs[index].BaseId)) {
                        tempLogs[index].Type = {
                            Id: "884650a1-632a-0532-b0d4-8c6b1d990752",
                            Name: localization.TaskRun
                        }
                    }
                }
                break;
            case "SoftwareAsset":
                SoftwareAsset.RemoveUserOrComputerLicensed(current);
                break;
        }
        

        if (!valid) {
            return;
        }

        app.lib.mask.apply();

        switch (pageForm.type) {
            case "ContractLease":
                if (current.IsMaster == null || current.IsMaster === false) {
                    current.Span = null;
                    current.Unit = { Id: null, Name: null, Text: null };
                } else {

                    current.LeaseStartDate = null;
                    current.LeaseEndDate = null;
                    current.DaysLeft = null;
                }
                break;
            case "WarrantyContract":
                if (current.IsMaster == null || current.IsMaster === false) {
                    current.Span = null;

                    current.Unit = { Id: null, Name: null, Text: null };
                } else {

                    current.WarrantyStartDate = null;
                    current.WarrantyEndDate = null;
                    current.DaysLeft = null;
                }
                break;

            case "HardwareAsset":
                //HardwareAsset.CheckBeforeSave(current);
                if (current.recieveCheckbox != null) {
                    HardwareAsset.SetReceiveDate(current, pageForm.percent);
                    if (current.recieveCheckbox == true) {
                        current.ReceivedDate = null;
                    }
                    delete current.recieveCheckbox;
                }

                if (current.useLease) {
                    delete current.Target_HardwareAssetHasWarranty;
                } else {
                    delete current.Target_HardwareAssetHasLease;
                }

                if (current.masterContractStartingDateCheckbox != null) {
                    HardwareAsset.SetReceiveDate(current, pageForm.percent);
                    if (current.masterContractStartingDateCheckbox == true) {
                        current.MasterContractStartingDate = null;
                    }
                    delete current.masterContractStartingDateCheckbox;
                }
                break;
            case "License":
                pageForm.SetSeatsRemaining(pageForm.viewModel);
                break;
            case "NewNoticeEvent":
                if (pageForm.isNew) {
                    current.Name = app.lib.newGUID();
                    current.DisplayName = current.Title;
                    current.Class = (!_.isUndefined(current.Class.Id)) ? current.Class.Id : "";
                    current.Template = (!_.isUndefined(current.Template.Id)) ? current.Template.Id : "";
                    current.HardwareAssetTemplate = (!_.isUndefined(current.HardwareAssetTemplate.Id)) ? current.HardwareAssetTemplate.Id : "";
                } else {

                    current.Class = (!_.isUndefined(current.Class.Id)) ? current.Class.Id : "";
                    current.Template = (!_.isUndefined(current.Template.Id)) ? current.Template.Id : "";
                    current.HardwareAssetTemplate = (!_.isUndefined(current.HardwareAssetTemplate.Id)) ? current.HardwareAssetTemplate.Id : "";

                    //re-map the original json to just the Id rather than Name/Id object
                    pageForm.jsonRaw.Class = (!_.isUndefined(pageForm.jsonRaw.Class.Id)) ? pageForm.jsonRaw.Class.Id : "";
                    pageForm.jsonRaw.Template = (!_.isUndefined(pageForm.jsonRaw.Template.Id)) ? pageForm.jsonRaw.Template.Id : "";
                    pageForm.jsonRaw.HardwareAssetTemplate = (!_.isUndefined(pageForm.jsonRaw.HardwareAssetTemplate.Id)) ? pageForm.jsonRaw.HardwareAssetTemplate.Id : "";
                }
                break;
            case "Consumables":
                if (pageForm.isNew) {
                    current.Id = app.lib.newGUID();
                }
                current.Template = (!_.isUndefined(current.Template.Id)) ? current.Template.Id : "";
                if (!_.isNull(pageForm.jsonRaw.Template)) {
                    pageForm.jsonRaw.Template = (!_.isUndefined(pageForm.jsonRaw.Template.Id)) ? pageForm.jsonRaw.Template.Id : "";
                }
                break;
            case "SoftwareAsset":
                if (pageForm.isNew) {
                    current.SoftwareAssetID = app.lib.newGUID();
                }
                break;


        }

        
        //Assign Name to Display Name   
        current.DisplayName = current.Name;

        if (pageForm.isNew==false) {
            //This will optimized the passing of mulitple object to only send the deleted or/and added items
            app.lib.optimizeFormMultiObject.BeforeSave(current, pageForm.jsonRaw);
        }

        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: current,
            original: pageForm.jsonRaw,
            checkProperty: pageForm.isNew
        }));

        

        if (isValidateFormOnly) {
            success(true, postData);
            return;
        }

        
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: saveUrl,
                data: "formJson=" + postData,
                success: function (data, status, xhr) {
                    if (data.success == false) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.ErrorDescription,
                            message: data.message,
                            icon: "fa fa-exclamation"
                        });
                    } else {
                        $.post("/platform/api/CacheSync", {}, function (cacheData) {
                            //platform cache synching
                        }).always(function () {
                            data = JSON.stringify(data);

                            //make the form clean so we don't trigger onbeforeunload
                            dataVM.set("isDirty", false);

                            if (data.search('loginForm') < 0) { // Logged out check                   
                                success(data);
                            } else {
                                //session expired
                                window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                            }
                        });
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    failure();
                    console && app.lib.log(localization.RequestFailed);
                    app.lib.log(thrownError);

                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);





                    var jsonRsp = xhr.responseText;
                    var errorMsg = "";
                    try {
                        var msgResponse = JSON.parse(jsonRsp);
                        //determine error Message
                        var errorMsg = localization.RequestFailed;
                        if (msgResponse.exception && msgResponse.exception.length > 0) {
                            errorMsg = msgResponse.exception;
                        }
                    }
                    catch (ex) {
                        errorMsg = xhr.responseText;
                    }


                    

                    kendo.ui.ExtAlertDialog.show({
                        title: localization.ErrorDescription,
                        message: errorMsg,
                        icon: "fa fa-exclamation"
                    });
                },
                processData: false,
                async: true
            });
        
    }
    dataVM.save = save;
    var checkParentChildRelatedItems = function (currentItem, parent, childArr) {
        var isOrgOk = true;
        var msg = "";

        for (var item in childArr) {
            if (childArr[item] != null && childArr[item].BaseId != null) {
                if (childArr[item].BaseId == parent.BaseId) {
                    msg = localization.ChildOrganizationsErrorMessage.replace("{0}", childArr[item].DisplayName);
                    break;
                } else if (childArr[item].BaseId == currentItem.BaseId) {
                    msg = localization.ChildOrganizationsSelfErrorMessage.replace("{0}", childArr[item].DisplayName);
                    break;
                }
            }
        }

        if (msg != "") {
            isOrgOk = false;
            kendo.ui.ExtAlertDialog.show({
                title: localization.ErrorDescription,
                message: msg,
                icon: "fa fa-exclamation"
            });
        }
        return isOrgOk;
    }


    //set a global vm change function
    var onVmChange = function (e, vm) {

        //This will optimized the passing of mulitple object to only send the deleted or/and added items
        app.lib.optimizeFormMultiObject.OnVmChange(e);
        
        switch (pageForm.type) {
            case "License":
                if (e.field === 'Type' || e.field == "ExpiryDate" || e.field == "AllocatedSeats"
                    || e.field == "CountAssignedComputers" || e.field == "Target_LicenceHasAssignedComputers"
                    || e.field == "CountAssignedUsers" || e.field == "Target_LicenceHasAssignedUsers") {
                    pageForm.UpdateLicense();
                }
                break;
            case "NewNoticeEvent":
                switch (e.field) {
                    case "UseContractDate":
                        NoticeEvent.ToggleDueDate();
                        break;
                    case "SendToOwner":
                    case "SendToCustodian":
                    case "Target_NoticeEventRelatesToRecipient":
                        NoticeEvent.CheckRecipient();
                        break;
                }
                break;
            case "SoftwareAsset":
                SoftwareAsset.OnChange(e, vm, mainContainer);
                break;
            case "HardwareAsset":
                HardwareAsset.OnChange(e, vm);
                break;
            case "ContractLease":
            case "WarrantyContract":
            case "SupportAndMaintenance":
                CommonContract.OnChange(e, vm);
                break;

            case "Invoice":
                if (e.field === 'Source_PurchaseOrderHasInvoices') {
                    pageForm.common.TotalAmountOrCost("Source_PurchaseOrderHasInvoices", "POTotalCost", "Amount", localization.TotalAmountOfChildPO);
                } else if (e.field === 'Source_PurchaseHasInvoice') {
                    pageForm.common.TotalAmountOrCost("Source_PurchaseHasInvoice", "PurchaseTotalCost", "Cost", localization.TotalcostofallPurchases);
                }
                break;
            case "PurchaseOrder":
                purchaseOrder.OnChange(e);
                break;
            case "Consumables":
                Consumable.OnChange(e, vm, mainContainer);
                break;
            case "Purchase":
                PurchaseLineItem.OnChange(e, vm);
                break;
        }
    }

    
    //make the things global - grrrr
    pageForm.onVmChange = onVmChange;

    pageForm.common = new function () {
        //This will going to count all cost for each specific currency
        this.TotalAmountOrCost = function (propertyField, toDisplayProp, amountProp, textToDisplay) {
            var currency = {};
            var toDisplay = "";
            var currencyName = "";
            _.each(dataVM[propertyField], function (item) {
                if (_.isUndefined(item.Currency) || item.Currency.Name=="") {
                    currencyName = "NA";
                } else {
                    currencyName = item.Currency.Name;
                }

                if (_.isUndefined(currency[currencyName]))
                    currency[currencyName] = 0;

                if (!_.isUndefined(item[amountProp]) && !_.isNull(item[amountProp])) {
                    currency[currencyName] = parseFloat(currency[currencyName]) + parseFloat(item[amountProp]);
                }
            });

            //build the display of the total cost or amount for the specific currency
            for (var item in currency) {
                var cost = kendo.toString(currency[item], "n");
                toDisplay += toDisplay == "" ? item + " " + cost : ", " + item + " " + cost
            }
            if (toDisplay == "") {
                dataVM.set(toDisplayProp, "");
            } else {
                dataVM.set(toDisplayProp, textToDisplay + " " + toDisplay);
            }
        }
    }

    init();


});