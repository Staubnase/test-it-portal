/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/changeStatus/view.html");
    var enumPicker = require("forms/fields/enum/controller");
    var txtArea = require("forms/fields/longstring/controller");
    var checkBox = require("forms/fields/boolean/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            var title = localization.ChangeHardwareAssetStatus;
            var statusPropertyName;
            if (node.Configs.type == "HardwareAsset") {
                if (node.Configs.enumName == "HardwareAssetStatus") {
                    
                } else if (node.Configs.enumName == "HardwareAssetType") {
                    title = localization.ChangeHardwareAssetType;
                } 
            } else if (node.Configs.type == "SoftwareAsset") {
                if (node.Configs.enumName == "SoftwareAssetStatus") {
                    title = localization.ChangeSoftwareAssetStatus;
                } else if (node.Configs.enumName == "SoftwareAssetType") {
                    title = localization.ChangeSoftwareAssetType;
                }
            }

            var tempStatus = { "Id": vm.viewModel[node.Configs.enumName].Id, "Name": vm.viewModel[node.Configs.enumName].Name };
            

            //build the template for the window
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());

            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                changeStatus: function () {
                    var cont = view.element.clone(); //we have the element in memory so no need use a selector
                    win = cont.kendoCiresonWindow({
                        title: title,
                        width: 600,
                        height: 375,
                        actions: []
                    }).data("kendoWindow");

                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        enumId: node.Configs.statusEnumId,
                        type: node.Configs.type,
                        workItemModel: vm.viewModel,
                        okClick: function () {
                            win.close();
                        },
                        cancelClick: function () {
                            vm.viewModel.set(node.Configs.enumName, tempStatus);
                            win.close();
                        },
                       
                    });
                    //add control to the window
                    kendo.bind(cont, _vmWindow);
                    
                    //create status enumPicker
                    var statusProperties = {
                        PropertyName: node.Configs.enumName,
                        PropertyDisplayName: 'Status',
                        EnumId: _vmWindow.enumId
                    };
                    buildEnumPicker(cont.find('#statusPicker'), statusProperties, vm.viewModel);

                    //var statusDropDown = cont.find('div[data-role="HardwareAssetStatus"]').data().handler._dropdown;
                    //var statusTreeView = cont.find('div[data-role="status"]').data().handler._treeview;



                    //bind status change
                    //vm.viewModel.HardwareAssetStatus.bind("change", function (e) {
                    vm.viewModel[node.Configs.enumName].bind("change", function (e) {
                        switch (e.sender.Id) {
                            
                            default:
                                //_vmWindow.set("showComment", false);
                                //_vmWindow.set("showResolution", false);
                                //_vmWindow.set("requireResolution", false);
                                break;
                        }
                        _vmWindow.set("okEnabled", true);
                    });

                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "changeStatus",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

            //more functions
            var buildEnumPicker = function (container, props, vmModel) {
                enumPicker.build(vmModel, props, function (enumControl) {
                    container.html(enumControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                });
            }

          
        }
    }

    return definition;

});