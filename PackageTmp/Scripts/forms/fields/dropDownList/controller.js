/**
COMBO - combobox
**/
define(function (require) {
    var tpl = require("text!forms/fields/dropDownList/view.html");
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }
            var viewModel = {
                PropertyName: node.PropertyName,
                PropertyDisplayName: node.PropertyDisplayName,
                DataSource: {},
                Required: _.isUndefined(node.Required) ? false : node.Required,
                Disabled: _.isUndefined(node.Disabled) ? false : node.Disabled,
                ControlObject: null
            };
            $.extend(true, viewModel, node);

            var view = new kendo.View(built(viewModel), { wrap: false, model: kendo.observable(viewModel) });
            callback(view.render());
        }
    }

    return definition;

});