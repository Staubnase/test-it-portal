var Announcement = {
    CheckedStartAndEndDate: function () {
        var StartDate = $("input[name='StartDate']").data("kendoDateTimePicker");
        var EndDate = $("input[name='EndDate']").data("kendoDateTimePicker");

        var StartDateVal = kendo.parseDate(StartDate.value());
        var EndDateVal = kendo.parseDate(EndDate.value());
        if (EndDateVal > StartDateVal) {
            return true;
        }
        return false;
    }

    
};