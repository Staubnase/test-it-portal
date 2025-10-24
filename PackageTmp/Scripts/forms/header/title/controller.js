/**
Header Status
**/
define(function (require) {
    var tpl = require("text!forms/header/title/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            vm.title = (!_.isUndefined(localization[vm.type]) && [vm.type].length > 0) ? localization[vm.type] : vm.type;

            //set page <title>
            document.title = vm.title;

            var view = new kendo.View(built(), { wrap: false, model: vm });

            callback(view.render());
        }
    }

    return definition;

});
