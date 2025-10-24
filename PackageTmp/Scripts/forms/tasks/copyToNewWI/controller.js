/**
Copy To New Workitem
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
   

    var definition = {
        //template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(anchor);
            

            //make sure we have all the node set
            var properties = {
                Target: "copyToNewWI"
            };

            $.extend(true, properties, node);

            var anchorElm = built(properties);

            var viewModel = kendo.observable({
                copyToNewWI: function () {
                    var hiddenVm;
                    var copy;
                    copy = $("<form>", { "method": "post", "target": "_blank" });
                    hiddenVm = $("<input>", { "type": "hidden", "name": "vm" });
                    copy.append(hiddenVm);
                    $("body").append(copy);
                    hiddenVm.val(JSON.stringify(vm.viewModel));
                    if (vm.type == "Incident")
                        copy.attr("action", "/Incident/New/");
                    if (vm.type == "ServiceRequest")
                        copy.attr("action", "/ServiceRequest/New/");
                    copy.submit();
                    copy.remove();
                }
            });

            var view = new kendo.View(built(properties), { wrap: false, model: viewModel });
            callback(view.render());
        }
    }

    return definition;

});