/**
BUTTON
**/

define(function (require) {
    var tpl = require("text!forms/fields/button/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                PropertyName: 'defaultButton',
                ButtonType: (node.ButtonType) ? node.ButtonType : 'default',
                ButtonSize: (node.ButtonSize) ? node.ButtonSize : 'sm',
                Disabled: node.disabled
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});