(function ($, undefined) {

    /* Filter cell operator messages */

    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Agregar expresión",
                "addGroup": "Agregar grupo",
                "and": "Y",
                "apply": "Aplicar",
                "close": "Cerca",
                "fields": "Campos",
                "operators": "Operadores",
                "or": "O"
            });

        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "string": {
                    "eq": "es igual a",
                    "neq": "no es igual a",
                    "startswith": "comienza con",
                    "contains": "contiene",
                    "doesnotcontain": "no contiene",
                    "endswith": "termina en",
                    "isnull": "es nulo",
                    "isnotnull": "no es nulo",
                    "isempty": "está vacío",
                    "isnotempty": "no está vacío",
                    "isnullorempty": "no tiene ningún valor",
                    "isnotnullorempty": "tiene valor"
                },
                "number": {
                    "eq": "es igual a",
                    "neq": "no es igual a",
                    "gte": "es mayor o igual que",
                    "gt": "es mayor que",
                    "lte": "es menor o igual que",
                    "lt": "es menor que",
                    "isnull": "es nulo",
                    "isnotnull": "no es nulo"
                },
                "date": {
                    "eq": "es igual a",
                    "neq": "no es igual a",
                    "gte": "es posterior o igual a",
                    "gt": "es posterior",
                    "lte": "es anterior o igual a",
                    "lt": "es anterior",
                    "isnull": "es nulo",
                    "isnotnull": "no es nulo"
                },
                "boolean": {
                    "eq": "es igual a",
                    "neq": "no es igual a"
                },
            });
    }
})(window.kendo.jQuery);
