define(['angularAMD'], function (angularAMD) {
    angularAMD.filter('caseInsensitiveFilter', function () {
        return function (items, search) {

            if (!search) return items;

            return items.filter(function (element, index, array) {
                return element.Service.toLowerCase().indexOf(search.toLowerCase()) >= 0;
            });
        }
    });
});