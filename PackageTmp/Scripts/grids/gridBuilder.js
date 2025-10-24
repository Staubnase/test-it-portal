define([
    "grids/structure/defaultConfiguration/controller",
    "grids/structure/events/controller",
    "grids/structure/toolbar/controller",
    "grids/columnTemplates/columnBase/controller",
    "grids/columnTemplates/string/controller",
    "grids/columnTemplates/number/controller",
    "grids/columnTemplates/bool/controller",
    "grids/columnTemplates/date/controller",
    "grids/columnTemplates/datetime/controller",
    "grids/columnTemplates/SLOStatus/controller",
    "grids/columnTemplates/command/controller",
    "grids/columnTemplates/input/controller",
    "grids/columnTemplates/anchor/controller",
    "grids/structure/dataSource/controller",
    "grids/structure/sourceFields/controller",
    "grids/structure/drawer/controller",
    "grids/mobile/controller"
], function (
    config,
    events,
    toolbar,
    columnBase,

    string,
    number, // 'numeric' also valid name
    boolean,
    date,    // 'datetime' also valid name
    datetime,
    slostatus,
    command,
    input,
    anchor,

    dataSource,
    sourceFields,
    drawer,
    mobileGrid
) {

        var configuration = {};
        var definition = {
            /*
             * vm:       entire current viewModal. Usually set in the calling ___Main.js file
             * node:     property on the vm for this builder. Scoped to data needed for building only
             * callback: function to execute in the calling file once done.
             */
            build: function (vm, node, callback) {
                var viewModel;
                var columns = [];

                //special stuff for grids that are sent from viewBuilder
                if (vm.tempProperties && vm.tempProperties.fromViewBuilder) {
                    vm.tempProperties.fromGridBuilder = true;
                    var gridModel = {
                        containerId: node.Id,
                        isAnalyst: window.session.user.Analyst || false
                    }

                    //NOTE: node.content means it is a .js file we are loading from (old way). node.Definition.content is from the vp db table
                    if (node.content) {
                        gridModel.grid = node.content.grid;
                    } else if (node.Definition) {
                        gridModel.grid = node.Definition.content.grid;
                    }

                    vm.tempProperties.currentContainer.find('.append-here').append("<div id='" + gridModel.containerId + "' class='grid-container'></div>");

                    viewModel = gridModel;
                } else {
                    if (!_.isUndefined(vm.fromQueryBuilder) && vm.fromQueryBuilder) {
                        viewModel = vm;
                    } else {
                        node.layoutContainer.find('.container-fluid').append("<div id='" + vm.containerId + "' class='grid-container'></div>");
                        viewModel = vm;
                    }
                }

                // configure mobile grid views (skip standard mobile rendering for saved search grids)
                if (app.isMobile() && viewModel.grid.GridType !== "QueryBuilderGrid") {
                    return toolbar.build(viewModel, viewModel.grid.options.toolbar, function (toolbarConfig) {
                        viewModel.toolbar = toolbarConfig.toolbar;

                        var columns = [];

                        //pull in column data 
                        _.each(viewModel.grid.columns, function (column) {
                            if (column.analystOnly && !viewModel.isAnalyst) {
                                //analyst only column, don't render
                                return false;
                            }

                            column.DataType = column.DataType.toLowerCase();
                            switch (column.DataType) {
                                case 'datetime':
                                    column.DataType = 'date';
                                    column.template = "#: " + column.field + " != null || " + column.field + " != undefined ? kendo.toString(new Date(" + column.field + "), 'g'): '' #";
                                    column.groupHeaderTemplate = "#=  kendo.toString(app.gridUtils.getWIDateFieldGroupTemplateValue(data), 'd') #";
                                    break;
                                case 'date':
                                    column.template = "#: " + column.field + " != null || " + column.field + " != undefined ? kendo.toString(new Date(" + column.field + "), 'g'): '' #";
                                    column.groupHeaderTemplate = "#=  kendo.toString(app.gridUtils.getWIDateFieldGroupTemplateValue(data), 'd') #";
                                    break;
                                case 'numeric':
                                    column.template = "#: (" + column.field + ") ? " + kendo.toString(column.field, 'n') + " : 0 #";
                                    column.DataType = 'number';
                                    break;
                                default:
                                    column.template = "#: (" + column.field + ") ? " + column.field + " : '' #";
                                    break;
                            }

                            //override column template for affected user on IE
                            if (app.isIE() && column.field == "AffectedUser") {
                                column.template = "#: (" + column.field + ") ? " + column.field + " : '' #";
                            }

                            columns.push(column);
                        });

                        viewModel.grid.columns = columns;

                        mobileGrid.build(viewModel, node, callback);
                    });
                }

                // configure desktop grid views
                config.build(viewModel, viewModel.grid.options, function (defaultConfig) {
                    configuration = viewModel.grid.options;
                    //configuration obj now hold all default config plus custom config
                    events.build(viewModel, viewModel.grid.events, function () {
                        configuration.events = viewModel.events;
                        if (viewModel.builtinEvents) {
                            _.each(viewModel.builtinEvents, function (event, key) {
                                viewModel.grid.options[key] = event;
                            });
                        }
                    });

                    toolbar.build(viewModel, viewModel.grid.options.toolbar, function (toolbarConfig) {
                        configuration.toolbar = toolbarConfig.toolbar;
                    });

                    //pull in column data 
                    _.each(viewModel.grid.columns, function (column) {
                        if (column.analystOnly && !viewModel.isAnalyst) {
                            //analyst only column, don't render
                            return false;
                        }

                        column.DataType = column.DataType.toLowerCase();
                        switch (column.DataType) {
                            case 'datetime':
                                column.DataType = 'date';
                                column.template = "#= " + column.field + " != null || " + column.field + " != undefined ? kendo.toString(new Date(" + column.field + "), 'g'): '' #";
                                column.groupHeaderTemplate = "#=  kendo.toString(app.gridUtils.getWIDateFieldGroupTemplateValue(data), 'd') #";
                                break;
                            case 'date':
                                column.template = "#= " + column.field + " != null || " + column.field + " != undefined ? kendo.toString(new Date(" + column.field + "), 'g'): '' #";
                                column.groupHeaderTemplate = "#=  kendo.toString(app.gridUtils.getWIDateFieldGroupTemplateValue(data), 'd') #";
                                break;
                            case 'numeric':
                                column.DataType = 'number';
                                break;
                            default:
                        }

                        //override column template for affected user on IE
                        if (app.isIE() && column.field == "AffectedUser") {
                            column.template = "#: (" + column.field + ") ? " + column.field + " : '' #";
                        }


                        try {
                            eval("var _obj = " + column.DataType + ";");
                        } catch (e) {
                            throw new app.lib.exception(column.DataType + ' not found');
                        }

                        columnBase.build(viewModel, column, function (col) {
                            if (!_.isUndefined(_obj)) {
                                //extend column build for specific datatype
                                _obj.build(viewModel, col, function (templateCol) {
                                    columns.push(templateCol);
                                });
                            } else {
                                columns.push(col);
                            }
                        });
                    });

                    configuration.columns = columns;

                    dataSource.build(viewModel, viewModel.grid.dataSourceOptions, function () {
                        //vm.dataSource now contains the right values minus the schema fields and read data
                        sourceFields.build(viewModel, viewModel.grid.columns, function () {
                            //datasource model fields are set now        
                            configuration.dataBound = viewModel.onDataBound;
                            configuration.change = viewModel.onGridChange;
                            configuration.columnReorder = viewModel.onColumnReorder;
                            configuration.columnResize = viewModel.onColumnResize;
                            configuration.columnShow = viewModel.onColumnShow;
                            configuration.columnHide = viewModel.onColumnHide;
                            configuration.dataSource = new kendo.data.DataSource(viewModel.dataSource);
                            configuration.dsConfig = viewModel.dataSource;



                            //bug 11874: workaround for filter menu hover issue on new version of chrome. 
                            //workaround reference: http://www.telerik.com/forums/issue-with-grid-filter-(on-chrome-55-0-2883-75)
                            configuration.columnMenuInit = function (e) {
                                var menu = e.container.find(".k-menu").data("kendoMenu");
                                menu.bind('activate', function (e) {
                                    if (e.item.is(':last-child')) {
                                        // if an element in the submenu is focused first, the issue is not observed
                                        e.item.find('span.k-dropdown.k-header').first().focus();
                                        e.item.find('input').first().focus();
                                    }
                                });
                            };
                        });
                    });

                    //todo: branch for mobile drawer binding..
                    drawer.build(viewModel, viewModel.grid.drawerMenu);

                    if (vm.tempProperties.fromViewBuilder) {
                        vm.gridModels = vm.gridModels || [];

                        var gridWrapper;
                        if (node.layoutSize == "small") {
                            gridWrapper = $("<div id='" + viewModel.containerId + "' class='grid-container grid-minimal'></div>");
                        } else {
                            gridWrapper = $("<div id='" + viewModel.containerId + "' class='grid-container'></div>");
                        }

                        vm.gridModels.push({
                            config: configuration,
                            containerId: viewModel.containerId,
                            refreshInterval: node.refreshInterval,
                            gridJsonDataForCountdown: viewModel.gridJsonDataForCountdown
                        });

                        callback(gridWrapper);
                    } else {
                        callback(configuration);
                    }
                });
            }
        }

        return definition;
    });