/**
STRING
**/

define(function (require) {
    var tpl = require("text!forms/fields/string/view.html");


    var definition = {

        template: tpl,
        build: function (viewModel, node, callback) {
            
            var vm = node.vm;
            var view = new kendo.View();

            if (_.isUndefined(vm.view)) {
                vm.view = [];
            }
            vm.view.stringController = {
                CheckLength: function CheckLength(e) { //blur event
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

            vm.view.buildStringView = function () {
                //build template using underscore.js so that we can interpret kendo template vars if needed
                var built = _.template(tpl);
                var limitLength = false;
                if (!_.isUndefined(node.MinLength) || !_.isUndefined(node.MaxLength)
                    || !_.isUndefined(node.minLength) || !_.isUndefined(node.maxLength)) {
                    limitLength = true;
                };

                var properties = {
                    Required: node.Required,
                    Disabled: node.disabled,
                    MinLength: node.MinLength,
                    MaxLength: node.MaxLength,
                    LimitLength: limitLength
                };
                $.extend(true, properties, node);
                
                view = new kendo.View(built(properties), { wrap: false, model: vm });
                callback(view.render());
            };
            vm.view.buildStringView();
        }
    }

    return definition;

});
