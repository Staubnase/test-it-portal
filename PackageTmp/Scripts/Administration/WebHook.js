$(document).ready(function () {

    var listView;
    var selectedClass;
    var classSettingsView;
    var dataSourceSettings = null;
    var classes = [];
    var cacheHeaders = [];
    var allClassList = [];
    var deletedSettings = [];
    var deletedClass = [];

    var classMask = $("#class-mask");




    $.get("/Settings/Admin/GetAllClass", {}, function (data) {
        //allClassList = data;
        _.each(data, function (item) {
            allClassList.push({
                Id: item,
                Name: item
            });
        });
    });


    $.get("/platform/api/WebHookClasses", {}, function (data) {
        classes = data.value;

        var dataSource = new kendo.data.DataSource({
            data: classes,
            schema: {
                model: {
                    id: "Guid",
                    fields: {
                        ClassName: {
                            type: "string"
                        }
                    }
                }
            }
        });

        listView = $("#classListView").kendoListView({
            dataSource: dataSource,
            height: 850,
            //scrollable: "endless",
            selectable: "SINGLE",
            change: selectClass,
            save: saveClass,
            cancel: function (e) {
                _.defer(function () {
                    classBindDelete();

                    if (e.sender.dataSource.data().length > 0) {
                        classMask.hide();
                    } else {
                        classMask.show();
                    }
                });



            },
            dataBound: function (e) {
                classBindDelete();

                if (e.items.length > 0) {
                    classMask.hide();
                } else {
                    classMask.show();
                }
            },
            edit: function (e) {
                $("#classes").kendoComboBox({
                    dataTextField: "Id",
                    dataValueField: "Name",
                    dataSource: allClassList,
                    filter: "contains",
                    suggest: true,
                    index: 3
                });

                LoadSettings(e.model);
                listView.select(e.item);
                classMask.hide();

            },
            template: kendo.template($("#templateClass").html()),
            editTemplate: kendo.template($("#editTemplateClass").html())
        }).data("kendoListView");



        function saveClass(e) {
            var classFoundList = _.filter(listView.dataSource.data(), function (cls) {
                return cls.ClassName == e.model.ClassName;
            })

            if (classFoundList.length >= 2) {
                e.preventDefault();
                alert(e.model.ClassName + " already exist!");
            }
        }


        function selectClass(e) {

            var selected;

            selected = listView.dataSource.data()[this.select().index()];


            //if (selected.length > 0)
            {
                LoadSettings(selected);

                $("#addNewClassUrl").removeAttr("disabled");
            }
        }

        

        function LoadSettings(selected) {
            selectedClass = selected;


            loadAllHeaders();


            if (_.isUndefined(selected.settings)) {
                
                if (_.isUndefined(selected.IsNew) && !_.isUndefined(selected.Id)) {
                    //selected.settings = [];
                    $.ajax({
                        type: 'Get',
                        dataType: 'json',
                        url: "/platform/api/WebHookSettings?$filter=WebHookClass eq " + selected.Id,
                        success: function (data, status, xhr) {
                            selected.settings = data.value;
                        },
                        error: function (xhr, ajaxOptions, thrownError) { },
                        async: false
                    });
                }
            }

            loadHeader(selected.settings);




            resetSettingsView();

            dataSourceSettings = new kendo.data.DataSource({
                data: selected.settings,
                schema: {
                    model: {
                        id: "Guid",
                        fields: {
                            Name: {
                                type: "string"
                            },
                            Url: {
                                type: "string"
                            },
                            ActionType: {
                                type: "string",
                                defaultValue: "Post"
                            },
                            SaveType: {
                                type: "string",
                                defaultValue: "Both"
                            },
                            Enable: {
                                Type: "boolean"
                            }
                        }
                    }
                }
            });

            classSettingsView = $("#classSettingsView").kendoListView({
                dataSource: dataSourceSettings,
                height: 350,
                scrollable: "endless",
                selectable: "multiple",
                template: kendo.template($("#templateSettings").html()),
                editTemplate: kendo.template($("#editTemplateSettings").html()),
                save: saveSettings,
                edit: function (e) {
                    editSettings(e, selected);
                },
                cancel: function (e) {
                    loadHeader(selectedClass.settings);
                    _.defer(function () {
                        classSettingsViewBindDelete();
                    });

                    showClassSettingsView(selectedClass.settings.length > 0);

                },
                dataBound: function (r) {
                    
                    classSettingsViewBindDelete();
                    selected.settings = r.sender.dataSource.data();
                }
            }).data("kendoListView");

            $("#addNewClassUrl").click(function (e) {
                classSettingsView.add();
                showClassSettingsView(true);
                e.preventDefault();
            });


            showClassSettingsView(selected.settings.length > 0);


        }

        $("#addNewClass").click(function (e) {
            listView.add();
            e.preventDefault();
        });




    });

    function resetSettingsView() {
        try {
            $("#classSettingsView").data("kendoListView").destroy();
            $("#classSettingsView").html("");
        }
        catch (e) { }
    }

    function showClassSettingsView(show) {
        if (show) {
            $("#classSettingsView").removeClass("display-none");
            $("#properties-mask").addClass("display-none");
        } else {
            $("#classSettingsView").addClass("display-none");
            $("#properties-mask").removeClass("display-none");
        }
    }

    function classBindDelete() {
        $(".delete-class").click(function () {
            var selectedCls = $(this).closest(".product-view");
            var model = listView.dataSource.view()[selectedCls.index()];
            $.when(kendo.ui.ExtOkCancelDialog.show({
                title: localization.Warning,
                message: "Are you sure to delete class " + model.ClassName + " ?",
                icon: "fa fa-exclamation"
            })).done(function (response) {
                if (response.button === "ok") {
                    if (listView.dataSource.view().length > 0) {
                        classMask.show();
                    } else {
                        classMask.hide();
                    }

                    deletedClass.push(model);

                    _.each(model.settings, function (setting) {
                        deleteSettings(setting);
                    });

                    listView.remove(listView.select());
                }
            });

        });
    }

    function classSettingsViewBindDelete() {
        $(".delete-class-settings").click(function () {

            var selectedSettings = $(this).closest(".product-view");
            var model = classSettingsView.dataSource.data()[selectedSettings.index()];
            $.when(kendo.ui.ExtOkCancelDialog.show({
                title: localization.Warning,
                message: "Are you sure to delete :  " + model.Name + " ?",
                icon: "fa fa-exclamation"
            })).done(function (response) {
                if (response.button === "ok") {



                    classSettingsView.remove(selectedSettings);
                    deletedSettings.push(model);
                }
            });
        });
    }

    function deleteSettings(setting, selectedSettings) {
        if (!_.isUndefined(selectedSettings)) {
            classSettingsView.remove(selectedSettings);
        } else {
            resetSettingsView();
        }

        showClassSettingsView(selectedClass.settings.length > 0);
    }

    function loadAllHeaders() {


        if (cacheHeaders.length <= 0) {
            $.ajax({
                type: 'Get',
                dataType: 'json',
                url: "/platform/api/WebHookHeader",
                success: function (data, status, xhr) {
                    cacheHeaders = data.value;
                },
                error: function (xhr, ajaxOptions, thrownError) { },
                async: false
            });
        }
    }

    function editSettings(e, selected) {
        //e.model.headers = _.isUndefined(e.model.headers) ? [] : e.model.headers;
        $("#headerEdit" + e.model.id).kendoGrid({
            dataSource: {
                data: e.model.headers,
                schema: {
                    model: {
                        fields: {
                            Key: {
                                type: "string"
                            },
                            Value: {
                                type: "string"
                            }
                        }
                    }
                },
                pageSize: 1000
            },
            pageable: false,
            height: 200,
            toolbar: [{
                name: "create",
                text: localization.AddHeader
            }],
            columns: [{
                field: "Key",
                title: "Key",
                width: "100px"
            },
            {
                field: "Value",
                title: "Value",
                width: "180px"
            },
            {
                command: ["edit", "destroy"],
                title: "&nbsp;",
                width: "120px"
            }
            ],
            editable: "inline",
            save: function (r) {

            },
            cancel: function (r) {
                //$("#headerEdit" + e.model.id).data('kendoGrid').dataSource.cancelChanges();
            },
            remove: function (r) {
                if (_.isUndefined(e.model.headerRemoved)) e.model.headerRemoved = [];
                e.model.headerRemoved.push(r.model);



                var index = _.findIndex(cacheHeaders, function (_head) {
                    return _head.Id == r.model.Id;
                });

                if (index != -1) {
                    cacheHeaders.splice(index, 1);
                }

            },
            dataBound: function (r) {
                
                e.model.headers = r.sender.dataSource.data();
            }
        });


    }

    function saveSettings(e) {

        //var classFoundList = _.filter(classSettingsView.dataSource.data(), function (cls) {
        //    return cls.Url == e.model.Url;
        //})

        //if (classFoundList.length >= 2) {
        //    e.preventDefault();
        //    alert(e.model.Url + " already exist!");
        //    return;
        //}

        saveTransition("#cls" + e.model.Guid, false);
    }

    function loadHeader(settings) {
        _.each(settings, function (item) {
            item.headers = _.filter(cacheHeaders, function (header) {
                return item.Id == header.WebHookSettings;
            });

        });
    }

    function saveTransition(elementId, isSelect) {
        //This will create transition for save indicator
        setTimeout(function () {
            var cls = $(elementId);

            if (isSelect) {
                cls.addClass("k-state-selected");
            }
            cls.addClass("updated-in");

            setTimeout(function () {
                cls.removeClass("updated-in");
                cls.addClass("updated-out");

                setTimeout(function () {
                    cls.removeClass("updated-out");
                }, 1000);
            }, 3000);
        }, 50);
    }



    var saveBtn = drawermenu.addButton(localization.Save, "fa fa-check", function () {
        //app.lib.mask.apply();
        


        function saveHeaders(head, setting) {


            if (_.isUndefined(head.Id)) {
                var editActionType = "Post";
                headData = {
                    WebHookSettings: setting.Id,
                    Key: head.Key,
                    Value: head.Value
                };

                headerUrl = "/platform/api/WebHookHeader";
            } else {
                headData = JSON.stringify(head);
                headerUrl = "/platform/api/WebHookHeader(" + head.Id + ")";
                editActionType = "Patch";
            }

            $.ajax({
                url: headerUrl,
                type: editActionType,
                dataType: 'json',
                data: headData,
                success: function (headData) { },
                async: false
            });

        }


        function saveSettings(setting, cls) {
            if (setting.Guid == "") { //If new
                setting.IsNew = true;
                url = "/platform/api/WebHookSettings";
                actionType = "Post";
                data = {
                    Name: setting.Name,
                    WebHookClass: cls.Id,
                    Url: setting.Url,
                    ActionType: setting.ActionType,
                    Enable: setting.Enable == "" ? false : true
                };
            } else {
                setting.IsNew = false;
                url = "/platform/api/WebHookSettings(" + setting.Id + ")";
                actionType = "Patch";
                data = JSON.stringify(setting);
            }


            $.ajax({
                url: url,
                type: actionType,
                dataType: 'json',
                data: data,
                success: function (result) {
                    if (!_.isUndefined(setting.headers)) {
                        _.each(setting.headers, function (head) {
                            if (setting.IsNew) {
                                saveHeaders(head, result);
                            }
                            else {
                                saveHeaders(head, setting);
                            }

                        });
                    }
                    //saveTransition("#cls" + e.model.Guid, true);

                },
                async: false
            });


            if (!_.isUndefined(setting.headerRemoved)) {
                deleteHeaders(setting.headerRemoved);
            }

        }

        function SaveAll() {
            //This will going to save/update all items
            _.each(listView.dataSource.view(), function (clsItem) {


                if (clsItem.Guid == "") {
                    isNew = true;
                    clsItem.IsNew = true;
                    url = "/platform/api/WebHookClasses";
                    actionType = "Post";
                    data = {
                        ClassName: clsItem.ClassName
                    };
                } else {
                    clsItem.IsNew = false;
                    url = "/platform/api/WebHookClasses(" + clsItem.Id + ")";
                    actionType = "Patch";
                    data = JSON.stringify(clsItem);
                }


                $.ajax({
                    url: url,
                    type: actionType,
                    dataType: 'json',
                    data: data,
                    success: function (clsResult) {

                        if (!_.isUndefined(clsItem.settings)) {
                            _.each(clsItem.settings, function (settItem) {
                                if (clsItem.IsNew) {
                                    //saveSettings(settItem, clsResult);
                                    clsItem.Id = clsResult.Id;
                                }
                                else {
                                    
                                }

                                saveSettings(settItem, clsItem);
                            });
                        }



                        //saveTransition("#cls" + e.model.Guid, true);

                    },
                    async: false
                });

            });
        }

        function deleteHeaders(headerList) {
            _.each(headerList, function (head) {
                $.ajax({
                    url: "/platform/api/WebHookHeader(" + head.Id + ")",
                    type: "Delete",
                    async: false
                });
            });
        }

        function deleteSettings(settingList) {
            _.each(settingList, function (setting) {


                $.ajax({
                    url: "/platform/api/WebHookHeader?$filter=WebHookSettings eq " + setting.Id,
                    type: "Get",
                    success: function (result) {
                        deleteHeaders(result.value);
                    },
                    async: false
                });

                $.ajax({
                    url: "/platform/api/WebHookSettings(" + setting.Id + ")",
                    type: "Delete",
                    async: false
                });
            });
        }

        function deleteClasses(classList) {
            _.each(classList, function (cls) {
                $.ajax({
                    url: "/platform/api/WebHookSettings?$filter=WebHookClass eq " + cls.Id,
                    type: "Get",
                    success: function (result) {
                        deleteSettings(result.value);
                    },
                    async: false
                });


                $.ajax({
                    url: "/platform/api/WebHookClasses(" + cls.Id + ")",
                    type: "Delete",
                    async: false
                });
            });
        }


        //console.log("deletedSettings", deletedSettings);
        //console.log("deletedClass", deletedClass);
        //console.log("classes", listView.dataSource.view());

        SaveAll();
        deleteSettings(deletedSettings);
        deleteClasses(deletedClass);
        location.reload();


        /*console.log("Done!");*/



        //handleResponse({ success: true });

    });

    var cancelBtn = drawermenu.addButton(localization.Cancel, "fa fa-times", function () {
        if (confirm("Unsaved data will be lost.")) {
            location.reload();
        }
    });




});