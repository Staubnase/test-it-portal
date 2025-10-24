/**
SLO Column
**/
define(function (require) {
    var tpl = require("text!grids/columnTemplates/SLOStatus/view.html");
    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            if (_.isUndefined(vm.gridJsonDataForCountdown)) {
                vm.gridJsonDataForCountdown = {};
            }
            var built = _.template(tpl);
            //var view = new kendo.View(built(), { wrap: false });
            $('#' + vm.containerId).append(built());
            SLO.Init(vm);
            setInterval(function () { SLO.DoCountDown(); }, 1000);
            node.filterable = { ui: sloFilter };

            function sloFilter(element) {
                if (_.isUndefined(element)) {
                    return;
                }
                element.kendoDropDownList({
                    dataTextField: "displayName",
                    dataValueField: "value",
                    dataSource: [
                        { value: "Active", displayName: localization.SLOStatusActive },
                        { value: "Met", displayName: localization.SLOStatusMet },
                        { value: "Warning", displayName: localization.SLOStatusWarning },
                        { value: "Breached", displayName: localization.SLOStatusBreached },
                        { value: "Paused", displayName: localization.SLOStatusPaused }],
                    optionLabel: "--Select Value--"
                });
            }
            callback(node);
        }
    }
    return definition;
});




//=========used for SLO==============
var sloTempContainer;
//=========END used for SLO==============
var SLO = {
    ViewModel: {},
    Init: function (vm) {
        SLO.ViewModel = vm;
        sloTempContainer = $("#slo-togrid");
    },
    SLOHover: function (sloElement) {

        sloElement.mouseenter(function () {
            sloElement.find(".slo-loader").show();
            $.post("/Grid/SLOPopup", { workItemId: sloElement.attr("wi") }, function (data) {
                sloElement.find(".slo-loader").hide();

                var allSlo = sloElement.find(".slo-togrid-allSlo");
                if (allSlo.hasClass("canceled")) {
                    allSlo.removeClass("canceled");
                    return;
                }
                allSlo.find(".removeSlo").remove();
                for (var key in data) {
                    var icon = "";
                    var isBreach = false;
                    var isMet = false;
                    switch (data[key].Status) {
                        case "Met":
                            icon = "fa fa-check-circle-o text-success fa-lg";
                            isMet = true;
                            break;
                        case "Active":
                            icon = "fa fa-clock-o text-primary fa-lg";
                            break;
                        case "Paused":
                            icon = "fa fa-pause text-info fa-lg";
                            break;
                        case "Warning":
                            icon = "fa fa-exclamation-circle text-warning fa-lg";
                            break;
                        case "Breached":
                            isBreach = true;
                            icon = "fa fa-bell text-danger fa-lg";
                            break;
                    }
                    //slo-clone-to-grid
                    var clone = allSlo.find(".slo-clone").clone();
                    //var clone = $(".slo-clone-to-grid").clone();
                    clone.removeClass("slo-clone");
                    clone.addClass("removeSlo");
                    if (isMet == false) {
                        if (isBreach) {
                            //clone.find(".slo-togrid-time-sub").html("-" + Math.abs(data[key].Time.Hours) + ":" + data[key].Time.Minutes).css("color", "red");
                            clone.find(".slo-togrid-time-sub").html("").css("color", "red");
                        } else {
                            var hourDispalay = data[key].Time.Hours;
                            if (data[key].Time.Hours < 10) {
                                hourDispalay = "0" + data[key].Time.Hours.toString();
                            }

                            var minDisplay = data[key].Time.Minutes;
                            if (data[key].Time.Minutes < 10) {
                                minDisplay = "0" + data[key].Time.Minutes.toString();
                            }

                            clone.find(".slo-togrid-time-sub").html(hourDispalay + ":" + minDisplay);
                        }
                    }
                    clone.find(".slo-togrid-title-sub").html(data[key].DisplayName);

                    //use fa not an image 
                    clone.find(".slo-togrid-icon-sub").addClass(icon);

                    //show the 
                    clone.removeClass("hide");
                    allSlo.append(clone);
                }
                allSlo.show();
                allSlo.css("margin-left", "-" + (allSlo[0].offsetWidth + 20) + "px");
            });
        });

        sloElement.hover(function (e) {
            //console.log(e);
            sloElement.find(".slo-togrid-allSlo").removeClass("canceled hide");
        });

        sloElement.mouseleave(function () {
            var allSlo = sloElement.find(".slo-togrid-allSlo");
            //allSlo.find(".removeSlo").remove();
            allSlo.addClass("canceled hide");
            //allSlo.hide();
        });
    },


    CreateSLOToGrid: function (sloElement, isTriggerdFromGrid) {
        var curImg;
        var sloInstance = SLO.ViewModel.gridJsonDataForCountdown[sloElement.attr("id")];
        var clone;
        var isBreach = false;
        var isMetOrBreach = false;
        if (sloInstance == null) return;
        if (!sloElement.hasClass("addedSloToGrid")) {
            sloElement.html("");
            clone = sloTempContainer.clone();
            sloElement.append(clone);
            sloElement.addClass("addedSloToGrid");
            clone.addClass("addedSloToGrid");
            clone.show();
            clone.attr("id", "");
        } else {
            clone = sloElement.find(".addedSloToGrid");
        }
        var txtTime = clone.find(".slo-togrid-time");
        sloInstance.ServerDatetimeNow = eval(sloInstance.ServerDatetimeNow);
        sloInstance.WarningDate = eval(sloInstance.WarningDate);

        iconClass = "fa fa-clock-o text-primary fa-lg";
        if (sloInstance.WarningDate <= sloInstance.ServerDatetimeNow)
            iconClass = "fa fa-exclamation-circle text-warning fa-lg";

        if (sloInstance.Time.Hours <= 0 && sloInstance.Time.Minutes <= 0 && sloInstance.Time.Seconds <= 0) {
            isBreach = true;
            iconClass = "fa fa-bell text-danger fa-lg";
            txtTime.css("color", "red");
        }

        if (sloInstance.Status == "SLAInstance.Status.Met") {
            iconClass = "fa fa-check-circle-o text-success fa-lg";
            isTriggerdFromGrid = true;
            isMetOrBreach = true;
        } else if (sloInstance.Status == "SLAInstance.Status.Paused") {
            iconClass = "fa fa-pause text-info fa-lg";
            isTriggerdFromGrid = true;
        } else if (sloInstance.Status == "SLAInstance.Status.Breached") {
            iconClass = "fa fa-bell text-danger fa-lg";
            isTriggerdFromGrid = true;
            isMetOrBreach = true;
        }

        if (isMetOrBreach == false) {
            var mins = (Math.abs(sloInstance.Time.Minutes) < 10) ? "0" + Math.abs(sloInstance.Time.Minutes) : Math.abs(sloInstance.Time.Minutes);
            var hour = Math.abs(sloInstance.Time.Hours) < 10 ? "0" + Math.abs(sloInstance.Time.Hours) : Math.abs(sloInstance.Time.Hours);
            txtTime.html((isBreach ? "-" : "") + hour + ":" + mins);
        }
        //use fa not an image 
        clone.find(".slo-togrid-icon i").attr("class", iconClass);
        if (isTriggerdFromGrid) {
            //alert(Math.abs(sloInstance.Time.Hours) + ":" + Math.abs(sloInstance.Time.Minutes));
            //alert(sloInstance.Status);
            return;
        }

        sloInstance.ServerDatetimeNow.getSeconds(sloInstance.ServerDatetimeNow.getSeconds() + 1);
        sloInstance.Time.Seconds = parseInt(sloInstance.Time.Seconds) - 1;

        if (sloInstance.Time.Hours <= 0 && sloInstance.Time.Minutes <= 0 && sloInstance.Time.Seconds <= 0) {
            if (sloInstance.Time.Seconds <= -60) {
                sloInstance.Time.Seconds = 0;
                sloInstance.Time.Minutes = parseInt(sloInstance.Time.Minutes) - 1;
            }

            if (sloInstance.Time.Minutes <= -60) {
                sloInstance.Time.Minutes = 0;
                sloInstance.Time.Hours = parseInt(sloInstance.Time.Hours) - 1;
            }
        } else {
            if (sloInstance.Time.Minutes < 0) {
                sloInstance.Time.Minutes = 59;
                sloInstance.Time.Hours = parseInt(sloInstance.Time.Hours) - 1;
            }

            if (sloInstance.Time.Seconds < 0) {
                sloInstance.Time.Seconds = 59;
                sloInstance.Time.Minutes = parseInt(sloInstance.Time.Minutes) - 1;
            }
        }
    },

    DoCountDown: function () {
        for (var key in SLO.ViewModel.gridJsonDataForCountdown) {
            if ($("#" + key)[0] == null) continue;
            SLO.CreateSLOToGrid($("#" + key), false);
        }
    },
    AssignSLOJson: function (id, value) {
        if (SLO.ViewModel.gridJsonDataForCountdown[id]== null) {
            if (value != null) {
                SLO.ViewModel.gridJsonDataForCountdown[id] = value;
            }
        }
    }
}
