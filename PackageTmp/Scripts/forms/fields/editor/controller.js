/**
EDITOR
**/
define(function (require) {
    var tpl = require("text!forms/fields/editor/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            boundObj = node.vm;
            //make sure we have all the vals set
            //document.write(JSON.stringify(boundObj));
            var properties = {
                Required: node.Required,
                Disabled: _.isUndefined(node.Disabled) ? node.disabled : node.Disabled,
                Content: (boundObj[node.PropertyName]) ? $('<div/>').text(boundObj[node.PropertyName]).html() : boundObj[node.PropertyName],
                Height: node.Height == null ? 440 : node.Height
            };

            $.extend(true, properties, node);

            var templateFrag = $(built(properties));

            new Control(templateFrag.find("[data-control='editor']"), boundObj, node);
            // get settings from attrs
            callback(templateFrag);
        }
    }


    var Control = function (targetEle, boundObj, node) {
        if (node.Options == null) {
            var defaultTools = [
                    "bold", "italic", "underline", "strikethrough",
                    "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
                    "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                    "createLink", "unlink", "insertImage",
                    "superscript", "subscript",
                    "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn",
                    "viewHtml",
                    "formatting", "foreColor", "backColor"
            ];
            var mobileTools = [
                "formatting",
                "createLink", "unlink", "insertImage","viewHtml",
                "bold", "italic", "underline",
                "insertUnorderedList", "insertOrderedList", "indent", "outdent",
                "createTable", "addColumnLeft", "addColumnRight", "addRowAbove", "addRowBelow", "deleteRow", "deleteColumn"
            ];
            node.Options = app.isMobileDevice() ? mobileTools : defaultTools;
        }
        var boundObj = boundObj;
        //Need to review
        setTimeout(function () {
            targetEle.kendoEditor({
                change: function (e) {
                    boundObj.set(node.PropertyName, targetEle.val());
                },
                tools: node.Options,
                encoded: false,
                stylesheets: [
                    "/Content/Styles/cireson.main.min.css?v=" + session.staticFileVersion
                ]
            });
            var editor = targetEle.data("kendoEditor");
            boundObj.bind("change", function (e) {
                editor.value(boundObj[node.PropertyName]);
            });
            $(editor.body).addClass("k-editor-content-body");

            //disable toolbar and text area when editor is tagged as disabled
            if (node.Disabled) {
                //selectboxes
                $('[data-role=selectbox]', editor.toolbar.element)
                    .getKendoSelectBox()
                    .enable(false);

                //comboboxes
                $('[data-role=combobox]', editor.toolbar.element).each(function () {
                    $(this).getKendoComboBox().enable(false);
                });

                //pickers
                $('[data-role=colorpicker]', editor.toolbar.element).each(function () {
                    $(this).getKendoColorPicker().enable(false);
                });

                //buttons
                $('.k-button', editor.toolbar.element).each(function () {
                    console.log($(this).kendoButton().data("kendoButton"))
                    console.log("button", $(this).getKendoButton())
                    $(this).kendoButton().data("kendoButton").enable(false);
                });
                $('.k-button', editor.toolbar.element).removeClass('k-state-disabled');
                
                //text area
                editor.body.contentEditable = false;
                editor.body.css('visibility', enable ? 'visible' : 'hidden');
            }

        }, 100);
    }

    return definition;

});