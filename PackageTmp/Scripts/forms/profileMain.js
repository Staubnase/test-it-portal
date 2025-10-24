require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: "/Scripts/",
    paths: {
        //kendo: "kendo/js/kendo.mobile.min",
        //jquery: "jquery/jquery.min",
        text: "require/text"
    },

    shim: {
        //kendo: {
        //    deps: ['jquery'],
        //    exports: 'kendo'
        //}
    }
});

//let's let the user know that things are happening
app.lib.mask.apply();
$("body").css("cursor", "wait");
$(document).ajaxStop(function () {
    $("body").css("cursor", "auto");
});

require(["forms/headerBuilder", "forms/formBuilder", "forms/formHelper"], function (headerBuilder, formBuilder, formHelper) {


    var saveUrl = pageForm.saveUrl;
    var mainContainer = $(pageForm.container);
    var headerContainer = $('.page_bar').empty();

    var formContainer = $('<div/>').addClass("page-form");
    var dataVM = pageForm.viewModel;
   

    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
    if (pageForm.type == "userRelatedInfo") {
        pageForm.headerTemplate = {
            rows: [
                    {
                        columns: [
                            { View: "status", Class: "col-md-5 col-xs-12" },
                            { View: "spacer", ColSpan: 4 }
                        ]
                    }
            ]
        };
    } else {
        pageForm.headerTemplate = {
            rows: [
                    {
                        columns: [
                            { View: "title", ColSpan: 8 },
                            { View: "spacer", ColSpan: 4 }
                        ]
                    }
            ]
        };
    }

    var init = function () {
        /*
         * this is how we are doing some session stuff to pick what template to use. (find it in wiMain.js)
         *          setTemplateJSONFromSessionAdJSON();
         * For WIs at least the templates can vary based on AD groupd (I think).
         * For Incidents we have "Default" and "DefaultEndUser".
         * If we are not going to have different types of User Profile forms, we can likely skip 
         * this and just define it like I have. Or change the json structure. Some kind of standard
         * is being worked out on all this so we can streamline it better.
         */

        var json = pageForm.formTemplate;
        var defaultName = "Default";
        var msg = "A '" + defaultName + "' template is required.";
        var customMsg = " \r\r When creating a JSON template for '" + pageForm.type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found. No Default key is found on the custom template, default template will be used.";
        var defaultMsg = " \r\r When creating a JSON template for '" + pageForm.type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found.";
        if (json.customTemplate != null && json.customTemplate != '') {
            //This will check if the custom form have the Default key.
            json = pageForm.formTemplate.customTemplate;
            if (!json.Default) { //If Default is not found, it will going to alert for a message stating it will use the Default form/Template.
                if (pageForm.type) {
                    msg += customMsg;
                }
                //From here, it will going to get the Default template/Form.
                json = pageForm.formTemplate.defaultTemplate;
                if (!json.Default) {
                    if (pageForm.type) {
                        msg += defaultMsg;
                    }
                }
                
                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }
        else {
            //If the custom template/form is not found, it will used the default form/template.
            json = pageForm.formTemplate;
            if (!json.Default) {
                if (pageForm.type) {
                    msg += defaultMsg;
                }
                
                if (session.user.IsAdmin) {
                    alert(msg);
                }
                else {
                    console.log(msg);
                }
            }
        }

        if (pageForm.type == "userRelatedInfo") {
            if (dataVM.hasAsset) {
                pageForm.formTemplate = json[defaultName];
            } else {
                pageForm.formTemplate = json["withOutAsset"];
            }
        } else {
            pageForm.formTemplate = json[defaultName];
        }

        //add dynamic containers to main container
        //mainContainer.append(headerContainer, formContainer);
        mainContainer.append(formContainer);

        //build and add header container
        headerBuilder.build(pageForm, function (view) {
            headerContainer.append(view);
        });

        var list = pageForm.formTemplate.tabList[0].content[0].customFieldGroupList;
        if (!app.featureSet.isActive("TeamsNotification")) {
            let result = $.grep(list, function (e) {
                return e.name !== "TeamsNotificationSettings";
            });
            pageForm.formTemplate.tabList[0].content[0].customFieldGroupList = result;
        } else {
            if (pageForm.viewModel.IsTeamsNotify) {
                let result = $.grep(list, function (e) {
                    if (e.name === "TeamsNotificationSettings") {
                        e = _.each(e.rows, function (d) {
                            d.columnFieldList[0].Disabled = false;
                            if (!_.isUndefined(d.columnFieldList[1])) {
                                d.columnFieldList[1].Disabled = false;
                            }
                            return d;
                        });
                    }
                    return true;
                });
                console.log(result)
                pageForm.formTemplate.tabList[0].content[0].customFieldGroupList = result;
            }
        }

        //build and add form from json definition
        formBuilder.build(pageForm, function (html) {
            formContainer.append(html);
            app.controls.apply(formContainer, { localize: true, vm: dataVM, bind: true });

            formContainer.show();

            if (pageForm.type != "userRelatedInfo") {

                // make sure we have the drawer before we try to add buttons buttons
                //if (!_.isUndefined(drawermenu)) { //stupid underscore need to move to lo-dash
                if (typeof (drawermenu) != 'undefined') {
                    createButtons();
                } else {
                    app.events.subscribe("drawerCreated", function () {
                        createButtons();
                    });
                }
            }

            app.lib.handleMessages();

            //manage dirty
            formHelper.manageDirty(dataVM);
        });

        //let them in
        app.lib.mask.remove();
    }

    // Form Buttons
    var createButtons = function () {


        // Save Failure
        var saveFailure = function (exceptionMessage) {
            if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                app.lib.message.add(exceptionMessage, "danger");
            } else {
                //fallback to generic message
                app.lib.message.add(localization.PleaseCorrectErrors, "danger");
            }
            app.lib.message.show();
        }
        // Save Button
        drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {

            save(function (data) {
                data = eval("(" + data + ")");

                app.lib.message.add(data.data, "success");
                location = "/Settings/User/UserProfile/";
                app.clearAllLocalStorage();
                // we need this to force terminate the warning window bacasue of app.clearAllLocalStorage() function.
                app.sessionTimeout.hideWarningPopup();
                store.set("cireson_last_read_announcement", new Date().toISOString());//it should be stored on local storage.
            }, saveFailure);
        });



        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {

            save(function (data) {
                
                refreshButtons();
                $(".k-overlay").hide();
                data = eval("(" + data + ")");
                app.lib.message.add(data.data, "success");
                setTimeout(function () {
                    $('html, body').animate({
                        scrollTop: 0
                    }, 300);
                    app.lib.mask.remove();
                    location = "/Settings/User/UserProfile/";
                    app.clearAllLocalStorage();
                    // we need this to force terminate the warning window bacasue of app.clearAllLocalStorage() function.
                    app.sessionTimeout.hideWarningPopup();
                    store.set("cireson_last_read_announcement", new Date().toISOString());//it should be stored on local storage.
                }, 100);
            }, saveFailure);
        });
        // Cancel Button
        drawermenu.addButton(localization.Cancel, "fa fa-times cs-form__drawer--cancel", function () {
            if (dataVM.get("isDirty")) {
                $.when(kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: localization.UnsavedDataMessage,
                    icon: "fa fa-exclamation"
                })
                ).done(function (response) {
                    if (response.button === "ok") {
                        //make the form clean so we don't trigger onbeforeunload
                        dataVM.set("isDirty", false);

                        location.href = "/Settings/User/UserProfile/";
                    }
                });
            } else {
                location.href = "/Settings/User/UserProfile/";
            }
        });


    }

    var refreshButtons = function () {
        if (pageForm.viewModel.IsNew) {
            $("#drawer-taskbar").html("");
            pageForm.viewModel.IsNew = false;
            createButtons();
        }
    }

    // Ajax Save Method (to be moved)
    var save = function (success, failure) {
        //ensure all values inputted have been bound to VM
        $(".page_content *").blur();

        var valid = true;
        formContainer.find(".form-group").removeClass("has-error");
        formContainer.find("[required]").each(function () {
            var jqEle = $(this);
            var nodeName = jqEle[0].nodeName.toLowerCase();
            if (nodeName != "input" && nodeName != "textarea") {
                jqEle = jqEle.find("input");
            }
            if (jqEle.val() == "") {
                valid = false;
                jqEle.parents(".form-group").addClass("has-error");
            }
        });
        if (!valid) {
            failure(localization.RequiredFieldsErrorMessage);
            return;
        }
        app.lib.mask.apply();


        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: dataVM.toJSON(),
            original: pageForm.jsonRaw
        }));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: saveUrl,
            data: "formJson=" + postData,
            success: function (data, status, xhr) {
                //make the form clean so we don't trigger onbeforeunload
                dataVM.set("isDirty", false);

                if (data.search('loginForm') < 0) { // Logged out check                   
                    success(data);
                } else {
                    //session expired
                    window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                failure();
                console && app.lib.log(localization.RequestFailed);
                app.lib.log(thrownError);

                var jsonRsp = xhr.responseText;
                app.lib.log(jsonRsp);

                var errorMsg = localization.RequestFailed;
                if (jsonRsp.exception && jsonRsp.exception.length > 0) {
                    errorMsg = jsonRsp.exception;
                }

                kendo.ui.ExtAlertDialog.show({
                    title: localization.ErrorDescription,
                    message: errorMsg,
                    icon: "fa fa-exclamation"
                });
            },
            processData: false,
            async: false
        });
    }

    init();


});
