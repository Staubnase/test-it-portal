/**
authTokenFlyout
**/

var __authTokenPopupSingleton;

define(function (require) {
    var tpl = app.isMobile() ? require("text!/scripts/forms/flyout/authTokenFlyout/mobile_view.html") : require("text!/scripts/forms/flyout/authTokenFlyout/view.html");
    var singletonName = "authTokenFlyout"; // used to call for singleton
    var definition = {
        template: tpl,
        getPopup: function (vm, task) {
            //only build the template if the popup singleton does not exist.
            var built = _.template(tpl);
            var ele = $(built());

            $("body").append(ele);
            __authTokenPopupSingleton = new authTokenPopup(vm, ele, task);

            return __authTokenPopupSingleton;
        }
    }

    // CONTROL
    var authTokenPopup = function (vm, targetEle, task) {
        var self = this;
        var html = targetEle;

        var _vmWindow, win;
        var loadedImages = [];
        // getter/setters        
        this.setSaveCallback = function (callback) {
            $(self).unbind("save")
                .bind("save", function (e, obj) { callback(obj); });
        }
        this.setCancelCallback = function (callback) {
            $(self).unbind("cancel")
                .bind("cancel", function (e, obj) { callback(obj); });
        }

        /*******************/
        /*** CONSTRUCT *****/
        /*******************/

        var __construct = function () {

            if (app.isMobile()) {
                win = html.kendoCiresonWindow({
                    title: localization.PlatformAuthenticationToken,
                    width: 650,
                    height: 740,
                    actions: []
                }).data("kendoWindow");
            }

            $.ajax({
                url: "platform/api/Me",
                type: "GET",
                dataType: "json",
                contentType: "application/json"
            }).then(function (result) {
                vm.set("CreatedBy", result);
                vm.set("PlatformTokenMessage", localization.PlatformTokenMessage);
            });
            
            _vmWindow = kendo.observable({
                vm: vm,
                save: function () {
                    app.lib.mask.apply();
                    var createParam = JSON.stringify({ Name: vm.TokenName, Expiration: vm.TokenExpirationDate, RequestedRoles: vm.CreatedBy.Roles }); 
                    if (vm.TokenExpirationDate == "") {
                        createParam = JSON.stringify({ Name: vm.TokenName, RequestedRoles: vm.CreatedBy.Roles }); 
                    }
                    $.ajax({
                        url: "/platform/api/CreateRemoteServiceToken",
                        data: createParam,
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        error: function (e) {
                            console.log(e)
                        },
                        success: function (result) {
                            vm.Token = result.value;
                            var dialogTemplate = require("text!/scripts/forms/flyout/authTokenFlyout/confirm_dialog_view.html");
                            if (app.isMobileDevice()) {
                                var dialogWindow = $(dialogTemplate).kendoCiresonWindow({
                                    title: localization.PlatformAuthenticationToken,
                                    width: 650,
                                    height: 740,
                                    activate: function (e) {
                                        e.sender.element.find("#tokenText").html(vm.Token);
                                        e.sender.element.find("#tokenMessage").html(localization.PlatformTokenMessage);
                                    },
                                    close: function (e) {
                                        location.reload();
                                    }
                                }).data("kendoWindow");

                                kendo.bind(dialogWindow, _vmWindow);
                                dialogWindow.open();
                            } else {
                                var dialog = $('#authTokenWindow-modal');
                                dialog.kendoDialog({
                                    modal: true,
                                    title: localization.PlatformAuthenticationToken,
                                    content: dialogTemplate,
                                    animation: {
                                        open: {
                                            effects: "fade:in"
                                        }
                                    },
                                    close: function (e) {
                                        location.reload();
                                    }
                                });
                                kendo.bind(dialog, _vmWindow);
                                dialog.data("kendoDialog").open();
                            }
                        }
                    });
                   
                    $(self).trigger("save");
                    _vmWindow.closeModal();
                },
                cancel: function() {
                    $(self).trigger("cancel");
                    _vmWindow.closeModal();
                },
                isDesktopView: !app.isMobileDevice(),
                isMobileView: app.isMobileDevice(),
                saveCancelBtn: (task),
                closeBtn: (!task),
                openModal: function () {
                    if (!app.isMobile())
                        html.modal('show');
                    else {
                        html.removeClass('hide');
                        html.show();
                        win.open();
                    }
                },
                closeModal: function() {
                    if (app.isMobile())
                        win.close();
                    else
                        html.modal('hide');
                },
                copyToClipboard: function (e) {
                    var copyText = document.getElementById("tokenText");
                    var $temp = $("<input>");

                    $("body").append($temp);
                    $temp.val($(copyText).html()).select();
                    document.execCommand("copy");
                    $temp.remove();

                    $(copyText).css("background-color", "lightgoldenrodyellow");
                }
            });
            kendo.bind(html, _vmWindow);

            if (!app.isMobile()) {

                html.on('shown.bs.modal',
                    function() {
                        //reposition modal backdrop
                        $('.modal-backdrop').each(function(i, obj) {
                            html.before(obj);
                        });

                        //remove modal focus so tools with popup would work
                        $(document).off('focusin.modal');
                    });

                html.on('hidden.bs.modal',
                    function() {
                        $('.modal-backdrop').remove();
                    });

            }

            self.open = _vmWindow.openModal;
            self.close = _vmWindow.closeModal;
            self.vm = _vmWindow;

        }

        __construct();
    }

    return definition;

});