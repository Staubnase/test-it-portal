/* global define: true */
(function() {

	'use strict';

	var sharedProviderPath = '/Scripts/ng/shared/providers/';

	define([
		'app',
		sharedProviderPath + 'notification.service.js',
    	sharedProviderPath + 'localization.service.js'
	], function(ngApp) {

		ngApp.controller('PageErrorController', [
			'$scope',
			'notificationService',
			'LocalizationService',	
        	PageErrorController
		]);


		function PageErrorController($scope, notificationService, localizationService) {

			var vm = this;
			angular.extend(vm, {

				localize: function(key) {
					return localizationService.getValue(key);
				}
			});
		}
	});
})();