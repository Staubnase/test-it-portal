// ROUTES
affectedUserApp.config(function ($routeProvider){
    
    $routeProvider
    
    .when('/', {
        templateUrl: '/Scripts/viewPanels/affectedUser/pages/incident.htm',
        controller: 'incidentController'
    })
    
    .when('/incident', {
        templateUrl: '/Scripts/viewPanels/affectedUser/pages/incident.htm',
        controller: 'incidentController'
    })

    .when('/servicerequest', {
        templateUrl: '/Scripts/viewPanels/affectedUser/pages/servicerequest.htm',
        controller: 'servicerequestController'
    })
});