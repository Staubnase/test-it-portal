/**
Grid Events
**/
define(function (require) {
    var definition = {
        build: function (vm, node, callback) {

            vm.events = {
                handleRowClick: function (selected, myGrid) {
                    var fwdLocation = false;
                    //get grid row data type
                    var gridRow = myGrid.dataItem(selected);
                    var objectId = gridRow.Id;
                    var type;
                    /*
                     * FOR ASSET MANAGEMENT
                     * you will be able to extend the if/else below to allow you to get the asset type from the grid row
                     * If you check to see if gridRow.WhateverType exists and it does, we can know it is coming from an asset grid
                     * 
                     * The final else currently just catched anything we haven't coded for and shows an error.
                     */
                    //determines type which is used to determine forwarding location and ids needed
                    if (!_.isUndefined(gridRow.WorkItemType)) {
                        type = gridRow.WorkItemType;
                        if (gridRow.WorkItemType == "Activity") {
                            type = gridRow.WorkItemTypeClass;
                        }
                    } else {
                        if (vm.grid.GridType == "ConfigItem") {
                            //no forwarding on config items, show popup details instead
                            vm.events.openModal(gridRow);
                            return;
                        } else if (vm.grid.GridType == "WarrantyContract") {
                            location = "/AssetManagement/Contract/Warranty/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "LeaseContract") {
                            location = "/AssetManagement/Contract/Lease/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "SupportAndMaintenanceContract") {
                            location = "/AssetManagement/Contract/SupportandMaintenance/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "HardwareAsset") {
                            location = "/AssetManagement/HardwareAsset/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "RequestOffering") {
                            location = "/ServiceCatalog/RequestOffering/" + gridRow.Id + ',' + gridRow.ServiceInfo.Id;
                            return;
                        } else if (vm.grid.GridType == "KnowledgeArticle") {
                            location = "/KnowledgeBase/View/" + gridRow.ArticleId + '?seletedTab=enduser';
                            return;
                        } else if (vm.grid.GridType == "CostCenter") {
                            location = "/AssetManagement/Administration/CostCenter/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Location") {
                            location = "/AssetManagement/Administration/Location/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "NoticeEvent") {
                            location = "/AssetManagement/Administration/NoticeEvent/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Organization") {
                            location = "/AssetManagement/Administration/Organization/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Standard") {
                            location = "/AssetManagement/Administration/Standard/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Subnet") {
                            location = "/AssetManagement/Administration/Subnet/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Vendor") {
                            location = "/AssetManagement/Administration/Vendor/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "CatalogItem") {
                            location = "/AssetManagement/Administration/CatalogItem/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "License" || vm.grid.GridType == "Licence") {
                            location = "/AssetManagement/Administration/License/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "SoftwareAsset") {
                            location = "/AssetManagement/SoftwareAsset/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "PurchaseOrder") {
                            location = "/AssetManagement/Administration/PurchaseOrder/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Purchase") {
                            location = "/AssetManagement/Administration/Purchase/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Invoice") {
                            location = "/AssetManagement/Administration/Invoice/Edit/" + gridRow.BaseId;
                            return;
                        } else if (vm.grid.GridType == "Consumable") {
                            location = "/AssetManagement/Administration/Consumables/Edit/" + gridRow.BaseId;
                            return;
                        }else if (vm.grid.GridType == "Announcement") {
                            location = "/Administration/Announcement/Edit/" + gridRow.Id;
                            return;
                        } else if (vm.grid.GridType == "PromotedView") {
                            return;
                        } else if (vm.grid.GridType == "Localization") {
                            return;
                        } else if (vm.grid.GridType == "EditableKnowledgeArticle") {
                            location = "/KnowledgeBase/View/" + gridRow.ArticleId;
                            return;
                        } else {
                            kendo.ui.ExtAlertDialog.show({
                                title: localization.ErrorDescription,
                                icon: "fa fa-frown-o",
                                message: 'Error in row click event. Record Type was not found.' //TODO: localize me?
                            });
                            return;
                        }
                    }

                    /*
                    * <fancy> way of checking to see if we have this in the grid def:
                    * 
                    rowClicks : [{          <-First make sure we have the array and at least 1 items in it
                        "Incident" : {      <-Look at all the items and see if there is a key that matches out data type
                            . . . 
                        }
                    }]

                    * If we have a match, use custom definitions, otherwise, use default
                    */
                    var clickDefinitions;
                    var useDefaultRowClick = true;

                    if (!_.isUndefined(node)) {
                        _.find(node, function (event) {
                            clickDefinitions = event.rowClicks;

                            useDefaultRowClick = !(clickDefinitions.length > 0 && _.find(clickDefinitions, function (clickDef) {
                                return _.keys(clickDef)[0] === type.split('.').pop();
                            }));
                        });
                    }
                    /*
                     * </fancy>
                     */

                    if (useDefaultRowClick) {
                        setDefaultRoute(type);
                    } else {
                        var rowClickDefinition = _.find(node, function (event) { return !_.isUndefined(event.rowClick); });
                        _.each(clickDefinitions, function (rowClick) {

                            var targetType = _.keys(rowClick)[0];

                            if (type.split('.').pop() == targetType) {

                                if (!_.isUndefined(rowClick[targetType].actionUrl)) {
                                    fwdLocation = rowClick[targetType].actionUrl + objectId + "/";
                                }

                                var customFunction = app.lib.getFunctionFromString(rowClick[targetType].actionFunction);
                                if (!_.isUndefined(customFunction)) {
                                    try {
                                        //custom defined function should return the url to forward 
                                        //-or- return false if they are handling the forward location in the function
                                        fwdLocation = customFunction(gridRow, myGrid, fwdLocation);
                                        //in case we get something other than string or false back from customFunction
                                        if (!_.isString(fwdLocation)) {
                                            fwdLocation = false;
                                        }

                                    } catch (e) {
                                        return kendo.ui.ExtAlertDialog.show({
                                            title: localization.ErrorDescription,
                                            icon: "fa fa-frown-o",
                                            message: "Custom function error:    " + e
                                        });
                                    }
                                } else {
                                    setDefaultRoute(type);
                                }

                            }
                        }); // end _.each
                    } // end custom


                    /*
                     * FOR ASSET MANAGEMENT
                     * similar to above, check whatever your data type is and put some more 
                     * if blocks in here to do what you need to for routes.
                     */
                    function setDefaultRoute(itemType) {
                        //default forward location definitions for all current grids.
                        if (gridRow.WorkItemType == "Activity") {
                            $.get("/grid/GetActivityParentWorkItem", { id: gridRow.BaseId }, function (data) {
                                gridRow.ParentWorkItemType = data.ParentWorkItemType;
                                gridRow.ParentWorkItemId = data.ParentWorkItemId;
                                getActivityParentWorkItem(itemType);
                                window.location = fwdLocation;
                            });
                        } else {
                            getActivityParentWorkItem(itemType);
                        }
                    }

                    function getActivityParentWorkItem(itemType) {

                        if (itemType.indexOf("System.WorkItem") > -1) {
                            //It is a work Item
                            fwdLocation = '/' + itemType.split('.').pop() + '/Edit/' + objectId + '/';

                            if (itemType.indexOf("Activity") > -1) {
                                //if it is from my work->approval page, redirect to RA approval form
                                if (!_.isUndefined(vm.grid.GridSubType)) {
                                    var approvalUrl = "";
                                    switch (vm.grid.GridSubType) {
                                        case "myapprovals":
                                            approvalUrl = "/ReviewActivity/Approval/" + objectId;
                                            break;
                                        case "mymanualactivities":
                                            approvalUrl = "/ManualActivity/Complete/" + objectId;
                                            break;
                                        default:
                                            approvalUrl = "/Activity/Edit/" + objectId;
                                            break;
                                    }
                                    fwdLocation = approvalUrl;
                                } else {
                                    //It is a work item activity
                                    fwdLocation = '/Activity/Edit/' + objectId;
                                }
                            }
                        }
                    }

                    if (fwdLocation) {
                        //give the user some idea that something is loading
                        $("body").css("cursor", "progress");
                        if (vm.fromQueryBuilder && !vm.isSavedQuery) {
                            //fallback for ie which does not support origin
                            if (!window.location.origin) {
                                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
                            }
                            //open in new tab
                            window.open(window.location.origin + fwdLocation, '_blank');
                        } else {
                            window.location = fwdLocation;
                        }
                    }
                },
                //this is used on the config items grid
                openModal: function (selectedRowItem) {
                    var detailsPopupEle = $("<div>");
                    detailsPopupEle.appendTo("body");

                    var detailsPopup = detailsPopupEle.kendoCiresonWindow({
                        title: "",
                        width: 550,
                        height: 500,
                        actions: ["Close"]
                    }).data("kendoWindow");

                    detailsPopup.refresh({
                        url: "/Search/ObjectViewer",
                        data: { id: selectedRowItem.Id }
                    });
                    detailsPopupEle.find(".k-content").html("<div style='padding: 55px'>Loading...</div>");
                    detailsPopup.title(selectedRowItem.DisplayName).center().open();
                },
                //called on edit and new events on editable grids
            };


            //events tied to kendo grid (not the kendo datasource)
            vm.builtinEvents = {
                edit: function (e) { //called on edit and new events on grid
                    if (!e.model.isNew()) {
                        if ($(e.container).data('editable') == false) {
                            $(e.container).find('input').attr("disabled", "disabled").addClass("k-state-disabled");
                        }
                    }
                },
                excelExport: function (e) {
                    //This will format the datetime when exporting to excel.
                    var sheet = e.workbook.sheets[0];
                    var grid = e.sender;
                    var fields = grid.dataSource.options.fields;
                    var fieldsModels = grid.dataSource.options.schema.model.fields;
                    var dateCells = [];
                    var columns = _.reject(grid.columns, function (el) {
                        return el.hidden === true;
                    });
                    //get all data instead of grid paged data (grid.dataSource.view())
                    var data = e.data || [];

                    //iterate groups to get group items
                    function iterateSubGroup(groups, new_data) {
                        var arr = new_data;
                        for (var i = 0; i < groups.length; i++) {
                            var group = groups[i];
                            if (group.items) {
                                if (!group.hasSubgroups)
                                    Array.prototype.push.apply(arr, group.items);
                                else
                                    iterateSubGroup(group.items, arr);
                            }
                        }
                        return arr;
                    }

                    //for grouped data, merge e.data[index].items
                    if (grid._group) {
                        var new_data = iterateSubGroup(data, []);
                        data = new_data;
                    }

                    var dataRowCount = 0;
                    for (var rowIndex = 0; rowIndex < sheet.rows.length; rowIndex++) {
                        //process data rows only, exclude header and group header rows
                        if (sheet.rows[rowIndex].type === "data") {
                            var row = sheet.rows[rowIndex];
                            var dataCellCount = 0;
                            for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                                var cellValue = row.cells[cellIndex].value;
                                //process value cells only, exclude header and group cells
                                if (row.cells[cellIndex].hasOwnProperty('value')) {
                                    //apply date formatting if value is a date/datetime
                                    if (!_.isNull(cellValue) && cellValue instanceof Date && !_.isNaN(Date.parse(cellValue)) && data[dataRowCount]) {
                                        var inlineData = data[dataRowCount];
                                        var inlineTemplate = (columns[dataCellCount] && columns[dataCellCount].template) ? kendo.template(columns[dataCellCount].template) : "#: kendo.toString(new Date(" + columns[dataCellCount].field + "), 'g') #";

                                        row.cells[cellIndex].value = inlineTemplate(inlineData);
                                    }
                                    dataCellCount++;
                                }
                            }
                            dataRowCount++;
                        }
                    }
                }
            }
            callback();
        }
    }
    return definition;
});
