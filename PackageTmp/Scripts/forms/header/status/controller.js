/**
Header Status
**/
define(function (require) {
    var tpl = require("text!forms/header/status/view.html");
    var attachmentPickerFlyout = require("forms/flyout/fileAttachmentsFlyout/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //add FileAttachment on viewModel if not found
            if (_.isUndefined(vm.viewModel.FileAttachment)) {
                vm.viewModel.set("FileAttachment", []);
            }
            
            //modify vm for this view
            vm.view.viewAttachments = function () {

                var flyoutWindow = attachmentPickerFlyout.getPopup(vm);
                flyoutWindow.open();
            }

            vm.view.filesCount = vm.viewModel.FileAttachment.length;

            vm.view.statusVisible = function () {
                if (vm.newWI) {
                    return false;
                } else {
                    return true;
                }
            }
            //set page <title>
            document.title = vm.view.title + ' - ' + vm.view.id;

            var view = new kendo.View(built(), { wrap: false, model: vm });

            callback(view.render());
        }
    }

    return definition;

});
