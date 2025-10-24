/**
SPACER
**/

define(function (require) {
    var tpl = require("text!forms/fields/spacer/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set
            var properties = {
            };

            $.extend(true, properties, node);

            callback(built(properties));
        }
    }

    return definition;

});