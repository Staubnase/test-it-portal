/**
trendContainer
**/
define(function (require) {
    var tpl = require("text!viewPanels/trendContainer/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var config = node.Definition.content;
           
            if (app.isMobile()) {
                tpl = require("text!viewPanels/trendContainer/view.mobile.html");
            }

            if (!config.propertyValue) {
                config.propertyValue = {
                    size: 3
                }
            }

            /*  propertyValue.size can be set in viewPanel to 1-5, 
             *  setting base and label size off that for better scaling
             *
             *  valSize     base    label
             * ---------------------------
             *  1           1.2     1.10    (label forced to 1.1 to avoid less than 1em vals)
             *  2           1.4     1.15
             *  3           1.6     1.35
             *  4           1.8     1.55
             *  5           2       1.75
             */

            var valueFontSize = config.propertyValue.size;
            var baseFontSize = (valueFontSize * .2) + 1;
            var labelFontSize = (valueFontSize * .2) + .75;
            var labelColor = '#000000';
            var modelClass = '';

            if (labelFontSize < 1.0) {
                labelFontSize = 1.1;
            }

            if (app.isMobile()) {

                if (!_.isUndefined(config.queryId)) {
                    // knowledge article properties
                    if (config.queryId === '8540489d-6918-4846-aef8-85aac0876e07') {
                        valueFontSize = (valueFontSize * .21);
                        labelFontSize = valueFontSize;
                        labelColor = '#777777';
                        modelClass = 'ka-mobile-trend-container';
                        var topParent = $('.trend-container').parent().parent().parent().parent();
                        topParent.addClass('ka-mobile-row-trend-container');

                        config.label = _.isUndefined(config.label)
                                ? localizationHelper.localize(config.propertyName, config.propertyName) + ':'
                                : localizationHelper.localize(config.label, config.label) + ':'
                    } 
                }
            }
          

            var model = kendo.observable({
                viewModel: {
                    //name to bind to in the result object from server
                    propertyName: config.propertyName,
                    //localized label, if not defined localized the property name
                    label: _.isUndefined(config.label)
                        ? localizationHelper.localize(config.propertyName, config.propertyName)
                        : localizationHelper.localize(config.label, config.label),
                    baseFontSize: baseFontSize + 'em',
                    labelSize: labelFontSize + 'em',
                    labelColor: labelColor,
                    propertyValue: {
                        color: _.isUndefined(config.propertyValue.color) ? '#000000' : config.propertyValue.color,
                        size: valueFontSize + "em",
                        lineHeight: (valueFontSize - 1) + "em",
                        value: ''
                    },
                    modelClass: modelClass,
                    queryId: config.queryId
                }
            });

            //build it
            var built = _.template(tpl);
            var view = new kendo.View(built(), { wrap: false, model: model });
            callback(view.render());
        }
    }

    return definition;

});
