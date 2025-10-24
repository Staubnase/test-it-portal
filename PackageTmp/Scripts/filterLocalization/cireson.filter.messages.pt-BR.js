(function ($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
        kendo.ui.Filter.prototype.options.messages =
            $.extend(true, kendo.ui.Filter.prototype.options.messages, {
                "addExpression": "Adicionar expressão",
                "addGroup": "Adicionar grupo",
                "and": "E",
                "apply": "Inserir",
                "close": "Fechar",
                "fields": "Campos",
                "operators": "Operadores",
                "or": "Ou"
            });
        /* Filter operator messages */
        kendo.ui.Filter.prototype.options.operators =
            $.extend(true, kendo.ui.Filter.prototype.options.operators, {
                "string": {
                    "eq": "é igual a",
                    "neq": "não é igual a",
                    "startswith": "começa com",
                    "contains": "contém",
                    "doesnotcontain": "não contém",
                    "endswith": "termina com",
                    "isnull": "é nulo",
                    "isnotnull": "é não nulo",
                    "isempty": "é vazio",
                    "isnotempty": "é não vazio",
                    "isnullorempty": "não tem valor",
                    "isnotnullorempty": "tem valor"
                },
                "number": {
                    "eq": "é igual a",
                    "neq": "não é igual a",
                    "gte": "é maior que ou igual a",
                    "gt": "é maior que",
                    "lte": "é menor que ou igual a",
                    "lt": "é menor que",
                    "isnull": "é nulo",
                    "isnotnull": "é não nulo"
                },
                "date": {
                    "eq": "é igual a",
                    "neq": "não é igual a",
                    "gte": "é posterior ou igual a",
                    "gt": "é posterior a",
                    "lte": "é anterior ou igual a",
                    "lt": "é anterior a",
                    "isnull": "é nulo",
                    "isnotnull": "é não nulo"
                },
                "boolean": {
                    "eq": "é igual a",
                    "neq": "não é igual a",
                }
            });
    }
})(window.kendo.jQuery);
