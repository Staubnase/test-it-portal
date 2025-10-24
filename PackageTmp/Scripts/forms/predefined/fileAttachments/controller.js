/**
fileAttachments
**/

define(function (require) {
    var tpl = require("text!forms/predefined/fileAttachments/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }


            var properties = {
                Disabled: node.disabled
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});