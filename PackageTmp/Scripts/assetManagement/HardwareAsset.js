var HardwareAsset = new function () {
    var useLease = null;
    var warranty;
    var warrantySpan;
    var warrantyOpenModal;
    var warrantysearchIcon;
    var lease;
    var leaseSpan;
    var leaseOpenModal;
    var searchIconlease;
    var dataVM;
    var serialNumberTxt;
    var assetTagTxt;
    var lastInventoryDate;
    var isSerialAndAssetTagRequired = false;
    var mobileChildItems = null;
    var _container;
    this.Init = function (vm, container) {
        dataVM = vm;
        _container = container;
        warranty = container.find("input[name='Target_HardwareAssetHasWarranty']");
        warrantySpan = warranty.closest("span");
        warrantyOpenModal = warranty.parent().find(".open-modal")
        warrantysearchIcon = warranty.parent().find(".searchIcon").hide();
        lease = container.find("input[name='Target_HardwareAssetHasLease']");
        leaseSpan = lease.closest("span");
        leaseOpenModal = lease.parent().find(".open-modal");
        searchIconlease = lease.parent().find(".searchIcon");

        serialNumberTxt = container.find("input[name='SerialNumber']");
        assetTagTxt = container.find("input[name='AssetTag']");
        this.useLease = container.find("input[name='useLease']");


        var haswarrantyOrLease = false;
        if (app.lib.getSafeProperty(function () { return dataVM.Target_HardwareAssetHasWarranty.BaseId; }) && !_.isNull(dataVM.Target_HardwareAssetHasWarranty.BaseId)) {
            showWarranty(dataVM);
            haswarrantyOrLease = true;
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasWarranty", dataVM, true);
        } else if (app.lib.getSafeProperty(function () { return dataVM.Target_HardwareAssetHasLease.BaseId; }) && !_.isNull(dataVM.Target_HardwareAssetHasLease.BaseId)) {
            showLease(dataVM);
            haswarrantyOrLease = true;
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasLease", dataVM, true);
        } else {
            showWarranty(dataVM);
        }

        if (!haswarrantyOrLease) {
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasWarranty", dataVM, true);
        }
        HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasSupportContract", dataVM, true);



        if (serialNumberTxt.attr("required") || assetTagTxt.attr("required")) {
            isSerialAndAssetTagRequired = true;
        }

        HardwareAsset.toggleSerialAndAssetRequired(dataVM);


        pageForm.common.TotalAmountOrCost("Target_HardwareAssetHasPurchase", "HWTotalCost", "Cost", localization.TotalcostofallLineItems);
        lastInventoryDate = container.find("input[name='Target_HardwareAssetHasAssociatedCI.LastInventoryDate']").data("kendoDatePicker");

        if (dataVM.IsMobileAsset) {
            container.find("[data-cid='Mobile']").show();
        }
        else {
            container.find("[data-cid='Mobile']").hide();
        }



    };

    this.toggleSerialAndAssetRequired = function (dataVM) {

        if (isSerialAndAssetTagRequired) {
            var sNumber = dataVM.get("SerialNumber");
            var aTag = dataVM.get("AssetTag");
            if (_.isNull(sNumber)) {
                sNumber = "";
            }

            if (_.isNull(aTag)) {
                aTag = "";
            }

            if (sNumber != "" || aTag != "") {
                app.lib.ToggleTextboxRequired(serialNumberTxt, false);
                app.lib.ToggleTextboxRequired(assetTagTxt, false);
            } else {
                app.lib.ToggleTextboxRequired(serialNumberTxt, true);
                app.lib.ToggleTextboxRequired(assetTagTxt, true);
            }
        }
    };

    var showWarranty = function (dataVM) {
        warrantySpan.removeClass("k-state-disabled");
        leaseSpan.addClass("k-state-disabled");
        lease.attr("disabled", "");
        warranty.removeAttr("disabled");
        searchIconlease.hide();
        warrantysearchIcon.show();
        lease.val("").blur().css("background","none");
        leaseOpenModal.hide();
        dataVM.set("useLease", false);
    };

    var showLease = function (dataVM) {
        warrantySpan.addClass("k-state-disabled");
        leaseSpan.removeClass("k-state-disabled");
        lease.removeAttr("disabled");
        warranty.attr("disabled", "");
        searchIconlease.show();
        warrantysearchIcon.hide();
        warranty.val("").blur().css("background", "none");
        warrantyOpenModal.hide();
        dataVM.set("useLease", true);
    };

    this.CheckBeforeSave = function (current) {
        if ((_.isNull(current.useLease) || current.useLease == false) && !_.isNull(current.Target_HardwareAssetHasLease)) {
            delete current.Target_HardwareAssetHasLease.BaseId;
        } else {
            if (!_.isNull(current.Target_HardwareAssetHasWarranty)) {
                delete current.Target_HardwareAssetHasWarranty.BaseId;
            }
        }
    };

    this.SetReceiveDate = function (viewModel, warningPercent) {

        var mpeExpired = "ce127307-2bc9-b244-bcf5-fb9d81fc2806";
        var mpeNone = "6a397180-2a99-7d58-813f-3b5ea370746b";
        var mpeOK = "56f4716e-aafd-db61-b18a-3aa513af4600";
        var mpeWarning = "b9500a07-cf76-c963-04ec-e6b0544eb2c6";
        var mpeMaster = "8c22fc90-ce1c-3c59-7cd5-b6e2b9aec873";

        var currentDate = new Date();
        var contract = null;
        if (!_.isNull(viewModel.Target_HardwareAssetHasLease))
            contract = viewModel.Target_HardwareAssetHasLease;
        else if (!_.isNull(viewModel.Target_HardwareAssetHasWarranty))
            contract = viewModel.Target_HardwareAssetHasWarranty;

        //Do we have a contract?
        if (contract == null) {
            //No contract
            viewModel["MasterContractStatus"] = { "Id": mpeNone, "Name": null };
            viewModel["MasterContractEndDate"] = null;
            viewModel["MasterContractStartingDate"] = null;
            return;
        }
        else if (contract["IsMaster"] == null || !contract["IsMaster"]) {
            //Not master
            viewModel["MasterContractStatus"] = contract["ContractStatus"];

            if (!_.isNull(viewModel.Target_HardwareAssetHasWarranty)) {
                viewModel["MasterContractEndDate"] = contract["WarrantyEndDate"];
                viewModel["MasterContractStartingDate"] = contract["WarrantyStartDate"];
            }
            else {
                viewModel["MasterContractEndDate"] = contract["LeaseEndDate"];
                viewModel["MasterContractStartingDate"] = contract["LeaseStartDate"];
            }
            return;
        }

        //Only master contracts after this point

        if (_.isNull(viewModel["ReceivedDate"]) && _.isNull(viewModel["MasterContractRenewedOn"])) {
            //Master no received date
            //Set MasterContractStatus = none and exit
            viewModel["MasterContractStatus"] = { "Id": mpeNone, "Name": null };
            viewModel["MasterContractEndDate"] = null;
            viewModel["MasterContractStartingDate"] = null;
            return;
        }

        var dt = currentDate;
        if (!_.isNull(viewModel["MasterContractRenewedOn"])) dt = new Date(viewModel["MasterContractRenewedOn"]);
        else dt = new Date(viewModel["ReceivedDate"]);
        viewModel["MasterContractStartingDate"] = dt;

        //Days (CiresonAssetManagement) (Cireson.AssetManagement.UnitEnum.Days) (292e62f7-67b5-11b7-092c-4916aa8154cb)               
        //Months (CiresonAssetManagement) (Cireson.AssetManagement.UnitEnum.Months) (8a174f40-2686-eb9d-a784-950deaea279c)
        //Years (CiresonAssetManagement) (Cireson.AssetManagement.UnitEnum.Years) (300cd927-e6f8-5ea2-2d9e-7e75d2ae1e95)                           

        if (!_.isNull(contract["Unit"])) {
            var unit = contract["Unit"];
            var iSpan = contract["Span"];
            if (!_.isNull(iSpan)) {
                if (unit["Id"] == "292e62f7-67b5-11b7-092c-4916aa8154cb") {
                    viewModel["MasterContractEndDate"] = dt.getDate() + iSpan;
                }
                else if (unit["Id"] == "8a174f40-2686-eb9d-a784-950deaea279c") {
                    viewModel["MasterContractEndDate"] = dt.getMonth() + iSpan;
                }
                else if (unit["Id"] == "300cd927-e6f8-5ea2-2d9e-7e75d2ae1e95") {
                    viewModel["MasterContractEndDate"] = dt.getFullYear() + iSpan;
                }
            }
        }

        //Now work out the MasterContractStatus

        if (warningPercent > 0) {
            //Status
            var dtStart = currentDate;
            var dtEnd = new Date(viewModel["MasterContractEndDate"]);
            if (!_.isNull(viewModel["MasterContractRenewedOn"])) {
                dt = new Date(viewModel["MasterContractRenewedOn"]);
            } else {
                dt = new Date(viewModel["ReceivedDate"]);
            }

            var totalContractDays = app.lib.GetDaysLeft(dtStart, dtEnd);
            var daysLeft = app.lib.GetDaysLeft(currentDate, dtEnd);
            var threshold = parseInt((totalContractDays / 100) * warningPercent, 10);

            if (currentDate > dtEnd) {
                viewModel["MasterContractStatus"] = { "Id": mpeExpired, "Name": null };
            }
            else if (threshold >= daysLeft || daysLeft <= 5) {
                viewModel["MasterContractStatus"] = { "Id": mpeWarning, "Name": null };
            } else {
                viewModel["MasterContractStatus"] = { "Id": mpeOK, "Name": null };
            }
        }
    };
    this.ToggleLeaseAndWarranty = function (event, vm) {
        switch (event.field) {
            case "Target_HardwareAssetHasWarranty.BaseId":
                vm.set("useLease", false);
                break;
            case "Target_HardwareAssetHasLease.BaseId":
                vm.set("useLease", true);
                break;
            case "useLease":
                if (vm.get("useLease")) {
                    showLease(vm);
                } else {
                    showWarranty(vm);
                }
                break;
        }
    };

    this.DisplayContractStatus = function (field, vm, isInit) {
        var prop;
        var propDisplayStat = "LeaseOrWarrantyStatus";
        var invalidContractStr = localization.HWLeaseOrWarrantyStr;

        switch (field) {
            case "Target_HardwareAssetHasWarranty":
                prop = "WarrantyEndDate";
                break;
            case "Target_HardwareAssetHasLease":
                prop = "LeaseEndDate";
                break;
            case "Target_HardwareAssetHasSupportContract":
                prop = "ContractEndDate";
                invalidContractStr = localization.HWSupportAndMaintenanceStr;
                propDisplayStat = "SupportandMaintenanceContractStatus";
                break;
        }

        if (app.lib.getSafeProperty(function () { return vm[field].BaseId; }) && !_.isNull(vm[field].BaseId)) {
            if (isInit) {
                displayStatus(vm[field], field);
            } else {
                $.get("/Search/GetObjectById", { id: vm[field].BaseId }, function (data) {
                    displayStatus(data, field);
                });
            }
        } else {
            vm.set(propDisplayStat, invalidContractStr);
        }

        function displayStatus(data, field) {
            if (_.isNull(data.ContractStatus) || _.isUndefined(data.ContractStatus)) {
                vm.set(propDisplayStat, invalidContractStr);
                return;
            }

            if (field === "Target_HardwareAssetHasWarranty") {
                vm.set("MasterContractEndDate", data.WarrantyEndDate);
                vm.set("MasterContractStartingDate", data.WarrantyStartDate);
                vm.set("MasterContractStatus", data.ContractStatus);
            } else if (field === "Target_HardwareAssetHasLease") {
                vm.set("MasterContractEndDate", data.LeaseEndDate);
                vm.set("MasterContractStartingDate", data.LeaseStartDate);
                vm.set("MasterContractStatus", data.ContractStatus);
            }

            if (data.ContractStatus.Id == "ce127307-2bc9-b244-bcf5-fb9d81fc2806") {
                vm.set(propDisplayStat, localization.HWSelectContractExpired);
            } else {
                if ((!_.isUndefined(data["IsMaster"]) && !_.isNull(data["IsMaster"]) && data["IsMaster"])
                    && (_.isNull(data[prop]) || _.isUndefined(data[prop]))) {
                    if (!_.isNull(vm.get("MasterContractRenewedOn")) && !_.isEmpty(vm.get("MasterContractRenewedOn"))) {
                        getMasterStartAndEndDate(vm.get("MasterContractRenewedOn"), data);
                    }else if (!_.isNull(vm.get("ReceivedDate")) && !_.isEmpty(vm.get("ReceivedDate"))) {
                        getMasterStartAndEndDate(vm.get("ReceivedDate"), data);
                    }else {
                        vm.set(propDisplayStat, localization.HardwareAssetLeaseOrWarrantyMaster);
                    }
                } else {
                    vm.set(propDisplayStat, localization.HWSelectedContractValidDays + data.DaysLeft);
                }
            }
        }

        function getMasterStartAndEndDate(date, warrantyOrLeaseVM) {
            var days = "292E62F7-67B5-11B7-092C-4916AA8154CB";
            var months = "8A174F40-2686-EB9D-A784-950DEAEA279C";
            var years = "300CD927-E6F8-5EA2-2D9E-7E75D2AE1E95";
            var startDate = kendo.parseDate(date);
            var span = warrantyOrLeaseVM["Span"];
            if (warrantyOrLeaseVM.Unit.Id.toUpperCase() == days) {
                startDate.setDate(startDate.getDate() + parseInt(span));
            } else if (warrantyOrLeaseVM.Unit.Id.toUpperCase() == months) {
                startDate.setMonth(startDate.getMonth() + parseInt(span));
            } else if (warrantyOrLeaseVM.Unit.Id.toUpperCase() == years) {
                startDate.setFullYear(startDate.getFullYear() + parseInt(span));
            }

            vm.set("MasterContractEndDate", startDate.toISOString());
            vm.set("MasterContractStartingDate", date);
            vm.set(propDisplayStat, localization.HWSelectedContractValidDays + (app.lib.GetDaysLeft(kendo.parseDate(kendo.toString(new Date(), "d")), startDate)));
        }
    }

    this.assignLastInventoryDate = function (vm) {
        $.get("/Search/GetObjectById", { id: vm.get("Target_HardwareAssetHasAssociatedCI").BaseId }, function (data) {
            lastInventoryDate.value(kendo.parseDate(data.LastInventoryDate));
        });
    }

    this.checkIfMobileAsset = function () {
        if (!_.isNull(mobileChildItems)) {
            var res = _.find(mobileChildItems,
                        function (val) {
                            return val.Id == dataVM.HardwareAssetType.Id;
                        });
            if (!_.isUndefined(res) || dataVM.HardwareAssetType.Id == "0649c2fc-f1f9-f200-8628-dfdd473cd710") {
                _container.find("[data-cid='Mobile']").show();
                dataVM.set("IsMobileAsset", true);
            }
            else {
                _container.find("[data-cid='Mobile']").hide();
                dataVM.set("IsMobileAsset", false);
            }
        }

    }


    this.OnChange = function (event, vm) {
        HardwareAsset.ToggleLeaseAndWarranty(event, vm);
        if (event.field === 'Target_HardwareAssetHasWarranty.BaseId') {
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasWarranty", vm, false);
        } else if (event.field === 'Target_HardwareAssetHasLease.BaseId') {
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasLease", vm, false);
        }
        else if (event.field === 'Target_HardwareAssetHasSupportContract.BaseId') {
            HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasSupportContract", vm, false);
        }
        else if (event.field === 'Target_HardwareAssetHasPurchase') {
            pageForm.common.TotalAmountOrCost("Target_HardwareAssetHasPurchase", "HWTotalCost", "Cost", localization.TotalcostofallLineItems);
        } else if (event.field === 'AssetTag' || event.field === 'SerialNumber') {
            HardwareAsset.toggleSerialAndAssetRequired(vm);
        } else if (event.field === 'MasterContractRenewedOn' || event.field === 'ReceivedDate') {
            if (!_.isNull(vm.Target_HardwareAssetHasWarranty.BaseId)) {
                HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasWarranty", vm, false);
            } else if (!_.isNull(vm.Target_HardwareAssetHasLease.BaseId)) {
                HardwareAsset.DisplayContractStatus("Target_HardwareAssetHasLease", vm, false);
            }
        }
        else if (event.field === 'Target_HardwareAssetHasAssociatedCI.BaseId') {
            this.assignLastInventoryDate(vm);
        }
        else if (event.field === 'HardwareAssetType') {

            if (_.isNull(mobileChildItems)) {
                $.getJSON("/api/V3/Enum/GetFlatList?id=0649c2fc-f1f9-f200-8628-dfdd473cd710&itemFilter=&includeParents=true", null,
                    function (data, status, jq) {
                        mobileChildItems = data;
                        HardwareAsset.checkIfMobileAsset();
                    });
            }
            else {
                HardwareAsset.checkIfMobileAsset();
            }
        }
    };
}