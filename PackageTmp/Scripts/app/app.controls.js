var app = (!app) ? {} : app;

app.controls = function () {
    var that = this;
    var templateDir = "/Scripts/app/templates/";
    this.items = {
        affectedItemsGrid: {},
        userPicker: {},
        reviewerGrid: {}
    }
    this.getWorkItemLogType = function (boundObj) {
        logType = (boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem")
                  ? "AppliesToTroubleTicket"
                  : "AppliesToWorkItem";

        if (!boundObj[logType]) {
            app.controls.forceProp(boundObj, logType, []);
        }

        return logType;
    }
    this.getText = function (key, text) {
        return (typeof localization != "undefined" && typeof localization[key] != "undefined") ? localization[key] : text
    }
    this.filters = function () {
        var filters = {}
        var get = function (name) {
            if (!filters[name]) {
                that.exception(name + " filter does not exist - app.controls.filters");
            }
            return filters[name];
        }
        var call = function (name) {
            get(name)();
        }
        var add = function (name, callback) {
            filters[name] = callback;
        }
        this.get = get; this.add = add; this.call = call; this.filters = filters;
    }
    this.filters = new this.filters();
    // overlay for elements, either for loading etc
    // currently used for fileattachmentgrid loading
    this.overlay = function (jqEle, settings) {
        var jqEle = jqEle;
        var overlayCont = $("<div>", { "class": "loading-overlay" });
        overlayCont.hide();
        var centerBox = $("<div>", { "class": "loading-overlay-textcont" });
        var textCont = $("<span>");
        overlayCont.append(centerBox);
        centerBox.append(textCont);
        jqEle.prepend(overlayCont);
        var setOverlayDim = function () {
            var h = jqEle.innerHeight();
            var w = jqEle.innerWidth();
            overlayCont.css({ "height": h + "px", "width": w + "px" });
        }
        var setCenterBoxPos = function () {
            var ch = centerBox.outerHeight();
            var margin = (jqEle.innerHeight() / 2) - (ch / 2);
            //centerBox.css("margin-top", margin + "px");
        }
        var methods = {
            show: function () {
                setOverlayDim();
                overlayCont.show();
                setCenterBoxPos();
            },
            hide: function () {
                overlayCont.hide();
            },
            setText: function (text) {
                textCont.html(text);

            }
        }

        if (settings && settings.text) {
            methods.setText(settings.text);
        }
        return methods;
    }
    this.localize = function (contEle, obj) {
       //s console.log("lcoalilze", obj)
        contEle.find("[data-localize]").each(function (i, item) {
            var attr = $(this).attr("data-localize");
            var text = attr;
            if (attr && obj[attr]) {
                text = obj[attr];
            }
            $(this).prepend($("<span>", { html: text }));
            $(this).removeAttr("data-localize");
        });
    }


    /* apply - apply controls, kendo binding and localization
        to targeted element
        contEle: jquery element thats children will be applied
        settings: {
            vm: kendoVM (optional),
            localize: bool, (optional) defaults to false if not set
            bind: bool, (optional) defaults to false if not set
        }
    */
    this.apply = function (contEle, settings) {
        
        var settings = settings;
        var internalSettings = settings;
        // apply localizations
        if ((!settings || settings.localize === true) && localization) {
            that.localize(contEle, localization);
        }

        var vm = (settings && settings.vm) ? settings.vm : {};

        // kendo bind
        if ((!settings || settings.bind !== false) && vm) {
            kendo.bind(contEle, vm);
        }

        contEle.find('[data-control]').each(function () {



            // applied or not applied
            if ($(this).attr('data-control-applied')) {
                return;
            } else {
                $(this).attr('data-control-applied', true);
            }

            // ctrl name            
            var ctrlName = $(this).attr('data-control');
            var mdlName = $(this).attr('data-control-bind');
            var target = $(this).attr('data-control-target');//too mnay conditionals have been put on target id/name, abstraving it a level for search and new user picker -jk
            var targetValId = $(this).attr('data-control-valueTargetId');
            var targetNameId = $(this).attr('data-control-nameTargetId');
            var url = $(this).attr('data-control-url');
            var itemType = $(this).attr('data-control-itemtype');
            var filter = $(this).attr('data-control-filter');
            var valueField = $(this).attr('data-control-valuefield');
            var config = $(this).attr('data-control-config');
            var enumId = $(this).attr('data-control-enumId');
            var mustSelectLeafNode = $(this).attr('data-control-mustSelectLeafNode');
            var showEnumPath = $(this).attr('data-control-showPath');
            var showClearButton = $(this).attr('data-showclearbutton');
            
            // extension
            if (ctrlName == "extensionFields") {
                app.controls[ctrlName]($(this), internalSettings);
                return;
            }


            // two option init controls
            if (ctrlName == "enumPicker" ||
                ctrlName == "dropDownTree" ||
                ctrlName == "userPicker" ||
                ctrlName == "userPickerOld" ||
                ctrlName == "checkboxGrid" ||
                ctrlName == "datePicker" ||
                ctrlName == "dateTimePicker" ||
                ctrlName == "inlineComboBox" ||
                ctrlName == "numericTextBox" ||
                ctrlName == "checkboxGridByCriteria" ||
                ctrlName == "checkboxGridByCriteriaOld" ||
                ctrlName == "consoleTaskNewStatus" ||
                ctrlName == "consoleTaskChangeStatus" ||
                ctrlName == "consoleTaskAssignToAnalystByGroup" ||
                ctrlName == "consoleTaskConvertOrRevertToParent" ||
                ctrlName == "consoleTaskLinkToParent" ||
                ctrlName == "consoleTaskAcknowledgeIncident" ||
                ctrlName == "comboBox" ||
                ctrlName == "consoleTaskAssignToMe" ||
                ctrlName == "fileAttachmentGrid") {
                var settings = {};
                if (url) {
                    settings.url = url;
                }
                if (itemType) {
                    settings.itemType = itemType;
                }
                if (filter) {
                    settings.filter = filter;
                }
                if (targetValId) {
                    settings.targetValId = targetValId;
                }
                if (valueField) {
                    settings.valueField = valueField;
                }
                if (config) {
                    settings.config = config;
                }
                if (target) {
                    settings.target = target;
                }
                if (enumId) {
                    settings.enumId = enumId;
                }
                if (mustSelectLeafNode) {
                    settings.mustSelectLeafNode = mustSelectLeafNode;
                }
                if (showEnumPath) {
                    settings.showEnumPath = showEnumPath;
                }
                if (targetNameId) {
                    settings.targetNameId = targetNameId;
                } else {
                    settings.boundObj = vm;
                    settings.name = mdlName;
                }
                if (showClearButton) {
                    settings.showClearButton = showClearButton;
                }
                app.controls[ctrlName]($(this), settings);
            }
                // internal kendo bind only
            else if (app.controls[ctrlName]) {
                app.controls[ctrlName]($(this), vm, mdlName);
            }
        });


    }
    this.getTemplate = function (templateName, callback, settings) {

        var localize = (settings && settings.localize === true) ? true : false;
        var apply = (settings && settings.apply === true) ? true : false;
        var bind = (settings && settings.bind === true) ? true : false;
        var vm = (settings && settings.vm) ? settings.vm : {};

        $.get(templateDir + templateName, function (resp) {
            if (apply) {
                that.apply($(resp), {
                    bind: bind,
                    vm: vm,
                    localize: localize
                });
            } else if (localize) {
                that.localize($(resp), localization);
            }
            callback(resp);
        });
    }
    this.exception = function (message) {
        app.lib.exception(message);
    }
    this.forceProp = function (boundObj, propName, type) {
        if (!boundObj[propName]) {
            if ($.type(type) == "object") {
                boundObj.set(propName, new kendo.data.ObservableObject(type));
            } else if ($.type(type) == "array") {
                boundObj.set(propName, new kendo.data.ObservableArray(type));
            }
            app.lib.log(propName + " was added to viewModel dynamically from controls");
            boundObj[propName].bind("change", function (e) {
                if (typeof onVmChange != "undefined") {
                    onVmChange(e);
                }
            });
        }
    }


    // begin individual controls
    // ACTUALLY using DropDownList
    this.inlineComboBox = function (targetEle, settings) {
        var targetId = targetEle.attr('data-control-valueTargetId');
        var items = targetEle.attr('data-control-items');
        var ds = [
            { id: "", name: "" }
        ];
        var getList = function () {
            $.each(items.split('(((;)))'), function (i, item) {
                if (item != "") {
                    ds.push({ id: item, name: item });
                }
            });
        }
        getList();
        var combo = targetEle.kendoDropDownList({
            dataSource: ds,
            dataTextField: "name",
            dataValueField: "id"
        }).data("kendoDropDownList");

        var opened = false;

        combo.value($('#' + targetId).val());
        combo.bind("change", function () {
            $('#' + targetId).val(combo.value());
            $('#' + targetId).change();

            //Hide validation error on select value
            var validationId = targetId + '_validationMessage';
            $("#" + validationId).hide();

            opened = false;
            combo.close();
        });

        combo.wrapper.on("click", function (e) {
            if (opened) {
                opened = false;
                combo.close();
            } else
                opened = true;
        });

        combo.bind("close", function (e) {
            if (opened)
                e.preventDefault();
        });

        combo.wrapper.blur(function () {
            opened = false;
            combo.close();
        });
    }
    this.numericTextBox = function (targetEle, settings) {
        // get settings from attrs
        var property = targetEle.attr('name');
        var min = targetEle.attr('data-control-min');
        var max = targetEle.attr('data-control-max');
        var step = targetEle.attr('data-control-step');
        var decimals = targetEle.attr('data-control-decimals');
        var settings = {};
        if (min) {
            settings.min = parseInt(min);
        }
        if (max) {
            settings.max = (decimals == 0) ? parseInt(max) : max;
        }
        if (step) {
            settings.step = parseInt(step);
        }
        if (decimals) {
            settings.format = "n" + parseInt(decimals);
            settings.decimals = parseInt(decimals);
        }
        var ctrl = targetEle.kendoNumericTextBox(settings).data("kendoNumericTextBox");
        targetEle.change(function () {
            try{
                if (!_.isNull(pageForm) && !_.isNull(pageForm.viewModel))
                    pageForm.viewModel[property] = targetEle.val();
            }catch(e){}
        });

        ctrl.bind("spin", function () {
            //Force blur event to update form with hidden/conditional fields.
            targetEle.trigger('blur');
        });

        //Use a plain numeric input for mobile devices to invalidate letters
        if (app.isMobile() && targetEle.prev().hasClass("k-input"))
            targetEle.prev().attr("type", "number");
    }

    this.dateTimePicker = function (targetEle, settings) {
        settings.hasTimePicker = true;
        that.datePicker(targetEle, settings);
    },
    this.datePicker = function (targetEle, settings) {
        var settings = settings;
        // get attrs
        var fromFilter = targetEle.attr("data-control-from");
        var toFilter = targetEle.attr("data-control-to");
        // relative overrides fromFilter and toFilter for now
        var fromRelative = targetEle.attr("data-control-from-relative"); // "days:-5" "days: +5"
        var toRelative = targetEle.attr("data-control-to-relative"); // 
        var setDateByRelative = function (startDate, daysOffset) {
            var date = new Date(startDate);
            var str = "{" + daysOffset + "}";
            try {
                var daysValue = JSON.parse(JSON.stringify(eval("(" + str + ")"))).days;
                date.setDate(date.getDate() + parseInt(daysValue));
            } catch (e) {
                date.setDate(date.getDate() + parseInt(daysOffset));
            }
          
            return date;
        }
        if (fromRelative) {
            var currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            fromRelative = setDateByRelative(currentDate, fromRelative);
        }
        if (toRelative) {
            toRelative = setDateByRelative(fromRelative, toRelative);
        }

        var clearFilter = function () {
            picker.min(new Date(1900, 0, 1));
            picker.max(new Date(2099, 11, 31));
        }
        
        var saveValue = function (val) {
            targetEle.parents(".form-group").removeClass("has-error");
            if (settings.targetValId) {
                if (!val) {
                    $('#' + settings.targetValId).val("");
                } else {
                    settings.hasTimePicker
                    ? $('#' + settings.targetValId).val(val.toISOString())
                    : $('#' + settings.targetValId).val(val.toISOString());
                }
                $('#' + settings.targetValId).change();
            } else {
                if (!val) {
                    //updates vm
                    settings.boundObj.set(settings.name, null);
                    //updates ui
                    targetEle.val("");
                } else {
                    //updates vm
                    settings.boundObj.set(settings.name, val.toISOString());

                    //updates ui. if MA, use id instead of name to avoid conflict with parent workitem's date property (i.e. ScheduledStartDate, ScheduledEndDate)
                    if (settings.boundObj.ClassName === "System.WorkItem.Activity.ManualActivity") {
                        settings.hasTimePicker
                            ? $('[id="' + settings.name + '"]').val(kendo.toString(val, 'g'))
                            : $('[id="' + settings.name + '"]').val(kendo.toString(val, 'g'));
                    } else {
                        settings.hasTimePicker
                            ? $('[name="' + settings.name + '"]').val(kendo.toString(val, 'g'))
                            : $('[name="' + settings.name + '"]').val(kendo.toString(val, 'g'));
                    }
                }
            }

            if (settings.targetValId && getValue(settings.targetValId)) {
                targetEle.val(getValue(settings.targetValId));
            } else if (settings.boundObj && getValue(settings.name)) {
                targetEle.val(getValue(settings.name));
            }
        }
        var getValue = function (target) {
            if (settings.targetValId) {
                return ($('#' + target).val()) ? kendo.toString(new Date($('#' + target).val()), 'g') : null;
            } else {
                var value = settings.boundObj.get(target);
                return (value) ? kendo.toString(new Date(value), 'g') : null;
            }
        }

        var onOpen = function () {
            //set date culture format
            picker.options.format = kendo.culture().calendar.patterns.g;
            if (fromRelative) {
                picker.min(fromRelative);
            } else {
                if (fromFilter) {
                    if (!getValue(fromFilter)) {
                        clearFilter();
                    } else {
                        picker.min(getValue(fromFilter));
                    }
                }
            }

            if (toRelative) {
                picker.max(toRelative);
            } else {
                if (toFilter) {
                    if (!getValue(toFilter)) {
                        clearFilter();
                    } else {
                        picker.max(getValue(toFilter));
                    }
                }
            }

        }

        //get the preferred datetime culture
        var preferredCulture = $("meta[name='accept-language']").attr("content");

        var pickerProperties = {
            //explicitly default picker's culture to user's preferred datetime code/culture 
            culture: kendo.culture(preferredCulture),
            change: function () {
                var value = this.value();
                if (value != null) {
                    targetEle.parents(".form-group").removeClass("has-error");
                    saveValue(value);
                } else {
                    targetEle.parents(".form-group").addClass("has-error");
                }
            },
            open: onOpen
        };

        if (settings.hasTimePicker) {
            $.extend(true, pickerProperties, { interval: 1 });
            var picker = targetEle.kendoDateTimePicker(pickerProperties).data("kendoDateTimePicker");
        } else {
            var picker = targetEle.kendoDatePicker(pickerProperties).data("kendoDatePicker");
        }

        if (settings.targetValId && getValue(settings.targetValId)) {
            picker.value(getValue(settings.targetValId));
        } else if (settings.boundObj && getValue(settings.name)) {
            picker.value(getValue(settings.name));
        }

        //since we are allowing users to type in date we need validation
        targetEle.on('blur', function (e) {

            //fixes issue with time showing up when it is just a date picker, not a dateTIME picker.
            e.stopImmediatePropagation();

            if (this.value != '') {
                //var date = new Date(this.value);
                var date = kendo.parseDate(this.value); //used kendo's parseDate to take into account date's format/localization

                if (_.isNull(date)) { $(this).val(""); }

                if (date != 'Invalid Date') {
                    $(this).parents(".form-group").removeClass('has-error');
                    saveValue(date);
                } else {
                    $(this).parents(".form-group").addClass('has-error');
                }
            } else {
                $("input#" + targetEle.attr("data-control-valuetargetid")).val("");
                saveValue(null);
                $(this).parents(".form-group").removeClass('has-error');
            }
        });

    }

    // Note: has dependancy on singleton objectPickerWindow - todo: add to app.controls
    // aka HasRelatedWorkItems
    this.affectedItemsGrid = function (targetEle, boundObj, name) {
        if (!targetEle) { that.exception("targetEle missing - controls.affectedItemsGrid"); }
        if (!boundObj) { that.exception("boundObj missing - controls.affectedItemsGrid"); }
        if (!name) { that.exception("name missing - controls.affectedItemsGrid"); }

        // HasRelatedWorkItems - should be here, so force the creation if missing        
        that.forceProp(boundObj, name, []);

        var targetId = app.lib.newGUID();
        that.items.affectedItemsGrid[targetId] = new (function () {
            var grid;
            var combo;
            var cbEle;
            var boundArray = boundObj[name];
            var cbEle2;
            var dsAffectedUserConfigItem;

            // apply guid for id attr (workaround for current userpicker functionality)
            targetEle.attr("id", targetId);
            //targetEle.addClass('affecteditems-grid');


            var getText = that.getText;

            // toolbar
            var createToolbar = function () {
                cbEle = $("<input>", { style: 'width: 300px', "class": "search-combo" });
                var toolbar = $("<div>", { "class": "row" });
                var div2 = $("<div>", { "class": "col-md-12 affecteditems-grid" });
                var addBtn = $("<button>", { "class": "two-action-input-group__primary-action k-button", html: getText("Add", "Add") });
                var searchBtn = $("<span>", { "class": "search" });
                var searchIcon = $("<i>", { "class": "fa fa-search" });
                var label = $("<label>", { "class": "control-label", html: getText("Configurationitem", "Configurationitem") });
                var divFromGroup = $("<div>", { "class": "form-group" });
                var divCombo = $("<div>", { "class": "two-action-input-group" });
                toolbar.append(div2);
                searchBtn.append(searchIcon);
                divCombo.append(cbEle, searchBtn, addBtn);
                divFromGroup.append(label, divCombo);
                div2.append(divFromGroup);
                targetEle.append(toolbar);

                addBtn.click(function () {
                    addAffectedItem(cbEle.data("kendoComboBox"));
                });
                searchBtn.click(function () {
                    affectedItemPicker();
                });
               
            }
            createToolbar();

            // combo
            var createCombo = function () {
                cbEle.kendoComboBox({
                    "select": function (e) {
                        this.input.css({ 'text-decoration': 'underline' });
                    },
                    "dataSource": {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": "/api/V3/Config/GetAffectedItemsList",
                                "data": function () {
                                    return {
                                        itemFilter: combo.input.val()
                                    };
                                }
                            }
                        },
                        "serverFiltering": true,
                        "filter": [],
                        "schema": {
                            "errors": "Errors"
                        }
                    },
                    "dataTextField": "Text",
                    "autoBind": false,
                    "dataValueField": "Value",
                    "filter": "contains",
                    "minLength": 3,
                    "placeholder": getText("ChooseOne", "Choose One") + "...",
                    "suggest": true
                });
                combo = cbEle.data("kendoComboBox");
                combo.input.on("keyup", function (e) {
                    combo.input.css({ 'text-decoration': 'none' });
                });
            }
            createCombo();


            cbEle.data("kendoComboBox").wrapper.find(".k-i-arrow-s").click(function () {
                arrowPress = true;
                cbEle.data("kendoComboBox").dataSource.read();
            });

            // grid
            var createGrid = function () {
                //var index = function (dataItem) {
                //    var data = targetEle.data("kendoGrid").dataSource.data();
                //    return data.indexOf(dataItem);
                //}

                targetEle.kendoGrid({
                    "columns": [{
                        "title": "",
                        "width": "25px",
                        "template": "<div class='open-modal fa fa-info-circle'></div>"
                    }, {
                        "title": getText("Name", "Name"),
                        "width": "210px",
                        "template": "#= DisplayName ? DisplayName : \u0027\u0027 #\u003cinput type=\u0027hidden\u0027 value=\u0027#= DisplayName #\u0027 /\u003e",
                        "field": "DisplayName",
                        "filterable": {},
                        "encoded": true,
                        "editor": "\u003cinput class=\"k-textbox\" disabled=\"disabled\" id=\"DisplayName\" name=\"DisplayName\" type=\"text\" value=\"\" /\u003e\u003cspan class=\"field-validation-valid\" data-valmsg-for=\"DisplayName\" data-valmsg-replace=\"true\"\u003e\u003c/span\u003e"
                    }, {
                        "title": getText("Base Id", "Base Id"),
                        "hidden": true,
                        "template": "#= BaseId #\u003cinput type=\u0027hidden\u0027  value=\u0027#= BaseId #\u0027 /\u003e",
                        "field": "BaseId",
                        "filterable": {},
                        "encoded": true
                    }, {
                        "title": getText("Path", "Path"),
                        "template": "#= Path ? Path : \u0027\u0027 #\u003cinput type=\u0027hidden\u0027  value=\u0027#= Path #\u0027 /\u003e",
                        "field": "Path",
                        "filterable": {},
                        "encoded": true,
                        "editor": "\u003cinput class=\"k-textbox\" disabled=\"disabled\" id=\"Path\" name=\"Path\" type=\"text\" value=\"\" /\u003e\u003cspan class=\"field-validation-valid\" data-valmsg-for=\"Path\" data-valmsg-replace=\"true\"\u003e\u003c/span\u003e"
                    },
                    {
                        "title": getText("Status", "Status"),
                        "template": "#=  _.isUndefined(Status) ? \u0027\u0027 : (Status ? Status.Name : \u0027\u0027) #\u003cinput type=\u0027hidden\u0027  value=\u0027#= Status #\u0027 /\u003e",
                        "field": "Status.Name",
                        "filterable": {},
                        "encoded": true,
                        "editor": "\u003cinput class=\"k-textbox\" disabled=\"disabled\" id=\"Status\" name=\"Status\" type=\"text\" value=\"\" /\u003e\u003cspan class=\"field-validation-valid\" data-valmsg-for=\"Status\" data-valmsg-replace=\"true\"\u003e\u003c/span\u003e"
                    },
                    {
                        "width": "105px",
                        "command": [{
                            "name": getText("destroy", "destroy"),
                            "buttonType": "ImageAndText",
                            "text": "Remove"
                        }]
                    }],
                    "scrollable": false,
                    "filterable": {
                        "extra": false,
                        "messages": {
                            "info": localization.Showitemswithvaluethat,
                            "and": localization.And,
                            "or": localization.Or,
                            "filter": localization.Filter,
                            "clear": localization.Clear
                        },
                        "operators": {
                            "string": {
                                "startswith": localization.Startswith,
                                "contains": localization.Contains,
                                "eq": localization.Isequalto,
                                "neq": localization.Isnotequalto
                            }
                        }
                    },
                    "reorderable": true,
                    "sortable": true,
                    "columnMenu": {
                        "messages": {
                            "columns": localization.ChooseColumns,
                            "filter": localization.Filter,
                            "sortAscending": localization.SortAscending,
                            "sortDescending": localization.SortDescending
                        }
                    },
                    "editable": {
                        "confirmDelete": "Delete",
                        "cancelDelete": "Cancel",
                        "mode": "incell",
                        "template": null,
                        "create": true,
                        "update": true,
                        "destroy": true
                    },
                    "toolbar": {},
                    "dataSource": {
                        "transport": {
                            "prefix": "",
                            "read": {
                                "url": ""
                            }
                        },
                        "type": "aspnetmvc-ajax",
                        "schema": {
                            "data": "Data",
                            "total": "Total",
                            "errors": "Errors",
                            "model": {
                                "id": "BaseId",
                                "fields": {
                                    "Status": {},
                                    "BaseId": {
                                        "editable": false,
                                        "type": "string"
                                    },
                                    "DisplayName": {
                                        "type": "string"
                                    },
                                    "Path": {
                                        "type": "string"
                                    },
                                    "ImageName": {
                                        "type": "string"
                                    }
                                }
                            }
                        },
                        "data": {
                            "Data": boundArray,
                            "Total": boundArray.length
                        }
                    }
                });

                grid = targetEle.data("kendoGrid");
            }

            var mobileGridEle = $(targetEle.siblings('div')[0]);
            var createMobileGrid = function () {
                if (app.isMobile()) {
                    var source = {
                        dataSource: new kendo.data.DataSource({
                            data: boundArray
                        }),
                        selectable: true,
                        template: kendo.data.binders.templateResources.resourceManager.getTemplateResource("mobileManualGridTemplate")
                    }
                    $(mobileGridEle).kendoListView(source);
                }
            }

            createGrid();
            createMobileGrid();
           
            if (targetEle.attr('disabled')) {
                $('.affectedItemsGrid input').each(function () {
                    $(this).attr("disabled", "disabled");
                    $(this).addClass("k-state-disabled");
                });

                $('.affectedItemsGrid .k-icon.k-i-arrow-s, .affectedItemsGrid .k-icon.k-i-arrow-n, .affectedItemsGrid .k-select, .affectedItemsGrid .searchIcon, .affectedItemsGrid .search, .affectedItemsGrid .k-button, .affectedItemsGrid button').each(function () {
                    $(this).remove();
                });
            }

            //create affected user's config item
            var createAffectedUserItems = function () {
                //add to toolbar
                cbEle2 = $("<input>", { style: 'width: 300px' });
               
                var toolbar = $(targetEle).find(".k-toolbar");
                var div = $("<div>", { "class": "col-md-5" });
                var divFromGroup = $("<div>", { "class": "form-group" });
                var divCombo = $("<div>");
                var addBtn = $("<a>", { "class": "k-button k-button-icontext", html: getText("Add", "Add") });
                var label = $("<label>", { "class": "control-label", html: getText("AffectedUserItems", "AffectedUserItems") });

                toolbar.append(div);
                divCombo.append(cbEle2, addBtn);
                divFromGroup.append(label, divCombo);
                div.append(divFromGroup);
                
                addBtn.click(function () {
                    addAffectedItem(cbEle2.data("kendoComboBox"));
                });

                //create combo
                dsAffectedUserConfigItem = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "/ConfigItems/GetAffectedUserConfigItemsList",
                            dataType: "json"
                        },
                        parameterMap: function (data, type) {
                            if (type === "read") {
                                var searchFilter = (data.filter && data.filter.filters.length > 0) ? data.filter.filters[0].value : "";
                                return { affectedUserId: boundObj.RequestedWorkItem.BaseId, searchFilter: searchFilter }
                            }
                        }
                    },
                    schema: {
                        error: "error"
                    },
                    pageSize: 5,
                });
                dsAffectedUserConfigItem.read();
                cbEle2.kendoComboBox({
                    "select": function (e) {
                        this.input.css({ 'text-decoration': 'underline' });
                    },
                    "dataSource": dsAffectedUserConfigItem,
                    "dataTextField": "Text",
                    "autoBind": false,
                    "dataValueField": "Value",
                    "filter": "contains",
                    "minLength": 3,
                    "placeholder": getText("ChooseOne", "Choose One") + "...",
                    "suggest": true
                });
            }

            if (!_.isUndefined(boundObj.RequestedWorkItem)) {
                createAffectedUserItems();
                boundObj.RequestedWorkItem.bind("change", function () {
                    cbEle2.data("kendoComboBox").value("");
                    dsAffectedUserConfigItem.read();
                });
            }

            // actions
            var addAffectedItem = function (combo) {
                var baseId = (combo.dataItem() || {}).Id;
                if (baseId) {
                    if (!isDuplicate(baseId)) {
                        addAffectedItemToGrid(baseId);
                    }
                    combo.text('');
                    combo.input.css({ 'text-decoration': 'none' });
                }
            }
            var addAffectedItemToGrid = function (baseId) {
                if (isDuplicate(baseId)) { return; }
                $.getJSON('/ConfigItems/GetAffectedItem', { id: baseId }, function (json) {
                    var item = { BaseId: baseId, DisplayName: json.DisplayName, Path: json.Path, Status: json.Status };
                    boundArray.push(item);
                });
            }
            var affectedItemPicker = function () {
                objectPickerWindow.open(function (configObjs) {
                    //app.lib.log(configObjs);
                    if (configObjs) {
                        // add items to viewModel
                        $.each(configObjs, function (i, iitem) {
                            addAffectedItemToGrid(iitem.Id);
                        });
                    }
                });
                return;
            }
            var isDuplicate = function (idToAdd) {
                var n = false;
                $.each(boundArray, function (i, item) {
                    if (item.BaseId == idToAdd) {
                        n = true;
                    }
                });
                return n;
            }

            //add open name/values in modal
            targetEle.append($("<div>", { "id": "objectViewerWindow" }));
            targetEle.find(".open-modal").click(function () {
                var selected = $(this).closest("tr");
                var id = grid.dataItem(selected).BaseId;
                var title = grid.dataItem(selected).DisplayName;
                var windowEle = $("#objectViewerWindow");
                var dialog = windowEle.kendoCiresonWindow({
                    title: title,
                    width: 550,
                    height: 400,
                    actions: ["Close"]
                }).data("kendoWindow");

                dialog.refresh({
                    url: "/Search/ObjectViewer",
                    data: { id: id }
                });
                //don't open window till we get the data back
                dialog.bind("refresh", function () {
                    dialog.title(title).center().open();
                });
                //destroy element on close
                dialog.bind("close", function () {
                    dialog.destroy();
                    targetEle.append($("<div>", { "id": "objectViewerWindow" }));
                });

            });


            this.id = targetId;
            this.addAffectedItem = addAffectedItem;
            this.addAffectedItemToGrid = addAffectedItemToGrid;
            this.domEle = targetEle;
        })();
    }


    /*
     * This is currently only referenced in legacy (v2) search page 12/2/2014 (I think) -DS
     * This is also referenced by request offerings
     */
    this.dropDownTree = function (targetEle, settings) {
        
        if (!targetEle) { app.controls.exception("targetEle missing - controls.dropDownTree"); }
        if (!settings.url) { app.controls.exception("url missing - controls.dropDownTree"); }
        
        
        if (!settings.targetValId) {

            if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.dropDownTree"); }
            if (!settings.name) { app.controls.exception("name missing - controls.dropDownTree"); }
            var boundObj = settings.boundObj;
            var name = settings.name;
            // fake the funk for missing viewModel props        
            that.forceProp(boundObj, name, { Id: null, Name: null });
        }

        var setModelValue = function (text, id) {
            if (settings.targetValId) {
                $('#' + settings.targetValId).val(id);
                $('#' + settings.targetValId).change();
                if (settings.targetNameId) {
                    $('#' + settings.targetNameId).val(text);
                }
            } else {
                boundObj[name].set("Name", text);
                boundObj[name].set("Id", id);
            }
        }

        /******************/
        /** COMBOTREEEXT **/
        /******************/

        var comboTreeExt;
        var url = settings.url;
        var initialDisplayName = (function () {
            if (settings.targetNameId) {
                return $('#' + settings.targetNameId).val();
            }
            if (boundObj && boundObj[name] && boundObj[name].Name) {
                return boundObj[name].Name;
            }
            return "";
        })();

        /** INIT **/

        var init = function () {
            comboTreeExt = targetEle.kendoExtDropDownTreeViewV2(extOptions);

            // set initial value
            if (initialDisplayName.length > 0)
                comboTreeExt.data().handler._dropdown.value(initialDisplayName);

            // make a pretty underline
            if (initialDisplayName && initialDisplayName.length > 0) {
                comboTreeExt.data().handler._dropdown.input.css({ 'text-decoration': 'underline' });
            }

            // blur decoration
            targetEle.find("input").blur(function () {
                
                if ($(this).val() == "" && $(this).val() == localization.ChooseOne) {
                    inputDecoration($(this), false, false);
                }
            });

            targetEle.find("input").attr("name", settings.targetValId);
            
            if (targetEle.closest("div").hasClass("required")) {
                targetEle.find("input").attr("required", "");
            }

            // 2 way bind viewModel
            if (boundObj && name) {
                boundObj[name].bind("change", function (e) {
                    comboTreeExt.data().handler._dropdown.value(boundObj[name].Name);
                });
            }

            //alert(targetEle.html());
        }

        /** EVENTS **/

        var comboSelect = function (e) {
            //e.dataItem has correct value on arrowKey selection
            //this.dataItem(this.select()) has correct value after enter key press on search
            var item = (e.dataItem) ? e.dataItem : this.dataItem(this.select());
            var inpVal = targetEle.find('input').val();
            if (!item && (inpVal == "" || inpVal == localization.ChooseOne)) {
                item = {
                    Text: null,
                    Id: null
                }


            }
            if (item) {
                setModelValue(item.Text, item.Id);
                inputDecoration(this.input, false, (item.Id == "00000000-0000-0000-0000-000000000000"));

            } else {

                inputDecoration(this.input, true, true);
                setModelValue(null, null);
                this.input.val(inpVal);

            }
        }

        var comboChange = comboSelect;

        var comboValidate = function (e) {
            //validate input on every key press so we can show underline correctly 
            comboTreeExt.data().handler._dropdown.input.on('keyup', function () {
                
                //clone and flattend datasource for search
                var ds = _.clone(comboTreeExt.data().handler._dropdown.dataSource);
                var view = ds.view();

                //do we have an exact match
                if (_.where(view, { Text: comboTreeExt.data().handler._dropdown.input.val() }).length > 0) {
                    $(this).css("text-decoration", "underline");
                    $(this).css("background-color", "#FFFFFF");
                } else {
                    $(this).css("text-decoration", "none");
                    //$(this).css("background-color", "#FBE3E4");
                }
            });
        };

        var comboDataError = function (e) {
            app.lib.log(e.errorThrown + " - When retrieving list for combo in dropDownTree at " + url);
        }

        var treeChange = function (e) {
            var item = this.dataItem(this.select());
            if (item) {
                setModelValue(item.Text, item.Id);
                comboTreeExt.data().handler._dropdown.input.removeClass("has-error");
            }
        }

        /** OPTIONS **/

        // ComboTreeEXT options (ExtDropDownTreeViewV2)
        var extOptions = {
            boundObjName: name,
            boundObj: boundObj,
            name: name
        }

        // comboBox options
        var comboBoxOptions = {
            autoBind: false,
            dataTextField: "Text",
            dataValueField: "Id",
            filter: "contains",
            suggest: true,
            minLength: 3,
            placeholder: localization.ChooseOne,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: {
                        url: url + (_.contains(url, "?") ? "&flatten=true" : "?flatten=true"),
                        dataType: "json",
                        data: function () {
                            return {
                                itemFilter: function () {
                                    return comboTreeExt.data().handler._dropdown.input.val();
                                }
                            };
                        }
                    },
                    parameterMap: function (data) {
                        // AffectedItemValueId hits config item api endpoint, so we only want itemFilter going up
                        if (settings.targetValId == "AffectedItemValueId") {
                            return { itemFilter: data.itemFilter() };
                        } else {
                            return data;
                        }
                    }
                },
                error: comboDataError
            },
            select: comboSelect,
            change: comboChange,
            dataBound: comboValidate
        }


        extOptions.comboBox = comboBoxOptions;

        // treeView Options
        var treeViewOptions = {
            dataTextField: "Text",
            loadOnDemand: true,
            change: treeChange
        }
        var treeDataSource = new kendo.data.HierarchicalDataSource({
            transport: {
                read: {
                    url: url,
                    dataType: "json",
                    data: function () {
                        return {
                            itemFilter: function () {
                                if (_.isUndefined(comboTreeExt)) {
                                    return "";
                                } else {
                                    return comboTreeExt.data().handler._dropdown.input.val();
                                }
                            }
                        };
                    }
                }
            },
            schema: {
                model: {
                    id: "Id",
                    hasChildren: "HasChildren"
                }
            }
        });

        treeViewOptions.dataSource = treeDataSource;

        extOptions.treeView = treeViewOptions;


        // methods
        var inputDecoration = function (input, error, underline) {
            if (error) {
                input.css("background-color", "#FBE3E4");
                input.css("text-decoration", "none");
                input.addClass("has-error");
            } else {
                input.css("background-color", "#FFFFFF");
                (underline) ? input.css("text-decoration", "underline") : input.css("text-decoration", "none");
                input.removeClass("has-error");
            }
        }

        /** End **/

        init();


    }

    /**

    NEW ENUM PICKER, for GetEnumList
    // created to handle parent child relations and all enums

    **/
    this.enumPicker = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.EnumPicker"); }
        if (!settings.enumId) { app.controls.exception("enumid missing - controls.EnumPicker"); }
        if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.dropDownTree"); }
        if (!settings.name) { app.controls.exception("name missing - controls.dropDownTree"); }
        var boundObj = settings.boundObj;
        var name = settings.name;
        // fake the funk for missing viewModel props        
        that.forceProp(boundObj, name, { Id: null, Name: null });
        var enumId = settings.enumId;
        var url = "/api/V3/Enum/GetList/";
        var bmustSelectLeafNode = (!settings.mustSelectLeafNode) ? "false" : settings.mustSelectLeafNode;
        //var bShowEnumPath = (!settings.showEnumPath) ? false : settings.showEnumPath;
        var objectFlatName = "/api/V3/Enum/GetEnumFlatDisplayName?TopLevelId="+ enumId +"&Id=";

        var getText = that.getText;

        var setModelValue = function (text, id) {
            if (settings.targetValId) {
                $('#' + settings.targetValId).val(id);
                $('#' + settings.targetValId).change();
                if (settings.targetNameId) {
                    $('#' + settings.targetNameId).val(text);
                }
            } else {
                boundObj[name].set("Name", text);
                boundObj[name].set("Id", id);
            }
        }



        /******************/
        /** COMBOTREEEXT **/
        /******************/

        var comboTreeExt;
        var initialDisplayName = (function () {
            if (settings.targetNameId) {
                return $('#' + settings.targetNameId).val();
            }
            if (boundObj && boundObj[name] && boundObj[name].Name) {
                if (settings.showEnumPath == "true") {
                    $.ajax({
                        url: objectFlatName + boundObj[name].Id,
                        async: false,
                        timeout: 3000,
                        success: function (data) {
                            if (data) {
                                boundObj[name].set("Name", data.Text);
                            }
                        }
                    });
                } 
                return boundObj[name].Name;
            }
            return "";
        })();

        /** INIT **/

        var init = function () {



            comboTreeExt = targetEle.kendoExtDropDownTreeViewV2(extOptions);

            // set initial value
            if (initialDisplayName.length > 0)
                comboTreeExt.data().handler._dropdown.value(initialDisplayName);

            // make a pretty underline
            if (initialDisplayName && initialDisplayName.length > 0) {
                comboTreeExt.data().handler._dropdown.input.css({ 'text-decoration': 'underline' });
            }

            // blur decoration
            targetEle.find("input").blur(function () {
                //clear treeview selection on delete
                if ($(this).val() == "") {
                    comboTreeExt.data().handler._treeview.select($());
                }

                if ($(this).val() == "" && $(this).val() == localization.ChooseOne) {
                    inputDecoration($(this), false, false);
                }
            });


            //disable 
            if (targetEle.attr('disabled')) {
                targetEle.addClass('disabled');
                //make sure to limit elements to our children only with find method
                targetEle.find('input').each(function () {
                    $(this).attr("disabled", "disabled");
                    $(this).attr("placeholder", "");
                    $(this).addClass("k-state-disabled");
                });

                targetEle.find('.k-icon.k-i-arrow-s, .k-icon.k-i-arrow-n, .k-select, .searchIcon, .search, .k-button,  button').each(function () {
                    $(this).remove();
                });
            }


            
            // 2 way bind viewModel
            if (boundObj && name) {
                boundObj[name].bind("change", function (e) {
                    _.defer(function(){
                        comboTreeExt.data().handler._dropdown.value(boundObj[name].Name);
                    });
                });
            }

            // disable parent node if leaf node only
            if (bmustSelectLeafNode === "true") {
                comboTreeExt.find(".dropdowntree-button").click(function () {
                    $(this).parents(".form-control-picker").find("span[role='presentation']").parent().find(".k-in").each(function () {
                        $(this).addClass("k-state-selected");
                        $(this).css("background", "none");
                        $(this).css("color", "gray");
                        $(this).css("border-color", "white");
                        $(this).css("cursor", "default");
                    });
                });
            }
        }

        /** EVENTS **/
        var comboChange = function (e) {
            var item = this.dataItem(this.select());
            
            var data = e.sender.dataSource.data();
            if (data.length > 0 && data[0].Id != "00000000-0000-0000-0000-000000000000") { //this fix the bug-24963

                targetEle.find('input').val(data[0].Text)

                treeChangeItem = {
                    Text: data[0].Text,
                    Id: data[0].Id
                }

            }

            var inpVal = targetEle.find('input').val();
            if (!item && (inpVal == "" || inpVal == localization.ChooseOne)) {
                item = {
                    Text: null,
                    Id: null
                }
            }
            //only use the treechangeitem if the item is null
            if (!item && treeChangeItem) {
                item = {
                    Text: treeChangeItem.Text,
                    Id: treeChangeItem.Id
                }
            }

            if (item) {
                if (item.Id != "00000000-0000-0000-0000-000000000000") {
                    setModelValue(item.Text, item.Id);
                    inputDecoration(this.input, false, true);
                } else
                    setModelValue(null, null);
            } else {
                inputDecoration(this.input, true, true);
                setModelValue(null, null);
                this.input.val(inpVal);
            }
        }

        var comboValidate = function (e) {
            //validate input on every key press so we can show underline correctly 
            comboTreeExt.data().handler._dropdown.input.on('keyup', function () {
                //clone and flattend datasource for search
                var ds = _.clone(comboTreeExt.data().handler._dropdown.dataSource);
                var view = ds.view();

                //do we have an exact match
                if (_.where(view, { Text: comboTreeExt.data().handler._dropdown.input.val() }).length >= 0) {
                    $(this).css("text-decoration", "underline");
                    $(this).css("background-color", "#FFFFFF");
                } else {
                    $(this).css("text-decoration", "none");
                }
            });
        };

        var comboDataError = function (e) {
            app.lib.log(e.errorThrown + " - When retrieving list for combo in dropDownTree at " + url);
        }

        var treeChangeItem;
        var treeChange = function (e) {
            var item = this.dataItem(this.select());
            if (item) {
                setModelValue(item.Text, item.Id);
                boundObj.IsEnumValid = true;
                treeChangeItem = item;
            }
        }
        var disableParentNode = function (e) {
            if (bmustSelectLeafNode === "false") { return; }
            setTimeout(function () {
                $(e.node).find("span[role='presentation']").parent().find(".k-in").each(function () {
                    $(this).addClass("k-state-selected");
                    $(this).css("background", "none");
                    $(this).css("color", "gray");
                    $(this).css("border-color", "white");
                    $(this).css("cursor", "default");
                });
            }, 100);
        }

        /** OPTIONS **/

        // ComboTreeEXT options (ExtDropDownTreeViewV2)
        var extOptions = {
            boundObjName: name,
            boundObj: boundObj,
            name: name
        }
       
        // comboBox options
        var comboBoxOptions = {
            autoBind: false,
            dataTextField: "Text",
            dataValueField: "Id",
            filter: "contains",
            suggest: true,
            minLength: 3,
            placeholder: localization.ChooseOne,
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: {
                        url: "/api/V3/Enum/GetFlatList/",
                        dataType: "json",
                        data: {
                            id: enumId,
                            includeParents: (bmustSelectLeafNode === "true") ? false : true,
                            itemFilter: function () {
                                return comboTreeExt.data().handler._dropdown.input.val();
                            }
                        }
                    }
                },
                error: comboDataError
            },
            change: comboChange,
            dataBound: comboValidate,
            clearButton: !_.isUndefined(settings.showClearButton) ? settings.showClearButton : false
        }


        extOptions.comboBox = comboBoxOptions;

        // treeView Options
        var treeViewOptions = {
            dataTextField: "Text",
            loadOnDemand: true,
            change: treeChange,
            expand: disableParentNode
        }
        var treeDataSource = new kendo.data.HierarchicalDataSource({
            transport: {
                read: {
                    url: url,
                    dataType: "json"
                },
                parameterMap: function (data) {
                    // change url parameters for parent/child
                    var params = {};
                    if (!data.Id) {
                        params.Id = enumId;
                    } else {
                        params.Id = data.Id;
                        params.parentId = enumId;
                    }
                    return params;
                }
            },
            schema: {
                model: {
                    id: "Id",
                    hasChildren: "HasChildren"
                }
            }
        });

        treeViewOptions.dataSource = treeDataSource;

        extOptions.treeView = treeViewOptions;


        // methods
        var inputDecoration = function (input, error, underline) {
            if (error) {
                input.css("background-color", "#FBE3E4");
                input.css("text-decoration", "none");
                boundObj.set("IsEnumValid", false);
            } else {
                input.css("background-color", "#FFFFFF");
                (underline) ? input.css("text-decoration", "underline") : input.css("text-decoration", "none");
                boundObj.set("IsEnumValid", true);
            }
        }

        /** End **/

        init();


    }

    /*
        settings = {
            targetValId: id of input to apply value, 
            itemType: need clarification - to be added

            // note, if targetValId is set the below is not required.            
            customFilter:  a custom filter applied to controls
            boundObj:  parent kendo object for applying set(name,val)
            name: kendo object prop name

        }

    */
    this.comboBox = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.comboBox"); }
        if (!settings.url) { app.controls.exception("url missing - controls.comboBox"); }

        var url = settings.url;
        if (!settings.targetValId) {
            if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.comboBox"); }
            if (!settings.name) { app.controls.exception("name missing - controls.comboBox"); }
            var boundObj = settings.boundObj;
            var name = settings.name;
            // fake the funk for missing viewModel props
            that.forceProp(boundObj, name, {});
        }

        var customFilter = (settings.filter) ? settings.filter : false;

        var picker = new (function () {
            var comboUrl = url;
            var combo;
            var tree;
            var selectedObj = { user: null };
            var setSelectedObj = function (val) {
                selectedObj.user = val;
            }
            // apply guid for id attr (workaround for current userpicker functionality)
            var targetId = app.lib.newGUID();
            targetEle.attr("id", targetId);


            var dataSource = {
                transport: {
                    prefix: "",
                    read: {
                        url: comboUrl
                    }
                },
                serverFiltering: true,
                filter: [],
                schema: {
                    errors: "Errors"
                },
                requestEnd: function (e) {
                    var response = e.response;
                    if (response.length < 1) {
                        combo.input.attr("placeholder", localization.NothingToSelect);
                    }
                }
            }
            if (customFilter) {
                dataSource.transport.read.data = function () { return that.filters.get(customFilter)(); };
            }
            // create combo
            var comboSettings = {
                autoBind: true,
                dataTextField: "Name",
                dataValueField: "Id",
                suggest: true,
                placeholder: localization.ChooseOne,
                dataSource: dataSource
            }

            //over write it data attributes
            dataConfig = $.parseJSON(targetEle.attr("data-control-config"));

            $.extend(true, comboSettings, dataConfig);

            combo = targetEle.kendoComboBox(comboSettings).data("kendoComboBox");

            if (combo.input.val().length > 0) {
                combo.input.css("text-decoration", "underline");
            }



            var setModelValue = function (text, id) {

                if (settings.targetValId) {
                    $('#' + settings.targetValId).val(id);
                    $('#' + settings.targetNameId).val(text);
                    $('#' + settings.targetValId).change();
                } else {
                    boundObj[name].set("Name", text);
                    boundObj[name].set("Id", id);
                }

            }


            combo.input.on('keyup', function () {

                var ds = _.clone(combo.dataSource);
                var view = ds.view();

                //do we have an exact match
                if (_.where(view, { Name: combo.input.val() }).length > 0) {
                    $(this).css("text-decoration", "underline");
                    $(this).css("background-color", "#FFFFFF");
                } else {
                    $(this).css("text-decoration", "none");
                }

            });


            combo.bind("change", function (e) {
                var t = this.text();
                var v = this.value();

                if (v && this.selectedIndex == -1) {
                    this.input.css("background-color", "#FBE3E4");
                    this.input.css("text-decoration", "none");
                    setModelValue(null, null);
                    setSelectedObj(null);
                    this._filterSource({
                        value: "",
                        field: this.options.dataTextField,
                        operator: "contains"
                    });
                } else {
                    if (t == "" && v == "") {
                        t = null; v = null;
                    }
                    setModelValue(t, v);
                    setSelectedObj(null);
                    this.input.css("background-color", "#FFFFFF");
                    if (v == "00000000-0000-0000-0000-000000000000") {
                        this.input.css("text-decoration", "none");
                    } else {
                        this.input.css("text-decoration", "underline");
                    }
                }
            });

            if (settings.targetValId) {
                combo.value($('#' + settings.targetNameId).val());
            } else {
                combo.value(boundObj[name].Name);
            }

            this.combo = combo;
            this.ele = targetEle;
            this.tree = tree;
            this.selectedObj = selectedObj;

            //bind viewModel change to view change 
            if (boundObj && name) {
                boundObj[name].bind("change", function (e) {
                    combo.value(boundObj[name].Name);
                });
            }

        })();
        var targetId = app.lib.newGUID();
        targetEle.attr('data-control-guid', targetId);
        that.items.userPicker[targetId] = picker;
        return picker;
    }


    // Note: has dependancy on singleton userPickerWindow - todo: add to app.controls
    // Strong structure ties to reviewerGrid, careful editing
    // 
    /*
        settings = {
            targetValId: id of input to apply value, 
            itemType: need clarification - to be added

            // note, if targetValId is set the below is not required.            
            customFilter:  a custom filter applied to controls
            boundObj:  parent kendo object for applying set(name,val)
            name: kendo object prop name

        }

    */
    //this.userPickerOld = function (targetEle, boundObj, name, itemType, customFilter) {
    this.userPickerOld = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.userPicker"); }
        if (!settings.targetValId) {
            if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.userPicker"); }
            if (!settings.name) { app.controls.exception("name missing - controls.userPicker"); }
            var boundObj = settings.boundObj;
            var name = settings.name;
            // fake the funk for missing viewModel props
            that.forceProp(boundObj, name, {});
        }

        var picker = new (function () {
            var comboUrl = "/api/V3/User/GetUserList";
            var combo;
            var tree;
            var selectedObj = { user: null };
            var setSelectedObj = function (val) {
                selectedObj.user = val;
            }
            var defaultTargetValId = (settings.targetValId) ? $('#' + settings.targetValId).val() : "";
            var userData = [];
      
            // apply guid for id attr (workaround for current userpicker functionality)
            var targetId = app.lib.newGUID();
            targetEle.attr("id", targetId);

            // create search btn
            var btn = $("<button>", { "class": "two-action-input-group__primary-action k-button old-userpicker-button", "data-control-action": "userPickerWindow" });
            var a = $("<i>", { "class": "fa fa-search" });
            btn.append(a);

            btn.click(function () {
                
                userPickerWindow.open(function (userObj) {
                    if (userObj) {
                        setSelectedObj(userObj);
                        combo.value(userObj.Name);
                        setModelValue(userObj.Name, userObj.Id);
                    }
                });

                return false;
            });

            // create control wrapper
            var group = $("<div>", { "class": "two-action-input-group" });
            group.insertBefore(targetEle);
            group.append(targetEle, btn);

            var getFilterValue = function () {
                if (!combo) {
                    arrowPress = false;
                    return "";
                } else {
                    return combo.input.val();
                }
            }
            var filterUsers = function () {
                return {
                    userFilter: function () {
                        return getFilterValue();
                    }
                };
            }


            // create combo
            var comboSettings = {
                autoBind: true,
                dataTextField: "Name",
                dataValueField: "Id",
                filter: "contains",
                suggest: true,
                placeholder: localization.ChooseOne,
                dataSource: {
                    transport: {
                        prefix: "",
                        read: {
                            url: comboUrl,
                            data: filterUsers
                        }
                    },
                    serverFiltering: true,
                    filter: [],
                    schema: {
                        errors: "Errors"
                    }
                }
            }
            combo = targetEle.kendoComboBox(comboSettings).data("kendoComboBox");

            //add option to view users name/val pars
            var openNameVal = $("<div>", { "class": "open-modal fa fa-info-circle" });
            combo.input.before(openNameVal);
            //add div for name/value window
            targetEle.append($("<div>", { "id": "objectViewerWindow" }));
            //hide initially
            openNameVal.addClass("display-none");

            openNameVal.click(function (e) {

                var id = false;
                if (boundObj && boundObj[name] && boundObj[name].Id) {
                    id = boundObj[name].get("Id");
                    title = boundObj[name].get("Name");
                }
                else if (combo.dataItem()) {
                    id = combo.dataItem().get("Id");
                    title = combo.dataItem().get("Name");
                }
                if (typeof (id) === 'undefined') {
                    return;
                }

                var windowEle = $("#objectViewerWindow");
                var dialog = windowEle.kendoCiresonWindow({
                    title: title,
                    width: 550,
                    height: 400,
                    actions: ["Close"]
                }).data("kendoWindow");

                dialog.refresh({
                    url: "/Search/ObjectViewer",
                    data: { id: id }
                });
                //don't open window till we get the data back
                dialog.bind("refresh", function () {
                    dialog.title(title).center().open();
                });
                //destroy element on close
                dialog.bind("close", function () {
                    dialog.destroy();
                    targetEle.append($("<div>", { "id": "objectViewerWindow" }));
                });
            });

            // Filter settings
            // bind expand arrow click
            var arrowPress = false;
            $(combo.wrapper).find(".k-i-arrow-s").click(function () {
                arrowPress = true;
                combo.dataSource.read();
            });

            var setModelValue = function (text, id) {
                if (settings.targetValId) {
                    $('#' + settings.targetValId).val(id);
                    $('#' + settings.targetNameId).val(text);
                    $('#' + settings.targetValId).change();
                } else {
                    
                    boundObj[name].set("Name", text);
                    boundObj[name].set("Id", id);
                    setViewValue(text, id);
                }

            }
            var setViewValue = function (text, id) {
                //only if it is differant
                if ((combo.text() !== text || combo.value() !== id))
                {
                    combo.text(text);
                    combo.value(id);
                }
            }

            var resetFilter = function () {
                combo._filterSource({
                    value: "",
                    field: combo.options.dataTextField,
                    operator: "contains"
                });
            }

            var setInvalid = function () {
                combo.input.css("text-decoration", "none");
                combo.input.css("background-color", "#FBE3E4");
                openNameVal.addClass("display-none");
                openNameVal.removeClass("display-block");
                //setModelValue(null, null);
                resetFilter();
            }

            var setValidIncomplete = function () {
                combo.input.css("text-decoration", "none");
                combo.input.css("background-color", "#FFFFFF");
                openNameVal.addClass("display-none");
                openNameVal.removeClass("display-block");
            }

            var setValidComplete = function () {
                combo.input.css("text-decoration", "underline");
                combo.input.css("background-color", "#FFFFFF");
                openNameVal.removeClass("display-none");
                openNameVal.addClass("display-block");
            }

            var isValidComplete = function () {

                var ds = _.clone(combo.dataSource);
                var view = ds.view();

                //do we have an exact match
                if (_.where(view, { Name: combo.input.val() }).length > 0) {
                    setValidComplete();
                    return true;
                } else {
                    setValidIncomplete();
                    return false;
                }
            }

            //hande change event on combo
            var makeChange = function (text, id) {
                if (text !== null && id !== null &&
                    text !== "" && id !== "") {
                    if (id === "00000000-0000-0000-0000-000000000000") {
                        setValidIncomplete();
                    } else if (text !== id) {
                        //no need to set the data to the combox now.
                        //setViewValue(text, id); 
                        if (isValidComplete()) {
                            setModelValue(text, id);
                        } else {
                            setInvalid();
                        }
                    } else {
                        setInvalid();
                    }
                }

                if (text === "" && id === "") {
                    setModelValue(null, defaultTargetValId);
                }
            }

            //determine when we hit an actual value
            combo.input.on('keyup', function () {
                isValidComplete();
            });

            combo.input.bind("blur", function (e) {
                makeChange(combo.text(), combo.value());
            });

            combo.bind("change", function (e) {
                makeChange(this.text(), this.value());
            });

            combo.input.bind("change", function (e) {
                combo.dataSource.read();
                setValidComplete();
            });

            if (settings.targetValId) {
                combo.value($('#' + settings.targetNameId).val());
            } else {
                combo.value(boundObj[name].Name);
            }

            //init view styles
            if (boundObj && boundObj[name] && boundObj[name].Name && boundObj[name].Name.length > 0) {
                openNameVal.removeClass("display-none");
                openNameVal.addClass("display-block");
            }

            this.combo = combo;
            this.ele = targetEle;
            this.tree = tree;
            this.selectedObj = selectedObj;

            //bind viewModel change to view change 
            if (boundObj && name) {
                boundObj[name].bind("change", function (e) {
                    if ((boundObj[name].Name !== boundObj[name].Id) &&
                        (combo.text() !== boundObj[name].Name || combo.value() !== boundObj[name].Id)) {
                        //trigger a combobox change
                        makeChange(boundObj[name].Name, boundObj[name].Id);

                        //inorder to make sure all other events get triggered we need
                        //to focus on the combo and trigger the selection
                        combo.input.focus();

                        //added to fix the issue where if selected user (from picker) does not belong to the first 10 objects, 
                        //it is not validated and id is displayed instead
                        combo.input.val(boundObj[name].Name);
                        combo.input.change();
                    }
                });
            }

        })();
        var targetId = app.lib.newGUID();
        targetEle.attr('data-control-guid', targetId);
        that.items.userPicker[targetId] = picker;
        return picker;
    }

    //userPicker Improved
    this.userPicker = function (targetEle, settings) {

        if (!targetEle) { app.controls.exception("targetEle missing - controls.userPicker"); }
        var extraProps = targetEle.attr("data-control-extra");
        var objectExtraUrl = "/Search/GetObjectPropertiesByProjection?projectionId=490ab845-b14c-1d91-c39f-bb9e8a350933&id=";
        
        if (!settings.targetValId) { //this is for service catalog
            if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.userPicker"); }
            if (!settings.name) { app.controls.exception("name missing - controls.userPicker"); }
            var boundObj = settings.boundObj;
            var name = settings.name;
            // fake the funk for missing viewModel props
            that.forceProp(boundObj, name, {
                DisplayName: null,
                BaseId: null
            });
        }

        //this is a more genaric way to set hidden fields and also allows for a bound VM
        if (settings.target) {
            settings.targetValId = settings.target + "Id";
            settings.targetNameId = settings.target + "Name";
        }

        var isModelSet = function () {
            return (boundObj && boundObj[name] && boundObj[name].DisplayName && boundObj[name].BaseId);
        }


        // EXTRA USER DATA AND HELP-BLOCK
        // note: this was in template, but binding wasnt working for some reason, need to look into it
        var helperBlock = $('<span>', { "class": "help-block", "data-bind": "text: extraPropText, visible: isVisible" });
        var insertHere = targetEle.parent();
        var _vm = kendo.observable({
            isVisible: false,
            extraPropText: "",
            data: {},
            getUserObjectData: function (userId) {
                $.get(objectExtraUrl + userId, function (data) {
                    if (data && data[0]) {
                        data = data[0];
                    }
                    _vm.set("data", data);
                    setExtraPropsDisplay();
                });
            }
        });
        _vm.bind("change", function (e) {
            if (e.field == "extraPropText") {
                _vm.set("isVisible", (_vm.extraPropText.length > 0));
            } else if (e.field == "data") {
                setExtraPropsDisplay();
            }
        });
        kendo.bind(helperBlock, _vm);
        setTimeout(function () {
            insertHere.append(helperBlock);
        }, 100);

        var setExtraPropsDisplay = function () {
            if (extraProps && extraProps != "false") {
                var str = "";
                var fields = extraProps.split(",");
                $.each(fields, function (i, item) {
                    if (_vm.data[item]) {
                        str += _vm.data[item] + ", ";
                    }
                });
                _vm.set("extraPropText", str.substring(0, str.length - 2));
            }
        }

        var setModelValue = function (text, id) {
            //this is for service catalog
            if (settings.targetValId) {
                $('#' + settings.targetValId).val(id);
                $('#' + settings.targetNameId).val(text);
                $('#' + settings.targetValId).change();
            }

            //if vm object is present, update it with the selected user
            if (!_.isUndefined(boundObj[name])) {
                //we are going to replace with a new 'user' object
                //actually set the object the way we want
                var userObj = { BaseId: id, DisplayName: text };
                boundObj.set(name, userObj);
                setValidComplete();
            }
        }

        if (boundObj[name].BaseId) {
            _vm.getUserObjectData(boundObj[name].BaseId);
        }

        boundObj.bind("change", function (e) {
            if (e.field == "AssignedWorkItem.BaseId") {
                var userObj = {
                    Name: boundObj[name].DisplayName,
                    Id: boundObj[name].BaseId
                };
                
                if (userObj.Id == null) {
                    autocomplete.value(null);
                    setValidIncomplete();
                } else {

                    // check if value is in datasoure, if not add it
                    if (!isMatchInDataSource(userObj.Name) && autocomplete && autocomplete.dataSource) {
                        autocomplete.dataSource.add(userObj)
                    };
                    //change the input field value
                    autocomplete.value(userObj.Name);
                    //assume that vm changed values are correct
                    setValidComplete();
                    //focus on the attached form element
                    autocomplete.focus();

                    _vm.getUserObjectData(userObj.Id);
                }
            }
        });
        boundObj[name].bind("change", function (e) {
            var userObj = {
                Name: boundObj[name].DisplayName,
                Id: boundObj[name].BaseId
            };
            // wait till both properties are bound before assigning to datasource
            if (userObj.Name == null || userObj.Id == null) {
                return;
            }

            // check if value is in datasoure, if not add it
            if (!isMatchInDataSource(userObj.Name) && autocomplete && autocomplete.dataSource) {
                autocomplete.dataSource.add(userObj)
            };
            //change the input field value
            autocomplete.value(userObj.Name);
            //assume that vm changed values are correct
            setValidComplete();
            //focus on the attached form element
            autocomplete.focus();

            _vm.getUserObjectData(userObj.Id);

        });


        var autoCompleteChange = function (e) {
            var val = autocomplete.value();
            var valId = isModelSet() ? boundObj[name].BaseId : null;
            var valDisplayName = isModelSet() ? boundObj[name].DisplayName : null;

            // check empty
            if (val == "") {
                setModelValue(null, null);
                setValidIncomplete();
                return true;
            }
            // check for name match case insensitive
            var match = isMatchInDataSource(val);
            if (match) {
                setModelValue(match.Name, match.Id);
                return true;
            }
            // must be bad              
            var badval = val;
            setModelValue(valDisplayName, valId);
            setInvalid();
            autocomplete.value(badval);
        }

        //setup the kendo autocomplete object
        var autocomplete = $(targetEle).kendoAutoComplete({
            dataTextField: "Name",
            suggest: true,
            placeholder: (targetEle.attr('disabled')) ? "" : localization.SearchButton,
            valuePrimitive: false,
            select: function (e) {
                var usr = this.dataItem(e.item.index());
                setModelValue(usr.Name, usr.Id);
            },
            change: autoCompleteChange,
            enable: (targetEle.attr('disabled')) ? false : true,
            clearButton: false
        }).data("kendoAutoComplete");

        //setup our dataSource
        var usersUrl = "/api/V3/User/GetUserList";
        //setup the search data source
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: usersUrl,
                    data: {
                        userFilter: function () {
                            return autocomplete.value();
                        }
                    }
                }
            },
            serverFiltering: true
        });
        autocomplete.setDataSource(dataSource);

        //------------------------------- Search Icon ----------------------------------//
        var btn = $("<div>", { "class": "searchIcon", "data-control-action": "userPickerWindow" });
        var a = $("<i>", { "class": "fa fa-search cursor-pointer text-primary" });
        //var a = (app.isMobileDevice()) ?  $("<i>", { "class": "fa fa-search" }) : $("<a>", { "class": "search", href: "javascript:void(0)" });
        btn.append(a);
        //add button function/action
        btn.click(function () {
            userPickerWindow.open(function (userObj) {
                if (userObj) {
                    autocomplete.dataSource.add(userObj);
                    autocomplete.value(userObj.Name);
                    setModelValue(userObj.Name, userObj.Id);

                    //we are going to assume that the value from the userPicker window is correct
                    setValidComplete();
                }
            });
        });
        //add button inside the autocomplete wrapper
        if (!targetEle.attr('disabled')) {
            btn.insertAfter($(targetEle));
        }


        //------------------------------- USER Expansion Viewer ----------------------------------//
        //add option to view users name/val pars
        var openExpansion = (app.isMobileDevice()) ? $("<i>", { "class": "fa fa-info-circle info-icon" }) : $("<div>", { "class": "open-modal fa fa-info-circle" });
        targetEle.before(openExpansion);
        //hide initially
        openExpansion.css("display", "none");

        openExpansion.click(function (e) {
            // should not open if not a valid user
            if (!isModelSet()) {
                return;
            }

            var id = boundObj[name].get("BaseId");
            var title = boundObj[name].get("DisplayName");

            //create a dialog
            targetEle.append($("<div>", { "id": "objectViewerWindow" }));
            var dialog = $("#objectViewerWindow").kendoCiresonWindow({
                title: title,
                width: 550,
                height: 400,
                actions: ["Close"]
            }).data("kendoWindow");

            dialog.refresh({
                url: "/Search/ObjectViewer",
                data: { id: id }
            });
            //don't open window till we get the data back
            dialog.bind("refresh", function () {
                dialog.title(title).open();
            });
            //destroy element on close
            dialog.bind("close", function () {
                dialog.destroy();
                targetEle.append($("<div>", { "id": "objectViewerWindow" })); 
            });
        });

        //------------------------------------Validation Functions----------------------------------/
        var setInvalid = function () {
            autocomplete.element.css("text-decoration", "none");
            $(targetEle).css("background-color", "#FBE3E4");
            openExpansion.css("display", "none");
        }

        var setValidIncomplete = function () {
            autocomplete.element.css("text-decoration", "none");
            if (!targetEle.attr('disabled')) {
                $(targetEle).css("background-color", "#FFFFFF");
            }
            openExpansion.css("display", "none");
        }

        var setValidComplete = function () {
            autocomplete.element.css("text-decoration", "underline");
            if (!targetEle.attr('disabled')) {
                $(targetEle).css("background-color", "#FFFFFF");
            }
            openExpansion.css("display", "inline-block");
        }

        var isMatchInDataSource = function (val) {
            var ds = _.clone(autocomplete.dataSource);
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

        var isValidComplete = function () {
            (isMatchInDataSource(autocomplete.value())) ? setValidComplete() : setValidIncomplete();
        }

        //-------------------------------------------event binding--------------------------------------/
        //determine when we hit an actual value
        autocomplete.element.on('keyup', function (e) {
            if (e.which == 40 && !autocomplete.ul.is(":visible")) {
                autocomplete.search(autocomplete.value());
            } else {
                isValidComplete();
            }

        });
        autocomplete.element.bind("blur", autoCompleteChange);

        //select text when user clicks input element
        autocomplete.element.on("click", function () {
            $(this).select();
        });


        //init view styles
        autocomplete.value(boundObj[name].DisplayName);
        if (isModelSet()) {
            setValidComplete();
        }

        var targetId = app.lib.newGUID();
        targetEle.attr('data-control-guid', targetId);
        that.items.userPicker[targetId] = autocomplete;
        return autocomplete;
    }

    // Note: has dependency on userPicker
    this.reviewerGrid = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.reviewerGrid"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.reviewerGrid"); }
        if (!name) { app.controls.exception("name missing - controls.reviewerGrid"); }
        
        that.forceProp(boundObj, name, []);

        var reviewerControl = new (function () {
            var boundArray = boundObj[name];
            var grid;
            var picker;
            var editFlag = false;
          
            // loop through reviewer and add "name" property and equate it with displayname (name is the property used in bindings) 
            $.each(boundObj[name], function (i, item) {
                if (item.User) {
                    item.User.Name = item.User.DisplayName;
                }
                if (item.VotedBy) {
                    item.VotedBy.Name = item.VotedBy.DisplayName;
                }
            });

            // internal enums to external name and id's
            var decisions = {
                "none": "dae75d12-89ac-a8d8-4fe3-516c2a6a26f7",
                "approve": "0e856c6c-04e5-0a8e-6041-bc7715b4747e",
                "reject": "107fc6bd-2bb3-0282-4425-f43b5b32ef13"
            }
            var defaultDecisionId = decisions["none"]; // not yet voted

            var model = {
                "Comments": null,
                "Decision": {
                    "Id": null,
                    "Name": null
                },
                "DecisionDate": null,
                "DisplayName": null,
                "MustVote": false,
                "ReviewerId": null,
                "Veto": true,
                "ClassTypeId": null,
                "BaseId": null,
                "FullName": null,
                "Path": null,
                "TimeAdded": null,
                "ClassName": null,
                "LastModified": null,
                "LastModifiedBy": null,
                "User": {
                    "Id": null,
                    "Name": null
                },
                "VotedBy": {
                    "Id": null,
                    "Name": null
                }
        }
            var enums = (!app.config.enums['ReviewerDecisionList']) ? [] : app.config.enums['ReviewerDecisionList'];
            if (!enums.length) {
                $.getJSON("/api/V3/Enum/GetList", { Id: "717a1f99-9587-fa8c-aa60-14906933d457" }, function (data) {
                    enums = data;
                    app.config.enums['ReviewerDecisionList'] = enums;
                });
            }

            var onReady = function (callback) {
                var checkStatus = function (x) {
                    var b = true;
                    if (!enums.length) {
                        b = false;
                    }
                    if (x < 150) { // only only this process for a short time (45 seconds)
                        if (!b) {
                            setTimeout(function () {
                                checkStatus(x + 1);
                            }, 300);
                        } else {
                            callback();
                        }
                    } else {
                        app.lib.exception("Retrieving activity templates timed out");
                    }
                }
                checkStatus(1);
            }

            var drawControl = function () {
                var callback = function (template) {
                    var template = $(template);
                    var gridEle = $(template.find("[data-kendo-control='grid']")[0]);
                    var pickerEle = $(template.find("[data-control='userPickerOld']")[0]);
                    var mobileGridEle = $(template.find("[data-kendo-control='gridMobile']")[0]);
                    
                    var approvalPercentageElem = $("[data-activity-id='" + boundObj.Id + "'] + .activity-item-body");
                    var approvalPercentageControl = $(approvalPercentageElem.find("[name='approvalPercentage']")[0]).data("kendoNumericTextBox");
                   
                    var checkboxBinds = kendo.observable({ "Veto": null, "MustVote": null });
                    var selectedUser = kendo.observable(model.User);
                    
                    targetEle.append(template);
                    that.localize(template, localization);
                    kendo.bind(targetEle, checkboxBinds);

                    // grid
                    grid = gridEle.kendoGrid({
                        sortable: true,
                        resizable: true,
                        pageable: false,
                        selectable: true,
                        reorderable: true,
                        columnMenu: {
                            messages: {
                                columns: localization.ChooseColumns,
                                filter: localization.Filter,
                                sortAscending: localization.SortAscending,
                                sortDescending: localization.SortDescending
                            }
                        },
                        filterable: {
                            extra: false,
                            messages: {
                                info: localization.Showitemswithvaluethat,
                                and: localization.And,
                                or: localization.Or,
                                filter: localization.Filter,
                                clear: localization.Clear
                            },
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
                        dataSource: boundArray,
                        columns: [
                            { title: that.getText("Reviewer", "Reviewer"), field: "User.Name" },
                            { title: that.getText("HasVeto", "Has Veto"), field: "Veto" },
                            { title: that.getText("MustVote", "Must Vote"), field: "MustVote" },
                            { title: that.getText("VotedBy", "Voted By"), field: "VotedBy.Name" },
                            { title: that.getText("Decision", "Decision"), field: "Decision.Name" },
                            {
                                title: that.getText("DecisionDate", "Decision Date"), field: "DecisionDate", type: "date",
                                template: "#= (DecisionDate) ? kendo.toString(new Date(DecisionDate), 'g'):'' #"
                            },
                            { title: that.getText("Comment", "Comment"), field: "Comments", template: "<div>#= _.isNull(Comments) ? '' : Comments #</div>" }
                        ]
                    }).data("kendoGrid");
                    gridEle.on("click", "tbody>tr", function () {
                        resetBox();
                        refresh();
                    });
                    var userExists = function (userId) {
                        var exists = false;
                        $.each(grid.items(), function (ii, iitem) {
                            if (grid.dataItem(iitem).User.Id == userId) {
                                exists = true;
                            }
                        });
                        return exists;
                    }
                    var getSelectedGridItem = function () {
                        return grid.dataItem(grid.select())
                    }


                    // userPicker
                    app.controls.filters.add("reviewerControl", function () {
                        return {
                            userFilter: null,
                            currentUserId: null
                        };
                    });
                    picker = that.userPickerOld(pickerEle, {
                        boundObj: selectedUser,
                        name: "User",
                        itemType: "User",
                        filter: "reviewerControl"
                    });
                    var pickerGetVal = function () {
                        return picker.combo.dataItem();
                    }
                    var pickerDisable = function (bool) {
                        picker.combo.enable(!bool);
                        var btn = picker.ele.closest('[data-control="reviewerGrid"]').find('[data-control-action="userPickerWindow"]');
                        (bool) ? btn.hide() : btn.show();
                    }
                    picker.combo.bind("cascade", function (e) {
                        setTimeout(function () {
                            if (!editFlag && pickerGetVal()) {
                                grid.clearSelection();
                            }
                            refresh();
                        }, 100);
                    });

                    var resetBox = function () {
                        editFlag = false;
                        picker.combo.value(null);
                        checkboxBinds.set("Veto", null);
                        checkboxBinds.set("MustVote", null);
                    }
                   
                    var selectedReviewers = [];
                    var wrapper = $('.activity-list-container');
                    var container = $('.mobile-reviewer-controls');
                    var detail = $('.review-default-detail');
                  
                    wrapper.parent().siblings('div').each(function () { $(this).addClass('hide'); });
                    var vmReview = {
                        listView: function () {
                            if (app.isMobile()) {
                                var source = {
                                    dataSource: new kendo.data.DataSource({
                                        data: boundArray.length === 1 ? _.isNull(boundArray[0].User.Id) ? [] : boundArray : boundArray,
                                    }),
                                    change: function (e) {
                                        var data = this.dataSource.view();
                                        var selectedCard = $.map(this.select(), function (item) { return data[$(item).index()]; })[0];
                                        var userId = _.isUndefined(selectedCard.User.Id) ? selectedCard.User.BaseId : selectedCard.User.Id;
                                        var eventEle = $(event.target);
                                        var cardEle = eventEle.closest('.gridcard');

                                        eventEle.toggleClass('selected');
                                        cardEle.removeClass('k-state-selected');
                                     
                                        if (eventEle.hasClass('selected')) {
                                            cardEle.addClass('gridcard--selected');
                                            selectedReviewers.push(selectedCard);
                                        } else {
                                            cardEle.removeClass('gridcard--selected');
                                            var updatedSelection = _.reject(selectedReviewers, function (reviewer) {
                                                var checkId = _.isUndefined(reviewer.User.Id) ? reviewer.User.BaseId : reviewer.User.Id;
                                                return checkId === userId;
                                            });
                                            selectedReviewers = updatedSelection;
                                        }
                                      
                                        if (selectedReviewers.length > 0) {
                                            detail.addClass('hide');
                                            container.addClass('show');
                                        } else {
                                            detail.removeClass('hide');
                                            container.removeClass('show');
                                        }
                                    },
                                    selectable: true,
                                    template: kendo.data.binders.templateResources.resourceManager.getTemplateResource("mobileGridTemplate")
                                };
                                return $(mobileGridEle).kendoListView(source);
                            }
                        },
                        dropdown: function () {
                            var sub = $('.mobile-reviewer-controls > ul');
                            var main = $('.activity-item-form');
                            var arrow = $('.review-dropdown');

                            sub.children('li').each(function () {
                                var li = $(this)
                                $(this).on('click', function () {
                                    sub.addClass('hide');
                                    sub.removeClass('show');

                                    if (!$(this).find('a').hasClass('hideIfCannotEditReviewerReviewActivity')) {
                                        detail.removeClass('hide');
                                        container.removeClass('show');
                                    }
                                });
                            });

                            arrow.on('click', function () {
                                sub.toggleClass('show');
                            });

                            $(document).on('click', function (e) {
                                if (!container.is(e.target)
                                    && container.has(e.target).length === 0) {
                                    sub.addClass('hide');
                                    sub.removeClass('show');
                                }
                            });
                        },
                        isDuplicate: function () {
                            var user = pickerGetVal();
                            var isDup = false;
                            _.each(boundArray, function (item) {
                                var id = _.isUndefined(item.User.Id) ? item.User.BaseId : item.User.Id;
                                if (id === user.Id) {
                                    isDup = true;
                                    return;
                                }
                            });
                            return isDup;
                        }
                    };
                    
                    vmReview.listView();
                    vmReview.dropdown();
                    // bind events
                    var actions = {
                        add: function () {
                            if (app.isMobile() && vmReview.isDuplicate()) {
                                resetBox();
                            }
                            if (uiBools.userIsPicked()) {
                                // get clone of model
                                var mdl = {}; $.extend(true, mdl, model);
                                // get user data from picker
                                var user = pickerGetVal();
                                mdl.User = user;
                                // get checkbox values
                                mdl.Veto = (checkboxBinds.Veto) ? checkboxBinds.Veto : false;
                                mdl.MustVote = (checkboxBinds.MustVote) ? checkboxBinds.MustVote : false;
                                mdl.Decision = app.lib.getArrayItemById(enums, defaultDecisionId);
                                mdl.Decision.Name = mdl.Decision.Text;
                                // push to current
                                boundArray.push(mdl);
                                // clear values
                                resetBox();
                                refresh();
                            }
                        },
                        edit: function () {
                            if (app.isMobile()) {
                                _.each(selectedReviewers, function (item) {
                                    picker.combo.value(item.User.Name);
                                    checkboxBinds.set("Veto", item.Veto);
                                    checkboxBinds.set("MustVote", item.MustVote);
                                    editFlag = item;
                                });
                             
                            } else {
                                // get selected row value and load it into selectedUser
                                var item = getSelectedGridItem();
                                picker.combo.value(item.User.Name);
                                checkboxBinds.set("Veto", item.Veto);
                                checkboxBinds.set("MustVote", item.MustVote);
                                editFlag = item;
                            }
                           
                            refresh();
                        },
                        remove: function () {
                            if (app.isMobile()) {
                                var listview = vmReview.listView().data('kendoListView');
                                $.each(selectedReviewers, function (ix, itemx) {
                                    listview.dataSource.remove(itemx);
                                });
                                selectedReviewers = [];
                                //to refresh the listview.
                                vmReview.listView();
                            } else {
                                grid.removeRow(grid.select());
                            }

                            resetBox();
                            refresh();
                        },
                        save: function () {
                            editFlag.set("Veto", checkboxBinds.Veto);
                            editFlag.set("MustVote", checkboxBinds.MustVote);
                            if (app.isMobile()) {
                                selectedReviewers = [];
                                detail.removeClass('hide');
                                container.removeClass('show');
                            }
                            
                            resetBox(); refresh();
                        },
                        cancel: function () {
                            resetBox(); refresh();
                        },
                        approve: function (itemx) {
                            var dec = app.lib.getArrayItemById(enums, decisions["approve"]);
                            var userComment = null;
                            var reviewerList = (itemx && itemx.length > 0) ? itemx : [getSelectedGridItem()];

                            
                            if (app.isMobile()) {
                                reviewerList = (itemx && itemx.length > 0) ? itemx : selectedReviewers;
                            }
                            
                            //lets see if user has any comments
                            $.when(app.controls.ReviewDecisionCommentDialog.show({
                                title: localization.Comments,
                                message: localization.DoYouHaveComments,
                                required: true
                            })
                            ).done(function (response) {
                                if (response.button === "yes") {
                                    userComment = response.input;
                                }
                              
                                $.each(reviewerList, function (i, item) {
                                    item.Decision.set("Name", dec.Text);
                                    item.Decision.set("Id", dec.Id);
                                    item.set("DecisionDate", new Date().toISOString());
                                    item.set('Comments', _.isNull(item.get('Comments')) ? userComment : item.get('Comments') + '<br/>' + userComment);
                                    item.VotedBy = session.user;
                                    item.VotedBy.BaseId = session.user.Id; //must specify BaseId for updating
                                });

                                /**Had to force refresh grid's datasouce for votedby value on approve to reflect. 
                                   For some reason, set (on votedby) doesn't always work.**/
                                grid.refresh();
                                // set to empty after updating the model.
                                selectedReviewers = [];

                                if (!itemx) {
                                    refresh();
                                }
                              
                            });
                            //add this class to scope only for review activity popup.
                            $('.k-window.k-widget').addClass('acivity-popup-window');
                        },
                        reject: function (itemx) {
                            var dec = app.lib.getArrayItemById(enums, decisions["reject"]);
                            var userComment = null;
                            var reviewerList = (itemx && itemx.length > 0) ? itemx : [getSelectedGridItem()];

                            if (app.isMobile()) {
                                reviewerList = (itemx && itemx.length > 0) ? itemx : selectedReviewers;
                            }

                            //lets see if user has any comments
                            $.when(app.controls.ReviewDecisionCommentDialog.show({
                                title: localization.Comments,
                                message: localization.DoYouHaveComments,
                                required: true
                            })
                            ).done(function (response) {
                                if (response.button === "yes") {
                                    userComment = response.input;
                                }

                                $.each(reviewerList, function (i, item) {
                                    item.Decision.set("Name", dec.Text);
                                    item.Decision.set("Id", dec.Id);
                                    //item.set("DecisionDate", new Date().toISOString().split(".")[0]);
                                    item.set("DecisionDate", new Date().toISOString());
                                    item.set('Comments', userComment);
                                    item.VotedBy = session.user;
                                    item.VotedBy.BaseId = session.user.Id; //must specify BaseId for updating
                                });

                                /**Had to force refresh grid's datasouce for votedby value on approve to reflect. 
                                   For some reason, set (on votedby) doesn't always work.**/
                                grid.refresh();
                                // set to empty after updating the model.
                                selectedReviewers = [];

                                if (!itemx) {
                                    refresh();
                                }
                            });
                            //add this class to scope only for review activity popup.
                            $('.k-window.k-widget').addClass('acivity-popup-window');
                        },
                        approveAll: function () {
                            actions.approve(boundArray);
                            refresh();
                        },
                        rejectAll: function () {
                            actions.reject(boundArray);
                            refresh;
                        }
                    }
                    var uiBools = {
                        userIsPicked: function () {
                            return (editFlag || (pickerGetVal() && !userExists(pickerGetVal().Id)));
                        },
                        userInEdit: function () {
                            return editFlag;
                        },
                        userIsSelected: function () {
                            return grid.select().length;
                        },
                        gridNotEmpty: function () {
                            return boundObj[name].length;
                        },
                        securityCheck_addOrEdit: function () {
                            if (session && session.user && session.user.Security) {
                                return (session.user.Security.CanAddReviewerReviewActivity || session.user.Security.CanEditReviewerReviewActivity);
                            }
                        },
                        unanimousDecision: function() {
                            return boundObj.ApprovalCondition.Id == "c9822c46-f186-ca46-e00a-fca5b9a6819b";
                        }
                    }
                    template.find('[data-click]').each(function () {
                        if (actions[$(this).attr('data-click')]) {
                            $(this).click(actions[$(this).attr('data-click')]);
                        }
                    });
                    var shows = template.find("[data-show='userIsPicked']");
                    var pickedDisables = template.find("[data-enabled='userIsPicked']");
                    var selectDisables = template.find("[data-enabled='userIsSelected']");
                    var editHides = template.find("[data-hide='userInEdit']");
                    var securityShow_addOrEdits = template.find("[data-show='securityCheck_addOrEdit']");
                    var editShows = template.find("[data-show='userInEdit']");
                    var statusInProgress = boundObj.Status.Id === "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
                    var approveRejectAll = template.find("[data-enabled='gridNotEmpty']");
                    var rejectButton = $(selectDisables).get(0);
                    var approveButton = $(selectDisables).get(1);

                    var enableApprovalPercentageControl = function () {
                        //disable approval threshold when decison is unanimous
                        (uiBools.unanimousDecision()) ? approvalPercentageControl.enable(false) : approvalPercentageControl.enable(true);
                    }

                    var refresh = function () {
                        (uiBools.userIsPicked() && shows) ? $(shows).show() : $(shows).hide();
                        (uiBools.userIsPicked() && pickedDisables) ? $(pickedDisables).prop('disabled', false) : $(pickedDisables).prop('disabled', true);
                        (uiBools.userIsSelected() && selectDisables) ? $(selectDisables).prop('disabled', false) : $(selectDisables).prop('disabled', true);
                        (uiBools.userInEdit() && editShows) ? $(editShows).show() : $(editShows).hide();
                        (uiBools.userInEdit() && editHides) ? $(editHides).hide() : $(editHides).show();
                        (uiBools.securityCheck_addOrEdit() && securityShow_addOrEdits) ? $(securityShow_addOrEdits).show() : $(securityShow_addOrEdits).hide();
                        pickerDisable(uiBools.userInEdit());

                        //enable approve and reject buttons on in progress status only
                        (statusInProgress) ? $(approveRejectAll).prop('disabled', false) : $(approveRejectAll).prop('disabled', true);
                        (uiBools.userIsSelected() && rejectButton && statusInProgress) ? $(rejectButton).prop('disabled', false) : $(rejectButton).prop('disabled', true);
                        (uiBools.userIsSelected() && approveButton && statusInProgress) ? $(approveButton).prop('disabled', false) : $(approveButton).prop('disabled', true);

                        enableApprovalPercentageControl();
                    }
                    refresh();

                    boundObj.ApprovalCondition.bind("change", function () { enableApprovalPercentageControl(); });
                    
                    if (pageForm.viewModel.isDisabled || pageForm.viewModel.CiresonAnalyticsArchive) {
                        pickerDisable(true);
                    }

                }
                that.getTemplate("reviewer-grid.html", callback, { apply: false });
            }

            onReady(drawControl);

            

        })();

        // check for missing properties, User and Decision
        $.each(boundObj[name], function (i, item) {
            if (!item.User) {
                item.User = { Id: null, Name: null }
                app.lib.log("Reviewer.User was added to viewModel dynamically from controls");
            }
            if (!item.Decision) {
                item.Decision = { Id: null, Name: null }
                app.lib.log("Reviewer.Decision was added to viewModel dynamically from controls");
            }
            if (!item.VotedBy) {
                item.VotedBy = { Id: null, Name: null }
                app.lib.log("Reviewer.VotedBy was added to viewModel dynamically from controls");
            }
        });

        var targetId = app.lib.newGUID();
        targetEle.attr('data-control-guid', targetId);
        that.items.reviewerGrid[targetId] = reviewerControl;
    }

    // FILE ATTACHMENT GRID
    // controls uploading and displaying of attached files to a work item
    // via the viewModel
    this.fileAttachmentGrid = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.fileAttachmentGrid"); }

        var actionLogName = false;
        var name = "FileAttachment";

        // targetId setup
        if (settings.targetValId) {
            if (!settings.url) { app.controls.exception("url missing - controls.fileAttachmentGrid"); }
            var uploadUrl = settings.url;
            var targetId = settings.targetValId;
            var targetValueEle = $('#' + targetId);
            var targetValueEleJSON = $('#Json' + targetId);
            var boundObj = new kendo.data.ObservableObject();
        }
        else {
            // mvvm setup
            if (!settings.boundObj) { app.controls.exception("boundObj missing - controls.fileAttachmentGrid"); }
            if (!settings.name) { app.controls.exception("name missing - controls.fileAttachmentGrid"); }

            var boundObj = settings.boundObj;
            var uploadUrl = "/FileAttachment/UploadFile/" + boundObj.BaseId + "?className=" + boundObj.ClassName + "&saveFile=false";
            actionLogName = app.controls.getWorkItemLogType(boundObj);
        }

        that.forceProp(boundObj, name, []);

        /**********************/
        /** FILE ATTACH GRID **/
        /**********************/
        
        var grid;
        var downloadUrl = app.config.rootURL + "FileAttachment/ViewFile/";
        var uploadUrl = uploadUrl;
        var templateName = "file-attachment-grid.html";
        var postUploadName = "files"; // post name for upload file
        var fileInputId = app.lib.newGUID();
        var overlay = app.controls.overlay(targetEle, { text: that.getText("Loading", "Loading...") });
        var uploadGridDisabled = false;

        /** INIT **/

        var init = function () {
            if (targetEle.attr('disabled')) {
                uploadGridDisabled = true;
                $('.fileAttachmentGrid input').each(function () {
                    $(this).attr("disabled", "disabled");
                    $(this).addClass("k-state-disabled");
                });

                $('.fileAttachmentGrid .k-icon.k-i-arrow-s, .fileAttachmentGrid .k-icon.k-i-arrow-n, .fileAttachmentGrid .k-select, .fileAttachmentGrid .searchIcon, .fileAttachmentGrid .search, .fileAttachmentGrid .k-button, .fileAttachmentGrid button').each(function () {
                    $(this).remove();
                });
            }

            that.getTemplate(templateName, createGridView, { apply: false });
        }


        // targetId methods (loops through v)
        var setTargetInputValue = function () {
            var value = [];
            var tempAttachments = [];
            $.each(boundObj[name], function (i, item) {
                value.push(item.BaseId + "(((:)))" + item.DisplayName);
                tempAttachments.unshift(item);
            });
            targetValueEle.val(value.join("(((;)))"));
            targetValueEleJSON.val(JSON.stringify(tempAttachments));
            
        }

        // create grid
        var createGridView = function (template) {

            var template = $(template);
            var gridEle = template.find("[data-kendo-control='grid']");
            var addBtn = template.find("[data-name='addBtn']");
            var selectedItem = null;

            targetEle.append(template);
            that.localize(template, localization);
            
            //loop through attachments and assign null values to missing addedby field
            $.each(boundObj[name], function (i, item) {
                if (_.isUndefined(item.AddedBy)) {
                    item.AddedBy = { Id: null, DisplayName: null }
                }
            });

            if (app.isMobileDevice()) {
                //on mobile, grid = a list view
                var listViewEle = template.find("[data-role='listview']");
                grid = $(listViewEle).kendoListView({
                    dataSource: boundObj[name],
                    sortable: true,
                    template: kendo.template($("#file-attachment-mobile-template").html()),
                    selectable: true,
                    change: function(e) {
                        var index = e.sender.select().index();
                        selectedItem = e.sender.dataSource.view()[index];
                        refresh();
                    }
                }).data("kendoListView");
            } else {
                grid = gridEle.kendoGrid({
                    sortable: true,
                    resizable: true,
                    pageable: false,
                    selectable: true,
                    reorderable: true,
                    filterable: {
                        extra: false,
                        messages: {
                            info: localization.Showitemswithvaluethat,
                            and: localization.And,
                            or: localization.Or,
                            filter: localization.Filter,
                            clear: localization.Clear
                        },
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
                    columnMenu: {
                        messages: {
                            columns: localization.ChooseColumns,
                            filter: localization.Filter,
                            sortAscending: localization.SortAscending,
                            sortDescending: localization.SortDescending
                        }
                    },
                    dataSource: boundObj[name],
                    columns: [
                        { title: localizationHelper.localize("Filename", "File Name"), field: "DisplayName" },
                        { title: localizationHelper.localize("Type", "Type"), field: "Extension" },
                        {
                            title: localizationHelper.localize("Attacheddate", "Attached Date"), field: "AddedDate",
                            type: "date",
                            template: "#= (AddedDate) ? kendo.toString(new Date(AddedDate), 'g'):'' #"
                        },
                        { title: localizationHelper.localize("Attachedby", "Attached By"), field: "AddedBy.DisplayName" }
                    ]
                }).data("kendoGrid");

                gridEle.on("click", "tbody>tr", function () {
                    refresh();
                });

                if (!app.isMobile()) {

                    grid.dataSource.originalFilter = grid.dataSource.filter;

                    // Replace the original filter function.
                    grid.dataSource.filter = function () {

                        // Call the original filter function.
                        var result = grid.dataSource.originalFilter.apply(this, arguments);

                        // If a column is about to be filtered, then raise a new "filtering" event.
                        if (arguments.length > 0) {
                            this.trigger("filterApplied", arguments);
                        }

                        return result;
                    }

                    gridEle.data("kendoGrid").dataSource.bind("filterApplied", function () {

                        $.each($(".fileAttachmentGrid  table th a.k-header-column-menu i"), function () {
                            $(this).remove();
                        });

                        if (grid.dataSource.filter()) {

                            var filters = grid.dataSource.filter().filters;

                            for (var i in filters) {
                                $(".fileAttachmentGrid  table th[data-field=" + filters[i].field + "] a.k-header-column-menu").append("<i class=\"fa fa-filter\"></i>");
                            }

                        }
                    });
                }

            }
            
            var actions = {
                open: function () {
                    var item = actions.getSelectedItem();
                    if (uiBools.rowIsSelected() && item) {
                        //on dirty, open attachment in new tab instead of page reload so as not to trigger onBeforeUnLoad 
                        if (pageForm.viewModel.get("isDirty")) {
                            window.open(downloadUrl + item.BaseId);
                        } else {
                            location.href = downloadUrl + item.BaseId;
                        }
                    }
                },
                add: function () {
                    if (!uploadGridDisabled) {
                        uploader.addClick();
                    }
                },
                remove: function () {
                    var item = actions.getSelectedItem();
                    var fileName = !_.isNull(item) ? item.DisplayName : "";

                    app.isMobileDevice() ? grid.dataSource.remove(item) : grid.removeRow(grid.select());
                    refresh();
                    if (uiBools.usesTargetId()) {
                        setTargetInputValue();
                    }
                    events.fileRemoved(fileName);
                },
                hideMessage: function () {
                    if (errorMessageContainer) { errorMessageContainer.hide(); }
                },
                getSelectedItem: function() {
                    if (app.isMobileDevice()) {
                        return selectedItem;
                    } else {
                        return (grid.select().length) ? grid.dataItem(grid.select()) : null;
                    }
                }
            }
            var uiBools = {
                rowIsSelected: function () {
                    var item = actions.getSelectedItem();
                    return !_.isNull(item);
                },
                rowIsSelectedAndHasBaseId: function () {
                    var item = actions.getSelectedItem();
                    return (!_.isNull(item) && item.BaseId);
                },

                rowIsSelectedAndHasTimeAdded: function () {
                    var item = actions.getSelectedItem();
                    return (!_.isNull(item) && item.TimeAdded);
                },
                // set flag if uses target id type of values (used for request offering)
                usesTargetId: function () {
                    return typeof (targetValueEle) != "undefined";
                }

            }
            var events = {
                fileAdded: function (data) {
                    refresh();
                    var duplicate = false;

                    if (data.success != undefined && data.success === false) {
                        errorMessage.html(data.message);
                        errorMessageContainer.show();
                        return false;
                    }

                    $.each(boundObj[name], function (i, item) {
                        if (item.DisplayName == data.FileAttachment.DisplayName) duplicate = true;
                    });

                    if (data.FileAttachment && !duplicate) {
                        boundObj[name].push(data.FileAttachment);
                        if (uiBools.usesTargetId()) {
                            setTargetInputValue();
                        }
                        if (actionLogName) { // add  action log entry for adding file
                            boundObj[actionLogName].unshift(new app.dataModels[actionLogName].fileAdded(data.FileAttachment.DisplayName));
                        }
                    } else {
                        if (data.message) {
                            errorMessage.html(data.message);
                            errorMessageContainer.show();
                        }
                    }
                },
                fileRemoved: function (fileName) {
                    if (actionLogName) {// add  action log entry for removing file
                        boundObj[actionLogName].unshift(new app.dataModels[actionLogName].fileRemoved(fileName));
                    }
                }
            }
            template.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });
            var selectDisables = template.find("[data-enabled='rowIsSelected']");
            var selectDisablesCustom = template.find("[data-enabled='rowIsSelectedAndHasBaseId']");
            var hideIfTargetIds = template.find("[data-hide='usesTargetId']");
            var errorMessageContainer = template.find('[data-custom="errorMessageCont"]');
            var errorMessage = template.find('[data-custom="errorMessage"]');
            var refresh = function () {
                (uiBools.rowIsSelected() && selectDisables) ? $(selectDisables).prop('disabled', false) : $(selectDisables).prop('disabled', true);
                (uiBools.rowIsSelectedAndHasTimeAdded() && selectDisablesCustom) ? $(selectDisablesCustom).prop('disabled', false) : $(selectDisablesCustom).prop('disabled', true);
                if (uiBools.usesTargetId() && hideIfTargetIds) { $(hideIfTargetIds).hide(); }
                if (errorMessageContainer) { errorMessageContainer.hide(); }
            }

            addBtn.attr("for", fileInputId);
            if (uploadGridDisabled) {
                addBtn.addClass("k-state-disabled");
            }

            var uploader = new IFrameUploader(template.find('[data-custom="fileUploaderInputContainer"]'), events.fileAdded, fileInputId);


            refresh();
        }

        var IFrameUploader = function (inputContainer, callback, fileInputId) {
            var callback = callback;
            var inputName = postUploadName;
            var frameName = new Date().getTime() + "_" + new Date().getDate() + "_frame";
            var frame;
            var form;
            var input;

            // init
            var init = function () {

                frame.appendTo('body');
                form.appendTo('body');


                setTimeout(function () {

                    frame.bind('load', function () {
                        var json = { message: "Parsing JSON Failed" };
                        try {
                            var result = $($(this).contents()[0]).find('#uploadResponse').text().trim().replace(/(\r\n|\n|\r)/gm, "");
                            result = result.replace(/\\/g, "");
                            json = JSON.parse(result);
                        } catch (ex) {

                        }
                        overlay.hide();
                        callback(json);
                    });
                }, 1000);

            }

            // actions
            this.addClick = function () {
                createFileInput();
            }


            // iframe
            frame = $('<iframe>', { name: frameName, src: "about:blank", style: 'display: none' });

            
            // form
            form = $('<form>', { style: 'display: none', method: "POST", 'accept-charset': "UTF-8", target: frameName, enctype: "multipart/form-data" });

            // input
            var createFileInput = function () {
                form.attr("action", app.lib.addUrlParam(uploadUrl, "count", grid.dataSource._data.length));
                form.find("input").remove();
                input = $('<input>', { type: "file", 'class': 'file-input', name: inputName, id: fileInputId });
                
                form.append(input);
                input.change(function (e) {
                    var duplicate = false;
                    //make sure this is not a duplicate of an already uploaded file
                    $.each(boundObj[name], function (i, item) {
                        if (e.target.files && item.DisplayName === e.target.files[0].name) {
                            //IE 9 will NOT get here but IE 9 doesn't fail on duplicate files, #STANGE
                            duplicate = true;
                        }
                    });

                    if (e.target.files) {
                        //search through other file attachment controls on the form and see if the file is uploaded in there
                        if (app.isMobile()) {
                            $('.file-attachments').find("[data-kendo-control='mobile-listview']").each(function () {
                                var attachmentGrid = $(this).data("kendoListView");
                                var attachmentGridData = attachmentGrid._data;
                                var result = _.findWhere(attachmentGridData, { DisplayName: e.target.files[0].name });

                                duplicate = !_.isUndefined(result);

                                if (duplicate) {
                                    return false;
                                }
                            });
                        } else {
                            $('.file-attachments').find("[data-kendo-control='grid']").each(function() {
                                var attachmentGrid = $(this).data("kendoGrid");
                                var attachmentGridData = attachmentGrid._data;
                                var result = _.findWhere(attachmentGridData, { DisplayName: e.target.files[0].name });

                                duplicate = !_.isUndefined(result);

                                if (duplicate) {
                                    return false;
                                }
                            });
                        }
                    }

                    if (!duplicate) {
                        overlay.show();
                        form.submit();
                    } else {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Warning,
                            message: localization.AttachedFileDuplicateFileName
                        });
                    }
                });

            }

            // end
            init();

        }

        /** End **/

        init();

    }

    this.extensionFields = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.extensionFields"); }
        if (!settings.extensionFields) { app.controls.exception("itemType missing - controls.extensionFields"); }

        /** VARS **/

        var extensionFields = settings.extensionFields;
        var enumUrl = app.lib.addUrlParam("/api/V3/Enum/GetList", "parentId", "");

        /** INIT **/

        var init = function () {

            // create rows / columns

            var col = 1; // starting number
            var nCols = 3; // number of columns per row
            var colClass = "c3"; // css class for col div
            var padLeftClass = "padleft10";
            var checkboxPad = "padding-top: 18px" // TODO: James - make this better
            var row;
            $.each(extensionFields, function (i, item) {
                if (item.Visible != undefined && item.Visible === false) {
                    return;
                }
                if (!controlTypeMatch[item.DataType]) {
                    app.lib.log("Extension Fields DataType '" + item.DataType + " has not template");
                } else {
                    if (col == 1) {
                        row = $("<div>", { "class": "col-group" });
                    }
                    var colEle = colTemplate(item.PropertyDisplayName, controlTypeMatch[item.DataType](item), colClass);
                    if (col != 1) {
                        colEle.find(">div").addClass(padLeftClass);
                    }
                    // fix the layout of checkbox-temp and ugly
                    if (item.DataType == "Boolean") {
                        colEle.find(">div").attr('style', checkboxPad);
                    }
                    row.append(colEle);
                    if (col == nCols) {
                        targetEle.append(row);
                        col = 0;
                    }
                    col++;
                }
            });
            if (targetEle.find("*").length) {
                targetEle.parent().show();
            } else {
                targetEle.parent().hide();
            }
            that.apply(targetEle, settings);
        }

        /** METHODS **/

        var getOptions = function (extensionItem) {
            var opt = {};
            if (extensionItem.MaxLength != null) {
                opt['maxlength'] = extensionItem.MaxLength;
            }
            if (extensionItem.MinValue != null) {
                opt['data-control-min'] = extensionItem.MinValue;
            }
            if (extensionItem.MaxValue != null) {
                opt['data-control-max'] = extensionItem.MaxValue;
            }
            if (extensionItem.required === true) {
                opt['required'] = "true";
            }
            return opt;
        }
        var controlTypeMatch = {
            "Int32": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-control'] = "numericTextBox";
                opts['data-bind'] = "value: " + extensionItem.PropertyName;
                opts['data-control-decimals'] = 0;
                // opts['class'] = "k-textbox";
                return $('<input>', opts);
            },
            "Decimal": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-control'] = "numericTextBox";
                opts['data-bind'] = "value: " + extensionItem.PropertyName;
                // opts['class'] = "k-textbox";
                // opts['data-control-decimals'] = 2;
                return $('<input>', opts);
            },
            "Double": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-control'] = "numericTextBox";
                opts['data-bind'] = "value: " + extensionItem.PropertyName;
                // opts['class'] = "k-textbox";
                // opts['data-control-decimals'] = 2;
                return $('<input>', opts);
            },

            "DateTime": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-control'] = "dateTimePicker";
                opts['data-control-bind'] = extensionItem.PropertyName;
                return $('<input>', opts);
            },
            "String": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-bind'] = "value: " + extensionItem.PropertyName;
                opts['class'] = "k-textbox k-input";
                return $('<input>', opts);
            },
            "Guid": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-bind'] = "value: " + extensionItem.PropertyName;
                opts['class'] = "k-textbox k-input";
                return $('<input>', opts);
            },
            "Boolean": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['type'] = "checkbox";
                opts['data-bind'] = "checked: " + extensionItem.PropertyName;
                return $('<input>', opts);
            },
            "Enum": function (extensionItem) {
                var opts = getOptions(extensionItem);
                opts['data-control'] = "dropDownTree";
                opts['data-control-bind'] = extensionItem.PropertyName;
                opts['data-control-url'] = enumUrl + extensionItem.EnumId;
                return $('<div>', opts);
            },
        }
        // Column Template
        var colTemplate = function (labelText, fieldJqEle, colClass) {
            // TODO: move to external template
            var colClass = colClass;

            var col = $("<div>", { "class": colClass });
            var pad = $("<div>", {});
            col.append(pad);

            var isCheckboxSpecialForASpecialGuyTravis = (fieldJqEle.attr("type") == "checkbox");

            if (!isCheckboxSpecialForASpecialGuyTravis) {
                var labelCont = $("<div>", { "class": "editor-label" });
                pad.append(labelCont);
            }

            var label = $("<label>", { html: labelText });
            var fieldCont = $("<div>", { "class": "editor-field" });
            pad.append(fieldCont);

            if (isCheckboxSpecialForASpecialGuyTravis) {
                fieldCont.append(label);
                fieldJqEle.css("margin-right", "5px");  // TODO: James figure a cleaner way of doing this.. my baddd
                label.prepend(fieldJqEle);
            } else {
                labelCont.append(label);
                fieldCont.append(fieldJqEle);
            }

            return col;
        }

        /** END **/

        init();

    }

    this.checkBox = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.checkBox"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.checkBox"); }
        if (!name) { app.controls.exception("name missing - controls.checkBox"); }

        that.forceProp(boundObj, name, []);

        var checkBox = $('<input>', { type: 'checkbox', 'data-bind': "checked:" + name })
        targetEle.append(checkBox);
        kendo.bind(targetEle, boundObj);

        return checkBox;
    }

    this.textBox = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.textBox"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.textBox"); }
        if (!name) { app.controls.exception("name missing - controls.textBox"); }

        that.forceProp(boundObj, name, []);

        var textBox = $('<input>', { 'data-bind': "value:" + name });
        targetEle.append(textBox);
        kendo.bind(targetEle, boundObj);

        return textBox;
    }

    //Recursive func to add workitem status and class to activity view model so we can access them later on
    var addExtraVmProperties = function (boundObj, name, workItemStatus, workItemClassName) {
        $.each(boundObj[name], function (index) {
            boundObj[name][index].ParentWorkItemStatus = workItemStatus;
            boundObj[name][index].ParentWorkItemClass = workItemClassName;
            boundObj[name][index].HeaderCss = "text-warning";
            if (boundObj[name][index].Activity) {
                addExtraVmProperties(boundObj[name][index], name, workItemStatus, workItemClassName);
            }
        });
    }

    // has template dependencies and control dependencies
    this.activityDisplay = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.activityDisplay"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.activityDisplay"); }
        if (!name) { app.controls.exception("name missing - controls.activityDisplay"); }
        
        that.forceProp(boundObj, name, []);
        
        addExtraVmProperties(boundObj, name, boundObj.Status, boundObj.ClassName);

        var init = function () {
            var canAddActivity = (session.user.Analyst) &&
                (session.user.Security.CanAddManualActivity || session.user.Security.CanAddReviewActivity || session.user.Security.CanAddParallelActivity);


            if (boundObj[name].length <= 0 && canAddActivity) {
                targetEle.append("<div id='activityDiagram'><div class='activityWrapper'><div class='lineClass'><span class='fa activityMenuDiagram' title='Add Activity'></span></div></div><span>" + localizationHelper.localize("AddNewActivity", "Add New Activity") + "</span></div>");
            } else {
                drawTemplates(targetEle, boundObj[name]);
            }

            const checkIsDirty = (array) => {
                return (array ??= []).reduce((accumulator, value) =>
                    accumulator ||= value[name]?.length > 0 ? checkIsDirty(value[name]) : (value.isDirty ??= false), false);
            }

            //on freemium, allow users to edit their own activity
            if (!session.consoleSetting.AnalystPortalLicense.IsValid) {
                var activityVM = boundObj[name][0];

                if (_.isUndefined(activityVM)) { return; }

                if (activityVM.ClassName.toLowerCase() == "system.workitem.activity.manualactivity") {
                    if (activityVM.AssignedWorkItem.BaseId == session.user.Id) {
                        targetEle.removeAttr('disabled');
                    }
                }

                if (activityVM.ClassName.toLowerCase() == "system.workitem.activity.reviewactivity") {
                    var review = _.find(activityVM.Reviewer, function (reviewItem) {
                        if (_.isUndefined(reviewItem.User)) {
                            return null;
                        }
                        var group = _.find(pageForm.userGroup, function (group) {
                            return reviewItem.User.BaseId == group.Id;
                        });

                        return !_.isUndefined(reviewItem.User) && (reviewItem.User.BaseId == session.user.Id || !_.isUndefined(group));
                    });

                    if (!_.isUndefined(review) && !_.isNull(review)) {
                        targetEle.removeAttr('disabled');
                    }
                }

            }

            if (targetEle.attr('disabled')) {
                $('.activity-list-container input, .activity-list-container textarea').each(function () {
                    $(this).attr("disabled", "disabled");
                    $(this).addClass("k-state-disabled");
                });

                $('.activity-list-container .k-icon.k-i-arrow-s, .activity-list-container .k-icon.k-i-arrow-n, .activity-list-container .k-select, .activity-list-container .searchIcon, .activity-list-container .search, .activity-list-container .k-button, .activity-list-container button').each(function () {
                    $(this).remove();
                });

                $(".activity-item-header-actions").each(function () {
                    $(this).remove();
                });

                //this needs to be verified
                $(".reviewer-controls").hide();
            }

            that.localize(targetEle, localization);
            if (typeof (pageForm) != "undefined" && pageForm && pageForm.onReady) {
                if (!checkIsDirty(boundObj[name])) {
                    pageForm.onReady();
                }
            }



            //expand activity when access from grid
            //selected tab for loading ex: http://localhost:13463/Incident/Edit/IR430/?selectedTab=activity&activityId=MA798
            targetEle.find("div[data-activity-id='" + app.getParameterByName("activityId") + "'] span[data-click='toggle']").click();
        }

        // methods
        var templates = {};
        var classNamePrefix = "System.WorkItem.Activity.";

        var onReady = function (callback) {
            var checkStatus = function (x) {
                var b = true;
                $.each(templates, function (i, item) {
                    if (!item.template) {
                        b = false;
                    }
                });
                if (x < 150) { // only only this process for a short time
                    (!b) ? setTimeout(function () { checkStatus(x + 1); }, 300) : callback();
                }
            }
            checkStatus(1);
        }
        var addTemplate = function (name, templateName, templateClass) {
            templates[name] = {
                'class': templateClass,
                template: false
            }
            that.getTemplate('activity/' + templateName, function (template) {
                templates[name].template = template;
            });
        }
        var getTemplateDataByClassName = function (className) {
            if (!className) { app.lib.exception("This object is missing ClassName property - " + className); }
            if (!templates[className.replace(classNamePrefix, '')]) {
                return templates["GenericActivity"];
            } else {
                return templates[className.replace(classNamePrefix, '')];
            }
        }
        var drawTemplates = function (containerEle, activityList) {
           

            $.each(activityList, function (i, item) {
                var templateData = new getTemplateDataByClassName(item.ClassName);
                var activity = new templateData['class'](item, templateData['template']);
                containerEle.append(activity);
            });

            that.getTemplate("activity-comment-window.html", function (template) { containerEle.append(template) }, { apply: false });
        }
        var scrollTo = function (ele) {
            setTimeout(function () {
                if (ele.parent().find('[data-for-action="toggle"]').is(":visible")) {
                    $('html, body').animate({
                        scrollTop: ele.offset().top - 75
                    }, 300);
                }
            }, 100);
        }
        var setShowSkipIconProperty = function (vm) {
            var isCompleted = vm.Status.Id === "9de908a1-d8f1-477e-c6a2-62697042b8d9";
            var isInProgress = vm.Status.Id === "11fc3cef-15e5-bca4-dee0-9c1155ec8d83";
            var isPending = vm.Status.Id === "50c667cf-84e5-97f8-f6f8-d8acd99f181c";
            var isCancelled = vm.Status.Id === "89465302-2a23-d2b6-6906-74f03d9b7b41";
            var isFailed = vm.Status.Id === app.constants.workItemStatuses.Activity.Failed;
            
            var workitemClosedStatus = [
                app.constants.workItemStatuses.Incident.Closed,
                app.constants.workItemStatuses.ServiceRequest.Closed,
                app.constants.workItemStatuses.ChangeRequest.Closed,
                app.constants.workItemStatuses.Problem.Closed,
                app.constants.workItemStatuses.Incident.Closed,
            ];
            var isWorkItemClosed = (_.indexOf(workitemClosedStatus, vm.ParentWorkItemStatus.Id) > -1);


            //use direct assignment on initial (first) page loading, vm.set bogs down initial loading if there too many activities attached the workitem
            if (_.isUndefined(vm.ShowSkipIcon)) {
                vm.ShowSkipIcon = session.user.Analyst && !isCompleted && !isCancelled && !vm.Skip && !isWorkItemClosed;
                vm.ShowUnskipIcon = session.user.Analyst && vm.Skip && !isWorkItemClosed;
                vm.ShowReturnIcon = session.user.Analyst && !isInProgress && !isPending && vm.Status.Id != null && !isWorkItemClosed;
                vm.HeaderCss = vm.Skip ? "text-warning" : (isFailed) ? "text-danger" : "";
                vm.IconTitle = vm.Skip ? localization.Unskip : localization.Skip;
                vm.IconReturnTitle = localization.ReturntoActivity;

            } else {
                vm.set("ShowSkipIcon", session.user.Analyst && !isCompleted && !isCancelled && !vm.Skip && !isWorkItemClosed);
                vm.set("ShowUnskipIcon", session.user.Analyst && vm.Skip && !isWorkItemClosed);
                vm.set("ShowReturnIcon", session.user.Analyst && !isInProgress && !isPending && vm.Status.Id != null && !isWorkItemClosed);
                vm.set("HeaderCss", vm.Skip ? "text-warning" : (isFailed) ? "text-danger" : "");
                vm.set("IconTitle", vm.Skip ? localization.Unskip : localization.Skip);
            }
        }

        var showComment = function (vm, statusEle) {
            var cont = $("#commentWindow");
            var isReturnActivity = !_.isUndefined(statusEle) ? true : false;

            win = cont.kendoCiresonWindow({
                title: localization.Comment,
                width: 500,
                height: 350,
                actions: ["Close"]
            }).data("kendoWindow");
            
            //this view Model is bound to the window element
            var _vmWindow = new kendo.observable({
                comment: "",
                commentMessage: isReturnActivity ? localization.ReturnActivityCommentMessage : (vm.Skip ? localization.UnSkipActivityCommentMessage : localization.SkipActivityCommentMessage),
                commentLabel: localization.Comment,
                okText: localization.OK,
                cancelText: localization.Cancel,
                okEnabled: false,
                charactersRemaining: "4000",
                charactersRemainingText: localization.CharactersRemaining,
                textCounter: function () {
                    var maximumLength = 4000;
                    var val = this.comment.length;

                    (val > maximumLength) ? this.comment.substring(0, maximumLength) : this.set("charactersRemaining", maximumLength - val);
                    (val > 0) ? this.set("okEnabled", true) : this.set("okEnabled", false);
                },
                okClick: function () {
                    //set skip property
                    if (!isReturnActivity)
                        vm.set("Skip", !vm.Skip);

                    //append notes
                    var notes = vm.get('Notes');
                    (!notes) ? vm.set('Notes', this.comment) : vm.set('Notes', notes + "\n" + this.comment);

                    //set status to rerun or in progress (for IR only) on return activity
                    if (isReturnActivity) {
                        if (vm.ParentWorkItemClass.toLowerCase() == "System.WorkItem.Incident".toLowerCase()) {
                            vm.Status.set("Id", "11fc3cef-15e5-bca4-dee0-9c1155ec8d83");
                            vm.Status.set("Name", localization.InProgress);
                        } else {
                            vm.Status.set("Id", "baa948b5-cc6a-57d7-4b56-d2012721b2e5");
                            vm.Status.set("Name", localization.Rerun);
                        }
                        

                        //when return to activity is called on a skipped activity reset skip to false
                        if (vm.Skip) {
                            vm.set("Skip", !vm.Skip);
                        }

                        statusEle.html(vm.Status.Name);
                    }

                    setShowSkipIconProperty(vm);
                    win.close();
                },
                cancelClick: function () {
                    win.close();
                }
            });

            kendo.bind(cont, _vmWindow);

            cont.removeClass('hide');
            cont.show();

            win.open();
        }

        var addAddActivityMenu = function (containerEle, activity) {
            //do not insert add button to child activities
            if (activity.IsChild) { return; }
            var menuElement = $(containerEle.find(".addActivityMenu")[0]);
            var headerElement = containerEle.find(".activity-item-header");
            var sequenceId = headerElement.attr("data-activity-sequence");

            var data = [{
                text: "<i class='fa fa-plus-circle cursor-pointer' title='" + localization.AddRootActivity + "'></i>",
                encoded: false,
                items: []
            }];

            if (session.user.Security.CanAddManualActivity) {
                data[0].items.push({
                    text: localization.ManualActivity,
                    attr: {
                        type: 'manualactivity',
                    }
                });
            }

            if (session.user.Security.CanAddReviewActivity) {
                data[0].items.push({
                    text: localization.ReviewActivity,
                    attr: {
                        type: 'reviewactivity',
                    }
                })
            }

            if (session.user.Security.CanAddParallelActivity) {
                data[0].items.push({
                    text: localization.ParallelActivity,
                    attr: {
                        type: 'parallelactivity',
                    }
                });
            }

            if ((boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem")) {
                if (session.user.Security.CanAddManualActivity) {
                    data = [{
                        text: "<i class='fa fa-plus-circle cursor-pointer' title='" + localization.AddRootActivity + "'></i>",
                        encoded: false,
                        items: [{
                            text: localization.ManualActivity,
                            attr: {
                                type: 'manualactivity',
                            }
                        }]
                    }];
                } else {
                    data = [];
                }
            }

            var addMenu = menuElement.kendoMenu({
                openOnClick: true,
                dataSource: data,
                select: function (e) {
                    if (!_.isUndefined(e.item.attributes["type"])) {
                        var type = e.item.attributes["type"].value;
                        switch (type) {
                            case "childreviewactivity":
                            case "reviewactivity":
                                templateNameKey = "DefaultReviewActivityTemplate";
                                break;
                            case "parallelactivity":
                                templateNameKey = "DefaultParallelActivityTemplate";
                                break;
                            case "childmanualactivity":
                            case "manualactivity":
                            default:
                                templateNameKey = "DefaultManualActivityTemplate";
                                break;
                        }
                        $.ajax({
                            url: "/api/V3/Settings/GetSetting",
                            type: "get",
                            data: { settingKey: templateNameKey },
                            async: true
                        }).done(function (data) {
                            if (!_.isUndefined(data)) {
                                var templateName = data.Value;
                                $.ajax({
                                    url: "/api/V3/Projection/CreateProjectionByTemplateName",
                                    type: "get",
                                    data: { templateName: templateName, createdById: session.user.Id },
                                    async: true
                                }).done(function (newActivity) {
                                    if (!_.isUndefined(newActivity)) {
                                        var sequenceId = headerElement.attr("data-activity-sequence");
                                        var index = parseInt(sequenceId) + 1;
                                        var updatedActivityList = boundObj.Activity;
                                        var jsonRawActivityList = updatedActivityList;

                                        newActivity.ParentWorkItemClass = boundObj.ClassName;
                                        newActivity.ParentWorkItemStatus = boundObj.Status;
                                        newActivity.SequenceId = index;
                                        newActivity.isDirty = true;

                                        if (boundObj.ClassName == "System.WorkItem.Incident" || boundObj.ClassName == "System.WorkItem.Problem") {
                                            newActivity.Status.Id = app.constants.workItemStatuses.Activity.InProgress;
                                            newActivity.Status.Name = localizationHelper.localize("InProgress", "In Progress");
                                        }
                                            

                                        updatedActivityList.splice(index, 0, newActivity);
                                        //re-order activity sequence
                                        _.each(updatedActivityList, function (item, i) {
                                            if (parseInt(item.SequenceId) >= index && item.Id != newActivity.Id) {
                                                item.set("SequenceId", parseInt(item.SequenceId) + 1);
                                                item.set("isDirty", true);
                                            }
                                        });
                                        //add action log entry 
                                        boundObj.AppliesToWorkItem.push({
                                            EnteredBy: session.user.Name,
                                            Title: localization.Analyst + " " + localization.Comment,
                                            IsPrivate: true,
                                            EnteredDate: new Date().toISOString(),
                                            LastModified: new Date().toISOString(),
                                            Description: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                            DescriptionDisplay: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                            Image: (true) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                            ActionType: "AnalystComment"
                                        });
                                        boundObj.set(name, updatedActivityList);
                                        //on edit, add to pageForm.original viewModel also.
                                        if (pageForm.newWI == false) {
                                            var jsonRawActivityList = pageForm.jsonRaw.Activity;
                                            var jsonRawActivity = newActivity;
                                            jsonRawActivity.SequenceId = -1;
                                            if (!_.isUndefined(jsonRawActivityList)) {
                                                jsonRawActivityList.splice(index, 0, jsonRawActivity);
                                            }

                                            if (!_.isUndefined(pageForm.jsonRaw.Activity)) {
                                                pageForm.jsonRaw.Activity = jsonRawActivityList;
                                            } else {
                                                pageForm.jsonRaw.Activity = [];
                                                pageForm.jsonRaw.Activity.push(newActivity);
                                            }
                                        }
                                        //redraw activity forms
                                        targetEle.html("");
                                        init();
                                        //open new activity
                                        targetEle.find("div[data-activity-id='" + newActivity.Id + "'] span[data-click='toggle']").click();
                                    }
                                });
                            }
                        });
                    }
                }
            }).data("kendoMenu");

            var workItemsWithActivityRestrictions = ["System.WorkItem.ServiceRequest", "System.WorkItem.ChangeRequest", "System.WorkItem.ReleaseRecord"];
            var hasActivityRestriction = _.contains(workItemsWithActivityRestrictions, boundObj.ClassName);
            if (hasActivityRestriction) {
                var inValidStatus = [
                    app.constants.workItemStatuses.Activity.Completed,
                    app.constants.workItemStatuses.Activity.Failed,
                    app.constants.workItemStatuses.Activity.Skipped
                ];
                var isInvalid = _.contains(inValidStatus, activity.Status.Id);
                if (isInvalid || activity.Skip) {
                    addMenu.enable(addMenu.element.children("li"), false);
                }
            }
            

            var inValidWorkItemStatus = [
                app.constants.workItemStatuses.ReleaseRecord.Closed,
                app.constants.workItemStatuses.ReleaseRecord.Cancelled,
                app.constants.workItemStatuses.ReleaseRecord.Completed,
                app.constants.workItemStatuses.ReleaseRecord.Failed,
                //app.constants.workItemStatuses.ReleaseRecord.OnHold,
                //app.constants.workItemStatuses.ReleaseRecord.InProgress,
                app.constants.workItemStatuses.Incident.Resolved,
                app.constants.workItemStatuses.Incident.Closed,
                app.constants.workItemStatuses.Problem.Resolved,
                app.constants.workItemStatuses.Problem.Closed
            ];
            var isInvalidWorkItemStatus = _.contains(inValidWorkItemStatus, boundObj.Status.Id);
            if (isInvalidWorkItemStatus) {
                if (!_.isUndefined(addMenu)) {
                    addMenu.enable(addMenu.element.children("li"), false);
                }
            }

        }

        var addChildActivityMenu = function (containerEle, activity) {
            var childData = [{
                text: "<i class='fa fa-plus-circle cursor-pointer'></i>",
                encoded: false,
                items: []
            }];

            if (session.user.Security.CanAddManualActivity) {
                childData[0].items.push({
                    text: localization.ManualActivity,
                    attr: {
                        type: 'manualactivity',
                    }
                });
            }

            if (session.user.Security.CanAddReviewActivity) {
                childData[0].items.push({
                    text: localization.ReviewActivity,
                    attr: {
                        type: 'reviewactivity',
                    }
                })
            }

            var addMenu = containerEle.find(".addChildActivityMenu").kendoMenu({
                openOnClick: true,
                dataSource: childData,
                select: function (e) {
                    if (!_.isUndefined(e.item.attributes["type"])) {
                        var type = e.item.attributes["type"].value;
                        var element = containerEle.find("div[data-activity-id='" + activity.Id + "']");
                        var sequenceId = element.attr("data-activity-sequence");


                        switch (type) {
                            case "reviewactivity":
                                templateNameKey = "DefaultReviewActivityTemplate";
                                break;
                            case "manualactivity":
                            default:
                                templateNameKey = "DefaultManualActivityTemplate";
                                break;
                        }

                        $.ajax({
                            url: "/api/V3/Settings/GetSetting",
                            type: "get",
                            data: { settingKey: templateNameKey },
                            async: true
                        }).done(function (data) {
                            if (!_.isUndefined(data)) {
                                var templateName = data.Value;

                                $.ajax({
                                    url: "/api/V3/Projection/CreateProjectionByTemplateName",
                                    type: "get",
                                    data: { templateName: templateName, createdById: session.user.Id },
                                    async: true
                                }).done(function (newActivity) {
                                    if (!_.isUndefined(newActivity)) {

                                        var index = parseInt(sequenceId) + 1;
                                        var updatedActivityList = boundObj.Activity;

                                        newActivity.ParentWorkItemClass = boundObj.ClassName;
                                        newActivity.ParentWorkItemStatus = boundObj.Status;
                                        newActivity.SequenceId = index;
                                        newActivity.isDirty = true;

                                        newActivity.Status.Id = app.constants.workItemStatuses.Activity.InProgress;
                                        newActivity.Status.Name = localizationHelper.localize("InProgress", "In Progress");

                                        updatedActivityList[sequenceId].Activity.push(newActivity)

                                        //add action log entry 
                                        boundObj.AppliesToWorkItem.push({
                                            EnteredBy: session.user.Name,
                                            Title: localization.Analyst + " " + localization.Comment,
                                            IsPrivate: true,
                                            EnteredDate: new Date().toISOString(),
                                            LastModified: new Date().toISOString(),
                                            Description: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                            DescriptionDisplay: session.user.Name + " added a new activity \n[Id]: " + newActivity.Id,
                                            Image: (true) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                            ActionType: "AnalystComment"
                                        });


                                        boundObj[name] = updatedActivityList;

                                        //on edit, add to pageForm.original viewModel also.
                                        if (pageForm.newWI == false) {
                                            pageForm.jsonRaw.Activity[sequenceId].Activity.push(newActivity)
                                        }

                                        //redraw activity forms
                                        targetEle.html("");
                                        init();

                                        //open new activity
                                        targetEle.find("div[data-activity-id='" + newActivity.Id + "'] span[data-click='toggle']").click();
                                    }
                                });
                            }

                        });

                    }

                }
            }).data("kendoMenu");

            var workItemsWithActivityRestrictions = ["System.WorkItem.ServiceRequest", "System.WorkItem.ChangeRequest", "System.WorkItem.ReleaseRecord"];
            var hasActivityRestriction = _.contains(workItemsWithActivityRestrictions, activity.ClassName);

            if (hasActivityRestriction) {
                var inValidStatus = [
                    app.constants.workItemStatuses.Activity.Completed,
                    app.constants.workItemStatuses.Activity.InProgress,
                    app.constants.workItemStatuses.Activity.Skipped
                ];
                var isInvalid = _.contains(inValidStatus, activity.Status.Id);
                if (isInvalid || activity.Skip) {
                    addMenu.enable(addMenu.element.children("li"), false);
                }
            }
          

            var inValidWorkItemStatus = [
                app.constants.workItemStatuses.ReleaseRecord.Closed,
                app.constants.workItemStatuses.ReleaseRecord.Cancelled,
                app.constants.workItemStatuses.ReleaseRecord.Completed,
                app.constants.workItemStatuses.ReleaseRecord.Failed,
                //app.constants.workItemStatuses.ReleaseRecord.OnHold,
                //app.constants.workItemStatuses.ReleaseRecord.InProgress,
                app.constants.workItemStatuses.Incident.Resolved,
                app.constants.workItemStatuses.Incident.Closed,
                app.constants.workItemStatuses.Problem.Resolved,
                app.constants.workItemStatuses.Problem.Closed
            ];
            var isInvalidWorkItemStatus = _.contains(inValidWorkItemStatus, boundObj.Status.Id);
            if (isInvalidWorkItemStatus) {
                if (!_.isUndefined(addMenu)) {
                    addMenu.enable(addMenu.element.children("li"), false);
                }
            }
        }

        var setActivityStatusImage = function (containerEle, activity) {
            var statusIconName = "nullStatus"; //activity.Status.Name.replace(' ', '').toLowerCase();

            if (!_.isNull(activity.Status.Id)) {
                switch (activity.Status.Id) {
                    case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83":
                        statusIconName = "InProgress";
                        break;
                    case "9de908a1-d8f1-477e-c6a2-62697042b8d9":
                        statusIconName = "Completed";
                        break;
                    case "144bcd52-a710-2778-2a6e-c62e0c8aae74":
                        statusIconName = "Failed";
                        break;
                    case "89465302-2a23-d2b6-6906-74f03d9b7b41":
                        statusIconName = "Cancelled";
                        break;
                    case "50c667cf-84e5-97f8-f6f8-d8acd99f181c":
                        statusIconName = "Pending";
                        break;
                    case "eaec5899-b13c-d107-3e1a-955da6bf9fa7":
                        statusIconName = "Skipped";
                        break;
                    case "d544258f-24da-1cf3-c230-b057aaa66bed":
                        statusIconName = "OnHold";
                        break;
                    case "baa948b5-cc6a-57d7-4b56-d2012721b2e5":
                        statusIconName = "Rerun";
                        break;
                    default:
                        statusIconName = "nullStatus";
                        break;
                }
            } 




            var statusTooltip = localizationHelper.localize(activity.Status.Name.replace(' ', ''), statusIconName)
            if (statusIconName == "") {
                statusIconName = "nullStatus";
                statusTooltip = localization.New;
            }

            if (activity.Skip) {
                statusIconName = "skipped";
                statusTooltip = localization.Skipped;
            }
            containerEle.find(".activity-item-status").attr("src", "/Content/Images/Activity Status/" + statusIconName + ".svg");
            containerEle.find(".activity-item-status").attr("title", statusTooltip);
        };

        // templates
        addTemplate("SequentialActivity", "sequential-activity.html", function (vm, html) {
            var html = $(html);
            var childHtml = html.find('.activity-item-children');

            html.find(".activity-item-header").attr("data-activity-id", vm.Id);

            that.forceProp(vm, "Activity", []);
            that.forceProp(vm, "HasRelatedWorkItems", []);
            vm.isDirty = false;
            vm.bind("change", function (e) {
                app.lib.log(e);
            });
            var activityList = vm.Activity;
            _.each(activityList, function (childActivity) {
                childActivity.IsChild = true;
            });

            //set skip and unskip
            setShowSkipIconProperty(vm);

            //set activity status icon
            setActivityStatusImage(html, vm);

            var actions = {
                setSkip: function () {
                    showComment(vm);
                },
                returnActivity: function () {
                    showComment(vm, html.find("#activityStatus"));
                }
            }
            html.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });
            
            

            kendo.bind(html.find('.activity-item-header'), vm);
            drawTemplates(childHtml, activityList);
            return html;
        });
        addTemplate("ParallelActivity", "parallel-activity.html", function (vm, html) {
            var html = $(html);
            var childHtml = html.find('.activity-item-children');
            html.find(".activity-item-header").attr("data-activity-id", vm.Id);
            that.forceProp(vm, "Activity", []);
            that.forceProp(vm, "HasRelatedWorkItems", []);
            vm.isDirty = false;
            vm.bind("change", function (e) {
                app.lib.log(e);
                if (e.field === 'Title') {
                    //update displayname every time title changes
                    var displayName = !_.isNull(vm.Title) ? vm.Id + ": " + vm.Title : vm.Id;
                    vm.set("DisplayName", displayName);
                }
            });
            var activityList = vm.Activity;

            _.each(activityList, function (childActivity) {
                childActivity.IsChild = true;
            });

            //set skip and unskip
            setShowSkipIconProperty(vm);

            //set activity status icon
            setActivityStatusImage(html, vm);

            var actions = {
                toggle: function () {
                    var header = $(this).parent();
                    var ele = $(header.parent().find('[data-for-action="toggle"]')[0]);
                    var icon = $($(this).find('.k-icon')[0]);
                    var vis = ele.is(':visible');
                    var itemChild = header.closest('.activity-item-children');

                    icon.removeClass('k-plus k-minus');
                    ele.slideToggle(200, function () {
                        if ($(this).is(':visible')) { scrollTo($(this)); }
                    });
                    (vis) ? header.removeClass('header-open') : header.addClass('header-open');
                    (vis) ? icon.addClass('k-plus') : icon.addClass('k-minus');

                    //do we need to disable from items
                    if (!_.isUndefined(pageForm.viewModel.isDisabled) && (pageForm.viewModel.isDisabled)) {
                        html.find('.reviewer-controls').remove();
                        html.find('.k-icon.k-i-arrow-s, .k-icon.k-i-arrow-n, .k-select, .searchIcon, .search').each(function () {
                            $(this).remove();
                        });
                        html.find('.k-input').each(function () {
                            $(this).attr("disabled", "disabled");
                            $(this).addClass("k-state-disabled");
                        });
                    }
                    //align to the root parent when review activity was selected.
                    if (app.isMobile()) {
                        (vis) ? itemChild.removeClass('override-padding-left') : itemChild.addClass('override-padding-left');
                        var recursive = function (elem, reverse) {
                            var parent = elem.parent().parent();
                            var hasChild = $(parent).hasClass('activity-item-children');

                            if (reverse) {
                                if (hasChild) {
                                    $(parent).removeClass('override-padding-left');
                                    recursive($(parent));
                                }
                            } else {
                                if (hasChild) {
                                    $(parent).addClass('override-padding-left');
                                    recursive($(parent));
                                }
                            }
                        }
                        if (vis) { recursive(itemChild, true) } else { recursive(itemChild, false); };
                    }
                },
                setSkip: function () {
                    showComment(vm);
                },
                returnActivity: function () {
                    showComment(vm, html.find("#activityStatus"));
                }
            }
            html.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });

            kendo.bind(html, vm);
            drawTemplates(childHtml, activityList);

            if ((session.user.Analyst == 1)) {
                addAddActivityMenu(html, vm);
                addChildActivityMenu(html, vm);
            }

            return html;
        });
        addTemplate("ReviewActivity", "review-activity.html", function (vm, html) {
            var html = $(html);
            var childHtml = html.find('.activity-item-children');
            html.find(".activity-item-header").attr("data-activity-id", vm.Id);
            that.forceProp(vm, "Activity", []);
            that.forceProp(vm, "HasRelatedWorkItems", []);
            that.forceProp(vm, "Status", { Name: null, Id: null });
            vm.isDirty = false;
            vm.bind("change", function (e) {
                app.lib.log(e);
                if (e.field === 'Title') {
                    //update displayname every time title changes
                    var displayName = !_.isNull(vm.Title) ? vm.Id + ": " + vm.Title : vm.Id;
                    vm.set("DisplayName", displayName);
                }
            });
            var activityList = vm.Activity;
           
            //set skip and unskip
            setShowSkipIconProperty(vm);

            //set activity status icon
            setActivityStatusImage(html, vm);

            //status
            var statusEle = html.find("#activityStatus");
            var parentElem = statusEle.closest('.activity-item-header');

            switch (vm.Status.Id) {
                case "9de908a1-d8f1-477e-c6a2-62697042b8d9":
                    parentElem.addClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
                case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83":
                    parentElem.removeClass('activity-completed-status');
                    parentElem.addClass('activity-inprogress-status');
                    break;
                default:
                    parentElem.removeClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
            }

            if (statusEle.attr("data-readonly") === "true" || targetEle.attr('disabled')) {
               // statusEle.html(vm.Status.Name);
            } else {
                //here it is, disable ddl here....
                //setup and bind activity status
                statusEle.kendoDropDownList({
                    //input.kendoDropDownList({
                    dataSource: {
                        transport: {
                            read: {
                                url: '/api/V3/Enum/GetList',
                                dataType: "json",
                                data: { Id: "57db4880-000e-20bb-2f9d-fe4e8aca3cf6" }
                            }

                        }
                    },
                    dataTextField: "Text",
                    dataValueField: "Id",
                    value: vm.Status.Id,
                    text: vm.Status.Name,
                    change: function (e) {
                        vm.Status.Id = this.value();
                        vm.Status.Name = this.text();
                        vm.isDirty = true;
                        vm.trigger('change');
                    }
                });
                html.find("#activityStatus").unbind('toggle');
            }

            kendo.bind(html, vm);

            var actions = {
                toggle: function () {
                    var header = $(this).parent();
                    var ele = $(header.parent().find('[data-for-action="toggle"]')[0]);
                    var icon = $($(this).find('.k-icon')[0]);
                    var vis = ele.is(':visible');
                    var itemChild = header.closest('.activity-item-children');

                    icon.removeClass('k-plus k-minus');
                    ele.slideToggle(200, function () {
                        if ($(this).is(':visible')) { scrollTo($(this)); }
                    });
                    (vis) ? header.removeClass('header-open') : header.addClass('header-open');
                    (vis) ? icon.addClass('k-plus') : icon.addClass('k-minus');

                    //do we need to disable from items
                    if (!_.isUndefined(pageForm.viewModel.isDisabled) && (pageForm.viewModel.isDisabled)) {
                        html.find('.reviewer-controls').remove();
                        html.find('.k-icon.k-i-arrow-s, .k-icon.k-i-arrow-n, .k-select, .searchIcon, .search').each(function () {
                            $(this).remove();
                        });
                        html.find('.k-input').each(function () {
                            $(this).attr("disabled", "disabled");
                            $(this).addClass("k-state-disabled");
                        });
                    }
                    //align to the root parent when review activity was selected.
                    if (app.isMobile()) {
                        (vis) ? itemChild.removeClass('override-padding-left') : itemChild.addClass('override-padding-left');
                        var recursive = function (elem, reverse) {
                            var parent = elem.parent().parent();
                            var hasChild = $(parent).hasClass('activity-item-children');

                            if (reverse) {
                                if (hasChild) {
                                    $(parent).removeClass('override-padding-left');
                                    recursive($(parent));
                                }
                            } else {
                                if (hasChild) {
                                    $(parent).addClass('override-padding-left');
                                    recursive($(parent));
                                }
                            }
                        }
                        if (vis) { recursive(itemChild, true) } else { recursive(itemChild, false); };
                    }
                },
                setSkip: function () {
                    showComment(vm);
                },
                returnActivity: function () {
                    showComment(vm, statusEle);
                }
            }
            html.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });

            that.apply(html, { vm: vm });

            // set edit security
            if (!session.user.Security.CanEditReviewActivity) {
                var f = html.find("[data-secured='hasEdit']");
                f.find("input, textarea, select").prop("readonly", true);
                f.find("input[type='checkbox']").prop("disabled", true);
                f.find('.dropdowntree-button, .k-select').hide();
            }
            drawTemplates(childHtml, activityList);

            if ((session.user.Analyst == 1) || session.user.Security.CanAddReviewerReviewActivity) {
                addAddActivityMenu(html, vm);
            }

            return html;
        });
        addTemplate("GenericActivity", "generic-activity.html", function (vm, html) {
            var html = $(html);
            var childHtml = html.find('.activity-item-children');
            html.find(".activity-item-header").attr("data-activity-id", vm.Id);
            that.forceProp(vm, "Activity", []);
            that.forceProp(vm, "HasRelatedWorkItems", []);
            that.forceProp(vm, "Status", { Name: null, Id: null });
            vm.isDirty = false;
            vm.bind("change", function (e) {
                app.lib.log(e);
            });
            var activityList = vm.Activity;

            //set skip and unskip
            setShowSkipIconProperty(vm);

            //set activity status icon
            setActivityStatusImage(html, vm);

            //status
            var statusEle = html.find("#activityStatus");
            var parentElem = statusEle.closest('.activity-item-header');

            switch (vm.Status.Id) {
                case "9de908a1-d8f1-477e-c6a2-62697042b8d9":
                    parentElem.addClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
                case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83":
                    parentElem.removeClass('activity-completed-status');
                    parentElem.addClass('activity-inprogress-status');
                    break;
                default:
                    parentElem.removeClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
            }

            if (statusEle.attr("data-readonly") === "true" || targetEle.attr('disabled')) {
               // statusEle.html(vm.Status.Name);
            } else {
                //setup and bind activity status
                statusEle.kendoDropDownList({
                    //input.kendoDropDownList({
                    dataSource: {
                        transport: {
                            read: {
                                url: '/api/V3/Enum/GetList',
                                dataType: "json",
                                data: { Id: "57db4880-000e-20bb-2f9d-fe4e8aca3cf6" }
                            }
                        }
                    },
                    dataTextField: "Text",
                    dataValueField: "Id",
                    value: vm.Status.Id,
                    text: vm.Status.Name,
                    change: function (e) {
                        vm.Status.Id = this.value();
                        vm.Status.Name = this.text();
                        vm.isDirty = true;
                        vm.trigger('change');
                    }
                });
                html.find("#activityStatus").unbind('toggle');
            }

            kendo.bind(html, vm);
            var actions = {
                toggle: function () {
                    var header = $(this).parent();
                    var ele = $(header.parent().find('[data-for-action="toggle"]')[0]);
                    var icon = $($(this).find('.k-icon')[0]);
                    var vis = ele.is(':visible');

                    icon.removeClass('k-plus k-minus');
                    ele.slideToggle(200, function () {
                        if ($(this).is(':visible')) { scrollTo($(this)); }
                    });
                    (vis) ? header.removeClass('header-open') : header.addClass('header-open');
                    (vis) ? icon.addClass('k-plus') : icon.addClass('k-minus');
                },
                setSkip: function () {
                    showComment(vm);
                },
                returnActivity: function () {
                    showComment(vm, statusEle);
                }
            }
            html.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });
            that.apply(html, { vm: vm });

            // set edit security
            if (!session.user.Security.CanEditManualActivity) {
                var f = html.find("[data-secured='hasEdit']");
                f.find("input, textarea, select").prop("readonly", true);
                f.find("input[type='checkbox']").prop("disabled", true);
                f.find('.dropdowntree-button, .k-select, .searchIcon').hide();
                f.find('[data-control="affectedItemsGrid"]').find('.k-grid-toolbar').hide();
            }

            drawTemplates(childHtml, activityList);

            if ((session.user.Analyst == 1) || session.user.Security.CanAddManualActivity) {
                addAddActivityMenu(html, vm);
            }

            return html;
        });
        addTemplate("ManualActivity", "manual-activity.html", function (vm, html) {

            var html = $(html);
            
            //This will assign custom field assigned from Cireson Portal Support Group Mappings on the console.
            var supportGroup = html.find("div[manual-activity-support-group]");
            if (pageForm.MASupportGroupField != "") {
                var enumPickerControl = require("forms/fields/enum/controller");
                var props = {
                    PropertyName: pageForm.MASupportGroupField,
                    PropertyDisplayName: "SupportGroup",
                    EnumId: pageForm.MASupportGroupGuid
                };
                enumPickerControl.build(vm, props, function (enumControl) {
                    supportGroup.html(enumControl);
                    app.controls.apply(supportGroup, {
                        localize: true,
                        vm: vm,
                        bind: true
                    });
                });
                supportGroup.show();
            }
            else {
                supportGroup.closest(".col-group").remove();
            }
                       
            var childHtml = html.find('.activity-item-children');
            html.find(".activity-item-header").attr("data-activity-id", vm.Id);
            that.forceProp(vm, "Activity", []);
            that.forceProp(vm, "HasRelatedWorkItems", []);
            that.forceProp(vm, "Status", { Name: null, Id: null });
            //vm.isDirty = false;
            vm.bind("change", function (e) {
                app.lib.log(e);
            });
            var activityList = vm.Activity;
           
            //set skip and unskip
            setShowSkipIconProperty(vm);

            //set activity status icon
            setActivityStatusImage(html, vm);

            //status
            var statusEle = html.find("#activityStatus");
            var parentElem = statusEle.closest('.activity-item-header');

            switch (vm.Status.Id) {
                case "9de908a1-d8f1-477e-c6a2-62697042b8d9":
                    parentElem.addClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
                case "11fc3cef-15e5-bca4-dee0-9c1155ec8d83":
                    parentElem.removeClass('activity-completed-status');
                    parentElem.addClass('activity-inprogress-status');
                    break;
                default:
                    parentElem.removeClass('activity-completed-status');
                    parentElem.removeClass('activity-inprogress-status');
                    break;
            }

            if (statusEle.attr("data-readonly") === "true" || targetEle.attr('disabled')) {
                //statusEle.html(vm.Status.Name);
            } else if (vm.Status.Id === app.constants.workItemStatuses.ManualActivity.InProgress) { //If Status is In Progress  -- { "Id": "11fc3cef-15e5-bca4-dee0-9c1155ec8d83", "Text": "In Progress", "HasChildren": false, "EnumNodes": [] }
                //for now lets just hard code the two possible status
                var statusDataSource = new kendo.data.DataSource();
                statusDataSource.add({ "Id": app.constants.workItemStatuses.ManualActivity.InProgress, "Text": localization.InProgress, "HasChildren": false, "EnumNodes": [] });

                if (session.user.Security.CanCompleteManualActivity) {
                    statusDataSource.add({ "Id": app.constants.workItemStatuses.ManualActivity.Completed, "Text": localization.Completed, "HasChildren": false, "EnumNodes": [] });
                }
                if (session.user.Security.CanFailManualActivity) {
                    statusDataSource.add({ "Id": app.constants.workItemStatuses.ManualActivity.Failed, "Text": localization.Failed, "HasChildren": false, "EnumNodes": [] });
                }

                //setup and bind activity status
                statusEle.kendoDropDownList({
                    //input.kendoDropDownList({
                    dataSource: statusDataSource,
                    dataTextField: "Text",
                    dataValueField: "Id",
                    value: vm.Status.Id,
                    text: vm.Status.Name,
                    change: function (e) {
                        //completed or cancelled or failed
                        if (this.value() === app.constants.workItemStatuses.ManualActivity.Cancelled ||
                            this.value() === app.constants.workItemStatuses.ManualActivity.Completed ||
                            this.value() === app.constants.workItemStatuses.ManualActivity.Failed) {
                            const that = this;
                            const notes = vm.get('Notes') ? vm.get('Notes') + '\n' : '';
                            const charactersRemaining = 4000 - notes.length;
                            //lets see if user has any comments
                            $.when(app.controls.ManualActivityCommentDialog.show({
                                title: localization.Comments,
                                message: session.consoleSetting.RequireImplementationNotes ? localization.ImplementationdetailsRequired : localization.DoYouHaveComments,
                                required: session.consoleSetting.RequireImplementationNotes,
                                charactersRemaining: charactersRemaining,
                            })
                            ).done(function (response) {
                                if (response.button === "yes") {
                                    vm.set('Notes', notes + response.input);
                                    //set actual end date
                                    vm.set('ActualEndDate', new Date().toISOString());
                                    vm.Status.Id = that.value();
                                    vm.Status.Name = that.text();
                                    vm.isDirty = true;
                                }
                                that.value(vm.Status.Id);
                            });
                        }
                    }
                });
                html.find("#activityStatus").unbind('toggle');
            }

            kendo.bind(html, vm);
            var actions = {
                toggle: function () {
                    var header = $(this).parent();
                    var ele = $(header.parent().find('[data-for-action="toggle"]')[0]);
                    var icon = $($(this).find('.k-icon')[0]);
                    var vis = ele.is(':visible');
                    var itemChild =  header.closest('.activity-item-children');

                    icon.removeClass('k-plus k-minus');
                    ele.slideToggle(200, function () {
                        if ($(this).is(':visible')) { scrollTo($(this)); }
                    });
                    (vis) ? header.removeClass('header-open') : header.addClass('header-open');
                    (vis) ? icon.addClass('k-plus') : icon.addClass('k-minus');
                    //align to the root parent when review activity was selected.
                    if (app.isMobile()) {
                        (vis) ? itemChild.removeClass('override-padding-left') : itemChild.addClass('override-padding-left');
                        var recursive = function (elem, reverse) {
                            var parent = elem.parent().parent();
                            var hasChild = $(parent).hasClass('activity-item-children');

                            if (reverse) {
                                if (hasChild) {
                                    $(parent).removeClass('override-padding-left');
                                    recursive($(parent));
                                }
                            } else {
                                if (hasChild) {
                                    $(parent).addClass('override-padding-left');
                                    recursive($(parent));
                                }
                            }
                        }
                        if (vis) { recursive(itemChild, true) } else { recursive(itemChild, false); };
                    }
                },
                setSkip: function () {
                    showComment(vm);
                },
                returnActivity: function () {
                    showComment(vm, statusEle);
                }
            }

            html.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });
            that.apply(html, { vm: vm });


           

            // set edit security
            if (!session.user.Security.CanEditManualActivity) {
                var f = html.find("[data-secured='hasEdit']");
                f.find("input, textarea, select").prop("readonly", true);
                f.find("input[type='checkbox']").prop("disabled", true);
                f.find('.dropdowntree-button, .k-select, .searchIcon').hide();
                f.find('[data-control="affectedItemsGrid"]').find('.k-grid-toolbar').hide();
            }

            drawTemplates(childHtml, activityList);

            if ((session.user.Analyst == 1) || session.user.Security.CanAddManualActivity) {
                addAddActivityMenu(html, vm);
            }
            
            //append assignedAnalystByGroup task
            if (pageForm.MASupportGroupField != "" && !pageForm.viewModel.isDisabled) {
                var analystByGroup = require("forms/tasks/analystByGroup/controller");
                var viewModelVM = kendo.observable({
                    type: "ManualActivity",
                    viewModel: vm
                });
                var node = {
                    Task: "analystByGroup",
                    Label: localization.AssignToAnalystByGroup,
                    Access: !_.isNull(pageForm.MASupportGroupField),
                    Configs: { propertyName: pageForm.MASupportGroupField, enumId: pageForm.MASupportGroupGuid }
                }
                analystByGroup.build(viewModelVM, node, function (item) {
                    var taskPane = html.find(".activity-item-tasks");
                    taskPane.append(item);
                });
            }
            return html;
        });

        onReady(init);



    }

    // creates a checkbox selector grid from a html table.
    // will add a checkbox column to far left, and on select
    // creates a comma delimited string to a target input but id attr.
    // ALERT: Only works with targetValueId atm, NOT kendo binding
    this.checkboxGridByHtml = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.checkboxGrid"); }
        if (!settings.targetValId) { app.controls.exception("targetValId missing - controls.checkboxGrid"); }
        if (!settings.valueField) { app.controls.exception("valuefield missing - controls.checkboxGrid"); }

        var valueField = settings.valueField;
        var targetValId = settings.targetValId;



        // create colgroup
        var colg = targetEle.find('colgroup');
        if (!colg.length) {
            colg = $('<colgroup>');
            targetEle.find('th').each(function () {
                colg.append($('<col>'));
            });
            targetEle.prepend(colg);
        }
        var col = $('<col>', { style: 'width: 35px; text-align: center; ' });
        colg.prepend(col);

        // get value field index
        var vIdx = targetEle.find('thead tr th').index(targetEle.find('[data-field="' + valueField + '"]')) + 1;

        // create checkbox column th
        var selectAllCB = $('<input>', { type: 'checkbox' });
        selectAllCB.click(function () {
            if ($(this).is(':checked')) {
                targetEle.find("tbody>tr>td:first-child input").prop('checked', true);
            } else {
                targetEle.find("tbody>tr>td:first-child input").prop('checked', false);
            }
            outputValues();
        });
        var th = $('<th>', { style: 'cursor: default;' });
        th.attr('data-field', 'checked');
        th.append(selectAllCB);
        targetEle.find('thead > tr').prepend(th);

        // create checkbox td's and prepend them
        targetEle.find('tbody > tr').each(function () {
            var cb = $('<input>', { type: 'checkbox', 'data-checkbox': true, 'data-bind': 'checked: checked' });
            cb.click(function (e) {
                $(this).parent('tr').trigger('click');
            });
            $(this).prepend($('<td>', { html: cb }));
        });

        // create grid
        var checkboxGrid = targetEle.kendoGrid({
            sortable: false,  // on sort, checkboxes lose their state
            resizable: true,
            pageable: false,
            selectable: false
        }).data("kendoGrid");

        // hide value column
        checkboxGrid.hideColumn(vIdx);

        // unbind checkbox header click  (prevent ugly sorting hover effect)
        var thead = targetEle.parent().parent().find('thead');
        var thCB = thead.find('th').first();
        thCB.unbind();

        // grid row click
        targetEle.on("click", "tbody>tr", function (e) {
            var cb = $(this).find('td').first().find('input');
            if (!$(e.target).attr('data-checkbox')) {
                cb.prop('checked', !cb.is(':checked'));
            }
            outputValues();
        });

        // get values and output to target
        var outputValues = function () {
            var vals = "";
            var all = true;
            targetEle.find("tbody>tr").each(function () {
                var cb = $(this).find('td').first().find('input');
                if (cb.is(':checked')) {
                    vals += $($(this).find('td')[vIdx]).text() + ",";
                } else {
                    all = false;
                }
            });
            selectAllCB.prop('checked', all);
            $('#' + targetValId).val(vals.substr(0, vals.length - 1));
        }
        // set checked from input vals
        var setCheckedFromTarget = function () {
            var vals = [];
            var v = $('#' + targetValId).val().split(',');
            $.each(v, function (i, item) {
                setCheckedByValueField(item, true);
            });
        }
        var setCheckedByValueField = function (val, checked) {
            targetEle.find("td:contains('" + val + "')").parent().find('td').first().find('input').prop("checked", checked);
        }
        setCheckedFromTarget();
    },
        this.checkboxGridByCriteria = function (targetEle, settings) {
            if (_.isUndefined(session.features)) {
                app.featureSet.initList();
            }

            if (!app.featureSet.isActive("QueryPicker")) {
                return;
            }

            //get and set the preferred datetime culture
            var preferredCulture = $("meta[name='accept-language']").attr("content");
            kendo.culture(preferredCulture);

            //adjust control width
            var parentNode = targetEle.parent().parent().parent().parent();
            parentNode.removeClass("col-md-12");
            parentNode.addClass("col-md-6");

            //QUERY RESULT CONFIGURATION
            var targetId = targetEle.attr("data-control-valuetargetid");
            var valuefield = targetEle.attr("data-control-valuefield");
            var criteriaid = targetEle.attr("data-control-criteriaid");
            var columnsid = targetEle.attr("data-control-columnsid");
            var dependencyTargetIds = targetEle.attr("data-control-dependencies");
            var classorprojectionid = targetEle.attr("data-control-classorprojectionid");
            var isprojection = targetEle.attr("data-control-isprojection");
            var isMultiselect = targetEle.attr("data-control-ismultiselect");
            var requiredAttr = $("input[id='" + targetId + "']").last().attr("required");
            var queryLabelText = targetEle.attr("data-control-sourceprompt");
            var isRequired = (!_.isUndefined(requiredAttr) && !_.isNull(requiredAttr)) ? requiredAttr.toLowerCase() === "required" : false;

            // CREATE DEPENDENCY WRAP
            var dependencyInputs = [];
            if (dependencyTargetIds) {
                var dependencyIds = dependencyTargetIds.split(',');
                dependencyInputs = _.map(dependencyIds, function (dependencyId) {

                    var element = document.getElementById(dependencyId);
                    var $element = $(element);
                    var $parents = $(targetEle).parents().has(element).first().find(">div");
                    var $controlElement = $("[data-control-valuetargetid='" + dependencyId + "']");
                    if (!$controlElement.length) { $controlElement = $element; }
                    var attr = $controlElement[0].type || $controlElement.attr("type") || $controlElement.attr("data-control");
                    var baseId = $controlElement.attr("data-control-sourceid");

                    if (attr === "text") {
                        $element.on("enter", function () {
                            $(this).trigger("change");
                        });
                    }

                    return {
                        element: element,
                        $element: $element,
                        getValue: function (criteriaTokenType) {
                            if (attr == "checkbox") {
                                return $controlElement.is(":checked").toString();
                            } else if (attr == "checkboxGridByCriteria") {
                                var selectedItem = null;
                                var multiSelect = $($controlElement[0]).find("select").data("kendoMultiSelect");
                                if (!_.isUndefined(multiSelect)) {
                                    selectedItem = $($controlElement[0]).find('[data-kendo-control="multiselectlistview"]').data("kendoListView").dataSource.data()[0];
                                }
                                if (!_.isUndefined(selectedItem) && !_.isNull(selectedItem)) {
                                    return selectedItem[criteriaTokenType];
                                }
                                else {
                                    try {
                                        //This is for the bug 23710
                                        var multiselectListViewEle = $($controlElement[0]).find("[data-kendo-control='multiselectlistview']").data("kendoListView").dataSource.data();
                                        if (multiselectListViewEle.length > 0) {
                                            return multiselectListViewEle[0][criteriaTokenType];
                                        }
                                    }
                                    catch (ex) { }
                                }
                                return false;
                            } else {
                                return $element.val();
                            }
                        },
                        id: dependencyId,
                        baseId: !_.isUndefined(baseId) ? baseId : $parents.has(element).find('.question-baseid').last().val(),
                        $controlElement: $controlElement
                    };
                });
            }

            // DEPENDENCY VALUEs
            var getDependencyValue = function (guid, criteriaTokenType) {
                var input = _.find(dependencyInputs, function (item) {
                    return item.baseId === guid;
                });
                
                if (input) {
                    var _tempValue = input.getValue(criteriaTokenType + "_EnumId");
                    if (!_.isUndefined(_tempValue)) {
                        return _tempValue;
                    }
                    else {
                        return input.getValue(criteriaTokenType);
                    }
                }



                app.lib.log("getDependencyValue not set");
            }

            // CRITERIA
            var originalCriteria = $('#' + criteriaid).val();
            var criteria = originalCriteria;
            var setCriteriaValue = function () {
                var xmlCriteria = jQuery.parseXML(originalCriteria);
                var xmlExpressionNode = $(xmlCriteria).find("ValueExpressionRight");
                $.each(xmlExpressionNode, function (i, item) {
                    var tokenNode = $(item).find("Token");
                    if (tokenNode.length) {
                        //process replace for user-defined tokens
                        if (!_.isUndefined(tokenNode[0].textContent.split("TokenId__")[1])) {
                            // get token type
                            var criteriaTokenType = (tokenNode.length) ? tokenNode[0].textContent.split("TokenId__")[1].split("##")[0] : "";
                            var guid = (tokenNode.length) ? tokenNode[0].textContent.split("#TokenId__")[0].split("TokenSourceId__")[1] : "";

                            // get value
                            var value = getDependencyValue(guid, criteriaTokenType);
                            // set token value
                            if (!value) {
                                $(item).find("Token").remove()
                            } else {
                                $(item).find("Token").replaceWith(value);
                            }
                        }
                    }
                    else {
                        //process replace scsm preset tokens [me],[mygroup]
                        var valueNodeElement = $(item)[0];
                        var nodeValue = valueNodeElement.textContent;
                        if (nodeValue.indexOf("[me]") >= 0 || nodeValue.indexOf("[mygroup]") >= 0) {
                            var tokenElement = xmlCriteria.createElement("Token");
                            var tokenValue = xmlCriteria.createTextNode(nodeValue);
                            tokenElement.appendChild(tokenValue);

                            valueNodeElement.textContent = "";
                            valueNodeElement.append(tokenElement);
                        }
                    }
                });

                criteria = (new XMLSerializer()).serializeToString(xmlCriteria);
            }

        var getCriteriaValue = function () {
                return encodeURI(criteria);
            }
            if (originalCriteria != "") {
                setCriteriaValue();
            }

            // COLUMNS
            var columns = $('#' + columnsid).val(); // "title(((:)))name(((;)))title(((:)))name"; 
            var columnNames = [];
            var columnTitles = [];

        $.each(columns.split("(((;)))"), function (i, item) {
            var col = item.split("(((:)))");
            columnNames.push(col[1]);
                columnTitles.push({
                    field: col[1],
                    title: _.isUndefined(localization[col[1]]) ? col[0] : localization[col[1]]
                });
            });
            columnNames = columnNames.join(',');

            var hasValue = _.all(dependencyInputs, function (item) {
                var value = item.getValue();
                return value !== false && value != "";
            });

            //hide old querypicker label
            $("label.control-label.querypicker").hide();

            var createQueryPicker = function (template) {
                var template = $(template);
                var multiselectEle = template.find("[data-kendo-control='multiselect']");
                var multiselectListViewEle = template.find("[data-kendo-control='multiselectlistview']");
                var multiselectModalEle = template.find("[id='query-picker-dialog']");
                var bIsProjection = !_.isUndefined(isprojection) ? isprojection.toLowerCase() == "true" : false;

                //query picker viewModel
                var viewModel = kendo.observable({
                    labelText: isRequired ? queryLabelText + "<i>Required*</i>" : queryLabelText,
                    isMultiSelection: (!_.isUndefined(isMultiselect) || !_.isNull(isMultiselect)) ? isMultiselect.toLowerCase() === "true" : false,
                    updateSelectedItems: function (selectedItems) {
                        var selectedItemIds = _.pluck(selectedItems, "BaseId");
                        var newDataJSON = [];
                        $("input[id='" + targetId + "']").each(function (i, el) {
                            $(el).val(selectedItemIds.join(','));
                            $(el).change();
                        });


                        newDataJSON = selectedItems;
                        $('#Json' + targetId).val(JSON.stringify(newDataJSON));
                    }
                });


                var dSource = new kendo.data.DataSource({
                    type: "aspnetmvc-ajax",
                    prefix: "",
                    transport: {
                        read: {
                            url: "/Search/GetMultiSelectQueryResultObjectsByCriteria",
                            type: "POST",
                            data: {
                                id: classorprojectionid,
                                isProjection: bIsProjection,
                                columnNames: columnNames,
                                criteria: getCriteriaValue,
                                filterText: function (e) {
                                    return multiselectViewModel.searchText;
                                }
                            }
                        }
                    },
                    pageSize: 5,
                    page: 1,
                    total: 0,
                    schema: {
                        data: function (response) {
                            var data = response.Data;
                            data = _.map(data, function (el) {
                                var flag = false;
                                var array = (el.Details) ? el.Details.split(",") : [];
                                for (var i in array) {
                                    var val = array[i];
                                    //trim white spaces to prevent parsing strings ending with a number as date
                                    //var valStr = val.toString().replace(/\s+/, "");
                                    //if (Date.parse(valStr) && /^\d+$/.test(valStr) == false && parseFloat(valStr) && moment(valStr).isValid()) {
                                    if (moment(val, moment.ISO_8601).isValid() && Date.parse(val)) {
                                        flag = true;
                                        array[i] = kendo.toString(moment.utc(val).toDate(), 'g');
                                    }
                                }
                                if (flag)
                                    el.Details = array.join(", ");

                                //add a default value for BaseId if server data does not have this property
                                if (!el.hasOwnProperty("BaseId") && el.hasOwnProperty("Id"))
                                    el["BaseId"] = !_.isUndefined(el.Id) ? el.Id : null;

                                //add a default Checked property for each data
                                var selectedValues = _.pluck(multiselectViewModel.selectedItems.data(), "BaseId");
                                el["Checked"] = selectedValues.indexOf(el["BaseId"]) > -1;

                                return el;
                            });
                            return response.Data;
                        },
                        total: "Total",
                        errors: "Errors"
                    },
                    serverFiltering: true,
                    serverPaging: true,
                });

                //multiselect viewModel
                var multiselectViewModel = kendo.observable({
                    settings: {
                        open: function (e) {
                            e.sender.popup.element.addClass('multiquery-selector__wrapper');
                        },
                        itemTemplate: "<div class=\"fa multiquery-select__checkbox #: (data.Checked === true) ? 'multiquery-select__checkbox--checked' : '' #\" id=#:!_.isUndefined(data)?data.BaseId:''#></div>" +
                            "<div class=\"multiquery-select__items\">" +
                            "<div class=\"multiquery-select__items__name\">#:!_.isUndefined(data)?data.Name:''#</div>" +
                            "<div class=\"multiquery-select__items__details\">#:!_.isUndefined(data)?data.Details:''#</div>" +
                            "</div>",
                        autoClose: false,
                        dataTextField: "Name",
                        dataValueField: "BaseId",
                        footerTemplate: '#: instance.dataSource._view.length #/ #: instance.dataSource.total() # <a  data-bind="click: showModal">' + localizationHelper.localize("ShowMore", "Show More") + '</a>',
                        dataBound: function (e) {
                            var footer = $(e.sender.popup.element).find(".k-footer");
                            kendo.bind(footer, multiselectViewModel);
                        },
                        dataSource: (!dependencyTargetIds || hasValue) ? dSource : false,
                        select: function (e) {

                        },
                        change: function (e) {

                            var items = this.ul.find("li");
                            var newData = multiselectViewModel.selectedItems.view();
                            if (viewModel.isMultiSelection) {
                                this.dataItems().forEach(function (val, index, arr) {
                                    if (_.isUndefined(val.BaseId)) {
                                        val.BaseId = !_.isUndefined(val.Id) ? val.Id : null;
                                    }

                                    //only add item if not yet on selected item list
                                    var result = _.where(newData, { BaseId: val.BaseId });
                                    if (result.length <= 0) {
                                        newData.push(val);
                                    }
                                });

                            } else {
                                var dataItem = this.dataItems().pop();
                                for (var i in e.sender.dataSource.data()) {
                                    var item = e.sender.dataSource.data()[i];
                                    if (!_.isUndefined(dataItem) && dataItem.Id == item.Id)
                                        item.Checked = dataItem.Checked;
                                    else
                                        item.Checked = false;
                                }

                                if (!_.isUndefined(dataItem) && _.isUndefined(dataItem.BaseId)) {
                                    dataItem.BaseId = !_.isUndefined(dataItem.Id) ? dataItem.Id : null;
                                }

                                newData.pop();

                                //reset selected values
                                this.value([]);

                                if (!_.isUndefined(dataItem) && dataItem.Checked) {
                                    newData.push(dataItem);
                                    this.value([dataItem.Id]);
                                }

                            }

                            multiselectViewModel.selectedItems.data(newData); //update selecteditems list view
                            multiselect.refresh();

                            viewModel.updateSelectedItems(newData);

                        },
                        filtering: function (e) {
                            if (!_.isUndefined(e.filter)) {
                                multiselectViewModel.searchText = e.filter.value;
                            }
                        },
                        placeholder: localizationHelper.localize("Search", "Search") + "...",
                        select: function (e) {
                            //change Checked property to true when selected
                            e.dataItem.Checked = true;
                        },
                        deselect: function (e) {
                            //change Checked property to false when deselected
                            e.dataItem.Checked = false;
                            var currentList = multiselectViewModel.selectedItems.view();
                            var newData = _.reject(currentList, function (d) { return d.BaseId === e.dataItem.BaseId; });

                            multiselectViewModel.selectedItems.data(_.uniq(newData)); //update selecteditems list view
                        },
                        close: function (e) {
                            multiselectViewModel.searchText = "";
                        }
                    },
                    searchText: "",
                    isSelectedAll: false,
                    selectedItems: new kendo.data.DataSource({
                        data: []
                    }),
                    dSource: dSource,
                    isModalCreated: false,
                    multiselectModalViewModel: null,
                    showModal: function (e) {

                        //if (multiselectViewModel.isModalCreated == false) {
                        multiselectViewModel.isModalCreated = true;

                        that.getTemplate("querypicker/query-picker-modal-template.html", function (modalTemplate) {
                            //add modal template to querypicker modal container at RO Form
                            $(".querypickermodal").html(modalTemplate);
                            that.localize($(".querypickermodal"), localization);

                            //multiselect modal viewModel
                            multiselectViewModel.multiselectModalViewModel = new kendo.observable({
                                labelText: queryLabelText,
                                isSelectedAll: multiselectViewModel.isSelectedAll,
                                filter: multiselectViewModel.searchText,
                                isMultiSelection: viewModel.isMultiSelection,
                                dataSource: new kendo.data.DataSource({
                                    type: "aspnetmvc-ajax",
                                    prefix: "",
                                    transport: {
                                        read: {
                                            url: "/Search/GetMultiSelectQueryResultObjectsByCriteria",
                                            type: "POST",
                                            data: {
                                                id: classorprojectionid,
                                                isProjection: bIsProjection,
                                                columnNames: columnNames,
                                                criteria: e.data.dSource.transport.options.read.data.criteria,
                                                filterText: function (e) {
                                                    return multiselectViewModel.multiselectModalViewModel.filter;
                                                }

                                                }
                                            }
                                        },
                                        pageSize: 10,
                                        page: 1,
                                        total: 0,
                                        schema: {
                                            data: function (response) {
                                                var data = response.Data;
                                                data = _.map(data, function (el) {
                                                    var flag = false;
                                                    var array = (el.Details) ? el.Details.split(",") : [];
                                                    for (var i in array) {
                                                        var val = array[i];
                                                        //trim white spaces to prevent parsing strings ending with a number as date
                                                        //var valStr = val.toString().replace(/\s+/, "");
                                                        //if (Date.parse(valStr) && /^\d+$/.test(valStr) == false && parseFloat(valStr) && moment(valStr).isValid()) {
                                                        if (moment(val, moment.ISO_8601).isValid() && Date.parse(val)) {
                                                            flag = true;
                                                            array[i] = kendo.toString(moment.utc(val).toDate(), 'g');
                                                        }
                                                    }
                                                    if (flag)
                                                        el.Details = array.join(", ");

                                                //add a default value for BaseId if server data does not have this property
                                                if (!el.hasOwnProperty("BaseId") && el.hasOwnProperty("Id"))
                                                    el["BaseId"] = !_.isUndefined(el.Id) ? el.Id : null;

                                                //add a default Checked property for each data
                                                el["Checked"] = false;
                                                var selected = _.find(multiselectViewModel.multiselectModalViewModel.selectedItems, function (item) {
                                                    return item.Id == el["BaseId"];
                                                });
                                                if (!_.isUndefined(selected)) {
                                                    el["Checked"] = true;
                                                }

                                                return el;
                                            });
                                            return response.Data;
                                        },
                                        total: "Total",
                                        errors: "Errors"
                                    },
                                    serverFiltering: true

                                }),
                                onCancelClick: function (e) {
                                    $("#query-picker-dialog").modal("hide");

                                    //Bug-22409
                                    multiselectViewModel.moreSelection.destroy();
                                    multiselectViewModel.multiselectModalViewModel.selectedItems = [];
                                    $("#more-selection-pager").data("kendoPager").destroy();
                                    $("#more-selection").empty();
                                    $("#more-selection-pager").empty();
                                },
                                onConfirmClick: function (e) {
                                    var selectedItemIds = _.pluck(multiselectViewModel.multiselectModalViewModel.selectedItems, 'BaseId');

                                    //refresh and update multiselect values
                                    multiselect.dataSource.filter({});
                                    multiselect.value(selectedItemIds);



                                    //refresh and update listview values
                                    multiselectViewModel.selectedItems.data(multiselectViewModel.multiselectModalViewModel.selectedItems);

                                    //update main viewmodel values
                                    viewModel.updateSelectedItems(multiselectViewModel.multiselectModalViewModel.selectedItems);



                                    $("#query-picker-dialog").modal("hide");

                                    //Bug-22409
                                    multiselectViewModel.moreSelection.destroy();
                                    multiselectViewModel.multiselectModalViewModel.selectedItems = [];
                                    $("#more-selection-pager").data("kendoPager").destroy();
                                    $("#more-selection").empty();
                                    $("#more-selection-pager").empty();
                                },
                                selectedItems: multiselectViewModel.selectedItems.view(),
                                select: function (selectedElement) {


                                    var rowDataItem = multiselectViewModel.moreSelection.dataItem(selectedElement);
                                    if (!_.isUndefined(rowDataItem) && _.isUndefined(rowDataItem.BaseId)) {
                                        rowDataItem.BaseId = !_.isUndefined(rowDataItem.Id) ? rowDataItem.Id : null;
                                    }



                                    if (!_.isUndefined(rowDataItem)) {
                                        var isSelected = selectedElement.hasClass("k-state-selected");
                                        if (isSelected) {
                                            if (!viewModel.isMultiSelection) {
                                                multiselectViewModel.multiselectModalViewModel.selectedItems.pop();
                                                multiselectViewModel.multiselectModalViewModel.selectedItems.push(rowDataItem);
                                            } else {
                                                if (multiselectViewModel.multiselectModalViewModel.isSelectedAll == true) {
                                                    multiselectViewModel.multiselectModalViewModel.selectedItems = multiselectViewModel.multiselectModalViewModel.dataSource.data();
                                                } else {
                                                    var res = _.find(multiselectViewModel.multiselectModalViewModel.selectedItems, function (item) {
                                                        return item.BaseId == rowDataItem.BaseId;
                                                    });

                                                    if (_.isUndefined(res)) {
                                                        multiselectViewModel.multiselectModalViewModel.selectedItems.push(rowDataItem);
                                                    }
                                                }
                                            }
                                        } else {
                                            var currentList = multiselectViewModel.multiselectModalViewModel.selectedItems;
                                            var newData = _.reject(currentList, function (d) {
                                                return d.BaseId === rowDataItem.BaseId;
                                            });

                                            rowDataItem.Checked = false;

                                            multiselectViewModel.multiselectModalViewModel.selectedItems = newData;

                                            if (multiselectViewModel.multiselectModalViewModel.isSelectedAll == true) {
                                                //this will uncheck the select all if you unselect one from the list.
                                                multiselectViewModel.multiselectModalViewModel.singleSelect = true;
                                                multiselectViewModel.multiselectModalViewModel.set("isSelectedAll", false);
                                                multiselectViewModel.set("isSelectedAll", false);
                                            }
                                        }
                                    }
                                },
                                cancelText: localization.Cancel,
                                confirmText: localization.Confirm
                            });

                            multiselectViewModel.multiselectModalViewModel.bind("change", function (e) {

                                if (multiselectViewModel.multiselectModalViewModel.singleSelect) {
                                    //This will prevent on unselection of all checkbox
                                    multiselectViewModel.multiselectModalViewModel.singleSelect = false;
                                    return;
                                }
                                if (e.field == "isSelectedAll" || (e.field == "dataSource" && multiselectViewModel.multiselectModalViewModel.isSelectedAll == true)) {
                                    _.defer(function () {
                                        var elements = $("#more-selection .multi-query__list__selected-items");
                                        if (multiselectViewModel.multiselectModalViewModel.isSelectedAll == true) {
                                            elements.each(function () {
                                                $(this).addClass('k-state-selected');
                                                $(this).find(".multiquery-select__checkbox").addClass('multiquery-select__checkbox--checked');
                                                var rowDataItem = multiselectViewModel.moreSelection.dataItem($(this));
                                                rowDataItem.Checked = true;
                                                multiselectViewModel.multiselectModalViewModel.select($(this));
                                            });
                                        } else {
                                            elements.each(function () {
                                                $(this).removeClass('k-state-selected');
                                                $(this).find(".multiquery-select__checkbox").removeClass('multiquery-select__checkbox--checked');
                                                var rowDataItem = multiselectViewModel.moreSelection.dataItem($(this));
                                                rowDataItem.Checked = false;
                                                multiselectViewModel.multiselectModalViewModel.select($(this));
                                            });
                                        }
                                    });
                                    if (e.field == "isSelectedAll") {
                                        multiselectViewModel.multiselectModalViewModel.selectedItems = [];
                                        multiselectViewModel.set("isSelectedAll", multiselectViewModel.multiselectModalViewModel.isSelectedAll);
                                    }
                                }
                            });

                            multiselectViewModel.moreSelection = $("#more-selection").kendoListView({
                                dataSource: multiselectViewModel.multiselectModalViewModel.dataSource,
                                template: kendo.template($("#listviewModalTemplate").html()),
                                dataBound: function (e) {
                                    var items = this.element.find('.multi-query__list__selected-items');

                                    _.each(items, function (element, index) {
                                        if (!_.isUndefined(multiselectViewModel.moreSelection)) {
                                            var rowDataItem = multiselectViewModel.moreSelection.dataItem(element);
                                            var selectedItem = _.find(multiselectViewModel.multiselectModalViewModel.selectedItems, function (item) {
                                                return item.BaseId == rowDataItem.BaseId;
                                            });

                                            (selectedItem) ? $(element).addClass('k-state-selected') : $(element).removeClass('k-state-selected');
                                            (selectedItem) ? $(element).find(".multiquery-select__checkbox").addClass('multiquery-select__checkbox--checked') : $(element).find(".multiquery-select__checkbox").removeClass('multiquery-select__checkbox--checked');
                                        }
                                    });

                                    $("#more-selection").find('.multi-query__list__selected-items').click(function () {
                                        $(this).toggleClass('k-state-selected');
                                        $(this).find(".multiquery-select__checkbox").toggleClass("multiquery-select__checkbox--checked");

                                        var rowDataItem = multiselectViewModel.moreSelection.dataItem($(this));
                                        rowDataItem.Checked = !rowDataItem.Checked;

                                        multiselectViewModel.multiselectModalViewModel.select($(this));


                                        if (!viewModel.isMultiSelection) {
                                            multiselectViewModel.multiselectModalViewModel.onConfirmClick();
                                        }
                                    });

                                    $("#more-selection-pager").kendoPager({
                                        dataSource: multiselectViewModel.multiselectModalViewModel.dataSource
                                    });
                                }
                            }).data("kendoListView");

                            $("#searchfilter").on("keyup", function (e) {
                                multiselectViewModel.multiselectModalViewModel.filter = e.currentTarget.value;
                                multiselectViewModel.multiselectModalViewModel.dataSource.read();
                            });

                            if (multiselectViewModel.multiselectModalViewModel.filter != "") {
                                multiselectViewModel.multiselectModalViewModel.dataSource.read();
                            }

                            kendo.bind($("#query-picker-dialog"), multiselectViewModel.multiselectModalViewModel);

                            $("#query-picker-dialog").modal("show");
                            $('.modal-backdrop').each(function (i, obj) {
                                $('#query-picker-dialog').before(obj);
                            });

                            //clear out filter when modal closes
                            $("#query-picker-dialog").on('hidden.bs.modal', function () {
                                multiselectViewModel.searchText = "";
                            });
                        }, {
                                apply: false
                            });

                        //} else {
                        //    //This will prevent creating new set of modal.
                        //    //Bug 22409
                        //    multiselectViewModel.multiselectModalViewModel.set("filter", multiselectViewModel.searchText);

                        //    multiselectViewModel.multiselectModalViewModel.dataSource.read();
                        //    $("#more-selection-pager").data("kendoPager").page(1);
                        //    $("#query-picker-dialog").modal("show");
                        //    $('.modal-backdrop').each(function (i, obj) {
                        //        $('#query-picker-dialog').before(obj);
                        //    });

                        //    //clear out filter when modal closes
                        //    $("#query-picker-dialog").on('hidden.bs.modal', function () {
                        //        multiselectViewModel.searchText = "";
                        //    });
                        //}
                    }
                });

                targetEle.append(template);
                that.localize(template, localization);

                kendo.bind(template, viewModel);

                var multiselect = multiselectEle.kendoMultiSelect(multiselectViewModel.settings).data("kendoMultiSelect");
                var multiselectListView = multiselectListViewEle.kendoListView({
                    dataSource: multiselectViewModel.selectedItems,
                    template: kendo.template($("#listViewTemplate").html()),
                    remove: function (e) {

                        var updatedList = [];


                        multiselectViewModel.selectedItems.view().forEach(function (val) {
                            if (e.model.BaseId != val.BaseId) {
                                updatedList.push(val)
                            }
                        });

                        multiselect.value(updatedList);
                        //update main viewmodel values
                        viewModel.updateSelectedItems(updatedList);
                        e.model.Checked = false;


                        //This will make sure to uncheck multiple selected items dropdown list if item is list below is removed.
                        multiselect.dataSource.data().forEach(function (item) {
                            if (e.model.BaseId == item.BaseId) {
                                item.Checked = false;
                            }
                        });

                        multiselect.refresh();

                    },
                    dataBound: function (e) {
                        if (isRequired && e.items.length >= 1) {
                            $(template).removeClass("multi-query-invalid");
                        }
                    }
                }).data("kendoListView");

                //Prevent the deletion of selected items on backspace
                //Prevent enter from triggering change event
                var multiselectInput = multiselect.input;
                multiselectInput.on('keydown', function (e) {
                    if ((e.which === 8 && !e.target.value.length) || e.which === 13) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
                $._data(multiselectInput[0]).events.keydown.reverse();


                //dependency/token bindings
                _.each(dependencyInputs, function (dependencyInput) {
                    dependencyInput.$element.change(function (e) {

                        //reset dependent field value
                        if (!_.isUndefined(settings.targetValId) && !_.isNull(settings.targetValId)) {
                            $("input[id='" + settings.targetValId + "']").each(function (i, el) {
                                multiselectListView.dataSource.data([])
                                $(el).val("")
                            });

                        }
                        var dependentValue = $(this).val();
                        if (dependentValue != "") {
                            setCriteriaValue();
                            multiselect.setDataSource(dSource);
                        } else {
                            multiselect.setDataSource(new kendo.data.DataSource());
                        }
                        multiselect.dataSource.read();
                    });
                    dependencyInput.$element.change();
                });


            }

            that.getTemplate("querypicker/query-picker-template.html", createQueryPicker, { apply: false });
        }

    

    this.checkboxGridByCriteriaOld = function (targetEle, settings) {
        if (_.isUndefined(session.features)) {
            app.featureSet.initList();
        }

        if (app.featureSet.isActive("QueryPicker")) {
            return;
        }

        var targetId = targetEle.attr("data-control-valuetargetid");
        var valuefield = targetEle.attr("data-control-valuefield");
        var criteriaid = targetEle.attr("data-control-criteriaid");
        var columnsid = targetEle.attr("data-control-columnsid");
        var dependencyTargetIds = targetEle.attr("data-control-dependencies");
        var classorprojectionid = targetEle.attr("data-control-classorprojectionid");
        var isprojection = targetEle.attr("data-control-isprojection");
        var multiselect = targetEle.attr("data-control-ismultiselect");
        if (_.isUndefined(multiselect) || _.isNull(multiselect)) {
            //default to false if data-control-ismultiselect is undefined
            multiselect = false;
        } else {
            multiselect = multiselect.toLowerCase();
        }

        // REQUIRED ATTR
        if (targetEle.attr("required")) {
            $('#' + targetId).attr("required", "true");
        }

        // CREATE DEPENDENCY WRAP
        var dependencyInputs = [];
        if (dependencyTargetIds) {
            var dependencyIds = dependencyTargetIds.split(',');
            dependencyIds = dependencyIds.filter(function (e) { return e });

            dependencyInputs = _.map(dependencyIds, function (dependencyId) {

                var element = document.getElementById(dependencyId);
                var $element = $(element);
                var $parents = $(targetEle).parents().has(element).first().find(">div");
                var $controlElement = $("[data-control-valuetargetid='" + dependencyId + "']");
                if (!$controlElement.length) { $controlElement = $element; }
                var attr = $controlElement[0].type || $controlElement.attr("type") || $controlElement.attr("data-control");
                var baseId = $controlElement.attr("data-control-sourceid");

                if (attr === "text") {
                    $element.on("enter", function () {
                        $(this).trigger("change");
                    });
                }

                return {
                    element: element,
                    $element: $element,
                    getValue: function (criteriaTokenType) {
                        if (attr == "checkbox") {
                            return $controlElement.is(":checked").toString();
                        } else if (attr == "checkboxGridByCriteriaOld" || attr == "checkboxGridByCriteria") {
                            var dGrid = $($controlElement[1]).data("kendoGrid");
                            if (!_.isUndefined(dGrid) && dGrid.select().length) {
                                return dGrid.dataItem(dGrid.select())[criteriaTokenType];
                            }
                            return false;
                        } else {
                            return $element.val();
                        }
                    },
                    id: dependencyId,
                    baseId: !_.isUndefined(baseId) ? baseId : $parents.has(element).find('.question-baseid').last().val(),
                    $controlElement: $controlElement
                };
            });
        }

        // DEPENDENCY VALUEs
        var getDependencyValue = function (guid, criteriaTokenType) {
            var input = _.find(dependencyInputs, function (item) {
                return item.baseId === guid;
            });
            if (input) {
                var _tempValue = input.getValue(criteriaTokenType + "_EnumId");
                if (!_.isUndefined(_tempValue)) {
                    return _tempValue;
                }
                else {
                    return input.getValue(criteriaTokenType);
                }
            }

            app.lib.log("getDependencyValue not set");
        }

        // Criteria
        var originalCriteria = $('#' + criteriaid).val();
        var criteria = originalCriteria;
        var setCriteriaValue = function () {
            var xmlCriteria = jQuery.parseXML(originalCriteria);
            var xmlExpressionNode = $(xmlCriteria).find("ValueExpressionRight");
            $.each(xmlExpressionNode, function (i, item) {
                var tokenNode = $(item).find("Token");
                if (tokenNode.length) {
                    //process replace for user-defined tokens
                    if (!_.isUndefined(tokenNode[0].textContent.split("TokenId__")[1])) {
                        // get token type
                        var criteriaTokenType = (tokenNode.length) ? tokenNode[0].textContent.split("TokenId__")[1].split("##")[0] : "";
                        var guid = (tokenNode.length) ? tokenNode[0].textContent.split("#TokenId__")[0].split("TokenSourceId__")[1] : "";

                        // get value
                        var value = getDependencyValue(guid, criteriaTokenType);
                        
                        // set token value
                        if (!value) {
                            $(item).find("Token").remove()
                        } else {
                            $(item).find("Token").replaceWith(value);
                        }
                    }
                }
                else {
                    //process replace scsm preset tokens [me],[mygroup]
                    var valueNodeElement = $(item)[0];
                    var nodeValue = valueNodeElement.textContent;
                    if (nodeValue.indexOf("[me]") >= 0 || nodeValue.indexOf("[mygroup]") >= 0) {
                        var tokenElement = xmlCriteria.createElement("Token");
                        var tokenValue = xmlCriteria.createTextNode(nodeValue);
                        tokenElement.appendChild(tokenValue);

                        valueNodeElement.textContent = "";
                        valueNodeElement.append(tokenElement);
                    }
                }
            });
            
            criteria = (new XMLSerializer()).serializeToString(xmlCriteria);
        }

        var getCriteriaValue = function () {
            return criteria;
        }
        if (originalCriteria != "") {
            setCriteriaValue();
        }
        
        /*********************/
        /*** GRID ************/
        /*********************/

        var columns = $('#' + columnsid).val(); // "title(((:)))name(((;)))title(((:)))name"; 
        var columnNames = [];
        var columnTitles = [];

        $.each(columns.split("(((;)))"), function (i, item) {
            var col = item.split("(((:)))");
            columnNames.push(col[1]);
            columnTitles.push({
                field: col[1],
                title: _.isUndefined(localization[col[1]]) ? col[0] : localization[col[1]]
            });
        });
        columnNames = columnNames.join(',');


        var url = "/Search/GetQueryResultObjectsByCriteria";

        var gridFilterLocalize = {
            messages: {
                info: localization.Showitemswithvaluethat,
                filter: localization.Filter,
                clear: localization.Clear,

                // when filtering boolean numbers
                isTrue: localization.IsTrue,
                isFalse: localization.IsFalse,

                //changes the text of the "And" and "Or" of the filter menu
                and: localization.And,
                or: localization.Or
            },
            operators: {
                //filter menu for "string" type columns
                string: {
                    eq: localization.Isequalto,
                    neq: localization.Isnotequalto,
                    startswith: localization.Startswith,
                    contains: localization.Contains,
                    endswith: localization.EndsWith
                },
                //filter menu for "number" type columns
                number: {
                    eq: localization.Isequalto,
                    neq: localization.Isnotequalto,
                    gte: localization.GreaterOrEqual,
                    gt: localization.GreaterThan,
                    lte: localization.LessOrEqual,
                    lt: localization.LessThan
                },
                //filter menu for "date" type columns
                date: {
                    gte: localization.GreaterOrEqual,
                    gt: localization.GreaterThan,
                    lte: localization.LessOrEqual,
                    lt: localization.LessThan
                },
                //filter menu for foreign key values
                enums: {
                    eq: localization.Isequalto,
                    neq: localization.Isnotequalto,
                }
            }
        };

        var gridSettings = {
            columns: columnTitles,
            pageable: true,
            selectable: true,
            sortable: true,
            reorderable: true,
            resizable: true,
            columnMenu: {
                messages: {
                    columns: localization.ChooseColumns,
                    filter: localization.Filter,
                    sortAscending: localization.SortAscending,
                    sortDescending: localization.SortDescending
                }
            },
            filterable: gridFilterLocalize,
            filterMenuInit: function (e) {
                var firstValueDropDown = e.container.find("select:eq(0)").data("kendoDropDownList");
                firstValueDropDown.value("contains");
                firstValueDropDown.trigger("change");

                var secondValueDropDown = e.container.find("select:eq(2)").data("kendoDropDownList");
                secondValueDropDown.value("contains");
                secondValueDropDown.trigger("change");
            }
        }

        var dataSourceSettings = {
            type: "aspnetmvc-ajax",
            "prefix": "",
            transport: {
                read: {
                    url: url,
                    type: "POST",
                    data: {
                        id: classorprojectionid,
                        isProjection: isprojection,
                        columnNames: columnNames,
                        criteria: getCriteriaValue
                    }
                }
            },
            pageSize: 18,
            page: 1,
            total: 0,
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors"
            },
            serverFiltering: false,
            serverPaging: false
        }
        var dataSource = new kendo.data.DataSource(dataSourceSettings);
        var hasValue = _.all(dependencyInputs, function (item) {
            var value = item.getValue();
            return value !== false && value != "";
        });
        if (!dependencyTargetIds || hasValue) {
            gridSettings.dataSource = dataSource;
        }

        var grid = targetEle.kendoGrid(gridSettings).data("kendoGrid");

        //get and set the preferred datetime culture
        var preferredCulture = $("meta[name='accept-language']").attr("content");
        kendo.culture(preferredCulture);

        //in case of date fields, format them to preferred culture
        grid.bind('dataBinding', function (e) {
            _.each(e.sender.columns, function (column) {
                _.each(e.items, function (item) {
                    var itemValue = item[column.field] || "";
                    //trim white spaces to prevent parsing strings ending with a number as date
                    //var valStr = itemValue.toString().replace(/\s+/, "");
                    //if (Date.parse(valStr) && /^\d+$/.test(valStr) == false && parseFloat(valStr) && moment(valStr).isValid()) {
                    if (moment(itemValue, moment.ISO_8601).isValid() && Date.parse(itemValue)) {
                        item[column.field] = kendo.toString(kendo.parseDate(new Date(itemValue)), "g");
                    }
                });
            });
        });

        // show selected items after paging change
        grid.bind('dataBound', function (e) {
            var selectedItems = getSelectedValues();
            showSelections(selectedItems);
        });

        //select and deselect logic
        targetEle.on("click", "tbody>tr", function (e) {
            var selectedItem = grid.dataItem($(this));
            var selectedId = selectedItem[valuefield];
            var selectedBaseId = selectedItem["BaseId"];
            var selectedDisplayName = selectedItem["DisplayName"];
            var classId = selectedItem["ClassTypeId"];
            //multiselect will == 'false' or 'true', val comes from C# as 'True'/'False'
            //and we .toLowerCase() it when initializing. 


            if (multiselect === 'false') {
                $("input[id='" + targetId + "']").each(function (i, el) {
                    if (selectedId == $(el).val()) {
                        selectedId = "";
                    }
                    $(el).val('');
                });
            }
            updateSelectedItems(selectedId, selectedBaseId, selectedDisplayName, classId, selectedItem);
        });

        var getSelectedValues = function () {
            var val = $('#' + targetId).val();
            return (val && val != "") ? val.split(",") : [];
        }
        var updateSelectedItems = function (id, selectedBaseId, selectedDisplayName, classId, selectedItemFullDetails) {

            var isRemove = false;
            var selectedItems = getSelectedValues();
            var jsonValue = $('#Json' + targetId).val();
            var index = selectedItems.indexOf(id);

            if (index > -1) {
                // remove
                isRemove = true;
                selectedItems.splice(index, 1);
            } else {
                selectedItems.push(id);
            }

            $("input[id='" + targetId + "']").each(function (i, el) {
                $(el).val(selectedItems.join(','));
                $(el).change();
            });

            if (_.isUndefined(selectedBaseId)) { selectedBaseId = id; }

            ////This will used for building the query object selection data
            if (_.isUndefined(jsonValue) || jsonValue == "") {
                jsonValue = [];
                jsonValue.unshift({ Id: id, BaseId: selectedBaseId, DisplayName: selectedDisplayName, ClassTypeId: classId, FullDetails: selectedItemFullDetails});
                $('#Json' + targetId).val(JSON.stringify(jsonValue));
            }
            else {
                jsonValue = JSON.parse(jsonValue);
                var removeList = [];
                for (var i in jsonValue) {
                    if (_.isUndefined(jsonValue[i].BaseId)) { jsonValue[i].BaseId = jsonValue[i].Id; }
                    var val = _.find(selectedItems, function (ths) {
                        return ths == jsonValue[i].BaseId || ths == jsonValue[i].Id;
                    });

                    if (_.isUndefined(val)) {
                        removeList.push(jsonValue[i].BaseId);
                    }
                }

                for (var i in removeList) {
                    var val = _.find(jsonValue, function (ths) {
                        return ths.BaseId == removeList[i];
                    });

                    if (!_.isUndefined(val))
                        jsonValue.splice(jsonValue.indexOf(val), 1);
                }

                var val = _.find(jsonValue, function (ths) {
                    return ths.BaseId == selectedBaseId;
                });

                if (isRemove == false && _.isUndefined(val)) {
                    jsonValue.unshift({ Id: id, BaseId: selectedBaseId, DisplayName: selectedDisplayName, ClassTypeId: classId, FullDetails: selectedItemFullDetails });
                }

                $("input[id='Json" + targetId + "']").each(function (i, el) {
                    $(el).val(JSON.stringify(jsonValue));
                    $(el).change();
                });

                //$('#Json' + targetId).val(JSON.stringify(jsonValue));
                //End This will used for building the query object selection data
            }

            

            showSelections(selectedItems);

        }
        var showSelections = function (selectedItems) {
            targetEle.find('tbody tr').each(function (i, tr) {
                if (selectedItems.indexOf(grid.dataItem($(tr))[valuefield]) > -1) {
                    $(tr).addClass("k-state-selected");
                } else {
                    $(tr).removeClass("k-state-selected");
                }
            }); 
        }

        _.each(dependencyInputs, function (dependencyInput) {
            
            // bind show/hide/read
            dependencyInput.$element.change(function () {

                //reset dependent field value
                if (!_.isUndefined(settings.targetValId) && !_.isNull(settings.targetValId)) {
                    $("input[id='" + settings.targetValId + "']").each(function (i, el) {
                        $(el).val("")
                    });

                }

                if ($(this).val()) {
                    setCriteriaValue();
                    if (!settings.dataSource) {
                        settings.dataSource = dataSource;
                        grid.setDataSource(settings.dataSource);
                    } else {
                        dataSource.read();
                    }

                    //parDivThis.show();
                } else {
                    settings.dataSource = false;
                    grid.setDataSource(new kendo.data.DataSource());
                    //parDivThis.hide();
                }
            });

            dependencyInput.$element.change();
        });

        /***************************/
        /*** GRID SEARCH FILTER ****/
        /***************************/


        // Append Search Filter
        var searchFilter = function (callback, settings) {
            var group = $("<div>", { "class": "searchGroup", style: "width: 300px" });
            var inpWrap = $("<div>", { "class": "searchInput", html: "<span class='k-widget k-combobox'><span class='k-dropdown-wrap' style='border-style: dotted'></span></span>" });
            var input = $("<input>", { "class": "k-input", type: "text", placeholder: localization.Filter });
            var iconWrap = $("<div>", { "class": "searchIcon" });
            var icon = $("<a>", { "class": "search", style: "margin-left: -28px; opacity: .5; top: 5px" });

            inpWrap.find("span > span").append(input);
            iconWrap.append(icon);
            group.append(inpWrap, iconWrap);

            // change functionality from enter and icon click to keyup
            if (settings && settings.showIcon) {
                input.bind("enter", function () {
                    callback(input.val());
                });
                icon.click(function () {
                    callback(input.val());
                    return false;
                });
            } else {
                iconWrap.hide();
                input.keyup(function () {
                    callback(input.val());
                });
            }


            return group;
        }

        var filterGrid = function (searchText) {

            var filters = [];
            $.each(grid.columns, function (key, col) {
                filters.push({
                    field: col.field, operator: "contains", value: searchText
                });
            });

            grid.dataSource.filter({
                logic: "or",
                filters: filters
            });
        }

        // add the search input
        searchFilter(filterGrid).insertBefore(targetEle);
    }

    //console task actions all rely on pageForm app.form object
    this.consoleTaskAssignToMe = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskAssignToMe"); }

        targetEle.click(function () {
            var name = targetEle.attr('data-me-name');
            var id = targetEle.attr('data-me-id');
            var target = targetEle.attr('data-target');

            //clear VM first
            app.controls.forceProp(pageForm.viewModel, "Status", { DisplayName: null, BaseId: null });

            pageForm.viewModel[target].set("DisplayName", name);
            pageForm.viewModel[target].set("BaseId", id);
        });
    }

    this.consoleTaskChangeStatus = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskChangeStatusTask"); }
        var itemType = targetEle.attr('data-control-itemtype');


        targetEle.click(function () {
            var target = targetEle.attr('data-target');
            var requireResolution = false;
            //original values
            var name = pageForm.viewModel.Status.Name;
            var id = pageForm.viewModel.Status.Id;

            //define change rules and states
            var changeRules = new Array();

            //ServiceRequest
            changeRules['ServiceRequest'] = new Array();

            //Submitted
            changeRules['ServiceRequest']['72b55e17-1c7d-b34c-53ae-f61f8732e425'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'b026fdfd-89bd-490b-e1fd-a599c78d440f' },//Completed
                { field: "Id", operator: "eq", value: '72b55e17-1c7d-b34c-53ae-f61f8732e425' }] //Submitted
            };
            //In Progress
            changeRules['ServiceRequest']['59393f48-d85f-fa6d-2ebe-dcff395d7ed1'] = {
                logic: "or",
                filters:
                [{ field: "Id", operator: "eq", value: '674e87e4-a58e-eab0-9a05-b48881de784c' }, //Cancelled
                { field: "Id", operator: "eq", value: '59393f48-d85f-fa6d-2ebe-dcff395d7ed1' }, //In Progress
                { field: "Id", operator: "eq", value: '05306bf5-a6b9-b5ad-326b-ba4e9724bf37' }] //On Hold
            };
            //On Hold
            changeRules['ServiceRequest']['05306bf5-a6b9-b5ad-326b-ba4e9724bf37'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '05306bf5-a6b9-b5ad-326b-ba4e9724bf37' }, //On Hold
                { field: "Id", operator: "eq", value: '674e87e4-a58e-eab0-9a05-b48881de784c' }, //Cancelled
                { field: "Id", operator: "eq", value: '59393f48-d85f-fa6d-2ebe-dcff395d7ed1' }] //In Progress
            };
            //Failed
            changeRules['ServiceRequest']['21dbfcb4-05f3-fcc0-a58e-a9c48cde3b0e'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '21dbfcb4-05f3-fcc0-a58e-a9c48cde3b0e' }, //Failed
                { field: "Id", operator: "eq", value: 'c7b65747-f99e-c108-1e17-3c1062138fc4' }] //Closed
            };
            //Cancelled
            changeRules['ServiceRequest']['674e87e4-a58e-eab0-9a05-b48881de784c'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '674e87e4-a58e-eab0-9a05-b48881de784c' }, //Cancelled
                { field: "Id", operator: "eq", value: 'c7b65747-f99e-c108-1e17-3c1062138fc4' }] //Closed
            };
            //Completed
            changeRules['ServiceRequest']['b026fdfd-89bd-490b-e1fd-a599c78d440f'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'b026fdfd-89bd-490b-e1fd-a599c78d440f' }, //Completed
                { field: "Id", operator: "eq", value: 'c7b65747-f99e-c108-1e17-3c1062138fc4' }] //Closed
            };

            //ChangeRequest
            changeRules['ChangeRequest'] = new Array();

            //Submitted
            changeRules['ChangeRequest']['504f294c-ae38-2a65-f395-bff4f085698b'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '68277330-a0d3-cfdd-298d-d5c31d1d126f' },//Completed
                { field: "Id", operator: "eq", value: '504f294c-ae38-2a65-f395-bff4f085698b' }] //Submitted
            };
            //In Progress
            changeRules['ChangeRequest']['6d6c64dd-07ac-aaf5-f812-6a7cceb5154d'] = {
                logic: "or",
                filters:
                [{ field: "Id", operator: "eq", value: '877defb6-0d21-7d19-89d5-a1107d621270' }, //Cancelled
                { field: "Id", operator: "eq", value: '6d6c64dd-07ac-aaf5-f812-6a7cceb5154d' }, //In Progress
                { field: "Id", operator: "eq", value: 'dd6b0870-bcea-1520-993d-9f1337e39d4d' }] //On Hold
            };
            //On Hold
            changeRules['ChangeRequest']['dd6b0870-bcea-1520-993d-9f1337e39d4d'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'dd6b0870-bcea-1520-993d-9f1337e39d4d' }, //On Hold
                { field: "Id", operator: "eq", value: '877defb6-0d21-7d19-89d5-a1107d621270' }, //Cancelled
                { field: "Id", operator: "eq", value: '6d6c64dd-07ac-aaf5-f812-6a7cceb5154d' }] //In Progress
            };
            //Failed
            changeRules['ChangeRequest']['85f00ead-2603-6c68-dfec-531c83bf900f'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '85f00ead-2603-6c68-dfec-531c83bf900f' }, //Failed
                { field: "Id", operator: "eq", value: 'f228d50b-2b5a-010f-b1a4-5c7d95703a9b' }] //Closed
            };
            //Cancelled
            changeRules['ChangeRequest']['877defb6-0d21-7d19-89d5-a1107d621270'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '877defb6-0d21-7d19-89d5-a1107d621270' }, //Cancelled
                { field: "Id", operator: "eq", value: 'f228d50b-2b5a-010f-b1a4-5c7d95703a9b' }] //Closed
            };
            //Completed
            changeRules['ChangeRequest']['68277330-a0d3-cfdd-298d-d5c31d1d126f'] = {
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: '68277330-a0d3-cfdd-298d-d5c31d1d126f' }, //Completed
                { field: "Id", operator: "eq", value: 'f228d50b-2b5a-010f-b1a4-5c7d95703a9b' }] //Closed
            };

            //Incident
            changeRules['Incident'] = new Array();
            //IncidentStatus_Active = new Guid("5e2d3932-ca6d-1515-7310-6f58584df73e");
            //IncidentStatus_Closed = new Guid("bd0ae7c4-3315-2eb3-7933-82dfc482dbaf");
            // IncidentStatus_Active_Pending = new Guid("b6679968-e84e-96fa-1fec-8cd4ab39c3de");

            //Active
            changeRules['Incident']['5e2d3932-ca6d-1515-7310-6f58584df73e'] = { field: "Id", operator: "neq", value: 'bd0ae7c4-3315-2eb3-7933-82dfc482dbaf' };//NOT Closed

            //Pending
            changeRules['Incident']['b6679968-e84e-96fa-1fec-8cd4ab39c3de'] = { field: "Id", operator: "neq", value: 'bd0ae7c4-3315-2eb3-7933-82dfc482dbaf' };//NOT Closed



            //ReleaseRecord
            changeRules['ReleaseRecord'] = new Array();

            ////Submitted
            //changeRules['ReleaseRecord']['72b55e17-1c7d-b34c-53ae-f61f8732e425'] = { //Submitted
            //    logic: 'or',
            //    filters:
            //    [{ field: "Id", operator: "eq", value: 'b026fdfd-89bd-490b-e1fd-a599c78d440f' },//Completed
            //    { field: "Id", operator: "eq", value: '72b55e17-1c7d-b34c-53ae-f61f8732e425' }] //Submitted
            //};
            //In Progress
            changeRules['ReleaseRecord']['1840bfdc-3589-88a5-cea9-67536fd95a3b'] = {    //In Progress
                logic: "or",
                filters:
                [{ field: "Id", operator: "eq", value: 'a000ff0a-2897-4184-73cb-308f533c0dca' }, //Cancelled
                { field: "Id", operator: "eq", value: '1840bfdc-3589-88a5-cea9-67536fd95a3b' }, //In Progress
                { field: "Id", operator: "eq", value: 'bab68d61-1e58-96ff-9f64-33a530fdaf98' }] //On Hold
            };
            //On Hold
            changeRules['ReleaseRecord']['bab68d61-1e58-96ff-9f64-33a530fdaf98'] = {    //On Hold
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'bab68d61-1e58-96ff-9f64-33a530fdaf98' }, //On Hold
                { field: "Id", operator: "eq", value: 'a000ff0a-2897-4184-73cb-308f533c0dca' }, //Cancelled
                { field: "Id", operator: "eq", value: '1840bfdc-3589-88a5-cea9-67536fd95a3b' }] //In Progress
            };
            //Failed
            changeRules['ReleaseRecord']['f0073e33-fdda-a1ba-cd93-40b7c88afff4'] = {    //Failed
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'f0073e33-fdda-a1ba-cd93-40b7c88afff4' }, //Failed
                { field: "Id", operator: "eq", value: '221155fc-ad9f-1e40-c50e-9028ee303137' }] //Closed
            };
            //Cancelled
            changeRules['ReleaseRecord']['a000ff0a-2897-4184-73cb-308f533c0dca'] = {    //Cancelled
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'a000ff0a-2897-4184-73cb-308f533c0dca' }, //Cancelled
                { field: "Id", operator: "eq", value: '221155fc-ad9f-1e40-c50e-9028ee303137' }] //Closed
            };
            //Completed
            changeRules['ReleaseRecord']['c46ca677-e6c5-afe0-b51e-6aaad1f50e58'] = {    //Completed
                logic: 'or',
                filters:
                [{ field: "Id", operator: "eq", value: 'b026fdfd-89bd-490b-e1fd-a599c78d440f' }, //Completed
                { field: "Id", operator: "eq", value: '221155fc-ad9f-1e40-c50e-9028ee303137' }] //Closed
            };


            //Problem
            changeRules['Problem'] = new Array();

            //Active
            // ProblemStatus_Active = new Guid("720438eb-ba08-1263-0944-6791fcb48991");
            //IncidentStatus_Active_Pending = new Guid("b6679968-e84e-96fa-1fec-8cd4ab39c3de");
            // ProblemStatus_Closed = new Guid("25eac210-e091-8ae8-a713-fea2472f32ff");

            changeRules['Problem']['720438eb-ba08-1263-0944-6791fcb48991'] = { field: "Id", operator: "neq", value: '25eac210-e091-8ae8-a713-fea2472f32ff' };//NOT Closed

            //Pending
            //changeRules['Problem']['b6679968-e84e-96fa-1fec-8cd4ab39c3de'] = { field: "Id", operator: "neq", value: '25eac210-e091-8ae8-a713-fea2472f32ff' };//NOT Closed


            cont = $("#" + target);
            win = cont.kendoCiresonWindow({
                title: localization.ChangeStatusTask,
                width: 400,
                height: 300,
                actions: [],
                activate: function () {
                    //modify status combobox based on type and rules
                    statusCB.dataSource.filter(changeRules[itemType][pageForm.viewModel.Status.Id]);
                    statusTV.dataSource.filter(changeRules[itemType][pageForm.viewModel.Status.Id]);
                }
            }).data("kendoWindow");
            app.controls.apply(cont, { localize: true, vm: pageForm.viewModel, bind: true });

            var statusCB = cont.find("#changeStatusWin").data().handler._dropdown;
            var statusTV = cont.find("#changeStatusWin").data().handler._treeview;


            //bind actions based on type
            if (itemType === 'Incident') {
                //create function to handle dropDownTree selection
                shouldResolution = function (e) {
                    var selectedId = this.dataItem(this.select()).Id; 
                    if (selectedId === '2b8830b6-59f0-f574-9c2a-f4b4682f1681') { //IncidentStatus_Resolved
                        requireResolution = true;
                        cont.find('.resolution').removeClass('hide');
                    } else {
                        requireResolution = false;
                        cont.find('.resolution').addClass('hide');
                    }
                }

                //bimd change
                statusCB.bind("change", shouldResolution);
                statusTV.bind("change", shouldResolution);
            }

            //bind actions based on type
            if (itemType === 'Problem') {
                //create function to handle dropDownTree selection
                shouldResolution = function (e) {
                    var selectedId = this.dataItem(this.select()).Id;
                    if (selectedId === '7ff92b06-1694-41e5-2df7-b4d5970d2d2b') {  //ProblemStatus_Resolved
                        requireResolution = true;
                        cont.find('.resolution').removeClass('hide');
                    } else {
                        requireResolution = false;
                        cont.find('.resolution').addClass('hide');
                    }
                }

                //bimd change
                statusCB.bind("change", shouldResolution);
                statusTV.bind("change", shouldResolution);
            }


            //add controls to window buttons
            $('[data-window-action]').click(function () {
                if ($(this).attr("data-window-action") === "save") {

                    if (requireResolution && (pageForm.viewModel.ResolutionCategory.Id === null)) {
                        cont.find('#changeStatusErrorWin').html(localization.RequestCategoryRequiredError);
                    }
                    else if (pageForm.viewModel.Status.Id === "2b8830b6-59f0-f574-9c2a-f4b4682f1681") { //IncidentStatus_Resolved
                        cont.find('#changeStatusErrorWin').html("");
                        var actionLogType = app.controls.getWorkItemLogType(pageForm.viewModel);

                        if (actionLogType) {
                            pageForm.viewModel[actionLogType].unshift(new app.dataModels[actionLogType].recordResolved(pageForm.viewModel.ResolutionDescription));
                        }

                        win.close();
                    }
                    else {
                        cont.find('#changeStatusErrorWin').html("");

                        win.close();
                    }
                }

                if ($(this).attr("data-window-action") === "cancel") {
                    //reset the viewModel
                    pageForm.viewModel.Status.set("Name", name);
                    pageForm.viewModel.Status.set("Id", id);
                    win.close();
                }
            })

            win.open();

            cont.removeClass('hide');
            cont.show();

        });
    }

    this.consoleTaskAssignToAnalystByGroup = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskAssignToAnalystByGroup"); }

        targetEle.click(function () {
            var assignedName = pageForm.viewModel.AssignedWorkItem.DisplayName;
            var assignedId = pageForm.viewModel.AssignedWorkItem.BaseId;
            var supportName = (typeof (pageForm.viewModel.SupportGroup) != 'undefined') ? pageForm.viewModel.SupportGroup.Name : pageForm.viewModel.TierQueue.Name;
            var supportId = (typeof (pageForm.viewModel.SupportGroup) != 'undefined') ? pageForm.viewModel.SupportGroup.Id : pageForm.viewModel.TierQueue.Id

            target = targetEle.attr('data-target');
            cont = $("#" + target);
            win = cont.kendoCiresonWindow({
                title: localization.AssignToAnalystByGroup,
                width: 400,
                height: 300,
                actions: [],
                activate: function () {
                    app.controls.apply(cont, { localize: true, vm: pageForm.viewModel, bind: true });

                    var groupCB = cont.find("#supportGroupWin").data().handler._dropdown;
                    var groupTV = cont.find("#supportGroupWin").data().handler._treeview;

                    var assignCB = cont.find("#assignedToWin input:last").data("kendoComboBox");

                    //refresh stuff
                    groupCB.value("");
                    assignCB.value("");
                    groupTV.select().find("span.k-state-selected").removeClass("k-state-selected");

                    //create function to handle dropDownTree selection
                    enableAssignCb = function (e) {
                        //overwrite viewModel so we can filter on it
                        if (typeof (pageForm.viewModel.SupportGroup) != 'undefined') {
                            pageForm.viewModel.SupportGroup.set("Name", this.dataItem(this.select()).Text);
                            pageForm.viewModel.SupportGroup.set("Id", this.dataItem(this.select()).Id);
                        } else {
                            pageForm.viewModel.TierQueue.set("Name", this.dataItem(this.select()).Text);
                            pageForm.viewModel.TierQueue.set("Id", this.dataItem(this.select()).Id);
                        }

                        assignCB.enable(true);
                        assignCB.focus();
                        assignCB.value("");
                        assignCB.input.attr("placeholder", localization.ChooseOne);
                        assignCB.dataSource.fetch();
                    }

                    //bind actions
                    groupCB.bind("change", enableAssignCb);

                    groupTV.bind("change", enableAssignCb);

                    assignCB.bind("select", function (e) {
                        //clear them out first
                        pageForm.viewModel.AssignedWorkItem.set("DisplayName", null);
                        pageForm.viewModel.AssignedWorkItem.set("BaseId", null);

                        pageForm.viewModel.AssignedWorkItem.set("DisplayName", assignCB.dataItem(e.item.index()).Name);
                        pageForm.viewModel.AssignedWorkItem.set("BaseId", assignCB.dataItem(e.item.index()).Id);
                    });

                    //add controls to window buttons
                    cont.find('[data-window-action]').click(function () {
                        if ($(this).attr("data-window-action") === "save") {
                            win.close();
                        }

                        if ($(this).attr("data-window-action") === "cancel") {

                            pageForm.viewModel.AssignedWorkItem.set("DisplayName", assignedName);
                            pageForm.viewModel.AssignedWorkItem.set("BaseId", assignedId);

                            if (typeof (pageForm.viewModel.SupportGroup) != 'undefined') {
                                pageForm.viewModel.SupportGroup.set("Name", supportName);
                                pageForm.viewModel.SupportGroup.set("Id", supportId);
                            } else {
                                pageForm.viewModel.TierQueue.set("Name", supportName);
                                pageForm.viewModel.TierQueue.set("Id", supportId);
                            }

                            win.close();
                        }
                    });

                    //show the content
                    groupCB.focus();
                    cont.removeClass('hide');
                    cont.show();
                }
            }).data("kendoWindow");

            win.refresh();
            win.open();
        });
    }

    this.consoleTaskNewStatus = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskNewStatus"); }

        targetEle.click(function () {
            var type = targetEle.attr('data-type');
            var newId = targetEle.attr('data-new-status-id');
            var newName = targetEle.attr('data-new-status-name');
            var msg = targetEle.attr('data-confirm-msg');
            var winTitle = targetEle.attr('data-confirm-title');

            if (targetEle.attr('data-other-bound-changes')) {
                var otherChanges = $.parseJSON(targetEle.attr('data-other-bound-changes'));
            } else {
                var otherChanges = {};
            }


            //original values
            name = pageForm.viewModel.Status.Name;
            id = pageForm.viewModel.Status.Id;

            $.when(kendo.ui.ExtYesNoDialog.show({
                title: winTitle,
                message: msg
            })
            ).done(function (response) {
                if (response.button === "yes") {
                    //set new status
                    pageForm.viewModel.Status.set("Name", newName);
                    pageForm.viewModel.Status.set("Id", newId);

                    //make other changes
                    $.each(otherChanges, function (index, val) {
                        pageForm.viewModel.set(index, val);
                    });

                    //save/apply the current changes
                    pageForm.save(function (data) {
                        app.lib.message.add(localization.ChangesApplied, "success");
                        app.lib.message.show();
                        setTimeout(function () {
                            $('html, body').animate({
                                scrollTop: 0
                            }, 300);
                        }, 100);

                        //reset status
                        pageForm.handleStatus();
                    });
                } else {
                    //reset the viewModel
                    pageForm.viewModel.Status.set("Name", name);
                    pageForm.viewModel.Status.set("Id", id);
                }
            });

        });
    }

    this.actionLog = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.actionLog"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.actionLog"); }

        // actionLogViewModel
        var maxCommentLength = 4000;
        var actionLogModel = [];
        var mentionedUsers = [];
        var textareaEditorId = (!app.isMobileDevice()) ? '#commentBoxEditor' : '#commentBoxEditorMobile';
        var _vm = kendo.observable({
            isPrivate: false,
            isAnalyst: (session.user.Analyst == 1),
            addEnabled: false,
            charactersRemaining: maxCommentLength,
            addComment: function () {
                
                var isAffectedUser = false;
                //affected user not applicable on all WIs, need to check obj first then compare
                if (!_.isUndefined(boundObj.RequestedWorkItem)) {
                    isAffectedUser = session.user.Id == boundObj.RequestedWorkItem.BaseId;
                }

                var commentText = _vm.commentBoxText;

                mentionedUsers = _.map(mentionedUsers, function (el) {
                    return el.email;
                });

                var getEnteredBy = function () {
                    return session.user.Name;
                }
                if (commentText.length) {
                    var newRow = {
                        EnteredBy: getEnteredBy(),
                        Title: (_vm.isAnalyst) ? localization.Analyst + " " + localization.Comment : localization.EndUser + " " + localization.Comment,
                        IsPrivate: _vm.isPrivate,
                        EnteredDate: new Date().toISOString(),
                        LastModified: new Date().toISOString(),
                        Description: commentText,
                        DescriptionDisplay: app.lib.htmlEntities(commentText),
                        Image: (_vm.isPrivate) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                        ActionType: (_vm.isAnalyst) ? "AnalystComment" : "EndUserComment",
                        MentionedUsers: _.uniq(mentionedUsers),
                        DescriptionHTML: encodeURIComponent(_vm.commentBoxHTML)
                    }
                    actionLogModel.unshift(newRow);
                    mentionedUsers = [];

                    //reset the form values
                    var iframe = targetEle.find(textareaEditorId).prev()[0];
                    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                    $($(innerDoc).find('body')[0]).text('');
                    _vm.set("commentBoxText", "");
                    _vm.set("commentBoxHTML", "");
                    _vm.set("charactersRemaining", maxCommentLength);
                    _vm.set("isPrivate", false);
                    boundObj.set("commentDirty", false);
                    _vm.set("actionLogSource", actionLogModel);

                   

                    //save/apply comment when auto save is enabled
                    var isAutoSaveEnabled = app.featureSet.isActive("AutoSaveActionLogComments") && (session.user.Analyst ? session.consoleSetting.EnableAutoSaveCommentsForAnalyst : session.consoleSetting.EnableAutoSaveCommentsForEndUser);
                    if (isAutoSaveEnabled) {
                        pageForm.saveActionCommentLog(function (data) {
                            var actionLogCommentSaveLabel = $('.actionlog-saveComment');
                            _.defer(function () {
                                actionLogCommentSaveLabel.html(localization.Saved + "!")
                                actionLogCommentSaveLabel.first().show();
                                actionLogCommentSaveLabel.first().fadeOut(5000);
                            });
                        });
                    }
                }

                _vm.set("addEnabled", false);
            },
            isDesktop: !app.isMobileDevice(),
            isMobile: app.isMobileDevice(),
            actionLogSource: [],
            notArchived: typeof (boundObj.CiresonAnalyticsArchive) == 'undefined' || !boundObj.CiresonAnalyticsArchive
        });
        if (pageForm.viewModel.isDisabled) {
            _vm.addEnabled = false;
        }

        kendo.bind(targetEle, _vm);

        var elem = targetEle.find(textareaEditorId);

        var checkCharacterLimit = _.debounce(function (e) {

            var editor = $("#commentBoxEditor").data("kendoEditor");
            var editorContent = (editor.body.innerText || editor.body.textContent);
            if (editorContent.length !== 0) {
                _vm.set("addEnabled", true);
                if (editorContent.length > maxCommentLength) {
                    _vm.set("commentBoxText", editorContent.substring(0, maxCommentLength));
                    var truncatedText = $('<div />').text(editorContent.substring(0, maxCommentLength)).html().replace(/(?:\r\n|\r|\n)/g, '<br>');
                    _vm.set("commentBoxTextHTML", truncatedText);
                    editor.value('<div>' + truncatedText + '</div>');
                    _vm.set("charactersRemaining", 0);
                    var range = editor.getRange() || editor.createRange();
                    range.selectNodeContents(editor.body);
                    range.collapse(false); //collapse to end
                    editor.selectRange(range);
                } else {
                    _vm.set("charactersRemaining", maxCommentLength - editorContent.length);
                }
            } else {
                _vm.set("addEnabled", false);
                _vm.set("charactersRemaining", maxCommentLength);
            }

            //if we have a comment set the comment dirty flag
            if (editorContent.length > 0) {
                //we have a comment which has not been submitted
                boundObj.set("commentDirty", true);//this will in turn set the isDirty flag
            } else {
                boundObj.set("commentDirty", false);
            }
        }, 50);

        var editor = elem.data("kendoEditor");
        if (!_.isUndefined(editor)) { return; }
        editor = elem.kendoEditor({
            pasteCleanup: {
                css: true,
                keepNewLines: true,
                msAllFormatting: true,
                msConvertLists: true,
                msTags: true,
                span: false
            },
            change: function (e) {
                var content = e.sender.body.innerText || e.sender.body.textContent;
                _vm.set("commentBoxText", content);
            },
            //custom tools to hide toolbar
            tools: [
                { name: "insertLineBreak", shift: true },
                { name: "insertParagraph", shift: true },

            ],
            stylesheets: ["/Content/Styles/cireson.mentions-in-keditor.min.css"],
            encoded: true,
            paste: function (e) { e.html = $("<div />").text(e.html.replaceAll("&", "&amp;")).text().replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/(?:\t)/g, '&nbsp;'); checkCharacterLimit(e) },
            keyup: checkCharacterLimit
        });

        if (session.enableMentionFunctionality) {
            if (!(session.user.Analyst != 1 && !session.consoleSetting.EnableEndUserMentionFunctionality)) {
                $.get("/api/V3/User/GetUserListByFilteredDomain",
                { fetchAll: true },
                function (data) {

                    var names = $.map(data,
                        function (value, i) {
                            return { 'id': i, 'name': value.Name, 'guid': value.Id, 'email': value.Email };
                        });

                    var at_config = {
                        at: "@",
                        data: names,
                        headerTpl: '<div class="atwho-header">Search Users</small></div>',
                        insertTpl: '${atwho-at}${name}',
                        displayTpl: "<li id='${guid}'> ${name} <br><span>${email}</span> </li>",
                        limit: 5,
                        startWithSpace: false,
                        editableAtwhoQueryAttrs: {}
                    }

                    var iframe = editor.prev()[0];
                    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

                    $inputor = $(innerDoc).find('body').atwho(at_config);
                    $inputor.caret('pos', 47);
                    $inputor.atwho('run');

                    $inputor.on("inserted.atwho",
                        function (event, $li) {
                            var iframe = editor.prev()[0];
                            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                            var val = $($(innerDoc).find('body')[0]).text();
                            if (val.trim().length != 0) {
                                if (val.length > maxCommentLength) {
                                    _vm.set("commentBox", val.substring(0, maxCommentLength));
                                } else {
                                    _vm.set("charactersRemaining", maxCommentLength - val.length);
                                }
                            } else
                                _vm.set("charactersRemaining", maxCommentLength);

                            //if we have a comment set the comment dirty flag
                            if (val.length > 0) {
                                //we have an unsubmitted comment
                                boundObj.set("commentDirty", true); //this will inturn set the is Dirty flag
                            } else {
                                boundObj.set("commentDirty", false);
                            }

                            var userId = $($li)[0].id;

                            var user = _.filter(data,
                                function (el) {
                                    return el.Id === userId;
                                });

                            user = user[0];

                            if (mentionedUsers.indexOf(user.Email) === -1) {
                                mentionedUsers.push({
                                    email: user.Email,
                                    baseid: user.Id,
                                    name: user.Name
                                });
                            }

                        });

                    $(document).on("removed.atwho",
                        function (e) {
                            _.defer(function () {
                                var isUserNotMentioned = $inputor.text().indexOf(e.removedAtWhoName) == -1;
                                if ($(iframe).is($(e.target.activeElement)) && isUserNotMentioned) {
                                    var userId = e.removedAtWhoId;
                                    var user = _.filter(data,
                                        function (el) {
                                            return el.Id === userId;
                                        });

                                    user = user[0];

                                    mentionedUsers = _.filter(mentionedUsers,
                                        function (el) {
                                            return el.baseid !== user.Id;
                                        });
                                }
                            });
                        });
                });
            }
        }

        
        /*********************************************/
        /*** BoundObj MUTATION,  ********/ // no bueno
        /*********************************************/

        // DETERMINE LOG TYPE FOR DATA MUTATION :((( | Discuss: ActionLog data inconsistancies
        var logType = app.controls.getWorkItemLogType(boundObj);
        var mutateBoundObj = function () {

            actionLogModel = boundObj.get(logType);

            var setImageProp = function (item) {
                var icon;
                // set normal comments
                if (typeof item.ActionType == "string" || typeof item.ActionType == "undefined") {
                    icon = (item.IsPrivate) ? app.config.icons["privateComment"] : app.config.icons["comment"];
                }
                else if (item.ActionType.Id && app.config.icons[item.ActionType.Id]) {
                    icon = app.config.icons[item.ActionType.Id];
                } else {
                    icon = app.config.icons["taskDefault"];
                }
                item.set("Image", app.config.iconPath + icon);
               
            }
            actionLogModel.sort(function(a, b){
                return new Date(b.EnteredDate) - new Date(a.EnteredDate);
            });
            $.each(actionLogModel, function (i, item) {
                if (!item.Description) {
                    item.set('Description', item.Comment);
                } else if (!item.Comment) {
                    item.set('Comment', item.Description);
                }

                //encode html special chars
                item.set('DescriptionDisplay', app.lib.htmlEntities(item.Description));

                //hard code titles for Analyst & User Comments
                if (!item.Title) {
                    if (item.ClassName === "System.WorkItem.TroubleTicket.AnalystCommentLog") {
                        item.set('Title', localization.AnalystComment);
                    } else if (item.ClassName === "System.WorkItem.TroubleTicket.UserCommentLog") {
                        item.set('Title', localization.EndUserComment);
                    }
                }

                //set undefined properties from billable time (previous version)
                if (item.ClassName == "System.WorkItem.BillableTime") {
                    if (_.isUndefined(item.Title)) { item.set('Title', null);}
                    if (_.isUndefined(item.Description)) { item.set('Description', null); }
                    if (_.isUndefined(item.EnteredBy)) { item.set('EnteredBy', null); }
                    if (_.isUndefined(item.EnteredDate)) { item.set('EnteredDate', null); }
                }

                if (!item.ActionType) {
                    ActionType = "";
                }

                setImageProp(item);
            });
        }
        mutateBoundObj();
        _vm.set("actionLogSource", actionLogModel);

        /**************************************/
        /**** GRID ****************************/
        /**************************************/

        var ActionLogGrid = function (gridEle, settings) {

            var gridEle = targetEle.find("[data-control-grid]");
            var data = settings.data;
            var commentTemplate = settings.commentTemplate;
            var isAnalyst = _vm.isAnalyst;
            var grid;
            var gridSettings;
            var dataSource;
            var columns;

            var init = function () {
                createGrid();
                createExpander();
                if (!isAnalyst) {
                    grid.hideColumn("IsPrivate");
                    grid.tbody.find("tr").each(function () {
                        if (grid.dataItem($(this)).IsPrivate) {
                            $(this).hide();
                        }
                    });
                }
            }

            if (_.isUndefined(session.features)) {
                app.featureSet.initList();
            }

            var isAutoSaveEnabled = app.featureSet.isActive("AutoSaveActionLogComments") && (session.user.Analyst ? session.consoleSetting.EnableAutoSaveCommentsForAnalyst : session.consoleSetting.EnableAutoSaveCommentsForEndUser);
            var actionLogDateTemplate = "#= (EnteredDate) ? kendo.toString(new Date(EnteredDate), 'g'):'' #  #=\"\u003ci class='fa fa-check actionlog-saveComment' title='Save'\u003e\" #";
            if (app.featureSet.isActive("EditActionLogComments") && !isAutoSaveEnabled) {
                actionLogDateTemplate = "#= (EnteredDate) ? kendo.toString(new Date(EnteredDate), 'g'):'' # #= ((ActionType) && (ActionType=='AnalystComment' || ActionType=='EndUserComment')) ?  \"\u003ci class='fa fa-pencil actionlog-editComment pull-right' title='Edit'\u003e\" : '' # ";
            }

           

            // COLUMNS
            columns = [{
                "title": (localization) ? localization.Type : "Type",
                "attributes": {
                    "style": "vertical-align: middle; text-align: center"
                },
                "width": "20px",
                "template": "\u003cimg style =\u0027margin-top:5px;\u0027 src=\u0027#:data.Image#\u0027 alt=\u0027#:data.Image#\u0027 /\u003e",
                "field": "Image",
                "filterable": {},
                "encoded": true
            }, {
                "title": (localization) ? localization.Title : "Title",
                "width": "240px",
                "field": "Title",
                "filterable": {},
                "encoded": true
            }, {
                "title": (localization) ? localization.IsPrivate : "Is Private",
                "width": "120px",
                "template": "#= (IsPrivate==true) ? localization.True : (IsPrivate==false)? localization.False:'' #",
                "field": "IsPrivate",
                "filterable": {},
                "encoded": true
            }, {
                "title": (localization) ? localization.CreatedBy : "Created By",
                "width": "120px",
                "width": "120px",
                "field": "EnteredBy",
                "filterable": {},
                "encoded": true
                },
                {
                "title": (localization) ? localization.LastModified : "Last Modified",
                "width": "120px",
                "field": "EnteredDate",
                "type": "date",
                    "template": actionLogDateTemplate,
                "filterable": {},
                "encoded": true
                }
            ];

            // DATASOURCE
            dataSource = new kendo.data.DataSource({
                "data": data,
                filter: [{ field: "ClassName", operator: "neq", value: "System.WorkItem.BillableTime" }],
                change: function (e) {
                    var data = this.data();

                    //make sure we have a Description Display Value
                    if (data.length) {
                        _.each(data, function (val, key) {
                            val.DescriptionDisplay = app.lib.htmlEntities(val.Description);
                            if (_.isUndefined(val.IsPrivate)) {
                                val.IsPrivate = null;
                            }
                        });
                    }
                }
            });
            
            // GRID SETTINGS

            gridSettings = {
                columns: columns,
                dataBinding: function (arg) {
                    _.defer(function () {
                        //This will create edit button functionality.
                        var grid = $('div[data-control-grid="actionLogGrid"]');
                        var editComment = grid.find(".actionlog-editComment");
                        var queryStr = app.lib.getQueryParams();

                        editComment.unbind();
                        editComment.each(function () {
                            var item = grid.data("kendoGrid").dataItem($(this).closest("tr"));
                            
                            if (_.isUndefined(item.BaseId)) {
                                $(this).show();
                            }

                        });

                        if (queryStr != false) { 
                            //This will expand the specific comment for user story 25269
                            grid.find(".k-i-expand").each(function () {
                                var _this = $(this);
                                var item = grid.data("kendoGrid").dataItem(_this.closest("tr"));
                                if (item.BaseId == queryStr.commentid) {
                                    $(this).click();
                                    $('html, body').animate({
                                        scrollTop: _this.offset().top
                                    }, 1000);
                                }
                            });
                        }

                        editComment.click(function () {
                            var row = $(this).closest("tr");
                            var item = grid.data("kendoGrid").dataItem(row);
                            _vm.set("addEnabled", true);
                            _vm.set("commentBoxText", item.DescriptionDisplay);
                            _vm.set("commentBoxHTML", item.DescriptionDisplay.replace(/\n/g, '<br>'));
                            _vm.set("isPrivate", item.IsPrivate);
                            grid.data("kendoGrid").removeRow(row);

                            var editor = $("#commentBoxEditor").data("kendoEditor");
                            if (!_.isUndefined(editor)) { 
                                editor.exec("inserthtml", { value: "" });
                            }

                        });
                    });
                    
                },
                dataSource: dataSource,
                detailTemplate: kendo.template(commentTemplate),
                scrollable: false,
            }



            // CREATE GRID
            var createGrid = function () {
                grid = gridEle.kendoGrid(gridSettings).data('kendoGrid');
            }

            // EXPANDER BUTTON

            var createExpander = function () {
                var expander = $('<a class="k-icon k-plus k-i-expand" href="#" tabindex="-1"></a>');
                grid.thead.find("th:first-child").html(expander);


                expander.click(function () {
                    if ($(this).hasClass("k-plus")) {
                        $(this).removeClass("k-plus");
                        $(this).removeClass("k-i-expand");
                        $(this).addClass("k-minus");
                        $(this).addClass("k-i-collapse");
                        grid.table.find("tbody td:first-child a").not(".k-minus").trigger("click");
                        grid.table.find("tbody td:first-child a").not(".k-i-collapse").trigger("click");
                    } else {
                        $(this).removeClass("k-minus");
                        $(this).removeClass("k-i-expand");
                        $(this).addClass("k-plus");
                        $(this).addClass("k-i-expand");
                        grid.table.find("tbody td:first-child a").not(".k-plus").trigger("click");
                        grid.table.find("tbody td:first-child a").not(".k-i-expand").trigger("click");
                    }
                    return false;
                });
            }

            // END

            init();
        }

        var actionLogGrid = new ActionLogGrid(targetEle.find('[data-control-grid="actionLogGrid"]'), {
            commentTemplate: targetEle.find('[data-id="commentDetailTemplate"]').html(),
            data: actionLogModel
        });
        return actionLogGrid;
    }

    //this.childWorkItems = function (targetEle, boundObj, name) {
    //    if (!targetEle) { app.controls.exception("targetEle missing - controls.childWorkItems"); }
    //    if (!boundObj) { app.controls.exception("boundObj missing - controls.childWorkItems"); }
    //    if (!name) { app.controls.exception("name missing - controls.actionLog"); }

    //    // Determine if group should be visible (IsParent)
    //    var showProp = targetEle.attr("data-control-show");
    //    if (boundObj[showProp] === false) {
    //        targetEle.parents(".row").hide();
    //        return false;
    //    }

    //    // Mutate poorly structured provided data
    //    that.forceProp(boundObj, name, []);
    //    $.each(boundObj[name], function (i, item) {
    //        if (!item.AssignedWorkItem) {
    //            item.AssignedWorkItem = { Id: null, DisplayName: null }
    //            app.lib.log("ChildWorkItem.AssignedWorkItem was added to viewModel dynamically from controls");
    //        }
    //    });


    //    // ViewModel
    //    var _vm = kendo.observable({
    //        searchPlaceholder: localization.SearchChildWorkItem,
    //        searchText: "",
    //        searchClick: function () {
    //            var val = _vm.searchText;
    //            grid.data("kendoGrid").dataSource.filter({
    //                logic: "or",
    //                filters: [
    //                    {
    //                        field: "Id",
    //                        operator: "contains",
    //                        value: val
    //                    },
    //                    {
    //                        field: "Title",
    //                        operator: "contains",
    //                        value: val
    //                    },
    //                    {
    //                        field: "Status.Name",
    //                        operator: "contains",
    //                        value: val
    //                    },
    //                    {
    //                        field: "AssignedWorkItem.DisplayName",
    //                        operator: "contains",
    //                        value: val
    //                    }
    //                ]
    //            });
    //        }
    //    });
    //    kendo.bind(targetEle, _vm);



    //    /**************************************/
    //    /**** GRID ****************************/
    //    /**************************************/

    //    var gridEle = targetEle.find("[data-control-grid]");
    //    var grid = gridEle.kendoGrid({
    //        scrollable: true,
    //        sortable: true,
    //        pageable: true,
    //        selectable: "row",//""multiple row"",
    //        filterable: true,
    //        columnMenu: {
    //            messages: {
    //                columns: localization.ChooseColumns,
    //                filter: localization.Filter,
    //                sortAscending: localization.SortAscending,
    //                sortDescending: localization.SortDescending
    //            }
    //        }

    //         , dataSource: { data: boundObj[name], pageSize: 10 }
    //         , columns:
    //             [
    //               { field: "Id", title: localization.Id }
    //             , { field: "Title", title: localization.Title }
    //             , { field: "Status.Name", title: localization.Status }
    //             , { field: "AssignedWorkItem.DisplayName", title: localization.AssignedTo }
    //             , { field: "BaseId", title: "BaseId", hidden: "true" }
    //             ]
    //    });

    //    return grid;
    //}

    this.userInputs = function (targetEle, boundObj, name) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.userInputs"); }
        if (!boundObj) { app.controls.exception("boundObj missing - controls.userInputs"); }
        if (!name) { app.controls.exception("name missing - controls.userInputs"); }

        var inputs = new Array();
        var userInputs = [];
        if (boundObj[name] != null) {
            // warning: json is wierd. pageForm.viewModel.UserInput.UserInputs will eq
            //  .UserInput (Single Object) if there is only one userinput
            //  or
            //  .UserInput (Object Array) if there are 2+ user inputs
            var prop = pageForm.viewModel.UserInput.UserInputs.UserInput;
            // Check what kind of object we are dealing with
            if (!_.isUndefined(prop)) {
                if (prop.length) { // _.isArray() was returning false for some reason -DS
                    userInputs = boundObj.UserInput.UserInputs.UserInput;
                } else if (_.isObject(prop)) { // will return true for arrays and functions, but an array would be caught above
                    userInputs.push(prop);
                }
            }
        }

        //stupid json is not consistent if there is only one input it returns it not in array
        //if there are multi it returns them in an array, and sets a length property
        //if (typeof (boundObj.UserInput.UserInputs.UserInput.Question) != 'undefined') {
        //    // we only have one user input
        //    numInputs = 1;
        //    var userInputs = [boundObj.UserInput.UserInputs.UserInput];
        //} else if (typeof (boundObj.UserInput.UserInputs.UserInput.length) != 'undefined') {
        //    numInputs = boundObj.UserInput.UserInputs.UserInput.length;
        //    var userInputs = boundObj.UserInput.UserInputs.UserInput;
        //}

        for (var i = 0; i < userInputs.length; i++) {

            var question = userInputs[i]['Question'];
            var answer = userInputs[i]['Answer'];

            var obj = new Object();
            obj.Answer = "";
            obj.Question = question;

            if (userInputs[i]['Type'] === "enum") {
                app.lib.getEnumDisplayName(answer, function(data) {
                    obj.Answer = data;
                });
            } else if (typeof (answer) === 'object') {
                obj.Answer = app.lib.getQueryResultDisplayText(userInputs[i]);
            } else if (userInputs[i]['Type'] === "datetime") {
                obj.Answer = answer;
            } else {
                obj.Answer = answer;
            }

            inputs.push(obj);

        }

        /**************************************/
        /**** GRID ****************************/
        /**************************************/

        var gridEle = targetEle.find("[data-control-grid]");
        var grid = gridEle.kendoGrid({
            columns: [{
                "field": "Question",
                "encoded": false
            }, {
                "field": "Answer",
                "encoded": false
            }],
            dataSource: inputs,
            toolbar: {
                name: 'Test'
            }
        });
        gridEle.find('.k-grid-header').hide();
        return grid;
    };

    this.consoleTaskConvertOrRevertToParent = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskConvertOrRevertToParent"); }

        targetEle.click(function () {
            var msg = targetEle.attr('data-confirm-msg');
            var winTitle = targetEle.attr('data-confirm-title');
            var newIsParentValue = targetEle.attr("data-new-isparent-value").toLowerCase() == "true" ? true : false;

            $.when(kendo.ui.ExtYesNoDialog.show({
                title: winTitle,
                message: msg
            })).done(function (response) {
                if (response.button === "yes") {
                    pageForm.viewModel.IsParent = newIsParentValue;
                    if (!newIsParentValue) {
                        if (pageForm.viewModel.ChildWorkItem != null) {
                            delete pageForm.viewModel.ChildWorkItem;
                        }
                    }
                    pageForm.setIsDirty(true);

                    //save/apply the current changes
                    pageForm.save(function (data) {
                        app.lib.message.add(localization.ChangesApplied, "success");
                        app.lib.message.show();
                        setTimeout(function () {
                            $('html, body').animate({
                                scrollTop: 0
                            }, 300);
                        }, 100);

                        if ($("#childWorkItemGrid").data("kendoGrid")) {
                            that.forceProp(pageForm.viewModel, "ChildWorkItem", []);
                            $("#childWorkItemGrid").data("kendoGrid").dataSource.data(pageForm.viewModel.ChildWorkItem);
                        }
                        pageForm.handleConvertLinkToParentVisibility();
                    });
                } else {
                }
            });

        });
    }

    this.consoleTaskLinkToParent = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskLinkToParent"); }

        targetEle.click(function () {
            var target = targetEle.attr('data-target');
            cont = $("#" + target);
            win = cont.kendoCiresonWindow({
                title: localization.LinktoNewParentIncident,
                width: 600,
                height: 300,
                actions: []
            }).data("kendoWindow");
            app.controls.apply(cont, { localize: true, vm: pageForm.viewModel, bind: true });

            $('[data-window-action]').click(function() {
                if ($(this).attr("data-window-action") === "save") {
                    var grid = cont.find('.parentGrid').data("kendoGrid");
                    var selectedRow = grid.dataItem(grid.select());

                    if (!selectedRow)
                        return;

                    if (pageForm.viewModel.ParentWorkItem == null) {
                        that.forceProp(pageForm.viewModel, "ParentWorkItem", {});
                    }

                    pageForm.viewModel.ParentWorkItem.BaseId = selectedRow.BaseId;
                    pageForm.viewModel.ParentWorkItem.Id = selectedRow.Id;
                    pageForm.viewModel.ParentWorkItem.Title = selectedRow.Title;

                    pageForm.setIsDirty(true);

                    pageForm.view.buildParentHeaderView();

                    win.close();
                }

                if ($(this).attr("data-window-action") === "cancel") {
                    win.close();
                }
            });

            win.open();

            cont.removeClass('hide');
            cont.show();

            kendo.ui.progress(cont.find('.parentGrid'), true);
            $.get("/Incident/GetParentIncidents", {}, function (dataSource) {
                kendo.ui.progress(cont.find('.parentGrid'), false);
                cont.find('.parentGrid').kendoGrid({
                    scrollable: true,
                    sortable: true,
                    pageable: true,
                    selectable: "row",//""multiple row"",
                    filterable: true,
                    columnMenu: {
                        messages: {
                            columns: localization.ChooseColumns,
                            filter: localization.Filter,
                            sortAscending: localization.SortAscending,
                            sortDescending: localization.SortDescending
                        }
                    }

              , dataSource: { data: dataSource, pageSize: 10 }
              , columns:
                  [
                    { field: "Id", title: localization.Id }
                  , { field: "Title", title: localization.Title }
                  , { field: "Status", title: localization.Status }
                  , { field: "BaseId", title: "BaseId", hidden: "true" }
                  ]
                });
            });

        });

    }

    this.consoleTaskAcknowledgeIncident = function (targetEle, settings) {
        if (!targetEle) { app.controls.exception("targetEle missing - controls.consoleTaskAcknowledgeIncident"); }

        targetEle.click(function () {
            var target = targetEle.attr('data-target');
            cont = $("#" + target);

            var now = new Date;

            var minuteString = (now.getMinutes() < 10) ? "0" + now.getMinutes() : now.getMinutes();
            var hourString = (now.getHours() > 11) ? "0" + (now.getHours() - 12) : "0" + now.getHours();
            var amPm = (now.getHours() > 11) ? "PM" : "AM";

            var time_now = hourString + ":" + minuteString + " " + amPm;
            var date_now = now.toLocaleDateString() + " " + time_now;
            var acknowledgementDate = localization.AcknowledgementTime + " : " + date_now;

            //reset values for time and character count
            cont.find("#lblAcknowledgeTime").text(acknowledgementDate);
            $("#remainingText").html("4000");

            win = cont.kendoCiresonWindow({
                title: localization.Acknowledge,
                width: 600,
                height: 300,
                actions: []
            }).data("kendoWindow");
            app.controls.apply(cont, { localize: true, vm: pageForm.viewModel, bind: true });

            $('[data-window-action]').click(function() {
                var getEnteredBy = function() {
                    return session.user.Domain + "\\" + session.user.UserName;
                }

                if ($(this).attr("data-window-action") === "save") {
                    var commentMessage = $("#ActionLogComment").val();
                    var isPrivate = $('#IsPrivate').is(':checked');

                    if (pageForm.viewModel.FirstResponseDate == null) {
                        pageForm.viewModel.FirstResponseDate = new Date().toISOString();
                    }

                    if (commentMessage.length) {
                        var newActionLog = {
                            EnteredBy: getEnteredBy(),
                            Title: localization.Analyst + " " + localization.Comment,
                            IsPrivate: isPrivate,
                            EnteredDate: new Date().toISOString(),
                            LastModified: new Date().toISOString(),
                            Description: commentMessage,
                            DescriptionDisplay: commentMessage,
                            Image: (isPrivate) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                            ActionType: "AnalystComment"
                        }
                        if (!pageForm.viewModel.ActionLog) {
                            that.forceProp(pageForm.viewModel, "ActionLog", []);
                        }
                        var actionLogType = app.controls.getWorkItemLogType(pageForm.viewModel);

                        if (actionLogType) {
                            pageForm.viewModel[actionLogType].push(newActionLog);
                        }
                        
                        $("#ActionLogComment").val("")
                        $("#IsPrivate").prop('checked', false);
                    }

                    win.close();
                }

                if ($(this).attr("data-window-action") === "cancel") {
                    $("#ActionLogComment").val("")
                    $("#IsPrivate").prop('checked', false);
                    win.close();
                }
            });


            win.open();
            win.center();

            cont.removeClass('hide');
            cont.show();
        });
    }

    this.ManualActivityCommentDialog = {
        show: function (options) {
            return new $.Deferred(function (deferred) {
                that.getTemplate("activity-comment-window.html", function (template) {

                    if (!$("#commentWindow").length)
                        $(document.body).append(template);

                    var cont = $("#commentWindow");

                    win = cont.kendoCiresonWindow({
                        title: options.title || localization.Comments,
                        width: 500,
                        height: 350,
                        actions: ["Close"]
                    }).data("kendoWindow");

                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        comment: "",
                        commentMessage: options.message || localization.DoYouHaveComments,
                        okText: localization.Save,
                        cancelText: localization.Cancel,
                        okEnabled: !options.required,
                        charactersRemaining: options.charactersRemaining,
                        charactersRemainingText: localization.CharactersRemaining,
                        textCounter: function () {
                            var maximumLength = options.charactersRemaining;
                            var val = this.comment.length;

                            (val > maximumLength) ? this.set("comment", this.comment.substring(0, maximumLength)) : this.set("charactersRemaining", maximumLength - val);
                            (val > 0 || !options.required) ? this.set("okEnabled", true) : this.set("okEnabled", false);
                        },
                        okClick: function () {
                            win.close();
                            deferred.resolve({ button: "yes", input: this.comment });
                        },
                        cancelClick: function () {
                            win.close();
                            deferred.resolve({ button: "no" });
                        }
                    });

                    kendo.bind(cont, _vmWindow);

                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }, { apply: false });
            });
        }
    }

    this.ReviewDecisionCommentDialog = {
        show: function (options) {
            return new $.Deferred(function (deferred) {
                that.getTemplate("activity-comment-window.html", function (template) {

                    if(!$("#commentWindow").length)
                        $(document.body).append(template);

                    var cont = $("#commentWindow");

                    win = cont.kendoCiresonWindow({
                        title: options.title || localization.Comments,
                        width: 500,
                        height: 350,
                        actions: ["Close"]
                    }).data("kendoWindow");

                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        comment: "",
                        commentMessage: options.message || localization.DoYouHaveComments,
                        okText: localization.Yes,
                        cancelText: localization.No,
                        okEnabled: false,
                        charactersRemaining: "255",
                        charactersRemainingText: localization.CharactersRemaining,
                        textCounter: function () {
                            var maximumLength = 255;
                            var val = this.comment.length;

                            (val > maximumLength) ? this.set("comment", this.comment.substring(0, maximumLength)) : this.set("charactersRemaining", maximumLength - val);
                            (val > 0) ? this.set("okEnabled", true) : this.set("okEnabled", false);
                        },
                        okClick: function () {
                            win.close();
                            deferred.resolve({ button: "yes", input: this.comment });
                        },
                        cancelClick: function () {
                            win.close();
                            deferred.resolve({ button: "no" });
                        }
                    });

                    kendo.bind(cont, _vmWindow);

                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }, { apply: false });
                
                
            });
        }
    };

}




app.controls = new app.controls();

/**
    Form Class: used to encapsulate form functions for kendo binding
                button handling, isDirty Flag and saving.
            
            ########
            # args #
            ########
            settings = {
                saveUrl: '',
                jsonRaw: original Json,
				extensionFieldsRaw: ExtensionFields Json,
                onBeforeInit: function(self){}
            }
            ###############################
            # public properties / Methods #
            ###############################
            form.setIsDirty(bool); // sets isDirty value
            form.isDirty(); // return isDirty value
            form.bind("onDirtyChange", function(){}); // listen to dirty event
            form.save(callback); // calls save
            form.ca
            form.disableForm()
            form.shouldDisable(viewModel)
            form.handleStatus()

    */
app.Form = function (settings) {
    var that = this;

    var isDirty;
    this.settings = settings;
    this.jsonRaw;
    this.viewModel;
    this.formId;
    this.formEle;


    // initialization
    var _init = function () {
        if (settings.onBeforeInit) {
            settings.onBeforeInit(that);
        }
        that.jsonRaw = that.settings.jsonRaw;
        that.viewModel = kendo.observable(that.jsonRaw);
        that.viewModel.bind("change", onVmChange);
        that.formId = that.settings.formId;
        that.extensionFieldsJson = that.settings.extensionFieldsJson;
    }
    // methods
    var disableForm = function () {
        $('form input, form textarea').each(function () {
            $(this).attr("disabled", "disabled");
            $(this).addClass("k-state-disabled");
        });

        $('form .k-icon.k-i-arrow-s, form .k-icon.k-i-arrow-n, form .k-select, form .searchIcon, form .search, form .k-button, form button').each(function () {
            $(this).remove();
        });

        $(".taskmenu").hide();
        $(".reviewer-controls").hide();

    }
    this.disableForm = disableForm;

    // methods
    var shouldDisable = function (vm) {

        if (vm.Status.Id === "c7b65747-f99e-c108-1e17-3c1062138fc4" ||  // SR Closed
            vm.Status.Id === "f228d50b-2b5a-010f-b1a4-5c7d95703a9b" || // CR Closed
            vm.Status.Id === "25eac210-e091-8ae8-a713-fea2472f32ff" || // PR Closed
            vm.Status.Id === "221155fc-ad9f-1e40-c50e-9028ee303137" || // RR Closed
            vm.Status.Id === "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf") { // Incident Closed

            return true;
        } else {
            return false;
        }

    }
    this.shouldDisable = shouldDisable;

    //handle form changes based on status
    var handleStatus = function () {
        that.formEle = $("#" + that.formId);

        //set status and bind change
        app.controls.forceProp(that.viewModel, "Status", { Name: null, Id: null });
        $('#statusname').html(that.viewModel.Status.Name);
        $('#statusname').attr('data-status-id', that.viewModel.Status.Id);
        //bind changes to model to the status view pill
        that.viewModel.Status.bind("change", function (obj) {
            if (obj.field === 'Name') {
                $('#statusname').html(that.viewModel.Status.Name);
            } else if (obj.field === "Id") {
                $('#statusname').attr('data-status-id', that.viewModel.Status.Id);
            }
        });

        //if WI is closed disable form
        if (that.shouldDisable(that.viewModel)) {
            that.disableForm();
        }

        //should we display the close task
        if (that.viewModel.Status.Id === "2b8830b6-59f0-f574-9c2a-f4b4682f1681") { // Incident Resolved
            if ($('#taskpanel .hide-till-resolved')) {
                $('#taskpanel .hide-till-resolved').removeClass('hide');
            }
        } else {
            if ($('#taskpanel .hide-till-resolved')) {
                $('#taskpanel .hide-till-resolved').addClass('hide');
            }
        }
        //should we display the close task
        if (that.viewModel.Status.Id === "7ff92b06-1694-41e5-2df7-b4d5970d2d2b") { // Problem Resolved
            if ($('#taskpanel .hide-till-resolved')) {
                $('#taskpanel .hide-till-resolved').removeClass('hide');
            }
        } else {
            if ($('#taskpanel .hide-till-resolved')) {
                $('#taskpanel .hide-till-resolved').addClass('hide');
            }
        }

    }
    this.handleStatus = handleStatus;

    var assignTasks = function (type) {

        //handle default tasks
        app.controls.apply($(".taskmenu"));

        if (typeof (app.lib.formTasks.get(type)) !== 'undefined') {
            var tasks = app.lib.formTasks.get(type);
            var taskContainer = $('.taskmenu.custom');
            app.lib.extTemplate.load("/CustomSpace/customtasks.tmpl.html"); //load custom templates

            //add div for name/value window
            var winEle = $("<div>", { "id": "objectViewerWindow" });
            taskContainer.after();

            var taskWin = winEle.kendoCiresonWindow({
                width: 550,
                height: 400,
                actions: ["Close"]
            }).data("kendoWindow");

            //taskWin.title(title).center().open();

            $(document).bind("TEMPLATE_LOADED", function (e, path) {
                $.each(tasks, function (i, task) {

                    var li = $("<li>", { html: task.label });
                    li.click(function () {
                        task.func(that, that.viewModel, taskWin);
                    });
                    taskContainer.append(li);
                });
            });
        }


    }
    this.assignTasks = assignTasks;

    var onVmChange = function (e) {
        setIsDirty(true);
        //app.lib.log(e);
    }
    this.onVmChange = onVmChange;

    var setIsDirty = function (bool) {
        isDirty = bool;
        $(that).trigger("onDirtyChange");
    }
    this.setIsDirty = setIsDirty;

    this.isDirty = function () {
        return isDirty;
    }

    var save = function (success, failure) {
        if (!that.isDirty()) {

            kendo.ui.ExtAlertDialog.show({
                title: localization.Warning,
                message: localization.Nochangesweremade
            });
            return;
        }
        $("body *").blur;
        var postData = {
            isDirty: that.isDirty(),
            //original: that.jsonRaw,
            current: that.viewModel.toJSON()
        }
        // quick fix for error in  UserInput error
        if (postData.current.UserInput) {
            postData.current.UserInput = postData.current.UserInput;
        }

        var postData = encodeURIComponent(JSON.stringify(postData));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: settings.saveUrl,
            data: "formJson=" + postData,
            success: function (data, status, xhr) {
                //did the login page get sent back
                if (data.search('loginForm') < 0) {
                    //data = $.parseJSON(data);
                    //if (data.success) {
                    setIsDirty(false);
                    success(data);
                    //} else {
                    //    app.lib.log(data);
                    //}
                } else {
                    //session expired
                    window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console && app.lib.log(localization.RequestFailed);
                //app.lib.log(xhr);
                //app.lib.log(ajaxOptions);
                app.lib.log(thrownError);

                var jsonRsp = $.parseJSON(xhr.responseText);
                app.lib.log(jsonRsp);

                var errorMsg = localization.RequestFailed;
                if (jsonRsp.exception.length > 0) {
                    errorMsg = jsonRsp.exception;
                }

                kendo.ui.ExtAlertDialog.show({
                    title: localization.ErrorDescription,
                    message:  errorMsg,
                    icon: "fa fa-exclamation"
                });
            },
            processData: false,
            async: false
        });

    }
    this.save = save;

    var handleConvertLinkToParentVisibility = function () {
        if ($('#taskpanel .convert-to-parent')) {
            var convertToParentLink = $('#taskpanel .convert-to-parent');
        }
        if ($('#taskpanel .revert-to-parent')) {
            var revertToParentLink = $('#taskpanel .revert-to-parent');
        }
        if ($('#taskpanel .link-to-parent')) {
            var linkToParentLink = $('#taskpanel .link-to-parent');
        }
        if (that.viewModel.Status.Id === "2b8830b6-59f0-f574-9c2a-f4b4682f1681" ||  //incident resolved
            that.viewModel.Status.Id === "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf" ||  //incident closed
            that.viewModel.Status.Id === "7ff92b06-1694-41e5-2df7-b4d5970d2d2b" ||  //problem resolved
            that.viewModel.Status.Id === "25eac210-e091-8ae8-a713-fea2472f32ff"   //problem closed
            ) {
            convertToParentLink.hide();
            revertToParentLink.hide();
            linkToParentLink.hide();
        }
        else {
            if (that.viewModel.IsParent) {
                linkToParentLink.hide();
                convertToParentLink.hide();
                revertToParentLink.show();
            }
            else {
                revertToParentLink.hide();
                $("#ChildWorkItemDisplay").hide();
                if (that.viewModel.ParentWorkItem == null) {
                    convertToParentLink.show();
                    linkToParentLink.show();
                } else {
                    convertToParentLink.hide();
                }
            }
        }
    }
    this.handleConvertLinkToParentVisibility = handleConvertLinkToParentVisibility;

    var handleAcknowledgeTaskVisibility = function () {
        if (that.viewModel.Status.Id === "2b8830b6-59f0-f574-9c2a-f4b4682f1681" ||  //incident status resolved
            that.viewModel.Status.Id === "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf" ||  //incident status closed
            that.viewModel.Status.Id === "7ff92b06-1694-41e5-2df7-b4d5970d2d2b" ||  //problem status resolved
            that.viewModel.Status.Id === "25eac210-e091-8ae8-a713-fea2472f32ff" ||  //problem status closed
            that.viewModel.FirstResponseDate != null) {
            $("#acknowledge-task").hide();
        } else {
            $("#acknowledge-task").show();
        }
    }
    this.handleAcknowledgeTaskVisibility = handleAcknowledgeTaskVisibility;

    _init();
}