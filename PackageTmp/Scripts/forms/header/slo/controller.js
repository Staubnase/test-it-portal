/**
Header Status
**/
define(function (require) {
    var tpl = require("text!forms/header/slo/view.html");

    var definition = {
        template: tpl,
        build: function(vm, node, callback) {
            //build template using underscore.js so that we can interpret kendo template vars if needed
            if (vm.isAnalyst) {
                var built = _.template(tpl);

                var view = new kendo.View(built(), {
                    wrap: false,
                    init: function() {
                        setTimeout(function() { DoWork(); }, 100);
                    },
                    model: vm
                });
                view.render(); //so we can manipulate it

                var DoWork = function() {

                    if (vm.viewModel["SLO"] == null) return;

                    var sloViewObj = view.element,
                        sloObjects = vm.viewModel["SLO"],
                        sloActive = "SLAInstance.Status.Active",
                        sloPaused = "SLAInstance.Status.Paused",
                        sloMet = "SLAInstance.Status.Met",
                        sloWarning = "SLAInstance.Status.Warning",
                        sloBreached = "SLAInstance.Status.Breached",
                        sloNotReady = "SLAInstance.Status.NotReady";

                    //var sloContainer = sloViewObj.find(".slo-container");
                    var sloContainer = $(".slo-container");

                    for (var key in sloObjects) {
                        if (sloObjects[key].DisplayName == null) continue;
                        var isMet = false;
                        var isPaused = false;

                        //var sloTemplate = kendo.template(sloViewObj.find("#slo-template").html());
                        var sloTemplate = kendo.template($("#slo-template").html());

                        var sloObj = {};
                        sloObj.Id = sloObjects[key].DisplayName.replace(" ", "");
                        sloObj.Title = sloObjects[key].DisplayName;

                        switch (sloObjects[key].Status) {
                        case sloActive:
                            sloObj.imageClass = "fa-clock-o text-primary";
                            break;
                        case sloPaused:
                        case sloNotReady:
                            isPaused = true;
                            sloObj.imageClass = "fa-pause text-info";
                            break;
                        case sloMet:
                            sloObj.imageClass = "fa-check-circle-o text-success";
                            //vm.view.controller.isMet = true;
                            isMet = true;
                            break;
                        case sloWarning:
                            sloObj.imageClass = "fa-exclamation-circle text-warning";
                            break;
                        case sloBreached:
                            sloObj.imageClass = "fa-bell text-danger";
                            isBreach = true;
                            break;
                        }

                        var sloImg = sloObj.imageClass; //should remove

                        var clone = $('<ul/>').addClass("slo-status-item");
                        clone.html(sloTemplate(sloObj));

                        //alert(sloObjects[key].Time.Hours);
                        SLOCoundown(clone, isMet, isPaused, sloObjects[key].Time.Hours, sloObjects[key].Time.Minutes, sloObjects[key].Time.Seconds,
                            eval(sloObjects[key].WarningDate), eval(sloObjects[key].ServerDatetimeNow), false);
                        sloContainer.append(clone);
                    }
                }

                var SLOCoundown = function(sloCloned, isMetStat, isPaused, hours, minutes, seconds, warningDate, serverCurrentDate, isBreach) {
                    //force warning image
                    if (!isMetStat && !isBreach && warningDate <= serverCurrentDate) {
                        //reset all classes 
                        sloCloned.find(".slo-icon").attr('class', "slo-icon fa fa-exclamation-circle text-warning fa-lg");
                    }

                    //set breached
                    if (!isMetStat && (seconds <= 0 && minutes <= 0 && hours <= 0)) {
                        isBreach = true;
                        sloCloned.find(".slo-icon").attr('class', "slo-icon fa fa-bell text-danger fa-lg");
                        sloCloned.find(".slo-timer").addClass("text-danger");
                    }

                    //set time in view
                    if (!isMetStat) {
                        var secs = (Math.abs(seconds) < 10) ? "0" + Math.abs(seconds) : Math.abs(seconds);
                        var mins = (Math.abs(minutes) < 10) ? "0" + Math.abs(minutes) : Math.abs(minutes);
                        var hrs = (Math.abs(hours) < 10) ? "0" + Math.abs(hours) : Math.abs(hours);
                        if (isBreach) {
                            sloCloned.find(".slo-timer").html("");
                        } else
                            sloCloned.find(".slo-timer").html((isBreach ? "-" : "") + Math.abs(hrs) + ":" + mins + ":" + secs);
                        //return;
                    } else {
                        sloCloned.find(".slo-timer").html("&nbsp;");
                        return;
                    }

                    if (isPaused) return;

                    //make the fancy js countdown
                    serverCurrentDate.setSeconds(serverCurrentDate.getSeconds() + 1);
                    seconds = parseInt(seconds) - 1;


                    if (seconds <= 0 && minutes <= 0 && hours <= 0) {
                        if (seconds <= -60) {
                            seconds = 0;
                            minutes = parseInt(minutes) - 1;
                        }

                        if (minutes <= -60) {
                            minutes = 0;
                            hours = parseInt(hours) - 1;
                        }
                    } else {
                        if (minutes < 0) {
                            minutes = 59;
                            hours = parseInt(hours) - 1;
                        }

                        if (seconds < 0) {
                            seconds = 59;
                            minutes = parseInt(minutes) - 1;
                        }
                    }


                    setTimeout(function() {
                        SLOCoundown(sloCloned, isMetStat, isPaused, hours, minutes, seconds,
                            warningDate, serverCurrentDate, isBreach);
                    }, 1000);
                }


                callback(view.render());
            }
        }
    }

    return definition;

});

