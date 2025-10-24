/**
actionLog
**/

define(function (require) {
    var tpl = require("text!forms/predefined/actionLog/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set

            var properties = {
                Disabled: node.disabled ?? false
            };

            $.extend(true, properties, node);
            var view = built(properties);

            callback(view);
        }
    }

    return definition;

});