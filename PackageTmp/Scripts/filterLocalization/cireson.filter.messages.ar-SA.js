(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
          "addExpression": "Lإضافة تعبير",
          "addGroup": "إضافة مجموعة",
          "and": "و",
          "apply": "تطبيق",
          "close": "غلق",
          "fields": "الحقول",
          "operators": "Oعامل",
          "or": "أو"
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
          "string": {
            "eq": "يساوي",
            "neq": "لا يساوي",
            "startswith": "يبدأ بـ",
            "contains": "يتضمن",
            "doesnotcontain": "لا يتضمن",
            "endswith": "ينتهي بـ",
            "isnull": "بلا قيمة",
            "isnotnull": "له قيمة",
            "isempty": "فارغ",
            "isnotempty": "ليس فارغا",
            "isnullorempty": "ليس له قيمة",
            "isnotnullorempty": "له قيمة"
        },
        "number": {
            "eq": "يساوي",
            "neq": "لا يساوي",
            "gte": "أكبر من أو يساوي",
            "gt": "أكبر من",
            "lte": "أقل من أو يساوي",
            "lt": "أقل من",
            "isnull": "بلا قيمة",
            "isnotnull": "له قيمة"
        },
        "date": {
            "eq": "يساوي",
            "neq": "لا يساوي",
            "gte": "بعد أو يساوي",
            "gt": "بعد",
            "lte": "قبل أو يساوي",
            "lt": "قبل",
            "isnull": "بلا قيمة",
            "isnotnull": "له قيمة"
        },
        "boolean": {
            "eq": "يساوي",
            "neq": "لا يساوي"
        }
        });
    }
})(window.kendo.jQuery);
