/**
Tab navigation
**/
define(function (require) {
    var tpl = require("text!structure/tab/tabNavigation/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built());
        }
    }

    return definition;

});
