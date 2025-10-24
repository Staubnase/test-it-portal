/**
DISPLAY
**/

define(function (require) {
    var tpl = require("text!forms/fields/display/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set
            var properties = {
                HideLabel: false
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});