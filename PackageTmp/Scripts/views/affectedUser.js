require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: '/scripts/',
    paths: {
        text: 'require/text'
    },
    shim: {
    }
});

$(function () {
    $('#AffectedUser').load('/Scripts/viewPanels/affectedUser/index.html');
});