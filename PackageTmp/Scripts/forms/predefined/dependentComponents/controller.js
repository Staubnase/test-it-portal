/**
affectedItems
**/

define(function (require) {
    var tpl = require("text!forms/predefined/dependentComponents/view.html");
    var relatedItem = require("forms/predefined/multipleObjectPicker/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            var properties = {
                Disabled: true,
                ProjectionId: '',

            };


            $.extend(true, properties, node);


            var templateFrag = $(built(properties));
            callback(templateFrag);

            node.PropertyToDisplay = { DisplayName: "Name", ClassName: "Class Name", IsAffectedByCR: "Affected By Change", IsAffectedByIR: "Affected By Incident" };
            node.ClassId = "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC";
            node.PropertyName = "ConfigItem";
            node.SelectableRow = true;
            node.SelectProperty = "DisplayName";
            
            var grid = relatedItem.build(vm, node, callback);
            grid.on("click", "td", function (e) {
                var kendoGrid = grid.data("kendoGrid");
                var selectedItem = kendoGrid.dataItem($(e.currentTarget).closest("tr"));
                

                $.get("/configItems/GetWorkItemsRelatedToConfigItem", { id: selectedItem.BaseId }, function (workitems) {
                    var tempArr = vm.get("ConfigItemRelatedWI");
                    _.each(tempArr, function (wi) {
                        vm["ConfigItemRelatedWI"].shift(wi);
                    });

                    _.each(workitems, function (wi) {
                        vm["ConfigItemRelatedWI"].unshift(wi);
                    });
                });

            });

            _.defer(function () {
                var currentItems = vm.get(node.PropertyName);

                $.get("/configItems/GetDependentComponents", { id: vm.BaseId }, function (configItems) {
                    
                    _.each(configItems, function (item) {
                        for (var i in currentItems)
                        {
                            if (currentItems[i].ClassName == item.ClassName)
                            {
                                currentItems[i].set("IsAffectedByCR", item.IsAffectedByCR ? "Yes" : "None");
                                currentItems[i].set("IsAffectedByIR", item.IsAffectedByIR ? "Yes" : "None");
                                break;
                            }
                        }
                    });
                });
            });


            _.defer(function () {
                //creat grid for displaying related workitems
                node.Disabled = true;
                node.PropertyToDisplay = { DisplayName: "Title", Status: "Status", LastModified: "LastModified" };
                node.ClassId = "F59821E2-0364-ED2C-19E3-752EFBB1ECE9";
                node.PropertyName = "ConfigItemRelatedWI";
                node.SelectProperty = "DisplayName";
                var grid = relatedItem.build(vm, node, callback);


                _.defer(function () {
                    var parentElement = grid.closest("#ConfigItemRelatedWI").parent();
                    parentElement.prepend('<div class="configItemComponents"><div class="relatedWorkItemsForSelectedItem">Related Work Items For Selected Item</div><hr class="relatedWorkItemsForSelectedItem-hr" /></div>');
                });
                

            });

        }
    }



    return definition;

});