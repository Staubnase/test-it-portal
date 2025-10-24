/**
Add Me to Watchlist
**/

define(function (require) {
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
                addMeToWatchList: function (ele) {
                    if (!_.isUndefined(node.Configs.isAddWatchlist)) {
                        switch (node.Configs.isAddWatchlist) {
                            case false:
                                this.removeFromWatchList();
                                node.Configs.isAddWatchlist = true;
                                $(ele.currentTarget).html(localization.AddMeToWatchList);
                                break;
                            case true:
                            default:
                                this.addToWatchList();
                                node.Configs.isAddWatchlist = false;
                                $(ele.currentTarget).html(localization.RemoveMeFromWatchList);
                                break;
                        }
                    }
                    
                },
                addToWatchList: function () {
                    //set current user's baseid in case it is missing
                    var currentUser = session.user;
                    currentUser.BaseId = session.user.Id;
                    

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

                    //if user is not yet on the watchlist, add it in
                    var isAdded = !_.isUndefined(_.find(vm.viewModel.WatchList, function (user) { return (user.Id == session.user.Id || user.BaseId == session.user.Id); }));
                    if (!isAdded) {
                        if (_.isUndefined(vm.viewModel.WatchList)) {
                            vm.viewModel.set("WatchList", []);
                        }
                        vm.viewModel.WatchList.push(session.user);

                    }

                    //notify user
                    var infoMessage = localizationHelper.localize(localization.AddMeToWatchListNotificationMessage, "{0} is added to the watchlist");
                    popupNotification.show({
                        message: infoMessage.replace("{0}", session.user.Name)
                    }, "info");
                },
                removeFromWatchList: function () {
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

                    var index = -1;

                    _.find(vm.viewModel.WatchList, function (user, i) {
                        if (user.Id == session.user.Id || user.BaseId == session.user.Id) {
                            index = i;
                            return user;
                        }
                    });

                    //remove current user from watchlist
                    if (index !== -1) vm.viewModel.WatchList.splice(index, 1);

                    //notify user
                    var infoMessage = localizationHelper.localize(localization.RemoveMeFromWatchListNotificationMessage, "{0} is removed from the watchlist");
                    popupNotification.show({
                        message: infoMessage.replace("{0}", session.user.Name)
                    }, "info");
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);

            //make sure we have all the node set
            var properties = {
                Target: "addMeToWatchList"
            };
            $.extend(true, properties, node);

            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());
        }
    }

    return definition;

});