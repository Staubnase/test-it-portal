define(['angularAMD'], function (angularAMD) {
    angularAMD.factory('avatarService', function () {
        var avatarService = function (user) {
            var i1 = "",
                i2 = "",
                nameArray = [];

            if (angular.isDefined(user.Name)) {
                i1 = app.lib.capitalize(user.Name.charAt(0));
                nameArray = user.Name.split(" ");
                if (nameArray.length > 2) {
                    i2 = app.lib.capitalize(nameArray[nameArray.length - 1].charAt(0));
                } else {
                    i2 = app.lib.capitalize(nameArray[1].charAt(0));
                }
            } else {
                i1 = app.lib.capitalize(user.UserFirstName.charAt(0));
                nameArray = user.UserLastName.split(" ");
                if (nameArray.length > 2) {
                    i2 = nameArray[nameArray.length - 1].charAt(0);
                } else {
                    i2 = app.lib.capitalize(nameArray[0].charAt(0));
                }
            }
            var initials = i1 + i2;

            return ({ "Initials": initials });
        }
        return {
            getAvatar: avatarService
        }
    });
});