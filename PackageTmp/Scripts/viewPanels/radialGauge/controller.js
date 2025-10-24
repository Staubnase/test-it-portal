/**
chart
**/
define(function (require) {
    var tpl = require("text!viewPanels/radialGauge/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var view;
            viewModel = {
                view: {
                    //set up controller methods and values
                    controller: {
                        title: viewModel.view.getLocalizedText(node.Definition.content.title),
                        isVisible: true,
                        queryId: node.Definition.content.queryId,
                        valueField: node.Definition.content.valueField,
                        min: node.Definition.content.min,
                        max: node.Definition.content.max,
                        startAngle: node.Definition.content.startAngle,
                        endAngle: node.Definition.content.endAngle,
                        labels: node.Definition.content.labels,
                        ranges: node.Definition.content.ranges,
                        value: 0,
                        pointerColor: node.Definition.content.pointerColor
                    },
                    buildView: function() {
                        //build template using underscore.js so that we can interpret kendo template vars if needed
                        var built = _.template(tpl);

                        view = new kendo.View(built(), { wrap: false, model: viewModel });

                        //set value for gauge pointer
                        viewModel.view.controller.value = viewModel.view.getGaugeValue();

                        callback(view.render());
                    },
                    setRadialGaugeScale: function() {
                       var gauge= $(view.element[0]).kendoRadialGauge({
                           theme: "bootstrap",
                           pointer: {
                               color: !_.isUndefined(viewModel.view.controller.pointerColor) ? viewModel.view.controller.pointerColor : "#000"
                           },
                           scale: {
                               max: !_.isUndefined(viewModel.view.controller.max) ? viewModel.view.controller.max : 100,
                               startAngle: !_.isUndefined(viewModel.view.controller.startAngle) ? viewModel.view.controller.startAngle : -50,
                               endAngle: !_.isUndefined(viewModel.view.controller.endAngle) ? viewModel.view.controller.endAngle : 230,
                               labels: viewModel.view.controller.labels,
                               ranges: viewModel.view.controller.ranges,

                           }
                        });
                    },
                    getGaugeValue: function () {
                        if (_.isUndefined(viewModel.view.controller.queryId)) { return; }
                        var value = 0;
                        var dataSource = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: app.lib.addUrlParam("/Dashboard/GetDashboardData", "queryId", viewModel.view.controller.queryId),
                                    dataType: "json",
                                    async: false
                                }
                            }
                        });
                        dataSource.fetch(function () {
                            var result = dataSource.at(0);
                            value = result.get(viewModel.view.controller.valueField);
                        });
                        return value;
                    },
                    getLocalizedText: function (localizationKey) {
                        var localizedText = (!_.isUndefined(localization[localizationKey]) && [localizationKey].length > 0) ? localization[localizationKey] : localizationKey;
                        return localizedText;
                    }
                }
            }
            viewModel.view.buildView();
            viewModel.view.setRadialGaugeScale();

        }
    }

    return definition;

});
