/**
Header Status
**/
define(function (require) {
    var tpl = require("text!forms/header/relationships/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //we need to have a container to add to via task
            var container = $('<div/>').attr("id", "parent-header-space");
            var view = new kendo.View(container, { wrapper: false });
           
            //this function is called from the link parent task so we need to allow callback function to be an input
            vm.view.buildParentHeaderView = function (viewCallBack) {
                //build template using underscore.js so that we can interpret kendo template vars if needed
                var built = _.template(tpl);
                
                //modify vm for this view
                vm.view.controller = {
                    parentIncident: (vm.type === "ReleaseRecord") ? localization.ParentRecord : localization.Parentincident,
                    editHref: "/"+vm.type+"/Edit/" + vm.viewModel.ParentWorkItem.Id + "/",
                    editLink: vm.viewModel.ParentWorkItem.Id + "-" + vm.viewModel.ParentWorkItem.Title,
                    unlinkParent: function () {
                        $.when(kendo.ui.ExtYesNoDialog.show({
                            title: localization.UnlinkToParent,
                            message: localization.SureUnlinkToParent
                        })
                        ).done(function (response) {
                            if (response.button === "yes") {
                                delete vm.viewModel.ParentWorkItem;
                                vm.viewModel.set("isDirty", true);
                                view.content.hide();
                            } else {

                            }
                        });
                    }
                }

                viewCallBack(built());
            }

            if (!_.isNull(vm.viewModel.ParentWorkItem) &&
                !_.isUndefined(vm.viewModel.ParentWorkItem)) {
                vm.view.buildParentHeaderView(function (tpl) {
                    //destroy default container
                    view.destroy();

                    container.append(tpl);
                    view = new kendo.View(container, { wrapper: false, model: vm });
                    callback(view.render());
                });
            } else {
                callback(view.render());
            }
        }
    }

    return definition;

});
