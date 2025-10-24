/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/copyLicenseAssignments/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            

            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());

            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                openWindow: function () {
                    var cont = view.element.clone(); //we have the element in memory so no need use a selector
                    win = cont.kendoCiresonWindow({
                        title: localization.CopyLicenseAssignments,
                        width: 600,
                        height: 375,
                        actions: []
                    }).data("kendoWindow");

                    
                    var dateLabel="";
                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        type: node.Configs.type,
                        okClick: function () {
                            

                            $.when(kendo.ui.ExtAlertDialog.show({
                                title: localization.CiresonAssetManagement,
                                message: localization.StartCopyLicenseAsssignements
                            })).done(function (response) {
                                $.post("/AssetManagement/SoftwareAsset/CopyLicenseAssignments/", cont.find("#windowContent form").serialize() + "&id=" + vm.viewModel.BaseId, function (data) {
                                    if (data.success == true) {
                                        //console.log(data);
                                        //source.selected

                                        var bTransferUsers = false;
                                        var bTransferComputers = false;
                                        var bTranserToAuthorised = false;
                                        
                                        var target = targetVM.selected;
                                        var source = sourceVM.selected;
                                        var bTranserToAssigned = target=="AssignedList";

                                        var computerList = data.ComputerList;
                                        var userList = data.UserList;

                                        if (target=="AuthorizedList") bTranserToAuthorised = true;
                                        if (source=="Users") bTransferUsers = true;
                                        if (source=="Computers") bTransferComputers = true;

                                        if (source=="Both") {
                                            bTransferUsers = true;
                                            bTransferComputers = true;
                                        }

                                        if (target=="Both") {
                                            bTranserToAssigned = true;
                                            bTranserToAuthorised = true;
                                        }


                                        if (bTransferUsers && bTranserToAssigned) {
                                            PerformTransfer(vm.viewModel, userList, "Target_SoftwareAssetHasAssignedUsers");
                                        }

                                        if (bTransferComputers && bTranserToAssigned) {
                                            PerformTransfer(vm.viewModel, computerList, "Target_SoftwareAssetHasAssignedComputers");
                                        }

                                        if (bTransferUsers && bTranserToAuthorised) 
                                        {
                                            PerformTransfer(vm.viewModel, userList, "Target_SoftwareAssetHasAuthorisedUser");
                                        }

                                        if (bTransferComputers && bTranserToAuthorised)
                                        {
                                            PerformTransfer(vm.viewModel, computerList, "Target_SoftwareAssetHasAuthorisedComputer");
                                        }

                                        
                                        kendo.ui.ExtAlertDialog.show({
                                            title: localization.CiresonAssetManagement,
                                            message: localization.UpdateSoftwareAssetMsg
                                        });
                                    } else {
                                        kendo.ui.ExtAlertDialog.show({
                                            title: localization.CiresonAssetManagement,
                                            message: data.error
                                        });
                                    }
                                });
                            });
                            
                            win.close();
                        },
                        cancelClick: function () {
                            
                            win.close();
                        },
                    });


                    //add control to the window
                    kendo.bind(cont, _vmWindow);

                    var PerformTransfer = function (viewModel, itemList, targetProperty) {
                        var target = viewModel[targetProperty];
                        var isExist = false;
                        for (var index in itemList) {
                            isExist = false;
                            for (var indexTarget in target) {
                                if (target[indexTarget].BaseId == itemList[index].BaseId) {
                                    isExist = true;
                                    break;
                                }
                            }

                            if (isExist) continue;
                            target.addItem(itemList[index]);
                        }
                    }

                    var sourceVM = kendo.observable({
                        selected: "Computers"
                    });

                    kendo.bind(cont.find("#source"), sourceVM);

                    var targetVM = kendo.observable({
                        selected: "AuthorizedList"
                    });

                    kendo.bind(cont.find("#target"), targetVM);
                    
                    //create status enumPicker

                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "openWindow",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

        }
    }

    return definition;

});