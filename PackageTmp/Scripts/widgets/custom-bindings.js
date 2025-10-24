kendo.data.binders.ciresonEnumPicker = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    options: {
        name: "ciresonEnumPicker",
        autoBind: true,
        template: "",
    },
    refresh: function () {
        var that = this;
        var parameterId;
        try {
            parameterId = that.bindings["ciresonEnumPicker"].get();
        } catch (ex) {
            parameterId = eval(that.bindings["ciresonEnumPicker"].path);
        }

        //this is necessary in thecase when the refresh is called many times and can lead to a stack overflow.
        if (parameterId == this.options.lastparameterId) {
            return;
        }
        this.options.lastparameterId = parameterId;


        if (that.treeViewWidgetData) {
            that.treeViewWidgetData.destroy();

            $(that.element).empty();
            //on initial load, if a value is set, then we want it to display, on refresh because the source
            //of the list has changed, we want to clear it so it does not get invalid values.
            that.bindings.value.set({});
        }

        if (!parameterId) {
            return; //no enum type id specified, so exit.
        }

        var dataSource = new kendo.data.HierarchicalDataSource({
            serverFiltering: true,
            transport: {
                read: {
                    url: "/api/V3/Enum/GetList",
                    dataType: "json"
                },
                parameterMap: function (data) {
                    // change url parameters for parent/child
                    var params = {};
                    if (!data.Id) {
                        params.Id = parameterId;
                    } else {
                        params.Id = data.Id;
                        //params.parentId = '89b34802-671e-e422-5e38-7dae9a413ef8';
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

        var comboDataSource = new kendo.data.DataSource({
            serverFiltering: true,
            transport: {
                read: {
                    url: "/api/V3/Enum/GetFlatList?id=" + parameterId + "&Flatten=true",
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    data: function () {
                        return {
                            itemFilter: function () {
                                try {
                                    return that.treeViewWidget.data().handler._dropdown.input.val();
                                } catch (exception) {
                                    return "";
                                }
                            }
                        };
                    }
                }
            },
            error: function (e) {
                app.lib.log(e.errorThrown + " - When retrieving list for combo in dropDownTree at " + url);
            }
        });

        var extOptions = { value: that.bindings.value, };

        var treeViewOptions = {
            treeView: {
                autoBind: false,
                dataSource: dataSource,
                dataTextField: "Name",
                dataValueField: "Id",
                loadOnDemand: true,
                minLength: 3
            }
        }

        // comboBox options
        var comboBoxOptions = {
            comboBox: {
                autoBind: false,
                dataTextField: "Name",
                dataValueField: "Id",
                filter: "contains",
                suggest: true,
                minLength: 3,
                placeholder: localization.ChooseOne,
                dataSource: comboDataSource
                //select: comboSelect,
                //change: comboSelect,

                //dataBound: comboValidate,
            }
        }

        extOptions = $.extend(extOptions, treeViewOptions, comboBoxOptions);

        that.treeViewWidget = $(that.element).kendoExtDropDownTreeViewV3(extOptions);
        that.treeViewWidgetData = that.treeViewWidget.data("kendoExtDropDownTreeViewV3");

    },
    destroy: function () {
        if (this.treeViewWidgetData) {
            $(this.element).removeAttr("data-role");
            $(this.element).empty();
        }
        //this.bindings.value.set({});
        //console.log("Destroyed");
    }
});

kendo.data.binders.ciresonDropDownTree = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        if (bindings.options && bindings.options.path) {
            //options are being passed in via data-bind options: {} object
            var optionsObject = bindings.options.source.get();
            this.options.url = $(element).attr("data-url");
            this.options.combourl = $(element).attr("data-combourl");
            this.options.showPath = optionsObject.showPath;
            this.options.mustSelectLeafNode = optionsObject.leafNodeOnly;
            this.options.disabled = optionsObject[bindings.options.path.disabled];
            this.options.required = ($(element).attr("required") === "required");
            this.options.filterId = optionsObject.filterId;
            this.options.showClearButton = !_.isUndefined(optionsObject.showClearButton) ? optionsObject.showClearButton : false;
            this.options.placeholder = $(element).attr("data-placeholder");
        } else {
            //options are set as data-* attributes (defined forms)
            var bShowClearButton = eval($(element).attr("data-showclearbutton"));

            this.options.url = $(element).attr("data-url");
            this.options.combourl = $(element).attr("data-combourl");
            this.options.showPath = eval($(element).attr("data-showpath"));
            this.options.mustSelectLeafNode = eval($(element).attr("data-mustselectleafnode"));
            this.options.disabled = eval($(element).attr("data-disabled"));
            this.options.required = ($(element).attr("required") === "required");
            this.options.filterId = $(element).attr("data-filter");
            this.options.showClearButton = !_.isUndefined(bShowClearButton) ? bShowClearButton : false;
            this.options.placeholder = $(element).attr("data-placeholder");
        }

    },
    options: {
        name: "ciresonDropDownTree",
        autoBind: false,
        template: "",
        url: "",
        combourl: "",
        showPath: false,
        mustSelectLeafNode: false,
        disabled: false,
        required: false,
        filterId: "",
        showClearButton:false
    },
    refresh: function () {
        var that = this;
        var parameterId;

        try {
            parameterId = that.bindings["ciresonDropDownTree"].get();
        } catch (ex) {
            parameterId = eval(that.bindings["ciresonDropDownTree"].path);
        }

        //TODO make the input have the required attr

        //this is necessary in thecase when the refresh is called many times and can lead to a stack overflow.
        if (parameterId == that.options.lastParameterId) {
            return;
        }
        that.options.lastParameterId = parameterId;
        that.options.propertyName = that.bindings.value.path;

        if (that.treeViewWidgetData) {
            that.treeViewWidgetData.destroy();

            $(that.element).empty();
            //on initial load, if a value is set, then we want it to display, on refresh because the source
            //of the list has changed, we want to clear it so it does not get invalid values.
            that.bindings.value.set({});
        }

        var treeViewDataSource = new kendo.data.HierarchicalDataSource({
            serverFiltering: true,
            transport: {
                read: {
                    //hard set to itemFilter for the param, may not be future proof against enum picker but I don't know what params they need.
                    url: app.lib.addUrlParam(that.options.url, "itemFilter", ""),
                    dataType: "json"
                },
                parameterMap: function (data) {
                    // change url parameters for parent/child
                    var params = {};
                    if (!data.Id) {
                        params.Id = parameterId;
                    } else {
                        params.Id = data.Id;
                    }
                    params.itemFilterIds = that.options.filterId;
                    return params;
                }
            },
            schema: {
                model: {
                    id: "Id",
                    hasChildren: "HasChildren"
                }
            },
            requestEnd: function (e) {
                //wait for datasource to be filled before executing leaf-node-only routine
                _.defer(function () {
                    _.each(e.sender._data, function (i, item) {
                        var dataItem = e.sender._data[item];
                        if (that.options.mustSelectLeafNode && dataItem.HasChildren) {
                            //disable the specific parent's li element only and not the entire treeview node
                            var node = that.treeViewWidgetData._treeview.findByUid(dataItem.uid).find("span[role='presentation']").next();
                            node.css("background", "none");
                            node.css("color", "gray");
                            node.css("border-color", "white");
                            node.css("cursor", "default");
                        }
                        //default node selection to current value
                        if (that.bindings["value"].get().Id == dataItem.Id) {
                            var node = that.treeViewWidgetData._treeview.findByUid(dataItem.uid);
                            var selectedNode = (node.find("span[role='presentation']").length != 0) ? node.find("span[role='presentation']").next() : node.find("span");
                            selectedNode.addClass("k-state-selected");
                        }
                    });
                });

            }
        });

        var comboDataSource = new kendo.data.DataSource({
            serverFiltering: true,
            transport: {
                read: {
                    url: !_.isUndefined(this.options.combourl) ? this.options.combourl : this.options.url,
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: "json",
                    data: function () {
                        var params = {
                            id: parameterId,
                            itemFilter: function () {
                                if (_.isUndefined(that.treeViewWidget)) {
                                    return "";
                                } else {
                                    return that.treeViewWidget.data().handler._dropdown.input.val();
                                }
                            },
                            itemFilterIds: that.options.filterId
                        }

                        if (!_.isUndefined(that.options.mustSelectLeafNode)) {
                            params.includeParents = !that.options.mustSelectLeafNode;
                        }

                        return params;
                    },
                    parameterMap: function (data) {
                        return {
                            itemFilter: data.itemFilter()
                        };
                    }
                }
            },
            error: function (e) {
                app.lib.log(e.errorThrown + " - When retrieving list for combo in dropDownTree at " + url);
            }
        });

        var getBindingName = function () {
            var name = that.bindings.value.get('');
            var toReturn = "";
            if (!_.isNull(name)) {
                toReturn = name.Id;
            }
            return toReturn;
        }

        var extOptions = {
            value: that.bindings.value,
            mustSelectLeafNode: that.options.mustSelectLeafNode
        };
        var treeViewOptions = {
            treeView: {
                autoBind: false,
                value: _.isUndefined(that.bindings.value.get('')) ? "" : getBindingName(),
                dataSource: treeViewDataSource,
                dataTextField: "Name",
                dataValueField: "Id",
                loadOnDemand: true,
                change: function (e) {

                    var item = this.dataItem(this.select());
                    if (item && item.HasChildren && that.options.mustSelectLeafNode) {
                        //this is a branch node, not a leaf, so don't set anything
                        return false;
                    } else if (item) {
                        //we let the parent ExtDropDownTree function handle this change -JK
                        //no need to change the vm value again, this caused a double change event to be fired
                        var vm = that.bindings.ciresonDropDownTree.source.get();
                        var propertyName = that.bindings.value.path;

                        //TAKING ADVANTAGE OF KENDO NOT FIRING THE CHANGE EVENT HERE
                        //NEEDS TO BE THIS WAY TO PREVENT DOUBLE BOUND FIRES [IR8905]
                        //item.Name = item.Text || "";

                        
                        //Reassign treeview property values here to trigger custom boundChange event [BUG 21476]
                        var selectedId = vm[propertyName].Id;
                        var selectedName = vm[propertyName].Name;
                        vm[propertyName].set("Id", "");
                        vm[propertyName].set("Name", "");
                        vm[propertyName].set("Id", selectedId);
                        vm[propertyName].set("Name", selectedName);
                        vm[propertyName].set("Text", selectedName);

                        vm.set("IsEnumValid", true);
                        setIsValid(true);
                        setInputDecoration();
                        
                        
                        
                    }
                },
                select: function (e) {
                    //we need this empty function to prevent the default ExtDropDownTreeV3 from handeling the select event
                    //if we don't block the default select trigger the change event gets fired twice
                    //a select also triggers a change 
                    //this ensure the correct validation
                    //console.log("select");
                    return true;
                },
                messages: {
                    loading: localization.Loading
                }

            }
        }
       
        // comboBox options
        var comboBoxOptions = {
            comboBox: {
                autoBind: false,
                value: _.isUndefined(that.bindings.value.get('')) ? "" : getBindingName(),
                dataTextField: "Name",
                dataValueField: "Id",
                suggest: true,
                minLength: 3,
                filter: "contains",
                placeholder: localizationHelper.localize(this.options.placeholder, localization.ChooseOne),
                dataSource: comboDataSource,
                change: function (e) {
                    updateViewModel(this);
                },
                select: function (e) {
                    //we need this empty function to prevent the default ExtDropDownTreeV3 from handeling the select event
                    //if we don't block the default select trigger the change event gets fired twice
                    //a select also triggers a change 
                    //this ensure the correct validation

                    return true;
                },
                clearButton: that.options.showClearButton
            }
        }

        extOptions = $.extend(extOptions, treeViewOptions, comboBoxOptions);

        that.treeViewWidget = $(that.element).kendoExtDropDownTreeViewV3(extOptions);
        that.treeViewWidgetData = that.treeViewWidget.data("kendoExtDropDownTreeViewV3");

        var combobox = that.treeViewWidgetData._dropdown;
        
        
        //Allow change to vm when item is selected by click event
        combobox.list.on("click", function (e) {
            updateViewModel(combobox);
        });

        //Allow change to vm when item is selected by tab and enter event
        combobox.input.on("keydown", function (e) {
            var filter = combobox.dataSource.filter() || { filters: [] };
            
            if ((e.keyCode === 9 || e.keyCode === 13) && filter.filters[0]) { //TAB
                updateViewModel(combobox);
            }
        });

        var updateViewModel = function (sender) {
            var id = (sender.selectedIndex == -1 || sender.value() == "00000000-0000-0000-0000-000000000000") ? null : sender.value();
            var name = sender.selectedIndex == -1 ? null : sender.text();
            var vm = that.bindings.ciresonDropDownTree.source.get();
            var propertyName = that.bindings.value.path;
            var isRequired = that.options.required;
            var isEmpty = false;
            var isValid = true;

            //did the value actually change
            if (id === vm.get(propertyName).Id) {
                //Bug 22176: Set enum validity to true when selection has not changed.
                vm.set("IsEnumValid", isValid);
                setIsValid(isValid);
                setInputDecoration();
                return;
            }


            if ($('html').hasClass("k-ie9")) {
                isEmpty = (sender.input.val() === "" || sender.input.val() === localization.ChooseOne);
            } else {
                isEmpty = (sender.input.val() === "");
            }

            var isValid = true;
            //if a valid value is selected then the selectedIndex will be a positive number
            if (isRequired) {
                if (sender.selectedIndex === -1) {//required and a selected value
                    isValid = false;
                } else if (isEmpty) {
                    isValid = false;
                }
            } else if (sender.selectedIndex === -1) {//no selected values
                if (!isEmpty) { //but we have an entered value
                    isValid = false;
                }
            }

            if (id === name)
                id = vm.get(propertyName).Id;

            if (isValid || isEmpty) {
                //Individually set enum property values here to trigger custom boundChange event [BUG 21476]
                vm[propertyName].set("Id", id || "");
                vm[propertyName].set("Name", name || "");
            }

            vm.set("IsEnumValid", isValid);
            setIsValid(isValid);
            setInputDecoration();

            //now select the item in the tree view
            var selectedItem = that.treeViewWidgetData._dropdown.dataItem();
            if (!_.isUndefined(selectedItem)) {
                that.treeViewWidgetData._treeview.select(that.treeViewWidgetData._treeview.findByUid(selectedItem.uid));
            } else {
                that.treeViewWidgetData._treeview.select("");
            }
        }

        //input underline decoration
        var setInputDecoration = function () {
            var value = that.bindings["value"].get().Name || that.bindings["value"].get().Text;
            if (value && value.length > 0) {
                that.treeViewWidgetData._dropdown.input.css({ 'text-decoration': 'underline' });
            } else {
                that.treeViewWidgetData._dropdown.input.css({ 'text-decoration': 'none' });
            }
        }

        //invalid decoration
        var setIsValid = function (isValid) {
            isValid = isValid || false;
            var targetObj = that.treeViewWidgetData._dropdown.input;
            if (isValid || targetObj.val() == "") { //Added targetObj.val()=="" so that it will remove the pick background if enum is clear
                targetObj.closest('.k-dropdown-wrap').removeClass('input-error');
                targetObj.removeClass('input-error');
            } else {
                targetObj.closest('.k-dropdown-wrap').addClass('input-error');
                targetObj.addClass('input-error');
                //leave the value so user can see what they did wrong
            }
        }

        //show path
        if (that.options.showPath) {
            $.ajax({
                url: "/api/V3/Enum/GetEnumFlatDisplayName?TopLevelId=" + parameterId + "&Id=" + that.bindings.value.get().Id,
                success: function (data) {
                    if (data) {
                        _.defer(function () {
                            //var vm = that.bindings.ciresonDropDownTree.source.get();
                            var propertyName = that.bindings.value.path;
                            //vm.set(propertyName, { Id: data.Id, Name: data.Name });

                            //we only want to change the view here and not trigger a change event
                            that.treeViewWidgetData._dropdown.input.val(data.Name);

                            //we need to make sure not to distube the dirty flag
                            //vm.set("isDirty", false);
                        });
                    }
                }
            });
        }

        //display value and make a pretty underline
        //that.treeViewWidgetData._dropdown.value(that.bindings["value"].get().Name);
        setInputDecoration();

        //leaf node only
        if (that.options.mustSelectLeafNode) {
            $(that.treeViewWidget.children()[0]).find("a").bind("click", function (e) {
                that.treeViewWidgetData._treeview.dataSource.read();
            });
        }

        //disable 
        if (that.options.disabled) {
            that.treeViewWidgetData._dropdown.enable(false);
            that.treeViewWidgetData._dropdown.input.attr("placeholder", "");
            $(that.treeViewWidget.children()[0]).find("a").remove();
        }

    },
    destroy: function () {
        if (this.treeViewWidgetData) {
            $(this.element).removeAttr("data-role");
            $(this.element).empty();
        }
    }
});

kendo.data.binders.ciresonGrid = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //call base constructor
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        var that = this;
        if (that.gridWidget) {
            that.gridWidget.wrapper.empty();
            that.gridWidget.destroy();
            that.gridWidget = undefined;
        }
        var ciresonGrid = that.bindings.ciresonGrid;
        var sourceVm = ciresonGrid.source;
        var gridViewModel = sourceVm.getGridVm();

        if (ciresonGrid && that._refreshHandler) {
            ciresonGrid.unbind("change", that._refreshHandler);
        }
        else {
            //proxy the refresh call so the source change will invoke a refresh.
            that._refreshHandler = $.proxy(that.refresh, that);
        }

        if (ciresonGrid && ciresonGrid.get()) {
            require(["grids/gridBuilder"], function (gridBuilder) {
                gridBuilder.build(gridViewModel, gridViewModel.grid, function (config) {
                    if (sourceVm.renderGrid) {
                        if (app.isMobile()) {
                            renderMobileView(config);
                        } else {
                            renderGrid(config);
                        }
                    }
                });
            });


        }
        var renderGrid = function (config) {
            if (gridViewModel.persistGridState) {
                //get state
                var gridState = app.gridUtils.savedState.getCurrentState(gridViewModel.gridId);
                //set columns before we call .kendoGrid
                if (gridState.columns && gridState.columns.length > 0) {
                    config.columns = gridState.columns;
                }
            }
            //get the grid
            $(that.element).append('<div id="' + gridViewModel.gridId + '" class="grid-container"></div>');
            var container = $(that.element).find('#' + gridViewModel.gridId).kendoGrid(config);
            that.gridWidget = container.data('kendoGrid');
            function dataSourceError(e) {
                console.log(e.errorThrown);
                //todo: when do we want to show a message vs. an empty grid?
                if (e.xhr.status != 200) {
                    app.lib.message.add(localizationHelper.localize("GenericQueryBuilderError"), "danger");
                    app.lib.message.show();
                }
            }
            that.gridWidget.dataSource.bind("error", dataSourceError);

            if (gridState) {
                that.gridWidget.dataSource.query(gridState);
            } else {
                that.gridWidget.dataSource.read();
            }

            app.events.publish('queryBuilderGridReady');
        }
        var renderMobileView = function (config) {
            //define listview config
            var listViewCtrlConfig =
            {
                dataSource: config.dataSource,
                selectable: "single",
                template: kendo.data.binders.templateResources.resourceManager.getTemplateResource("mobileGridTemplate"),
                change: function (e) {
                    /* Event handles multi select updating and navigating to WI details page */
                    var data = this.dataSource.view();
                    var selectedCard = $.map(this.select(), function (item) { return data[$(item).index()]; })[0];
                    var cardId = selectedCard.Id;
                    var cardType = selectedCard.WorkItemType.split('.').pop();
                    var eventEle = $(event.target);

                    if (eventEle.hasClass('gridcard__title')) {
                        //navigate to Wi edit
                        if (cardType.indexOf("Activity") > -1 && selectedCard.ParentWorkItemId) {

                            window.location = "/" + selectedCard.ParentWorkItemType + "/edit/" + selectedCard.ParentWorkItemId + "?activityId=" + selectedCard.Id + "&tab=activity";

                        } else {

                            window.location = '/' + cardType + '/edit/' + cardId + '/';
                        }
                    }
                },
                dataBound: function (e) {
                    if (this.dataSource.view().length <= 0) {
                        //hide pager elements minus the info label
                        $('.mobilegrid__pager').children().not('.k-pager-info').hide();
                    } else {
                        //show pager
                        $('.mobilegrid__pager').children().show();
                    }
                }
            }

            //add the listview element
            $(that.element).append('<div id="mobile_' + gridViewModel.gridId + '" class="mobilegrid"></div>');
            var container = $(that.element).find('#mobile_' + gridViewModel.gridId).kendoListView(listViewCtrlConfig);
            that.listViewWidget = container.data("kendoListView");

            //refresh datasource
            that.listViewWidget.dataSource.read();
        }
    },
    destroy: function () {
    }
});

kendo.data.binders.dataSource = kendo.data.Binder.extend({
    refresh: function () { }
});

kendo.data.binders.templateResources = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //this just needs to grab all the child elements
        //and add them to the manager.
        var ele = $(element);
        var resourceMgr = kendo.data.binders.templateResources.resourceManager;
        ele.find("[data-template-name]").each(function (index, template) {
            resourceMgr.addTemplate(template);
        });
        ele.remove(); //remove the resources from the dom
        ele = null;
    },
    options: {
        name: "templateResources",
        autoBind: false,
        template: "",
    },
    refresh: function () { }
});

//Create a singleton template resource manager so all template binders can access
//all templates.
kendo.data.binders.templateResources.resourceManager = {
    resourceDictionary: {
    },///This is where all the templates will be stored.
    addTemplate: function (element) {
        var ele = $(element);
        kendo.unbind(ele);
        var name = ele.attr("data-template-name");
        if (!name) {
            //so comments, and not template items don't get into the resource dictionary
            //console.log("template resources must specify a data-template-name attribute.");
            return;
        }

        var templateHtml = this.resolveDomElementToTemplateHtml(element);

        //inject the template into the dom as a script element that will be available to 
        //members that are accessing it with the traditional template framework

        var scriptBlock = $("<script id='" + name + "' type='text/x-kendo-template'></script>").html(this.decodeHtml(templateHtml));
        $(document.body).append(scriptBlock);
        $(element).remove();
        //add it to the hash as a string.
        this.resourceDictionary[name] = this.decodeHtml(templateHtml);
    },
    getTemplateResource: function (name, defaultHtml) {
        //grab the resource from the hash, or return the default.
        if (!name) {
            return defaultHtml;
        }
        return this.resourceDictionary[name] || this.resourceDictionary[name + "Template"] || defaultHtml;
    },
    resolveDomElementToTemplateHtml: function (element) {
        return this.encodeHtml(element.outerHTML);
    },
    encodeHtml: function (text) {
        //we want the outermost Html for the template, so to be sure we are 
        //compatible with the most browsers, we will wrap it temporarily in a div
        //and get the div's html
        return $("<div/>").text(text).html().replace(/&amp;/g, '&');
    },
    decodeHtml: function (html) {
        return $("<div/>").html(html).text();
    }
    ,
    applyTemplateToElement: function (template, element, viewModel) {
        this.destroyTemplate(element);
        if (!(typeof template == string)) {
            throw "template must be a string representation of a dom element";
        }
        $(element).html(template);
        kendo.bind($(element).children()[0], viewModel);
    },
    destroyTemplate: function (element) {
        kendo.unbind($(element).children()); //unbind the current template
        $(element).html(""); //empty the html
    }
};


///Allows the dynamic switching of templates based on the bound value of the
///binder.
kendo.data.binders.templateSwitch = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //on init, strip out all the dom elements from the inside of the element, each one
        //will be stored in an array and applied as the element template on refresh.
        this.templateContainer = {
            templates: $(element).children("[data-case]").toArray(),
            defaultTemplate: null
        };

        this.templateContainer.originalHtml = $(element).html(); //store this out so we can return it on destroy if needed.

        var defaultTemplate = $(element).children("[data-default]");
        if (defaultTemplate.length > 0) {
            this.templateContainer.defaultTemplate = $("<div></div>").append(defaultTemplate[0]).html(); //get the default template.
        } else {
            //console.log("Default template not found");
        }
        // this.templateContainer.originalHtml = $(element).html(); //store this out so we can return it on destroy if needed.

        // $(element).empty();
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    options: {
        name: "templateSwitch",
        autoBind: true,
        template: "",
        lastTemplateName: "",
    },
    _resolveTemplateHtmlByName: function (name, defaultTemplateName) {
        //first we want to check for an existing inline template.
        var templateQuery = "[data-case='" + name + "']";
        var foundTemplates = $(this.templateContainer.templates).filter(templateQuery);
        if (foundTemplates.length == 0) {
            //try again with "Template" appended to name to give flexibility in naming templates
            templateQuery = "[data-case='" + name + "Template']";
            foundTemplates = $(this.templateContainer.templates).filter(templateQuery);
        }
        var resourceMgr = kendo.data.binders.templateResources.resourceManager;
        var template = null;
        
        if (foundTemplates.length == 0) {
            //if no templates are found inline, check the resource manager
            template = resourceMgr.getTemplateResource(name);

            //if resource manager yields nothing, check for a default inline template
            if (!template) {
                template = this.templateContainer.defaultTemplate;
            }

            //if there is no default inline template, check the resource manager for a template matching the default name.
            //default to a span indicating that no template is found.
            if (!template) {
                template = resourceMgr.getTemplateResource(defaultTemplateName, "<span>template not found</span>");
            }
        } else {
            //an inline template matching the name was found.
            template = foundTemplates[0];
        }

        if (!(typeof template == "string")) {
            template = resourceMgr.decodeHtml(resourceMgr.resolveDomElementToTemplateHtml(template));
        }
        
        return template;
    },
    refresh: function () {
        var that = this;
        var templateName = that.bindings.templateSwitch.get();
        var templateSource = that.bindings.templateSwitch.source;
        if (that.options.lastTemplateName == templateName) {
            //the template hasn't changed, so we don't need to reload.
            //console.log("Template unchanged.")
            return;
        }
        that.options.lastTemplateName = templateName;
        
        var defaultTemplateName = $(this.element).attr("data-default") || "data-default";
        var template = that._resolveTemplateHtmlByName(templateName, defaultTemplateName);
       
        //if the datasource (templateSource), or template name changes, we need to refresh, and rebind.
        //if properties within the templateSource change, the kendo binding framework will manage that.
        // if the templateSource is defined and the _refreshHandler is wired up, unbind because
        // we need to rebuild the templateSource
        if (templateSource && that._refreshHandler) {
            templateSource.unbind("change", that._refreshHandler);
        }
        else {
            //proxy the refresh call so the templatesource change will invoke a refresh.
            that._refreshHandler = $.proxy(that.refresh, that);
        }
        kendo.unbind($(this.element).children());
        //$(this.element).children().removeData("role");
        //kendo.destroy($(this.element).children())

        if (template) {
            $(that.element).empty();
            if (templateSource && templateSource.get() != undefined) {
                var model = kendo.observable(templateSource.get());
                var view = new kendo.View(template, {
                    model: model, wrap: false
                });
                //console.log("Rendering template: " + templateName);

                view.render(that.element);
                //console.log("Done rendering template: " + templateName);

                //kendo.bind($(that.element).children(), model);
                //console.log("Nodes deep: " + $(view.element).parents().length);
                // kendo.bind($(this.element).children()[0], this.bindings.templateSource.get());
            }
        } else {
            $(that.element).html(that.templateContainer.originalHtml);
        }

        templateSource.bind("change", that._refreshHandler);
    },
    destroy: function () {
        //kendo.destroy($(this.element).children())
        $(this.element).html(this.templateContainer.originalHtml);
        //console.log("Destroyed");
    }
});

///dummy element to bind to a source value without the overhead of the value or source binders
///that seem to modify the dom in ways incondusive to dynamic templates.
kendo.data.binders.templateSource = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
    },
    options: {
    },
    refresh: function () { }
});

///adds css class binding (data-bind="class: someVal")
kendo.data.binders.class = kendo.data.Binder.extend({
    refresh: function () {
        var value = this.bindings["class"].get();
        $(this.element).addClass(value);
    }
});

kendo.data.binders.prettyJson = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        window.setInterval(function () {
            // helper function that prints the relevant data from the hierarchical model
            var items = bindings.prettyJson.get().toJSON();

            var jsonString = JSON.stringify(items, null, 2);

            $(element).html("<pre>" + jsonString + "</pre>");
        }, 1000); //update every second so we don't need to worry about the kendo observable changes on all child observables.

    },
    refresh: function () {

    }
});

var localizationHelper = {
    ///returns the localized value based on the key, the default value, or the key with asterisks surrounding it to indicate a missing localization value.
    localize: function (key, defaultString) {

        if (localization[key]) {
            return localization[key];
        } else {
            //console.log("Localization Key Not Found " + key);
            return defaultString || "*" + key + "*";
        }

    },
    checkIfKeyDoesNotExist: function (key) {
        return $.ajax({
            url: "/Localizations/KeyIsValid",
            type: 'POST',
            data: {
                key: key,
                locale: session.user.Preferences.LanguageCode.Id
            },
            async: false
        });
    },
    saveValue: function (key, value) {
        var localizationModel = {
            Key: key,
            Translation: value,
            ContextNotes: "",
            Locale: session.user.Preferences.LanguageCode.Id,
            hasDuplicateKey: false,
            formInvalid: false
        };

        $.ajax({
            url: "/Localizations/CreateLocalization",
            type: 'POST',
            data: { model: localizationModel },
            async: false
        });
    },
    saveLocalizations: function (localizationModels) {
        $.ajax({
            url: "/Localizations/UpdateLocalizations",
            type: 'POST',
            data: { models: localizationModels },
            async: false
        });
    },
    getAllLocale: function (key) {
        var data = {
            localizationKey: key
        }

        return $.ajax({
            url: "/Localizations/GetAvailableLocalization",
            type: 'POST',
            data: data,
            async: false
        });
    },

    getAllLocaleByKey: function (key) {

        var data = {
            localizationKey: key,
            locale: session.user.LanguageCode
        }
        var allLocale = [];
        //directly call ajax here because defered promise wont work. Need to wait for the data return before processing the save function.
        $.ajax({
            url: "/Localizations/GetAvailableLocalizationByLocale",
            type: 'POST',
            data: data,
            success: function (data, status, xhr) {
                allLocale = data;
            },
            async: false
        });

        return allLocale;
    }
};

///This binder localizes a given key to a display string for the current language.
///compound strings can be made by passing the following format to the binder:
// {key: formatKey, value: variableValue, localizeValue:true/false} 
//the key will be formatted first, and the results should have a {0} placeholder that will accept the localized variable
//set localizeValue to true/false to indicate whether the binder should attempt to localize the value variable, or simply pass it through.
kendo.data.binders.localize = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var key = bindings.localize.path;
        var defaultString = $(element).html();

        if (key.key) {
            localizeValue = key.localizeValue;
            localizedFormat = localizationHelper.localize(key.key, "*{0}*");
            localizedValue = bindings.localize.source.get(key.value);
            if (localizeValue == true || localizeValue == "true") {
                localizedValue = localizationHelper.localize(localizedValue, defaultString);
            }
            $(element).html(localizedFormat.replace("{0}", localizedValue));
        } else {
            $(element).html(localizationHelper.localize(key, defaultString));
        }
    }, refresh: function () { }
});

kendo.data.binders.localizeDynamic = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        this.defaultString = $(element).html();
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    }, refresh: function () {
        $(this.element).html(localizationHelper.localize(this.bindings.localizeDynamic.get(), this.defaultString));
    }
});

kendo.data.binders.localizeAttr = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var attributes = bindings.localizeAttr.path;

        _.each(attributes, function (val, key) {
            var def = $(element).attr(key);
            $(element).attr(key, localizationHelper.localize(val, def));
        });
    }, refresh: function () { }
});

kendo.data.binders.slide = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
        if (this.bindings.slide.get()) {
            $(this.element).delay(0).slideDown();
        } else {
            $(this.element).delay(0).slideUp();
        }
    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});

kendo.data.binders.visibleWithFade = kendo.data.Binder.extend({
    refresh: function () {
        var value = this.bindings.visibleWithFade.get();
        var speed = $(this.element).data("fade-speed") || 'fast';

        if (value) {
            $(this.element).fadeIn(speed);
        } else {
            $(this.element).fadeOut(speed);
        }
    }
});

kendo.data.binders.options = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});


///constructor for managing template parts within a templated control (behavior)
///Template parts are defined by the control's behavior, and exposed to the user through 
///declarative binding within the parent element of the control.  The control behavior will then use the named parts
///to compose the control.
TemplatePartHelper = function (behavior, requiredParts) {
    var children;
    var defaultTemplate = $("#" + behavior.name + "Template").html();
    //todo: need to add a means to use a resource template as the default template.
    if (!$(behavior.element).children().length && defaultTemplate) {
        //if there are no children in the element, then append the default template to the element. 
        //Based on the convention of behavior.name + "Template";

        children = $(behavior.element).append(defaultTemplate).find("[data-template-part]");
    } else {
        children = $(behavior.element).find("[data-template-part]");
    }
    var templateParts = {}
    this.element = behavior.element;

    $(children).each(function (i, child) {
        var partName = $(child).data("templatePart")
        if (!templateParts[partName]) {
            templateParts[partName] = child;
        } else {
            if (!$.isArray(templateParts[partName])) {
                templateParts[partName] = [].concat(templateParts[partName]);
            }
            //there are multiple parts with the same name, so we will make an array.
            //this is handy in cases where there are maybe multiple command buttons, etc...
            templateParts[partName].push(child);
        }
    });
    if (requiredParts && requiredParts.length) {
        $(requiredParts).each(function (i, part) {
            foundPart = templateParts[part.name]
            if (!foundPart) {
                throw "Required Template part missing: " + part.name + " type:" + (part.type || "not-specified");
            }

            if (part.type && foundPart.tagName.toLowerCase() != part.type.toLowerCase()) {
                throw "Required Template part: " + part.name + " must be of type: " + part.type;
            }
        });
    }
    this.getTemplatePart = function (partName) {
        var part = templateParts[partName];
        return part;
    }
    this.getTemplatePartArray = function (partName) {
        //if the part requested is not an array, then make it one for this call.
        var part = templateParts[partName];
        if (!$.isArray(part)) {
            part = [].concat(part);
        }

        return part;
    }
}

kendo.data.binders.ciresonUserPickerBehavior = kendo.data.Binder.extend({
    name: "ciresonUserPickerBehavior",
    init: function (element, bindings, options) {
        //Call the base binder constructor.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        
        //todo: the purpose of this binding is to attach a userPicker control to the bound element
        //a userPicker control consists of a toggle panel with a detail button, and autoComplete input, and a search button.
        //the toggle panel will be shown or hidden depending on the validity of the user chosen, clicking on the detail button will popup a dialog showing the selected user's details
        //the autoComplete will pull data from the url specified in the data-url attribute.
        //the search button will open a dialog to search users when clicked.
        //the data will be presented to the bound viewModel value in the format of {id: guid, name: displayName}
        //this may be better served as a custom widget, with a binder, but since it should only be used in the context of a data-bound component...
        var tpHelper = new TemplatePartHelper(this, [{ name: "detailsButtonPart" }, { name: "autoCompleteInputPart", type: "input" }, { name: "searchButtonPart" }, { name: "userDetailWindowPart" }]);

        var that = this;
        ////hack: need to add the k-widget class to the element, otherwise the kendo framework mucks around with the inner elements, and breaks..
        //$(element).addClass("k-widget");

        this.originalHtml = $(element).html(); //we need to store this so we can restore it when the binder is destroyed to put it back to where it was

        //grab all the template parts that are declared inline, or use the defaults.
        var detailsButton = tpHelper.getTemplatePart("detailsButtonPart");
        var autoCompleteInput = tpHelper.getTemplatePart("autoCompleteInputPart");

        var searchButton = tpHelper.getTemplatePart("searchButtonPart");
        var userDetailWindow = tpHelper.getTemplatePart("userDetailWindowPart");
        $(userDetailWindow).hide(); //hide this part so we can show it as a window when the user clicks "details";
        var context = bindings.ciresonUserPickerBehavior.source.get();
        if (!context.userDetailDataSource) {
            //need to use direct assignment in this area instead  of using the set method because apparently IE is throwing an exception when multiple userPickers are inside a subgroup when set method is used.
            context.userDetailDataSource = [{ key: "Empty", val: "Empty" }];
        }

        if (context.value) {
            context.value.bind("change", function (e) {
                var fieldName = e.field;

                if (fieldName === 'userValue') {
                    var isValid = ((context.value.userValue || {}).Id) || (_.isNull((context.value.userValue || {}).Id));

                    $(autoCompleteInput).removeClass('selection-is-invalid selection-is-valid');

                    $(autoCompleteInput).addClass(isValid ? 'selection-is-valid' : 'selection-is-invalid');
                }
            });
        }

        var dataOptions = $(element).data();
        var groupsOnly = dataOptions.groupsOnly;
        var autoCompleteUrl = groupsOnly
            ? "/api/V3/User/GetUserList?groupsOnly=true"
            : "/api/V3/User/GetUserList";

        this.autoCompleteOptions = $.extend({},
                                    {
                                        //default options
                                        filter: "contains",
                                        textField: "Name",
                                        valuePrimitive: false,
                                        placeHolderText: localizationHelper.localize("SearchPlaceholder"),
                                        //delay: 250,
                                        minLength: 3,
                                        suggest: true,
                                        autoCompleteUrl: autoCompleteUrl,
                                        userDetailsUrl: "/search/GetObjectProperties/",
                                        filterByAnalyst: false,
                                        clearButton: false
                                    },
                                    dataOptions);

        if (!this.autoCompleteOptions.dataTextField) {
            this.autoCompleteOptions.dataTextField = this.autoCompleteOptions.textField;
        }

        //Create a datasource for the autocomplete input element. Maybe able to reuse this across
        this.autoCompleteOptions.dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: this.autoCompleteOptions.autoCompleteUrl,
                    xhrFields: { withCredentials: true },
                    data: {
                        userFilter: function () {
                            return autoComplete.value();
                        },
                        filterByAnalyst: this.autoCompleteOptions.filterByAnalyst,
                        numberOfResults: this.autoCompleteOptions.maxNumberOfResults || 10
                    }
                }
            },
            serverFiltering: true,
        });

        var autoComplete = $(autoCompleteInput).kendoAutoComplete(this.autoCompleteOptions).data("kendoAutoComplete");

        //We need to wire up the userPicker popup behavior to the click event of the searchButtonPart.
        //get the userPickerPopup from the require ioc container, and enable the click binding when it's injected.
        require([app.config.rootURL + "Scripts/forms/popups/userPickerPopup/controller.js"], function (userPickerPopupController) {
            var userPickerPopupController = userPickerPopupController;
            var popupWindow = userPickerPopupController.getPopup(groupsOnly);

            $(searchButton).bind("click", function (e) {
                popupWindow.setSaveCallback(function (userInfo) {
                    //hack: the user info model from the popup uses lowercase property names, we need to map them to upper.
                    if (!userInfo.Id) userInfo.Id = userInfo.id;
                    if (!userInfo.Name) userInfo.Name = userInfo.name;
                    bindings.ciresonUserPickerBehavior.set(userInfo);
                });
                popupWindow.vm.filterByAnalyst = that.autoCompleteOptions.filterByAnalyst;
                popupWindow.open();//popup the usersearch popup window.
            });
        });

        //variable to hold instance of detail window kendo widget
        var detailWindowData;

        //wire up the detailsbutton click to show the userdetail part as a modal window. Easy peasy!
        $(detailsButton).bind("click", function (e) {
            var userValue = bindings.ciresonUserPickerBehavior.get();
            if (!userValue.Id) {
                return;
            }

            $.ajax({
                type: 'GET',
                url: that.autoCompleteOptions.userDetailsUrl,
                contentType: 'application/json',
                data: { id: userValue.Id },
            }).done(function (data) {
                var transformedData = _(data).chain().map(function (val, key) {
                    return { key: key, val: val };
                }).filter(function (item) {
                    return item.val;
                }).value();

                context.set("userDetailDataSource", transformedData);
                if (!detailWindowData) {
                    detailWindowData = $(userDetailWindow).kendoCiresonWindow({ modal: true }).data("kendoWindow");
                };
                detailWindowData.title(userValue.Name);
                detailWindowData.center();
                detailWindowData.open();
            });
        });
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
        //there is really nothing to do on refresh yet.
    },
    destroy: function () {
        //kendo.destroy($(this.element).children());
        $(this.element).html(this.originalHtml);
    },
});

kendo.data.binders.ciresonConfigItemBehavior = kendo.data.Binder.extend({
    name: "ciresonConfigItemBehavior", //todo: create a template called ciresonConfigItemBehaviorTemplate to give this component a default template.
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        //Create a partHelper to manage the template parts that you will be using in this behavior
        //Add additional parts as necessary required parts can be specified in the TemplatePartHelper ctor.
        var tpHelper = new TemplatePartHelper(this, [{ name: "dropDownTreePart" }, { name: "searchButtonPart" }]);
        var classId = "";
        try {
            classId = bindings.ciresonConfigItemBehavior.get();
        } catch (ex) {
            classId = bindings.ciresonConfigItemBehavior.path;
        }
        //retrieve the template part for use within the behavior
        var dropDownTreePart = tpHelper.getTemplatePart("dropDownTreePart");
        var searchButtonPart = tpHelper.getTemplatePart("searchButtonPart");
        require(["forms/popups/objectPickerPopup/controller"], function (objectPickerPopupController) {
            var objectPickerPopupController = objectPickerPopupController;
            var popupWindow = objectPickerPopupController.getPopup("62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC");

            $(searchButtonPart).bind("click", function (e) {
                popupWindow.setSaveCallback(function (configItem) {
                    //hack: the user info model from the popup uses lowercase property names, we need to map them to upper.
                    if (!configItem.Id) configItem.Id = configItem.id;
                    if (!configItem.Name) configItem.Name = configItem.name;
                    if (!configItem.Text) configItem.Text = configItem.name; // the dropdown requires a text value, which is what is returned by the enum api.
                    bindings.ciresonConfigItemBehavior.set(configItem);
                });

                popupWindow.open();//popup the objectSearch popup window.
            });
        });
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {
        //todo: add any clean up code here.
        //kendo.destroy($(this.element).children());
    }
});


kendo.data.binders.ciresonFacetedSearchBehavior = kendo.data.Binder.extend({
    name: "ciresonFacetedSearchBehavior",
    init: function (element, bindings, options) {
        //Call the base binder constructor.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var that = this;

        var tpHelper = new TemplatePartHelper(that, [{ name: "autoCompleteInputPart", type: "input" },
            { name: "searchButtonPart" },
            { name: "filterSelectPart" }
        ]);

        //grab all the template parts that are declared inline, or use the defaults.
        var autoCompleteInput = tpHelper.getTemplatePart("autoCompleteInputPart");
        var searchButtonEle = tpHelper.getTemplatePart("searchButtonPart");
        var filterDropDownList = tpHelper.getTemplatePart("filterSelectPart");


        var context = bindings.ciresonFacetedSearchBehavior.source.get();

        //default search scope to all items
        context.currentSearchScopeText = localizationHelper.localize("SearchAll");

        var onViewAllClick = function (e) {
            e.preventDefault();

            var clickLoc = $(e.item).attr('data-click-location');
            if (_.isUndefined(clickLoc)) {
                return;
            }

            var eventData = {
                searchString: autoComplete.value(),
                scope: clickLoc, //"KnowledgeArticle", "RequestOffering", or "Favorite" 
                results: autoComplete.dataSource.data()
            }

            app.events.publish('serviceCatalogFilterFromSearch', eventData);
        }

        //subscribe to 'back to search' from service catalog
        app.events.subscribe("serviceCatalogBackToSearch", function (e, eventData) {
            autoComplete.focus();
            autoComplete.search();
        });

        if (!context.facetedSearchDataSource) {
            context.set("facetedSearchDataSource", {});
        }

        //autocomplete settings
        var dataOptions = $(element).data();
        var resultsTemplate = kendo.data.binders.templateResources.resourceManager.getTemplateResource("searchResultsTemplate");
        this.autoCompleteOptions = $.extend({},
        {
            textField: context.textField,
            valuePrimitive: true,
            height: 300,
            filter: "contains",
            placeholder: localizationHelper.localize("SearchPlaceholder"),
            minLength: 1,
            searchType: "All",
            template: resultsTemplate,
            autoCompleteUrl: "/Search/GetFacetedSearchJsonResult",
            select: onViewAllClick,
            dataBound: function () {
                highlightMatchingCharacters(this);

                //if force SC search
                if (session.forceSearch) {
                    var me = this;
                    var ddList = me.ul;
                    //no need to use ID selectors #BOOYA
                    $(ddList).parent().find('.show-catalog-button').remove();
                    //var showCatalog = $("<div class='show-catalog-button cursor-pointer'>Still can't find what you are looking for, Click to browser the Service Catalog.</div>");
                    var showCatalog = $("<div class='show-catalog-button'></div>");
                    var btn = $("<button class='btn btn-primary k-button'>" + localization.BrowseServiceCatalogButton + "</button>");
                    btn.on('click', function (e) {
                        //tell the world we want to see the service catalog
                        app.events.publish('serviceCatalogShowCatalog', showCatalog);
                        //close the dropdown
                        me.close();
                        //clear the searched value
                        me.value('');
                    });
                    showCatalog.append(btn);

                    //add the show catalog button after the ul inside the dropdown
                    $(ddList).after(showCatalog);
                }
            },
            //note: open and close event scroll jacking seems like a necessary evil for now.
            open: function () {
                // prevent scroll when open
                $('body').bind('DOMMouseScroll mousewheel', function () {
                    return false;
                });
            },
            close: function () {
                // let them scroll again
                $('body').unbind('DOMMouseScroll mousewheel');
            },
            clearButton: false
        }, dataOptions);

        if (!this.autoCompleteOptions.textField) {
            this.autoCompleteOptions.textField = that.autoCompleteOptions.textField;
        }

        var dataSourceOnChange = function (e) {
            var original = this.view();
            var sorted = [];
            
            //manually order then
            var kas = {
                type: "KnowledgeArticle",
                showAllLink: false,
                results: []
            };
            kas.results = _.filter(original, function(item) {
                return item.Type == "KnowledgeArticle";
            });
            if (kas.results && kas.results.length >= 5) {
                kas.results = _.first(kas.results, 5);
                kas.showAllLink = true;
            }
            if (kas.results.length > 0) {
                sorted.push(kas);
            }

            var favs = {
                type: "Favorite",
                showAllLink: false,
                results: []
            };
            favs.results = _.filter(original, function(item) {
                return item.Type == "Favorite";
            });
            if (favs.results && favs.results.length >= 5) {
                favs.results = _.first(favs.results, 5);
                favs.showAllLink = true;
            }
            if (favs.results.length > 0) {
                sorted.push(favs);
            }

            var ros = {
                type: "RequestOffering",
                showAllLink: false,
                results: []
            };
            ros.results = _.filter(original, function(item) {
                return item.Type == "RequestOffering";
            });
            if (ros.results && ros.results.length >= 5) {
                ros.results = _.first(ros.results, 5);
                ros.showAllLink = true;
            }
            if (ros.results.length > 0) {
                sorted.push(ros);
            }

            //remove falseys
            sorted = _.compact(sorted);
            
            if (sorted.length == 0) {
                sorted.push({
                    type: "NoResults",
                    value: "NoResults",
                    Title: localizationHelper.localize("NoResults")
                });
                $('#facetedSearch-list .k-list').css('height', '0%');
            }

            this.view(sorted);
            //this._view = sorted;
        }

        //Create a datasource for the autocomplete input element.
        that.autoCompleteOptions.dataSource = new kendo.data.DataSource({
            change: dataSourceOnChange,
            transport: {
                read: {
                    url: that.autoCompleteOptions.autoCompleteUrl,
                    xhrFields: { withCredentials: true },
                    data: {
                        searchText: function () {
                            return autoComplete.value();
                        },
                        searchType: that.autoCompleteOptions.searchType
                    }
                }
            },
            serverFiltering: true
        });

        //wire search button to re-show the results on click
        $(searchButtonEle).bind("click", function (e) {
            showAllResults();
        });


        //wire search scope (select list) selection change event
        $(filterDropDownList).find('li').bind("click", function (e) {
            var selectedSearchType = $(e.currentTarget).attr('data-searchtype');

            //update text in select list
            context.set("currentSearchScopeText", localizationHelper.localize(selectedSearchType));

            //map search type to query param string
            var dsSearchTypeFilter;

            switch (selectedSearchType) {
                case "IWantToReportAnIssue":
                    dsSearchTypeFilter = "Incidents";
                    break;
                case "IWantToRequestSomething":
                    dsSearchTypeFilter = "Requests";
                    break;
                case "ChooseAFavoriteRequest":
                    dsSearchTypeFilter = "Favorites";
                    break;
                case "SearchAll":
                default:
                    dsSearchTypeFilter = "All";
                    break;
            }

            //define new datasource with updated filters.
            var datasource = new kendo.data.DataSource({
                requestEnd: dataSourceRequestEnd,
                change: dataSourceOnChange,
                transport: {
                    read: {
                        url: that.autoCompleteOptions.autoCompleteUrl,
                        xhrFields: { withCredentials: true },
                        data: {
                            searchText: function () {
                                return autoComplete.value();
                            },
                            searchType: dsSearchTypeFilter
                        }
                    }
                },
                serverFiltering: true,
                group: {
                    field: "Type"
                }
            });

            //search
            datasource.read();

            //bind to new datasource
            autoComplete.setDataSource(datasource);
        });


        //init control
        var autoComplete = $(autoCompleteInput).kendoAutoComplete(this.autoCompleteOptions).data("kendoAutoComplete");

        //note: this line is for IE so it stops screwing up my scrolling.
        autoComplete.ul.addClass('ps-ready').perfectScrollbar();

        //display search result when pressing enter
        $(autoCompleteInput).on("enter", function(e) {
            showAllResults();
        });

        //helpers
        function highlightMatchingCharacters(source) {
            var searchString = source.value();
            var regex;
            try {
                regex = new RegExp(searchString, "gi");
            } catch (e) {
                //search string contains something regex doesn't like, just return without highlighting
                return;
            }
            _.each($(source.ul).find('.faceted-search-item'), function (item) {
                var itemEle = $(item);
                var toolTipText = itemEle.attr('data-tooltip');
                if (toolTipText && toolTipText != 'null') {
                    $(itemEle).kendoTooltip({
                        width: 150,
                        position: "top",
                        content: function (e) {
                            return $(e.target).attr('data-tooltip');
                        }
                    });
                }
            });

            _.each($(source.ul).find('.list-title'), function (item) {
                var itemEle = $(item);
                if (!_.isUndefined(itemEle)) {
                    itemEle.html(itemEle.text().replace(regex,
                        function (match) {
                            return "<b>" + match + "</b>";
                        }));
                }
            });
        }

        function showAllResults() {
            if (autoComplete.dataSource.data().length > 0) {
                if (autoComplete.dataSource.data()[0].Type != "NoResults") {
                    var eventData = {
                        searchString: autoComplete.value(),
                        scope: "AllResults",
                        results: autoComplete.dataSource.data(),
                    }
                    app.events.publish('serviceCatalogFilterFromSearch', eventData);
                }
            }
        }
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {

    },
});

kendo.data.binders.ciresonDateTimePicker = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        //We need to have this so the datetimepicker plays nice with date data coming from server calls.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        
        $(element).width("auto").kendoDateTimePicker(({
            format: "g"
        }));
        $(element).css("padding", "0");
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
        var that = this;
        //send down the UTC format of dates
        if (that.bindings.value && that.bindings.value.get()) {
            var propertyName = (that.bindings.value.path === "value.endValue") ? "endTimeValue" : "dateTimeValue";
            var selectedDate = kendo.parseDate(that.bindings.value.get());
            var selectedDateUtc = null;
            if (!_.isNull(selectedDate)) {

                var curMonth = (selectedDate.getMonth() + 1);
                curMonth = curMonth < 10 ? "0" + curMonth : curMonth;

                var curDate = selectedDate.getDate();
                curDate = curDate < 10 ? "0" + curDate : curDate;

                var curDTM = curDate + "/" + curMonth + "/" + selectedDate.getFullYear() + " " + selectedDate.toLocaleTimeString();

                //This will going to format the datetime to the browser's current datetime and timezone
                var currentMoment = moment(curDTM, 'DD/MM/YYYY hh:mm:ss a', false);
                selectedDateUtc = currentMoment.format();
            }

            if (that.bindings.value.source.value.get(propertyName) !== selectedDateUtc) {
                that.bindings.value.source.value[propertyName] = selectedDateUtc;
            }
        }
    },
    destroy: function () {
        $(this.element).removeAttr("data-role");
    }
});

kendo.data.binders.dialogConfirmAction = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});

kendo.data.binders.dialogCancelAction = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //dummy binders to store a binding to a viewmodel function
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});

kendo.data.binders.modalDialogBehavior = kendo.data.Binder.extend({
    name: "modalDialogBehavior", //todo: create a template called ModalDialogBehaviorTemplate to give this component a default template.
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        //Create a partHelper to manage the template parts that you will be using in this behavior
        //Add additional parts as necessary required parts can be specified in the TemplatePartHelper ctor.
        var tpHelper = new TemplatePartHelper(this, [{
            name: "openTriggerPart", name: "dialogWindowPart"
        }]);

        //retrieve the template part for use within the behavior
        var openTriggerPart = tpHelper.getTemplatePart("openTriggerPart", "defaultHtml");
        var dialogWindowPart = tpHelper.getTemplatePart("dialogWindowPart", "defaultHtml");
        //var confirmTriggerPart = tpHelper.getTemplatePart("confirmTriggerPart", "defaultHtml");
        //var cancelTriggerPart = tpHelper.getTemplatePart("cancelTriggerPart", "defaultHtml");
        $(dialogWindowPart).hide();
        var dialogWindow
        $(openTriggerPart).bind("click", function () {
            if (!dialogWindow) {
                dialogWindow = $(dialogWindowPart).kendoCiresonWindow({ modal: true, }).data("kendoWindow");
            };
            dialogWindow.title(localizationHelper.localize($(dialogWindowPart).data("title")));
            dialogWindow.center();
            dialogWindow.open()
        });

        var commandParts = tpHelper.getTemplatePartArray("commandPart");
        for (var i = 0; i < commandParts.length; i++) {
            $(commandParts[i]).bind("click", function (e) {
                dialogWindow.close();
            });
        }
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.
    },
    destroy: function () {
        //todo: add any clean up code here.
        kendo.destroy($(this.element).children());
    }
});

///wires up a click event to toggle a boolean value between true and false.
kendo.data.binders.toggleValue = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        $(element).click(function () {
            bindings.toggleValue.set(!bindings.toggleValue.get());
        })
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.

    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});

kendo.data.binders.drawerMenuCommand = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var that = this;
        var originalPath = bindings.drawerMenuCommand.path;
        //todo: initialize binding elements, and local values. This runs once when the binding is first applied.
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var defaultOptions = {
            titleKey: "Ok",
            icon: "fa-click",
            visible: true,
            enabled: true,
            command: function (e) {
                $(element).trigger("click", e); //trigger the original element click event if a command is not specified....
            }
        };
        this.options = $.extend({}, defaultOptions, bindings.drawerMenuCommand.path);

        var callback;

        if (drawermenu && drawermenu.addButton) {
            //need this to reroute the command into the binding handler if provide, otherwise we will trigger the default click on the button.
            if (bindings.drawerMenuCommand.path.command) {

                this.options.command = function (e) {
                    bindings.drawerMenuCommand.path = bindings.drawerMenuCommand.path.command; //rewrite the path to be the command path so we can get the command function and pass it to the drawer button.
                    bindings.drawerMenuCommand.get(); //execute the bound command.
                    bindings.drawerMenuCommand.path = originalPath;
                }
            }
            var btn = drawermenu.addButton(localizationHelper.localize(this.options.titleKey), "fa " + this.options.icon, this.options.command);

            //if the button is visible by the binding, or the button visible viewmodel value changes, then show or hide the button.
            if (bindings.drawerMenuCommand.path.visible) {
                bindings.drawerMenuCommand.path = bindings.drawerMenuCommand.path.visible;
                if (bindings.drawerMenuCommand.get() == undefined) {//hack:if the 'visible' path is set, but the vm property is not initialized, initialize it to true, so we can bind to changes.
                    bindings.drawerMenuCommand.set(true)
                }
                if (!bindings.drawerMenuCommand.get()) {
                    $(btn).hide();
                }
                bindings.drawerMenuCommand.bind("change", function (e) {
                    if (e.sender.source.get(e.field)) { //get thechanged viewmodel value
                        $(btn).show();
                    } else {
                        $(btn).hide();
                    }
                });
                bindings.drawerMenuCommand.path = originalPath; //reset the path back to the original.
            } else {
                if (!that.options.visible) {
                    $(btn).hide();
                }
            }

            //toggle enable/disable
            if (bindings.drawerMenuCommand.path.enabled) {
                bindings.drawerMenuCommand.path = bindings.drawerMenuCommand.path.enabled;
                if (bindings.drawerMenuCommand.get() == undefined) {//hack:if the 'enabled' path is set, but the vm property is not initialized, initialize it to true, so we can bind to changes.
                    bindings.drawerMenuCommand.set(true);
                }
                if (!bindings.drawerMenuCommand.get()) {
                    btn.prop('disabled', true);
                }
                bindings.drawerMenuCommand.bind("change", function (e) {
                    if (e.sender.source.get(e.field)) { //get thechanged viewmodel value
                        btn.prop('disabled', false);
                    } else {
                        btn.prop('disabled', true);
                    }
                });
                bindings.drawerMenuCommand.path = originalPath; //reset the path back to the original.
            } else {
                if (!that.options.enabled) {
                    btn.prop('disabled', true);
                }
            }
        } else {
            console.log("Unable to find drawermenu to attach command.");
        }


        $(element).hide();
    },
    refresh: function () {
        //todo: add code that will execute when the viewmodel property associated with this binding is changed.

    },
    destroy: function () {
        //todo: add any clean up code here.
    }
});

kendo.data.binders.affix = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var self = this;
        this.navbarHeight = 42;
        this.announcementBarHeight = 42;
        this.initialized = false;
        this.computeOffset = function () {
            var offset = self.bindings.affix.path;
            if (!offset.top || offset.top === 'auto') {
                offset.top = self.element.getBoundingClientRect().top - self.navbarHeight - self.announcementBarHeight;
            }

            if (!offset.bottom || offset.bottom === 'auto') {
                offset.bottom = 0;
            }

            return offset;
        };

        _.defer(function () {
            $(element).affix({
                offset: self.computeOffset()
            });

            self.initialized = true;
        });

    },
    refresh: function () {
        if (!this.initialized) return;

        $(this.element).data('bs.affix').options.offset = this.computeOffset();
    },
    destroy: function () { }
});

/**
COMBO - combobox
**/
kendo.data.binders.ciresonCombo = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //note: Runs once when the binding is first applied. Initialize binding, elements, and local values here. 
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        //note: code that will execute when the viewmodel property associated with this binding is changed goes here.
        var that = this;
        var context = that.bindings.ciresonCombo.source.get();

        var tpHelper = new TemplatePartHelper(that, [
            { name: "inputControlPart" },
            { name: "labelPart" }
        ]);
        var inputControlPart = tpHelper.getTemplatePart("inputControlPart");
        var labelPart = tpHelper.getTemplatePart("labelPart");


        if (context.parent()) {
            /* note: prevent running refresh when formbuilder calls kendo.bind() */
            return false;
        }

        if (!context.vm[context.PropertyName]) {
            context.vm[context.PropertyName] = new kendo.data.ObservableObject({
                Id: "",
                Name: ""
            });
        }

        /*
         * DataSource Setup
         */

        that.comboControlDataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: context.DataSource.Url,
                    xhrFields: { withCredentials: true },
                    datatype: "json"
                },
                parameterMap: function (data) { // this will going to create parameters to be used when calling a middle tier end point. usage from end point Request["name"]
                    var val = "";
                    if (!_.isUndefined(data.filter) && !_.isUndefined(data.filter.filters[0].value))
                       val = data.filter.filters[0].value;
                    return { name: val };
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
            },
            serverFiltering: context.serverFiltering,
            pageSize: context.pageSize
        });

        /*
         * Combo Input Setup
         */

        that.comboControlSettings = {
            autoBind: false,
            highlightFirst: true,
            dataTextField: "name",
            dataValueField: "id",
            filter: "contains",
            suggest: true,
            //non-combo control settings
            isCascading: context.IsCascading,
            cascadeSource: context.Cascade.Source || null,
            cascadeTarget: context.Cascade.Target || null,
            isChild: context.Cascade.IsChild || false,
            dataSource: that.comboControlDataSource,
            dataSourceUrl: context.DataSource.Url,
            dataSourceParameterKey: context.DataSource.ParameterKey || null,
            propertyName: context.PropertyName,
            isBounded: false,
            placeholder: localizationHelper.localize("ChooseOne", "Choose One..."),
            //-end non-combo control settings

            enable: !context.Disabled,
            value: "",
            text: "",
            select: function (e) {
                that.comboControlSettings.selectItem(e.sender, e.dataItem);
            },
            change: function (e) {
                that.comboControlSettings.selectItem(e.sender);
            },
            selectItem: function (_this, dataItem) {
                var id = _this.selectedIndex == -1 ? '' : _this.value();
                var name = _this.selectedIndex == -1 ? '' : _this.text();

                if (!_.isUndefined(dataItem)) {
                    id = dataItem.id;
                    name = dataItem.name;
                }

                //clearing out text so they cannot submit form with invalid selection
                if (_this.selectedIndex == -1) {
                    _this.text('');
                }

                if (!context.vm[context.PropertyName]) {
                    context.vm[context.PropertyName] = new kendo.data.ObservableObject({
                        Id: "",
                        Name: ""
                    });
                }
                

                if (!_.isNull(context.IsSimpleProperty) && context.IsSimpleProperty) {  //this will be use if you have a simple property or a property without child. Please refer Computer form
                    var getRelatedItem = function (index, vm, splitProperty) {
                        if ((splitProperty.length - 1) == index) {
                            if (!_.isNull(context.IsLocalBaseDisplay)) {
                                if (!_.isUndefined(vm) && !_.isNull(vm)) { 
                                    vm.set(splitProperty[index], id);
                                }
                                return;
                            }
                        }
                        getRelatedItem(index + 1, vm[splitProperty[index]], splitProperty);
                    }
                    var prop = context.PropertyName.split(".");
                    getRelatedItem(0, context.vm, prop);
                }
                else if (!_.isNull(context.IsFromList) && context.IsFromList)//this will be use to item that is resides from array. This is specically used for User form locale and timezone property. 
                {
                    var dataList = context.vm[context.PropertyName];
                    for (var i = 0; i < dataList.length; i++)
                    {
                        if (dataList[i].ClassTypeId.toLowerCase() == context.FindFromListProperties.ClassId.toLowerCase())
                        {
                            dataList[i][context.FindFromListProperties.PropertyName] = id;
                            break;
                        }
                    }
                }
                else {
                    context.vm[context.PropertyName].set("Id", id);
                    context.vm[context.PropertyName].set("Name", name);
                }

                var isRequired = $(_this.input).closest(".form-group").attr('required');
                var isValid = isRequired == "required" && (!_.isEmpty(id));

                if (!_.isEmpty(id)) {
                    setIsValid(isValid, _this.input);
                }
            },

            dataBound: function (e) { // this will be used for autocomplete and server filtering
                if (this.dataSource.data().length > 0 && !this.options.isBounded) {
                    var comboData = this.dataSource.data();
                    var cmbValue = "";
                    var cmbText = "";
                    if (!_.isNull(context.IsSimpleProperty) && context.IsSimpleProperty) { //this will be use if you have a simple property or a property without child
                        var getRelatedItem = function (index, vm, splitProperty) {
                            if (!_.isUndefined(vm)) {
                                if ((splitProperty.length - 1) == index) {
                                    if (!_.isNull(context.IsLocalBaseDisplay)) {
                                        var cmbSelectedId = vm[splitProperty[index]];
                                        cmbValue = cmbSelectedId;
                                        var isIdFound = false;
                                        for (var i in comboData) {
                                            if (comboData[i].Id == cmbSelectedId) {
                                                cmbText = comboData[i].Name;
                                                break;
                                            }
                                        }
                                        return;
                                    }
                                }
                                getRelatedItem(index + 1, vm[splitProperty[index]], splitProperty);
                            }
                        }
                        var prop = context.PropertyName.split(".");
                        getRelatedItem(0, context.vm, prop);
                    }
                    else if (!_.isNull(context.IsFromList) && context.IsFromList) { //this will be use to item that is resides from array. This is specically used for user form locale and timezone property
                        var dataList = context.vm[context.PropertyName];
                        _.find(dataList, function (item) {
                            if (item.ClassTypeId == context.FindFromListProperties.ClassId.toLowerCase()) {
                                for (var i in comboData) {
                                    if (comboData[i].Id == item[context.FindFromListProperties.PropertyName]) {
                                        cmbValue = comboData[i].Id;
                                        cmbText = comboData[i].Name;
                                        break;
                                    }
                                }
                                return true;
                            }
                        });
                    }
                    else {
                        cmbValue = context.vm[context.PropertyName]
                        ? context.vm[context.PropertyName].Id
                        : "";
                        cmbText = context.vm[context.PropertyName]
                            ? context.vm[context.PropertyName].Name
                            : "";
                        
                    }

                    this.value(cmbValue);
                    this.text(cmbText);
                    this.options.isBounded = true;
                }
            },
            cascade: function () {
                var sourceCombo = this;
                var targetPropertyName = this.options.cascadeTarget;

                //todo: figure out how we can simplify checks on if it is solo, parent, or child
                if (!this.options.isCascading || this.options.isChild) {
                    //no cascade for child or non-cascading combo
                    return false;
                } else {
                    //get child combo control
                    var targetEle = $('[data-control-bind="' + targetPropertyName + '"]');
                    var targetCombo = targetEle.data("kendoComboBox");

                    //set up param object to send to server
                    var paramObj = {};
                    paramObj[targetCombo.options.dataSourceParameterKey] = sourceCombo.value();

                    //define the datasource
                    var newDs = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: targetCombo.options.dataSourceUrl,
                                xhrFields: { withCredentials: true },
                                datatype: "json",
                                data: paramObj
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
                        },
                        change: function (result) {
                            //note: this is only called when the parent combo changes and the new datasource is bound to the child. NOT on user selection change of child
                            if (result.items.length > 0) {
                                var match = _.find(result.items, function (item) {
                                    return item.id == context.vm[targetPropertyName].Id;
                                });

                                if (!_.isUndefined(match)) {
                                    //set control val
                                    targetCombo.text(match.name);
                                    targetCombo.value(match.id);

                                    //set form vm val
                                    context.vm[targetPropertyName].set("Id", match.id);
                                    context.vm[targetPropertyName].set("Name", match.name);
                                } else {
                                    //set control val
                                    targetCombo.text('');
                                    //set form vm val
                                    context.vm[targetPropertyName].set("Id", '');
                                    context.vm[targetPropertyName].set("Name", '');
                                }
                            } else {
                                //set control val
                                targetCombo.text('');
                                //set form vm val
                                context.vm[targetPropertyName].set("Id", '');
                                context.vm[targetPropertyName].set("Name", '');
                            }
                        }
                    });

                    //set and read
                    targetCombo.setDataSource(newDs);
                    targetCombo.dataSource.read();
                }
            }

        };


        var setIsValid = function (isValid, targetEle) {
            isValid = isValid || false;
            var targetObj = $(targetEle);
            if (isValid) {
                //targetObj.closest('.form-group').removeClass('has-error');
                targetObj.closest('.k-dropdown-wrap').removeClass('input-error');
                targetObj.removeClass('input-error');
            } else {
                //targetObj.closest('.form-group').addClass('has-error');

                if (targetObj.is(":focus")) {
                    // invalid while typing
                    targetObj.closest('.k-dropdown-wrap').removeClass('input-error');
                    targetObj.removeClass('input-error');
                } else {
                    // invalid after blur
                    targetObj.closest('.k-dropdown-wrap').addClass('input-error');
                    targetObj.addClass('input-error');
                }
            }
        }

        //init control
        that.comboControl = $(inputControlPart).kendoComboBox(that.comboControlSettings);
        that.comboControl.data("kendoComboBox").list.attr("data-cid", that.comboControlSettings.propertyName);
        //call datasource (not on child combos)
        if (!context.Cascade.IsChild) {
            that.comboControl.data("kendoComboBox").dataSource.read();
        }

        //set control label text
        if (context.Required) {
            that.comboControlLabel = $(labelPart).html(localizationHelper.localize(context.PropertyDisplayName) + " (" + localizationHelper.localize("Required") + ")");
        } else {
            that.comboControlLabel = $(labelPart).html(localizationHelper.localize(context.PropertyDisplayName));
        }
    }
});

kendo.data.binders.yScrollOnResize = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var resizeElement = _.throttle(function () {
            var height = $(window).height();
            var offsetTop;
            var offsetBottom;

            var offset = bindings.yScrollOnResize.path;
            if (!offset.top || offset.top === 'auto') {
                offsetTop = element.getBoundingClientRect().top;
            } else {
                offsetTop = offset.top;
            }

            if (!offset.bottom || offset.bottom === 'auto') {
                offsetBottom = 0;
            } else {
                offsetBottom = offset.bottom;
            }

            height -= offsetTop;
            height -= offsetBottom;

            $(element).css({
                'overflow-y': 'auto',
                'max-height': height + 'px'
            });
        }, 100);

        $(window).on("resize", resizeElement);
        $(window).on("scroll", resizeElement);

        _.defer(resizeElement);
    },
    refresh: function () { },
    destroy: function () { }
});

kendo.data.binders.onElementResize = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var that = this;
        var binding = this.bindings.onElementResize;

        /* http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/ */
        var attachEvent = document.attachEvent;
        var isIE = navigator.userAgent.match(/Trident/);
        //console.log(isIE);
        var requestFrame = (function () {
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function (fn) { return window.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })();

        var cancelFrame = (function () {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                   window.clearTimeout;
            return function (id) { return cancel(id); };
        })();

        var resizeListener = function (e) {
            var win = e.target || e.srcElement;
            if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
            win.__resizeRAF__ = requestFrame(function () {
                var trigger = win.__resizeTrigger__;
                trigger.__resizeListeners__.forEach(function (fn) {
                    fn.call(trigger, e);
                });
            });
        }

        var objectLoad = function (e) {
            this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
            this.contentDocument.defaultView.addEventListener('resize', resizeListener);
        }

        var addResizeListener = function (elm, fn) {
            if (!elm.__resizeListeners__) {
                elm.__resizeListeners__ = [];
                if (attachEvent) {
                    elm.__resizeTrigger__ = elm;
                    elm.attachEvent('onresize', resizeListener);
                }
                else {
                    if (getComputedStyle(elm).position == 'static') elm.style.position = 'relative';
                    var obj = elm.__resizeTrigger__ = document.createElement('object');
                    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                    obj.__resizeElement__ = elm;
                    obj.onload = objectLoad;
                    obj.type = 'text/html';
                    if (isIE) elm.appendChild(obj);
                    obj.data = 'about:blank';
                    if (!isIE) elm.appendChild(obj);
                }
            }
            elm.__resizeListeners__.push(fn);
        };

        /* http://stackoverflow.com/questions/14546606/kendo-mvvm-and-binding-or-extending-custom-events */
        addResizeListener(element, function () { binding.get(); });

    },
    refresh: function () { },
    destroy: function () { }
});

kendo.data.binders.tabDrop = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);


        var WinReszier = (function () {
            var registered = [];
            var inited = false;
            var timer;
            var resize = function (ev) {
                clearTimeout(timer);
                timer = setTimeout(notify, 100);
            };
            var notify = function () {
                for (var i = 0, cnt = registered.length; i < cnt; i++) {
                    registered[i].apply();
                }
            };
            return {
                register: function (fn) {
                    registered.push(fn);
                    if (inited === false) {
                        $(window).bind('resize', resize);
                        inited = true;
                    }
                },
                unregister: function (fn) {
                    for (var i = 0, cnt = registered.length; i < cnt; i++) {
                        if (registered[i] == fn) {
                            delete registered[i];
                            break;
                        }
                    }
                }
            }
        }());

        var TabDrop = function (element, options) {
            this.element = $(element);
            this.dropdown = $('<li class="dropdown hide pull-right tabdrop"><a class="dropdown-toggle" data-toggle="dropdown">' + options.text + ' <b class="caret"></b></a><ul class="dropdown-menu"></ul></li>')
                                .prependTo(this.element);
            if (this.element.parent().is('.tabs-below')) {
                this.dropdown.addClass('dropup');
            }

            
            WinReszier.register($.proxy(this.layout, this));
            this.layout();
        };

        TabDrop.prototype = {
            constructor: TabDrop,

            layout: function () {
                var collection = [];
                this.dropdown.removeClass('hide');
                this.element
                    .append(this.dropdown.find('li'))
                    .find('>li')
                    .not('.tabdrop')
                    .each(function () {
                        /*NOTE: The parent of this element must be position relative, 
                        absolute or fix or else it will relative to the document and 
                        cuase unwanted result.*/
                        if (this.offsetTop > 0) {
                            collection.push(this);
                        }
                    });
                if (collection.length > 0 && app.isMobile()) {
                    collection = $(collection);
                    this.dropdown
                        .find('ul')
                        .empty()
                        .append(collection);
                    if (this.dropdown.find('.active').length == 1) {
                        this.dropdown.addClass('active');
                    } else {
                        this.dropdown.removeClass('active');
                    }
                } else {
                    this.dropdown.addClass('hide');
                }
            }
        }

        var data = new TabDrop(element, { text: '' });//here is where you would add text 

    },
    refresh: function () { },
    destroy: function () { }
});


// binding for content navigation dropdown
kendo.data.binders.navDrop = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        
        var navDrop = function (element) {
            var $this = $(element);
            var senior = $this.parent();
            var parent = $this.parent().parent();
            var length = $this.children('li').length;
            // hide dropdown if no item to display.
            if (length <= 1) {
                $(parent).addClass('hide');
            } else {
                $(parent).removeClass('hide');
            }
            // set the default text
            var selected = $this.find('.selected');
            selected.addClass('active');
            $('.nav-dropdown-default').text($(selected).text());
            // onchange event of the dropdown

            app.navDropdown();

            $this.find('li').each(function () {

                $(this).on('click', function () {
                    //clean current active tab
                    $this.find('li').each(function () {
                        $(this).removeClass('active-tab');
                    });
                    //set active tab..
                    $(this).addClass('active-tab');
                    // on change set default text on current selected item
                    $('.nav-dropdown-default').text($(this).text());
                    // remove first the element having a class active
                    var removeActive = $(parent).siblings('.tab-content').find('.active');
                    $(removeActive).removeClass('active');
                    // locate the div using the id attribute to show the content
                    var content = $(parent).siblings('.tab-content').find('div[id=' + $(this).attr('value') + ']');
                    $(content).addClass('active');
                    parent.toggleClass('show-nav-content');
                });
            });

            var tab = getParameterByName('tab', window.location);

            if (tab == 'activity') {
                selected.removeClass('selected');
                $('li[data-cid="Activities"]').addClass('selected');
                $('li[data-cid="Activities"]').click();
            }
        };

        function getParameterByName(name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        var data = new navDrop(element);

    },
    refresh: function () { },
    destroy: function () { }
});

// binding for content right panel dropdown
kendo.data.binders.rpDropdown = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var rpDropdown = function (element) {
            var _this = $(element);

            _this.find('.nav-dropdown-trigger').on('click', function () {
                _this.toggleClass('show-nav-content');
            });

            $(document).on('click', function (e) {
                if (!_this.is(e.target)
                    && _this.has(e.target).length === 0) {

                    _this.removeClass('show-nav-content');
                }
            });
        };

        var data = new rpDropdown(element);

    },
    refresh: function () { },
    destroy: function () { }
});



//pasting from the browser context menu does not fire a vm change
kendo.data.binders.changeOnPaste = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var me = this;
        var boolean = this.bindings.changeOnPaste.path;
        var vmElm = this.bindings.value.path;

        $(element).on('paste.binder', function (e) {

            _.defer(function () {
                me.bindings.changeOnPaste.source.set(vmElm, $(element).val());
            });

        });
    },
    refresh: function () { },
    destroy: function () {
        //this removes the first bound paste event
        //since for some reason this is getting called twice
        $(this.element).unbind('paste.binder');
    }
});

//allow textarea to grow with content
//http://www.impressivewebs.com/textarea-auto-resize/
kendo.data.binders.autoGrowTextarea = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
        var me = this;
        var boolean = this.bindings.autoGrowTextarea.path;
        var vmElm = this.bindings.value.path;

        var txt = $(element),
        hiddenDiv = $(document.createElement('div')),
        content = null;

        hiddenDiv.addClass('hidden-textarea');

        txt.parent().append(hiddenDiv);
        hiddenDiv.css("line-height", txt.css("line-height"));
        hiddenDiv.css("padding-left", txt.css("padding-left"));

        txt.on('keyup', function () {

            content = $(this).val();
            hiddenDiv.css("width", $(this).width());

            content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            hiddenDiv.html(content + '<br class="lbr">');
            $(this).css('height', hiddenDiv.outerHeight());
        });
    },
    refresh: function () { },
    destroy: function () {

    }
});
/**
DropDownList - kendo dropdownlist
**/
kendo.data.binders.ciresonDropDownList = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        //note: Runs once when the binding is first applied. Initialize binding, elements, and local values here. 
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        //note: code that will execute when the viewmodel property associated with this binding is changed goes here.
        var that = this;
        var context = that.bindings.ciresonDropDownList.source.get();

        var tpHelper = new TemplatePartHelper(that, [
            { name: "inputControlPart" },
            { name: "labelPart" }
        ]);
        var inputControlPart = tpHelper.getTemplatePart("inputControlPart");
        var labelPart = tpHelper.getTemplatePart("labelPart");


        if (context.parent()) {
            /* note: prevent running refresh when formbuilder calls kendo.bind() */
            return false;
        }

        if (!context.vm[context.PropertyName]) {
            context.vm[context.PropertyName] = new kendo.data.ObservableObject({
                Id: "",
                Name: ""
            });
        }

        /*
         * DataSource Setup
         */

        that.controlDataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: context.DataSource.Url,
                    xhrFields: { withCredentials: true },
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
        });

        /*
         * Combo Input Setup
         */

        that.controlSettings = {
            highlightFirst: true,
            dataTextField: "name",
            dataValueField: "id",
            dataSource: that.controlDataSource,
            enable: !context.Disabled,
            value: "",
            text: "",
            change: function () {
                var id = this.selectedIndex == -1 ? '' : this.value();
                var name = this.selectedIndex == -1 ? '' : this.text();

                if (!context.vm[context.PropertyName]) {
                    context.vm[context.PropertyName] = new kendo.data.ObservableObject({
                        Id: "",
                        Name: ""
                    });
                }
                context.vm[context.PropertyName].set("Id", id);
                context.vm[context.PropertyName].set("Name", name);
                var isRequired = $(this.input).attr('required');
                var isValid = isRequired && (this.selectedIndex == -1);

                setIsValid(isValid, this.input);
            },
            dataBound: function (e) {
                if (this.dataSource.data().length > 0) {
                    //note: context.vm values are being set in datasource
                    var controlValue = context.vm[context.PropertyName] ? context.vm[context.PropertyName].Id : "";
                    var controlText = context.vm[context.PropertyName] ? context.vm[context.PropertyName].Name : "";
                    this.value(controlValue);
                    this.text(controlText);
                }
            }
        };


        var setIsValid = function (isValid, targetEle) {
            isValid = isValid || false;
            var targetObj = $(targetEle);
            if (isValid) {
                targetObj.closest('.k-dropdown-wrap').removeClass('input-error');
                targetObj.removeClass('input-error');
            } else {
                targetObj.closest('.k-dropdown-wrap').addClass('input-error');
                targetObj.addClass('input-error');
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


        //init control
        that.dropDownControl = $(inputControlPart).kendoDropDownList(that.controlSettings);

        //set control label text
        if (context.Required) {
            that.comboControlLabel = $(labelPart).html(localizationHelper.localize(context.PropertyDisplayName) + " (" + localizationHelper.localize("Required") + ")");
        } else {
            that.comboControlLabel = $(labelPart).html(localizationHelper.localize(context.PropertyDisplayName));
        }
    }
});


/**
trendContainer
**/
kendo.data.binders.trendContainer = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var self = this;
        self.viewModel = bindings.trendContainer.source.viewModel;
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        var self = this;
        var vm = self.viewModel;

        $.ajax({
            url: app.lib.addUrlParam("/Dashboard/GetDashboardData", "queryId", vm.queryId),
            dataType: 'json',
            contentType: 'application/json',
            type: "GET",
            success: function (data) {
                //set the widget value
                vm.propertyValue.set('text', data[0][vm.propertyName]);
            },
            error: function (e) {
                //log error and display generic error tesxt
                vm.propertyValue.set('color', '#e74c3c');
                vm.propertyValue.set('size', '1.5rem');
                vm.propertyValue.set('text', localization.ServerError);

                app.lib.log(e.errorThrown + ' - When retrieving data from /api/v3/articletrends for property: ' + vm.propertyName);
            }
        });
    }
});

/**
articleList
**/
kendo.data.binders.articleList = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var self = this;
        self.viewModel = bindings.articleList.source.viewModel;
        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        var self = this;
        var vm = self.viewModel;
        var url = "";

        switch (vm.type) {
            case "featured":
                url = "/api/v3/Article/GetTopArticlesByPopularity";
                break;
            case "toprated":
                url = "/api/v3/Article/GetTopArticlesByRating";
                break;
            case "recentlyadded":
                url = "/api/v3/Article/GetTopArticlesByCreatedDate";
                break;
            case "popular":
                url = "/api/v3/Article/GetTopArticlesByViewCount";
                break;
        };

        var articleTemplate = kendo.data.binders.templateResources.resourceManager.getTemplateResource("articleTemplate");
        var listViewCtrlConfig =
        {
            dataSource: new kendo.data.DataSource({
                transport: {
                    read: {
                        url: url,
                        xhrFields: {
                            withCredentials: true
                        },
                        data: { count: vm.count },
                        dataType: 'json',
                        contentType: 'application/json',
                        type: "GET"
                    }
                }
            }),
            template: articleTemplate
        };

        $(self.element).kendoListView(listViewCtrlConfig);
    }
});


/**
mobile grid list
**/
kendo.data.binders.mobileWIGrid = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        var self = this;

        self.viewModel = bindings.mobileWIGrid.source.viewModel;
        self.viewModel.selectedCards = [];

        kendo.data.Binder.fn.init.call(this, element, bindings, options);
    },
    refresh: function () {
        var self = this;
        var vm = self.viewModel;

        var cardTemplate = kendo.data.binders.templateResources.resourceManager.getTemplateResource(vm.templateName);
        if (_.isUndefined(cardTemplate)) {
            cardTemplate = kendo.data.binders.templateResources.resourceManager.getTemplateResource("gridCardTemplate");
        }

        var listViewCtrlConfig =
        {
            dataSource: vm.source,
            selectable: true, //not set to 'multiple' due to touch scroll breaking
            template: cardTemplate,
            change: function (e) {
                /* Event handles multi select updating and navigating to WI details page */
                var data = this.dataSource.view();
                var selectedCard = $.map(this.select(), function (item) { return data[$(item).index()]; })[0];
                var cardId = selectedCard.Id;
                var eventEle = $(event.target);
                var cardEle = eventEle.closest('.gridcard');

                /* Remove default dom updates from kendo control. 
                   Selection UI updates handled manually in multi select logic */
                cardEle.removeClass('k-state-selected').removeAttr('aria-selected');
                if (self.viewModel.GridType === "WorkItem") {

                    if (eventEle.is('label')) {
                        //multi selection
                        eventEle.toggleClass('selected');

                        if (eventEle.hasClass('selected')) {
                            cardEle.addClass('gridcard--selected');
                            self.viewModel.selectedCards.push(selectedCard);
                        } else {
                            cardEle.removeClass('gridcard--selected');
                            var updatedSelection = _.reject(self.viewModel.selectedCards, function (card) {
                                return card.Id === cardId;
                            });
                            self.viewModel.selectedCards = updatedSelection;
                        }

                        //publish event for tasks
                        app.events.publish('mobileWiListSelectionChange', self.viewModel);

                    } else if (eventEle.hasClass('gridcard__title')) {
                        //navigate to Wi edit
                        var cardType = selectedCard.WorkItemType.split('.').pop();
                        window.location = app.gridUtils.getLinkUrl(selectedCard, cardType);
                    }
                } else if (self.viewModel.GridType === "ConfigItem") {
                    var detailsPopupEle = $("<div>");
                    detailsPopupEle.appendTo("body");

                    var detailsPopup = detailsPopupEle.kendoCiresonWindow({
                        modal: true,
                        pinned: true,
                        visible: false,
                        resizable: false,
                        title: "",
                        actions: ["Close"]
                    }).data("kendoWindow");

                    detailsPopup.refresh({
                        url: "/Search/ObjectViewer",
                        data: { id: selectedCard.Id }
                    });
                    detailsPopupEle.find(".k-content").html("<div style='padding: 55px'>Loading...</div>");
                    detailsPopup.title(selectedCard.DisplayName).center().open().maximize();

                }
            },
            dataBound: function (e) {
                if (this.dataSource.view().length <= 0) {
                    //hide pager elements minus the info label
                    $('.mobilegrid__pager').children().not('.k-pager-info').hide();
                } else {
                    //show pager
                    $('.mobilegrid__pager').children().show();
                }

                //publish event for tasks
                app.events.publish('mobileWiListInit', self.viewModel);
            }
        };

        //bind listview
        $(self.element).kendoListView(listViewCtrlConfig);
        //add control id for access to kendo control in other areas of app
        $(self.element).attr('data-control-id', self.viewModel.controlId);

        //bind pager to same datasource as list control
        $(self.element).siblings('.mobilegrid__pager').kendoPager({
            dataSource: listViewCtrlConfig.dataSource,
            pageSizes: [10, 20, 50, 100],
            pageSize: 10,
            buttonCount: 1,
            messages: {
                display: localization.Viewing + " <strong>" + localization.Items.toLowerCase() + " {0}-{1}</strong> of {2} " + localization.Total + ".",
                empty: "<span class='mobilegrid__pager--empty'>" + localization.NoResults + "</span>",
                of: localization.Of,
                first: localization.First,
                previous: localization.Previous,
                next: localization.Next,
                last: localization.Last,
                itemsPerPage: localization.ItemsPerPage,
                allPages: localization.ViewingAllItems
            },
            linkTemplate: ''//purposefully empty to hide element
        });

        //insert header elements above the listview in header wrapper
        var headerEle = $(self.element).siblings('.mobilegrid__header');
        _.each(_.sortBy(vm.toolbar, 'ordinal'), function (toolbarItem) {
            headerEle.append(toolbarItem.template);
        });
    }
});


kendo.data.binders.scrollShowHide = kendo.data.Binder.extend({
    refresh: function () {
        if (this.bindings["scrollShowHide"].get() == false) return;
        var didScroll;
        var lastScrollTop = 0;
        var delta = 5;
        var header = $('header');
        var announcements = $('.announcements')
        var side_nav = $("#side_nav");
        var main_wrapper = $("#main_wrapper");
        var navbarHeight = header.outerHeight();
        var topDrawer = $(".slide-drawer-top");
        var drawer = $('.drawer');
        var drawerMenu = $('.drawer-drawermenu');
        var headerSlide = $('.header_slide_container');
        $(window).scroll(function (event) {
            if (!topDrawer.hasClass("slide-drawer-top-show")) { //This will going to prevent hiding the header if drawer is shown
                hasScrolled();
            }
        });

        function hasScrolled() {
            var st = $('body').scrollTop();

            // Make sure they scroll more than delta
            if (Math.abs(lastScrollTop - st) <= delta)
                return;

            // If they scrolled down and are past the navbar, add class .nav-up.
            // This is necessary so you never see what is "behind" the navbar.
            if (st > lastScrollTop && st > navbarHeight) {
                // Scroll Down
                header.addClass('header-scroll-hide-show-up');
                main_wrapper.addClass('scroll-adjust-sticky-header');
                announcements.addClass('scroll-hide-announcements');
                side_nav.addClass('header-side-nav-scroll-up');

                // hide the header slide container
                headerSlide.children().each(function () {
                    $(this).removeClass('header_slide_transition');
                    $(this).removeClass('task_slide_transition');
                });

            } else {
                // Scroll Up
                if (st + $(window).height() < $(document).height()) {
                    header.removeClass('header-scroll-hide-show-up');
                    main_wrapper.removeClass('scroll-adjust-sticky-header');
                    announcements.removeClass('scroll-hide-announcements ');
                    side_nav.removeClass('header-side-nav-scroll-up');
                }
            }

            lastScrollTop = st;
        }
    }
});

/**
mobile grid
**/
kendo.data.binders.mobileGrid = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var self = this;

        self.viewModel = bindings.mobileGrid;
        self.viewModel.isMultiplePicker = !_.isUndefined($(self.element).attr("multiple-picker")) ? true : false;
        self.viewModel.mobileGridTemplate = kendo.data.binders.templateResources.resourceManager.getTemplateResource("mobileGridTemplate");
        self.viewModel.mobileGridDataSource = !_.isUndefined(self.bindings.mobileGrid.source[self.bindings.mobileGrid.path]) ? self.bindings.mobileGrid.source[self.bindings.mobileGrid.path] : [];
        self.viewModel.mobileGridColumns = !_.isUndefined($(self.element).attr("data-columns")) ? $(self.element).attr("data-columns").split(",") : [];

        //dynamically build mulitple object picker's columns
        self.viewModel.buildListDataSource = function () {
            var source = self.viewModel.mobileGridDataSource;
            var propertiesToDisplay = self.viewModel.mobileGridColumns;
            var data = [];

            _.each(source, function (item) {
                //build out title/header section
                var dSourceObj = {
                    BaseId: item["BaseId"],
                    Id: item["Id"],
                    ClassName: item["ClassName"],
                    title: item[propertiesToDisplay[0]] + ": " + item[propertiesToDisplay[1]],
                    details: []
                }

                //build out details section
                _.each(propertiesToDisplay, function (prop, index) {
                    var detailObj = {};

                    if (index == 0 || index == 1 || index == (propertiesToDisplay.length - 1)) {
                        return;
                    }

                    if (prop.indexOf(".") > -1) {
                        var enumProp = prop.split(".");
                        if (!_.isUndefined(item[enumProp[0]]))
                        detailObj = localizationHelper.localize(enumProp[0]) + ": " + item[enumProp[0]][enumProp[1]];
                    } else {
                        //if propery is of type date, format it
                        if (Date.parse(item[prop]) && /^\d+$/.test(item[prop]) == false) {
                            detailObj = localizationHelper.localize(prop) + ": " + kendo.toString(kendo.parseDate(item[prop]), "g");
                        } else {
                            detailObj = localizationHelper.localize(prop) + ": " + item[prop];
                        }
                    }

                    dSourceObj.details.push(detailObj);
                });
                data.push(dSourceObj);
            });
            return data;
        };

        var listViewCtrlConfig =
        {
            dataSource: new kendo.data.DataSource({
                data: self.viewModel.isMultiplePicker ? self.viewModel.buildListDataSource() : self.viewModel.mobileGridDataSource
            }),
            selectable: "single",
            template: self.viewModel.mobileGridTemplate,
            change: function (e) {
                var index = e.sender.select().index();
                var dataItem = e.sender.dataSource.view()[index];
                require(["forms/predefined/multipleObjectPicker/controller"], function (multipleObjectPickerController) {
                    multipleObjectPickerController.openObject(dataItem);
                });
            }
        };

        $(self.element).kendoListView(listViewCtrlConfig);

    },
    refresh: function () {
        var self = this;
        var listView = $(self.element).data("kendoListView");
        var dataSource = new kendo.data.DataSource({
            data: self.viewModel.isMultiplePicker ? self.viewModel.buildListDataSource() : self.viewModel.mobileGridDataSource
        });
        //update datasource
        listView.setDataSource(dataSource);
    }
});

kendo.data.binders.ciresonRelativeEndDatePicker = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var context = bindings.ciresonRelativeEndDatePicker.source.get();
        var contextValue = context.value;

        context.dropdownEndChange = function () {
            var relativeDate = new Date();
            var currentDate = new Date();
            var quarter = Math.round((currentDate.getMonth() - 1) / 3 + 1);
            var relativeType = contextValue.relativeEndDateValue;
            var offsetValue = contextValue.numericEndValue || 1;
            
            //set numeric control visibility
            switch (relativeType) {
                case "daysfromnow":
                case "daysago":
                case "monthsfromnow":
                case "monthsago":
                case "yearsfromnow":
                case "yearsago":
                    contextValue.set("showEndNumericPicker", true);
                    break;
                default:
                    contextValue.set("showEndNumericPicker", false);
                    break;
            }

            //calculate relative date
            switch (relativeType) {
                case "tomorrow":
                case "daysfromnow":
                    relativeDate.setDate(currentDate.getDate() + offsetValue);
                    break;
                case "yesterday":
                case "daysago":
                    relativeDate.setDate(currentDate.getDate() - offsetValue);
                    break;
                case "monthsfromnow":
                    relativeDate.setMonth(currentDate.getMonth() + offsetValue);
                    break;
                case "monthsago":
                    relativeDate.setMonth(currentDate.getMonth() - offsetValue);
                    break;
                case "yearsfromnow":
                    relativeDate.setFullYear(currentDate.getFullYear() + offsetValue);
                    break;
                case "yearsago":
                    relativeDate.setFullYear(currentDate.getFullYear() - offsetValue);
                    break;
                case "firstdayofmonth":
                    relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    break;
                case "lastdayofmonth":
                    relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
                    break;
                case "firstdayofyear":
                    relativeDate = new Date(currentDate.getFullYear(), 0, 1);
                    break;
                case "lastdayofyear":
                    relativeDate = new Date(currentDate.getFullYear(), 11, 31);
                    break;
                case "firstdayofquarter":
                    relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 2) - 1), 1);
                    break;
                case "lastdayofquarter":
                    relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 1) + 1), 0);
                    break;
                default:
                    break;
            }

            if (relativeDate.getHours() == 0)
                contextValue.set("endValue", kendo.toString(new Date(relativeDate.setHours(0, 0, 0, 0)), 'g'));
            else
                contextValue.set("endValue", kendo.toString(new Date(relativeDate), 'g'));
        };

        if (_.isUndefined(contextValue.isEndRelative))
            contextValue.set("isEndRelative", false);

    },
    refresh: function () {
        //todo: add any refresh code here.

        var context = this.bindings.ciresonRelativeEndDatePicker.source.get();
        var contextValue = context.value;
        contextValue.set("showEndDatePicker", (_.isUndefined(contextValue.isEndRelative) || contextValue.isEndRelative == false));
    }
});

kendo.data.binders.ciresonRelativeDatePicker = kendo.data.Binder.extend({
    init: function (element, bindings, options) {
        kendo.data.Binder.fn.init.call(this, element, bindings, options);

        var context = bindings.ciresonRelativeDatePicker.source.get();
        var contextValue = context.value;

        context.dropdownDataSource = [
            { name: localizationHelper.localize("Today"), value: 'today' },
            { name: localizationHelper.localize("Yesterday"), value: 'yesterday' },
            { name: localizationHelper.localize("Tomorrow"), value: 'tomorrow' },
            { name: localizationHelper.localize("FirstDayOfTheMonth"), value: 'firstdayofmonth' },
            { name: localizationHelper.localize("FirstDayOfTheQuarter"), value: 'firstdayofquarter' },
            { name: localizationHelper.localize("FirstDayOfTheYear"), value: 'firstdayofyear' },
            { name: localizationHelper.localize("LastDayOfTheMonth"), value: 'lastdayofmonth' },
            { name: localizationHelper.localize("LastDayOfTheQuarter"), value: 'lastdayofquarter' },
            { name: localizationHelper.localize("LastDayOfTheYear"), value: 'lastdayofyear' },
            { name: localizationHelper.localize("DaysAgo"), value: 'daysago' },
            { name: localizationHelper.localize("MonthsAgo"), value: 'monthsago' },
            { name: localizationHelper.localize("YearsAgo"), value: 'yearsago' },
            { name: localizationHelper.localize("DaysFromNow"), value: 'daysfromnow' },
            { name: localizationHelper.localize("MonthsFromNow"), value: 'monthsfromnow' },
            { name: localizationHelper.localize("YearsFromNow"), value: 'yearsfromnow' }
        ];

        context.dropdownChange = function () {
            var relativeDate = new Date();
            var currentDate = new Date();
            var quarter = Math.round((currentDate.getMonth() - 1) / 3 + 1);
            var relativeType = contextValue.relativeDateValue;
            var offsetValue = contextValue.numericValue || 1;

            //set numeric control visibility
            switch (relativeType) {
                case "daysfromnow":
                case "daysago":
                case "monthsfromnow":
                case "monthsago":
                case "yearsfromnow":
                case "yearsago":
                    context.set("showNumericPicker", true);
                    break;
                default:
                    context.set("showNumericPicker", false);
                    break;
            }

            //calculate relative date
            switch (relativeType) {
                case "tomorrow":
                case "daysfromnow":
                    relativeDate.setDate(currentDate.getDate() + offsetValue);
                    break;
                case "yesterday":
                case "daysago":
                    relativeDate.setDate(currentDate.getDate() - offsetValue);
                    break;
                case "monthsfromnow":
                    relativeDate.setDate(currentDate.getMonth() + offsetValue);
                    break;
                case "monthsago":
                    relativeDate.setDate(currentDate.getMonth() - offsetValue);
                    break;
                case "yearsfromnow":
                    relativeDate.setDate(currentDate.getFullYear() + offsetValue);
                    break;
                case "yearsago":
                    relativeDate.setDate(currentDate.getFullYear() - offsetValue);
                    break;
                case "firstdayofmonth":
                    relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    break;
                case "lastdayofmonth":
                    relativeDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
                    break;
                case "firstdayofyear":
                    relativeDate = new Date(currentDate.getFullYear(), 0, 1);
                    break;
                case "lastdayofyear":
                    relativeDate = new Date(currentDate.getFullYear(), 11, 31);
                    break;
                case "firstdayofquarter":
                    relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 2) - 1), 1);
                    break;
                case "lastdayofquarter":
                    relativeDate = new Date(currentDate.getFullYear(), ((3 * quarter - 1) + 1), 0);
                    break;
                default:
                    break;
            }
            
            if(relativeDate.getHours() == 0)
                contextValue.set("dateValue", kendo.toString(new Date(relativeDate.setHours(0, 0, 0, 0)), 'g'));
            else
                contextValue.set("dateValue", kendo.toString(new Date(relativeDate), 'g'));
        };

        if (_.isUndefined(contextValue.isRelative))
            contextValue.set("isRelative", false);
    },
    refresh: function () {
        //todo: add any refresh code here.

        var context = this.bindings.ciresonRelativeDatePicker.source.get();
        var contextValue = context.value;
        context.set("showDatePicker", (_.isUndefined(contextValue.isRelative) || contextValue.isRelative == false));
    }
});
