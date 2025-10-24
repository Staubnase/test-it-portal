define([
    "viewPanels/facetedSearch/controller",
    "viewPanels/html/controller",
    "viewPanels/serviceCatalog/controller",
    "viewPanels/alternateSC/controller",
    "grids/gridBuilder",
    "viewPanels/queryBuilder/controller",
    "viewPanels/chart/controller",
    "viewPanels/radialGauge/controller",
    "viewPanels/calendar/controller",
    "viewPanels/trendContainer/controller",
    "viewPanels/articleList/controller"
], function (
    facetedSearch,
    html,
    serviceCatalog,
    alternateSC,
    grid,
    queryBuilder,
    chart,
    radialGauge,
    calendar,
    trendContainer,
    articleList
) {
    var definition = {
        build: function (vm, node, callback) {

            app.lib.getViewPanelDefinition(node.ViewPanelId, function (templateObj) {
                eval("var _obj = " + templateObj.TypeId + ";");
                
                if (!_obj) {
                    throw templateObj.TypeId + " is not part of the templating system";
                }

                if (!vm.tempProperties) {
                    vm.tempProperties = {}
                }
                vm.tempProperties.fromViewBuilder = true;

                _obj.build(vm, templateObj, function (tmpl) {
                    callback(tmpl);
                });
            });

        }
    }
    return definition;
});

