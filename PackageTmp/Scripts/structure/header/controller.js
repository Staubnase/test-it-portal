/**
Header heading
**/
define(function (require) {
    var tpl = require("text!structure/header/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //modify vm for this view
            node.view = {};
            if (!_.isUndefined(node.title)) {
                node.view.title = !_.isUndefined(localization[node.title]) ? localization[node.title] : node.title;
                //set page <title>
                document.title = node.view.title;
            }
            if (!_.isUndefined(node.subTitle)) {
                node.view.subTitle = !_.isUndefined(localization[node.subTitle]) ? localization[node.subTitle] : node.subTitle;
            }

            if (!_.isUndefined(node.right)) {
                node.view.hasRight = true;
                node.view.right = {
                    value: node.right.someVal
                };
            } else {
                node.view.hasRight = false;
            }

            var view = new kendo.View(built(), { wrap: false, model: node });

            callback(view.render());
        }
    }

    return definition;

});
