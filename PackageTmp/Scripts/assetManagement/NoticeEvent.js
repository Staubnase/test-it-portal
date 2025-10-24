var NoticeEvent = {
    dueDate : null,
    vm: null,
    mainContainer:null,
    Init: function (vm, mainContainer) {
        this.vm = vm;
        this.mainContainer = mainContainer;
        this.dueDate = this.mainContainer.find('[name="DueDate"]').data("kendoDatePicker");
        this.ToggleDueDate();
        this.vm.set("NoticeEventRecipeintError", localization.NoticeEventRecipeintError);
    },
    ToggleDueDate: function () {
        if (this.vm.get("UseContractDate")) {
            this.dueDate.value("");
            this.dueDate.enable(false);
            //Looking up to form-group since required property is within form-group now
            this.dueDate.element.closest(".form-group").removeAttr("required", "").removeClass("has-error");
        } else {
            this.dueDate.enable(true);
            //Looking up to form-group since required property is within form-group now
            this.dueDate.element.closest(".form-group").attr("required", "");
            
        }
    },
    CheckRecipient: function () {
        var isOk = true;
        var panelBody = this.mainContainer.find("[data-bind='text: NoticeEventRecipeintError']");
        panelBody.removeClass("recipientError");
        if (!this.vm.get("SendToOwner") && !this.vm.get("SendToCustodian") && this.vm.get("Target_NoticeEventRelatesToRecipient").length <= 0) {
            panelBody.addClass("recipientError");
            isOk = false;
        }
        return isOk;
    }

};