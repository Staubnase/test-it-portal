/* global define: true */

(function() {

	'use strict';

	define(['app'], function(ngApp) { 

		ngApp.factory('ODataChartConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', ODataChartConfigService]);

		function ODataChartConfigService($http, $q, localizationService, notificationService) {

			var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/odataChart/configFiles/';
			var JSON_FILE_EXT = '.js'; 
			var configMap = {};
            return {
                getConfig: function (configName, groupByColumn, chartType) {
                    var deferred = $q.defer();
                    var self = this;
                    if (configMap[configName]) {
                        deferred.resolve(this.initConfig(configMap[configName], groupByColumn, chartType));
                    } else {
                        var url = this.getConfigUrl(configName);
                        $http.get(url)
                            .then(function (response) {
                                var config = response.data;
                                configMap[configName] = config;
                                deferred.resolve(self.initConfig(config, groupByColumn, chartType));
                            }, function () {
                                notificationService.addError("Could not retrieve config file");
                            });
                    }
                    return deferred.promise;
                },
                rewriteFilterParams: function (original_url) {
                    var url = original_url;
                    var queryString = url.substr(url.indexOf('?'), url.length);
                    url = url.substr(0, url.indexOf('?') + 1);
                    var params = this.getQueryParams(queryString)._wrapped || [];
                    var rewriteURL = url;
                    var filterCount = 0;
                    var filterStr = "$filter=";
                    var otherFiltersStr = "";
                    var topParam = _.find(params, function (item) {
                        return item[0] == "$top";
                    });
                    var bTopParamChange = false;

                    //exportToExcel fetchAll might return > 500 data, thus sets $top > 500
                    //if $top exceeds 500, do not set $top to avoid PlatformCache error ("The limit of '500' for Top query has been exceeded.")
                    if (!_.isUndefined(topParam)) {
                        if (topParam[1] > 500) {
                            params = _.filter(params, function (item) {
                                return item[0] !== "$top";
                            });
                            bTopParamChange = true;
                        }
                    }

                    for (var i in params) {

                        if (params[i][0] == '$filter') {
                            filterStr += params[i][1] + ' and '
                            filterCount++;
                        } else {
                            if (params[i][0].length > 0 && params[i][0] != '$format') {
                                params[i][1] = (params[i][1]) ? params[i][1] : '';
                                otherFiltersStr += params[i][0] + "=" + params[i][1] + "&";
                            }
                        }
                    }

                    if (filterStr == "$filter=") {
                        if (bTopParamChange) {
                            if (otherFiltersStr.length > 0)
                                rewriteURL += otherFiltersStr;
                            else
                                rewriteURL = original_url;
                            return rewriteURL;
                        } else {
                            return original_url;
                        }
                    } else {

                        var checkEnd = filterStr.substr(filterStr.length - 5, filterStr.length);
                        if (checkEnd == ' and ')
                            filterStr = filterStr.substr(0, filterStr.length - 5);

                        if (filterCount > 1) {
                            if (otherFiltersStr.length > 0)
                                rewriteURL += filterStr + '&' + otherFiltersStr;
                            else
                                rewriteURL += filterStr;

                            return rewriteURL;
                        } else {
                            if (bTopParamChange) {
                                if (otherFiltersStr.length > 0)
                                    rewriteURL += filterStr + '&' + otherFiltersStr;
                                else
                                    rewriteURL += filterStr;
                                return rewriteURL;
                            }
                        }

                    }

                    return false;
                },
                getQueryParams: function (queryString) {
                    var query = (queryString || window.location.search).substring(1); // delete ?
                    if (!query) {
                        return false;
                    }
                    return _
                        .chain(query.split('&'))
                        .map(function (params) {
                            var p = params.split('=');
                            return [decodeURIComponent(p[0].toLowerCase()), p[1]];
                        })
                },
                getConfigUrl: function (configName) {
                    var url = CONFIG_FILE_BASE_URL + configName + JSON_FILE_EXT;
                    return url;
                },
                getDefaultChartOptions: function () {
                    var chartOptions = {
                        dataSource: {
                            data: []
                        },
                        seriesDefaults: {
                            labels: {
                                format: "{0}"
                            }
                        },
                        valueAxis: {
                            labels: {
                                format: "{0}"
                            }
                        }
                    };
                    return chartOptions;
                },
                initConfig: function (config, groupByColumn, chartType) {
                    var instance = angular.copy(config);
                    var series = instance.series[0];
                    angular.extend(series, {
                        type: chartType.Id,
                        field: groupByColumn.field,
                        name: groupByColumn.name,
                        categoryField: groupByColumn.field
                    });
                    instance.categoryAxis.baseUnit = groupByColumn.field;

                    return instance;
                },
                getChartTypes: function () {
                    var chartTypes = [
                        { Id: 'bar', Name: localizationService.getValue('BarChart') },
                        { Id: 'pie', Name: localizationService.getValue('PieChart') },
                        { Id: 'line', Name: localizationService.getValue('LineChart') },
                        { Id: 'area', Name: localizationService.getValue('AreaChart') },
                        { Id: 'column', Name: localizationService.getValue('ColumnChart') },
                        { Id: 'donut', Name: localizationService.getValue('DonutChart') },
                        { Id: 'stackedarea', Name: localizationService.getValue('StackedAreaChart') },
                        { Id: 'stackedbar', Name: localizationService.getValue('StackedBarChart') },
                        { Id: 'stackedcolumn', Name: localizationService.getValue('StackedColumnChart') }
                    ];
                    return chartTypes;
                },
                getChartColor: function (config, seriesValue, options) {
                    var colorIndex = 0;
                    if (_.isUndefined(config.seriesColor)) { config.seriesColor = []; }

                    if (!_.isUndefined(seriesValue)) {
                        var seriesColorItem = _.findWhere(config.seriesColor, { Key: seriesValue });
                        if (!_.isUndefined(seriesColorItem)) {
                            seriesColor = seriesColorItem.ColorValue;
                        } else {
                            seriesColor = options.seriesColors[colorIndex++ % options.seriesColors.length];        
                            config.seriesColor.push({ Key: seriesValue, ColorValue: seriesColor });
                        }
                    }

                    var colors = this.defaultChartSeriesColors;
                    return colors[colorIndex++ % colors.length];
                },
                getCustomChartOptions: function (dataSource, config, options) {
                    var seriesData = [];
                    var categories = [];
                    if (_.isUndefined(config.seriesColor)) { config.seriesColor = []; }

                    angular.forEach(dataSource.view(), function (item, i) {
                        var category = (config.applyGrouping) ? item.value : item[config.label.field];
                        var value = (config.applyGrouping) ? item.aggregates.Index.count : item[config.groupByColumn.field];
                        var seriesColor = "";
                        if (!_.isUndefined(category)) {
                            var seriesColorItem = _.findWhere(config.seriesColor, { Key: category });
                            if (!_.isUndefined(seriesColorItem)) {
                                seriesColor = seriesColorItem.ColorValue;
                            } else {
                                seriesColor = options.seriesColors[i++ % options.seriesColors.length];
                                config.seriesColor.push({ Key: category, ColorValue: seriesColor });
                            }
                        }

                        seriesData.push({ category: category, value: value, color: seriesColor });
                        categories.push(category);
                    });

                    var series = [{
                        data: seriesData,
                        type: config.chartType.Id
                    }];

                    options.categoryAxis.categories = categories;
                    options.series = series;

                    options.tooltip = {
                        visible: true,
                        template: "#= dataItem.category # - #= value #"
                    };

                    return options;
                },
                setErrorNotification: function (message) {
                    notificationService.addError(message);
                },
                defaultChartSeriesColors: [
                    "#4183D7", "#D24D57", "#2ECC71", "#F5D76E", "#D2527F", "#913D88", "#F89406", "#5C97BF",
                    "#D91E18", "#26A65B", "#F7CA18", "#E08283", "#663399", "#E67E22", "#81CFE0", "#EF4836",
                    "#90C695", "#F4D03F", "#8E44AD", "#D35400", "#2C3E50", "#CF000F", "#87D37C", "#F5AB35",
                    "#E26A6A", "#913D88", "#F39C12", "#446CB3", "#96281B", "#1E824C", "#FDE3A7", "#F62459",
                    "#AEA8D3", "#F9690E", "#336E7B", "#4DAF7C", "#F9BF3B", "#EB9532"
                ],

            };
		}

	});

})();