/* global define: true */
/* global _:true */

(function () {

    'use strict';

    define([
        'app'
    ], function(app) {
        app.factory("notificationService", ['$timeout', NotificationService]);

        function NotificationService($timeout) {

            var activeNotifications = [];
            var inactiveNotifications = [];

            return {
                NOTIFICATION_TYPE: {
                    INFO: "INFO",
                    SUCCESS: "SUCCESS",
                    WARNING: "WARNING",
                    DANGER: "DANGER"
                },
                add: function (notification) {
                    var me = this;
                    var i = -1;

                    if (activeNotifications.length > 0) {
                        i  = _.find(activeNotifications, function (el) {
                            return el.text == notification.text;
                        });
                    }
                    
                    if (i == -1) activeNotifications.push(notification);

                    if (!notification.pinned) {
                        var displaySeconds = (notification.displaySeconds || 5) * 1000;
                        $timeout(function () {
                            me.remove(notification);
                        }, displaySeconds);
                    }
                },
                remove: function (notification) {
                    activeNotifications = _.without(activeNotifications, notification);
                    inactiveNotifications.push(notification);
                },
                addError: function (text) {
                    this.add({
                        title: "Error",
                        text: text,
                        type: "DANGER",
                        pinned: true
                    });
                },
                getActiveNotifications: function () {
                    return activeNotifications;
                },
                getInactiveNotifications: function () {
                    return inactiveNotifications;
                },
                getNotificationClass: function (notification) {
                    var cssClass = "";
                    if (notification) {
                        switch (notification.type) {
                            case this.NOTIFICATION_TYPE.INFO:
                                cssClass = "alert-info";
                                break;
                            case this.NOTIFICATION_TYPE.SUCCESS:
                                cssClass = "alert-success";
                                break;
                            case this.NOTIFICATION_TYPE.WARNING:
                                cssClass = "alert-warning";
                                break;
                            case this.NOTIFICATION_TYPE.DANGER:
                                cssClass = "alert-danger";
                                break;
                            default:
                                cssClass = "alert-info";
                                break;
                        }
                    }

                    return cssClass;
                }
            };
        }

    });
})();