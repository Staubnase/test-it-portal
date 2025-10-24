define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('userAvatar', ["avatarService", function (avatarService) {
        var controller = function ($scope) {
            $scope.ImageAvailable = false;
            if (!$scope.User.Avatar) {
                $scope.GenericAvatar = avatarService.getAvatar($scope.User);
            } else {
                $scope.ImageAvailable = true;
            }
        };
        return {
            restrict: 'E',
            scope: {
                User: '=user'
            },
            templateUrl: "/Scripts/ng/shared/directives/templates/userAvatar.html",
            controller: controller
        };
    }]);
});


