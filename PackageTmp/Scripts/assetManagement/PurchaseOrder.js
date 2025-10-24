var purchaseOrder = new function () {
    var viewModel;
    var totalAmount;
    this.Init = function (vm, mainContainer) {
        viewModel = vm;
        totalAmount = mainContainer.find("input[name='Amount']").data("kendoNumericTextBox");
        this.AssignContractsToList();
    }

    this.OnChange = function (e) {
        switch (e.field) {
            case "Target_PurchaseOrderHasChildPurchaseOrder":
                pageForm.common.TotalAmountOrCost("Target_PurchaseOrderHasChildPurchaseOrder", "POTotalCost", "Amount", localization.TotalAmountOfChildPO);
                break;
            case "Source_PurchaseHasPurchaseOrder":
            case "AutoCalculate":
            case "ShippingCost":
                this.CalculateTotalCost();
                break;
            case "Target_PurchaseOrderHasInvoices":
                pageForm.common.TotalAmountOrCost("Target_PurchaseOrderHasInvoices", "InvoiceTotalCost", "TotalAmount", localization.TotalAmountOfInvoices);
                break;
            case "Target_PurchaseOrderHasShipToLocation.BaseId":
                this.GetShippingLocationDetails();
                break;
        }
    }

    this.AssignContractsToList = function () {

        function displayContract(target_POToContractRelationship, item) {
            var listItem = viewModel.get(target_POToContractRelationship);
            for (var i in listItem) {
                if (listItem[i].BaseId == item.BaseId) {
                    return;
                }
            }

            listItem.unshift(item);
            var original = pageForm.jsonRaw[target_POToContractRelationship];
            
            if (_.isUndefined(original)) {
                original = pageForm.jsonRaw[target_POToContractRelationship] = [];
            }
            original.unshift(item);
        }
        
        if (!_.isNull(viewModel.Source_SupportContractHasPurchaseOrder)) {
            _.each(viewModel.Source_SupportContractHasPurchaseOrder, function (item) {
                displayContract("Target_PurchaseOrderHasSupportContracts", item);
            });
        }

        if (!_.isNull(viewModel.Source_WarrantyHasPurchaseOrder)) {
            _.each(viewModel.Source_WarrantyHasPurchaseOrder, function (item) {
                displayContract("Target_PurchaseOrderHasWarranties", item);
            });
        }

        if (!_.isNull(viewModel.Source_LeaseHasPurchaseOrder)) {
            _.each(viewModel.Source_LeaseHasPurchaseOrder, function (item) {
                displayContract("Target_PurchaseOrderHasLeases", item);
            });
        }
    }

    this.GetShippingLocationDetails = function () {

        $.get("/Search/GetObjectById", { id: viewModel.get("Target_PurchaseOrderHasShipToLocation").BaseId }, function (data) {
            if (!_.isUndefined(data.LocationTaxRate)) {
                viewModel.Target_PurchaseOrderHasShipToLocation.set("LocationTaxRate", data.LocationTaxRate);
            } else {
                viewModel.Target_PurchaseOrderHasShipToLocation.set("LocationTaxRate", null);
            }
        });
    }

    this.CalculateTotalCost = function () { //This will going to compute the new PO total cost computation method
        if (viewModel.get("AutoCalculate") == true) {
            totalAmount.enable(false);
        } else {
            totalAmount.enable(true);
            return;
        }
        var totalCost = 0;
        var shippingCost = app.lib.vmParseFloat(viewModel,"ShippingCost");
        _.each(viewModel.get("Source_PurchaseHasPurchaseOrder"), function (item) {
            totalCost += parseFloat(item["Cost"]);
        });
        totalCost = Math.abs(totalCost).toFixed(2);
        viewModel.set("LineItemsTotal", totalCost);
        viewModel.set("PurchaseTotalCost", localization.TotalcostofallLineItems + " " + totalCost);

        totalCost += parseFloat(shippingCost);
        viewModel.set("Amount", totalCost);
    }
}