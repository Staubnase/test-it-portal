(function(window, undefined) {
    'use strict';

    function HtmlBinderEditController($scope, config, localizationService) {
        $scope.config = angular.extend(config, {
            html: config.html || ''
        });

        var vm = this;
        angular.extend(vm, {
            localize: function (key) {
                return localizationService.getValue(key);
            }
        });
    }

    angular.module('adf.widget.html', ['adf.provider'])
        .config(["dashboardProvider", function (dashboardProvider) {
            dashboardProvider
                .widget('html', {
                    title: localizationHelper.localize('AdfHtmlWidgetTitle'),
                    description: localizationHelper.localize('AdfHtmlWidgetDescription'),
                    config: {
                        html: ''
                    },
                    templateUrl: '{widgetsPath}/html/src/view.html',
                    edit: {
                        templateUrl: '{widgetsPath}/html/src/edit.html',
                        controller: 'HtmlBinderEditController',
                        controllerAs: 'vm',
                        bindToController: true
                    },
                    ordinal: 0
                });
        }])
        .controller('HtmlBinderEditController', ['$scope', 'config', 'LocalizationService', HtmlBinderEditController]);

    angular.module("adf.widget.html").run(["$templateCache", function($templateCache) {

        var editView = [
            "<form role=form>",
                "<div class=form-group>",
                    "<label for=plainHtml>{{ ::vm.localize('HtmlText') }}</label>",
                    "<textarea ng-model=config.html name=plainHtml id=plainHtml type=text class=\"form-control input-sm\"/>",
                "</div>",
            "</form>"
        ].join('');

        var mainView = [
            "<div>",
                "<div ng-bind-html=config.html></div>",
            "</div>"
        ].join('');

        $templateCache.put("{widgetsPath}/html/src/edit.html", editView);
        $templateCache.put("{widgetsPath}/html/src/view.html", mainView);
    }]);
})(window);
