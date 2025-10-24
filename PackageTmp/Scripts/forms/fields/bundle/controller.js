/**
fileAttachments
**/

define(function (require) {
    var tpl = require("text!forms/fields/bundle/view.html");
   

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            var built = _.template(tpl);

            //check if string can be localized
            if (!_.isUndefined(localization[node.name]) && [node.name].length > 0) {
                node.name = localization[node.name];
            }


            var properties = {
                Disabled: node.disabled,
                PropertyName: node.PropertyName || ""
            };

            $.extend(true, properties, node);
            var template = $(built(properties));
            
            //k-grid-add
            var bundleData = [];
            var gridViewModel;
            
            var cont = template.find("#Bundle").clone(); //we have the element in memory so no need use a selector
            var win = cont.kendoCiresonWindow({
                title: localization.createOrEditSoftwareBundle,
                width: 850,
                height: 375,
                actions: [],
                activate: function () {}
            }).data("kendoWindow");

            var _vmWindow = new kendo.observable({
                okClick: function () {
                    var dataList = gridViewModel.products._data;
                    var tempSoftwarePattern = "";
                    var tempExclusionPattern = "";
                    var tempVersionPattern = "";
                    
                    for (var i = 0; i < dataList.length; i++) {
                        if (dataList[i].SoftwarePatternName == "") continue;
                        if ((dataList.length - 1) == i) {
                            tempSoftwarePattern = tempSoftwarePattern + dataList[i].SoftwarePatternName + "__" + dataList[i].SoftwarePattern;
                            tempExclusionPattern = tempExclusionPattern + dataList[i].ExclusionPattern;
                            tempVersionPattern = tempVersionPattern + dataList[i].VersionPattern;
                        }
                        else {
                            tempSoftwarePattern = tempSoftwarePattern + dataList[i].SoftwarePatternName + "__" + dataList[i].SoftwarePattern + "|";
                            tempExclusionPattern = tempExclusionPattern + dataList[i].ExclusionPattern + "|";
                            tempVersionPattern = tempVersionPattern + dataList[i].VersionPattern + "|";
                        }
                    }
                    vm.set("SoftwarePattern", tempSoftwarePattern);
                    vm.set("ExclusionPattern", tempExclusionPattern);
                    vm.set("VersionPattern", tempVersionPattern);
                    var SoftwarePatternTxt = $("input[name='SoftwarePattern']");
                    var ExclusionPatternTxt = $("input[name='ExclusionPattern']");
                    var VersionPatternTxt = $("input[name='VersionPattern']");
                    if (vm.SoftwarePattern!="") {
                        vm.set("IsBundle", true);
                        enableDisableTextbox(SoftwarePatternTxt,false);
                        enableDisableTextbox(ExclusionPatternTxt, false);
                        enableDisableTextbox(VersionPatternTxt, false);
                    } else {
                        vm.set("IsBundle", false);
                        enableDisableTextbox(SoftwarePatternTxt, true);
                        enableDisableTextbox(ExclusionPatternTxt, true);
                        enableDisableTextbox(VersionPatternTxt, true);
                    }
                    win.close();
                },
                cancelClick: function () {
                    win.close();
                },
            });

            kendo.bind(cont, _vmWindow);
            var enableDisableTextbox = function (txt, isEnable) {
                if (isEnable) {
                    txt.prop("disabled", false).removeClass("k-state-disabled");
                }
                else
                    txt.prop("disabled", true).addClass("k-state-disabled").closest(".has-error")
                                        .removeClass("has-error");
            }

            vm.view.onClick = function () {
                bundleData = [];
                var softwarePatternList = new Array();
                var exclusionPatternList = new Array();
                var versionPatternList = new Array();
                if (!_.isNull(vm.SoftwarePattern) && vm.SoftwarePattern != "") {
                    softwarePatternList = vm.SoftwarePattern == "" ? "" : vm.SoftwarePattern.split("|");
                }

                if (!_.isNull(vm.ExclusionPattern) && vm.ExclusionPattern != "") {
                    exclusionPatternList = vm.ExclusionPattern == "" ? "" : vm.ExclusionPattern.split("|");
                }

                if (!_.isNull(vm.VersionPattern) && vm.VersionPattern != "") {
                    versionPatternList = vm.VersionPattern == "" ? "" : vm.VersionPattern.split("|");
                }

                    
                if (vm.IsBundle) {
                    for (var i in softwarePatternList) {
                        var softwarePattern = softwarePatternList[i].split("__");
                        bundleData.push({ SoftwarePatternName: softwarePattern[0], SoftwarePattern: softwarePattern[1], VersionPattern: versionPatternList[i], ExclusionPattern: exclusionPatternList[i] });
                    }
                }
                

                gridViewModel = kendo.observable({
                    isVisible: true,
                    onSave: function (e) {
                        
                    },
                    products: new kendo.data.DataSource({
                        schema: {
                            model: {
                                id: "SoftwarePatternName",//an id is required to maintain edit/cancel state correctlf TFS3424
                                fields: {
                                    SoftwarePatternName: {
                                        editable: true,
                                        validation: {
                                            SoftwarePatternNamevalidation: function (input) {
                                                if (input.is("[name='SoftwarePatternName']") && input.val() == "") {
                                                    input.attr("data-SoftwarePatternNamevalidation-msg", localization.EnterRequiredFields);
                                                    return false;
                                                }
                                                return true;
                                            }
                                        }
                                    },
                                    SoftwarePattern: {
                                        editable: true, type: "string",
                                        validation: {
                                            SoftwarePatternvalidation: function (input) {
                                                if (input.is("[name='SoftwarePattern']") && input.val() == "") {
                                                    input.attr("data-SoftwarePatternvalidation-msg", localization.EnterRequiredFields);
                                                    return false;
                                                }
                                                return true;
                                            }
                                        }
                                    },
                                    VersionPattern: { editable: true, type: "string", validation: { required: false } },
                                    ExclusionPattern: { editable: true, type: "string", validation: { required: false } }
                                }
                            }
                        },
                        batch: false,
                        data: bundleData,
                    })
                });

                kendo.bind(cont.find("#bundleGrid"), gridViewModel);

                cont.removeClass('hide');
                cont.show();

                win.open();
            }

            callback(template);
        }
    }

   

    return definition;

});
