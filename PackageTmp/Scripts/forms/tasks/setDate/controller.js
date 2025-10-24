/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/setDate/view.html");
    var datePicker = require("forms/fields/date/controller");
    var stringArea = require("forms/fields/string/controller");
    var txtArea = require("forms/fields/longstring/controller");
    var checkBox = require("forms/fields/boolean/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            var title = node.Configs.Title;//localization.ChangeStatusTask;
            

            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });
            var datePickerCtrl;
            var checkboxCtrl;
            //add in hidden window
            callback(view.render());

            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                openWindow: function () {
                    var cont = view.element.clone(); //we have the element in memory so no need use a selector
                    win = cont.kendoCiresonWindow({
                        title: title,
                        width: 600,
                        height: 375,
                        actions: []
                    }).data("kendoWindow");

                    var dateLabel="";
                    //this view Model is bound to the window element
                    var _vmWindow = kendo.observable({
                        type: node.Configs.type,
                        workItemModel: vm.viewModel,
                        okClick: function () {
                            switch(node.Configs.viewType){
                                case "hdDisposal":
                                    vm.viewModel.set("HardwareAssetStatus", { Id: "020822bd-7d3a-4c0f-1be4-325ef1aa52b4", Name: localization.Disposed });
                                    break;
                                case "hdREcieveDate":
                                case "MasterContractRenewedOn":
                                    if (vm.viewModel.get(checkboxCtrl.attr("name"))) {
                                        datePickerCtrl.val("").blur();

                                    }
                                    break;
                            }
                            win.close();
                        },
                        cancelClick: function () {
                            var cancelledDate = "";
                            if (!_.isNull(originalDate)) {
                                cancelledDate = kendo.toString(new Date(originalDate), "g");
                            }
                            $('[name="' + dateProperties.PropertyName + '"]').val(cancelledDate).blur();
                            if (node.Configs.viewType == "hdDisposal") {
                                vm.viewModel.set("DisposalReference", OriginalDisposalReference);
                            } else if (node.Configs.viewType == "hdREcieveDate") {
                                vm.viewModel.recieveCheckbox = OriginalCheckBox;
                            }
                            else if (node.Configs.viewType == "MasterContractRenewedOn") {
                                vm.viewModel.masterContractStartingDateCheckbox = OriginalCheckBox;
                            }

                            win.close();
                        },
                    });

                    if (node.Configs.viewType == "hdDisposal") {
                        dateLabel = localization.DisposalDate;
                    } else if (node.Configs.viewType == "hdREcieveDate") {
                        dateLabel = localization.ReceiveDate;
                    } else if (node.Configs.viewType == "MasterContractRenewedOn") {
                        dateLabel = localization.StartDate;
                    }


                    //add control to the window
                    kendo.bind(cont, _vmWindow);
                    
                    //create status enumPicker
                    
                    var originalDate = vm.viewModel.get(node.Configs.propertyKey);
                    var dateProperties = {
                        PropertyName: node.Configs.propertyKey,
                        PropertyDisplayName: dateLabel,
                        vm: vm.viewModel,
                        disabled:false
                    };
                    
                    buildDatePicker(cont.find('#datePicker'), dateProperties, vm.viewModel);

                    if (node.Configs.viewType == "hdDisposal") {
                        var OriginalDisposalReference = vm.viewModel.get("DisposalReference");
                        var stringProperties = {
                            PropertyName: "DisposalReference",
                            PropertyDisplayName: localization.DisposalReference,
                            vm: vm.viewModel
                        };
                        buildString(cont.find("#disposalReference"), stringProperties, vm.viewModel);
                    } else if (node.Configs.viewType == "hdREcieveDate") {
                        var OriginalCheckBox = vm.viewModel.recieveCheckbox;
                        var properties = {
                            PropertyName: "recieveCheckbox",
                            PropertyDisplayName: localization.RemoveReceivedDate,
                            Inline: true
                        };
                        buildCheckbox(cont.find("#disposalReference"), properties, vm.viewModel);
                    } else if (node.Configs.viewType == "MasterContractRenewedOn") {
                        var OriginalCheckBox = vm.viewModel.masterContractStartingDateCheckbox;
                        var properties = {
                            PropertyName: "masterContractStartingDateCheckbox",
                            PropertyDisplayName: localization.RemoveMasterLeaseWarrantyStarts,
                            Inline: true
                        };
                        buildCheckbox(cont.find("#disposalReference"), properties, vm.viewModel);
                    }

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

            //more functions
            var buildDatePicker = function (container, props, vmModel) {
                if (_.isNull(vmModel[props.PropertyName]) || vmModel[props.PropertyName] == "") {
                    vmModel.set(props.PropertyName, kendo.toString(new Date(), "g"));
                } else {
                    vmModel.set(props.PropertyName, kendo.toString(new Date(vmModel[props.PropertyName]), "g"));
                }
                
                datePicker.build(vmModel, props, function (dateControl) {
                    container.html(dateControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                    datePickerCtrl = container.find("input[name='" + props.PropertyName + "']");

                    //will make sure date will reflect back to the main control from the form
                    datePickerCtrl.focus();
                    datePickerCtrl.blur();
                });
            }

            var buildString = function (container, props, vmModel) {
                stringArea.build(vmModel, props, function (stringControl) {
                    container.html(stringControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                });
            }

            var buildCheckbox = function (container, props, vmModel) {
                checkBox.build(vmModel, props, function (checkboxControl) {
                    container.html(checkboxControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                    checkboxCtrl = container.find("input[name='" + props.PropertyName + "']");
                    vm.viewModel.set(props.PropertyName,false);
                    checkboxCtrl.click(function () {
                        var dtm = datePickerCtrl.data("kendoDatePicker");
                        if (this.checked) {
                            dtm.enable(false);
                        } else {
                            dtm.enable(true);
                        }
                    });
                });
            }

        }
    }

    return definition;

});