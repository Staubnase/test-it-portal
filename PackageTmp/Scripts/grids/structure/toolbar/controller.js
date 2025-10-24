/**
Toolbar
**/
define(function (require) {
    var gridId;
    var tpl = require("text!grids/structure/toolbar/view.html");
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            // BUG 19247: Editable column property must be a function
            // http://docs.telerik.com/kendo-ui/api/javascript/ui/grid#configuration-columns.editable
            vm.grid.columns = _.map(vm.grid.columns,
                function (el) {
                    if (el.hasOwnProperty('editable')) {
                        el.editable = function() {
                            return el.editable;
                        };
                    }
                    return el;
                });

            gridId = vm.containerId || vm.gridId;
            var toolbarContainer = {
                toolbar: [],
                events: []
            }
            var customEventCount = 0;
            //reset filters button, only show if grid options 'filterable' is true
            //grids will default to true, so we only hide if explicitly set to false.
            if (vm.grid.options.filterable && !app.isMobileDevice()) {
                if (vm.fromQueryBuilder) {
                    if (vm.isSavedQuery) {
                        app.events.subscribe("queryBuilderGridReady", function () {
                            clearFilters();
                            exportToExcel();
                        });
                        toolbarContainer.toolbar.push({
                            name: localization.ResetGridFilters,
                            template: "<a class='k-button pull-right btn btn-default btn-clear-grid-filters'>" + localization.ResetGridFilters + "</a>"
                        });
                        //add export button 
                        toolbarContainer.toolbar.push({
                            name: localization.ExportToExcel,
                            template: "<a  class='k-button pull-right btn btn-default btn-grid-export'> <i class=\"fa fa-file-excel-o\"></i> " + localization.Export + "</a>"
                        });
                    }
                } else {
                    if (vm.grid.GridType && vm.grid.GridType != "WorkItemSearch") {
                        app.events.subscribe("dynamicPageReady", function () {
                            clearFilters();
                            exportToExcel();
                        });
                        toolbarContainer.toolbar.push({
                            name: localization.ResetGridFilters,
                            template: "<a class='k-button pull-right btn btn-default btn-clear-grid-filters'>" + localization.ResetGridFilters + "</a>"
                        });

                        //add export button 
                        toolbarContainer.toolbar.push({
                            name: localization.ExportToExcel,
                            template: "<a  class='k-button pull-right btn btn-default btn-grid-export'> <i class=\"fa fa-file-excel-o\"></i> " + localization.Export + "</a>"
                        });

                    }
                }
                
            }

            //mobile WI grid search input
            if (app.isMobile() && vm.grid.GridType === "WorkItem") {
                app.events.subscribe("dynamicPageReady", function () {
                    initMobileWiGridSearch();
                });

                toolbarContainer.toolbar.push({
                    name: 'MobileWISearch',
                    ordinal: 0,
                    template: "<div class='input-group mobilegrid__search'>" +
                                "<input class='mobilegrid__search__input form-control' type='text' name='mobileWiGridSearchText' placeholder='" + localization.FilterItems + "'>" +
                                "<span class='mobilegrid__search__btn input-group-btn' onclick=\"app.lib.filterMobileWiGrid('" + gridId + "')\">" +
                                    "<button class='btn btn-default' type='button'><span class='fa fa-search cursor-pointer'></span></button>" +
                                "</span>" +
                              "</div>"
                });
            }

            _.each(node, function (key) {
                switch (key.name) {
                    case 'showActivityToggle':
                        app.events.subscribe("dynamicPageReady", function () {
                            if (app.isMobile()) {
                                bindActivityCheckboxMobile();
                            } else {
                                bindCheckBoxes();
                            }
                        });

                        toolbarContainer.toolbar.push({
                            name: localization.ShowActivities,
                            ordinal: 2,
                            template: "<label class='checkbox checkbox-primary' id='toggleActivities'><input type='checkbox' data-checked='false'><input id='showActivitiesInGrid' type='hidden' value='false'><span class='checkbox-label'>"
                                + (app.isMobile() ? localization.Activities : localization.ShowActivities) +
                                "</span></label>"
                        });
                        break;
                    case 'showInactiveToggle':
                        app.events.subscribe("dynamicPageReady", function () {
                            if (app.isMobile()) {
                                bindInactiveCheckboxMobile();
                            } else {
                                bindCheckBoxes();
                            }
                        });
                        toolbarContainer.toolbar.push({
                            name: localization.ShowInactiveWorkItems,
                            ordinal: 2,
                            template: "<label class='checkbox checkbox-primary' id='toggleInactive'><input type='checkbox' data-checked='false'><input id='showInActivesInGrid' type='hidden' value='false'><span class='checkbox-label'>"
                                + (app.isMobile() ? localization.Inactive : localization.ShowInactiveWorkItems) +
                                "</span></label>"
                        });
                        break;
                    case 'localizationToolbar':
                        app.events.subscribe("dynamicPageReady", function () {
                            var myGrid = $('#' + gridId).data('kendoGrid');
                            var comboEle = $(myGrid.element).find("#locale");
                            var checkboxEle = $(myGrid.element).find("#showAlreadyTranslated");

                            //locale drop down
                            var comboControlSettings = {
                                autoBind: false,
                                highlightFirst: true,
                                dataTextField: "name",
                                dataValueField: "id",
                                text: session.user.LanguageCode,
                                dataSource: new kendo.data.DataSource({
                                    transport: {
                                        read: {
                                            url: "/Settings/User/GetAvailableLanguageCodes/",
                                            xhrFields: {
                                                withCredentials: true
                                            },
                                            datatype: "json"
                                        }
                                    },
                                    schema: {
                                        data: "Data",
                                        errors: "Errors",
                                        model: {
                                            id: "Id",
                                            fields: {
                                                name: "Name"
                                            }
                                        }
                                    }
                                }),
                                change: function () {
                                    var value = this.value();
                                    if (value) {
                                        myGrid.dataSource.read({
                                            locale: value, showAlreadyTranslated: checkboxEle.prop('checked')
                                        });
                                    }
                                }
                            };

                            comboEle.kendoDropDownList(comboControlSettings);
                            //--end locale drop down

                            //checkbox

                            //set default value based on config, new record for how many levels deep I call a nested property!
                            checkboxEle.prop('checked', myGrid.dataSource.options.transport.read.originalConfigData.showAlreadyTranslated);
                            checkboxEle.on('click', function () {
                                var combo = $(myGrid.element).find("#locale").data('kendoDropDownList');
                                var locale = combo.value();
                                if (locale.length == 0) {
                                    locale = session.user.LanguageCode;
                                }
                                store.session.set("localizationGridLocale", locale);
                                myGrid.dataSource.read({
                                    locale: locale, showAlreadyTranslated: checkboxEle.prop('checked')
                                });
                            });
                            //--end checkbox
                        });

                        var built = _.template(tpl);
                        $('#' + gridId).after(built());
                        toolbarContainer.toolbar = kendo.template($("#toolbarTemplate").html());
                        break;
                    case 'showInactiveTabs':
                        app.events.subscribe("dynamicPageReady", function () {
                            bindTabToggles();
                        });
                        toolbarContainer.toolbar.push({
                            name: key.name,
                            template: "<ul class='nav nav-pills toolbar-tabs'><li class='active'><a data-subtype='myrequests'>" + localization.Active + "</a></li><li><a data-subtype='myinactiverequests'>" + localization.Closed + "</a></li></ul> <input type='hidden' id='gridViewId' value='myrequests' />"
                        });
                        break;
                    case 'searchConfigItems':

                        app.events.subscribe("dynamicPageReady", function () {
                            if (app.isMobile()) {
                                bindConfigItemGridFilterMobile();
                            } else {
                                bindConfigItemGridFilter();
                            }
                        });
                        if (app.isMobile()) {
                            toolbarContainer.toolbar.push({
                                name: key.name + 'ObjectClassCombo',
                                template: "<input id='ObjectClassCombo' name='ObjectClassCombo' type='text' />"
                            });
                            toolbarContainer.toolbar.push({
                                name: key.name,
                                template:
                                    "<div class='input-group mobilegrid__search mobilegrid__search--configitem'>" +
                                        "<input class='mobilegrid__search__input form-control' type='text' id='searchText' class='ci-search-text'>" +
                                        "<span class='mobilegrid__search__btn input-group-btn'>" +
                                            "<button class='btn btn-default' type='button'><span class='fa fa-search cursor-pointer'></span></button>" +
                                        "</span>" +
                                    "</div>"
                            });
                        } else {
                            toolbarContainer.toolbar.push({
                                name: key.name + 'ObjectClassCombo',
                                template: "<div class='ci-dropdown-toolbar'><input id='ObjectClassCombo' name='ObjectClassCombo' type='text'  /></div>"
                            });
                            toolbarContainer.toolbar.push({
                                name: key.name,
                                template: "<span class='ci-search-toolbar k-textbox k-space-right'><input type='text' id='searchText' class='ci-search-text' value=''  /><a class='k-icon k-i-search ci-search'></a></span>"
                            });
                        }
                        break;
                    case "myWorkToolbar":
                        app.events.subscribe("dynamicPageReady", function () {
                            if (app.isMobile()) {
                                bindActivityCheckboxMobile();
                                bindInactiveCheckboxMobile();
                            } else {
                                bindCheckBoxes();
                            }

                            bindMyWorkTabToggles();
                        });

                        if (app.isMobile()) {
                            var myWorkItemToolbarTemplate = "<ul class='nav nav-pills toolbar-tabs'><li class='active'><a data-subtype='myworkitems'>" + localization.WorkItem + "</a></li><li><a data-subtype='myapprovals'>" + localization.Approval + "</a></li><li><a data-subtype='myactivities'>" + localization.Activities + "</a></li><li><a data-subtype='mymanualactivities'>" + localization.ManualActivities + "</a></li></ul> <input type='hidden' id='gridViewId' value='myworkitems' />";

                            if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                                myWorkItemToolbarTemplate = (session.user.Analyst || session.user.IsAdmin)
                                    ? "<ul class='nav nav-pills toolbar-tabs'><li class='active'><a data-subtype='myincidents'>" + localization.Incident + "</a></li><li><a data-subtype='myapprovals'>" + localization.Approval + "</a></li><li><a data-subtype='myactivities'>" + localization.Activities + "</a></li><li><a data-subtype='mymanualactivities'>" + localization.ManualActivities + "</a></li></ul> <input type='hidden' id='gridViewId' value='myincidents' />"
                                    : "<ul class='nav nav-pills toolbar-tabs'><li  class='active'><a data-subtype='myapprovals'>" + localization.Approval + "</a></li><li><a data-subtype='myactivities'>" + localization.Activities + "</a></li><li><a data-subtype='mymanualactivities'>" + localization.ManualActivities + "</a></li></ul> <input type='hidden' id='gridViewId' value='myapprovals' />";
                            }


                            toolbarContainer.toolbar.push({
                                name: key.name,
                                ordinal: 1,
                                template: myWorkItemToolbarTemplate
                            });
                           
                            if (session.consoleSetting.AnalystPortalLicense.IsValid) {
                                toolbarContainer.toolbar.push({
                                    name: localization.ShowActivities,
                                    ordinal: 2,
                                    template: "<label class='checkbox checkbox-primary' id='toggleActivities'><input type='checkbox' data-checked='false'><input id='showActivitiesInGrid' type='hidden' value='false'><span class='checkbox-label'>"
                                        + (app.isMobile() ? localization.Activities : localization.ShowActivities) +
                                        "</span></label>"
                                });
                            }

                            toolbarContainer.toolbar.push({
                                name: localization.ShowInactiveWorkItems,
                                ordinal: 3,
                                template: "<label class='checkbox checkbox-primary' id='toggleInactive'><input type='checkbox' data-checked='false'><input id='showInActivesInGrid' type='hidden' value='false'><span class='checkbox-label'>"
                                    + (app.isMobile() ? localization.Inactive : localization.ShowInactiveWorkItems) +
                                    "</span></label>"
                            });
                        } else {
                            var built = _.template(tpl);
                            $('#' + gridId).after(built());

                            if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                                if (session.user.Analyst || session.user.IsAdmin) {
                                    toolbarContainer.toolbar = kendo.template($("#myWorkFreeAnalystToolbarTemplate").html());
                                } else {
                                    toolbarContainer.toolbar = kendo.template($("#myWorkFreeToolbarTemplate").html());
                                }
                            } else {
                                toolbarContainer.toolbar = kendo.template($("#myWorktoolbarTemplate").html());
                            } 
                        }
                        break;
                    case 'custom':
                        toolbarContainer.toolbar.push({
                            name: key.name + "_" + customEventCount,
                            template: key.template
                        });
                        customEventCount++;
                        break;
                    default:
                }
            });//--each

            function bindConfigItemGridFilter() {
                var myGrid = $('#' + gridId).data('kendoGrid');
                $(myGrid).find('.k-toolbar').siblings().hide();

                $("#objectViewerWindow").kendoCiresonWindow({
                    width: "550px",
                    height: "400px"
                });

                $('#searchText').keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        filterGrid(myGrid);
                        return false;
                    }
                });

                $("#ObjectClassCombo").kendoComboBox({
                    index: 0,
                    "dataSource": {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": "/ConfigItems/GetConfigItemSearchClasses"
                            }
                        },
                        "schema": {
                            "errors": "Errors"
                        }
                    },
                    "dataTextField": "Item2",
                    "dataValueField": "Item1",
                    "filter": "contains"
                });


                $(".ci-search").on("click", function () {
                    filterGrid(myGrid);
                });
            }

            function bindConfigItemGridFilterMobile() {
                var listControl = $("[data-control-id='" + gridId + "']").data('kendoListView');
                //$(listControl).find('.k-toolbar').siblings().hide();

                $("#objectViewerWindow").kendoCiresonWindow({
                    width: '100%',
                    height: '100%'
                });

                $('.mobilegrid__search__input').keypress(function (event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13') {
                        filterGrid(listControl);
                        return false;
                    }
                });

                $("#ObjectClassCombo").kendoComboBox({
                    index: 0,
                    "dataSource": {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": "/ConfigItems/GetConfigItemSearchClasses"
                            }
                        },
                        "schema": {
                            "errors": "Errors"
                        }
                    },
                    "dataTextField": "Item2",
                    "dataValueField": "Item1",
                    "filter": "contains"
                });


                $('.mobilegrid__search__btn').on("click", function () {
                    filterGrid(listControl);
                });
            };

            function filterGrid(myGrid) {
                var cb = $("#ObjectClassCombo").data("kendoComboBox");
                var classId;
                if (cb == null) {
                    classId = null;
                } else {
                    classId = cb.value();
                }
                if (classId != null) {
                    if (classId.length == 0) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Warning,
                            message: localization.SelectClassAlert
                        });
                    } else {
                        myGrid.dataSource.read();
                        $(myGrid).find('.k-toolbar').siblings().show();
                    }
                }
            }

            var bindCheckBoxes = _.once(function () {
                var currentState;
                var myGrid = $('#' + gridId).data('kendoGrid');
                _.each($('#' + gridId).find(':checkbox'), function (box) {
                    var checkbox = $(box);
                    var toolId = $(box).next().attr('id').toString();
                    //bind event
                    $(checkbox).on('click', function () {

                        currentState = app.gridUtils.savedState.getCurrentState(gridId);

                        if (currentState) {
                            currentState[toolId] = $(this).prop('checked');
                            app.gridUtils.savedState.setSavedState(gridId, currentState);
                        }

                        if ($(this).prop('checked')) {
                            $(this).next().val('true');
                        } else {
                            $(this).next().val('false');

                        }

                        myGrid.dataSource.read();
                    });

                    currentState = app.gridUtils.savedState.getCurrentState(gridId);
                    //set initial checkbox state
                    if (currentState[toolId]) {
                        checkbox.prop("checked", true).change();
                        currentState[toolId] = true;
                        checkbox.next().val(true);
                        myGrid.dataSource.read();
                    } else {
                        checkbox.prop("checked", false).change();
                        checkbox.next().val(false);
                        currentState[toolId] = false;
                    }
                    //update grid state
                    if (currentState) {
                        app.gridUtils.savedState.setSavedState(gridId, currentState);
                    }
                });
            });
            
            var bindActivityCheckboxMobile = _.once(function () {
                var listControl = $("[data-control-id='" + gridId + "']").data('kendoListView');

                if (_.isNull(listControl) || _.isUndefined(listControl)) {
                    return;
                };

                //get toolbar checkbox container
                var cbContainer = listControl.element.prev().find('#toggleActivities');

                //bind event to container
                cbContainer.on('click', function () {
                    var cb = $(this).find(':checkbox');
                    var input = cb.next();

                    //update input value that datasour reads from on read
                    if (cb.prop('checked')) {
                        input.val('true');
                    } else {
                        input.val('false');
                    }

                    listControl.dataSource.read();
                });
            });

            var bindInactiveCheckboxMobile = _.once(function () {
                var listControl = $("[data-control-id='" + gridId + "']").data('kendoListView');

                if (_.isNull(listControl) || _.isUndefined(listControl)) {
                    return;
                };

                //get toolbar checkbox container
                var cbContainer = listControl.element.prev().find('#toggleInactive');

                //read datasource
                listControl.dataSource.read();

                //bind event to container
                cbContainer.on('click', function () {
                    var cb = $(this).find(':checkbox');
                    var input = cb.next();

                    //update input value that datasour reads from on read
                    if (cb.prop('checked')) {
                        input.val('true');
                    } else {
                        input.val('false');
                    }

                    listControl.dataSource.read();
                });
            });

            function bindTabToggles() {
                var myGrid = $('#' + gridId).data('kendoGrid');

                var toggleGridView = function (filteringType) {
                    $('#gridViewId').val(filteringType);

                    if (app.isMobile()) {
                        var listView = $(".mobilegrid").data("kendoListView");
                        listView.dataSource.read();
                    } else {
                        myGrid.dataSource.read();
                    }
                };

                _.each($('.nav-pills li > a'), function (pill) {
                    var link = $(pill);
                    
                    link.click(function () {
                        if (!link.parent().hasClass("active")) {
                            link.parent().toggleClass('active');
                            link.parent().siblings().toggleClass('active');

                            var subType = $(this).attr('data-subtype');
                            toggleGridView(subType);
                        }
                    });
                });
            }

            function clearFilters() {
                $('.btn-clear-grid-filters').on('click', function () {
                    app.storage.gridStates.remove('state_' + gridId);
                    document.location.reload(false);
                });
            };

            function initMobileWiGridSearch() {
                $("input[name=mobileWiGridSearchText]").keypress(function (event) {
                    if (event.keyCode === 13) {
                        app.lib.filterMobileWiGrid(gridId);
                    }
                });
            };

            function bindMyWorkTabToggles() {
                var myGrid = $('#' + gridId).data('kendoGrid');

                var toggleGridView = function (filteringType) {
                    $('#gridViewId').val(filteringType);
                    if (app.isMobile()) {
                        var listView = $(".mobilegrid").data("kendoListView");
                        listView.dataSource.read();
                    } else {

                        _.each(myGrid.options.columns, function (col) {
                            if (col.field === "Title") {
                                if (app.gridUtils.GridSubType == "myapprovals" || app.gridUtils.GridSubType == "mymanualactivities") {
                                    col.template = col.template.replace("highlight-default-icon", "").replace("ra-icon", "ra-icon highlight-default-icon");
                                } else {
                                    col.template = col.template.replace("highlight-default-icon", "").replace("wi-icon", "wi-icon highlight-default-icon");
                                }
                            }
                        });

                        if (app.gridUtils.GridSubType === "myapprovals")
                            myGrid.showColumn("Decision");
                        else
                            myGrid.hideColumn("Decision");

                        myGrid.dataSource.read();
                        myGrid.refresh();
                    }

                };

                var toggleCheckboxes = function (gridType) {
                    if (gridType == "myworkitems") {
                        $("#toggleActivities").show();
                        $("#toggleInactive").show();
                    } else {
                        $("#toggleActivities").hide();
                    }
                }
                _.each($('.nav-pills li > a'), function (pill) {
                    var link = $(pill);

                    link.click(function () {
                        link.parent().toggleClass('active');
                        link.parent().siblings().removeClass('active');

                        vm.grid.GridSubType = $(this).attr('data-subtype');
                        app.gridUtils.GridSubType = vm.grid.GridSubType;  //store on gridutils too for proper link on anchor/title field
                        
                        toggleCheckboxes(vm.grid.GridSubType);
                        toggleGridView(vm.grid.GridSubType);
                    });
                });


            }

            function exportToExcel() {
                $('.btn-grid-export').on('click', function (e) {
                    var kendoGrid = $('#' + gridId).getKendoGrid(); 
                    var exportFileName = $('.page_title').text() + ".xlsx";
                    
                    kendoGrid.options.excel = { fileName: exportFileName, allPages: true, proxyURL: "" };
                    kendoGrid.saveAsExcel();
                });
            };

            callback(toolbarContainer);
        }
    }
    return definition;
});
