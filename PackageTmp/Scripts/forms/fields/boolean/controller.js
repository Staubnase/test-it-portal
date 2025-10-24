/**
BOOLEAN
**/

define(function (require) {
    var tpl = require("text!forms/fields/boolean/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set
            var properties = {
                Required: _.isUndefined(node.Required) ? node.required : node.Required,
                Disabled: _.isUndefined(node.Disabled) ? node.disabled : node.Disabled,
                Inline: node.Inline || false,
                visible: (!_.isUndefined(node.IsVisible) && node.IsVisible == false ? "hidden" : "")
        };
            
            

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});