/**
billableTime
**/

define(function (require) {
    var tpl = require("text!forms/predefined/billableTime/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //make sure we have all the vals set
            var properties = {
                Disabled: node.disabled,
                PropertyName: "AppliesToWorkItem"
            };

            $.extend(true, properties, node);

            var name = properties.PropertyName;
            //use setters and getters if you want vm boundOdj to trigger change
            if (_.isUndefined(vm[name])) {
                vm.set(name, new kendo.data.ObservableArray([]));
            }
            var boundArray = vm.get(name);
            boundArray.LastUpdatedDisplay = "";
            

            vm.view.billableTimeController = new kendo.observable({
                btHour: 0,
                btMinute: 0,
                btTotalTime: 0,
                btTotalTimeInString: "",
                onHourSpin: function (e) {
                    vm.view.billableTimeController.set('btHour', e.sender.value());
                },
                onMinuteSpin: function (e) {
                    vm.view.billableTimeController.set('btMinute', e.sender.value());
                },
                dataSource: new kendo.data.DataSource({
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
                }),
                onCellClose: function (e) {
                    vm.view.billableTimeController.computeTotalTime();
                },
                remove: function (e) {
                    vm.view.billableTimeController.computeTotalTime();
                },
                onDataBinding: function (e) {
                    $.each(boundArray, function (i, item) {
                        if (_.isUndefined(item.BillableTime)) {
                            item.BillableTime = { BasedId: null, DisplayName: null };
                        }
                        item.LastUpdatedDisplay =
                            !_.isUndefined(item.LastUpdated)
                                ? kendo.toString(new Date(item.LastUpdated), 'g')
                                : null;
                    });
                },
                onDataBound: function (e) {
                    for (var item in e.sender._data) {
                        var dataItem = e.sender._data[item];
                        if (_.isNull(dataItem.BillableTime.BasedId)) {
                            var row = e.sender.tbody.find("tr[data-uid='" + dataItem.uid + "']");
                            row.hide();
                        }
                    }
                    vm.view.billableTimeController.computeTotalTime();
                },
                onAddClick: function (e) {
                    var hour = vm.view.billableTimeController.btHour;
                    var minute = vm.view.billableTimeController.btMinute;
                    var totalTime = vm.view.billableTimeController.btTotalTime;

                    var isExisting = false;
                    
                    $.each(boundArray, function (i, item) {
                        if (item.BillableTime.BaseId === session.user.Id) {
                            item.set("LastUpdated", new Date().toISOString());
                            item.set("TimeInMinutes", parseInt(item.get("TimeInMinutes")) + (hour * 60) + minute);
                            isExisting = true;
                            return false;
                        }
                    });
                    if (!isExisting) {
                        var newBillableModel = {
                            BillableTime: {
                                BaseId: session.user.Id,
                                DisplayName: session.user.Name
                            },
                            LastUpdated: new Date().toISOString(),
                            LastModified: new Date().toISOString(),
                            TimeInMinutes: (hour * 60) + minute,
                            BasedId: app.lib.newGUID(),
                            Image: app.config.iconPath + app.config.icons["comment"],
                            EnteredDate: new Date().toISOString(),
                            ClassTypeId: "6645cdbe-78a3-ab81-7de9-638b733214fe",
                            EnteredBy: session.user.Name,
                            Title: null,
                            Description: null
                        }
                        boundArray.push(newBillableModel);
                    }
                    vm.view.billableTimeController.computeTotalTime();
                    vm.view.billableTimeController.resetTime();
                },
                onSubtractClick: function (e) {
                    var hour = vm.view.billableTimeController.btHour;
                    var minute = vm.view.billableTimeController.btMinute;
                    var totalTime = vm.view.billableTimeController.btTotalTime;

                    if ((totalTime < (hour * 60)) || (totalTime < minute)) {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.SubtractTimeTitle,
                            message: localization.SubtractTimeMessage
                        });
                    } else {
                        $.each(boundArray, function (i, item) {
                            if (item.BillableTime.BaseId === session.user.Id) {
                                item.set("LastUpdated", new Date().toISOString());
                                item.set("TimeInMinutes", parseInt(item.get("TimeInMinutes")) - (hour * 60) - minute);
                                isExisting = true;
                            }
                        });
                        vm.view.billableTimeController.computeTotalTime();
                        vm.view.billableTimeController.resetTime();
                    }
                },
                computeTotalTime: function (e) {
                    var itemTotalTime = 0;
                    
                    $.each(boundArray, function (i, item) {
                        if (item.get("ClassTypeId") === "6645cdbe-78a3-ab81-7de9-638b733214fe") {
                            itemTotalTime += parseInt(item.get("TimeInMinutes"));
                        }
                    });
                    
                    vm.view.billableTimeController.btTotalTime = itemTotalTime;
                    vm.view.billableTimeController.btTotalTimeInString =
                        ("{0} : {1} {2}")
                        .replace("{0}", localization.Totaltime)
                        .replace("{1}", vm.view.billableTimeController.btTotalTime)
                        .replace("{2}", localization.minutes);

                    kendo.bind($("#btTotalTimeInString"), vm);
                },
                resetTime: function () {
                    $('#hourNumeric').data("kendoNumericTextBox").value(0);
                    vm.view.billableTimeController.set('btHour', 0);
                    $('#minuteNumeric').data("kendoNumericTextBox").value(0);
                    vm.view.billableTimeController.set('btMinute', 0);
                },
                isVisible: !vm.isDisabled
            });

            var view = new kendo.View(built(properties), { wrap: false, model: vm });
            callback(view.render());
        }
    }

    return definition;

});