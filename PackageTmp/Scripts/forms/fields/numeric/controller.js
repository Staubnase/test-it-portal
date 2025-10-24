/**
NUMERIC
**/

define(function (require) {
    var tpl = require("text!forms/fields/numeric/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                Required: node.Required,
                DecimalPlaces: 2,
                MinValue: 0,
                MaxValue: 100,
                StepIncrement: 1,
                Disabled: node.disabled,
                Format: ''
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});