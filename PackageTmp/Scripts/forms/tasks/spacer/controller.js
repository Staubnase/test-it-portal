/**
SPACER
**/

define(function (require) {
    var tpl = require("text!forms/tasks/spacer/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the node set
            var properties = {
            };

            $.extend(true, properties, node);
            var view = new kendo.View(built(properties), { wrap: false });
            callback(view.render());
        }
    }

    return definition;

});