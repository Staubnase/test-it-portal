/**
customFieldGroupRow
**/
define(function (require) {
    var tpl = require("text!structure/row/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            callback(tpl);
        }
    }

    return definition;

});