(function($, undefined) {

    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
            "and": "与",
            "or": "或",
            "apply": "确定",
            "close": "关闭",
            "addExpression": "添加表达式",
            "addGroup": "添加分组",
            "fields": "字段",
            "operators": "运算符"
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
            "string": {
                "eq": "等于",
                "neq": "不等于",
                "startswith": "开头是",
                "contains": "包含",
                "doesnotcontain": "不含",
                "endswith": "结尾是",
                "isnull": "为空",
                "isnotnull": "非空",
                "isempty": "空字符串",
                "isnotempty": "非空字符串",
                "isnullorempty": "无值",
                "isnotnullorempty": "有值"
            },
            "number": {
                "eq": "等于",
                "neq": "不等于",
                "gte": "大于等于",
                "gt": "大于",
                "lte": "小于等于",
                "lt": "小于",
                "isnull": "为空",
                "isnotnull": "非空"
            },
            "date": {
                "eq": "等于",
                "neq": "不等于",
                "gte": "晚于等于",
                "gt": "晚于",
                "lte": "早于等于",
                "lt": "早于",
                "isnull": "为空",
                "isnotnull": "非空"
            },
            "boolean": {
                "eq": "等于",
                "neq": "不等于"
            }
        });
    }
})(window.kendo.jQuery);
