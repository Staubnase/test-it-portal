(function ($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Tilføje udtryk",
                "addGroup": "Tilføje gruppe",
                "and": "Og",
                "apply": "Anvende",
                "close": "Lukke",
                "fields": "Felter",
                "operators": "Operatører",
                "or": "Eller"
            });
        /* Filter operator messages */
        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "date": {
                    "eq": "er lig med",
                    "gte": "er senere end eller lig med",
                    "gt": "er senere end",
                    "lte": "er før eller lig med",
                    "lt": "er før",
                    "neq": "er ikke lig med",
                    "isnull": "er nul",
                    "isnotnull": "er ikke nul",
                },
                "number": {
                    "eq": "er lig med",
                    "gte": "er større end eller lig med",
                    "gt": "er større end",
                    "lte": "er mindre end eller lig med",
                    "lt": "er mindre end",
                    "neq": "er forskellig fra",
                    "isnull": "er nul",
                    "isnotnull": "er ikke nul",
                },
                "string": {
                    "endswith": "slutter med",
                    "eq": "er lig med",
                    "neq": "er forskellig fra",
                    "startswith": "begynder med",
                    "contains": "indeholder",
                    "doesnotcontain": "ikke indeholder",
                    "isnull": "er nul",
                    "isnotnull": "er ikke nul",
                    "isempty": "er tom",
                    "isnotempty": "er ikke tom",
                    "isnullorempty": "har ingen værdi",
                    "isnotnullorempty": "har værdi"
                },
                "boolean": {
                    "eq": "er lig med",
                    "neq": "er ikke lig med"
                }
            });
    }
})(window.kendo.jQuery);
