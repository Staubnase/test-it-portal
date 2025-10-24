var __remoteManageWidgetSingleton;

define(function (require) {
    var tpl = require("text!forms/flyout/remoteManageWidget/view.html");
    var definition = {
        template: tpl,
        getWidget: function (vm) {
            //only build the template if the popup singleton does not exist.
            var built = _.template(tpl);
            var ele = $(built());

            var main_row = $('.page_bar.sticky-header').first().children('.row').first();
            main_row.after(ele);

            var addUserContainer = $(".addUserContainer");
            var addTemplate = kendo.template($("#addTemplate").html());

            var dataUserContainer = $(".dataUserContainer");
            var dataTemplate = kendo.template($("#dataTemplate").html());

            var addDeviceContainer = $(".addDeviceContainer");

            var dataDeviceContainer = $(".dataDeviceContainer");
            var multipleDataTemplate = kendo.template($("#multipleDataTemplate").html());
            
            var deleteicon = '<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#403f40"><path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z" fill="#403f40"/></svg>';
            var widgetActionIcon = pageForm.viewModel.isDisabled ? "" : $("<div class='support-tools__widget__action-icon'>" + deleteicon + "</div>");

            var createUserComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxusertemplate"),
                    type: 'user',
                    dataTextField: "Name"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var createPrimaryUserComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxusertemplate"),
                    type: 'primaryuser',
                    dataTextField: "Name"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var createUserDeviceComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxuserdevicetemplate"),
                    type: 'userdevice',
                    affectedUserId: vm.widget.affectedUser.BaseId,
                    dataTextField: "Text"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var createPrimaryDeviceComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxprimarydevicetemplate"),
                    type: 'primarydevice',
                    dataTextField: "Name"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var createDeviceComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxdevicetemplate"),
                    type: 'device',
                    dataTextField: "DisplayName"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var createAssetComboBox = function (type) {
                initializePicker({
                    element: $("#" + type + "Combobox1"),
                    eleContainer: $("#" + type + "Container"),
                    eleTemplate: $("#comboboxdevicetemplate"),
                    type: 'asset',
                    dataTextField: "DisplayName"
                });

                var widget = $("#" + type + "Combobox1").getKendoComboBox();
                widget.input.focus();
            }

            var affectedUserText = "affectedUser";
            var assignedUserText = "assignedUser";
            var primaryOwnerText = "primaryOwner";

            var affectedDeviceText = "affectedDevice";
            var primaryDeviceText = "primaryDevice";
            var userDeviceText = "userDevice";
            var relatedDeviceText = "relatedDevice";
            var affectedAssetText = "affectedAsset";
            var relatedAssetText = "relatedAsset";

            var getObjectDetails = function (type) {
                var details;
                if (type === affectedUserText) {
                    details = {
                        type: type,
                        title: localization.AffectedUserAppPage,
                        icon: "affected_user.svg"
                    }

                } else if (type === assignedUserText) {
                    details = {
                        type: type,
                        title: localization.AssignedUser,
                        icon: "assigned_user.svg"
                    }

                } else if (type === primaryOwnerText) {
                    details = {
                        type: type,
                        title: localization.PrimaryOwner,
                        icon: "primary_user.svg"
                    }
                } else if (type === affectedDeviceText) {
                    details = {
                        type: type,
                        title: localization.AffectedDeviceText,
                        icon: "affected_device.svg"
                    }
                } else if (type === primaryDeviceText) {
                    details = {
                        type: type,
                        title: "Primary Device",
                        icon: "primary_device.svg"
                    }
                } else if (type === userDeviceText) {
                    details = {
                        type: type,
                        title: "User Device",
                        icon: "user_device.svg"
                    }
                } else if (type === relatedDeviceText) {
                    details = {
                        type: type,
                        title: localization.RelatedDeviceText,
                        icon: "related_device.svg"
                    }
                } else if (type === affectedAssetText) {
                    details = {
                        type: type,
                        title: localization.AffectedAssetText,
                        icon: "affected_asset.svg"
                    }
                } else if (type === relatedAssetText) {
                    details = {
                        type: type,
                        title: localization.RelatedAssetText,
                        icon: "related_asset.svg"
                    }
                }

                return details;
            }

            var filter = {};
            var selected = { };

            var setToFormUserPicker = function (autocomplete, text) {
                autocomplete.ul.hide();
                autocomplete.value(text);
                autocomplete.search(text);
                setTimeout(function () {
                    autocomplete.select(autocomplete.ul.find("li").first());
                    autocomplete.trigger("change");
                    autocomplete.close();
                    autocomplete.ul.show();
                }, 300);

            }

            var setSelected = function (key, picker) {

                if (!selected[key]) return;

                var tpl = $(picker).parents(".support-tools__widget").first();
                tpl.remove();

                if (key.toLowerCase().indexOf(affectedUserText.toLowerCase()) > -1) {

                    vm.widget[affectedUserText] = _.extend(selected[key] || {},
                        {
                            widgetType: affectedUserText,
                            mailtoLink: (selected[key]["Email"]) ? "mailto:" + selected[key]["Email"] + "?Subject=" + "[" + vm.viewModel.Id + "] " + vm.viewModel.Title : ""
                        });

                    $("#" + affectedUserText + "AddLink").addClass("isDisabled");
                    dataUserContainer.append(dataTemplate(getObjectDetails(affectedUserText)));

                    vm.viewModel.set("RequestedWorkItem", selected[key]);
                    input = $("input[data-control-bind='RequestedWorkItem']").data("kendoAutoComplete");
                    setToFormUserPicker(input, selected[key].DisplayName);

                    vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(assignedUserText.toLowerCase()) > -1) {

                    vm.widget[assignedUserText] = _.extend(selected[key] || {},
                        {
                            widgetType: assignedUserText,
                            mailtoLink: (selected[key]["Email"]) ? "mailto:" +selected[key]["Email"]+ "?Subject=" + "[" +vm.viewModel.Id + "] " +vm.viewModel.Title: ""
                        });

                    $("#" + assignedUserText + "AddLink").addClass("isDisabled");
                    dataUserContainer.append(dataTemplate(getObjectDetails(assignedUserText)));

                    vm.viewModel.set("AssignedWorkItem", selected[key]);
                    input = $("input[data-control-bind='AssignedWorkItem']").data("kendoAutoComplete");
                    setToFormUserPicker(input, selected[key].DisplayName);

                    vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(primaryOwnerText.toLowerCase()) > -1) {

                    vm.widget[primaryOwnerText] = _.extend(selected[key] || {},
                        {
                            widgetType: primaryOwnerText,
                            mailtoLink: (selected[key]["Email"]) ? "mailto:" + selected[key]["Email"] + "?Subject=" + "[" + vm.viewModel.Id + "] " + vm.viewModel.Title : ""
                        });

                    $("#" + primaryOwnerText + "AddLink").addClass("isDisabled");
                    dataUserContainer.append(dataTemplate(getObjectDetails(primaryOwnerText)));

                    vm.viewModel.set("RelatesToIncident", selected[key]);
                    input = $("input[data-control-bind='RelatesToIncident']").data("kendoAutoComplete");
                    setToFormUserPicker(input, selected[key].DisplayName);

                    vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(affectedDeviceText.toLowerCase()) > -1) {

                    if (selected[key] && !_.findWhere(vm.widget[affectedDeviceText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });

                        vm.viewModel.HasRelatedWorkItems.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(primaryDeviceText.toLowerCase()) > -1) {
                    if (selected[key] && !_.findWhere(vm.widget[primaryDeviceText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });

                        vm.viewModel.HasRelatedWorkItems.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(userDeviceText.toLowerCase()) > -1) {
                    if (selected[key] && !_.findWhere(vm.widget[affectedDeviceText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });
                        vm.viewModel.HasRelatedWorkItems.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(relatedDeviceText.toLowerCase()) > -1) {

                    if (selected[key]&& !_.findWhere(vm.widget[relatedDeviceText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });

                        vm.viewModel.RelatesToConfigItem.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(affectedAssetText.toLowerCase()) > -1) {

                    if (selected[key] && !_.findWhere(vm.widget[affectedAssetText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });

                        vm.viewModel.HasRelatedWorkItems.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                } else if (key.toLowerCase().indexOf(relatedAssetText.toLowerCase()) > -1) {

                    if (selected[key] && !_.findWhere(vm.widget[relatedAssetText + "Arr"], { BaseId: selected[key].Id })) {
                        var item = _.extend(selected[key],
                            {
                                AssetStatus: ""
                            });

                        vm.viewModel.RelatesToConfigItem.push(item);
                    }

                    vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                }


                selected[key] = null;
                filter[key] = "";

                if (vm.widget[affectedUserText].BaseId && vm.widget[assignedUserText].BaseId && vm.widget[primaryOwnerText].BaseId)
                    $("#" + primaryOwnerText + "AddLink").parents(".support-tools__widget").first().hide();

                widgetActionIcon.replaceAll(".support-tools__widget__action-icon");
                kendo.bind(ele, vm);
            }

            var initializePicker = function (config) {

                var targetKey = config.element[0].id;

                var ds;
                if (config.type === "user") {
                    ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "/api/V3/User/GetUserList",
                                data: {
                                    filterByAnalyst: false,
                                    maxNumberOfResults: 1000,
                                    userFilter: function() {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    }
                                }
                            }
                        },
                        serverFiltering: true
                    });
                } else if (config.type === "primaryuser") {
                    ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "/api/V3/User/GetUserList",
                                data: {
                                    filterByAnalyst: true,
                                    maxNumberOfResults: 1000,
                                    userFilter: function() {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    }
                                }
                            }
                        },
                        serverFiltering: true
                    });
                } else if (config.type === "device" || config.type === "asset") {
                    var classId = (config.type === "device") ? '7ad221e0-e4bb-39a8-6514-33b60bba46f5' : 'c0c58e7f-7865-55cc-4600-753305b9be64';
                    ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "/Search/GetSearchObjectsWithEnumObjectByClassId",
                                data: {
                                    searchFilter: function() {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    },
                                    classId: classId,
                                    columnNames: 'DisplayName, Id'
                                }
                            }
                        },
                        serverFiltering: true,
                        schema: {
                            data: function(response) {
                                return response.Data;
                            }
                        }
                    });
                } else if (config.type === "primarydevice") {
                    ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: session.consoleSetting.TrueControlCenterURL + "/api/CmDevice",
                                data: {
                                    search: function() {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    }
                                },
                                beforeSend: function(req) {
                                    req.setRequestHeader('Authorization',
                                        'Bearer ' + session.consoleSetting.TrueControlCenterAuthToken);
                                }
                            }
                        },
                        serverFiltering: true,
                        schema: {
                            data: function(response) {
                                return response.value;
                            }
                        }
                    });
                } else {
                    ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "/ConfigItems/GetAffectedUserConfigItemsList",
                                data: {
                                    affectedUserId: config.affectedUserId,
                                    className: "Microsoft.Windows.Computer",
                                    searchFilter: function() {
                                        return (filter[targetKey]) ? filter[targetKey] : "";
                                    }
                                }
                            }
                        },
                        serverFiltering: true
                    });
                }

                var picker = config.element.kendoComboBox({
                    dataSource: ds,
                    template: kendo.template(config.eleTemplate.html()),
                    placeholder: localization.Search,
                    dataTextField: config.dataTextField,
                    dataValueField: "Id",
                    autoBind: false,
                    filter: "contains",
                    suggest: true,
                    popup: {
                        appendTo: config.eleContainer
                    },
                    filtering: function (e) {
                        if (e.filter != undefined) {
                            var key = e.sender.element[0].id;
                            filter[key] = e.filter.value;
                        }
                    },
                    select: function (e) {
                        var key = e.sender.element[0].id;

                        if (config.type === "user" || config.type === "primaryuser") {
                            selected[key] = {
                                DisplayName: e.dataItem.Name,
                                BaseId: e.dataItem.Id,
                                Email: e.dataItem.Email,
                                BaseType: e.dataItem.BaseType,
                                Path: ""
                            };
                        } else if (config.type === "device" || (config.type === "asset")) {
                            selected[key] = e.dataItem;
                        } else if (config.type === "primarydevice") {
                            selected[key] = {
                                DisplayName: e.dataItem.Name,
                                BaseId: e.dataItem.Guid,
                                BaseType: e.dataItem.BaseType,
                                Path: ""
                            };
                        } else {
                            selected[key] = {
                                DisplayName: e.dataItem.Text,
                                BaseId: e.dataItem.Id,
                                ClassName: e.dataItem.ClassName,
                                BaseType: e.dataItem.BaseType,
                                Path: ""
                            }
                        }
                        if ($(e.item[0]).hasClass('k-state-hover')) {
                            setSelected(key, config.element);
                        }
                    }
                }).data("kendoComboBox");

                picker.input.on("keydown", function (e) {
                    if (e.keyCode === 9 || e.keyCode === 13) {

                        setSelected(targetKey, config.element);
                    }
                });
            };

            vm.widget = {
                open: false,
                mainWidgetAttr: 'support-tools__widget support-tools__widget--add-item',
                mainWidgetDeviceAttr: 'support-tools__widget support-tools__widget--add-item',
                addForm: function(e) {
                    if ($(e.currentTarget).hasClass("isDisabled")) return;

                    var type = e.currentTarget.value;
                    if (type === affectedUserText) {
                        addUserContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addUserContainer);
                        createUserComboBox(type);
                        vm.widget.mainWidgetAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === assignedUserText) {
                        addUserContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addUserContainer);
                        createUserComboBox(type);
                        vm.widget.mainWidgetAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === primaryOwnerText) {
                        addUserContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addUserContainer);
                        createPrimaryUserComboBox(type);
                        vm.widget.mainWidgetAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === affectedDeviceText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createDeviceComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === primaryDeviceText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createPrimaryDeviceComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === userDeviceText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createUserDeviceComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === relatedDeviceText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createDeviceComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === affectedAssetText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createAssetComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    } else if (type === relatedAssetText) {
                        addDeviceContainer.append(addTemplate(getObjectDetails(type)));
                        kendo.bind(addDeviceContainer);
                        createAssetComboBox(type);
                        vm.widget.mainWidgetDeviceAttr =
                            'support-tools__widget support-tools__widget--add-item support-tools__widget--hide';

                    }

                    widgetActionIcon.replaceAll(".support-tools__widget__action-icon");

                    kendo.bind(ele, vm);
                },
                affectedUser: _.extend(vm.viewModel.RequestedWorkItem || {},
                    {
                        widgetType: affectedUserText,
                        mailtoLink: (vm.viewModel.RequestedWorkItem && vm.viewModel.RequestedWorkItem["Email"]) ? "mailto:" +vm.viewModel.RequestedWorkItem["Email"]+ "?Subject=" + "[" +vm.viewModel.Id + "] " +vm.viewModel.Title: ""
                    }),
                assignedUser: _.extend(vm.viewModel.AssignedWorkItem || {},
                    {
                        widgetType: assignedUserText,
                        mailtoLink: (vm.viewModel.AssignedWorkItem && vm.viewModel.AssignedWorkItem["Email"]) ? "mailto:" + vm.viewModel.AssignedWorkItem["Email"] + "?Subject=" + "[" + vm.viewModel.Id + "] " + vm.viewModel.Title : ""
                    }),
                primaryOwner: _.extend(vm.viewModel.RelatesToIncident || {},
                    {
                        widgetType: primaryOwnerText,
                        mailtoLink: (vm.viewModel.RelatesToIncident && vm.viewModel.RelatesToIncident["Email"]) ? "mailto:" + vm.viewModel.RelatesToIncident["Email"] + "?Subject=" + "[" + vm.viewModel.Id + "] " + vm.viewModel.Title : ""
                    }),
                affectedDevice: {
                    widgetType: affectedDeviceText
                },
                primaryDevice: {
                    widgetType: primaryDeviceText
                },
                userDevice: {
                    widgetType: userDeviceText
                },
                relatedDevice:  {
                    widgetType: relatedDeviceText
                },
                affectedAsset: {
                    widgetType: affectedAssetText
                },
                relatedAsset: {
                    widgetType: relatedAssetText
                },
                relatedDeviceArr: _.filter(vm.viewModel.RelatesToConfigItem,
                    function (el) {
                        el = _.extend(el,
                            {
                                widgetType: relatedDeviceText
                            });
                        return el.ClassName === "Microsoft.Windows.Computer";
                    }),
                affectedDeviceArr: _.filter(vm.viewModel.HasRelatedWorkItems,
                    function (el) {
                        el = _.extend(el,
                            {
                                widgetType: affectedDeviceText
                            });
                        return el.ClassName === "Microsoft.Windows.Computer";
                    }),
                affectedAssetArr: _.filter(vm.viewModel.HasRelatedWorkItems,
                    function (el) {
                        el = _.extend(el,
                            {
                                widgetType: affectedAssetText
                            });
                        return el.ClassName === "Cireson.AssetManagement.HardwareAsset";
                    }),
                relatedAssetArr: _.filter(vm.viewModel.RelatesToConfigItem,
                    function (el) {
                        el = _.extend(el,
                            {
                                widgetType: relatedAssetText
                            });
                        return el.ClassName === "Cireson.AssetManagement.HardwareAsset";
                    }),
                primaryDeviceArr: [],
                includeHardwareAssetOnly: (session.includeHardwareAssetinRM === "true" && session.includeWindowsComputerinRM === "false") ? true : false,
                includeWindowsComputerOnly: (session.includeWindowsComputerinRM === "true" && session.includeHardwareAssetinRM === "false") ? true : false,
                includeComputerAndAsset: (session.includeHardwareAssetinRM === "true" && session.includeWindowsComputerinRM === "true") ? true : false,
                showDeviceSection: (session.includeHardwareAssetinRM === "true" || session.includeWindowsComputerinRM === "true") ? true : false,
                clickContainer: function (e) {
                    if (e.target.nodeName === "DIV" && e.target.className.indexOf("multi-query__list__selected-items") === -1) {
                        var value = e.currentTarget.value;
                        if (value.BaseId) {
                            if (value.widgetType === relatedAssetText || value.widgetType === affectedAssetText) {
                                $.get("/Search/GetHardwareAssetDevice", { id: value.BaseId }, function (data) {
                                    var type = "computer";
                                    var src = app.slideOutNav.getTCCSourceURL(data, type);
                                    var options = {
                                        url: src,
                                        tooltip: localization.ComputerManagement
                                    }
                                    app.slideOutNav.show(options);
                                });
                            } else {
                                var type =
                                    [affectedUserText, assignedUserText, primaryOwnerText].indexOf(value.widgetType) >
                                        -1
                                        ? "user"
                                        : "computer";
                                var src = app.slideOutNav.getTCCSourceURL(value, type);
                                var options = {
                                    url: src,
                                    tooltip: (type === "user")
                                        ? localization.UserManagement
                                        : localization.ComputerManagement
                                }
                                app.slideOutNav.show(options);
                            }
                        }
                    }
                },
                removeUserCombobox: function (e) {
                    var widgetType = e.currentTarget.value;
                    var tpl = $(e.currentTarget).parents(".support-tools__widget").first();
                    tpl.remove();

                    if ([affectedUserText, assignedUserText, primaryOwnerText].indexOf(widgetType) > -1)
                        vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                    else
                        vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';

                    kendo.bind(ele, vm);
                },
                openCombobox: function (e) {
                    var widgetType = e.currentTarget.value;
                    var widget = $("#" + widgetType + "Combobox1").getKendoComboBox();
                    widget.open();
                },
                removeItem: function (e) {
                    var widgetValue = e.currentTarget.value;
                    var widgetType = widgetValue.widgetType;
                    var propName;

                    switch (widgetType) {
                        case affectedUserText:
                            propName = "RequestedWorkItem";
                            vm.viewModel.set(propName,
                                {
                                    DisplayName: "",
                                    BaseId: ""
                                });
                            $("#" + affectedUserText + "AddLink").removeClass("isDisabled");
                            vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case assignedUserText:
                            propName = "AssignedWorkItem";
                            vm.viewModel.set(propName,
                                {
                                    DisplayName: "",
                                    BaseId: ""
                                });
                            $("#" + assignedUserText + "AddLink").removeClass("isDisabled");
                            vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case primaryOwnerText:
                            propName = "RelatesToIncident";
                            vm.viewModel.set(propName,
                                {
                                    DisplayName: "",
                                    BaseId: ""
                                });
                            $("#" + primaryOwnerText + "AddLink").removeClass("isDisabled");
                            vm.widget.mainWidgetAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case affectedDeviceText:
                            var arr = _.map(vm.viewModel.HasRelatedWorkItems,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.HasRelatedWorkItems.splice(i, 1);

                            vm.widget[affectedDeviceText + "Arr"] = _.filter(vm.widget[affectedDeviceText + "Arr"],
                                function (el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case primaryDeviceText:
                            var arr = _.map(vm.viewModel.HasRelatedWorkItems,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.HasRelatedWorkItems.splice(i, 1);

                            vm.widget[primaryDeviceText + "Arr"] = _.filter(vm.widget[primaryDeviceText + "Arr"],
                                function (el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case userDeviceText:
                            var arr = _.map(vm.viewModel.HasRelatedWorkItems,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.HasRelatedWorkItems.splice(i, 1);

                            vm.widget[affectedDeviceText + "Arr"] = _.filter(vm.widget[affectedDeviceText + "Arr"],
                                function (el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case relatedDeviceText:

                            var arr = _.map(vm.viewModel.RelatesToConfigItem,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.RelatesToConfigItem.splice(i, 1);

                            vm.widget[relatedDeviceText + "Arr"] = _.filter(vm.widget[relatedDeviceText + "Arr"],
                                function(el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case affectedAssetText:
                            var arr = _.map(vm.viewModel.HasRelatedWorkItems,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.HasRelatedWorkItems.splice(i, 1);

                            vm.widget[affectedAssetText + "Arr"] = _.filter(vm.widget[affectedAssetText + "Arr"],
                                function (el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                        case relatedAssetText:

                            var arr = _.map(vm.viewModel.RelatesToConfigItem,
                                function (el) {
                                    return el.BaseId;
                                });

                            var i = _.indexOf(arr, widgetValue.BaseId);

                            vm.viewModel.RelatesToConfigItem.splice(i, 1);

                            vm.widget[relatedAssetText + "Arr"] = _.filter(vm.widget[relatedAssetText + "Arr"],
                                function (el) {
                                    return el.BaseId !== widgetValue.BaseId;
                                });

                            vm.widget.mainWidgetDeviceAttr = 'support-tools__widget support-tools__widget--add-item';
                            break;
                    }

                    if (propName && propName.length > 0) {
                        var input = $("input[data-control-bind='" + propName + "']");
                        input.data("kendoAutoComplete").value("");
                        var liParent = input.parent().children(".menu-usr-mgt");
                        $(liParent).hide();
                    }

                    var tpl = $(e.currentTarget).parents(".support-tools__widget").first();
                    tpl.remove();

                    if (typeof (vm.widget[affectedUserText].BaseId && vm.widget[assignedUserText].BaseId && vm.widget[primaryOwnerText].BaseId) !== "undefined")
                        $("#" + primaryOwnerText + "AddLink").parents(".support-tools__widget").first().show();

                    kendo.bind(ele, vm);
                },
                remoteManageRecepient: null,
                openSendEmail: function (e) {
                    var widgetValue = e.currentTarget.value;
                    vm.widget.remoteManageRecepient = widgetValue;
                    $('li.link[data-bind="click: sendEmail"]').click();
                }
            }

            if (vm.widget.affectedUser.BaseId) {
                $("#" + affectedUserText + "AddLink").addClass("isDisabled");
                dataUserContainer.append(dataTemplate(getObjectDetails(affectedUserText)));
            }

            if (vm.widget.assignedUser.BaseId) {
                $("#" + assignedUserText + "AddLink").addClass("isDisabled");
                dataUserContainer.append(dataTemplate(getObjectDetails(assignedUserText)));
            }

            if (vm.widget.primaryOwner.BaseId) {
                $("#" + primaryOwnerText + "AddLink").addClass("isDisabled");
                dataUserContainer.append(dataTemplate(getObjectDetails(primaryOwnerText)));
            }

            if (vm.widget.relatedDeviceArr.length > 0) {

                vm.widget.relatedDeviceArr = _.map(vm.widget.relatedDeviceArr,
                    function(el) {
                        el.widgetType = relatedDeviceText;
                        return el;
                    });

                var relatedDeviceObj = {
                    devices: vm.widget[relatedDeviceText + "Arr"],
                    type: relatedDeviceText + "Arr",
                    title: localization.RelatedDeviceText,
                    icon: "related_device.svg"
                }
                dataDeviceContainer.append(multipleDataTemplate(relatedDeviceObj));
                kendo.bind(dataDeviceContainer);
            }

            if (vm.widget.relatedAssetArr.length > 0) {

                vm.widget.relatedAssetArr = _.map(vm.widget.relatedAssetArr,
                    function (el) {
                        el.widgetType = relatedAssetText;
                        return el;
                    });

                var relatedAssetObj = {
                    devices: vm.widget[relatedAssetText + "Arr"],
                    type: relatedAssetText + "Arr",
                    title: localization.RelatedAssetText,
                    icon: "related_asset.svg"
                }
                dataDeviceContainer.append(multipleDataTemplate(relatedAssetObj));
                kendo.bind(dataDeviceContainer);
            }

            if (vm.widget.affectedDeviceArr.length > 0) {

                vm.widget.affectedDeviceArr = _.map(vm.widget.affectedDeviceArr,
                    function (el) {
                        el.widgetType = affectedDeviceText;
                        return el;
                    });

                var affectedDeviceObj = {
                    devices: vm.widget[affectedDeviceText + "Arr"],
                    type: affectedDeviceText + "Arr",
                    title: localization.AffectedDeviceText,
                    icon: "affected_device.svg"
                }
                dataDeviceContainer.append(multipleDataTemplate(affectedDeviceObj));
                kendo.bind(dataDeviceContainer);
            }

            if (vm.widget.affectedAssetArr.length > 0) {

                vm.widget.affectedAssetArr = _.map(vm.widget.affectedAssetArr,
                    function (el) {
                        el.widgetType = affectedAssetText;
                        return el;
                    });

                var affectedAssetObj = {
                    devices: vm.widget[affectedAssetText + "Arr"],
                    type: affectedAssetText + "Arr",
                    title: localization.AffectedAssetText,
                    icon: "affected_asset.svg"
                }
                dataDeviceContainer.append(multipleDataTemplate(affectedAssetObj));
                kendo.bind(dataDeviceContainer);
            }

            if (!vm.viewModel.hasOwnProperty('RelatesToIncident'))
                $("#" + primaryOwnerText + "AddLink").addClass("isDisabled");

            if (!vm.viewModel.hasOwnProperty('RequestedWorkItem'))
                $("#" + affectedUserText + "AddLink").addClass("isDisabled");

            if (vm.viewModel.isDisabled) {
                $("#" + affectedUserText + "AddLink").addClass("isDisabled");
                $("#" + assignedUserText + "AddLink").addClass("isDisabled");
                $(".support-tools__widget__select-type").addClass("isDisabled");
                $(".support-tools__widget__action-icon").removeClass("support-tools__widget__action-icon");
            }
           

            widgetActionIcon.replaceAll(".support-tools__widget__action-icon");

            var changeCntr = 0;
            vm.bind("change",
                function (e) {

                    if (e.field.indexOf("RequestedWorkItem") > -1 || e.field.indexOf("RelatesToIncident") > -1 || e.field.indexOf("AssignedWorkItem") > -1) {

                        var propName, widgetName;

                        if (e.field.indexOf("RequestedWorkItem") > -1) {
                            propName = "RequestedWorkItem";
                            widgetName = affectedUserText;
                        }

                        if (e.field.indexOf("RelatesToIncident") > -1) {
                            propName = "RelatesToIncident";
                            widgetName = primaryOwnerText;
                        }

                        if (e.field.indexOf("AssignedWorkItem") > -1) {
                            propName = "AssignedWorkItem";
                            widgetName = assignedUserText;
                        }

                        if (e.field.indexOf("BaseId") > -1) changeCntr++;
                        if (e.field.indexOf("DisplayName") > -1) changeCntr++;

                        if (changeCntr === 0 || changeCntr === 2) {

                            if (!_.isUndefined(vm.viewModel[propName]) && vm.viewModel[propName].BaseId) {

                                $.getJSON('/api/V3/User/GetUserRelatedInfoByUserId',
                                    { userId: vm.viewModel[propName].BaseId },
                                    function(json) {

                                        if (!json) return;

                                        vm.widget[widgetName] = _.extend(JSON.parse(json) || {},
                                            {
                                                widgetType: widgetName
                                            });

                                        $('#' + widgetName + 'dataTemplate').remove();
                                        changeCntr = 0;

                                        $("#" + widgetName + "AddLink").addClass("isDisabled");

                                        if (vm.viewModel.isDisabled) {
                                            $("#" + widgetName + "AddLink").addClass("isDisabled");
                                        }

                                        dataUserContainer.append(dataTemplate(getObjectDetails(widgetName)));

                                        kendo.bind(dataUserContainer, vm);

                                        widgetActionIcon.replaceAll(".support-tools__widget__action-icon");

                                    });

                            } else {

                                $('#' + widgetName + 'dataTemplate').remove();
                                $("#" + widgetName + "AddLink").removeClass("isDisabled");

                                if (vm.viewModel.isDisabled) {
                                    $("#" + widgetName + "AddLink").removeClass("isDisabled");
                                }
                                changeCntr = 0;

                            }
                        }
                    }

                    if (e.field.indexOf("RelatesToConfigItem") > -1 || e.field.indexOf("HasRelatedWorkItems") > -1) {
                        var propName, widgetName;

                        var item = e.items[0];

                        if (item.ClassName && (item.ClassName === "Microsoft.Windows.Computer" || item.ClassName === "Computer")) {

                            if(e.field.indexOf("RelatesToConfigItem") > -1) {
                                propName = "RelatesToConfigItem";
                                widgetName = relatedDeviceText;
                            }

                            if(e.field.indexOf("HasRelatedWorkItems") > -1) {
                                propName = "HasRelatedWorkItems";
                                widgetName = affectedDeviceText;
                            }

                            if (e.action === "add") {

                                item = _.extend(item,
                                    {
                                        widgetType: widgetName
                                    });

                                vm.widget[widgetName + "Arr"].push(item);
                            }

                            if (e.action === "remove") {

                                vm.widget[widgetName + "Arr"] = _.filter(vm.widget[widgetName + "Arr"],
                                    function(el) {
                                        return el.BaseId !== item.BaseId;
                                    });
                            }

                            $('.' + widgetName + 'ArrdataTemplate').remove();

                            var obj = {
                                devices: vm.widget[widgetName + "Arr"],
                                type: widgetName + "Arr",
                                title: (e.field.indexOf("RelatesToConfigItem") > -1)
                                    ? localization.RelatedDeviceText
                                    : localization.AffectedDeviceText,
                                icon: (e.field.indexOf("RelatesToConfigItem") > -1)
                                    ? "related_device.svg"
                                    : "affected_device.svg"
                            }
                            dataDeviceContainer.append(multipleDataTemplate(obj));
                            kendo.bind(dataDeviceContainer, vm);

                            widgetActionIcon.replaceAll(".support-tools__widget__action-icon");
                        }

                        if (item.ClassName && (item.ClassName === "Cireson.AssetManagement.HardwareAsset" || item.ClassName === "HardwareAsset")) {

                            if (e.field.indexOf("RelatesToConfigItem") > -1) {
                                propName = "RelatesToConfigItem";
                                widgetName = relatedAssetText;
                            }

                            if (e.field.indexOf("HasRelatedWorkItems") > -1) {
                                propName = "HasRelatedWorkItems";
                                widgetName = affectedAssetText;
                            }

                            if (e.action === "add") {

                                item = _.extend(item,
                                    {
                                        widgetType: widgetName
                                    });

                                vm.widget[widgetName + "Arr"].push(item);
                            }

                            if (e.action === "remove") {

                                vm.widget[widgetName + "Arr"] = _.filter(vm.widget[widgetName + "Arr"],
                                    function (el) {
                                        return el.BaseId !== item.BaseId;
                                    });
                            }

                            $('.' + widgetName + 'ArrdataTemplate').remove();

                            var obj = {
                                devices: vm.widget[widgetName + "Arr"],
                                type: widgetName + "Arr",
                                title: (e.field.indexOf("RelatesToConfigItem") > -1)
                                    ? localization.RelatedAssetText
                                    : localization.AffectedAssetText,
                                icon: (e.field.indexOf("RelatesToConfigItem") > -1)
                                    ? "related_asset.svg"
                                    : "affected_asset.svg"
                            }
                            dataDeviceContainer.append(multipleDataTemplate(obj));
                            kendo.bind(dataDeviceContainer, vm);

                            widgetActionIcon.replaceAll(".support-tools__widget__action-icon");
                        }
                    }

                });

            kendo.bind(ele, vm);

            return __remoteManageWidgetSingleton;
        },
        toggle: function (vm) {
            vm.widget.open = !vm.widget.open;

            if (vm.widget.open) {
                if (vm.attachmentWidget) vm.attachmentWidget.open = false;
                $("#headerAttachmentBtn").removeClass('btn-icon-stack--active');
                $("#attachment_widget").removeClass('content-header__flyout--open');
                $("#expanded_widget").addClass('content-header__flyout--open');
                $("#content-header-backdrop").addClass('content-header__flyout__overlay--open');
            } else {
                $("#remoteManageBtn").removeClass('btn-icon-stack--active');
                $("#expanded_widget").removeClass('content-header__flyout--open');
                $("#content-header-backdrop").removeClass('content-header__flyout__overlay--open');
            }
        }
    }

    return definition;

});