/**
Assign To Me
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var notificationTpl = require("text!forms/popups/notificationPopup/view.html");

    var definition = {
        notificationTemplate: notificationTpl,
        build: function (vm, node, callback) {
            //build the template for the window
            var built = _.template(notificationTpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());

            var viewModel = kendo.observable({
                displayName: node.Configs.displayName,
                baseId: node.Configs.baseId,
                target: node.Configs.target,
                assignToMe: function () {
                    //set AssingedWorkitem to current user
                    vm.viewModel.AssignedWorkItem.set("BaseId", this.baseId);
                    vm.viewModel.AssignedWorkItem.set("DisplayName", this.displayName);
                    
                    //build notification popup 
                    var cont = view.element;
                    var popupNotification = cont.kendoNotification({
                        height: "80px",
                        templates: [
                            {
                                type: "info",
                                template: "<div class='success k-ext-dialog-content'><div class='k-ext-dialog-icon fa fa-check'></div><div class='k-ext-dialog-message'>#= message #</div></div>"
                            }]
                    }).data("kendoNotification");

                    if (app.isMobile()) {
                        popupNotification.options.position.left = 20;
                        popupNotification.options.position.bottom = 20;
                        popupNotification.options.position.right = 20;
                    }


                    //notify user
                    var infoMessage = localizationHelper.localize(localization.AssignedToMeNotificationMessage, "This workitem is assigned to {0}");
                    popupNotification.show({
                        message: infoMessage.replace("{0}", session.user.Name)
                    }, "info");
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);

            //make sure we have all the node set
            var properties = {
                Target: "assignToMe"
            };
            $.extend(true, properties, node);

            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());
        }
    }

    return definition;

});