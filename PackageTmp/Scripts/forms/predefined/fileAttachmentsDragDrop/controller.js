/**
fileAttachmentsDragDrop
**/

define(function (require) {
    var tpl = require("text!forms/predefined/fileAttachmentsDragDrop/view.html");
   
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            const uploadId = "files" + app.lib.generateRandomString();
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }
            
            //get file content for images
            if (!_.isUndefined(vm.FileAttachment) && vm.FileAttachment.length > 0) {
                _.each(vm.FileAttachment, function (file) {
                    if (file.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && _.isNull(file.Content.data)) {
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: "/FileAttachment/GetFileContentInThumbnail/",
                            data: { id: file.BaseId },
                            success: function (data) {
                                file.Content.data = data;
                            }
                        });
                    }

                    //assign null values to missing addedby field
                    if (_.isUndefined(file.AddedBy)) {
                        file.AddedBy = { Id: null, DisplayName: "" }
                    }
                });
            }

            var properties = {
                randStr: uploadId,
                Required: node.Required,
                BaseId: vm.BaseId,
                AcceptExtension: _.isUndefined(node.AcceptExtension) ? "" : vm.AcceptExtension,
                ClassName: vm.ClassName,
                Disabled: false,
                MaxFileCount: 0
            };
            $.extend(true, properties, node);

            //get max file attachment allowed
            $.ajax({
                type: "GET",
                url: "/FileAttachment/GetMaxFileAttachment/",
                data: { className: vm.ClassName },
                success: function (data) {
                    properties.MaxFileCount = data.MaxCount
                }
            });


            var template = $(built(properties));
            var loadedImages = [];
            
            var viewModel = new kendo.observable({
                isDesktop: !app.isMobile(),
                isMobile: app.isMobile(),
                isEnabled: true,
                isVisible: !vm.isDisabled,
                onSelect: function (e) {
                    template.find(".k-file-error").remove();
                    $.each(e.files, function (index, value) {
                        if (!_.isUndefined(node.AcceptExtension)
                            && node.AcceptExtension != ""
                            && !(node.AcceptExtension.toLowerCase().indexOf(value.extension.toLowerCase()) > -1)) {
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.ErrorDescription,
                                message: localization.FileExtensionInvalid + node.AcceptExtension,
                                icon: "fa fa-exclamation"
                            });
                            e.preventDefault();
                        }
                    });
                },
                onUploadSuccess: function (e) {
                    var vmFiles = !_.isUndefined(vm.FileAttachment) ? vm.FileAttachment : [];
                    var response = e.response;
                    
                    if (e.operation == "upload") {
                        for (var i = 0; i < e.files.length; i++) {
                            var file = e.files[i].rawFile;
                            if (file) {
                                if (!_.isUndefined(response.FileAttachment)) {
                                    var f = _.filter(vm.FileAttachment,
                                        function(el) {
                                            return el.Content.data === response.FileAttachment.Content.data && el.BaseId === response.FileAttachment.BaseId;
                                        });
                                    if (f.length === 0) {
                                        if (vm.FileAttachment.length < properties.MaxFileCount) {
                                            vm.FileAttachment.unshift(response.FileAttachment); //save to viewModel
                                            var actionLogName = app.controls.getWorkItemLogType(vm);
                                            if (actionLogName) { // add  action log entry for adding file
                                                boundObj[actionLogName].unshift(new app.dataModels[actionLogName].fileAdded(response.FileAttachment.DisplayName));
                                            }
                                        }
                                    }
                                        
                                } else if (!_.isUndefined(response.success) && response.success == false) {
                                    kendo.ui.ExtAlertDialog.show({
                                        title: localization.ErrorDescription,
                                        message: response.message,
                                        icon: "fa fa-exclamation"
                                    });
                                }
                            }
                        }
                    }
                },
                onUploadError: function (e) {     
                    var err = $.parseJSON(e.XMLHttpRequest.responseText);
                    $.map(e.files, function (file) {
                        console.warn("Could not upload " + file.name);
                    });
                },
                onRemove: function (e) {
                    $.get("/FileAttachment/RemoveFileUpload/", { BaseId: vm.BaseId, fieldName: node.PropertyName }, function (data) {
                        template.find(".k-file").parent().remove();
                        //template.find("img").hide();
                        template.find("#div" + node.PropertyName).hide();
                        vm[node.PropertyName] = null;
                    });
                },
                onOpenFile: function (el) {
                    var dialogOrig = $('.fileattachment-img-modal');
                    var dialog = dialogOrig.clone();
                    var downloadUrl = app.config.rootURL + "FileAttachment/ViewFile/";
                    var listView = template.find(".fileattachment-list").data("kendoListView");
                    var item = el.closest("[role='option']");
                    var dataItem = listView.dataSource.getByUid(item.data("uid"));

                    

                    function openFile() {
                        app.lib.mask.remove();
                        if (el.hasClass("opennewtab")) { //open on a new tab
                            var win = window.open('about:blank');
                            setTimeout(function () { //FireFox seems to require a setTimeout for this to work.
                                win.document.body.appendChild(win.document.createElement('img')).src = "data:image/jpg;base64," + dataItem.Content.data;
                                win.href = "data:image/jpg;base64," + dataItem.Content.data;
                                win.focus();
                            }, 0);

                        }
                        else {
                            if (dataItem.DisplayName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) && !el.hasClass("download")) { //open on a preview dialog
                                dialog.kendoDialog({
                                    modal: true,
                                    title: dataItem.DisplayName,
                                    content: "<div class='file-img-container'><img src=\"data:image/jpg;base64," + dataItem.Content.data + "\" onerror=\"this.onerror = null; this.src = '/Content/Images/Icons/FileUpload/document.svg';\" alt=\"" + dataItem.DisplayName + "\" /></div>",
                                    animation: {
                                        open: {
                                            effects: "fade:in"
                                        }
                                    },
                                    show: function (e) {
                                    },
                                    close: function (e) {
                                        dialog.remove();
                                    }
                                });


                                dialog.parent().css("position", "fixed");
                                dialog.data("kendoDialog").open();



                                //close preview window on overlay click
                                $('.k-overlay').on("click", function () {
                                    dialog.data("kendoDialog").close();
                                });

                            } else { //download file
                                if (!_.isNull(dataItem.BaseId)) {
                                    location.href = downloadUrl + dataItem.BaseId;
                                } else {
                                    if (dataItem.Content.data) {
                                        var fileName = dataItem.DisplayName;
                                        var a = document.createElement("a");
                                        document.body.appendChild(a);
                                        a.style = "display: none";

                                        a.href = "data:application/octet-stream;charset=utf-16le;base64," + dataItem.Content.data;
                                        a.download = fileName;
                                        a.click();
                                        document.body.removeChild(a);
                                    }
                                }

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

                                //dataItem.Content.data
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
            });

            var fileUploadCount = 0;
            _.defer(function () {
                kendo.bind(template, viewModel);
                template.find(".fileattachment-list").kendoListView({
                    dataSource: vm.FileAttachment.sort(function (a, b) { return new Date(b.AddedDate) - new Date(a.AddedDate) }),
                    template: kendo.template($("#fileTemplate").html()),
                    selectable: "single",
                    //change: viewModel.onOpenFile,
                    dataBound: function () {
                        template.find(".custom-click").on("click", function () {
                            viewModel.onOpenFile($(this));
                        });

                        if (!app.isMobile()) {
                            //Remove view image icon if not in mobile.
                            template.find("a[view-image]").parent().hide();

                            template.find(".thumbnail-img").on("click", function () {
                                viewModel.onOpenFile($(this));
                            });
                        }
                        
                    },
                    remove: function (e) {
                        var actionLogName = app.controls.getWorkItemLogType(vm);
                        if (actionLogName) { // add  action log entry for removing file
                            boundObj[actionLogName].unshift(new app.dataModels[actionLogName].fileRemoved(e.model.DisplayName));
                        }
                    }
                });

                var bUploadExceeded = false;
                $("#" + uploadId).kendoUpload({
                    async: {
                        saveUrl: "/FileAttachment/UploadAttachment/" + vm.BaseId + "?className=" + vm.ClassName + "&count=" + vm.FileAttachment.length + "&saveFile=false", // Added count parameter JohnD/ShaneW 2020-12-18
                        removeUrl: "remove",
                        autoUpload: true
                    },
                    select: function (e) {
                        fileUploadCount = e.files.length;
                    },
                    complete: function (e) {
                        if ((fileUploadCount + vm.FileAttachment.length) > properties.MaxFileCount) {
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.ErrorDescription,
                                message: localization.MaxFileAttachments + " " + properties.MaxFileCount,
                                icon: "fa fa-exclamation"
                            });
                        }
                    },
                    success:  viewModel.onUploadSuccess,
                    error: viewModel.onUploadError,
                    showFileList: false,
                    dropZone: ".drop-zone-element",
                    multiple: true
                });

                $(".browse-file").off('click').on('click', function () {
                    $("#" + uploadId).trigger("click");
                });

                // This code was added to override the default behaviour of the Kendo Upload widget which is Move in Chrome.
                // This causes emails to be deleted from Outlook when dragged into the portal. J.Doyle 2020
                $(".drop-zone-element").on('dragover', handleDragOver);

                function handleDragOver(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.originalEvent.dataTransfer.dropEffect = 'copy';
                };
            });
            callback(template);
        }
    }

    return definition;

});