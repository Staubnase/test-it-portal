/**
update Asset Management
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");

    var definition = {
        build: function (vm, node, callback) {

            var onloadTaskTrigger = function () {
                switch (node.Configs.type) {
                    case "WarrantyContract":
                    case "SupportAndMaintenance":
                    case "ContractLease":
                        CommonContract.UpdateStatus(vm.viewModel,true);
                        break;
                }
            }

            onloadTaskTrigger();
            var viewModel = kendo.observable({
                changeStatus: function () {
                    switch (node.Configs.type) {
                        case "License":
                            pageForm.SetSeatsRemaining(pageForm.viewModel);
                            break;
                        case "SoftwareAsset":
                            UpdateSoftwareAsset(vm.viewModel);
                            break;
                        case "Consumables":
                            UpdateConsumable(vm.viewModel);
                            break;
                        default:
                            CommonContract.SupersedesParent(vm.viewModel);
                            break;
                    }
                }
            });
            
            


            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "changeStatus",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

            var UpdateConsumable = function (vmModel) {
                if (vmModel.CountAssignedConsumableUsers || vmModel.CountAssignedConsumableAssets) {
                    var assignedCount = 0;
                    if (!_.isNull(vmModel.Target_ConsumableHasAssignedUsers) && vmModel.CountAssignedConsumableUsers) {
                        assignedCount += vmModel.Target_ConsumableHasAssignedUsers.length;
                    }
                    if (!_.isNull(vmModel.Target_ConsumableHasAssignedAssets) && vmModel.CountAssignedConsumableAssets) {
                        assignedCount += vmModel.Target_ConsumableHasAssignedAssets.length;
                    }
                    vmModel.set("AssignedCount", assignedCount);
                }
            }

            var UpdateSoftwareAsset = function (vmModel) {

                $.when(kendo.ui.ExtYesNoDialog.show({
                    title: localization.CiresonAssetManagement,
                    message: localization.SoftwareAssetUpdateConfirmationMsg
                })).done(function (response) {
                    if (response.button === "yes") {
                        vmModel.save(function (isOk, postData) {
                            if (isOk == true) {
                                $.ajax({
                                    type: 'POST',
                                    dataType: 'json',
                                    url: "/AssetManagement/SoftwareAsset/UpdateSoftwareAsset/",
                                    data: "formJson=" + postData + "&id=" + vmModel.BaseId,
                                    success: function (data, status, xhr) {
                                        if (data.Success == true) {
                                            $.when(kendo.ui.ExtAlertDialog.show({
                                                title: localization.CiresonAssetManagement,
                                                message: localization.SoftwareAssetUpdated
                                            })).done(function (response) {
                                                vmModel.set("isDirty", false);
                                                app.lib.message.add(localization.ChangesApplied, "success");
                                                window.location.reload();
                                            });;
                                        } else {
                                            kendo.ui.ExtAlertDialog.show({
                                                title: localization.CiresonAssetManagement,
                                                message: localization.ErrorOccured
                                            });
                                        }
                                    },
                                    error: function (xhr, ajaxOptions, thrownError) {
                                        failure();
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
                                    },
                                    processData: false,
                                    async: false
                                });

                            
                            }

                        }, vmModel.saveFailure, true);
                    }
                });
            }

            
        }



    }

    

    return definition;

});

