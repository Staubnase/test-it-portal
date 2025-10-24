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

define(function (require) {
    var authTokenFlyout = require("forms/flyout/authTokenFlyout/controller");

    var viewModel = kendo.observable({
        TokenName: "",
        TokenExpirationDate: "",
        Token: "",
        dataSource: new kendo.data.DataSource({
            type: "odata-v4",
            transport: {
                read: "/platform/api/RegisteredApiConnectionToken?$expand=Owner",
                contentType: "application/json",
                dataType: "json"
            },
            pageSize: 20,
            serverPaging: true,
            serverPaging: true,
            serverSorting: true,
        }),
        openCreateTokenWindow: function (e) {
            var flyoutWindow = authTokenFlyout.getPopup(viewModel, "authenticationToken");
            flyoutWindow.setSaveCallback(function (data) {
                viewModel.isModalVisible = true;
            });
            flyoutWindow.open();
        },
        removeToken: function (e) {
            var viewModel = e.model || e.data;
            $.ajax({
                url: "/platform/api/RemoveRemoteServiceToken",
                data: JSON.stringify({ Name: viewModel.Name.trim() }),
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                success: function (result) {
                    location.href = "/AuthenticationToken";
                },
                error: function (e) {
                    console.log(e)
                }
            });
        },
        isDesktopView: !app.isMobileDevice(),
        isMobileView: app.isMobileDevice()
    });

    kendo.bind("#authenticationToken", viewModel);
});
