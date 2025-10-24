var Consumable = new function () {

    var AssignedConsumableAssets
    var AssignedConsumableUsers;
    var AutoAssignmentCount;
    var ConsumableHasAssignedAssets;
    var ConsumableHasAssignedUsers;
    var currentAssignedCount;
    var txtAssignedCount;
    var iOriginalCount;
    var vm;

    this.OnChange = function (e, vm, mainContainer) {
        _.defer(function () {
            if (e.field === 'Target_ConsumableHasAssignedUsers') {
                if (vm.get("CountAssignedConsumableUsers")) {
                    Consumable.CheckedIfEnabledOrDisabledAutoAssignement(e);
                }
            } else if (e.field === 'Target_ConsumableHasAssignedAssets') {
                if (vm.get("CountAssignedConsumableAssets")) {
                    Consumable.CheckedIfEnabledOrDisabledAutoAssignement(e);
                }
            }
        });
        
    }

    this.Init = function (vModel) {
        vm = vModel;
        AssignedConsumableAssets = $("input[name='CountAssignedConsumableAssets']");
        AssignedConsumableUsers = $("input[name='CountAssignedConsumableUsers']");
        AutoAssignmentCount = $("input[name='AutoAssignmentCount']");
        ConsumableHasAssignedAssets = $("div[id='Target_ConsumableHasAssignedAssets']");
        ConsumableHasAssignedUsers = $("div[id='Target_ConsumableHasAssignedUsers']");
        currentAssignedCount = parseInt(vm.get("AssignedCount") == null ? 0 : vm.get("AssignedCount"));
        txtAssignedCount = $("input[name='AssignedCount']").data("kendoNumericTextBox");

        iOriginalCount = parseInt(vm.get("Count") == null ? 0 : vm.get("Count")) + currentAssignedCount;


        this.CheckedIfEnabledOrDisabledAutoAssignement();
        AssignedConsumableAssets.change(function () {
            Consumable.CheckedIfEnabledOrDisabledAutoAssignement();
        });

        AssignedConsumableUsers.change(function () {
            Consumable.CheckedIfEnabledOrDisabledAutoAssignement();
        });


    }



    this.CheckedIfEnabledOrDisabledAutoAssignement = function (event) {
        var isNotExceeded = true;
        this.SetCounts();
        var count = vm.get("Count");
        //if (vm.get("CountAssignedConsumableAssets") && count <= 0) {
        //    ConsumableHasAssignedAssets.find("button.k-button").attr("disabled", "");
        //    ConsumableHasAssignedAssets.find("a.k-button").css("visibility", "hidden");
        //    isNotExceeded = false;
        //} else {
        //    ConsumableHasAssignedAssets.find("button.k-button").removeAttr("disabled");
        //    ConsumableHasAssignedAssets.find("a.k-button").css("visibility", "visible");
        //}

        //if (vm.get("CountAssignedConsumableUsers") && count <= 0) {
        //    ConsumableHasAssignedUsers.find("button.k-button").attr("disabled", "");
        //    ConsumableHasAssignedUsers.find("a.k-button").css("visibility", "hidden");
        //    isNotExceeded = false;
        //} else {
        //    ConsumableHasAssignedUsers.find("button.k-button").removeAttr("disabled");
        //    ConsumableHasAssignedUsers.find("a.k-button").css("visibility", "visible");
        //}



        if (!_.isUndefined(event)) {

            if (!isNotExceeded) { //This will going to remove exceeded items added depends on available count
                var tempList = [];
                if (event.field === 'Target_ConsumableHasAssignedUsers' || e.field === 'Target_ConsumableHasAssignedAssets') {
                    tempList = vm.get(event.field);
                }

                for (var index in tempList) {
                    if (event.items[0].BaseId == tempList[index].BaseId) {
                        tempList.splice(index, 1);
                        break;
                    }
                }
            }

        }
    }

    this.SetCounts = function () {
        if (!vm.get("CountAssignedConsumableUsers") && !vm.get("CountAssignedConsumableAssets")) {
            txtAssignedCount.enable(true);
            vm.set("AutoAssignmentCount", false);
        }
        else {
            var i = 0;
            txtAssignedCount.enable(false);

            if (vm.get("Target_ConsumableHasAssignedUsers") && vm.get("CountAssignedConsumableUsers")) {
                //i += vm.get("Target_ConsumableHasAssignedUsers").length;
                _.each(vm.get("Target_ConsumableHasAssignedUsers"), function (item) {
                    i += (_.isUndefined(item.RelationshipProperty.Count) ? item["RelationshipProperty.Count"] : item.RelationshipProperty.Count);
                });
            }
            if (vm.get("Target_ConsumableHasAssignedAssets") && vm.get("CountAssignedConsumableAssets")) {
                i += vm.get("Target_ConsumableHasAssignedAssets").length;
            }

            vm.set("AssignedCount", i);
        }


        var availableCount = iOriginalCount - parseInt(vm.get("AssignedCount") == null ? 0 : vm.get("AssignedCount"));
        if (availableCount < 0)
            vm.set("Count", 0);
        else
            vm.set("Count", availableCount);

    }
}
