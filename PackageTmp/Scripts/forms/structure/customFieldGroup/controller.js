/**
Custom Field Group
**/
define(function (require) {
    var tpl = require("text!forms/structure/customFieldGroup/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }

            if (!_.isUndefined(node.Visible) && !node.Visible) {
                return;
            }

            callback(built(node));
        }
    }

    return definition;

});