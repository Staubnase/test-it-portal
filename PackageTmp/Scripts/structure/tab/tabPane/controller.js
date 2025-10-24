/**
Tab pane
**/
define(function (require) {
    var tpl = require("text!structure/tab/tabPane/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built(node));
        }
    }

    return definition;

});
