/**
Command Column
**/
define(function (require) {

    var definition = {
        build: function (vm, node, callback) {
            _.each(node.command, function (command) {
                if (_.isString(command.text)) {
                    command.text = localizationHelper.localize(command.text, command.text);
                }
                if (_.isObject(command.text)) {
                    _.each(command.text, function (value, key) {
                        command.text[key] = localizationHelper.localize(value, value);
                    });
                }
                switch (command.name) {
                    case "immediateDelete":
                        //command.imageClass = "fa-2x fa fa-trash-o pad10";
                        command.click = function (e) {
                            e.preventDefault();
                            var grid = $(this.element).data("kendoGrid");
                            var dataItem = grid.dataItem($(e.currentTarget).closest("tr"));

                            //need to see if the grid has unsaved edits
                            var hasPendingEdits = false;
                            _.each(grid.dataSource.data(), function (row) {
                                if (row.dirty) {
                                    if (row.uid != dataItem.uid) {
                                        hasPendingEdits = true;
                                    }
                                }
                            });
                            if (hasPendingEdits) {
                                kendo.ui.ExtAlertDialog.show({
                                    message: localizationHelper.localize("SaveOrCancelBeforeDelete")
                                });
                            } else {
                                $.when(kendo.ui.ExtYesNoDialog.show({
                                    //todo: see how we can pull this out into the config (specific to localization == not reusable)
                                    title: localizationHelper.localize("DeleteLocalizationTitle"), //, "Delete Localization Key"),
                                    message: localizationHelper.localize("ConfirmDelete")//, "Are you sure you want to delete this?")
                                })).done(function (response) {
                                    if (response.button === "yes") {
                                        app.lib.mask.apply();
                                        grid.dataSource.remove(dataItem);
                                        grid.dataSource.sync();
                                    } 
                                });
                            }
                        }
                        command.text = localizationHelper.localize(command.text);
                        break;
                    default:
                }
            });
            callback(node);
        }
    }

    return definition;

});
