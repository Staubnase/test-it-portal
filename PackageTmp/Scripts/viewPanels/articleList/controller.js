/**
articleList
**/
define(function (require) {
    var tpl = require("text!viewPanels/articleList/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var config = node.Definition;

            var model = kendo.observable({
                viewModel: {
                    label: !_.isUndefined(config.label) ? localizationHelper.localize(config.label, config.label) : "",
                    type: config.type,
                    count: config.count,
                    articles: new kendo.data.ObservableArray([])
                }
            });
            
            //build it
            var built = _.template(tpl);
            var view = new kendo.View(built(), { wrap: true, model: model });
            callback(view.render());
        }
    }

    return definition;

});
