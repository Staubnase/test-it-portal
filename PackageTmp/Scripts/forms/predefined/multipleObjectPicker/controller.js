/**
multipleObjectPicker
**/

define(function (require) {
    var tpl = require("text!forms/predefined/multipleObjectPicker/view.html");
    var objectPickerPopup = require("forms/popups/multipleObjectPickerPopup/controller");

    var projectionSearchUrl = "/Search/GetObjectProjectionByCriteria";
    var definition = {
        template: tpl,
        Grid: null,
        build: function (vm, node, callback) {
            boundObj = node.vm;
            name = node.PropertyName;

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }

            var properties = {
                Disabled: false,
                ClassId: "",
                PropertyToDisplay: [],
                PropertyName: "",
                ShowAddButton: true,
                ShowRemoveButton: true,
                Scoped: false,
                ClassProperties: "",
                SelectableRow: false,
                SelectProperty: "Id",
                ProjectionId: "",
                HiddenProperty: null,//separated by comma only
                IsMobileView: app.isMobileDevice()
            };

            $.extend(true, properties, node);

            //refresh properties
            this.Disabled = false;
            this.PropertyToDisplay = [];

            //check if is a valid json. If not, then this will try to parse the string value.
            try {
                properties.PropertyToDisplay = JSON.parse(properties.PropertyToDisplay);
            } catch (e) { }


            if (properties.PropertyToDisplay.length <= 0) { properties.PropertyToDisplay = { DisplayName: "DisplayName", Path: "Path", Status: "Status" }; }
            for (var prop in properties.PropertyToDisplay) {
                properties.ClassProperties = properties.ClassProperties.concat(prop).concat(",");
            }

            if ((properties.PropertyName === "HasRelatedWorkItems") && (properties.ClassProperties.indexOf("AssetStatus") < 0)) {
                properties.ClassProperties = properties.ClassProperties.concat("AssetStatus");
            }

            if (!_.isNull(properties.HiddenProperty)) { //This will be use to load properties that is not need to display
                properties.ClassProperties += properties.HiddenProperty.concat(",");
            }

            //set properties for watchlist
            if ((properties.PropertyName === "WatchList")) {
                if (!session.consoleSetting.DashboardsLicense.IsValid || !session.enableWatchlist) {
                    properties.Visible = false;
                }
                //hide add/remove option when current user is and enduser and he or she is not the affected user
                if ((!session.user.Analyst) && (typeof boundObj.RequestedWorkItem != 'undefined') && (session.user.Id != boundObj.RequestedWorkItem.BaseId)) {
                    properties.ShowAddButton = false;
                    properties.ShowRemoveButton = false;
                }
            }

            var built = _.template(tpl);
            var templateFrag = $(built(properties));

            //used on RelatesToWorkItem relatinship, exclude current workitem from list
            var filter = { field: "BaseId", operator: "neq", value: boundObj.BaseId };
            var relationshipId = null;
            if (!_.isUndefined(boundObj.NameRelationship)) {
                var relItem = _.find(boundObj.NameRelationship, function (relItem) {
                    return relItem.Name == properties.PropertyName;
                });
                if (!_.isUndefined(relItem) && !_.isNull(relItem)) {
                    relationshipId = relItem.RelationshipId
                }
            }

            var popupWindow = (properties.PropertyName === "RelatesToWorkItem") ?
                objectPickerPopup.getPopup(properties.ClassId, properties.ClassProperties, null, filter, null, false, relationshipId) :
                objectPickerPopup.getPopup(properties.ClassId, properties.ClassProperties, null, null, null, false, relationshipId);

            var objectPicker = new Control(templateFrag.find("[data-control='multipleObjectPicker']"), boundObj, name, properties, popupWindow);
            templateFrag.find("[data-control='multipleObjectPicker']").attr("data-control", "multipleObjectPickerBound");

            callback(templateFrag);

            return this.Grid;
        },
        openObject: function (selectedItem) {
            window.open(app.gridUtils.getObjectLinkUrl(selectedItem), '_blank');
        }
    }

    var Control = function (targetEle, boundObj, name, properties, popupWindow) {
        //use setters and getters if you want vm boundOdj to trigger change
        if (_.isUndefined(boundObj[name])) {
            boundObj.set(name, new kendo.data.ObservableArray([]));
        }

        //if related object is of single cardinality, create a new array and add the related object 
        var boundArray = !_.isUndefined(boundObj[name].length) ? boundObj.get(name) : new kendo.data.ObservableArray([boundObj.get(name)]);
        boundArray.properties = properties;
        
        var self = this;

        var __construct = function () {
            buildSubProperties();
            bindButtonEvents();
            createGrid();
        }

        var buildSubProperties = function () {
            var propToFill = [];
            //This will going to build array of display properties that has sub properties. Ex:Target_PurchaseHasPurchaseOrder.DisplayName
            for (var prop in properties.PropertyToDisplay) {
                var propSplit = prop.split(".");
                if (propSplit.length > 1) {
                    propToFill.push(propSplit);
                }
            }

            //This will going to check all properties. If property is not existing, this will going to create a dummy property so that kendo will render the grid.
            _.each(boundArray, function (data) {
                _.each(propToFill, function (prop) {
                    var mainProp = prop[0];
                    var subProp = prop[1];
                    if (_.isUndefined(data[mainProp])) {
                        data[mainProp] = {};
                        data[mainProp][subProp] = "";
                    }
                });
            });
        }

        //Make this global so that this can be used when inserting data outside multiple object picker.
        //This is the solution for now since kendo grid doesn't have preDataBinding which I need to manipulate data before binding
        //This function is called also from software asset "copy license assignment" task
        boundArray.addItem = function (object) {
            var isItemExist = false;
            if (isDuplicate(object.BaseId)) {
                return;
            }
            
            _boundArray = this;
            //This will going to get object related items
            if (!_.isUndefined(_boundArray.properties.ProjectionId) && !_.isNull(_boundArray.properties.ProjectionId) && _boundArray.properties.ProjectionId != "") {
                var colNames = "";
                var splitedProp = [];
                //This will going to get thos property whos have sub child on it.
                //Ex. PropertyToDisplay: { DisplayName: "DisplayName", "Currency.Name": "Currency", Cost: "Cost","Target_PurchaseHasPurchaseOrder.DisplayName":"Purchase Order" }
                // => Target_PurchaseHasPurchaseOrder.DisplayName and Currency.Name
                for (var prop in _boundArray.properties.PropertyToDisplay) {
                    var propperty = prop.split(".");
                    if (propperty.length > 1) {
                        splitedProp.push(propperty);
                        colNames = colNames == "" ? prop : colNames + "," + prop;

                    }
                }
                
                $.post(projectionSearchUrl, { baseId: object.BaseId, projectionId: _boundArray.properties.ProjectionId, columnNames: colNames }, function (result) {
                    for (index in result.Data) {
                        for (propIndex in splitedProp) {
                            var value = result.Data[index][splitedProp[propIndex][0]];
                            if (!_.isUndefined(value[splitedProp[propIndex][1]])) { //this will check if this property is undefined or not. This will going to avoid conflict with enums
                                object[splitedProp[propIndex][0]] = value;
                            }
                        }
                    }
                    
                    _boundArray.push(object);
                });
            } else {
                _boundArray.push(object);
            }
        }

        var bindButtonEvents = function () {
            var actions = {
                addClick: function () {
                    popupWindow.setSaveCallback(function (object) {
                        for (var prop in properties.PropertyToDisplay) {
                            //If property is not existing, this will going to create a dummy property so that kendo will render the grid.
                            if (_.isUndefined(object[prop])) {
                                var fieldType = properties.PropertyToDisplay[prop].FieldType;
                                if (_.isUndefined(fieldType)) {
                                    object[prop] = null;
                                }
                                else {
                                    //Example can be found on consumable RelatedAssignedUser
                                    if (fieldType == "number") {
                                        //Assigned 0 so that the grid will make the cell number spinner if you want it to be editable.
                                        var propSettings = properties.PropertyToDisplay[prop];
                                        if (_.isUndefined(propSettings.Validation) || _.isUndefined(propSettings.Validation.min)) {
                                            object[prop] = 0;
                                        }
                                        else {
                                            object[prop] = propSettings.Validation.min;
                                            object.set(prop, propSettings.Validation.min);
                                        }
                                    }
                                    else {
                                        object[prop] = null;
                                    }
                                }

                            }
                        }
                        boundArray.addItem(object);

                        //if related object is of single cardinality, replace the value
                        if (_.isUndefined(boundObj[name].length)) {
                            boundArray.shift();
                            boundObj.set(name, boundArray[0]);
                        }
                    });
                    popupWindow.open();
                }
            };

            //bind add click event
            targetEle.find('[data-click]').each(function () {
                if (actions[$(this).attr('data-click')]) {
                    $(this).click(actions[$(this).attr('data-click')]);
                }
            });

            //hide add button when ShowAddButton=false or if Disabled
            if (!properties.ShowAddButton || properties.Disabled || properties.vm.isDisabled) {
                targetEle.find('[data-click]').each(function () {
                    $(this).hide();
                });
            }
        }

        var createGrid = function () {
            var gridEle = targetEle.find("[data-control-grid]");
            //always unhide remove button for watchlist 
            var hideRemoveButton = (properties.PropertyName === "WatchList") ? false : (!properties.ShowRemoveButton || properties.Disabled || properties.vm.isDisabled);

            

            //This will going to fix bug 26395 where if grid is empty, the number validation won't work if first load is empty
            if (properties.vm[properties.PropertyName].length <= 0) {
                properties.vm[properties.PropertyName].push({ t: true, BaseId: "", BaseType: "", DisplayName:"",Path:"" });

                if (_.isUndefined(properties.vm.PropertiesToClean)) {
                    properties.vm.PropertiesToClean = [];
                }

                properties.vm.PropertiesToClean.push(properties.PropertyName);
            }


            //building grid columns
            var columnFields = buildColumnFields(properties.PropertyToDisplay);
            var columnToDisplay = buildGridColumns(columnFields, hideRemoveButton);
            var grid = gridEle.kendoGrid({
                columns: columnToDisplay,
                scrollable: false,
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
                reorderable: true,
                sortable: true,
                columnMenu: {
                    messages: {
                        columns: localization.ChooseColumns,
                        filter: localization.Filter,
                        sortAscending: localization.SortAscending,
                        sortDescending: localization.SortDescending
                    }
                },
                editable: {
                    confirmDelete: "Delete",
                    cancelDelete: "Cancel",
                    mode: "incell",
                    template: null,
                    create: true,
                    update: true,
                    destroy: true
                },
                toolbar: {},
                dataSource: {
                    transport: {
                        prefix: "",
                        read: {
                            url: ""
                        }
                    },
                    type: "aspnetmvc-ajax",
                    schema: {
                        data: "Data",
                        total: "Total",
                        errors: "Errors",
                        model: {
                            id: "BaseId",
                            fields: columnFields
                        }
                    },
                    data: {
                        Data: boundArray,
                        Total: boundArray.length
                    }
                },
                dataBinding: function (e) {
                    
                    //Change to only pass specific item
                    if (!_.isUndefined(e.items) && e.items.length > 0) {
                        formatPropertyInBoundArray(e, properties.ClassProperties)
                    }
                },
                dataBound: function (e) {

                    if (properties.Scoped) {
                        scopeBoundArray(this, properties.ClassId, properties.ClassProperties);
                    }
                },
                selectable: properties.SelectableRow ? "multiple row" : false
            });

            definition.Grid = grid;

            if (!app.isMobile()) {

                grid.data("kendoGrid").dataSource.originalFilter = grid.data("kendoGrid").dataSource.filter;

                // Replace the original filter function.
                grid.data("kendoGrid").dataSource.filter = function () {

                    // Call the original filter function.
                    var result = grid.data("kendoGrid").dataSource.originalFilter.apply(this, arguments);

                    // If a column is about to be filtered, then raise a new "filtering" event.
                    if (arguments.length > 0) {
                        this.trigger("filterApplied", arguments);
                    }

                    return result;
                }

                grid.data("kendoGrid").dataSource.bind("filterApplied", function () {
                    $.each($(grid).find("th a.k-header-column-menu i"), function () {
                        $(this).remove();
                    });

                    if (grid.data("kendoGrid").dataSource.filter()) {

                        var dsFilters = grid.data("kendoGrid").dataSource.filter().filters || [];

                        for (var i in dsFilters) {
                            $(grid).find("th[data-field=" + dsFilters[i].field + "] a.k-header-column-menu").append("<i class=\"fa fa-filter\"></i>");
                        }

                    }
                });
            }



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

        var buildGridColumns = function (columnFields, showRemovButton) {
            var columns = [];

            for (var prop in properties.PropertyToDisplay) {
                var propertyKey = prop;
                var localizationKey = "";
                var header = properties.PropertyToDisplay[prop];
                var isEditable = false;
                var hasveHeader = false;

                if (!_.isUndefined(header.Header)) {
                    localizationKey = header.Header;
                    isEditable = header.Editable
                    hasveHeader = true;
                }
                else {
                    localizationKey = header;
                }

                var localizedText = (!_.isUndefined(localization[localizationKey]) && [localizationKey].length > 0) ? localization[localizationKey] : localizationKey;
                var columnClass = (properties.SelectableRow && propertyKey === properties.SelectProperty) ? "grid-highlight-column" : "";

                

                var templ = (columnFields[propertyKey].type == "date")
                    ? "#= (" + propertyKey + ") ? kendo.toString(new Date(" + propertyKey + "), kendo.culture().calendar.patterns.g) : '' #"
                    : "#= (" + propertyKey + ") ? " + propertyKey + " : '' #";
                var tpl = (properties.SelectableRow && propertyKey === properties.SelectProperty) ? "<a target='_blank' href='#var url = app.gridUtils.getObjectLinkUrl(data);##=url#'> " + templ + " </a><span class='pull-right relatedItems-grid-links'><a class='highlight-default-icon' target='_blank' href='#var url = app.gridUtils.getObjectLinkUrl(data);##=url#'><i class='fa fa fa-external-link'></i></a></span>" : templ;


                if (isEditable) {
                    columnClass = columnClass + " editable-cell";
                }


                var columnSettings = {
                    title: localizedText,
                    width: "210px",
                    field: propertyKey,
                    filterable: {},
                    encoded: true,
                    editable: function (e) {
                        return this.isEditable;
                    },
                    isEditable: isEditable,
                    attributes: {
                        "class": columnClass
                    },
                };

                if (!hasveHeader) {
                    columnSettings.template = tpl;
                }

                columns.push(columnSettings);
            }
            
            columns.push({ title: localization.BaseId, width: "210px", field: "BaseId", filterable: {}, encoded: true, hidden: true });
            columns.push({ width: "105px", command: [{ name: "destroy", text: localization.Remove }], hidden: showRemovButton });

            return columns;
        }


        //traverse and format date
        var formatPropertyInBoundArray = function (currentItemEvent, columnString) {
            var currentItem = currentItemEvent.items[0];
            $.each(columnString.split(","), function (i, column) {
                $.each(boundArray, function (index, item) {
                    //mutate poorly structured provided enum data 
                    if (column.indexOf('.') > 0) {
                        var property = column.split('.')[0];
                        if (_.isUndefined(item[property])) {
                            if (column.split('.').length === 2) {
                                boundArray[index][property] = { Id: "", Name: "" }
                            } else {
                                var jsonProperty = "";
                                $.each(column.split('.').reverse(), function (inx, propName) {
                                    if (inx === 0) {
                                        jsonProperty = "{\"" + propName + "\":" + item[column] + "}";
                                    } else {
                                        jsonProperty = "{\"" + propName + "\":" + jsonProperty + "}";
                                    }
                                });
                                boundArray[index] = $.extend(boundArray[index], JSON.parse(jsonProperty));
                            }
                        }
                    }
                    if (currentItem.BaseId != item.BaseId && currentItemEvent.action == "add") return; //This will be only used when adding new items
                    if (_.isUndefined(item[column]) || _.isNull(item[column])) { return; }
                    if (_.isBoolean(item[column]) || _.isNumber(item[column])) { return; }
                    if (!_.isUndefined(item[column].Name)) { boundArray[index][column] = item[column].Name; } //enums
                });
            });
        }

        var scopeBoundArray = function (grid, scopeClassId, PropertyToDisplay) {

            if (scopeClassId === "") { return; }

            $.ajax({
                url: "/Search/GetSearchClasses",
                data: { classId: scopeClassId },
                async: false,
                timeout: 3000,
                success: function (data) {
                    var objectIds = [];
                    $.each(data, function (ii, iitem) {
                        objectIds.push(iitem["Item1"]);
                    });

                    $.each(grid._data, function (ii, iitem) {
                        if (!_.contains(objectIds, this.ClassTypeId)) {
                            var row = grid.tbody.find("tr[data-uid='" + this.uid + "']");
                            row.hide();
                        }
                    });
                }
            });
        }

        var openObject = function (selectedItem) {
            window.open(app.gridUtils.getObjectLinkUrl(selectedItem), '_blank');
        }

        var buildColumnFields = function (properties) {
            var fields = {};
            for (var prop in properties) {
                if (prop.indexOf("Date") > -1 || prop == "LastModified") {
                    fields[prop] = {
                        type: "date",
                        parse: function (date) {
                            if (_.isNull(date) || _.isUndefined(date)) {
                                return '';
                            } else {
                                return new Date(date.toString().split('.')[0].concat('Z'));
                            }
                        }
                    };
                } else {
                    var tempProp = properties[prop];
                    if (_.isUndefined(tempProp.Header)) {
                        fields[prop] = {
                            type: "string", editable: false };
                    }
                    else {
                        //First applied to consumable
                        var field = {
                            type: _.isUndefined(tempProp.FieldType) ? "string" : tempProp.FieldType,
                            editable: _.isUndefined(tempProp.Editable) ? false : tempProp.Editable,
                             
                        };

                        if (!_.isUndefined(tempProp.Validation)) {
                            field["validation"] = tempProp.Validation;
                        }
                        
                        fields[prop] = field;
                    }
                }
            }
            
            return fields;
        }
        __construct();
    }
    return definition;
});