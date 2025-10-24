/**
affectedItems
**/

define(function (require) {
    var tpl = require("text!forms/predefined/serviceComponents/view.html");
    var relatedItem = require("forms/predefined/multipleObjectPicker/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);
            var properties = {
                Disabled: true,
                ProjectionId: ''
            };


            $.extend(true, properties, node);


            var templateFrag = $(built(properties));
            callback(templateFrag);

            node.Disabled = true;
            node.PropertyToDisplay = { DisplayName: "Title", Status: "Status", LastModified: "LastModified" };
            node.ClassId = "F59821E2-0364-ED2C-19E3-752EFBB1ECE9";
            node.SelectableRow = true;
            node.SelectProperty = "DisplayName";
            node.PropertyName = "scopeIsAboutConfigItems";
            var grid = relatedItem.build(vm, node, callback);


            _.defer(function () {



                $.get("/configItems/GetConfigItemComponents", { id: vm.BaseId }, function (data) {
                    vm.view.treeController = kendo.observable({
                            isVisible: true,
                            onSelect: function (e) {
                                var treeView = e.sender;
                                var nodeVM =  treeView.dataItem(e.node)
                                templateFrag.find(".name").html(nodeVM.DisplayName);
                                templateFrag.find(".className").html(nodeVM.ClassName);

                                $.get("/configItems/GetWorkItemsRelatedToConfigItem", { id: nodeVM.Id }, function (workitems) {
                                    //var workitems = JSON.parse(wiData);
                                    
                                    var tempArr = vm.get(node.PropertyName);
                                    _.each(tempArr, function (wi) {
                                        vm[node.PropertyName].shift(wi);
                                    });

                                    _.each(workitems, function (wi) {
                                        vm[node.PropertyName].unshift(wi);
                                    });
                                });
                            },
                            items: JSON.parse(data)
                        });

                        kendo.bind(templateFrag, vm.view.treeController);
                });


            });
            




        }
    }



    return definition;

});