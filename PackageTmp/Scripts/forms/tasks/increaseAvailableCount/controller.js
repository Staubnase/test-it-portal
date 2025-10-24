/**
change Status
**/


define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/increaseAvailableCount/view.html");
    var stringArea = require("forms/fields/longString/controller");
    var numericArea = require("forms/fields/numeric/controller");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            var title = localization.EditConsumableAvailableCount;
            

            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());
            var tempLog;
            

            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                openWindow: function () {
                    var cont = view.element.clone(); //we have the element in memory so no need use a selector
                    win = cont.kendoCiresonWindow({
                        title: title,
                        width: 600,
                        height: 380,
                        actions: [],
                        activate: function () {
                            tempLog = new kendo.data.ObservableObject({
                                ClassTypeId: "67ce5b07-835d-246d-478d-29cee397c66e",
                                Comment: "",
                                Target_LogHasCreator: {
                                    ClassTypeId: "eca3c52a-f273-5cdc-f165-3eb95a2b26cf",
                                    BaseId: session.user.Id,
                                },
                                AllowCreatedDate: true,
                                Name: app.lib.newGUID(),
                                Type: {
                                    Id: "884650a1-632a-0532-b0d4-8c6b1d990752",
                                    Name: localization.TaskRun
                                }
                            });

                            var countProperties = {
                                PropertyName: "zeroCount",
                                PropertyDisplayName: "IncreaseConsumableAvailableCountBy",
                                DecimalPlaces: 0,
                                Required: true,
                                vm: zeroCount
                            };

                            buildNumeric(cont.find("#increaseAvailableCount"), countProperties, zeroCount);

                            var commentProperties = {
                                PropertyName: "Comment",
                                PropertyDisplayName: "Comment",
                                Required: true,
                                vm: tempLog,
                                Rows: 5
                            };


                            buildString(cont.find("#commentAvailableCount"), commentProperties, tempLog);
                        }
                    }).data("kendoWindow");

                    
                    var dateLabel="";
                    //this view Model is bound to the window element
                    var currentCount = vm.viewModel.get("Count");
                    var zeroCount = new kendo.data.ObservableObject({ zeroCount: 0 });
                    
                    var _vmWindow = new kendo.observable({
                        type: node.Configs.type,
                        workItemModel: vm.viewModel,
                        okClick: function () {
                            var addedcount = parseInt(zeroCount.get("zeroCount"));
                            if (addedcount == 0 || tempLog.get("Comment") == "") {
                                kendo.ui.ExtAlertDialog.show({
                                    title: localization.CiresonAssetManagement,
                                    message: localization.RequiredFieldsErrorMessage
                                });
                            } else {
                                var newCount = parseInt(currentCount) + addedcount;
                                vm.viewModel.set("Count", newCount);
                                //tempLog.set("Title","Increased Available Count by " + currentCount + " to " + newCount);
                                tempLog.set("Title", localization.IncreasedAvailableCount.replace("{0}", currentCount) + newCount);
                                tempLog.set("CreatedDate",new Date());
                                vm.viewModel["Target_ConsumableHasLogs"].unshift(tempLog);
                                win.close();
                            }
                        },
                        cancelClick: function () {
                            win.close();
                        },
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
                Target: "openWindow",
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());

           
            var buildNumeric = function (container, props, vmModel) {
                numericArea.build(vmModel, props, function (stringControl) {
                    container.html(stringControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                });
            }

            var buildString = function (container, props, vmModel) {
                stringArea.build(vmModel, props, function (stringControl) {
                    container.html(stringControl);
                    app.controls.apply(container, { localize: true, vm: vmModel, bind: true });
                });
            }
        }
    }

    return definition;

});