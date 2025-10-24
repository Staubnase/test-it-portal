/**
Grid Data Source
**/
define(function (require) {

    var definition = {
        build: function (vm, node, callback) {
            var gridId = vm.containerId || vm.gridId;
            vm.dataSource = {};


            if (!_.isUndefined(vm.grid.options) && vm.grid.options.editable) {
                //grid setups for editable grids.
                switch (vm.grid.GridType) {
                    case 'Localization':
                        app.gridUtils.applyLocalizationDataSourceConfig(gridId, vm);
                        break;
                    case 'EditableKnowledgeArticle':
                        app.gridUtils.applyKmDashboardDataSourceConfig(gridId, vm);
                        break;
                    default:
                        return;
                }
            } else {
                //generic default grid configuration
                app.gridUtils.configureGenericGrid(gridId, vm);
            }

            app.gridUtils.setDataSourceOverrides(vm);


            if (!_.isUndefined(node)) {
                vm.dataSource = _.extend(vm.dataSource, node);
            }

            vm.onColumnReorder = function (e) {
                app.gridUtils.saveColumnState(gridId, this, false, e);
            };

            vm.onColumnResize = function (e) {
                app.gridUtils.saveColumnState(gridId, this, false, e);
            };

            vm.onColumnShow = function (e) {
                app.gridUtils.saveColumnState(gridId, this, false, e);
            };

            vm.onColumnHide = function (e) {
                app.gridUtils.saveColumnState(gridId, this, false, e);
            };

            vm.onGridChange = function (e) {
                var grid = this;
                app.events.publish('gridChange', grid);
                if (grid.options.noState) {
                    return;
                }
                app.gridUtils.savedState.updateSelectedRows(gridId, grid);
            };

            vm.onDataBound = function onDataBound(e) {
                var grid = e.sender;
                var currentState = app.gridUtils.savedState.getCurrentState(gridId);
                var onRowClick = !_.isUndefined(vm.events) ? vm.events.handleRowClick : function () { app.lib.log('row click function not found;'); };

                app.gridUtils.denoteAppliedFilters(grid, currentState);
                app.gridUtils.setGridStatePersistence(gridId, grid, grid.dataSource, currentState);
                app.gridUtils.initRowClickHandling(gridId, grid, onRowClick);
                app.gridUtils.handleEmptyResults(grid, grid.dataSource, currentState);
                app.gridUtils.handleRowHoverEvent(e);

                app.events.publish('gridBound', grid);
            }

            callback();
        }
    }
    return definition;
});