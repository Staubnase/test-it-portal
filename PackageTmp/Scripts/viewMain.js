require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        text: "require/text",
        'angular': 'libs/angular/angular',
        'angularAMD': 'libs/angular/angularAMD',
        'angular-ui-router': 'libs/angular/angular-ui-router',
        'angular-sanitize': 'libs/angular/angular-sanitize',
        'angular-resource': 'libs/angular/angular-resource'
    },

    shim: {
        'angular': { exports: "angular" },
        'angular-ui-router': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular']
    }
});

require(["viewBuilder", "drawerBuilder"], function (viewBuilder, drawerBuilder) {

    if (app.isSessionStored()) {
        initView();
    } else {
        app.events.subscribe("sessionStorageReady", function () {
            initView();
        });
    }

    function initView() {
        var isViewExist = false;
        app.lib.getNavNodeDefinition(function (vm) {
            isViewExist = true;
            $('.page_content').hide();

            //tfs:5085, if appfilepath contains kb we need to do client side license validation.
            //if (vm.appFilePath && _.isString(vm.appFilePath)) {
            //    //check path for kb then check for valid license
            //    if (vm.appFilePath.indexOf('kb') >= 0 && !session.consoleSetting.UseHTMKB) {
            //        //no license, redirect to rtf kb 
            //        return location.href = "/KnowledgeBase/Index";
            //    }
            //}
            viewBuilder.build(vm, function () {
                $(function () {
                    if (!app.isMobile()) {
                        initializeGrids(vm);
                    };
                    drawerBuilder.build(vm, function () {
                        app.events.publish('drawerExtensionsReady');
                    });

                    app.lib.handleMessages();
                    $('.page_content').show();
                    app.events.publish('dynamicPageReady');

                    //it must be done, I'm sorry...
                    $('body').tooltip({ selector: '[rel=dynamictooltip]', placement: 'top', container: '.drawer-task-menu' });

                });
            });
        });

        //This will going to home page if view is not existing for that specific user.
        if (!isViewExist) { 
            location.href = "/";
        }

    }

    function initializeGrids(vm) {
        //set up the page grid(s)
        _.each(vm.view.gridModels, function (gridVm) {
            //get state
            var gridState = app.gridUtils.savedState.getCurrentState(gridVm.containerId);
            //set columns before we call .kendoGrid
            if (gridState.columns && gridState.columns.length > 0) {
                //BUG 26126: added to address an issue where SLO filter dropdown only works when reset view is clicked
                _.find(gridVm.config.columns, function (item) {
                    if (item.DataType == "slostatus") {
                        _.find(gridState.columns, function (item2) {
                            if (item2.DataType == "slostatus") {
                                item2.filterable = item.filterable;
                                return true;
                            }
                            return false;
                        });
                        return true;
                    }
                    return false;
                });

                gridVm.config.columns = gridState.columns;
            }

            //get the grid
            var container = $('#' + gridVm.containerId).kendoGrid(gridVm.config);
            var theGrid = container.data('kendoGrid');

            if (_.isUndefined(gridVm.refreshInterval)) {
                gridVm.refreshInterval = app.config.defaultGridRefreshInterval;
            }

            if (gridVm.config.noRefresh) {
                gridVm.refreshInterval = 0;
            }

            if (gridVm.refreshInterval != 0 && gridVm.refreshInterval != "") {
                if (gridState) {
                    app.lib.recheckGridState(gridState, theGrid);
                    theGrid.dataSource.query(gridState);
                } else {
                    theGrid.dataSource.read();
                }

                var interval = null;
                interval = setInterval(function () {
                    //clear interval when session expires
                    if (app.sessionTimeout.isSessionExpired) {
                        clearInterval(interval);
                    } else {
                        var state = app.gridUtils.savedState.getCurrentState(gridVm.containerId);
                        if (_.isUndefined(state.page)) {
                            state.page = theGrid.dataSource.options.page;
                        }
                        if (_.isUndefined(state.pageSize)) {
                            state.page = theGrid.dataSource.options.pageSize;
                        }
                        theGrid.dataSource.query(state);
                    }
                }, gridVm.refreshInterval);

            } else { //no refresh interval
                if (gridState) {
                    app.lib.recheckGridState(gridState, theGrid);
                    theGrid.dataSource.query(gridState);
                } else {
                    theGrid.dataSource.read();
                }
            }

            // if we have a hidden column on the grid and only have a few columns, 
            // the layout won't auto size the columns UNLESS we change the table-layout #yay
            if (gridVm.config.columns.length < 5) {
                _.each(gridVm.config.columns, function (col) {
                    if (!_.isUndefined(col.hidden) && col.hidden) {
                        $('#' + gridVm.containerId + ' table').css('table-layout', 'inherit');
                    }
                });
            }
        });
    }
});
