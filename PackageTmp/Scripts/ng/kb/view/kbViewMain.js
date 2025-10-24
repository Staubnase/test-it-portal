require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    //urlArgs: "v=" + Date.now(), //force browser to alway recache
    baseUrl: "/Scripts/ng/kb/view/",
    paths: {
        text: "require/text",
        'angular': '../../../libs/angular/angular',
        'angularAMD': '../../../libs/angular/angularAMD',
        'angular-ui-router': '../../../libs/angular/angular-ui-router',
        'angular-sanitize': '../../../libs/angular/angular-sanitize',
        'angular-resource': '../../../libs/angular/angular-resource'
    },
    shim: {
        "angular": { exports: "angular" },
        'angular-ui-router': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular']
    },
    deps: ['app']
});