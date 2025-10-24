/**
childWorkItem
**/

define(function (require) {
    var tpl = require("text!forms/predefined/childWorkItems/view.html");
    var objectPickerPopup = require("forms/popups/multipleObjectPickerPopup/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            boundObj = vm;
            
            var properties = {
                Disabled: false,
                PropertyName: "ChildWorkItem",
                ClassId: (vm.ClassName === "System.WorkItem.ReleaseRecord") ? "d02dc3b6-d709-46f8-cb72-452fa5e082b8" : "a604b942-4c7b-2fb2-28dc-61dc6f465c68",
                PropertyToDisplay: "Id,Title,Status,LastModified",
                ControllerUrl: "/Search/GetChildWorkItems",
                IsMobileView: app.isMobileDevice()
            };

            $.extend(true, properties, node);
            var built = _.template(tpl);
            var templateFrag = $(built(properties));
            var popupWindow = objectPickerPopup.getPopup(properties.ClassId, properties.PropertyToDisplay, properties.ControllerUrl);
            var objectPicker = new Control(templateFrag.find("[data-control='childWorkItems']"), boundObj, properties.PropertyName, properties, popupWindow);
            var showProp = templateFrag.find("[data-control='childWorkItems']").attr("data-control-show");
            templateFrag.find("[data-control='childWorkItems']").attr("data-control", "childWorkItemsBound");
            callback(templateFrag);

            // Determine if group should be visible (IsParent)
            if (boundObj[showProp] === false || _.isNull(boundObj[showProp])) {
                templateFrag.parents(".row").hide();
            }
           
        }
    }

    var Control = function (targetEle, boundObj, name, properties, popupWindow) {

        //use setters and getters if you want vm boundOdj to trigger change
        if (_.isUndefined(boundObj[name])) {
            boundObj.set(name, new kendo.data.ObservableArray([]));
        }
        var boundArray = boundObj.get(name);

        var __construct = function () {
            bindButtonEvents();
            bindEvents();
            createGrid();
        }

        var bindEvents = function () {
            
        }

        var bindButtonEvents = function () {
            var actions = {
                addClick: function () {
                    popupWindow.setSaveCallback(function (object) {
                        if (isDuplicate(object.BaseId)) { return; }
                        boundArray.push(object);
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
        }

       
        var createGrid = function () {
            var gridEle = targetEle.find("[data-control-grid]");
            
            var grid = gridEle.kendoGrid({
                columns:
                 [
                  { field: "Id", title: localization.Id, attributes: { "class": "grid-highlight-column" } },
                  { field: "Title", title: localization.Title },
                  { field: "Status.Name", title: localization.Status },
                  {
                      field: "LastModified",
                      title: localization.LastModified,
                      type: "date",
                      template: "#= (LastModified) ? kendo.toString(new Date(LastModified), 'g'):'' #"
                  },
                  { field: "BaseId", title: "BaseId", hidden: "true" },
                  { width: "105px", command: [{ name: "destroy", text: localization.Remove }]}
                 ],
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
                    update: false,
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
                        }
                    },
                    data: {
                        Data: boundArray,
                        Total: boundArray.length
                    }
                },
                selectable: true
            });

            gridEle.on("click", "td", function (e) {
                var highlightedColumn = $(e.currentTarget).hasClass("grid-highlight-column");
                if (!highlightedColumn) { return }

                var kendoGrid = grid.data("kendoGrid");
                var selectedItem = kendoGrid.dataItem($(e.currentTarget).closest("tr"));
                var strClass = selectedItem.ClassName.split(/[\s.]+/);
                var className = strClass[strClass.length - 1];
                window.open("/" + className + "/Edit/" + selectedItem.Id + "/", '_blank');
            });
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

        __construct();
    }
    return definition;
});