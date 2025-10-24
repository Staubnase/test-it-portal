/**
Source Fields: gets the dataSource.schema.model.fields data based on .net Class type
**/
define(function (require) {

    var definition = {
        build: function (vm, node, callback) {
            vm.dataSource.schema.model.fields = {}
            _.each(vm.grid.columns, function (col) {
                vm.dataSource.schema.model.fields[col.field] = {
                    "type": col.DataType,
                    "editable": _.isUndefined(col.editable) ? false : col.editable
                }
                if (col.DataType === 'number') {
                    //Parse to Number so that localizations(Dutch, Spanish, etc.) would work even for given numbers with "."
                    vm.dataSource.schema.model.fields[col.field].parse = function (num) {
                        if (_.isNull(num) || _.isUndefined(num))
                            return 0;
                        else
                            return Number(num);
                    }
                }
                if (col.DataType === 'date') {

                    //Fix for TFS Portal BUG 12131
                    if (col.field.indexOf("AsDatePart") == -1 && vm.grid.GridType == "WorkItem" && vm.grid.dataUrl.toString() != "/grid/GetPromotedView/") {
                        var colField = col.field;
                        var newColumn = col;
                        newColumn.field = col.field + "AsDatePart";
                        vm.grid.columns.push(newColumn);
                        vm.dataSource.schema.model.fields[col.field] = {
                            "type": col.DataType,
                            "editable": _.isUndefined(col.editable) ? false : col.editable
                        }
                    }
                   
                }
            });

            callback();
        }
    }
    return definition;
});
