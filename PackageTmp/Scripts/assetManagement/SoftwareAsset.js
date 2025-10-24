var SoftwareAsset = {
    Init: function (vm,mainContainer) {
        
        var SoftwarePatternTxt = mainContainer.find("input[name='SoftwarePattern']");
        var ExclusionPatternTxt = mainContainer.find("input[name='ExclusionPattern']");
        var VersionPatternTxt = mainContainer.find("input[name='VersionPattern']");
 

        if (vm.IsBundle) {
            this.enableDisableTextbox(SoftwarePatternTxt, false);
            this.enableDisableTextbox(ExclusionPatternTxt, false);
            this.enableDisableTextbox(VersionPatternTxt, false);
        } else {
            this.enableDisableTextbox(SoftwarePatternTxt, true);
            this.enableDisableTextbox(ExclusionPatternTxt, true);
            this.enableDisableTextbox(VersionPatternTxt, true);
        }

        //EnableCPUMode
        var cbCPUMode = mainContainer.find('div[data-role="CPUMode"]').data().handler._dropdown;
        var enableCPUMode = mainContainer.find("#EnableCPUMode");
        var isNamed = mainContainer.find("#IsNamed");
        var isOS = mainContainer.find("#IsOS");
        var countAllMatches = mainContainer.find("#CountAllMatches");
        var isUnlimited = mainContainer.find("#IsUnlimited");
        var countLicenceSeats = mainContainer.find("#CountLicenceSeats");
        var purchaseCount = mainContainer.find("input[name='PurchaseCount']").data("kendoNumericTextBox");
        var assignedComp = mainContainer.find("#Target_SoftwareAssetHasAssignedComputers").parents(".panel:first");
        var assignedUsers = mainContainer.find("#Target_SoftwareAssetHasAssignedUsers").parents(".panel:first");
        

        if (vm.IsUnlimited) {
            countLicenceSeats.attr("disabled", true);
            purchaseCount.enable(false);
        }

        if (vm.CountLicenceSeats) {
            isUnlimited.attr("disabled", true);
            purchaseCount.enable(false);
        }
        
        isUnlimited.change(function () {
            if (this.checked) {
                countLicenceSeats.attr("disabled", true);
                vm.set("PurchaseCount", "0");
                purchaseCount.enable(false);
            } else {
                countLicenceSeats.removeAttr("disabled");
                purchaseCount.enable(true);
            }
        });

        SoftwareAsset.UpdatePurchaseCount(vm);
        countLicenceSeats.change(function () {
            if (this.checked) {
                isUnlimited.attr("disabled", true);
                purchaseCount.enable(false);
                SoftwareAsset.UpdatePurchaseCount(vm);
            } else {
                isUnlimited.removeAttr("disabled");
                purchaseCount.enable(true);
            }
        });

        isOS.change(function () {
            if (this.checked) {
                kendo.ui.ExtAlertDialog.show({
                    title: localization.CiresonAssetManagement,
                    message: localization.IsOSAlertMsg
                });
            }
        });

        if (vm.IsNamed) {
            isOS.attr("disabled", true);
            countAllMatches.attr("disabled", true);
        } else {
            assignedComp.hide();
            assignedUsers.hide();
        }
        
        isNamed.change(function () {
            if (this.checked) {
                isOS.attr("disabled", true);
                countAllMatches.attr("disabled", true);
                vm.set("IsOS", false);
                assignedComp.show();
                assignedUsers.show();
            } else {
                isOS.removeAttr("disabled");
                countAllMatches.removeAttr("disabled");
                assignedComp.hide();
                assignedUsers.hide();
            }
        });
        
        if (vm.CPUMode.Id == null) {
            enableCPUMode[0].checked = false;
            cbCPUMode.enable(false);
            cbCPUMode.element.siblings().find(".dropdowntree-button").hide();
            cbCPUMode.element
                    .closest(".form-control-picker")
                    .removeAttr("required")
                    .closest(".has-error")
                    .removeClass("has-error");
        } else {
            enableCPUMode[0].checked = true;
        }

        enableCPUMode.change(function () {
            if (this.checked) {
                cbCPUMode.enable(true);
                cbCPUMode.element.siblings().find(".dropdowntree-button").show();
                cbCPUMode.element.closest(".form-control-picker").attr("required", "");
            } else {
                vm.set("CPUMode", { Id: null, Text: null });

                cbCPUMode.enable(false);
                cbCPUMode.element.siblings().find(".dropdowntree-button").hide();
                cbCPUMode.element
                        .closest(".form-control-picker")
                        .removeAttr("required")
                        .closest(".has-error")
                        .removeClass("has-error");
            }
        });


        //load data for UnAuthorized Computer
        _.each(vm.Target_SoftwareAssetHasAssignedComputers, function (compAssigned) {
            var isOk = true;
            _.each(vm.Target_SoftwareAssetHasAuthorisedComputer, function (compAuth) {
                if (compAuth.BaseId == compAssigned.BaseId) {
                    isOk = false
                    return;
                }
            });

            if (isOk)
                vm.UnAuthorizedComputer.unshift(compAssigned);

        });

        pageForm.common.TotalAmountOrCost("Target_SoftwareAssetHasPurchase", "SATotalCost", "Cost", localization.TotalcostofallLineItems);
    },

    enableDisableTextbox : function (txt, isEnable) {
        if (isEnable) {
            txt.prop("disabled", false).removeClass("k-state-disabled");
        }
        else
            txt.prop("disabled", true).addClass("k-state-disabled");
    },

    UpdatePurchaseCount : function(vm){
        if (vm.CountLicenceSeats) {
            var purchaseCount = 0;
            var isToCount = true;
            for (var index in vm.Target_SoftwareAssetHasLicence) {
                var license = vm.Target_SoftwareAssetHasLicence[index];
                var seats = parseInt(license.AllocatedSeats);
                isToCount = true;
                if (!_.isUndefined(license.LicenceModel) && !_.isNull(license.LicenceModel.Id)) {
                    if (license.LicenceModel.Id.toUpperCase() == "78A24CB0-C9EF-CDFC-2986-32E7099BC556" //Cireson.AssetManagement.LicenceModelEnum.Upgrade
                        || license.LicenceModel.Id.toUpperCase() == "8A4187DF-438F-6599-FF39-5C086FC5F036") //Cireson.AssetManagement.LicenceModelEnum.Downgrade
                    {
                        isToCount = false;
                    }
                } else if (_.isNaN(seats) || (!_.isNull(license.Status.Id) && license.Status.Id.toUpperCase() == "4D5F06E7-04BA-E854-C576-9E645057FC9C")) //Cireson.AssetManagement.LicenceStatusEnum.Expired
                {
                    isToCount = false;
                }

                if (isToCount) {
                    purchaseCount = purchaseCount + seats;
                }
            }
            vm.set("PurchaseCount", purchaseCount);
        }
    },

    RemoveUserOrComputerLicensed : function (vm) {
        if (vm.ScopeComputers==false) {
            vm.Target_SoftwareAssetHasLicensedComputers = [];
        }
        if (vm.ScopeUsers == false) {
            vm.Target_SoftwareAssetHasLicensedUsers = [];
        }
    },

    OnChange: function (event, vm, mainContainer) {
        if (event.field === 'Target_SoftwareAssetHasAssignedComputers') {
            var isOk = true;
            if (event.action == "add") {
                _.each(vm.Target_SoftwareAssetHasAuthorisedComputer, function (data) {
                    if (data.BaseId == event.items[0].BaseId) {
                        isOk = false
                    }
                });

                if (isOk)
                    vm.UnAuthorizedComputer.unshift(event.items[0]);
            } else if (event.action == "remove") {
                vm.UnAuthorizedComputer.shift(event.items[0]);
            }
        } else if (event.field === 'Target_SoftwareAssetHasAuthorisedComputer') {
            if (event.action == "add") {
                if (vm.UnAuthorizedComputer.length > 0) {
                    _.each(vm.UnAuthorizedComputer, function (data) {
                        if (data.BaseId == event.items[0].BaseId) {
                            vm.UnAuthorizedComputer.shift(event.items[0]);
                        }
                    });
                }
            } else if (event.action == "remove") {
                _.each(vm.Target_SoftwareAssetHasAssignedComputers, function (data) {
                    if (data.BaseId == event.items[0].BaseId) {
                        vm.UnAuthorizedComputer.unshift(event.items[0]);
                    }
                });
            }
        } else if (event.field === 'Target_SoftwareAssetHasLicence') {
            SoftwareAsset.UpdatePurchaseCount(vm);
        } else if (event.field === 'Target_SoftwareAssetHasPurchase') {
            pageForm.common.TotalAmountOrCost("Target_SoftwareAssetHasPurchase", "SATotalCost", "Cost", localization.TotalcostofallLineItems);
        }
    }
}