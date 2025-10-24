/**
multipleObjectPickerPopup
**/

define(function (require) {
    var tpl = require("text!/scripts/forms/popups/multipleObjectPickerPopup/view.html");
    var singletonName = "objectPickerPopup"; // used to call for singleton
    var definition = {
        template: tpl,
        getPopup: function (classId, columnNames, gridUrl, dataSourceFilter, isConfigItem, isMailRecipient, relationshipId) {
            var built = _.template(tpl);
            var templateFrag = $(built());
            //var classId = classId;
            //var columnNames = columnNames;
            //var gridUrl = gridUrl;
            // keep popup window as singleton
            // check to see if dom element exists, if so get userPickerPopup object from it
            var ele = $('[datasingleton="' + singletonName + '"]');
            var objectPickerPopup = ele.data(singletonName);
            if (!ele.length) {
                ele = templateFrag;
                $("body").append(ele);
                objectPickerPopup = new ObjectPickerPopup(ele, classId, columnNames, gridUrl, dataSourceFilter, isConfigItem, isMailRecipient, relationshipId);
                ele.data(singletonName, objectPickerPopup);
            }
            return objectPickerPopup;

        }
    }

    /* -- ObjectPickerPopup --
        // params
            targetEle = domEle to create popup with
        // public methods               
            open = function(classId){ // opens popup with this classId }
            close = function(){ // closes popup }
            setSaveCallback = function(callback) sets callback to listen for save event
            // callback(obj){  } returns selected user object
    */
    
    // CONTROL
    var ObjectPickerPopup = function (targetEle, classId, columnNames, gridUrl, dataSourceFilter, isConfigItem, isMailRecipient, relationshipId) {
        var self = this;
        var html = targetEle;
        var classId = classId;
        var columnNames = columnNames;
        var controllerUrl = gridUrl;
        var filter = dataSourceFilter;
        var isConfigItem = isConfigItem;
        var isMailRecipient = isMailRecipient; //true for Send Email TO and CC fields
        var popup;
        var _vm;

        // model getters/setters
        // Props return from grid search to match to generic model
        var _textProp = "DisplayName";
        var _idProp = "Id";
       // var _model = new NameIdModel(_textProp, _idProp);

        // getter/setters        
        this.setSaveCallback = function (callback) {
            $(self).unbind("save")
                .bind("save", function (e, objects) { callback(objects); });
        }
        this.setCancelCallback = function (callback) {
            $(self).unbind("cancel")
                .bind("cancel", function (e, objects) { callback(objects); });
        }

        /*******************/
        /*** CONSTRUCT *****/
        /*******************/

        var __construct = function () {
            _vm = kendo.observable({
                save: onSaveClick,
                cancel: onCancelClick
            });
            kendo.bind(html, _vm);
            createPopup();
            bindEvents();
            self.open = openPopup;
            self.close = closePopup;
        }

        /************************/
        /*** CONTROL EVENTS *****/
        /************************/

        var bindEvents = function () {

        }

        /******************************/
        /*** CONTROL USER ACTIONS *****/
        /******************************/

        var onSaveClick = function () {
            var selectedRows = popup.grid2.dataSource.data();
            if (selectedRows) {
                $.each(selectedRows, function (i, itm) {
                    if (_.isUndefined(itm.BaseId)) { itm.BaseId = itm.Id;}
                    $(self).trigger("save", itm);
                });
                closePopup();
            }
        }
        var onCancelClick = function () {
            $(self).trigger("cancel");
            closePopup();
        }

        /*************************/
        /*** CONTROL METHODS *****/
        /*************************/

        var openPopup = function () {
            popup.actions.clearSearchText();
            popup.gridFunctions.clear();
            popup.kendoWindow.open();
        }
        var closePopup = function () {
            popup.kendoWindow.close();
        }
        var createPopup = function () {
            popup = new Popup();
        }

        /****************************/
        /*** CONTROL SUBCLASSES *****/
        /****************************/

        /* -- Popup --
            // params
                settings = { }
            // public methods
               
        */
        var Popup = function () {
            var self = this;
            var kendoWindow;

            var gridUrl = (!_.isUndefined(controllerUrl) && !_.isNull(controllerUrl)) ? controllerUrl : "/Search/GetSearchObjectsWithEnumObjectByClassId";
            var comboUrl = "/Search/GetSearchClasses";
            var combo;
            var grid;
            var grid2;
            var searchText;
            var gridFunctions;
            var actions;
            var outObjs = new kendo.data.ObservableArray([]);
            // CONSTRUCT
            var __construct = function () {
                createKendoWindow();
                createCombo();
                createGrid();
                createGrid2();
                bindEvents();
                self.kendoWindow = kendoWindow;
            }

            // EVENTS

            // ACTIONS
           

            var callback = function () { }

            var actions = new (function () {
                this.addObject = function () {
                    var selected = grid.select();
                    for (var i = 0, max = selected.length; i < max; i++) {
                        var item = grid.dataItem(selected[i]);
                        if (item) grid2Funcs.addItem(item);
                    }

                    //var item = grid.dataItem(grid.select());
                    //if (item) grid2Funcs.addItem(item);
                }
                this.removeObject = function () {
                    //grid2.removeRow(grid2.select());
                    var selected = grid2.select();
                    for (var i = 0, max = selected.length; i < max; i++) {
                        grid2.removeRow(selected[i]);
                    }
                }
                this.search = function () {
                    var ele = html.find('[data-objectpicker-action-value="search"]');
                    searchText = (ele) ? ele.val() : "";
                    grid.dataSource.read();

                    //used on RelatesToWorkItem relatinship, exclude current workitem from list
                    if (!_.isUndefined(filter) && !_.isNull(filter)) {
                        grid.dataSource.filter(filter);
                    }
                    grid.dataSource.page(1);
                }
                this.clearSearchText = function () {
                    html.find('[data-objectpicker-action-value="search"]').val('');
                    searchText = "";
                }
            })();
            self.actions = actions;

            var gridFuncs = new (function () {
                this.searchFilter = function () {
                    return { searchFilter: searchText, classId: comboFuncs.getIdValue, columnNames: columnNames, relationshipId: relationshipId };
                }
                this.onChange = function () {

                }
                this.onDataBound = function () {
                    if (grid.dataSource.totalPages() == 1) {
                        grid.pager.element.hide();
                    }
                }
                this.clear = function () {
                    self.grid.dataSource.data([]);
                    while (outObjs.length != 0) {
                        $.each(self.grid2.items(), function (ii, iitem) {
                            self.grid2.removeRow(iitem)
                        });
                    }
                }
                this.dblClick = function () {
                    // $(this) add to grid 2
                    grid2Funcs.addItem(grid.dataItem($(this)));
                }
                
            })();
            self.gridFunctions = gridFuncs;

            var grid2Funcs = new (function () {
                this.addItem = function (item) {
                    var a = true;
                    $.each(outObjs, function (i, itm) {
                        if (item.uid == itm.uid) {
                            a = false;
                        }
                    })
                    if (a) outObjs.push(item);
                }
            })();

            var comboFuncs = new (function () {
                this.getIdValue = function () {
                    var item1 = self.combo.value();
                    return !_.isNull(item1) ? item1 : classId.toLowerCase();
                }
            })();

            // METHODS
            var createKendoWindow = function () {
                kendoWindow = html.kendoCiresonWindow({
                    title: localization.SelectObject,
                    content: null,
                    width: 750,
                    height: 710,
                    actions: ["Close"],
                    activate: function () {
                        self.combo.value(classId.toLowerCase());
                    }
                }).data("kendoWindow");
            }


            //combo
            var createCombo = function () {
                self.combo = html.find("[data-objectpicker-control='comboBox']").kendoComboBox({
                    "dataSource": {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": comboUrl,
                                "xhrFields": {withCredentials: true},
                                "data": { classId: classId }
                            }
                        },
                        "schema": {
                            "errors": "Errors"
                        }
                    },
                    "dataTextField": "Item2",
                    "autoBind": true,
                    "dataValueField": "Item1",
                    "filter": "contains"
                }).data("kendoComboBox");
            }

            //first grid
            var createGrid = function () {
                var gc = html.find('[data-objectpicker-control="objectPickerGrid"]');
                var gridSettings = function () {
                    var dataSource = {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": gridUrl,
                                "data": gridFuncs.searchFilter,
                                "type": "GET",
                                "cache": false
                            }
                        },
                        "pageSize": 5,
                        "type": "aspnetmvc-ajax",
                        "schema": {
                            "data": "Data",
                            "total": "Total",
                            "errors": "Errors",
                        }
                    }
                    var columns = [
                        {
                            "title": "Id",
                            "hidden": true,
                            "field": "Id",
                            "filterable": { },
                            "encoded": true
                        }, {
                            "title": localization.DisplayName,
                            "attributes": {
                                "class": "grid-highlight-column"
                            },
                            "field": "DisplayName",
                            "filterable": { },
                            "encoded": true
                        }, {
                            "title": localization.Class,
                            "field": "FullClassName",
                            "hidden": app.isMobile(),
                            "filterable": { },
                            "encoded": true
                        }, {
                            "title": localization.Path,
                            "field": "Path",
                            "hidden": app.isMobile(),
                            "filterable": { },
                            "encoded": true
                        }
                    ];
                    var userClassId = "10a7f898-e672-ccf3-8881-360bfb6a8f9a";
                    var userColumns = [
                       {
                           "title": localization.FirstName,
                           "attributes": {
                               "class": "grid-highlight-column"
                           },
                           "field": "FirstName",
                           "filterable": {},
                           "encoded": true
                       }, {
                           "title": localization.LastName,
                           "attributes": {
                               "class": "grid-highlight-column"
                           },
                           "field": "LastName",
                           "filterable": {},
                           "encoded": true
                       }, {
                           "title": localization.Title,
                           "field": "Title",
                           "filterable": {},
                           "encoded": true
                       }, {
                           "title": localization.UserName,
                           "field": "UserName",
                           "filterable": {},
                           "encoded": true
                       },{
                           "title": localization.Domain,
                           "field": "Domain",
                           "filterable": {},
                           "encoded": true
                       },{
                           "title": localization.Company,
                           "field": "Company",
                           "filterable": {},
                           "encoded": true
                       }
                    ];
                    //use this column options for Send Email recipient selection to show user email
                    var userMailColumns = [
                        {
                            "title": localization.FirstName,
                            "attributes": {
                                "class": "grid-highlight-column"
                            },
                            "field": "FirstName",
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.LastName,
                            "attributes": {
                                "class": "grid-highlight-column"
                            },
                            "field": "LastName",
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.Email,
                            "field": "Email",
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.DisplayName,
                            "field": "DisplayName",
                            "filterable": {},
                            "encoded": true
                        }
                    ];
                    return {
                        "columns": (isMailRecipient) ? userMailColumns : (classId.toLowerCase() == userClassId) ? userColumns : columns,
                        "sortable": {
                            "mode": "multiple"
                        },
                        "selectable": "Multiple, Row",
                        "filterable": {
                            "operators": {
                                "string": {
                                    "startswith": localization.Startswith,
                                    "contains": localization.Contains,
                                    "eq": localization.Isequalto,
                                    "neq": localization.Isnotequalto
                                }
                            }
                        },
                        "columnMenu": false,
                        "autoBind": false,
                        "dataSource": dataSource,
                        "pageable": true
                    }
                }
                grid = gc.kendoGrid(gridSettings()).data("kendoGrid");
                gridFuncs.onDataBound();
                gc.on("dblclick", "tbody>tr", gridFuncs.dblClick);
                self.grid = grid;
            }

            //second grid
            var createGrid2 = function () {
                var gc = html.find('[data-objectpicker-control="objectPickerGrid2"]');
                var dataSource = {
                    "transport": {
                        "prefix": "",
                        "read": {
                            "url": ""
                        }
                    },
                    "pageSize": 5,
                    "type": "aspnetmvc-ajax",
                    data: {
                        Data: outObjs,
                        Total: outObjs.length
                    },
                    "schema": {
                        "data": "Data",
                        "total": "Total",
                        "errors": "Errors",
                    }
                }
                var columns = [
                        {
                            "title": "Id",
                            "hidden": true,
                            "field": "Id",
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.DisplayName,
                            "attributes": {
                                "class": "grid-highlight-column"
                            },
                            "field": "DisplayName",
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.Class,
                            "field": "FullClassName",
                            "hidden": app.isMobile(),
                            "filterable": {},
                            "encoded": true
                        }, {
                            "title": localization.Path,
                            "field": "Path",
                            "hidden": app.isMobile(),
                            "filterable": {},
                            "encoded": true
                        }
                ];
                var userClassId = "10a7f898-e672-ccf3-8881-360bfb6a8f9a";
                var userColumns = [
                   {
                       "title": localization.FirstName,
                       "attributes": {
                           "class": "grid-highlight-column"
                       },
                       "field": "FirstName",
                       "filterable": {},
                       "encoded": true
                   }, {
                       "title": localization.LastName,
                       "attributes": {
                           "class": "grid-highlight-column"
                       },
                       "field": "LastName",
                       "filterable": {},
                       "encoded": true
                   }, {
                       "title": localization.Title,
                       "field": "Title",
                       "filterable": {},
                       "encoded": true
                   }, {
                       "title": localization.UserName,
                       "field": "UserName",
                       "filterable": {},
                       "encoded": true
                   }, {
                       "title": localization.Domain,
                       "field": "Domain",
                       "filterable": {},
                       "encoded": true
                   }, {
                       "title": localization.Company,
                       "field": "Company",
                       "filterable": {},
                       "encoded": true
                   }
                ];
                //use this column options for Send Email recipient selection to show user email
                var userMailColumns = [
                    {
                        "title": localization.FirstName,
                        "attributes": {
                            "class": "grid-highlight-column"
                        },
                        "field": "FirstName",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.LastName,
                        "attributes": {
                            "class": "grid-highlight-column"
                        },
                        "field": "LastName",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.Email,
                        "field": "Email",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.DisplayName,
                        "field": "DisplayName",
                        "filterable": {},
                        "encoded": true
                    }
                ];
                grid2 = gc.kendoGrid({
                    "columns": (isMailRecipient) ? userMailColumns : (classId.toLowerCase() == userClassId) ? userColumns : columns,
                    "pageable": true,
                    "dataSource": dataSource,
                    "selectable": "Multiple, Row",
                    "filterable": {
                        "operators": {
                            "string": {
                                "startswith": localization.Startswith,
                                "contains": localization.contains,
                                "eq": localization.Isequalto,
                                "neq": localization.Isnotequalto
                            }
                        }
                    },

                    "columnMenu": false
                }).data("kendoGrid");

                self.grid2 = grid2;
            }

            //bind events
            var bindEvents = function () {
                html.find('[data-objectpicker-action]').each(function (i, ele) {
                    var action = $(this).attr('data-objectpicker-action');
                    var nd = ele.nodeName.toLowerCase();
                    if (!actions[action]) { app.lib.exception("The method action." + action + " does not exist"); }
                    if ((nd == "input" && $(this).attr("type").toLowerCase() == "text") || nd == "textarea") {
                        $(this).bind('enter', actions[action]);
                    } else {
                        $(this).click(actions[action]);
                    }
                });
            }
            // END

            __construct();
        }

        /*************/
        /*** END *****/
        /*************/








        __construct();


    }
    return definition;

});