var addIns = {
    loadAddInScripts: function () {
        _.each(session.addIns, function (addIn) {
            if (!_.isNull(addIn.Urls)) {
                var addInsURLs = addIn.Urls.replace(/[\[\]']+/g, "").split(',');
                addInsURLs.forEach(function (url) {
                    if (window.location.href.indexOf(url) !== -1) { // Verify we are on the valid page
                        var result = $.Deferred();
                        var script = document.createElement("script");
                        script.async = "async";
                        script.type = "text/javascript";
                        script.src = addIn.Path;
                        script.onload = script.onreadystatechange = function (_, isAbort) {
                            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                                if (isAbort) {
                                    result.reject();
                                    console.log("Failed to load Add-In: " + addIn.AddInDisplayName);
                                } else {
                                    result.resolve();
                                    console.log("Add-In loaded: " + addIn.AddInDisplayName);
                                }
                            }
                        };
                        script.onerror = function () { result.reject(); };
                        $("head")[0].appendChild(script);
                        return result.promise();
                    }
                });
            }
        });
    },
    getAvailableAddIns: function () {
        var result = [];
        $.ajax({
            url: "/Platform/api/GetAvailableAddIns",
            type: "GET",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (availableAddIns) {
                result = availableAddIns.value;
            }
        });
        return result;
    },
    getInstalledAddIns: function (callback) {

        $.ajax({
            url: "/Platform/api/AddInsMetaData",
            type: "GET",
            dataType: "json",
            async: true,
            contentType: 'application/json; charset=UTF-8',
            success: function (installedAddIns) {
                callback(installedAddIns.value);
            },
            error: function (data) {
                callback([]);
            }
        });
    },
    getAddInFromSettingsName: function (settingsName) {
        var result;
        $.ajax({
            url: "/Platform/api/AddInsMetaData?$filter=Settings eq '" + settingsName + "'",
            type: "GET",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (addIn) {
                result = addIn.value[0]
            }
        });
        return result;
    },
    getAvailableSystemSettingTypes: function () {
        var result = [];
        $.ajax({
            url: "/Platform/api/GetAvailableSystemSettingTypes",
            type: "GET",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (availableSettings) {
                result = availableSettings.value;
            }
        });
        return result;
    },
    getSystemSetting: function (settingType) {
        var result = [];
        $.ajax({
            url: "/Platform/api/Get_SystemSetting(TypeName='" + settingType + "')",
            type: "GET",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (settings) {
                result = settings;
            }
        });
        return result;
    },
    getSystemSettingGridData: function (settingType) {
        var result = [];
        var settings = addIns.getSystemSetting(settingType);
        for (var setting in settings) {
            result.push({
                "Key": setting,
                "Value": settings[setting]
            });
        };
        return result;
    },
    saveSystemSetting: function (data) {
        var result = null;
        $.ajax({
            url: "/Platform/api/Set_SystemSetting",
            type: "POST",
            data: JSON.stringify({
                SystemSettings: data
            }),
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                result = data.value;
            }
        });
        return result;
    },
    installAddIn: function (name, version) {
        var result = null;
        app.lib.mask.apply();
        $.ajax({
            url: "/Platform/api/CacheCompile",
            data: {},
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            async: false,
            success: function (data) {
                app.lib.mask.remove();
                $.get('/addIns/ResetCache');
                result = data.value;
            },
            error: function () {
                app.lib.mask.remove();
                result = false;
            }
        });
        return result;
    },
    setAddInState: function (id, state) {
        var result = null;
        $.ajax({
            url: "/platform/api/AddInsMetaData(" + id + ")/Action.SetAddInState",
            data: JSON.stringify({
                State: state
            }),
            type: "POST",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                $.get('/addIns/ResetCache');
                result = data.value
            }
        });
        return result;
    },
    getLatestVersion: function (addIn) {
        var version = session.staticFileVersion.toString().split("").join(".");
        var latestVersion = "";
        latestVersion = addIn.Versions.sort(function (a, b) {
            return parseFloat(b.ExtensionVersion) - parseFloat(a.ExtensionVersion);
        }).filter(function (e, i) {
            return (version == 0) ? true : parseFloat(e.MinPortalVersion) <= parseFloat(version);
        })[0].ExtensionVersion;
        return latestVersion;
    }
};

