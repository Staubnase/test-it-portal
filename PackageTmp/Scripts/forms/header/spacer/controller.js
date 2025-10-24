/**
Header Spacer
**/
define(function (require) {
    var tpl = require("text!forms/header/spacer/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //modify vm for this view

            var view = new kendo.View(built(), { model: vm });

            callback(view.render());
        }
    }

    return definition;

});
