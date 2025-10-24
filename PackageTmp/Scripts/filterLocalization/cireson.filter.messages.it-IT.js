(function ($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Aggiungere un'espressione",
                "addGroup": "Aggiungere un gruppo",
                "and": "E",
                "apply": "Applica",
                "close": "Chiudi",
                "fields": "Campi",
                "operators": "Operatori",
                "or": "O"
            });
        /* Filter operator messages */
        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "date": {
                    "eq": "è uguale a",
                    "gt": "è dopo",
                    "gte": "è dopo o uguale a",
                    "lt": "è prima",
                    "lte": "è prima o uguale a",
                    "neq": "non è uguale a",
                    "isnull": "è nullo",
                    "isnotnull": "non è nullo"
                },
                "number": {
                    "eq": "è uguale a",
                    "gt": "è più grande di",
                    "gte": "è più grande o uguale a",
                    "lt": "è più piccolo di",
                    "lte": "è più piccolo o uguale a",
                    "neq": "non è uguale a",
                    "isnull": "è nullo",
                    "isnotnull": "non è nullo"
                },
                "string": {
                    "contains": "contiene",
                    "doesnotcontain": "non contiene",
                    "endswith": "finisce con",
                    "eq": "è uguale a",
                    "neq": "non è uguale a",
                    "startswith": "inizia con",
                    "isnull": "è nullo",
                    "isnotnull": "non è nullo",
                    "isempty": "è vuoto",
                    "isnotempty": "non è vuoto",
                    "isnullorempty": "non ha nessun valore",
                    "isnotnullorempty": "ha valore"

                },
                "boolean": {
                    "eq": "è uguale a",
                    "neq": "non è uguale a"
                }
            });
    }
})(window.kendo.jQuery);
