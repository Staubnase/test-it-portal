/**
Drawer Menu
**/
define(function (require) {
    var gridId;
    //var tpl = require("text!grids/structure/drawer/view.html");
    var definition = {
        build: function (vm, node, callback) {
            if (_.isUndefined(node)) {
                return;
            }
            gridId = vm.containerId || vm.gridId;
            _.each(node, function (button, key) {
                var viewModel = {
                    command: function (e) {
                        switch (key) {
                            case "addLocalization":
                                var tpl = require("text!grids/structure/drawer/createLocalizationTemplate.html");
                                var built = _.template(tpl);
                                $('#' + gridId).after(built());
                                addNewLocalization();
                                break;
                            case "saveLocalization":
                            case "savePopularityIndex":
                                savePendingChanges();
                                break;
                            case "cancelLocalization":
                            case "cancelPopularityIndex":
                                cancelPendingChanges();
                                break;
                            default:
                        }
                    },
                    visible: button.visible,
                    enabled: button.enabled
                }

                //todo: we don't need this, we need to use a template on the page already and call drawer.addButton
                var drawerButton = new kendo.View(
                    "<button data-bind='drawerMenuCommand: { " +
                    "titleKey: " + button.titleKey + ", " +
                    "icon: " + button.icon + ", " +
                    "command: command, " +
                    "visible: visible}, " +
                    "enabled: enabled '></button>",
                    { wrap: false, model: kendo.observable(viewModel) }
                );
                drawerButton.render();
            });
        }
    }

    function cancelPendingChanges() {
        var gridControl = $('#' + gridId).data('kendoGrid');
        gridControl.cancelChanges();
    };

    function savePendingChanges() {
        var gridControl = $('#' + gridId).data('kendoGrid');
        if (gridControl.dataSource.hasChanges()) {
            app.lib.mask.apply();
            gridControl.saveChanges();
        }
    };

    function addNewLocalization() {
        var gridControl = $('#' + gridId).data('kendoGrid');
        var dataSource = gridControl.dataSource;
        //need to see if the grid has unsaved edits
        if (dataSource.hasChanges()) {
            kendo.ui.ExtAlertDialog.show({
                message: localizationHelper.localize("SaveOrCancelBeforeAdd")
            });
        } else {
            //create modal control
            var popup = $("<div id='newLocalizationWindow'>")
                .appendTo($("body"))
                .kendoCiresonWindow({
                    title: localizationHelper.localize("AddNewKey"),
                    actions: [],
                    width: 400,
                    visible: true,
                    content: {
                        //sets window template
                        template: kendo.template($("#createLocalizationTemplate").html())
                    }
                }).data("kendoWindow").center();

            //create vm to bind to the popup
            var popupViewModel = kendo.observable({
                Key: "",
                English: "",
                ContextNotes: "",
                Locale: store.session.get('localizationGridLocale'),
                hasDuplicateKey: false,
                formInvalid: false
            });

            popupViewModel.validateForm = function () {
                var isValid = true;
                if (this.get('canSubmit') == false) {
                    isValid = false;
                };
                if (this.get('Key').length <= 0) {
                    isValid = false;
                };
                if (this.get('English').length <= 0) {
                    isValid = false;
                };
                if (this.get('hasDuplicateKey')) {
                    isValid = false;
                };
                return isValid;
            };

            popupViewModel.saveRecord = function () {
                //double check that everything validates (or like, triple check now..)
                if (popupViewModel.validateForm()) {
                    popupViewModel.set("formInvalid", false);

                    app.lib.mask.apply();
                    //insert without Id property so it recognizes it as an Add instead of Update
                    dataSource.insert(0, {
                        Key: popupViewModel.get("Key"),
                        Locale: popupViewModel.get("Locale"),
                        English: popupViewModel.get("English"),
                        ContextNotes: popupViewModel.get("ContextNotes").trim()
                    });

                    //sync calls the 'create' datasource endpoint since 'Id' above is blank
                    dataSource.sync();
                    //re-read data and close the modal window
                    dataSource.read();
                    popup.destroy();
                } else {
                    popupViewModel.set("formInvalid", true);
                }
            };

            popupViewModel.cancel = function (e) {
                dataSource.cancelChanges();
                popup.destroy();
            };

            //blur event for 'Key' field to validate it is not empty and not a duplicate
            popupViewModel.checkIfKeyIsValid = function (e) {
                var ele = e.currentTarget;

                //remove leading/trailing spaces
                popupViewModel.set("Key", popupViewModel.get("Key").trim());

                //validate there is value in field
                if (popupViewModel.get("Key").length <= 0) {
                    $(ele).closest('.form-group').addClass('has-error');
                    return;
                };

                //call endpoint to check if Key exists already
                $.ajax({
                    contentType: "application/json",
                    accepts: "application/json",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({ key: popupViewModel.get("Key"), locale: popupViewModel.get("Locale") }),
                    url: '/Localizations/KeyIsValid/'
                }).done(function (keyIsValid) {
                    if (keyIsValid) {
                        popupViewModel.set("hasDuplicateKey", false);
                        $(ele).closest('.form-group').removeClass('has-error');
                    } else {
                        popupViewModel.set("hasDuplicateKey", true);
                        $(ele).closest('.form-group').addClass('has-error');
                    }
                    popupViewModel.setCanSubmit();
                });
            };

            popupViewModel.checkForValue = function (e) {
                var ele = e.currentTarget;
                popupViewModel.set("English", popupViewModel.get("English").trim());
                //add error style if input is empty
                if (popupViewModel.get("English").length > 0) {
                    $(ele).closest('.form-group').removeClass('has-error');
                } else {
                    $(ele).closest('.form-group').addClass('has-error');
                }

                popupViewModel.setCanSubmit();
            };

            //can submit form when Key has value and is valid and English has value. Check on blur of each required input.
            popupViewModel.setCanSubmit = function () {
                if ((popupViewModel.get("Key").length > 0 && popupViewModel.get("hasDuplicateKey") == false) && popupViewModel.get("English").length > 0) {
                    popupViewModel.set("canSubmit", true);
                } else {
                    popupViewModel.set("canSubmit", false);
                }
            };

            //bind the popup to the vm
            kendo.bind(popup.element, popupViewModel);
        }
    }

    return definition;
});
