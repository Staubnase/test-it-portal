/**
objectPickerPopup
**/
var __objectPickerPopupSingleton;

define(function (require) {
    var tpl = require("text!forms/popups/objectPickerPopup/view.html");
    var singletonName = "objectPickerPopup"; // used to call for singleton
    var definition = {
        template: tpl,
        getPopup: function (classId, BaseId) {
            //BaseId will be used to remove it self from the list.
            //need a specific instance per classId, so this singleton is a hash
            if (__objectPickerPopupSingleton && __objectPickerPopupSingleton[classId]) {
                return __objectPickerPopupSingleton[classId];
            }

            var built = _.template(tpl);
            var ele = $(built());
            var classId = classId;
            var objectPickerPopup = ele.data(singletonName);

            $("body").append(ele);
            __objectPickerPopupSingleton = new ObjectPickerPopup(ele, classId, BaseId);

            return __objectPickerPopupSingleton;
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
                id: self.get.id(),
                className: obj.ObjectClassName
            }
        }

    }

    // CONTROL
    var ObjectPickerPopup = function (targetEle, classId, BaseId) {
        var self = this;
        var html = targetEle;
        var classId = classId;
        var gridHtml = targetEle.find("[data-control-grid]");
        var grid;
        var gridUrl = "/ConfigItems/GetObjectSearchResults";
        var popup;
        var _vm;

        // model getters/setters
        // Props return from grid search to match to generic model
        var _textProp = "DisplayName";
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
                selectObjectText: localization.SelectObject,
                searchValue: "",
                okText: localization.OK,
                cancelText: localization.Cancel,
                search: onSearchClick,
                searchOnEnter: function (e) {
                    if (e.which == 13) {
                        e.preventDefault();
                        onSearchClick();
                    }
                },
                save: onSaveClick,
                cancel: onCancelClick
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
        var onSaveClick = function () {
            var selectedRow = grid.kendoGrid.select();
            if (selectedRow) {
                var obj = _model.getGenericFromObj(grid.kendoGrid.dataItem(selectedRow));
                $(self).trigger("save", obj);
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
            //clear out search box value and search results before opening the window
            self.vm.set("searchValue", "");
            grid.kendoDataSource.data([]);
            popup.kendoWindow.open();
        }
        var closePopup = function () {
            popup.kendoWindow.close();
        }
        var createPopup = function () {
            popup = new Popup();
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
        var Popup = function () {
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

            var createKendoWindow = function () {
                kendoWindow = html.kendoCiresonWindow({
                    title: localization.SelectObject,
                    content: null,
                    width: 680,
                    height: 400,
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
            var height = 150;
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

            var search = function (value) {
                searchValue = value;
                kendoDataSource.read();
                if (!_.isUndefined(BaseId) || BaseId != "")
                    kendoGrid.dataSource.filter([{ field: "Id", operator: "neq", value: BaseId }]);
                kendoDataSource.page(1);
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
                            "data": function () {
                                return {
                                    searchFilter: function () {
                                        return searchValue;
                                    },
                                    classId: function () {
                                        return classId;
                                    },
                                    groupFilter: ""
                                }
                            },
                            "type": "GET"
                        }
                    },
                    "pageSize": 15,
                    "page": 1,
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
                                "ObjectClassId": {
                                    "type": "number"
                                },
                                "ObjectClassName": {
                                    "type": "string"
                                },
                                "DisplayName": {
                                    "type": "string"
                                },
                                "Path": {
                                    "type": "string"
                                },
                                "Hosted": {
                                    "type": "number"
                                },
                                "LastModified": {
                                    "type": "date"
                                },
                                "Status": {
                                    "type": "string"
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
                        "field": "ObjectClassName",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": localization.Path,
                        "field": "Path",
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