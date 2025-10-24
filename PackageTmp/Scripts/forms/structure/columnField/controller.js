/**
columnField
**/
define(function (require) {
    var tpl = require("text!forms/structure/columnField/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built(node));
        }
    }

    return definition;

});