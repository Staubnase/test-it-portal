var ContractLeaseOrWarranty = {
    MasterContract: function (dataVM, pageForm) {
        var mpeSuperseded = "d39fba52-caf7-868a-ebcb-2a667a8c1ba9";
        var startDateName;
        var endDateName;
        if (pageForm.type == "WarrantyContract") {
            startDateName = "WarrantyStartDate";
            endDateName = "WarrantyEndDate";
        } else {
            startDateName = "LeaseStartDate";
            endDateName = "LeaseEndDate";
        }

        
        if (pageForm.isNew==false) {
            //$("input[name='Name']").prop("disabled", true).addClass("k-state-disabled");
        }
        var isMaster = $("input[name='IsMaster']");

        //kendo controls
        var contractSpanCtrl = $("input[name='Span']").data("kendoNumericTextBox");
        var leaseOrWarrantyStartDateCtrl = $("input[name='" + startDateName + "']").data("kendoDatePicker");
        var leaseOrWarrantyEndDateCtrl = $("input[name='" + endDateName + "']").data("kendoDatePicker");
        var lastUpdatedCtrl = $("input[name='LastUpdated']").data("kendoDateTimePicker");
        var unitCtrl = $('div[data-role="Unit"]').data().handler._dropdown; 


        var isContractSpanRequired = contractSpanCtrl.element.attr("required") !== undefined;
        var isLeaseOrWarrantyStartDateRequired = leaseOrWarrantyStartDateCtrl.element.closest(".form-group").attr("required") !== undefined;
        var isLeaseOrWarrantyEndDateRequired = leaseOrWarrantyEndDateCtrl.element.closest(".form-group").attr("required") !== undefined;

        //last updated is readonly
        lastUpdatedCtrl.enable(false);
        $(lastUpdatedCtrl.element).siblings(".k-select").hide();

        //if (pageForm.isNew != null) {
        if (pageForm.isNew == false) {
            lastUpdatedCtrl.value(kendo.toString(new Date(), "g"));
        }

        //set initial val
        if (dataVM.get("IsMaster")) {
            enableMasterFields(true);
        } else {
            disableMasterFields(true);
        }

        isMaster.change(function () {
            if (this.checked) {
                enableMasterFields(false);
            } else {
                disableMasterFields(false);
            }
        });

        function disableMasterFields(isInit) {
            //disable span value
            contractSpanCtrl.enable(false);
            contractSpanCtrl._downArrow.hide();
            contractSpanCtrl._upArrow.hide();
            if (dataVM.get("ContractStatus").Id != mpeSuperseded && !isInit) {
                dataVM.set("ContractStatus", { Id: "6a397180-2a99-7d58-813f-3b5ea370746b", Name: localization.mpeNone });
            }
            
            //enable contract dates
            leaseOrWarrantyStartDateCtrl.enable(true);
            leaseOrWarrantyEndDateCtrl.enable(true);

            //disable master contract checkbox
            unitCtrl.enable(false);

            //disable contract unit combobox
            unitCtrl.element.siblings().find(".dropdowntree-button").hide();

            if (isContractSpanRequired) {
                contractSpanCtrl.element.removeAttr("required");
                contractSpanCtrl.element.closest(".form-group").removeClass("has-error");

                unitCtrl.element
                    .closest(".form-control-picker")
                    .removeAttr("required")
                    .closest(".has-error")
                    .removeClass("has-error");

                //remove combo placeholder
                unitCtrl.input.attr("placeholder", "");
                
                //clear span values
                contractSpanCtrl.value(null);
                unitCtrl.value(null);
                unitCtrl.element
                    .closest(".form-control-picker").data().handler._dropdown.input.removeAttr("style");
            }
            if (isLeaseOrWarrantyStartDateRequired) {
                leaseOrWarrantyStartDateCtrl.element.closest(".form-group").attr("required", "");
            }
            if (isLeaseOrWarrantyEndDateRequired) {
                leaseOrWarrantyEndDateCtrl.element.closest(".form-group").attr("required", "");
            }

        }

        function enableMasterFields(isInit) {
            contractSpanCtrl.enable();
            contractSpanCtrl._downArrow.show();
            contractSpanCtrl._upArrow.show();
            leaseOrWarrantyStartDateCtrl.enable(false);
            leaseOrWarrantyEndDateCtrl.enable(false);
            $("input[name='DaysLeft']").val("");
            if (dataVM.get("ContractStatus").Id != mpeSuperseded && !isInit) {
                dataVM.set("ContractStatus", { Id: "8c22fc90-ce1c-3c59-7cd5-b6e2b9aec873", Name: localization.mpeMaster });
            }
            leaseOrWarrantyStartDateCtrl.value("");
            leaseOrWarrantyEndDateCtrl.value("");
            unitCtrl.enable();
            unitCtrl.element.siblings().find(".dropdowntree-button").show();

            if (isContractSpanRequired) {
                contractSpanCtrl.element.attr("required", "");
                unitCtrl.element.closest(".form-control-picker").attr("required", "");
            }

            if (isLeaseOrWarrantyStartDateRequired) {
                leaseOrWarrantyStartDateCtrl.element.closest(".form-group").removeAttr("required", "").removeClass("has-error");
            }
            if (isLeaseOrWarrantyEndDateRequired) {
                leaseOrWarrantyEndDateCtrl.element.closest(".form-group").removeAttr("required", "").removeClass("has-error");
            }

            //show combo placeholder
            var masterContractUnitCombo = unitCtrl.element.closest(".form-control-picker").data().handler._dropdown;
            masterContractUnitCombo.input.attr("placeholder", localization.ChooseOne);
        }

    }
}