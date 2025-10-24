/**
DECIMAL
**/

define(function (require) {
    var tpl = require("text!forms/fields/numeric/view.html"); //use numeric template
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                //Required: false,
                DecimalPlaces: 2,
                MinValue: '',
                MaxValue: '',
                StepIncrement: 0.01,
                Disabled: node.disabled,
                Required: node.Required,
                Format: "P0"
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});