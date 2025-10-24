var ContractSupportandMaintenance = {
    Init: function (dataVM, pageForm) {
        var daysLeft = $("input[name='DaysLeft']");
        var StartDate = $("input[name='ContractStartDate']");
        var EndDate = $("input[name='ContractEndDate']");
        var StartDateDiv = StartDate.closest(".k-datetimepicker");
        var EndDateDiv = EndDate.closest(".k-datetimepicker");
        var EndDateSelect = EndDateDiv.find(".k-select");
        var StartDateDateSelect = StartDateDiv.find(".k-select");

        var lastUpdated = $("input[name='LastUpdated']");
        var lastUpdatedteDiv = lastUpdated.closest(".k-datetimepicker");
        var lastUpdatedSelect = lastUpdatedteDiv.find(".k-select");

        daysLeft.css("width", "100px");

        if (pageForm.isNew == false) {
            $("input[name='Name']").prop("disabled", true).addClass("k-state-disabled");
        }

        //if (pageForm.isNew != null) {
        if (pageForm.isNew == false) {
            lastUpdated.val(kendo.toString(new Date(), "g"));
        }
    }
}