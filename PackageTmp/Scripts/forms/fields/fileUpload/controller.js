/**
STRING
**/

define(function (require) {
    var tpl = require("text!forms/fields/fileUpload/view.html");


    var definition = {

        template: tpl,
        build: function (viewModel, node, callback) {
            
            var vm = node.vm;
            var view = new kendo.View();

            if (_.isUndefined(vm.view)) {
                vm.view = [];
            }

            
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);
            var properties = {
                Required: node.Required,
                BaseId: vm.BaseId,
                AcceptExtension: _.isUndefined(node.AcceptExtension) ? "" : vm.AcceptExtension
            };
            $.extend(true, properties, node);

            var template = $(built(properties));

            var viewModel = new kendo.observable({
                isEnabled: true,
                isVisible: true,
                onSelect: function (e) {
                    template.find(".k-file-error").remove();
                    $.each(e.files, function (index, value) {
                        if (!_.isUndefined(node.AcceptExtension)
                            && node.AcceptExtension!=""
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
                complete: function (e) {
                    if (template.find(".k-file").length > 1) {
                        template.find(".k-file:first").remove();
                        
                    }
                },
                success: function (e) {
                    var img = template.find("img");
                    img.attr("src", "data:image/png;base64," + e.response);
                    vm[node.PropertyName] = {
                        "streamId": null,
                        "data": "stream",
                        "bufferedMode": true,
                        "streamLength": 0
                    };

                    template.find("#div" + node.PropertyName).show();
                },
                onRemove: function (e) {
                    $.get("/FileAttachment/RemoveFileUpload/", { BaseId: vm.BaseId, fieldName: node.PropertyName }, function (data) {
                        template.find(".k-file").parent().remove();
                        //template.find("img").hide();
                        template.find("#div" + node.PropertyName).hide();
                        vm[node.PropertyName] = null;
                    });
                }
            });

            $.get("/api/V3/Projection/GetBase64String", { BaseId: vm.BaseId, PropertyName: node.PropertyName }, function (data) {
                var img = template.find("#div" + node.PropertyName);
                if (data != "") {
                    template.find("img").attr("src", "data:image/png;base64," + data);
                    img.show();
                } else {
                    img.hide();
                }
            });
            

            _.defer(function () { kendo.bind(template, viewModel); });
            callback(template);


        }
    }

    return definition;

});
