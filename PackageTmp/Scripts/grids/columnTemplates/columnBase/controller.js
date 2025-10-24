/**
Base Column - implementations that are standard across all col type definitions
**/
define(function (require) {
    var definition = {
        build: function (vm, node, callback) {
            //if no title, set title to node.field for localization attempt
            if (_.isUndefined(node.title) || [node.title].length <= 0) {
                node.title = node.field;
            }

            //localize header title. If node.title is not in the localization lookup files, it will fall back to the string itself
            node.title = !_.isUndefined(localization[node.title]) ? localization[node.title] : node.title;

            callback(node);
        }
    }

    return definition;

});
