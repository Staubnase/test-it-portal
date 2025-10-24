define([
    "forms/header/sticky/controller",
    "forms/header/stickyCI/controller",
    "forms/header/status/controller",
    "forms/header/relationships/controller",
    "forms/header/slo/controller",
    "forms/header/spacer/controller",
    "forms/header/title/controller",
    "forms/header/approval/controller"

], function (
    sticky,
    stickyCI,
    status,
    relationships,
    slo,
    spacer,
    title,
    approval
        ) {


    var definition = {
        build: function (vm, callback) {
            //loop all rows in header definition
            _.each(vm.headerTemplate.rows, function (row) {
                //create row dom element
                var rowElm = $('<div/>').addClass("row");
                //loop all cols in def
                _.each(row.columns, function (column) {
                    //create col element
                    var colElm = $('<div/>').addClass(column.Class);

                    // Decide on Template
                    eval("var _obj = " + column.View + ";");
                    // Check if Template Exists
                    if (!_obj) {
                        //TODO: should we maybe just default to the string object?
                        throw Exception(column.View + " is not part of the templating system");
                        return false;
                    }

                    _obj.build(vm, column, function (view) {
                        //callback(view);
                        colElm.append(view);
                        colElm.appendTo(rowElm);
                    });


                });

                callback(rowElm);
            });

        }
    }


    return definition;
});