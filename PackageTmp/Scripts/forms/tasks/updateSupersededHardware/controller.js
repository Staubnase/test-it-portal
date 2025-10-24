/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");

    var definition = {
        build: function (vm, node, callback) {
            var viewModel = kendo.observable({
                changeStatus: function () {
                    $.when(kendo.ui.ExtYesNoDialog.show({
                        title: localization.CiresonAssetManagement,
                        message: localization.UpdateSupersedesConfirmation
                    })).done(function (response) {
                        if (response.button === "yes") {
                            $.post(node.Configs.url, { baseId: node.Configs.baseId }, function (data) {
                                if (data.success === true) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.UpdatingAssets,
                                        message: localization.TotalNumberofAssetsUpdated + ": " + data.count
                                    });
                                } else {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.ServerError,
                                        message: data.error
                                    });
                                }
                            });
                        }
                    });
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "changeStatus",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());
        }
    }

    return definition;

});