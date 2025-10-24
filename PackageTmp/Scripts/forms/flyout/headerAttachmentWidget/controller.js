var __headerAttachmentWidgetSingleton;

define(function (require) {
    var tpl = require("text!forms/flyout/headerAttachmentWidget/view.html");
    var attachmentTpl = require("text!forms/predefined/fileAttachmentsDragDrop/view.html");
    var fileAttachmentsDragDrop = require("forms/predefined/fileAttachmentsDragDrop/controller");
    var definition = {
        template: tpl,
        getWidget: function (vm) {
            //only build the template if the popup singleton does not exist.
            var built = _.template(tpl);
            var ele = $(built());

            var main_row = $('.page_bar.sticky-header').first().children('.row').first();
            main_row.after(ele);

            var getContainer = function (tplReturn) {
                return (typeof (tplReturn) === "string") ? $(tplReturn) : tplReturn;
            }

            var headerAttachmentContainer = $('#headerAttachmentContainer');
            //headerAttachmentContainer.append(eleAttachment);

            fileAttachmentsDragDrop.build(vm.viewModel, { name: "File Attachments", type: "fileAttachmentsDragDrop" }, function (tplReturn) {
                var _container = getContainer(tplReturn);
                headerAttachmentContainer.append(_container);
            });

            vm.attachmentWidget = {
                open: false
            }

            kendo.bind(ele, vm);

            return __headerAttachmentWidgetSingleton;
        },
        toggle: function (vm) {
            vm.attachmentWidget.open = !vm.attachmentWidget.open;

            if (vm.attachmentWidget.open) {
                if (vm.widget) vm.widget.open = false;
                $("#remoteManageBtn").removeClass('btn-icon-stack--active');
                $("#expanded_widget").removeClass('content-header__flyout--open');
                $("#attachment_widget").addClass('content-header__flyout--open');
                $("#content-header-backdrop").addClass('content-header__flyout__overlay--open');
            } else {
                $("#headerAttachmentBtn").removeClass('btn-icon-stack--active');
                $("#attachment_widget").removeClass('content-header__flyout--open');
                $("#content-header-backdrop").removeClass('content-header__flyout__overlay--open');
            }
        }
    }

    return definition;

});