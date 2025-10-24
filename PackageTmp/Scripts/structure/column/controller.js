/**
column
**/
define(function (require) {
    var tpl = require("text!structure/column/view.html");

    //get and modfiy field html as needed

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var view = new kendo.View();

            node.view = {

                //set up controller methods and values
                controller: {
                    //content: vm.content,
                    colSize: 'col-md-' + node.ColSize,
                    title: !_.isUndefined(localization[node.title]) ? localization[node.title] : node.title,
                    hasTitle: !_.isUndefined(node.title)
                },
                buildView: function () {
                    //do we have a custom class
                    var customCls = _.isUndefined(node.customCls) ? "" : " " + node.customCls;

                    //do we have a container
                    var containerCls = _.isUndefined(node.containerCls) ? "" : " " + node.containerCls;

                    //add in classes to style panel
                    if (!_.isUndefined(node.type) && node.type == "panel") {
                        node.view.controller.contentClass = "panel-body" + customCls;
                        node.view.controller.containerClass = "panel panel-widget";
                        node.view.controller.titleClass = "panel-heading";
                    } else {
                        node.view.controller.contentClass = customCls;
                        node.view.controller.containerClass = containerCls;
                    }

                    //build template using underscore.js so that we can interpret kendo template vars if needed
                    var built = _.template(tpl);

                    view.destroy();
                    view = new kendo.View(built(), { wrap: false, model: node });
                    callback(view.render());
                }
            }

            node.view.buildView();
        }
    }
    return definition;
});