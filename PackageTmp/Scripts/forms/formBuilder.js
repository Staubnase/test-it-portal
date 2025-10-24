


define([
    "forms/structure/formPanel/controller",
    "forms/structure/formPanelFull/controller",
    "forms/structure/customFieldGroup/controller",
    "forms/structure/customFieldGroupRow/controller",
    "forms/structure/columnField/controller",
    "forms/structure/tab/controller",
    "forms/structure/tabPane/controller",
    "forms/structure/tabNavigation/controller",
    "forms/structure/tabData/controller",

    "forms/predefined/actionLog/controller",
    "forms/predefined/fileAttachments/controller",
    "forms/predefined/affectedItems/controller",
    "forms/predefined/relatedItems/controller",
    "forms/predefined/childWorkItems/controller",
    "forms/predefined/userInput/controller",
    "forms/predefined/activities/controller",
    "forms/predefined/multipleObjectPicker/controller",
    "forms/predefined/history/controller",
    "forms/predefined/billableTime/controller",
    "forms/predefined/knowledgeArticle/controller",
    "forms/predefined/fileAttachmentsDragDrop/controller",
    "forms/predefined/serviceComponents/controller",
    "forms/predefined/dependentComponents/controller",
    

    "forms/fields/string/controller",
    "forms/fields/longstring/controller",
    "forms/fields/boolean/controller",
    "forms/fields/display/controller",
    "forms/fields/spacer/controller",
    "forms/fields/numeric/controller",
    "forms/fields/int/controller",
    "forms/fields/decimal/controller",
    "forms/fields/double/controller",
    "forms/fields/date/controller",
    "forms/fields/datetime/controller",
    "forms/fields/enum/controller",
    "forms/fields/userPicker/controller",
    "forms/fields/objectPicker/controller",
    "forms/fields/button/controller",
    "forms/fields/editor/controller",
    "forms/fields/combo/controller",
    "forms/fields/dropDownList/controller",
    "forms/fields/bundle/controller",
    "forms/fields/fileUpload/controller",
    "forms/fields/urlTextbox/controller",
    "forms/fields/percentage/controller"
    


], function (formPanel,
    formPanelFull,
    customFieldGroup,
    customFieldGroupRow,
    columnField,
    tab, //.tab-content
    tabPane, //.tab-pane
    tabNavigation, //ul
    tabData,//li

    actionLog,
    fileAttachments,
    affectedItems,
    relatedItems,
    childWorkItems,
    userInput,
    activities,
    multipleObjectPicker,
    history,
    billableTime,
    knowledgeArticle,
    fileAttachmentsDragDrop,
    serviceComponents,
    dependentComponents,
    

    String,
    LongString,
    Boolean,
    Display,
    Spacer,
    Numeric,
    Int32,
    Decimal,
    Double,
    Date,
    DateTime,
    Enum,
    UserPicker,
    ObjectPicker,
    Button,
    Editor,
    Combo,
    DropDownList,
    Bundle,
    FileUpload,
    UrlTextbox,
    Percentage) {

    var mainContainer;
    var jsonTemplate;
    var viewModel;

    var definition = {
        build: function (vm, callback) {
           
            viewModel = vm.viewModel;
            jsonTemplate = vm.formTemplate;
            if (_.isUndefined(jsonTemplate)) {
                console.log("Form ID not found.", "You must add a template with the key of 'Default'. This is used for fallback if a specific template is not found.");
                return;
            }
            // Decide on layout template
            eval("var _obj = " + jsonTemplate.layoutType + ";");
            // if no template was found, use default ('form')
            if (!_obj) {
                _obj = formPanel;
            }

            _obj.build(function (tplString) {
                mainContainer = $(tplString);
            });

            readTemplate(mainContainer, jsonTemplate);
            callback(mainContainer);
            //see if we have a non-default tab selection
            $("a[selected='selected']").tab('show'); //selected tab for loading ex: http://localhost:13463/Incident/Edit/IR430/?tab=activity&activityId=MA798
            
        }
    }

    var readTemplate = function (container, json, columns) {
        var columns = (columns != undefined && columns !== false) ? columns : false;

        $.each(json, function (key, item) {
            if (key != "layoutType") {
                jsonDecision(container, key, item, columns);
            }
        });
    }

    // Mutate any jsonFormTemplate items by name:value
    var mutationLogic = {
        // Run on all properties
        all: function (propValue) {
            propValue.vm = viewModel; // pass in viewModel
        },
        tabList: function (tabList) {
            jsonTemplate.tabNavigation = {
                nodeCount: tabList.length,
                tabData: []
            }
            tabNavigation.build(viewModel, jsonTemplate, function (tabtplString) {
                var tabnavCont = $(tabtplString);

                //prevent multiple tabs being set to focus. 
                var focusSet = false;
                $.each(tabList, function (i, tabNode) {
                    //this gets ?tab= data from uri if present
                    var focusedTab = app.getParameterByName("tab").toLowerCase();
                    var tabNodeNameKey = tabNode.name;
                    //set vals
                    tabNode.tabId = app.lib.newGUID();
                    tabNode.active = (i == 0) ? "active" : "";
                    tabNode.content.tabId = tabNode.tabId;
                    tabNode.content.active = tabNode.active;

                    //call build on each nav node 
                    tabData.build(viewModel, tabNode, function (tplString) {
                        //append to tabnavcont
                        var element = $(tplString);

                        if (app.isMobile()) {
                            tabnavCont.children('.nav-dropdown-content').find('ul').append(element);
                        } else {
                            tabnavCont.append(element);
                        }
                      
                        if (!app.isMobile()) {
                            //--Start focus tab logic
                            //check if there we found and focused tab param in the uri
                            if (!focusSet && focusedTab.length > 0) {
                                //this statement will set focus if they have a tab name in the uri that matches a tab name on the page
                                if (tabNodeNameKey.toLowerCase() === focusedTab) {
                                    element.find("a").attr("selected", "true");
                                    focusSet = true;
                                }

                                //if focus is on activity tab (i.e. click an activity from the grid) set focus on tab and open activity
                                switch (focusedTab) {
                                    case "activity":
                                        //find the activity tab based on control type
                                        $.each(tabNode.content, function (i, content) {
                                            $.each(content.customFieldGroupList, function (i, group) {
                                                if (group.type === "activities") {
                                                    element.find("a").attr("selected", "true");
                                                    focusSet = true;
                                                };
                                            });
                                        });
                                        break;
                                    default:
                                        break;
                                };
                            };
                            //--End focused tab logic
                        } 
                    });
                });
                //append tabnavcont to main form panel
                mainContainer.append(tabnavCont);
            });

            // ------------ tab dropdown

        },
        // Run to determine colspan
        columnFieldList: function (columnFieldList) {
            app.lib.setColumnSizes(columnFieldList);
        }
    }



    var getContainer = function (tplReturn) {
        return (typeof (tplReturn) === "string") ? $(tplReturn) : tplReturn;
    }

    var chooseNextAction = function (container, item, objectName, columnCount) {
        if (item.content) { //this denotes a tabPane
            jsonDecision(container, objectName + "Pane", item.content);
        } else if (item.type) { //this denotes a FieldGroupList
            jsonDecision(container, item.type, item);
        } else if (item.DataType) { //denotes a standard field, like string or numeric
            jsonDecision(container, item.DataType, item);
        } else if (item.rows) { // predefined
            jsonDecision(container, objectName + "Row", item.rows);
        } else { //an array of items, re-loop to comb through the child properties
            readTemplate(container, item, columnCount);
        }
    };

    // 
    var jsonDecision = function (propContainer, propName, propValue, columns) {
        //propName is the name of the obj we will call .build on
        //propValue is the object itself, like { DataType: "UserPicker", PropertyDisplayName: "PrimaryOwner", PropertyName: "RelatesToIncident", FilterByAnalyst: true},
        var objectName = propName;

        var list = false;
        var row = false;
        var pane = false;
        var columnCount = (columns == undefined) ? false : columns; //TODO: ELI do we need this now, with the mutate function

        // mutation logic
        if (mutationLogic[propName]) {
            mutationLogic[propName](propValue);
        }
        mutationLogic["all"](propValue);

        // Check if it is a List
        if (propValue.push) {
            if (propName.indexOf("List") > -1) {
                list = true;
                objectName = propName.split("List")[0];
            }
            else if (propName.indexOf("Row") > -1) {
                row = true;
                columnCount = propValue.length;
            }
            else if (propName.indexOf("Pane") > -1) {
                pane = true;
            }
        }

        // Decide on Template
        eval("var _obj = " + objectName + ";");
        // Check if Template Exists
        if (!_obj) {
            throw Exception(objectName + " is not part of the templating system");
            return false;
        }

        // xxxList 
        if (list || row || pane) {
            if (_obj == tab) {
                //if it is a tab object, need to call build first, then loop through children
                _obj.build(viewModel, propValue, function (tplReturn) {
                    var _container = getContainer(tplReturn);
                    propContainer.append(_container);
                    $.each(propValue, function (i, item) {
                        chooseNextAction(_container, item, objectName);
                    });
                });

            } else {
                $.each(propValue, function (i, item) {
                    if (objectName == "columnField") {
                        item.columnCount = columnCount;
                    }

                    if (_obj == tabPane) { //this one passes in propValue, the else statement passes in item
                        _obj.build(viewModel, propValue, function (tplReturn) {
                            var _container = getContainer(tplReturn);
                            propContainer.append(_container);
                            readTemplate(_container, item, columnCount);
                        });
                    }
                        //todo: note, possibly do manipulation here on customFieldGroupList/Row. do account for the bs-panels being wonky.

                    else {

                        _obj.build(viewModel, item, function (tplReturn) {
                            var _container = getContainer(tplReturn);
                            propContainer.append(_container);
                            //allow view to define where children should be added 
                            if (_container.find(".append-here").length != 0) {
                                chooseNextAction(_container.find(".append-here"), item, objectName, columnCount);
                            } else {
                                chooseNextAction(_container, item, objectName, columnCount);
                            }
                        });
                    }
                });
            }
        } else {
            //we should only force a disable state if isDisabled is true
            //otherwise keep default and defined disable value
            if (!_.isUndefined(viewModel) && viewModel.isDisabled) {
                propValue.disabled = true;
            }

            _obj.build(viewModel, propValue, function (tplReturn) {
                var _container = getContainer(tplReturn);
                propContainer.append(_container);
            });
        }

    }
    return definition;
});


