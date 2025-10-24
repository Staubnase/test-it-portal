/**
DOUBLE
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
                DecimalPlaces: 19,
                MinValue: '',
                MaxValue: '',
                StepIncrement: 1,
                Disabled: _.isUndefined(node.Disabled) ? node.disabled : node.Disabled,
                Required: _.isUndefined(node.Required) ? node.required : node.Required,
                Format:''
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});