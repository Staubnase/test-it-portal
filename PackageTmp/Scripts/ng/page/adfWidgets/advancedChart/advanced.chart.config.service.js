/* global define: true */

(function() {

	'use strict';

	define(['app'], function(ngApp) { 

		ngApp.factory('AdvancedChartConfigService', ['$http', '$q', 'LocalizationService', 'notificationService', AdvancedChartConfigService]);

		function AdvancedChartConfigService($http, $q, localizationService, notificationService) {

			var CONFIG_FILE_BASE_URL = '/Scripts/ng/page/adfWidgets/advancedChart/configFiles/';
			var JSON_FILE_EXT = '.js'; 
			var configMap = {};

			return {
			    getConfig: function (configName, groupByColumn, chartType) {
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
				    if (!_.isUndefined(groupByColumn) && !_.isNull(groupByColumn)) {
				        angular.extend(series, {
				            type: chartType.Id,
				            field: groupByColumn.field,
				            name: groupByColumn.name,
				            categoryField: groupByColumn.field
				        });
				        instance.categoryAxis.baseUnit = groupByColumn.field;
				    }
					return instance;
				},
				getChartTypes: function () {
				    var chartTypes = [
                        { Id: 'bar', Name: localizationService.getValue('BarChart') },
                        { Id: 'pie', Name: localizationService.getValue('PieChart') },
                        { Id: 'line', Name: localizationService.getValue('LineChart')},
                        { Id: 'area', Name: localizationService.getValue('AreaChart') },
                        { Id: 'column', Name: localizationService.getValue('ColumnChart') },
                        { Id: 'donut', Name: localizationService.getValue('DonutChart') },
                        { Id: 'stackedarea', Name: localizationService.getValue('StackedAreaChart') },
                        { Id: 'stackedbar', Name: localizationService.getValue('StackedBarChart') },
                        { Id: 'stackedcolumn', Name: localizationService.getValue('StackedColumnChart') }
				    ];
				    return chartTypes;
                },
                getChartColor: function (config, seriesValue) {
                    if (_.isUndefined(config.seriesColor)) { config.seriesColor = []; }
                    if (!_.isUndefined(seriesValue)) {
                        var seriesColorItem = _.findWhere(config.seriesColor, { Key: seriesValue });
                        if (!_.isUndefined(seriesColorItem)) {
                            return seriesColorItem.ColorValue;
                        } else {
                            var seriesDefaultColors = this.defaultChartSeriesColors;
                            var color = seriesDefaultColors[Math.floor(Math.random() * seriesDefaultColors.length)];
                            config.seriesColor.push({ Key: seriesValue, ColorValue: color });
                            return color;
                        }
                            
                    }
                },
                getPieChartSeries: function (config, data) {
                    
				    //"At present assigning aggregate fields to the chart series is not supported. 
				    //As a workaround, create the series array manually and pass it to the chart configuration." 
				    //-taken from this forum: http://www.telerik.com/forums/aggregate-pie-chart and this example: http://jsfiddle.net/valchev/VzWdk/
				    var seriesData = [];
				    var dataSource = new kendo.data.DataSource({
				        data: data,
                        group: {
                            field: !_.isNull(config.groupByColumn) ? config.groupByColumn.field : config.seriesCategory.field,
				            aggregates: [
                                { field: "Index", aggregate: "count" }
				            ]
				        }
                    });
                    var defaultChartSeriesColors = this.defaultChartSeriesColors;
                    if (_.isUndefined(config.seriesColor)) { config.seriesColor = []; }

                    dataSource.read();

                    angular.forEach(dataSource.view(), function (item) {
                        var seriesColor = "";
                        if (!_.isUndefined(item.value)) {
                            var seriesColorItem = _.findWhere(config.seriesColor, { Key: item.value });
                            if (!_.isUndefined(seriesColorItem)) {
                                seriesColor = seriesColorItem.ColorValue;
                            } else {
                                var seriesDefaultColors = defaultChartSeriesColors;
                                seriesColor = seriesDefaultColors[Math.floor(Math.random() * seriesDefaultColors.length)];                       
                                config.seriesColor.push({ Key: item.value, ColorValue: seriesColor });
                            }
                        } 

                        seriesData.push({ category: item.value, value: item.aggregates.Index.count, color: seriesColor });
                        
				    });

				    var series = [{
				        data: seriesData,
				        type: config.chartType.Id
				    }];
                    
				    return series;
				},
				setErrorNotification: function (message) {
				    notificationService.addError(message);
                },
                defaultChartSeriesColors:  [
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
                ]
			};
		}

	});

})();