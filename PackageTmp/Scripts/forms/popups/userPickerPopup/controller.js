/**
userPickerPopup
**/
var __userPickerPopupSingleton;

define(function (require) {
    var tpl = require("text!forms/popups/userPickerPopup/view.html");
    var singletonName = "userPickerPopup"; // used to call for singleton
    var definition = {
        template: tpl,
        getPopup: function (groupsOnly) {
            // keep popup window as singleton
            if (__userPickerPopupSingleton) {
                return __userPickerPopupSingleton;
            }
            //only build the template if the popup singleton does not exist.
            var built = _.template(tpl);
            var ele = $(built());

            $("body").append(ele);
            __userPickerPopupSingleton = new UserPickerPopup(ele, groupsOnly);
            
            return __userPickerPopupSingleton;
        }
    }

    /* -- UserPickerPopup --
        // params
            targetEle = domEle to create popup with
        // public methods               
            setSaveCallback = function(callback) sets callback to listen for save event
            // callback returns selected user object
    */

    // NAME/ID pair data model
    // used to map name/id to server or viewModel
    // Generic getter and setters:  name,id
    var NameIdModel = function (nameProp, idProp) {
        var self = this;
        this.serverNameProp = nameProp;
        this.serverIdProp = idProp;
        var data = {};
        data[self.serverNameProp];
        data[self.serverIdProp];
        this.set = {
            name: function (val) { data[self.serverNameProp] = val; },
            id: function (val) { data[self.serverIdProp] = val; }
        }
        this.setObj = function (name, id) {
            self.set.name(name); self.set.id(id);
        }
        this.setFromObj = function (obj) {
            self.setObj(obj[self.serverNameProp], obj[self.serverIdProp]);
        }
        this.get = {
            name: function () { return data[self.serverNameProp]; },
            id: function () { return data[self.serverIdProp]; }
        }
        this.getFromObj = function (obj) {
            self.setFromObj(obj);
            return data;
        }
        this.getObj = function (name, id) { if (typeof (name) != "undefined" && typeof (id) != "undefined") { self.setObj(name, id); } return data; }
        this.getGenericFromObj = function (obj) {
            this.setFromObj(obj);
            return {
                name: self.get.name(),
                id: self.get.id()
            }
        }

    }

    // CONTROL
    var UserPickerPopup = function (targetEle, groupsOnly) {
        var self = this;
        var html = targetEle;
        var gridHtml = targetEle.find("[data-control-grid]");
        var grid;
        var gridUrl = groupsOnly
            ? "/User/GetUserSearchResults?groupsOnly=true"
            : "/User/GetUserSearchResults";
        var popup;
        var _vm;

        // model getters/setters
        // Props return from grid search to match to generic model
        var _textProp = "Name";
        var _idProp = "Id";
        var _model = new NameIdModel(_textProp, _idProp);

        // getter/setters        
        this.setSaveCallback = function (callback) {
            $(self).unbind("save")
                .bind("save", function (e, obj) { callback(obj); });
        }
        this.setCancelCallback = function (callback) {
            $(self).unbind("cancel")
                .bind("cancel", function (e, obj) { callback(obj); });
        }

        /*******************/
        /*** CONSTRUCT *****/
        /*******************/

        var __construct = function () {
            _vm = kendo.observable({
                searchText: localization.SearchText,
                selectUserText: groupsOnly ? localization.SelectGroup : localization.SelectUser,
                searchValue: "",
                //okText: localization.OK,
                //cancelText: localization.Cancel,
                search: onSearchClick,
                searchOnEnter: function(e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        onSearchClick();
                    }
                },
                save: onSaveClick,
                cancel: onCancelClick,
                userDataSource: new kendo.data.DataSource(),
                onListViewChanged: function (e) {
                    var index = e.sender.select().index();
                    var dataItem = e.sender.dataSource.view()[index];
                    this.set("selectedUser", dataItem);
                },
                selectedUser: null,
                isDesktopView: !app.isMobileDevice(),
                isMobileView: app.isMobileDevice()

        });
            kendo.bind(html, _vm);
            createPopup();
            createGrid();
            bindEvents();
            self.open = openPopup;
            self.close = closePopup;
            self.vm = _vm;
        }

        /************************/
        /*** CONTROL EVENTS *****/
        /************************/

        var bindEvents = function () {
            
        }

        /******************************/
        /*** CONTROL USER ACTIONS *****/
        /******************************/

        var onSearchClick = function () {
            grid.search(_vm.searchValue);
        }
        var onSaveClick = function (e) {
            var onMobile = app.isMobileDevice();
            if (onMobile) {
                if (!_.isNull(_vm.selectedUser)) {
                    var userObj = _model.getGenericFromObj(_vm.selectedUser);
                    $(self).trigger("save", userObj);
                    closePopup();
                }
            } else {
                var selectedRow = grid.kendoGrid.select();
                if (selectedRow) {
                    var obj = _model.getGenericFromObj(grid.kendoGrid.dataItem(selectedRow));
                    $(self).trigger("save", obj);
                    closePopup();
                }
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
            //clear out search box value and search results before opening the window
            self.vm.set("searchValue", "");
            grid.kendoDataSource.data([]);
            popup.kendoWindow.open();
        }
        var closePopup = function () {
            popup.kendoWindow.close();
        }
        var createPopup = function () {
            popup = new Popup(groupsOnly);
        }        
        var createGrid = function () {
            grid = new Grid({
                html: gridHtml,
                url: gridUrl
            });
        }

        /****************************/
        /*** CONTROL SUBCLASSES *****/
        /****************************/

        /* -- Popup --
            // params
                settings = { }
            // public methods
               
        */
        var Popup = function (groupsOnly) {
            var self = this;
            var kendoWindow;

            // CONSTRUCT

            var __construct = function () {
                createKendoWindow();
                self.kendoWindow = kendoWindow;
            }

            // EVENTS
           
            // ACTIONS

            // METHODS
            
            var createKendoWindow = function() {
                kendoWindow = html.kendoCiresonWindow({
                    title: groupsOnly ? localization.SelectGroup : localization.SelectUser,
                    content: null,
                    width: 680,
                    height: 420,
                    actions: ["Close"]
                }).data("kendoWindow");
            }

            // END

            __construct();
        }

        /* -- Grid --
            // params
                settings = { }
            // public methods
        */
        var Grid = function (settings) {
            // settings
            var self = this;
            var html = settings.html;
            var url = settings.url;
            var height = 200;
            var kendoGrid;
            var kendoDataSource;
            var searchValue;
            // private params           
           

            // CONSTRUCT

            var __construct = function () {
                createKendoDataSource();
                createKendoGrid();
                kendoGrid.pager.element.hide();
                bindEvents();
                self.kendoGrid = kendoGrid;
                self.kendoDataSource = kendoDataSource;
                self.search = search;
            }

            // EVENTS

            var bindEvents = function () {
                kendoGrid.bind("dataBound", function (e) {
                    kendoGrid.pager.element.show();
                });
                kendoGrid.element.on("dblclick", "tbody>tr", onRowDblClick);
            }

            // ACTIONS

            var onRowDblClick = function () {
                kendoGrid.select($(this));
                onSaveClick();
            }

            // METHODS

            var search = function(value){
                searchValue = value;
                kendoDataSource.read();
                kendoDataSource.page(1);

                _vm.set("userDataSource", kendoDataSource);
            }
            var createKendoDataSource = function () {
                kendoDataSource = new kendo.data.DataSource({
                    "transport": {
                        "prefix": "",
                        "read": {
                            "url": url,
                            xhrFields: {
                                withCredentials: true
                            },
                            "data": function() {
                                return {
                                    userFilter: function() {
                                        return searchValue;
                                    },
                                    filterByAnalyst: _vm.filterByAnalyst
                                }
                            },
                            "type": "GET"
                        }
                    },
                    "pageSize": app.isMobileDevice ? 3 : 15,
                    "serverPaging": true,
                    "serverSorting": true,
                    "serverFiltering": true,
                    "serverGrouping": true,
                    "total": 0,
                    "type": "aspnetmvc-ajax",
                    "schema": {
                        "data": "Data",
                        "total": "Total",
                        "errors": "Errors",
                        "model": {
                            "fields": {
                                "Id": {
                                    "type": "string"
                                },
                                "Name": {
                                    "type": "string"
                                },
                                "PrincipalName": {
                                    "type": "string"
                                },
                                "UserName": {
                                    "type": "string"
                                },
                                "Domain": {
                                    "type": "string"
                                },
                                "Company": {
                                    "type": "string"
                                },
                                "Title": {
                                    "type": "string"
                                },
                                "FirstName": {
                                    "type": "string"
                                },
                                "LastName": {
                                    "type": "string"
                                },
                                "EmployeeId": {
                                    "type": "string"
                                },
                                "Analyst": {
                                    "type": "number"
                                }
                            }
                        }
                    }
                });
            }
            var createKendoGrid = function () {
                kendoGrid = html.kendoGrid({
                    height: height,
                    dataSource: kendoDataSource,
                    selectable: "Single,Row",
                    sortable: { mode: "multiple" },
                    pageable: true,
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: localization.Startswith,
                                contains: localization.Contains,
                                eq: localization.Isequalto,
                                neq: localization.Isnotequalto
                            },
                            date: {
                                gte: localization.GreaterOrEqual,
                                gt: localization.GreaterThan,
                                lte: localization.LessOrEqual,
                                lt: localization.LessThan
                            }
                        }
                    },
                    autoBind: false,
                    columns: [{
                        "title": localization.id,
                        "hidden": true,
                        "field": "Id",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.FirstName,
                        "attributes": {
                            "class": "grid-highlight-column"
                        },
                        "width": "110px",
                        "field": "FirstName",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.LastName,
                        "attributes": {
                            "class": "grid-highlight-column"
                        },
                        "width": "110px",
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
                    }],
                }).data("kendoGrid");
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