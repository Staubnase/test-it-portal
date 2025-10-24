/**
knowledgeArticle
**/

define(function (require) {
    var tpl = require("text!forms/predefined/knowledgeArticle/view.html");
    var popupTpl = require("text!forms/predefined/knowledgeArticle/popup.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var properties = {
                Disabled: false,
                IsMobileView: app.isMobileDevice()
            };
            $.extend(true, properties, node);

            //build the template for the popup window
            var built = _.template(popupTpl);
            var popupView = new kendo.View(built(properties), { wrap: false });

            //add in popup window
            callback(popupView.render());

            //view model
            vm.view.knowledgeArticleModel = kendo.observable({
                addClick: function (e) {
                    var popupWindow= popupView.element; 
                    win = popupWindow.kendoCiresonWindow({
                        title: localization.SelectObject,
                        width: 750,
                        height: 710,
                        actions: []
                    }).data("kendoWindow");

                    //this view Model is bound to the popup element
                    var modalViewModel = new kendo.observable({
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "/api/V3/KnowledgeBase/GetHTMLArticles",
                                    dataType: "json",
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    data: { userId: session.user.Id },
                                    cache: false
                                }
                            },
                            schema: {
                                model: {
                                    fields: {
                                        ArticleId: { type: "string" },
                                        Title: { type: "string" },
                                        Category: { type: "string" },
                                        Type: { type: "string" }
                                    }
                                }
                            },
                            pageSize: 5,
                        }),
                        selectedItems: new kendo.data.ObservableArray([]),
                        searchText:"",
                        search: function(e){
                            var val = this.get("searchText");
                            this.dataSource.read();
                            this.dataSource.filter({
                                logic: "or",
                                filters: [
                                    {
                                        field: "ArticleId",
                                        operator: "contains",
                                        value: val
                                    },
                                    {
                                        field: "Title",
                                        operator: "contains",
                                        value: val
                                    },
                                    {
                                        field: "Category",
                                        operator: "contains",
                                        value: val
                                    },
                                    {
                                        field: "Type",
                                        operator: "contains",
                                        value: val
                                    }
                                ]
                            });
                        },
                        add: function (e) {
                            var gridEle = popupWindow.find('[data-role="grid"]').first();
                            var grid = gridEle.data("kendoGrid");
                            var selectedRows = grid.select();

                            for (var i = 0; i < selectedRows.length; i++) {
                                var dataItem = grid.dataItem(selectedRows[i]);
                                if (dataItem) {
                                    //check first if article is already on the selected list before adding it to the second grid
                                    var articleIds = _.pluck(this.selectedItems, "ArticleId");
                                    var isAdded = _.contains(articleIds, dataItem.ArticleId);

                                    if (!isAdded) {
                                        this.selectedItems.push(dataItem);
                                    }
                                }
                            }

                            var selectedGridEle = popupWindow.find('[data-role="grid"]').last();
                            selectedGridEle.data("kendoGrid").dataSource.query({ page: 1, pageSize: 5 });
                        },
                        remove: function (e) {
                            var gridEle = popupWindow.find('[data-role="grid"]').last();
                            var grid = gridEle.data("kendoGrid");
                            var selectedRows = grid.select();

                            for (var i = 0; i < selectedRows.length; i++) {
                                var dataItem = grid.dataItem(selectedRows[i]);
                                this.selectedItems.pop(dataItem);
                            }
                        },
                        save: function (e) {
                            var relatedHTMLKB = !_.isUndefined(vm.get("RelatedHTMLKB")) ? vm.get("RelatedHTMLKB") : [];
                            _.each(this.selectedItems, function (item) {
                                relatedHTMLKB.push({
                                    KnowledgeArticleID: item.ArticleId,
                                    WorkItemID: (vm.ClassName.indexOf("WorkItem") != -1) ? vm.BaseId : null,
                                    WorkItemId: (vm.ClassName.indexOf("WorkItem") != -1) ? vm.Id : null,
                                    AssetID: (vm.ClassName.indexOf("AssetManagement") != -1) ? vm.BaseId : null,
                                    AssetId: (vm.ClassName.indexOf("AssetManagement") != -1) ? vm.Id : null,
                                    Title: item.Title,
                                    Category: item.Category,
                                    Type: item.Type
                                });
                            });

                            vm.set("RelatedHTMLKB", relatedHTMLKB);

                            win.close();
                        },
                        cancel: function (e) {
                            win.close();
                        }
                    });

                    //add control to the window
                    kendo.bind(popupWindow, modalViewModel);

                    popupWindow.removeClass('hide');
                    popupWindow.show();

                    win.open();
                },
                bindRowClick: function (e) {
                    var gridEle = view.element.find('[data-role="grid"]').first();

                    if (!app.isMobile())
                    {
                        var grid = gridEle.data("kendoGrid");

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

                        grid.dataSource.bind("filterApplied", function () {

                            $.each($(gridEle).find("th a.k-header-column-menu i"), function () {
                                $(this).remove();
                            });

                            if (grid.dataSource.filter()) {

                                var filters = grid.dataSource.filter().filters || [];
                                var dsFilters = [];
                                for (var i in filters) {
                                    if (filters[i].filters) {
                                        var innerFilters = filters[i].filters;
                                        for (var x in innerFilters) {
                                            dsFilters.push(innerFilters[x]);
                                        }
                                    } else {
                                        dsFilters.push(filters[i]);
                                    }
                                }

                                dsFilters = _.uniq(dsFilters, function (el) { return el.field; });

                                for (var i in dsFilters) {
                                    $(gridEle).find("th[data-field=" + dsFilters[i].field + "] a.k-header-column-menu").append("<i class=\"fa fa-filter\"></i>");
                                }

                            }
                        });
                    }
                    },
                    
                getAllRelatedWorkItems: function (e) {
                    //this will hold all the related knowledge article data
                    var relatedHTMLKB = !_.isUndefined(vm.get("RelatedHTMLKB")) ? vm.get("RelatedHTMLKB") : new kendo.data.ObservableArray([]);

                    var url = '';

                    if (vm.ClassName.indexOf("WorkItem") != -1)
                        url = app.lib.addUrlParam("/api/V3/Article/GetArticlesRelatedToWorkItem", "workItemId", vm.BaseId);
                    else if (vm.ClassName.indexOf("AssetManagement") != -1)
                        url = app.lib.addUrlParam("/api/V3/Article/GetArticlesRelatedToAsset", "assetId", vm.BaseId);

                    $.ajax({
                        url: url,
                        dataType: 'json',
                        type: "POST",
                        success: function (data) {
                            //set the value
                            _.each(data, function (item) {
                                relatedHTMLKB.push({
                                    KnowledgeArticleID: item.ArticleID,
                                    WorkItemID: (vm.ClassName.indexOf("WorkItem") != -1) ? vm.BaseId : null,
                                    WorkItemId: (vm.ClassName.indexOf("WorkItem") != -1) ? vm.Id : null,
                                    AssetID: (vm.ClassName.indexOf("AssetManagement") != -1) ? vm.BaseId : null,
                                    AssetId: (vm.ClassName.indexOf("AssetManagement") != -1) ? vm.Id : null,
                                    Title: item.Title,
                                    Category: item.CategoryName,
                                    Type: item.TypeName
                                });
                            });

                            //to avoid triggering isDirty, update viewModel only if there is/are related KB
                            if (relatedHTMLKB.length > 0) {
                                vm.set("RelatedHTMLKB", relatedHTMLKB);
                            }
                        },
                        error: function (e) {
                            //log error and display generic error tesxt
                            app.lib.log(e.errorThrown + ' - When retrieving data from /api/V3/Article/GetArticlesRelatedToWorkItem');
                        }
                    });
                },
                removeRelatedKB: function (e) {
                    //this will hold all the to be deleted related knowledge article 
                    var removeHTMLKB = !_.isUndefined(vm.get("RemoveRelatedHTMLKB")) ? vm.get("RemoveRelatedHTMLKB") : new kendo.data.ObservableArray([]);
                    removeHTMLKB.push(e.model);
                    vm.set("RemoveRelatedHTMLKB", removeHTMLKB);
                },
                showAddButton: !vm.isDisabled
            });
           
            //build it
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false, model: vm.view.knowledgeArticleModel });
            callback(view.render());

            vm.view.knowledgeArticleModel.getAllRelatedWorkItems();
            vm.view.knowledgeArticleModel.bindRowClick();
        }
    }

    return definition;
});