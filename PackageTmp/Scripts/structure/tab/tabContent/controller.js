/**
Tab List
**/
define(function (require) {
    var tpl = require("text!structure/tab/tabContent/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built(node));
        }
    }

    return definition;

});