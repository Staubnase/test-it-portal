/**
COMBO - combobox
**/
define(function (require) {
    var tpl = require("text!forms/fields/combo/view.html");
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
                PropertyName: _.isUndefined(node.PropertyName) ? node.propertyName : node.PropertyName,
                PropertyDisplayName: _.isUndefined(node.PropertyDisplayName) ? node.propertyDisplayName : node.PropertyDisplayName,
                DataSource: {},
                IsCascading: _.isUndefined(node.IsCascading) ? false : node.IsCascading,
                Cascade: {},
                Required: _.isUndefined(node.Required) ? false : node.Required,
                Disabled: _.isUndefined(node.Disabled) ? false : node.Disabled,
                ControlObject: null,
                serverFiltering: _.isUndefined(node.serverFiltering) ? false : node.serverFiltering,
                pageSize: _.isUndefined(node.pageSize) ? 1000 : node.pageSize,
            };
            $.extend(true, viewModel, node);

            var view = new kendo.View(built(viewModel), { wrap: false, model: kendo.observable(viewModel) });
            callback(view.render());
        }
    }

    return definition;

});