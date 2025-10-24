/**
html
**/
define(function (require) {
    var tpl = require("text!viewPanels/html/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var view = new kendo.View();
            var viewModel = {
                view: {
                    //set up controller methods and values
                    controller: {
                        content: !_.isUndefined(node.Definition.content.content) ? node.Definition.content.content : node.Definition.content,
                    },

                    buildView: function () {
                        //build template using underscore.js so that we can interpret kendo template vars if needed
                        var built = _.template(tpl);

                        view.destroy();
                        view = new kendo.View(built(), { wrap: false, model: viewModel });
                        callback(view.render());
                    }
                }
            }
            viewModel.view.buildView();
        }
    }

    return definition;

});
