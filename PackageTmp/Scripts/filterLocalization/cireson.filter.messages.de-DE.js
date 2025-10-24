(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
          "addExpression": "Ausdruck hinzufügen",
          "addGroup": "Gruppe hinzufügen",
          "and": "Und",
          "apply": "Anwenden",
          "close": "Schließen",
          "fields": "Felder",
          "operators": "Operatoren",
          "or": "Oder"
        });
    /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
          "date": {
            "eq": "gleich ist",
            "gt": "später ist als",
            "gte": "gleich oder später ist als",
            "lt": "früher ist als",
            "lte": "früher oder gleich ist als",
            "neq": "nicht gleich ist",
            "isnull": "Null ist",
            "isnotnull": "nicht Null ist"
          },
          "boolean": {
            "eq": "gleich ist",
            "neq": "nicht gleich ist"
          },
          "number": {
            "eq": "gleich ist",
            "gt": "größer ist als",
            "gte": "größer als oder gleich ist",
            "lt": "kleiner ist",
            "lte": "kleiner als oder gleich ist",
            "neq": "nicht gleich ist",
            "isnull": "Null ist",
            "isnotnull": "nicht Null ist"
          },
          "string": {
            "contains": "beinhaltet",
            "doesnotcontain": "nicht beinhaltet",
            "endswith": "endet mit",
            "eq": "gleich ist",
            "neq": "nicht gleich ist",
            "startswith": "beginnt mit",
            "isnull": "Null ist",
            "isnotnull": "nicht Null ist",
            "isempty": "leer ist",
            "isnotempty": "nicht leer ist",
            "isnullorempty": "besitzt keinen Wert",
            "isnotnullorempty": "besitzt einen Wert"
          }
        });
    }
})(window.kendo.jQuery);
