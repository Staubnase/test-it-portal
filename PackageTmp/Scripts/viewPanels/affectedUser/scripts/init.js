//bootstrap the application   
angular.element(document).ready(function(){
    var appDiv = document.getElementById("AffectedUser");
    angular.bootstrap(angular.element(appDiv), ['affectedUserApp']);
});