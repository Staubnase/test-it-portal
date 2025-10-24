/**
Date
**/

define(function (require) {
    var tpl = require("text!forms/fields/date/view.html");


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
            if (node.MinValue != undefined) {
                if (node.MinValue.indexOf(":") != -1) {
                    properties.FromRelative = node.MinValue;
                } else if (typeof node.MinValue == "string") {
                    properties.FromFilter = node.MinValue;
                }
            }

            //set to filter
            if (node.MaxValue != undefined) {
                if (node.MaxValue.indexOf(":") != -1) {
                    properties.ToRelative = node.MaxValue;
                } else if (typeof node.MaxValue == "string") {
                    properties.ToFilter = node.MaxValue;
                }
            }

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});