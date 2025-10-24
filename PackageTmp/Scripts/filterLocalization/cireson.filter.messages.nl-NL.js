(function ($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Expressie toevoegen",
                "addGroup": "Groep toevoegen",
                "and": "En",
                "apply": "Van toepassing zijn",
                "close": "Sluiten",
                "fields": "Velden",
                "operators": "Operators",
                "or": "Of"
            });
        /* Filter operator messages */
        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "date": {
                    "eq": "is gelijk aan",
                    "gt": "is na",
                    "gte": "is op of na",
                    "lt": "is voor",
                    "lte": "is op of voor",
                    "neq": "is ongelijk aan",
                    "isnull": "is nul",
                    "isnotnull": "is niet nul"
                },
                "number": {
                    "eq": "is gelijk aan",
                    "gt": "is groter dan",
                    "gte": "is groter of gelijk aan",
                    "lt": "is kleiner dan",
                    "lte": "is kleiner of gelijk aan",
                    "neq": "is ongelijk aan",
                    "isnull": "is nul",
                    "isnotnull": "is niet nul"
                },
                "string": {
                    "contains": "bevat",
                    "doesnotcontain": "bevat niet",
                    "endswith": "eindigt op",
                    "eq": "is gelijk aan",
                    "neq": "is ongelijk aan",
                    "startswith": "begint met",
                    "isnull": "is nul",
                    "isnotnull": "is niet nul",
                    "isempty": "is leeg",
                    "isnotempty": "is niet leeg",
                    "isnullorempty": "heeft geen waarde",
                    "isnotnullorempty": "heeft waarde"
                },
                "boolean": {
                    "eq": "is gelijk aan",
                    "neq": "is ongelijk aan"
                },
            });
    }
})(window.kendo.jQuery);
