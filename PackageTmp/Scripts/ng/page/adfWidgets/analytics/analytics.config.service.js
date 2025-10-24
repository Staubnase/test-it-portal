/* global define: true */

(function() {

	'use strict';

	define(['app'], function(ngApp) { 
	    ngApp.factory('AnalyticsChartConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', AnalyticsChartConfigService]);

	    function AnalyticsChartConfigService($http, $q, localizationService, notificationService) {

			var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/analytics/configFiles/';
			var JSON_FILE_EXT = '.js'; 
			var configMap = {};

			return {
			    getConfig: function (chartConfig) {
					var deferred = $q.defer();
					var self = this;
					var configName = chartConfig.configurationName;

					if(configMap[configName]) {
					    deferred.resolve(this.initConfig(configMap[configName], chartConfig));
					} else {
					    var url = this.getConfigUrl(configName);
						$http.get(url)
							.then(function(response) {
								var config = response.data;
								configMap[configName] = config;
								deferred.resolve(self.initConfig(config, chartConfig));
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
				initConfig: function (config, chartConfig) {
				    var instance = angular.copy(config);
				    var series = instance.series[0];

				    angular.extend(series, {
                        type: chartConfig.chartType.Id,
                        field: chartConfig.seriesField.field,
                        categoryField: chartConfig.categoryField.field
				    });

					return instance;
				},
				getChartTypes: function () {
				    var chartTypes = [
                        { Id: 'bar', Name: localizationService.getValue('BarChart') },
                        { Id: 'pie', Name: localizationService.getValue('PieChart') },
                        { Id: 'line', Name: localizationService.getValue('LineChart')},
                        { Id: 'area', Name: localizationService.getValue('AreaChart') },
                        { Id: 'column', Name: localizationService.getValue('ColumnChart') },
                        { Id: 'donut', Name: localizationService.getValue('DonutChart') }
				    ];
				    return chartTypes;
				}
			};
		}

	});

})();