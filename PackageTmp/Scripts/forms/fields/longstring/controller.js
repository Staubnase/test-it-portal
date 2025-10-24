/**
LONGSTRING
**/

define(function (require) {
    var tpl = require("text!forms/fields/longstring/view.html");

    var definition = {
        template: tpl,
        build: function (viewModel, node, callback) {
            var vm = node.vm;
            var view = new kendo.View();

            if (_.isUndefined(vm.view)) {
                vm.view = [];
            }
            vm.view.longStringController = {
                CheckLength: function checkLength(e) { //blur event
                    setTimeout(function () {
                        var elem = $(e.currentTarget);
                        var helpBlock = elem.next();
                        var maxChars = elem.attr('maxlength');
                        var count = elem.val().length;
                        if (count > maxChars) {
                            elem.attr('data-invalid', '');
                            helpBlock.show();
                        } else {
                            helpBlock.hide();
                            elem.removeAttr('data-invalid');
                            elem.data('prevent', false);
                        }
                    }, 100);
                }
            };
            vm.view.buildLongStringView = function () {
                //build template using underscore.js so that we can interpret kendo template vars if needed
                var built = _.template(tpl);
                var limitLength = false;
                if (!_.isUndefined(node.MinLength) || !_.isUndefined(node.MaxLength)
                    || !_.isUndefined(node.minLength) || !_.isUndefined(node.maxLength)) {
                    limitLength = true;
                };
                
                var properties = {
                    Required: _.isUndefined(node.Required) ? node.required : node.Required,
                    Disabled: _.isUndefined(node.Disabled) ? node.disabled : node.Disabled,
                    MinLength: _.isUndefined(node.MinLength) ? node.minLength : node.MinLength,
                    MaxLength: _.isUndefined(node.MaxLength) ? node.maxLength : node.MaxLength,
                    LimitLength: limitLength,
                    Rows: 10,
                    visible: (!_.isUndefined(node.IsVisible) && node.IsVisible == false ? "hidden" : "")
                };
                $.extend(true, properties, node);
                //console.log(properties);
                view = new kendo.View(built(properties), { wrap: false, model: vm });
                callback(view.render());
            };
            vm.view.buildLongStringView();
        }
    }

    return definition;
});
