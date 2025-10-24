/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");

    var definition = {
        build: function (vm, node, callback) {


            var viewModel = kendo.observable({
                changeStatus: function () {
                    $("input[name='" + node.Configs.relationshipKey + "']").parent().find(".searchIcon").click();
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "changeStatus",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

            


        }
    }

    return definition;

});