(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
          and: "И",
          or: "Или",
          apply: "Применить",
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
            date: {
                eq: "равна",
                gte: "после или равна",
                gt: "после",
                lte: "до или равна",
                lt: "до",
                neq: "не равна",
                isnull: "является нулевым",
                isnotnull: "не является нулевым"
            },
            number: {
                eq: "равно",
                gte: "больше или равно",
                gt: "больше",
                lte: "меньше или равно",
                lt: "меньше",
                neq: "не равно",
                isnull: "является нулевым",
                isnotnull: "не является нулевым"
            },
            string: {
                endswith: "оканчивается на",
                eq: "равно",
                neq: "не равно",
                startswith: "начинающимися на",
                contains: "содержащими",
                doesnotcontain: "не содержит",
                isnull: "является нулевым",
                isnotnull: "не является нулевым",
                isempty: "пусто",
                isnotempty: "не пусто",
                isnullorempty: "не имеет никакой ценности",
                isnotnullorempty: "имеет ценность"
            },
            boolean: {
                eq: "равно",
                neq: "не равно"
            }
        });
    }
})(window.kendo.jQuery);
