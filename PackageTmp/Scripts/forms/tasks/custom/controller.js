/**
Custom
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
   

    var definition = {
        //template: tpl,
        build: function (vm, node, callback) {
            if (_.isNull(node.Label)) {
                //if no label (achot no link, just call the function)
                node.Configs.func(vm, vm.viewModel);

            } else {
                //first add the anchor
                var link = _.template(anchor);

                //make sure we have all the node set
                var properties = {
                    Target: "customFunc"
                };

                $.extend(true, properties, node);

                //create view model 
                var viewModel = kendo.observable({
                    //call custom defined function
                    customFunc: function () {
                        node.Configs.func(vm, vm.viewModel);
                    }
                });

                var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel });
                callback(anchorElm.render());
            }

        }
    }

    return definition;

});