/**
chart
**/
define(function (require) {
    var tpl = require("text!viewPanels/chart/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var view;
            var promises = [];
            viewModel = {
                view: {
                    //set up controller methods and values
                    controller: {
                        title: node.Definition.content.title,
                        isVisible: true,
                        queryId: node.Definition.content.queryId,
                        series: node.Definition.content.series,
                        categoryAxis: node.Definition.content.categoryAxis,
                        seriesColors: node.Definition.content.seriesColors,
                        isLegendVisible: node.Definition.content.isLegendVisible,
                        dataSourceGroup: node.Definition.content.dataSourceGroup,
                        dataSourceSort: node.Definition.content.dataSourceSort,
                        legendPosition: node.Definition.content.legendPosition || "bottom"
                    },
                    buildView: function() {
                        //build template using underscore.js so that we can interpret kendo template vars if needed
                        var built = _.template(tpl);

                        view = new kendo.View(built(), { wrap: false, model: viewModel });
                        callback(view.render());
                    },
                    buildChart: function () {
                        var chartEle = $(view.element[0]);
                        var defaultSeriesColor = ["#4183D7", "#D24D57", "#2ECC71", "#F5D76E", "#D2527F", "#913D88", "#F89406", "#5C97BF", "#D91E18",
                            "#26A65B", "#F7CA18", "#E08283", "#663399", "#E67E22", "#81CFE0", "#EF4836", "#90C695", "#F4D03F", "#8E44AD",
                            "#D35400", "#2C3E50", "#CF000F", "#87D37C", "#F5AB35", "#E26A6A", "#913D88", "#F39C12", "#446CB3", "#96281B", "#1E824C",
                            "#FDE3A7", "#F62459", "#AEA8D3", "#F9690E", "#336E7B", "#4DAF7C", "#F9BF3B", "#EB9532"]; //http://www.flatuicolorpicker.com/

                        //defining datasource
                        var dataSourceSettings = {
                            transport: {
                                read: {
                                    url: app.lib.addUrlParam("/Dashboard/GetDashboardData", "queryId", viewModel.view.controller.queryId),
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            requestStart: function () {
                                this.defferred = $.Deferred();
                                promises.push(this.defferred.promise());
                            },
                            change: function () {
                                this.defferred.resolve();
                            }
                        };

                        if (!_.isUndefined(viewModel.view.controller.dataSourceGroup)) {
                            dataSourceSettings.group = viewModel.view.controller.dataSourceGroup;
                        }

                        if (!_.isUndefined(viewModel.view.controller.dataSourceSort)) {
                            dataSourceSettings.sort = viewModel.view.controller.dataSourceSort;
                        }

                        var dataSource = new kendo.data.DataSource(dataSourceSettings);
                       
                        //defining chart series
                        var chartSeries = [];
                        var series = viewModel.view.controller.series;
                        for (var item in series) {
                            if (!_.isUndefined(viewModel.view.controller.categoryAxis))
                                series[item].categoryField = viewModel.view.controller.categoryAxis.field;
                            series[item].name = viewModel.view.getLocalizedText(series[item].name);
                            series[item].overlay = { gradient: "none" };
                            chartSeries.push(series[item]);
                        }

                        //build the chart
                        chartEle.kendoChart({
                            theme: "bootstrap",
                            title: viewModel.view.getLocalizedText(viewModel.view.controller.title),
                            tooltip: {
                                visible: true,
                                template: "#= !_.isUndefined(series.name)?series.name:category # - #= value #",
                            },
                            legend: { visible: (!_.isUndefined(viewModel.view.controller.isLegendVisible)) ? viewModel.view.controller.isLegendVisible : true, position: viewModel.view.controller.legendPosition },
                            seriesColors: (!_.isUndefined(viewModel.view.controller.seriesColors)) ? viewModel.view.controller.seriesColors : defaultSeriesColor,
                            categoryAxis: viewModel.view.controller.categoryAxis,
                            series: chartSeries,
                            render: function (e) {
                                app.lib.mask.remove();
                            },
                            seriesDefaults: {
                                type: "column"
                            },
                            dataSource: dataSource
                        });
                    },
                    getLocalizedText: function (localizationKey) {
                        var localizedText = (!_.isUndefined(localization[localizationKey]) && [localizationKey].length > 0) ? localization[localizationKey] : localizationKey;
                        return localizedText;
                    },
                    shortenLabel: function (value, maxLength) {
                        if (value.length > maxLength) {
                            value = value.substring(0, maxLength) + "...";
                        }
                        return value;
                    }
                }
            }
            viewModel.view.buildView();
            viewModel.view.buildChart();
        }
    }

    return definition;

});
