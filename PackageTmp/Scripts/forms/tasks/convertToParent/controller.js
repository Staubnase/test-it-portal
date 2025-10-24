/**
convert To Parent
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");


    var definition = {
        //template: tpl,
        build: function (vm, node, callback) {
            //first add the anchor
            var link = _.template(anchor);

            //make sure we have all the node set
            var properties = {
                Target: "convertToParent"
            };

            $.extend(true, properties, node);
           
           //create view model 
            var viewModel = kendo.observable({
                isParent: node.Configs.isParent,
                confirmTitle: node.Configs.confirmTitle,
                confirmMessage: node.Configs.confirmMessage,
                convertToParent: function () {
                    $.when(kendo.ui.ExtYesNoDialog.show({
                        title: this.confirmTitle,
                        message: this.confirmMessage
                    })).done(function (response) {
                        if (response.button === "yes") {
                            vm.viewModel.IsParent = node.Configs.isParent;
                            if (!vm.viewModel.IsParent) {
                                if (vm.viewModel.ChildWorkItem != null) {
                                    vm.viewModel.ChildWorkItem = [];
                                }
                            }
                            vm.save(function (data) {
                                app.lib.message.add(localization.ChangesApplied, "success");
                                switch (pageForm.type) {
                                    case "ReleaseRecord":
                                        location.href = "/ReleaseRecord/Edit/" + vm.viewModel.Id + "/";
                                        break;
                                    default:
                                        location.href = "/Incident/Edit/" + vm.viewModel.Id + "/";
                                        break;
                                }
                            }, saveFailure);
                        } else {
                        }
                    });
                }
            });

            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel });
            callback(anchorElm.render());

            //more functions
            var saveFailure = function (exceptionMessage) {
                if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                    app.lib.message.add(exceptionMessage, "danger");
                } else {
                    //fallback to generic message
                    app.lib.message.add(localization.PleaseCorrectErrors, "danger");
                }
                app.lib.message.show();
            }
            
        }
    }

    return definition;

});