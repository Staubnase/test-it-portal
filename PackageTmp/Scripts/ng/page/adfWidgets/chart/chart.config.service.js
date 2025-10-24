/* global define: true */

(function() {

	'use strict';

	define(['app'], function(ngApp) { //avoid collisions with app.js in the global space

		ngApp.factory('ChartConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', ChartConfigService]);

		function ChartConfigService($http, $q, localizationService, notificationService) {

			var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/chart/configFiles/';
			var JSON_FILE_EXT = '.js'; //sigh.  WHY U NO USE .JSON?!?!
			var configMap = {};

			return {
				getConfig: function(configName, groupByColumn, chartType) {
					var deferred = $q.defer();
					var self = this;
					if(configMap[configName]) {
						deferred.resolve(this.initConfig(configMap[configName], groupByColumn, chartType));
					} else {
						var url = this.getConfigUrl(configName);
						$http.get(url)
							.then(function(response) {
								var config = response.data;
								configMap[configName] = config;
								deferred.resolve(self.initConfig(config, groupByColumn, chartType));
							}, function() {
								notificationService.addError("Could not retrieve config file");
							});
					}
					return deferred.promise;
				},
				getConfigUrl: function(configName) {
					var url = CONFIG_FILE_BASE_URL + configName + JSON_FILE_EXT;
					return url;
				},
				getDefaultChartOptions: function() {
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
                        { Id: 'line', Name: localizationService.getValue('LineChart')},
                        { Id: 'area', Name: localizationService.getValue('AreaChart') },
                        { Id: 'column', Name: localizationService.getValue('ColumnChart') }
				    ];
				    return chartTypes;
				},
				getPieChartSeries: function (config, data) {
				    //"At present assigning aggregate fields to the chart series is not supported. 
				    //As a workaround, create the series array manually and pass it to the chart configuration." 
				    //-taken from this forum: http://www.telerik.com/forums/aggregate-pie-chart and this example: http://jsfiddle.net/valchev/VzWdk/

				    var seriesData = [];
				    var dataSource = new kendo.data.DataSource({
				        data: data,
				        group: {
				            field: config.groupByColumn.field,
				            aggregates: [
                                { field: "Index", aggregate: "count" }
				            ]
				        }
                    });

				    dataSource.read();
                    angular.forEach(dataSource.view(), function (item) {
                        var seriesColor = "";
                        var seriesValue = item.value;

                        if (!_.isUndefined(seriesValue)) {
                            var seriesColorItem = _.findWhere(config.seriesColor, { Key: seriesValue });
                            if (!_.isUndefined(seriesColorItem))
                                seriesColor = !_.isNull(seriesColorItem.ColorValue) ? seriesColorItem.ColorValue : null;
                        }

				        seriesData.push({ category: item.value, value: item.aggregates.Index.count, color: seriesColor });
				    });

				    var series = [{
				        data: seriesData,
				        type: config.chartType.Id,
				        categoryField: config.groupByColumn.field
				    }];

				    return series;
                },
                getDefaultChartColors: function () {
                    var seriesColors = [
                        "#4183D7",
                        "#D24D57",
                        "#2ECC71",
                        "#F5D76E",
                        "#D2527F",
                        "#913D88",
                        "#F89406",
                        "#5C97BF",
                        "#D91E18",
                        "#26A65B",
                        "#F7CA18",
                        "#E08283",
                        "#663399",
                        "#E67E22",
                        "#81CFE0",
                        "#EF4836",
                        "#90C695",
                        "#F4D03F",
                        "#8E44AD",
                        "#D35400",
                        "#2C3E50",
                        "#CF000F",
                        "#87D37C",
                        "#F5AB35",
                        "#E26A6A",
                        "#913D88",
                        "#F39C12",
                        "#446CB3",
                        "#96281B",
                        "#1E824C",
                        "#FDE3A7",
                        "#F62459",
                        "#AEA8D3",
                        "#F9690E",
                        "#336E7B",
                        "#4DAF7C",
                        "#F9BF3B",
                        "#EB9532"
                    ];
                    return seriesColors;
                }
			};
		}

	});

})();