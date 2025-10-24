require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        text: "require/text"
    },

    shim: {
        //kendo: {
        //    deps: ['jquery'],
        //    exports: 'kendo'
        //}
    }
});
require(["grids/gridBuilder"], function (gridBuilder) {
    var vm = pageGrid;
    vm.isAnalyst = session.user.Analyst;
    vm.containerId = vm.grid.GridContainerId;
    vm.gridJsonDataForCountdown = {}
    vm.tempProperties = {};
    var myGrid;
    var container;
    vm.grid.layoutContainer = $('.page_content');

    gridBuilder.build(vm, vm.grid, function (config) {
        if (vm.grid.GridType && vm.grid.GridType == "WorkItemSearch") {
            container = $('#' + vm.containerId).kendoGrid(config);
            myGrid = container.data('kendoGrid');
            $("#Search_Title").val(vm.HeaderSearchText);
            container.find('.k-toolbar').siblings().hide();
            $("#search").click(function() {
                myGrid.dataSource.read();
                container.find('.k-toolbar').siblings().show();
            });
            drawermenu.addButton(localization.SearchButton, "fa fa-search", function onSearch() {
                myGrid.dataSource.read();
                container.find('.k-toolbar').siblings().show();
            });
            drawermenu.addButton(localization.Clear, "fa fa-refresh", function clearSearch() {
                window.location = '/workitems/search/';
            });
            //display search result when search is done from header
            if (!_.isEmpty(vm.HeaderSearchText)) {
                myGrid.dataSource.read();
                container.find('.k-toolbar').siblings().show();
            }
        } else {
            //get state
            var gridState = app.gridUtils.savedState.getCurrentState(vm.containerId);

            //set columns before we call .kendoGrid
            if (gridState.columns && gridState.columns.length > 0) {
                config.columns = gridState.columns;
            }

            //get the grid
            container = $('#' + vm.containerId).kendoGrid(config);
            myGrid = container.data('kendoGrid');

            if (_.isUndefined(vm.refreshInterval)) {
                vm.refreshInterval = app.config.defaultGridRefreshInterval;
            }

            if (vm.refreshInterval != 0 && vm.refreshInterval != "") {
                if (gridState) {
                    app.lib.recheckGridState(gridState, myGrid);
                    myGrid.dataSource.query(gridState);
                } else {
                    myGrid.dataSource.read();
                }

                setInterval(function () {
                    var state = app.gridUtils.savedState.getCurrentState(vm.containerId);

                    if (_.isUndefined(state.page)) {
                        state.page = myGrid.dataSource.options.page;
                    }
                    if (_.isUndefined(state.pageSize)) {
                        state.page = myGrid.dataSource.options.pageSize;
                    }
                    myGrid.dataSource.query(state);
                }, vm.refreshInterval);

            } else {
                if (gridState) {
                    app.lib.recheckGridState(gridState, myGrid);
                    myGrid.dataSource.query(gridState);
                } else {
                    myGrid.dataSource.read();
                }
            }
        }
    });
});