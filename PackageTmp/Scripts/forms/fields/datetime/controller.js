/**
DATETIME
**/

define(function (require) {
    var tpl = require("text!forms/fields/datetime/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                FromFilter: '',
                ToFilter: '',
                FromRelative: '',
                ToRelative: '',
                Disabled: _.isUndefined(node.Disabled) ? node.disabled : node.Disabled,
                Required: _.isUndefined(node.Required) ? node.required : node.Required
            };

            //set from filter
            if (typeof node.MinValue == "string") {
                if (node.MinValue.indexOf(":") != -1) {
                    properties.FromRelative = node.MinValue;
                } else {
                    properties.FromFilter = node.MinValue;
                }
            }

            //set to filter
            if (typeof node.MaxValue == "string") {
                if (node.MaxValue.indexOf(":") != -1) {
                    properties.ToRelative = node.MaxValue;
                 } else {
                    properties.ToFilter = node.MaxValue;
                 }
            }

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});