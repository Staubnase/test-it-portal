/**
Header Sticky for AM pages
**/
define(function (require) {
    var tpl = require("text!forms/header/stickyCI/view.html");
    var attachmentPickerFlyout = require("forms/flyout/fileAttachmentsFlyout/controller");
    var remoteManageWidget = require("forms/flyout/remoteManageWidget/controller");

    if (app.featureSet.isActive("HeaderAttachments"))
        var headerAttachmentWidget = require("forms/flyout/headerAttachmentWidget/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //add FileAttachment on viewModel if not found
            if (_.isUndefined(vm.viewModel.FileAttachment)) {
                vm.viewModel.set("FileAttachment", []);
            }

            vm.view.showAttachments = app.featureSet.isActive("HeaderAttachments");

            //modify vm for this view
            //vm.view.viewAttachments = function () {

            //    var flyoutWindow = attachmentPickerFlyout.getPopup(vm);
            //    flyoutWindow.open();
            //}

            //vm.view.filesCount = vm.viewModel.FileAttachment.length;

            vm.view.statusVisible = function () {
                if (vm.isNew) {
                    return false;
                } else {
                    return true;
                }
            }

            var withRMSupport = (["HardwareAsset", "Microsoft.Windows.Computer", "System.Domain.User"].indexOf(vm.type) > -1) ? true : false;

            vm.view.showRemoteManageIcon = (session.consoleSetting.TrueControlCenterURL && !app.isMobile() && withRMSupport && session.user.Analyst) ? true : false;

            var view = new kendo.View(built(), {
                wrap: false,
                init: function () {

                    setTimeout(function() {
                        if ($("#expanded_widget").length === 0) {
                            remoteManageWidget.getWidget(vm);
                        }
                        if ($("#attachment_widget").length === 0 && vm.view.showAttachments) {
                            headerAttachmentWidget.getWidget(vm);
                        }
                    }, 100);
                },
                model: vm
            });

            vm.view.doClick = function (e) {
                if ($(e.currentTarget).hasClass("btn-icon-stack--active"))
                    $(e.currentTarget).removeClass("btn-icon-stack--active");
                else
                    $(e.currentTarget).addClass("btn-icon-stack--active");

                var type = (vm.type === "System.Domain.User") ? "user" : "computer";
                var model = (vm.type === "HardwareAsset") ? vm.viewModel.Target_HardwareAssetHasAssociatedCI : vm.viewModel;
                var src = app.slideOutNav.getTCCSourceURL(model, type);
                var options = {
                    url: src,
                    tooltip: (type === "user")
                        ? localization.UserManagement
                        : localization.ComputerManagement
                }
                app.slideOutNav.show(options);
            }

            vm.view.viewAttachments = function (e) {
                if ($(e.currentTarget).hasClass("btn-icon-stack--active"))
                    $(e.currentTarget).removeClass("btn-icon-stack--active");
                else
                    $(e.currentTarget).addClass("btn-icon-stack--active");
                headerAttachmentWidget.toggle(vm);
            }

            var initDisplays = function (model, rebind) {
                
                
                vm.view.Title = vm.view.title + " - " + (_.isEmpty(model.viewModel.DisplayName) ? localization.New : model.viewModel.DisplayName );
                vm.view.StatusName = (model.viewModel.ObjectStatus) ? model.viewModel.ObjectStatus.Name : "None";

                if (rebind)
                    kendo.bind($(".content-header__container"), vm);

            }
            initDisplays(vm, false);

            //set page <title>
            document.title = vm.view.title + ' - ' + vm.view.id;

            $('body').click(function (e) {

                if (e.target.id === 'expanded_widget' || $(e.target).parents('#expanded_widget').length > 0)
                    return;

                if (e.target.id === 'remoteManageBtn' || $(e.target).parents('#remoteManageBtn').length > 0)
                    return;

                if ($(e.target).hasClass("support-tools__widget__action") || $(e.target).parents('.support-tools__widget__action').length > 0)
                    return;

                if ($(e.target).hasClass("multi-query__list__selected-items") || $(e.target).parents('.multi-query__list__selected-items').length > 0)
                    return;

                if (e.target.id === 'attachment_widget' || $(e.target).parents('#attachment_widget').length > 0)
                    return;

                if (e.target.id === 'headerAttachmentContainer' || $(e.target).parents('#headerAttachmentContainer').length > 0)
                    return;

                if (e.target.id === 'headerAttachmentBtn' || $(e.target).parents('#headerAttachmentBtn').length > 0)
                    return;

                if ($(e.target).hasClass("thumbnail-file") || $(e.target).parents('.thumbnail-file').length > 0)
                    return;

                if (vm.widget) vm.widget.open = false;
                $("#remoteManageBtn").removeClass('btn-icon-stack--active');
                $("#expanded_widget").removeClass('content-header__flyout--open');
                $("#content-header-backdrop").removeClass('content-header__flyout__overlay--open');

                if (vm.attachmentWidget) vm.attachmentWidget.open = false;
                $("#headerAttachmentBtn").removeClass('btn-icon-stack--active');
                $("#attachment_widget").removeClass('content-header__flyout--open');
            });

            var changeCntr = 0;
            vm.bind("change",
                function (e) {

                    if (e.field.indexOf("HardwareAssetStatus") > -1) {
                        changeCntr++

                        if (changeCntr === 2) {
                            initDisplays(e.sender, true);
                        }

                    }

                });

            callback(view.render());
        }
    }

    return definition;

});
