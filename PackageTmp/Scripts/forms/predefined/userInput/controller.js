/**
userInput
**/

define(function (require) {
    var tpl = require("text!forms/predefined/userInput/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built(node));
        }
    }

    return definition;

});