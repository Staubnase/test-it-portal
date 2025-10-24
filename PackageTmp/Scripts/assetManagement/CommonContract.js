var CommonContract = new function () {
    var supersededTarget;
    var isFormUpdate=false;
    var totalSupersedes = 0;
    var mpeSuperseded = "d39fba52-caf7-868a-ebcb-2a667a8c1ba9";
    this.SupersedesParent = function (vmModel) {
        var supersedes = vmModel[supersededTarget];
        isFormUpdate = true;
        totalSupersedes = 0;
        _.each(supersedes, function (data) {
            data.set("ContractStatus", { Id: mpeSuperseded, Name: localization.mpeSuperseded });
            data.set("DaysLeft", 0);
        });
        this.UpdateStatus(vmModel,false);
    }

    this.UpdateStatus = function (vmModel, isFormLoad) {
        var gId;
        var sStart;
        var sEnd;
        var supersedesParent;
        var supersededSource;
        var currentDate = new Date().toISOString();
        var mpeExpired = "ce127307-2bc9-b244-bcf5-fb9d81fc2806";
        var mpeNone = "6a397180-2a99-7d58-813f-3b5ea370746b";
        var mpeOK = "56f4716e-aafd-db61-b18a-3aa513af4600";
        var mpeWarning = "b9500a07-cf76-c963-04ec-e6b0544eb2c6";
        var mpeMaster = "8c22fc90-ce1c-3c59-7cd5-b6e2b9aec873";
       

        if (pageForm.type == "ContractLease") {
            gId = "97aaa390-0ce2-8612-e10f-d7df5e5a5147";
            sStart = "LeaseStartDate";
            sEnd = "LeaseEndDate";
            supersededTarget = "Target_LeaseSupersedesLease";
            supersededSource = "Source_LeaseSupersedesLease";
        }
        else if (pageForm.type == "WarrantyContract") {
            gId = "5b8253dc-df8d-bb53-a833-a9b99720330e";
            sStart = "WarrantyStartDate";
            sEnd = "WarrantyEndDate";
            supersededTarget = "Target_WarrantySupersedesWarranty";
            supersededSource = "Source_WarrantySupersedesWarranty";
        }
        else if (pageForm.type == "SupportAndMaintenance") {
            gId = "1576e04b-f141-3677-10c7-023fee04450f";
            sStart = "ContractStartDate";
            sEnd = "ContractEndDate";
            supersededTarget = "Target_SupportContractSupersedesSupportContract";
            supersededSource = "Source_SupportContractSupersedesSupportContract";
        }
        
        var dtStart = kendo.parseDate(vmModel[sStart]);
        var dtEnd = kendo.parseDate(vmModel[sEnd]);
        var contractStat = vmModel.get("ContractStatus");
        var supersedBy = vmModel.get(supersededSource);
        if ((!_.isUndefined(contractStat) && !_.isUndefined(contractStat.Id))) {
            if (!_.isUndefined(supersedBy) && !_.isNull(supersedBy.BaseId) && !isFormLoad) {
                vmModel.set("DaysLeft", 0);
                //Contract Status is a enum picker
                vmModel.set("ContractStatus", { Id: mpeSuperseded, Name: localization.mpeSuperseded });
                vmModel.set("LastUpdated", currentDate);
            } else {
                app.lib.SetDaysLeft(dtStart, dtEnd, vmModel, "DaysLeft");
                if (isFormUpdate || contractStat.Id != mpeSuperseded)
                {//if status is superseded, it should not check for any status anymore.
                    if (vmModel.IsMaster != null && vmModel.IsMaster) {
                        //Force contract type to master if required
                        if ((contractStat.Id != mpeMaster)) {
                            vmModel.set("ContractStatus", { Id: mpeMaster, Name: localization.mpeMaster });
                        }
                    } else if (vmModel[sStart] == null || vmModel[sEnd] == null) {
                        vmModel.set("ContractStatus", { Id: mpeNone, Name: localization.mpeNone });
                        vmModel.set("DaysLeft", 0);
                    }
                    else if (dtStart > dtEnd) {
                        vmModel.set("ContractStatus", { Id: mpeNone, Name: localization.mpeNone });
                        vmModel.set("DaysLeft", 0);
                    } else {
                        //This will going to get the left days of the superseded contracts
                        _.each(vmModel[supersededTarget], function (data) {
                            var daysLeft = app.lib.GetDaysBetween(new Date(), kendo.parseDate(data[sEnd]));
                            totalSupersedes += daysLeft > 1 ? daysLeft - 1 : 0;
                        });

                        var dblTotal = vmModel.get("DaysLeft");
                        dblTotal += totalSupersedes;
                        vmModel.set("DaysLeft", dblTotal);
                        var dblLeft = dblTotal;
                        var iThreshold = ((dblTotal / 100) * pageForm.percent);
                        if (new Date() > dtEnd) { //Expired
                            vmModel.set("ContractStatus", { Id: mpeExpired, Name: localization.mpeExpired });
                        }
                        else if (iThreshold >= dblLeft || dblLeft <= 5) { //Warning
                            vmModel.set("ContractStatus", { Id: mpeWarning, Name: localization.mpeWarning });
                        }
                        else { //OK
                            vmModel.set("ContractStatus", { Id: mpeOK, Name: localization.mpeOK });
                        }
                    }

                    //Last updated
                    vmModel.set("LastUpdated", currentDate);
                    var lastUpdated = $("input[name='LastUpdated']");
                    if (lastUpdated[0] != null) {
                        lastUpdated.val(kendo.toString(new Date(currentDate), "g"));
                    }
                }
            }
        }
        

    }

    this.OnChange = function (event, vm) {
        switch (event.field) {
            case "LeaseStartDate":
            case "LeaseEndDate":
            case "ContractStartDate":
            case "ContractEndDate":
            case "WarrantyStartDate":
            case "WarrantyEndDate":
                isFormUpdate = false;
                this.UpdateStatus(vm,false);
                break;
            case "Target_LeaseSupersedesLease":
                break;
        }
    }
}
