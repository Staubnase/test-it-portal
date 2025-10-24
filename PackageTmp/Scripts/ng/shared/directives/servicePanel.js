define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('servicePanel', function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                categorydata: '=',
                placeholder: '='
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/servicePanel.html",
            link: function (scope, element, attrs, state) {
                app.navDropdown();
            },
            controller: function ($scope, $state) {
                //event..
                $scope.onChange = function (id) {
                    //loop the category..
                    _.each($scope.categorydata, function (item) {
                        //get the actual selected service by its id...
                        var service = _.findWhere(item.Category.Services, { ServiceOfferingId: id });
                        //cleanup first the selected property...
                        _.each(item.Category.Services, function (srv) {
                            srv.selected = '';
                        });
                        //set the active class to the current selected item by the given id...
                        if (service) {
                            service.selected = 'active';
                        } 
                    });
                    //state route...
                    $state.go('listing.service', { serviceId: encodeURIComponent(id) });
                }
            }
        };
    });
});

