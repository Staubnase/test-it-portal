/**
fileAttachmentsFlyout
**/

var __fileAttachmentsPopupSingleton;

define(function (require) {
    var tpl = app.isMobile() ? require("text!/scripts/forms/flyout/fileAttachmentsFlyout/mobile_view.html") : require("text!/scripts/forms/flyout/fileAttachmentsFlyout/view.html");
    var singletonName = "fileAttachmentsFlyout"; // used to call for singleton
    var definition = {
        template: tpl,
        getPopup: function (vm, task) {
            //only build the template if the popup singleton does not exist.
            var built = _.template(tpl);
            var ele = $(built());

            $("body").append(ele);
            __fileAttachmentsPopupSingleton = new FileAttachmentsPopup(vm, ele, task);

            return __fileAttachmentsPopupSingleton;
        }
    }

    // CONTROL
    var FileAttachmentsPopup = function (vm, targetEle, task) {
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
                    title: localization.FileAttachments,
                    width: 650,
                    height: 740,
                    actions: []
                }).data("kendoWindow");
            }

            _vmWindow = kendo.observable({
                save: function () {


                    app.lib.mask.apply();
                    _.defer(function () {
                        _.each(_vmWindow.selectedFiles, function (fileItem) {
                            //If selected file is not image.
                            if (fileItem.Content.data == null)
                            {
                                app.lib.mask.remove();
                                return;
                            }
                       
                                //This will load the actual image size from the server.
                                var listExist = _.filter(loadedImages, function (item) { return item.id == fileItem.BaseId });
                                if (listExist.length <= 0) {
                                    $.ajax({
                                        type: "GET",
                                        async: false,
                                        url: "/FileAttachment/GetFileContent/",
                                        data: { id: fileItem.BaseId }
                                    }).then(function (data) {
                                        if (data != "") {
                                            loadedImages.unshift({ id: fileItem.BaseId, img: data });
                                            fileItem.Content.data = data;
                                        }
                                        app.lib.mask.remove();
                                    });
                                }
                                else {
                                    app.lib.mask.remove();
                                }

                        
                        
                        });
                    });

                    
                    

                    $(self).trigger("save", { selectedFiles: _vmWindow.selectedFiles });
                    _vmWindow.closeModal();
                },
                cancel: function() {
                    $(self).trigger("cancel");
                    _vmWindow.closeModal();
                },
                isDesktopView: !app.isMobileDevice(),
                isMobileView: app.isMobileDevice(),
                selectedFiles: [],
                onOpenFile: function(e) {
                    var data = this.dataSource.view();

                    _vmWindow.selectedFiles = $.map(this.select(),
                        function(item) {
                            return data[$(item).index()];
                        });
                },
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
                selectFile: function (el, isImage) {
                    
                    var listView = html.find(".fileattachment-list").data("kendoListView");
                    var item = el.closest("[role='option']");
                    var dataItem = listView.dataSource.getByUid(item.data("uid"));

                    if (isImage && task == "sendEmail") return;

                    action = el.attr("action");
                    if (action === "download") {
                        var downloadUrl = app.config.rootURL + "FileAttachment/ViewFile/";
                        location.href = downloadUrl + dataItem.BaseId;
                    } else {
                        function openFile() {
                            app.lib.mask.remove();
                            if (action === "opennewtab") {
                                var win = window.open('about:blank');
                                setTimeout(function () { //FireFox seems to require a setTimeout for this to work.
                                    win.document.body.appendChild(win.document.createElement('img')).src = "data:image/jpg;base64," + dataItem.Content.data;
                                    win.href = "data:image/jpg;base64," + dataItem.Content.data;
                                    win.focus();
                                }, 0);


                            } else {

                                var dialog = $('.fileattachment-img-modal');

                                if (dialog.length > 1) {
                                    for (var i = 1; i < dialog.length; i++) {
                                        if ($(dialog[i]).data("kendoDialog"))
                                            $(dialog[i]).data("kendoDialog").destroy();
                                        dialog.eq(i).remove();
                                    }
                                }

                                if (dataItem) {

                                    var dialogs = $('.acivity-popup-window');
                                    if (dialogs.length > 1) {
                                        for (var i = 1; i < dialogs.length; i++) {
                                            dialogs.eq(i).remove();
                                        }
                                    }

                                    dialog.kendoDialog({
                                        modal: true,
                                        title: dataItem.DisplayName,
                                        content: "<div class='file-img-container'><img src=\"data:image/jpg;base64," +
                                            dataItem.Content.data +
                                            "\" onerror=\"this.onerror = null; this.src = '/Content/Images/Icons/FileUpload/document.svg';\" alt=\"" +
                                            dataItem.DisplayName +
                                            "\" /></div>",
                                        animation: {
                                            open: {
                                                effects: "fade:in"
                                            }
                                        }
                                    });
                                    
                                    dialog.data("kendoDialog").open();

                                    //close preview window on overlay click
                                    $('.k-overlay').on("click", function () {
                                        dialog.data("kendoDialog").close();
                                    });
                                }
                            }
                        }


                        app.lib.mask.apply();
                        _.defer(function () {
                            //This will load the actual image size from the server.
                            var listExist = _.filter(loadedImages, function (item) { return item.id == dataItem.BaseId });
                            if (listExist.length <= 0) {
                                $.ajax({
                                    type: "GET",
                                    async: false,
                                    url: "/FileAttachment/GetFileContent/",
                                    data: { id: dataItem.BaseId }
                                }).then(function (data) {
                                    if (data == "") {
                                        openFile();
                                    }
                                    else {
                                        loadedImages.unshift({ id: dataItem.BaseId, img: data });
                                        dataItem.Content.data = data;
                                        openFile();
                                    }
                                });
                            }
                            else {
                                openFile();
                            }
                        });
                        
                        
                    }

                    
                    
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

            html.find(".fileattachment-list").kendoListView({
                dataSource: vm.viewModel.FileAttachment.sort(function (a, b) { return new Date(b.AddedDate) - new Date(a.AddedDate) }),
                template: kendo.template($("#filesTemplate").html()),
                selectable: (task) ? "multiple" : "single",
                change: _vmWindow.onOpenFile,
                dataBound: function () {
                    //Remove view image icon if from send email.
                    if (task == undefined && task != "sendEmail") {
                        html.find("a[view-image]").parent().hide();
                    }

                    html.find(".custom-click").on("click", function () {
                        _vmWindow.selectFile($(this), false);
                    });

                    if (!app.isMobile()) {
                        html.find(".thumbnail-img img").on("click", function () {
                            _vmWindow.selectFile($(this), true);
                        });
                    }
                }
            });
        }

        __construct();
    }

    return definition;

});