/**
INT32
**/

define(function (require) {
    var tpl = require("text!forms/fields/numeric/view.html"); //use numeric template
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            var boundObj = node.vm;
            //make sure we have all the vals set
            
            var properties = {
                Required: node.Required,
                DecimalPlaces: 0,
                MinValue: -2147483648,
                MaxValue: 2147483648,
                StepIncrement: 1,
                Disabled: node.disabled,
                Format: ''
            };

            $.extend(true, properties, node);

            var templateFrag = $(built(properties));
            new Control(templateFrag.find("[data-control='numericTextBox']"), boundObj, node);

            callback(templateFrag);
        }
    }


    var Control = function (targetEle, boundObj, node) {

        //This will be used for mobile because the numeric event wont triggering when you type in the value.
        if (app.isMobile()) {
            var editor = targetEle.data();
            setTimeout(function () {
                var number = targetEle.parent().find("input[type='number']");
                number.change(function () {
                    boundObj.set(node.PropertyName, number.val());
                });
            }, 100);
        }
    }

    return definition;

});