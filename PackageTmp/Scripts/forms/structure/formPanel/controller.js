/**
Form Panel
**/
define(function (require) {
    var tpl = require("text!forms/structure/formPanel/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (callback) {
            var built = _.template(tpl);
            callback(built());
        }
    }

    return definition;

});