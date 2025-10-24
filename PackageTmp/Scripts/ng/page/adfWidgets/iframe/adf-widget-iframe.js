/* global define: true */
/* global _: true */

(function () {
    'use strict';

    define([
		'app',
    ], function (/*app*/) {

        function IFrameController($sce, $scope, config, localizationService) {
            var vm = this;
            angular.extend(vm, {
                url: $sce.trustAsResourceUrl(config.url),
                height: config.height
            });
        }

        function IFrameEditController($sce, $scope, config, localizationService) {
            var vm = this;
            angular.extend(vm, {
                localize: function (key) {
                    return localizationService.getValue(key);
                }
            });
        }

        angular.module('adf.widget.iframe', ['adf.provider'])
          .config(["dashboardProvider", function (dashboardProvider) {
              dashboardProvider
                .widget('iframe', {
                    title: localizationHelper.localize('AdfIframeWidgetTitle','IFrame'),
                    description: localizationHelper.localize('AdfIframeWidgetDescription','A widget to embed external content'),
                    templateUrl: '{widgetsPath}/iframe/src/view.html',
                    controller: 'IFrameController',
                    controllerAs: 'vm',
                    edit: {
                        controller: 'IFrameEditController',
                        controllerAs: 'vm',
                        templateUrl: '{widgetsPath}/iframe/src/edit.html'
                    }
                });
          }])
          .controller('IFrameController', ['$sce', '$scope', 'config', 'LocalizationService', IFrameController])
          .controller('IFrameEditController', ['$sce', '$scope', 'config', 'LocalizationService', IFrameEditController]);

        var editViewTemplate = [
        	"<form role=form>",
        		"<div class=form-group>",
        			"<label for=url>{{vm.localize('URL')}}</label>",
        			"<input type=text class=\"form-control input-sm\" id=url ng-model=config.url placeholder=http://www.example.com>",
        		"</div>",
        		"<div class=form-group>",
        			"<label for=height>{{vm.localize('Height')}}</label>",
        			"<input type=text class=\"form-control input-sm\" id=height ng-model=config.height>",
    			"</div>",
    		"</form>"
        ].join('');

        var mainViewTemplate = [
            "<iframe ng-src={{vm.url}} height={{vm.height}}></iframe>"
        ].join('');

        angular.module("adf.widget.iframe").run(["$templateCache", function ($templateCache) {
            $templateCache.put("{widgetsPath}/iframe/src/edit.html", editViewTemplate);
            $templateCache.put("{widgetsPath}/iframe/src/view.html", mainViewTemplate);
        }]);
    });
})();