/**
userPicker
**/

define(function (require) {
    var tpl = require("text!forms/fields/userPicker/view.html");
    var userPickerPopup = require("forms/popups/userPickerPopup/controller");
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            if (_.isUndefined(node.vm)) {
                boundObj = node;
                name = node.PropertyName;
            } else {
                boundObj = node.vm;
                name = node.PropertyName;
            }
            // add default values
            var properties = {
                Required: node.Required, // TODO: yo, this is stupid. fix it.
                Disabled: node.disabled, // TODO: yo, this is stupid. fix it.
                ExtraProps: false,
                Delay: 200,
                MinLength: 3,
                FilterByAnalyst: false,
                MaxNumberOfResults: 10,
                TypeObject: boundObj[name]
            }
            $.extend(true, properties, node);
            var built = _.template(tpl);
            var templateFrag = $(built(properties));
            var popupWindow = userPickerPopup.getPopup();

            // comment out next two lines to go back to using app.controls
            var objectPicker = new Control(templateFrag.find("[data-control='userPicker']"), boundObj, name, popupWindow);
            templateFrag.find("[data-control='userPicker']").attr("data-control", "userPickerBound");

            callback(templateFrag);
        }
    }

    var TeamsUserPresence = function (elem, obj) {
        var html = '<mgt-person person-query="' + obj.Email + '" show-presence person-card="click">' +
                        '<template data-type="person-card">' +
                            '<mgt-person-card inherit-details>' +
                                '<template data-type="additional-details">' +
                                '</template>' +
                            '</mgt-person-card>' +
                        '</template>' +
                    '</mgt-person>';

        $(elem).html(html);
    };

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
    var Control = function (targetEle, boundObj, name, popupWindow) {
        // control parameters
        var targetEle = targetEle;
        var extraProps = targetEle.attr("data-control-extra");
        var delay = targetEle.attr("data-control-delay");
        var minLength = targetEle.attr("data-control-minlength");
        var filterByAnalyst = targetEle.attr("data-control-filterByAnalyst");
        var maxNumberOfResults = targetEle.attr("data-control-maxNumberOfResults");
        var autoCompleteUrl = "/api/V3/User/GetUserList";
        var detailsPopupUrl = "/Search/ObjectViewer";
        var objectExtraUrl = "/Search/GetObjectPropertiesByProjection?projectionId=490ab845-b14c-1d91-c39f-bb9e8a350933&id=";
        var boundObj = boundObj;
        var propName = name;
        var popupWindow = popupWindow;

        // viewModel getters/setters
        var _textProp = "DisplayName";
        var _idProp = "BaseId";
        var _model = new NameIdModel(_textProp, _idProp);
        app.lib.forceKendoProp(boundObj, propName, kendo.observable(_model.getObj(null, null)));
        var get = {
            obj: function () { return boundObj[propName]; },
            name: function () { return boundObj[propName][_textProp]; },
            id: function () { return boundObj[propName][_idProp]; }
        }
        var set = {
            obj: function (name, id) {
                boundObj[propName].set(_idProp, id);
                boundObj[propName].set(_textProp, name);
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
                set.obj(obj.name, obj.id);
            } else {
                set.obj(null, null);
            }
        }
        var onSearchIconClick = function () {
            popupWindow.setSaveCallback(function (obj) {
                set.obj(obj.name, obj.id);
            });
            popupWindow.vm.filterByAnalyst = filterByAnalyst;
            popupWindow.open();
        }

        /*************************/
        /*** CONTROL METHODS *****/
        /*************************/

        //do we have a model set in the bound object
        //not sure what the get object is -jk
        var isModelSet = function () {
            return (boundObj && boundObj[name] && get.name() && get.id()) ? true : false;
        }

        //lets check for boundObject that is nulled
        var isModelSetNulled = function () {
            return (boundObj && boundObj[name] && _.isNull(get.name()) && _.isNull(get.id()) ) ? true : false;
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
                delay: delay,
                minLength: minLength,
                callback: onAutoCompleteValueChanged,
                maxNumberOfResults: maxNumberOfResults
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
                /**Added to fix Task/BUG 2148: When using the Assign to Analyst by group task (where there is no assigned to user) in the portal, 
                then select an analyst and click "cancel" the analyst still appears on the form.**/
            else if (isModelSetNulled()) {
                if (autoComplete) {
                    autoComplete.setValue("", null);
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
                    delay: "", //numeric delay in ms before search is performed
                    minLength: "", //numeric length of chars before search is performed
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

            var getDisplayName = function (obj) {
                var displayName = "";
                if (!_.isUndefined(obj.Name) && !_.isNull(obj.Name)) {
                    displayName = obj.Name;
                }
                if (!_.isUndefined(obj.DisplayName) && !_.isNull(obj.DisplayName)) {
                    displayName = obj.DisplayName;
                }
                return displayName;
            }

            var setExtraPropsDisplay = function () {
                var str = "";
                $.each(props, function (i, item) {
                    var dataItem = _vm.data[item];
                    if (dataItem) {
                        str += (_.isObject(dataItem) ? getDisplayName(dataItem) : dataItem) + ", ";
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
            var callback = settings.callback; // 
            var delay = settings.delay; // 
            var minLength = settings.minLength; // 
            var placeHolderText = (targetEle.attr('disabled')) ? "" : localization.SearchButton;

            // private params
            var autoComplete;
            var dataSource;
            var focusedItemIndex = false
            var searchBtn;
            var detailsBtn;
            var detailsPopupEle;
            var detailsPopup;
            var _textProp = "Name";
            var _idProp = "Id";
            var _model = new NameIdModel(_textProp, _idProp);
            var hasTCCURL = !_.isNull(session.consoleSetting.TrueControlCenterURL) && (session.consoleSetting.TrueControlCenterURL != "") && session.user.Analyst;

            // CONSTRUCT

            var __construct = function () {
                createKendoDataSource();
                createKendoAutoComplete();
                createSearchButton();
                hasTCCURL ? createTCCDetailsButton() : createDetailsButton();
                createDetailsPopup();
                bindEvents();
                self.setValue = setValue;
            }

            // EVENTS

            var bindEvents = function () {
                autoComplete.bind("select", function (e) {
                    var obj = this.dataItem(e.item.index());
                    callback(_model.getGenericFromObj(obj));

                  

                    if (app.featureSet.isActive("TeamsUserPresence")) { 
                        var root = e.sender.element.parent().parent();
                        var child = root.find('#cireson-teams');
                        TeamsUserPresence(child, obj);
                    }
                });
                autoComplete.bind("change", function (e) {
                    validateAutoCompleteValue();
                    callback(_model.getGenericFromObj(getDataSourceMatch(autoComplete.value())));
                });
                autoComplete.bind("dataBound", function (e) {
                    e.sender.ul.find("li").first().addClass("k-state-hover");
                });
                targetEle.on("keyup", function (e) {
                    if (e.which == 40 && !autoComplete.ul.is(":visible")) { //down arrow
                        autoComplete.search(autoComplete.value());
                        validateAutoCompleteValue();
                    }
                    else if (e.which != 13 && e.which != 9) { //enter
                        focusedItemIndex = getFocusedIndex();
                        validateAutoCompleteValue();
                    }

                });
                targetEle.on("keydown", function (e) {
                    if (e.which == 13) {
                        // enter click select first match in dropdown or focused
                        var children = autoComplete.ul.children();
                        if (children.length && autoComplete.ul.is(":visible")) {
                            var index = (focusedItemIndex !== false) ? focusedItemIndex : 0;
                            autoComplete.select(autoComplete.ul.children().eq(index));
                            autoComplete.trigger("change");
                            validateAutoCompleteValue();
                        } else { //if enter is hit and we have no child do a search
                            autoComplete.search(autoComplete.value());
                        }
                    }
                });

                //we need blur so we can handle tabbing out
                targetEle.on("blur", function (e) {
                    focusedItemIndex = getFocusedIndex();
                    validateAutoCompleteValue(true);
                });

                //handle copy-paste event
                targetEle.on("input propertychange", function (e) {
                    //perform autocomplete search if search box is not empty
                    if (e.currentTarget.value != "") {
                        autoComplete.search(e.currentTarget.value);
                        validateAutoCompleteValue();
                    } else {
                        var root = $(e.currentTarget.parentElement.parentElement);
                        var child = root.find('#cireson-teams')[0];
                        $(child).find('mgt-person').first().remove();
                    }
                });

                detailsPopup.bind("close", function () {
                    detailsPopupEle.find(".k-content").html('');
                });
                searchBtn.click(onSearchIconClick);
                detailsBtn.click(onDetailsBtnClick);
            }

            // ACTIONS

            var onDetailsBtnClick = function (e) {
                hasTCCURL ? e.stopPropagation() : openModal();
            }

            var openSlideout = function (e) {
                var userObj = { BaseId: _model.get.id(), Name: _model.get.name() }
                var src = app.slideOutNav.getTCCSourceURL(userObj, "user");
                var options = {
                    url: src,
                    tooltip: localization.UserManagement
                }
                app.slideOutNav.show(options);
            }

            var openModal = function (e) {
                detailsPopup.refresh({
                    url: detailsUrl,
                    data: { id: _model.get.id() }
                });
                detailsPopupEle.find(".k-content").html("<div style='padding: 55px'>Loading...</div>");
                detailsPopup.title(_model.get.name()).center().open();
            }

            // METHODS

            var createSearchButton = function () {
                searchBtn = $("<div>", { "class": "searchIcon", "data-control-action": "userPickerWindow" });
                var iconColor = !targetEle.attr('disabled') ? "text-primary" : "";
                var a = $("<i>", { "class": "fa fa-search cursor-pointer " + iconColor })
                searchBtn.append(a);
                //don't want to  show search icon if field is disabled
                if (!targetEle.attr('disabled') || app.isMobileDevice()) {
                    searchBtn.insertAfter(targetEle);
                }
            }
            var createDetailsButton = function () {
                var iconColor = !targetEle.attr('disabled') ? "text-primary" : "";
                detailsBtn = $("<i>", { "class": "fa fa-info-circle cursor-pointer info-icon " + iconColor });
                detailsBtn.insertBefore(targetEle);
                detailsBtn.hide();
            }

            var createTCCDetailsButton = function () {
                var iconColor = !targetEle.attr('disabled') ? "text-primary" : "";
                detailsBtn = $("<ul>", { "class": "menu-usr-mgt" });
                detailsBtn.insertBefore(targetEle);
                detailsBtn.hide();

                detailsBtn.kendoMenu({
                    dataSource: [
                        {
                            text: "<i class='fa fa-info-circle cursor-pointer'></i>",
                            encoded: false,
                            items: [
                                {
                                    text: localization.UserManagement,
                                    imageUrl: "/Content/Images/Icons/Other/control-center-launcher.png",
                                    imageAttr: {
                                        height: '16px',
                                        width: '16px'
                                    },
                                    attr: {
                                        custom: 'tcc' //custom attribute holds the link type
                                    }
                                },
                                {
                                    text: "<i class='fa fa-info-circle cursor-pointer' style='margin: -2px 7px 0 -3px;'></i>"+localization.AdditionalDetails,
                                    encoded: false,
                                    attr: {
                                        custom: 'info' //custom attribute holds the link type
                                    }
                                }
                            ]
                        }
                    ],
                    select: function (e) {
                        if (!_.isUndefined(e.item.attributes["custom"])) {
                            var type = e.item.attributes["custom"].value;
                            (type == "tcc") ? openSlideout() : openModal();
                        }
                    },
                    openOnClick: true
                });
            }

            var createKendoDataSource = function () {
                dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: url,
                            data: {
                                userFilter: function () {
                                    return autoComplete.value();
                                },
                                filterByAnalyst: filterByAnalyst,
                                maxNumberOfResults: settings.maxNumberOfResults
                            }
                        }
                    },
                    serverFiltering: true
                });
            }
            var createKendoAutoComplete = function () {
                autoComplete = targetEle.kendoAutoComplete({
                    dataTextField: _textProp,
                    suggest: true,
                    placeholder: placeHolderText + "...",
                    valuePrimitive: false,
                    dataSource: dataSource,
                    delay: delay,
                    minLength: minLength,
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
                    height: 500,
                    actions: ["Close"]
                }).data("kendoWindow");
            }

            var validateAutoCompleteValue = function (blurred) {
                var match = getDataSourceMatch(autoComplete.value());
                if (!match && autoComplete.value() != "") { //empty values are valid bug 494
                    detailsBtn.hide();
                    if (targetEle.is(":focus") && !blurred) {
                        // invalid while typing
                        targetEle.css({
                            "text-decoration": "none",
                        });
                    } else {
                        // invalid after blur
                        targetEle.css({
                            "text-decoration": "none",
                            "background-color": "#FBE3E4"
                        });

                        //add the invalid data attribute
                        targetEle.attr('data-invalid', '');
                    }
                } else {
                    // valid

                    //remove the invalid data attribute
                    targetEle.removeAttr('data-invalid', '');

                    //do we actually have a value to show the extension properties for
                    if (autoComplete.value() === "") {
                        detailsBtn.hide();
                    } else {
                        detailsBtn.show();

                        targetEle.css({
                            "text-decoration": "underline",
                            "background-color": ""
                        });
                    }
                }
            }

            var getDataSourceMatch = function (val) {
                var ds = _.clone(dataSource);
                var view = ds.view();

                // matching needs to be case insensitive
                var match = false;
                $.each(view, function (i, item) {
                    if (item.Name.toLowerCase() == val.toLowerCase()) {
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