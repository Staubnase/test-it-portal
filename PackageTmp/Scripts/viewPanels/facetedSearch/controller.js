/**
Faceted search
**/
define(function (require) {
    var tpl = require("text!viewPanels/facetedSearch/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            var viewModel = {
                SearchPlaceholder: node.Definition.SearchPlaceholder,
                textField: node.Definition.TextField,
                selectedSearchResult: null,
            };

            var view = new kendo.View(built(), { wrap: false, model: kendo.observable(viewModel) });
            callback(view.render());

        }
    }

    return definition;

});
