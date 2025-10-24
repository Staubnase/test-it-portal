(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
            "and": "與",
            "or": "或",
            "apply": "確定",
            "close": "關閉",
            "addExpression": "添加運算式",
            "addGroup": "添加分組",
            "fields": "欄位",
            "operators": "運算子"
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
            "string": {
                "eq": "等於",
                "neq": "不等於",
                "startswith": "開頭是",
                "contains": "包含",
                "doesnotcontain": "不含",
                "endswith": "結尾是",
                "isnull": "為空",
                "isnotnull": "非空",
                "isempty": "空字串",
                "isnotempty": "非空字串",
                "isnullorempty": "無值",
                "isnotnullorempty": "有值"
            },
            "number": {
                "eq": "等於",
                "neq": "不等於",
                "gte": "大於等於",
                "gt": "大於",
                "lte": "小於等於",
                "lt": "小於",
                "isnull": "為空",
                "isnotnull": "非空"
            },
            "date": {
                "eq": "等於",
                "neq": "不等於",
                "gte": "晚於等於",
                "gt": "晚於",
                "lte": "早於等於",
                "lt": "早於",
                "isnull": "為空",
                "isnotnull": "非空"
            },
            "boolean": {
                "eq": "等於",
                "neq": "不等於"
            }
        });
    }
})(window.kendo.jQuery);
