/**
Tab navigation
**/
define(function (require) {
    var dtpl = require("text!forms/structure/tabNavigation/view.html");
    var mtpl = require("text!forms/structure/tabNavigation/mobile.html");
    
    var tpl = (app.isMobile()) ? mtpl : dtpl;

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            callback(built());
        }
    }

    return definition;

});
