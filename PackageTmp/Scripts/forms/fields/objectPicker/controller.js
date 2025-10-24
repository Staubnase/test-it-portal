/**
objectPicker
**/

define(function (require) {
    var tpl = require("text!forms/fields/objectPicker/view.html");
    var objectPickerPopup = require("forms/popups/objectPickerPopup/controller");
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //console.log(node);
            boundObj = node.vm;
            name = node.PropertyName;
            // add default values
            var properties = {
                Required: node.Required,
                Disabled: node.disabled,
                ExtraProps: false,
                ClassId: false // this is a required
            }
            $.extend(true, properties, node);
            var built = _.template(tpl);
            var templateFrag = $(built(properties));
            var popupWindow = objectPickerPopup.getPopup(properties.ClassId, boundObj.BaseId);

            // comment out next two lines to go back to using app.controls
            var objectPicker = new Control(templateFrag.find("[data-control='objectPicker']"), boundObj, name, popupWindow, properties.ClassId, callback);
            templateFrag.find("[data-control='objectPicker']").attr("data-control", "objectPickerBound");

            callback(templateFrag);
        }
    }

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

    function isArray(ob) {
        return Object.prototype.toString.call(ob) === '[object Array]';
    }
    // CONTROL
    var Control = function (targetEle, boundObj, name, popupWindow, classId, callback) {
        
        // control parameters
        var targetEle = targetEle;
        var extraProps = targetEle.attr("data-control-extra");
        var autoCompleteUrl = "/ConfigItems/GetObjectSearchResults";
        var detailsPopupUrl = "/Search/ObjectViewer";
        var objectExtraUrl = "/Search/GetObjectPropertiesByProjection?projectionId=490ab845-b14c-1d91-c39f-bb9e8a350933&id=";
        var boundObj = boundObj;
        var propName = name;
        var popupWindow = popupWindow;
        var classId = classId;

        // viewModel getters/setters
        var _textProp = "DisplayName";
        var _idProp = "BaseId";
        var _model = new NameIdModel(_textProp, _idProp);
        app.lib.forceKendoProp(boundObj, propName, kendo.observable(_model.getObj(null, null)));
        var get = {
            obj: function () { return boundObj[propName].length > 0 ? getIndexZero(boundObj[propName], null) : boundObj[propName]; },
            name: function () { return boundObj[propName].length > 0 ? getIndexZero(boundObj[propName], _textProp) : boundObj[propName][_textProp]; },
            id: function () { return boundObj[propName].length > 0 ? getIndexZero(boundObj[propName], _idProp) : boundObj[propName][_idProp]; }
        }
        var set = {
            obj: function (name, id, className) {
                if (boundObj[propName].length > 0) {

                    boundObj[propName][0].set(_idProp, id);
                    boundObj[propName][0].set(_textProp, name);
                    boundObj[propName][0].set("ClassName", className);
                } else {
                    boundObj[propName].set(_idProp, id);
                    boundObj[propName].set(_textProp, name);
                    boundObj[propName].set("ClassName", className);
                }
            }
        }

        var getIndexZero = function (obj, property) {
            var _obj = obj[0];
            if (classId.toLowerCase() == _obj["ClassTypeId"].toLowerCase()) {
                if (property != null) {
                    return _obj[property];
                }
                else {
                    return _obj;
                }
            }
            else {
                return null;
            }

        }

        

        // private properties
        var helperBlock;
        var autoComplete;


        /*******************/
        /*** CONSTRUCT *****/
        /*******************/

        var __construct = function () {
            createHelperBlock();
            createAutocomplete();
            refreshDisplayValues();
            bindEvents();
        }

        /************************/
        /*** CONTROL EVENTS *****/
        /************************/

        var bindEvents = function () {
            boundObj[name].bind("change", function () {
                refreshDisplayValues();
            });
        }

        /******************************/
        /*** CONTROL USER ACTIONS *****/
        /******************************/

        var onAutoCompleteValueChanged = function (obj) {
            if (obj) {
                set.obj(obj.name, obj.id, obj.className);
            } else {
                set.obj(null, null, null);
            }
        }
        var onSearchIconClick = function () {
            popupWindow.setSaveCallback(function (obj) {
                if (boundObj.BaseId != obj.id) {
                    set.obj(obj.name, obj.id, obj.className);
                }
            });
            popupWindow.open();
        }


        /*************************/
        /*** CONTROL METHODS *****/
        /*************************/

        var isModelSet = function () {
            return (boundObj && boundObj[name] && get.name() && get.id()) ? true : false;
        }
        var hasExtraProps = function () {
            return (extraProps && extraProps != "false");
        }
        var createHelperBlock = function () {
            if (hasExtraProps()) {
                helperBlock = new HelperBlock({
                    url: objectExtraUrl,
                    container: targetEle.parent(),
                    props: extraProps.split(",")
                });
            }
        }
        var createAutocomplete = function () {
            autoComplete = new AutoComplete({
                url: autoCompleteUrl,
                detailsUrl: detailsPopupUrl,
                targetEle: targetEle,
                callback: onAutoCompleteValueChanged
            });
        }
        var refreshDisplayValues = function () {
            if (isModelSet()) {
                if (helperBlock) {
                    helperBlock.setDisplay(get.id());
                }
                if (autoComplete) {
                    autoComplete.setValue(get.name(), get.id());
                }
            }
        }

        /****************************/
        /*** CONTROL SUBCLASSES *****/
        /****************************/

        /* -- HelperBlock --
            // params
                settings = {
                    url: "", // url to get object extra props
                    container: jqEle, // where helpblock will get appended
                    props: [], // array of property names to be displayed in order
                }
            // public methods
                obj.setDisplay(objectId) /// goes to server then displays helper data for that objectId
        */
        var HelperBlock = function (settings) {
            var self = this;
            var html;
            var _vm;
            var container = settings.container;
            var url = settings.url;
            var props = settings.props;

            // CONSTRUCT

            var __construct = function () {
                createHtml();
                createViewModel();
                bindEvents();
                self.setDisplay = _vm.getUserObjectData;
            }

            // EVENTS

            var bindEvents = function () {
                _vm.bind("change", function (e) {
                    if (e.field == "extraPropText") {
                        _vm.set("isVisible", (_vm.extraPropText.length > 0));
                    } else if (e.field == "data") {
                        setExtraPropsDisplay();
                    }
                });
            }

            // ACTIONS

            // METHODS

            var createHtml = function () {
                // note: move this to definition.html
                html = $('<span>', { "class": "help-block", "data-bind": "text: extraPropText, visible: isVisible" });
                setTimeout(function () {
                    container.append(html);
                }, 100);
            }
            var createViewModel = function () {
                _vm = kendo.observable({
                    isVisible: false,
                    extraPropText: "",
                    data: {},
                    getUserObjectData: getUserObjectData
                });
                kendo.bind(html, _vm);
            }

            var getUserObjectData = function (objectId) {
                $.get(url + objectId, function (data) {
                    if (data && data[0]) {
                        data = data[0];
                    }
                    _vm.set("data", data);
                    setExtraPropsDisplay();
                });
            }

            var setExtraPropsDisplay = function () {
                var str = "";
                $.each(props, function (i, item) {
                    if (_vm.data[item]) {
                        str += _vm.data[item] + ", ";
                    }
                });
                _vm.set("extraPropText", str.substring(0, str.length - 2));
            }


            // END

            __construct();
        }

        /* -- Autocomplete --
            // params
                settings = {
                    url: "", // url for datasource
                    targetEle: jqEle, // element to apply autocomplete
                    callback: function(obj){} // fired when object is change via autocomplete, provides selected object or null values
                }
            // public methods
        */
        var AutoComplete = function (settings) {
            // settings
            var self = this;
            var targetEle = settings.targetEle;
            var url = settings.url;
            var detailsUrl = settings.detailsUrl;
            var placeHolderText = (targetEle.attr('disabled')) ? "" : localization.SearchPlaceholder;
            var callback = settings.callback; // 
            // private params
            var autoComplete;
            var dataSource;
            var focusedItemIndex = false
            var searchBtn;
            var detailsBtn;
            var detailsPopupEle;
            var detailsPopup;
            var _textProp = "DisplayName";
            var _idProp = "Id";
            var _model = new NameIdModel(_textProp, _idProp);


            // CONSTRUCT

            var __construct = function () {
                createKendoDataSource();
                createKendoAutoComplete();
                createSearchButton();
                createDetailsButton();
                createDetailsPopup();
                bindEvents();
                self.setValue = setValue;
            }

            // EVENTS

            var bindEvents = function () {
                //This code is comment out since it is working and it fixed the issue regarding bug-26148 issue #17
                //autoComplete.bind("select", function (e) {
                //    var obj = this.dataItem(e.item.index());
                //    callback(_model.getGenericFromObj(obj));
                //});
                autoComplete.bind("change", function (e) {
                    validateAutoCompleteValue();
                    callback(_model.getGenericFromObj(getDataSourceMatch(autoComplete.value())));
                });
                autoComplete.bind("dataBound", function (e) {
                    e.sender.ul.find("li").first().addClass("k-state-hover");
                });
                targetEle.on("keyup", function (e) {
                    if (e.which == 40 && !autoComplete.ul.is(":visible")) {
                        autoComplete.search(autoComplete.value());
                        validateAutoCompleteValue();
                    }
                    else if (e.which != 13) {
                        focusedItemIndex = getFocusedIndex();
                        validateAutoCompleteValue();
                    }

                });
                targetEle.on("keydown", function (e) {
                    if (e.which == 13) {
                        // enter click select first match in dropdown or focused
                        var children = autoComplete.ul.children();
                        if (children.length) {
                            var index = (focusedItemIndex !== false) ? focusedItemIndex : 0;
                            //console.log("in: " + index);
                            autoComplete.select(autoComplete.ul.children().eq(index));
                            validateAutoCompleteValue();
                        }
                    }
                });

                //handle copy-paste event
                targetEle.on("input propertychange", function (e) {
                    autoComplete.search(e.currentTarget.value);
                    validateAutoCompleteValue();
                });

                detailsPopup.bind("close", function () {
                    detailsPopupEle.find(".k-content").html('');
                });

                if (boundObj.isDisabled) searchBtn.hide();

                searchBtn.click(onSearchIconClick);
                detailsBtn.click(onDetailsBtnClick);
            }

            // ACTIONS

            var onDetailsBtnClick = function () {
                var link = app.gridUtils.getObjectLinkUrl(boundObj[propName]);
                var isDynamicData = link.indexOf("DynamicData") > 0;

                //show popup when dynamic data is acessed on a non-license cmdb portal
                if (isDynamicData && !session.consoleSetting.CMDBPortalLicense.IsValid) {
                    detailsPopup.refresh({
                        url: detailsUrl,
                        data: { id: _model.get.id() }
                    });
                    detailsPopupEle.find(".k-content").html("<div style='padding: 55px'>Loading...</div>");
                    detailsPopup.title(_model.get.name()).center().open();
                } else {
                    window.open(link, "_blank");
                }
            }


            // METHODS

            var createSearchButton = function () {
                searchBtn = $("<div>", { "class": "searchIcon", "data-control-action": "userPickerWindow" });
                var iconColor = !targetEle.attr('disabled') ? "text-primary" : "";
                var a = (app.isMobileDevice()) ? $("<i>", { "class": "fa fa-search cursor-pointer " + iconColor }) : $("<div>", { "class": "search fa fa-search cursor-pointer " + iconColor });
                searchBtn.append(a);
                searchBtn.insertAfter(targetEle);
            }
            var createDetailsButton = function () {
                var link = app.gridUtils.getObjectLinkUrl(boundObj[propName]);
                var isDynamicData = link.indexOf("DynamicData") > 0;
                var iconColor = !targetEle.attr('disabled') ? "text-primary" : "";

                var isOpenInNewTab = (link != false) ? true : false;
                if (isDynamicData) {
                    isOpenInNewTab = session.consoleSetting.CMDBPortalLicense.IsValid ? true : false;
                }

                if (isOpenInNewTab) {
                    detailsBtn = (app.isMobileDevice()) ? $("<i>", { "class": "fa fa-external-link cursor-pointer info-icon " + iconColor }) : $("<div>", { "class": "open-modal fa fa-external-link" });
                } else {
                    detailsBtn = (app.isMobileDevice()) ? $("<i>", { "class": "fa fa-info-circle cursor-pointer info-icon " + iconColor }) : $("<div>", { "class": "open-modal fa fa-info-circle" });
                }
                
                detailsBtn.insertBefore(targetEle);
                detailsBtn.hide();
            }
            var createKendoDataSource = function () {
                dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: url,
                            data: {
                                searchFilter: function () {
                                    return autoComplete.value();
                                },
                                classId: classId
                            },
                            type: "GET"
                        }
                    },
                    schema: {
                        data: "Data",
                        total: "Total",
                        errors: "Errors"
                    },
                    serverFiltering: true
                });
            }

            var preventClosing = 'init';
            var createKendoAutoComplete = function () {
                autoComplete = targetEle.kendoAutoComplete({
                    dataTextField: _textProp,
                    suggest: false,
                    placeholder: placeHolderText,
                    valuePrimitive: false,
                    dataSource: dataSource,
                    close: function (e) {
                        if ($(window).scrollTop() + $(window).height() == $(document).height() && preventClosing == 'open') {
                            e.preventDefault();
                            preventClosing = 'close';
                        }
                    },
                    change: function (e) {
                        preventClosing = 'change';
                        e.sender.close();
                        
                    },
                    open: function (e) {
                        preventClosing = 'open';
                    },
                    enable: (targetEle.attr('disabled')) ? false : true,
                    clearButton: false
                }).data("kendoAutoComplete");
            }
            var createDetailsPopup = function () {
                detailsPopupEle = $("<div>");
                detailsPopupEle.appendTo("body");
                detailsPopup = detailsPopupEle.kendoCiresonWindow({
                    title: "",
                    width: 550,
                    height: 400,
                    actions: ["Close"]
                }).data("kendoWindow");
            }
            var validateAutoCompleteValue = function () {
                var match = getDataSourceMatch(autoComplete.value());
                if (!match) {
                    detailsBtn.hide();
                    if (targetEle.is(":focus")) {
                        // invalid while typing
                        targetEle.css({
                            "text-decoration": "none",
                            "background-color": "#fff"
                        });
                    } else {
                        // invalid after blur
                        targetEle.css({
                            "text-decoration": "none",
                            "background-color": "#FBE3E4"
                        });
                    }
                } else {
                    // valid
                    detailsBtn.show();
                    targetEle.css({
                        "text-decoration": "underline",
                        "background-color": "#fff"
                    });
                }
            }
            var getDataSourceMatch = function (val) {
                var ds = _.clone(dataSource);
                var view = ds.view();

                // matching needs to be case insensitive
                var match = false;
                $.each(view, function (i, item) {
                    if (item.DisplayName.toLowerCase() == val.toLowerCase()) {
                        match = item;
                    }
                });
                return match;
            }
            var setValue = function (name, id) {
                dataSource.add(_model.getObj(name, id));
                autoComplete.value(name);
                validateAutoCompleteValue();
            }
            var getFocusedIndex = function () {
                var focused = autoComplete.ul.find(".k-state-focused");
                return (focused.length) ? focused.index() : false;
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