(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
          "addExpression": "Lägga till uttryck",
          "addGroup": "Lägg till grupp",
          "and": "Och",
          "apply": "Tillämpa",
          "close": "Stänga",
          "fields": "Fält",
          "operators": "Operatörernas",
          "or": "Eller"
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
          "date": {
            "eq": "är lika med",
            "gt": "är senare än",
            "gte": "är lika eller senare än",
            "lt": "är tidigare än",
            "lte": "är lika eller tidigare än",
            "neq": "är inte lika med",
            "isnull": "är null",
            "isnotnull": "är inte null"
          },
          "number": {
            "eq": "är lika med",
            "gt": "är större än",
            "gte": "är lika eller större än",
            "lt": "är mindre än",
            "lte": "är lika eller mindre än",
            "neq": "är inte lika med",
            "isnull": "är null",
            "isnotnull": "är inte null"
          },
          "string": {
            "contains": "innehåller",
            "doesnotcontain": "innehåller inte",
            "endswith": "slutar med",
            "eq": "är lika med",
            "neq": "är inte lika med",
            "startswith": "börjar med",
            "isnull": "är null",
            "isnotnull": "är inte null",
            "isempty": "är tom",
            "isnotempty": "är inte tom",
            "isnullorempty": "har inte värde",
            "isnotnullorempty": "har värde"
          },
          "boolean": {
            "eq": "är lika med",
            "neq": "är inte lika med"
          }
        });
    }
})(window.kendo.jQuery);
