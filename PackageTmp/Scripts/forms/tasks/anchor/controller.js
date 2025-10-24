/**
Anchor
**/

define(function (require) {
    var tpl = require("text!forms/tasks/anchor/view.html");
   

    var definition = {
        template: tpl,
        build: function (node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set
            var properties = {
            };

            $.extend(true, properties, node);

            var anchorElm = new kendo.View(built(properties), { wrap: false });
            callback(anchorElm.render());
        }
    }

    return definition;

});