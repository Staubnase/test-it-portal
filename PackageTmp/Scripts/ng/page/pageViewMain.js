/* global require: true */
/* global session: true*/

(function() {

    var scriptsPath = '/Scripts/';
    var baseUrl = scriptsPath + 'ng/page/';
    var libsPath = scriptsPath + 'libs/';
    var ngPath = libsPath + 'angular/';
    var adfWidgetsPath = baseUrl + 'adfWidgets/';
    var adfWigetGridPath = adfWidgetsPath + 'grid/';
    var adfWidgetsChartPath = adfWidgetsPath + 'chart/';
    var adfWidgetSavedSearchChartPath = adfWidgetsChartPath + 'savedSearch/';
    var adfWidgetHtmlPath = adfWidgetsPath + 'html/';
    var adfWidgetIFramePath = adfWidgetsPath + 'iframe/';
    var adfWidgetAdvancedChartPath = adfWidgetsPath + 'advancedChart/chart/';
    var adfWidgetAdvancedGridPath = adfWidgetsPath + 'advancedGrid/';
    var adfWidgetAdvancedCountPath = adfWidgetsPath + 'advancedCount/';
    var adfWidgetODataGridPath = adfWidgetsPath + 'odataGrid/';
    var adfWidgetODataChartPath = adfWidgetsPath + 'odataChart/chart/';
    var adfWidgetODataCountPath = adfWidgetsPath + 'odataCount/';
    var adfWidgetODataCalendarPath = adfWidgetsPath + 'odataCalendar/';
    var kendoJsPath = scriptsPath + 'kendo/2020.3.1118/';
    var adfWidgetCountPath = adfWidgetsPath + 'count/';
    var adfWidgetCalendarPath = adfWidgetsPath + 'calendar/';

    require.config({
        waitSeconds: 0,
        //urlArgs: "v=" + session.staticFileVersion,
        baseUrl: baseUrl,
        paths: {
            text: "require/text",
            'angular': ngPath +'angular', 
            'angularAMD': ngPath + 'angularAMD',
            'angular-ui-router': ngPath + 'angular-ui-router',
            'angular-sanitize': ngPath + 'angular-sanitize',
            'angular-resource': ngPath + 'angular-resource',
            'angular-bootstrap': ngPath + 'ui-bootstrap.0.14.3',
            'angular-bootstrap-templates': ngPath + 'ui-bootstrap-tpls',
            'Sortable': libsPath + 'Sortable',
            'angular-aside': ngPath + 'angular-aside',
            'angular-dashboard-framework': ngPath + 'angular-dashboard-framework',
            'adf-structures-base': ngPath + 'adf-structures-base',
            'adf-widget-grid': adfWigetGridPath + 'adf-widget-grid',
            'adf-widget-saved-search-combo': adfWidgetSavedSearchChartPath + 'adf-widget-saved-search-combo',
            'adf-widget-html': adfWidgetHtmlPath + 'adf-widget-html',
            'adf-widget-iframe': adfWidgetIFramePath + 'adf-widget-iframe',
            'adf-widget-advanced-chart': adfWidgetAdvancedChartPath + 'adf-widget-advanced-chart',
            'adf-widget-advanced-grid': adfWidgetAdvancedGridPath + 'adf-widget-advanced-grid',
            'adf-widget-advanced-count': adfWidgetAdvancedCountPath + 'adf-widget-advanced-count',
            'adf-widget-count': adfWidgetCountPath + 'adf-widget-count',
            'adf-widget-advanced-calendar': adfWidgetCalendarPath + 'adf-widget-advanced-calendar',
            'adf-widget-odata-grid': adfWidgetODataGridPath + 'adf-widget-odata-grid',
            'adf-widget-odata-chart': adfWidgetODataChartPath + 'adf-widget-odata-chart',
            'adf-widget-odata-count': adfWidgetODataCountPath + 'adf-widget-odata-count',
            'adf-widget-odata-calendar': adfWidgetODataCalendarPath + 'adf-widget-odata-calendar',
            'kendo': kendoJsPath + 'kendo.all.min'
        },
        shim: {
            'angular': { exports: 'angular' },
            'angular-ui-router': ['angular'],
            'angular-sanitize': ['angular'],
            'angular-resource': ['angular'],
            'angular-bootstrap': ['angular'],
            'angular-bootstrap-templates': ['angular'],
            'angular-aside': ['angular'],
            'angular-dashboard-framework': ['angular', 'angular-aside'],
            'adf-structures-base': ['angular'],
            'adf-widget-grid': ['angular'],
            'adf-widget-saved-search-combo': ['angular'],
            'adf-widget-html': ['angular'],
            'adf-widget-iframe': ['angular'],
            'adf-widget-advanced-chart': ['angular'],
            'adf-widget-advanced-grid': ['angular'],
            'adf-widget-advanced-count': ['angular'],
            'adf-widget-advanced-calendar': ['angular'],
            'adf-widget-count': ['angular'],
            'adf-widget-advanced-calendar': ['angular'],
            'adf-widget-odata-grid': ['angular'],
            'adf-widget-odata-chart': ['angular'],
            'adf-widget-odata-count': ['angular'],
            'kendo': ['angular']
        },
        deps: ['app']
    });
})();

