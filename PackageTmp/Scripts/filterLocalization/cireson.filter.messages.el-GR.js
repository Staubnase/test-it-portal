(function ($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Προσθέστε έκφραση",
                "addGroup": "Προσθήκη ομάδας",
                "and": "Και",
                "apply": "Εφαρμόζω",
                "close": "Κλείνω",
                "fields": "Χωράφια",
                "operators": "Χειριστές",
                "or": "Ή"
            });
        /* Filter operator messages */
        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "number": {
                    "eq": "είναι ίσο με",
                    "neq": "δεν είναι ίσο με",
                    "gte": "είναι μεγαλύτερο ή ίσο με",
                    "gt": "είναι μεγαλύτερο από",
                    "lte": "είναι μικρότερο ή ίσο με",
                    "lt": "είναι μικρότερο από",
                    "isnull": "είναι null",
                    "isnotnull": "δεν είναι null"
                },
                "date": {
                    "eq": "είναι ίσο με",
                    "neq": "δεν είναι ίσο με",
                    "gte": "είναι μετά ή ίσο με",
                    "gt": "είναι μετά",
                    "lte": "είναι πριν ή ίσο με",
                    "lt": "είναι πριν",
                    "isnull": "είναι null",
                    "isnotnull": "δεν είναι null"
                },
                "string": {
                    "eq": "είναι ίσο με",
                    "neq": "δεν είναι ίσο με",
                    "startswith": "ξεκινά με",
                    "contains": "περιέχει",
                    "doesnotcontain": "δεν περιέχει",
                    "endswith": "τελειώνει με",
                    "isnull": "είναι null",
                    "isnotnull": "δεν είναι null",
                    "isempty": "είναι κενό",
                    "isnotempty": "δεν είναι κενό",
                    "isnullorempty": "δεν έχει αξία",
                    "isnotnullorempty": "έχει αξία"
                },
                "boolean": {
                    "eq": "είναι ίσο με",
                    "neq": "δεν είναι ίσο με",
                }
            });
    }
})(window.kendo.jQuery);
