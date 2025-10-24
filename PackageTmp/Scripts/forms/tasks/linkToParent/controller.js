/**
link To Parent
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/linkToParent/view.html");
    var headerLinkTpl = require("text!forms/header/relationships/view.html");


    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build the template for the window
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());
            
            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                linkToParent: function () {
                    var cont = view.element; //we have the element in memory so no need use a selector
                    var releaseRecordClassId = "d02dc3b6-d709-46f8-cb72-452fa5e082b8"; //classid for release record

                    win = cont.kendoCiresonWindow({
                        title: (vm.viewModel.ClassId == releaseRecordClassId) ? localization.LinktoNewParentIncident : localization.LinkToNewParentRecord,
                        actions: [],
                        activate: function () {
                            _vmWindow.refreshDataSource();
                            getChildIncidentSettings();
                        }
                    }).data("kendoWindow");

                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        searchText: "",
                        searchClick: function () {
                            var val = this.get("searchText");
                            this.refreshDataSource();
                            this.dataSource.filter({
                                logic: "or",
                                filters: [
                                    {
                                        field: "Id",
                                        operator: "contains",
                                        value: val
                                    },
                                    {
                                        field: "Title",
                                        operator: "contains",
                                        value: val
                                    },
                                    {
                                        field: "Status.Name",
                                        operator: "contains",
                                        value: val
                                    }
                                ]
                            });
                        },
                        okEnabled: false, 
                        okClick: function () {
                            if (!this.selectedRow)
                                return;

                            if (vm.viewModel.ParentWorkItem == null) {
                                vm.viewModel.ParentWorkItem = {};
                            }

                            vm.viewModel.ParentWorkItem.BaseId = this.selectedRow.BaseId;
                            vm.viewModel.ParentWorkItem.Id = this.selectedRow.Id;
                            vm.viewModel.ParentWorkItem.Title = this.selectedRow.Title;

                            //check if we need to change child's status
                            if (!_.isUndefined(childIncidentSettings.ActiveChildIncidentLinkStatus.Id)) {
                                vm.viewModel.set("Status", { Id: childIncidentSettings.ActiveChildIncidentLinkStatus.Id, Name: childIncidentSettings.ActiveChildIncidentLinkStatus.Name });
                            }

                            vm.view.buildParentHeaderView(function (tpl) {
                                parentView = new kendo.View(tpl, { wrapper: false, model: vm });
                                $('#parent-header-space').html(parentView.render()).show();
                            });

                            this.dataSource.filter([]);
                            win.close();
                        },
                        cancelClick: function () {
                            this.dataSource.filter([]);
                            win.close();
                        },
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    type: "GET",
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    dataType: "json",
                                    url: "/Search/GetParentWorkItems",
                                    data: { workItemType: vm.type },
                                    cache: false
                                }
                            },
                            schema: {
                                model: {
                                    fields: {
                                        Id: { type: "string" },
                                        Title: { type: "string" },
                                        Status: { type: "string" },
                                        BaseId: { type: "string" }
                                    }
                                }
                            },
                            pageSize: 5,
                        }),
                        selectedRow: null,
                        gridChange: function (eventArgs) {
                            this.set("okEnabled", true);
                            this.set("selectedRow", eventArgs.sender.dataItem(eventArgs.sender.select()));
                        },
                        refreshDataSource: function () {
                            this.dataSource.read();
                        }
                    });
                    //add control to the window
                    kendo.bind(cont, _vmWindow);
                    
                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "linkToParent"
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

            //more functions
            var childIncidentSettings;
            var getChildIncidentSettings = function () {
                $.get("/api/V3/Projection/GetParentWorkItemSettings", {}, function (data) {
                    childIncidentSettings = data;
                });
            }
        }
    }

    return definition;

});