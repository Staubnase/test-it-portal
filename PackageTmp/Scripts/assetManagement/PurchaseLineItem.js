var PurchaseLineItem = new function () {
    var viewModel;
    var purchaseTaxRate;
    this.Init = function (vm, mainContainer) {
        viewModel = vm;
        purchaseTaxRate = mainContainer.find("input[name='PurchaseTaxRate']").data("kendoNumericTextBox");
        this.OverrideTaxCheckbox();
    }

    this.OnChange = function (event, vm) {
        switch (event.field) {
            case "Target_PurchaseHasLocation.BaseId":
                this.GetShippingLocationWholeProperty();
                break;
            case "OverrideLocationTax":
                this.OverrideTaxCheckbox();
                break;
            case "Units":
            case "PurchaseTaxRate":
            case "UnitCost":
            case "AdditionalCharges":
                this.CalculateFinancial();
                break;
        }
    }

    this.OverrideTaxCheckbox = function () {
        if (viewModel.get("OverrideLocationTax") == true) {
            purchaseTaxRate.enable(true);
        } else {
            viewModel.set("PurchaseTaxRate", viewModel.get("Target_PurchaseHasLocation").LocationTaxRate)
            purchaseTaxRate.enable(false);
        }
    }

    this.GetShippingLocationWholeProperty = function () {
        if (viewModel.get("OverrideLocationTax") == false) {
            $.get("/Search/GetObjectById", { id: viewModel.get("Target_PurchaseHasLocation").BaseId }, function (data) {
                viewModel.set("PurchaseTaxRate", data.LocationTaxRate);
            });
        }
    }

    this.CalculateFinancial = function () {
        var units = app.lib.vmParseFloat(viewModel, "Units");
        var unitCost = app.lib.vmParseFloat(viewModel, "UnitCost");
        var additionalCharges = app.lib.vmParseFloat(viewModel, "AdditionalCharges");
        var purchaseTaxRate = app.lib.vmParseFloat(viewModel, "PurchaseTaxRate");
        var unitTotalCost = (units * unitCost) + additionalCharges;
        var totalCost = (unitTotalCost * purchaseTaxRate) + unitTotalCost;
        viewModel.set("Cost", totalCost);
    }
}