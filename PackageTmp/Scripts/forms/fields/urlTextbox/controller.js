/**
URL TEXTBOX
**/

define(function (require) {
    var tpl = require("text!forms/fields/urlTextbox/view.html");

    var definition = {
        template: tpl,
        build: function (viewModel, node, callback) {

            var vm = node.vm;

            if (_.isUndefined(vm.view)) {
                vm.view = [];
            }

            vm.view.buildURLTextbox = function () {
                //build template using underscore.js so that we can interpret kendo template vars if needed
                var built = _.template(tpl);
                var regexp = new RegExp("^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$");

                var properties = {
                    Required: node.Required,
                    Disabled: node.disabled
                };

                $.extend(true, properties, node);
                var template = $(built(properties));

                var validateUrl = function (elem) {
                    var isOk = true;
                    const url = elem.val();
                    const link = elem.next();
                    if (url == "" || _.isNull(url)) {
                        isOk = false;
                        link.prop("disabled", true);
                    } else if (!regexp.test(url)) {
                        link.prop("disabled", true);
                        elem.attr('data-invalid', '');
                        isOk = false;
                    } else {
                        link.prop("disabled", false);
                        elem.removeAttr('data-invalid');
                    }
                    return isOk;
                }

                vm.textChange = function (e) {
                    const elem = $(e.currentTarget);
                    validateUrl(elem);
                }

                vm.openURL = function (e) {
                    const elem = $(e.event.currentTarget).prev();
                    if (validateUrl(elem)) {
                        let url = elem.val();
                        //append protocol if does not have one
                        if (!url.match(/^ftp|http([s]?):\/\/.*/)) {
                            url = 'http://' + url;
                        }
                        const win = window.open(url, '_blank');
                        win.focus();
                    }
                };

                const view = new kendo.View(template, { wrap: false, model: vm });
                callback(view.render());
            };
            vm.view.buildURLTextbox();
        }
    }
    return definition;
});
