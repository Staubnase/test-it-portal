/**
content
**/
define(function (require) {
    var tpl = require("text!structure/content/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            var viewModel = {
                cssClass: node.cssClass
            };

            var view = new kendo.View(built(), { wrap: false, model: kendo.observable(viewModel) });

            callback(view.render());
        }
    }
    return definition;
});