(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
          "addExpression": "Ajouter une expression",
          "addGroup": "Ajouter un groupe",
          "and": "Et",
          "apply": "Appliquer",
          "close": "Fermer",
          "fields": "Champs",
          "operators": "Opérateurs",
          "or": "Ou"
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
          "date": {
            "eq": "est égal à",
            "gte": "est postérieur ou égal à",
            "gt": "est postérieur",
            "lte": "est antérieur ou égal à",
            "lt": "est antérieur",
            "neq": "n’est pas égal à",
            "isnull": "est nulle",
            "isnotnull": "n’est pas nulle"
          },
          "number": {
            "eq": "est égal à",
            "gte": "est supérieur ou égal à",
            "gt": "est supérieur à",
            "lte": "est inférieur ou égal à",
            "lt": "est inférieur à",
            "neq": "n’est pas égal à",
            "isnull": "est nulle",
            "isnotnull": "n’est pas nulle"
          },
          "string": {
            "endswith": "se termine par",
            "eq": "est égal à",
            "neq": "n’est pas égal à",
            "startswith": "commence par",
            "contains": "contient",
            "doesnotcontain": "ne contient pas",
            "isnull": "est nulle",
            "isnotnull": "n’est pas nulle",
            "isempty": "est vide",
            "isnotempty": "n’est pas vide",
            "isnullorempty": "n'a pas de valeur",
            "isnotnullorempty": "a une valeur"
          },
          "boolean": {
            "eq": "est égal à",
            "neq": "n’est pas égal à"
          },
        });
    }
})(window.kendo.jQuery);
