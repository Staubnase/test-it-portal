/**
Tab data
**/
define(function (require) {
    var dtpl = require("text!forms/structure/tabData/view.html");
    var mtpl = require("text!forms/structure/tabData/mobile.html");
  
    var tpl = (app.isMobile()) ? mtpl : dtpl;

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            node.cid = node.name;
            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }

            callback(built(node));
        }
    }

    return definition;

});
