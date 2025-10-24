(function($, undefined) {
    /* Default is English, no need to localize */
    /* Filter messages */
    if (kendo.ui.Filter) {
      kendo.ui.Filter.prototype.options.messages =
        $.extend(true, kendo.ui.Filter.prototype.options.messages, {
        });
      /* Filter operator messages */
      kendo.ui.Filter.prototype.options.operators =
        $.extend(true, kendo.ui.Filter.prototype.options.operators, {
        });
    }
})(window.kendo.jQuery);
