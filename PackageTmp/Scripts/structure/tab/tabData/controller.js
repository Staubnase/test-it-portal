/**
Tab data
**/
define(function (require) {
    var tpl = require("text!structure/tab/tabData/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }

            callback(built(node));
        }
    }

    return definition;

});
