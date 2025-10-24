/**
Print Page
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    
    var definition = {
        build: function (vm, node, callback) {
            var built = _.template(anchor);

            //make sure we have all the node set
            var properties = {
                Target: "print"
            };

            $.extend(true, properties, node);

            var anchorElm = built(properties);

            var viewModel = kendo.observable({
                print: function () {
                    window.print();
                }
            });

            var view = new kendo.View(built(properties), { wrap: false, model: viewModel });
            callback(view.render());
        }
    }

    return definition;

});