/**
ENUM - dropDownTree
**/

define(function (require) {
    var tpl = require("text!forms/fields/enum2/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                EnumId: '',
                Required: node.Required,
                Disabled: node.disabled,
                LeafNodeOnly: false,
                ShowPath: false
            };

            $.extend(true, properties, node);
            var html = built(properties);
            callback(html);
        }
    }

    return definition;

});