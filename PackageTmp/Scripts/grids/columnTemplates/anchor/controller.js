/**
anchor - html anchor tags, used for titles or cells that will link to row details
**/
define(function (require) {
    var definition = {
        build: function (vm, node, callback) {
            node.template = node.template.replace('***', vm.grid.GridType);
            callback(node);
        }
    }

    return definition;

});
