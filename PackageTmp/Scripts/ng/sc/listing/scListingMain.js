require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/ng/sc/listing/",
    paths: {
        text: "require/text",
        'angular': '../../../libs/angular/angular',
        'angularAMD': '../../../libs/angular/angularAMD',
        'angular-ui-router': '../../../libs/angular/angular-ui-router',
        'angular-sanitize': '../../../libs/angular/angular-sanitize',
        'angular-resource': '../../../libs/angular/angular-resource',
        'infinite-scroll': '../../../libs/angular/ng-infinite-scroll'
    },
    shim: {
        "angular": { exports: "angular" },
        'angular-ui-router': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular'],
        'infinite-scroll': ['angular']
    },
    deps: ['app']
});