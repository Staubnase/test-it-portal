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
        var headerContainer = $('.page_bar').empty(); //use new page header div, just clear it out before adding things
        var formContainer = $('<div/>').addClass("page-form");
        var dataVM = pageForm.viewModel;
        var formType = pageForm.type;
        var kbHomeUrl = "/View/0aef4765-0efa-4a65-84c1-324b09231223"; //new kb home url

        //add header json definition
        //since all WI have same header structure we put it in this file
        //if this changes we need to move this to all the cshtml New/Edit files
        pageForm.headerTemplate = {
            rows: [
                    {
                        columns: [
                            { View: "status", Class: "col-md-6 col-xs-12" },
                            { View: "spacer", ColSpan: 4 }
                        ]
                    }
            ]
        };

        var init = function () {

            // select template
            setTemplateJSONFromSessionAdJSON();

            //add dynamic containers to main container
            mainContainer.append(formContainer);

            //build and add header container
            headerBuilder.build(pageForm, function (view) {
                headerContainer.append(view);
            });

            //build and add form from json definition
            formBuilder.build(pageForm, function (html) {

                formContainer.append(html);
                app.controls.apply(formContainer, { localize: true, vm: dataVM, bind: true });
                formContainer.show();
                // make sure we have the drawer before we try to add buttons buttons
                //if (!_.isUndefined(drawermenu)) { //stupid underscore need to move to lo-dash
                if (typeof (drawermenu) != 'undefined') {
                    createButtons();
                } else {
                    app.events.subscribe("drawerCreated", function () {
                        createButtons();
                    });
                }

                if (pageForm.viewModel.IsNew) {
                    pageForm.view.set("id", localization.New);
                }
                app.lib.handleMessages();

                //manage dirty
                formHelper.manageDirty(dataVM);
            });

            //let them in
            app.lib.mask.remove();

        }

        var setTemplateJSONFromSessionAdJSON = function () {
            var type = formType;
            var defaultName = "Default";
            var json = pageForm.formTemplate;
            var msg = "A '" + defaultName + "' template is required.";
            var customMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found. No Default key is found on the custom template, default template will be used.";
            var defaultMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found.";
            console.log("pageForm.formTemplate", pageForm.formTemplate);
            if (json.customTemplate != null && json.customTemplate != '') {
                //This will check if the custom form have the Default key.
                json = pageForm.formTemplate.customTemplate;
                if (!json.Default) { //If Default is not found, it will going to alert for a message stating it will use the Default form/Template.
                    if (type) {
                        msg += customMsg;
                    }
                    //From here, it will going to get the Default template/Form.
                    json = pageForm.formTemplate.defaultTemplate;
                    if (!json.Default) {
                        if (type) {
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
                console.log("test", pageForm.formTemplate);
                //If the custom template/form is not found, it will used the default form/template.
                json = pageForm.formTemplate;
                if (!json.Default) {
                    if (type) {
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
            // using a matcher in case something changes on either side
            // this will be easier and faster fix
            // { "formType from work item cshtml": "prop name from session.user that holds template" }
            //var typeToSession = {
            //    "ConfigItem": "IncidentForm"
            //}
            //var getTemplateNameFromSession = function () {
            //    if (type && typeToSession[type] && session && session.user &&
            //        session.user[typeToSession[type]] && json[session.user[typeToSession[type]]]) {
            //        return session.user[typeToSession[type]];
            //    }
            //    return defaultName;
            //}


            //var templateName = getTemplateNameFromSession();
            //pageForm.formTemplate = json[templateName];
            pageForm.formTemplate = json[defaultName];


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

            //View Button
            var newWin = null;
            if (pageForm.viewModel.IsNew == false) {
                drawermenu.addButton(localization.View, "fa fa-file-text cs-form__drawer--view", function () {
                    var url = "/KnowledgeBase/View/" + pageForm.viewModel.ArticleId;
                    try{
                        if (_.isNull(newWin)) {
                            newWin = window.open(url, "_blank");
                        } else {
                            newWin.location.reload();
                            newWin.focus();
                        }
                    }catch(e){
                        newWin = window.open(url, "_blank");
                    }
                });
            }

            // Save Button
            drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {

                save(function (data) {
                    data = eval("(" + data + ")");

                    if (data.articleId == "") {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Message,
                            message: localization.FailedSave,
                            icon: "fa fa-exclamation"
                        });
                        return;
                    }

                    //only set id if we don't already have one
                    dataVM.ArticleId = (dataVM.ArticleId) ? dataVM.ArticleId : data.articleId;
                    app.lib.message.add(localization.KnowledgeArticleSavedMessage + "&nbsp;&nbsp;<strong>" + dataVM.ArticleId + "</strong>", "success");
                    location.href = kbHomeUrl;
                }, saveFailure);
            });



            // Apply Button
            drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {
                save(function (data) {
                    data = eval("(" + data + ")");

                    if (data.articleId == "") {
                        kendo.ui.ExtAlertDialog.show({
                            title: localization.Message,
                            message: localization.FailedSave,
                            icon: "fa fa-exclamation"
                        });
                        return;
                    }
                    if (dataVM.IsNew)
                        dataVM.set("ArticleId", data.articleId);

                    //make the form clean so we don't trigger onbeforeunload
                    dataVM.set("isDirty", false);
                    app.lib.message.add(localization.ChangesApplied, "success");
                    


                    if (app.lib.isNewForm()) {
                        location.href = "/KnowledgeBase/Edit/" + dataVM.ArticleId + "/";
                    }
                    else {
                        location.reload();
                    }

                    refreshButtons();
                    $(".k-overlay").hide();
                    app.lib.message.show();
                    setTimeout(function () {
                        $('html, body').animate({
                            scrollTop: 0
                        }, 300);
                        app.lib.mask.remove();
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

                            location.href = kbHomeUrl;
                        }
                    });
                } else {
                    location.href = kbHomeUrl;
                }
            });
            // Delete Button
            if (pageForm.viewModel.IsNew == false) {
                drawermenu.addButton(localization.Delete, "fa fa-trash cs-form__drawer--delete", function () {
                    $.when(kendo.ui.ExtOkCancelDialog.show({
                        title: localization.Warning,
                        message:  localization.KnowledgeArticleSureDelete,
                        icon: "fa fa-exclamation"
                    })
                   ).done(function (response) {
                       if (response.button === "ok") {
                           $.ajax({
                               type: "DELETE",
                               url: app.lib.addUrlParam("/api/V3/KnowledgeBase/DeleteHtmlKnowledge/", "articleId", pageForm.viewModel.ArticleId),
                               success: function () { 
                                   app.lib.message.add(localization.Delete + " " + localization.Completed
                                       + "&nbsp;&nbsp;<strong>"
                                       + localization.KnowledgeArticle + ": " + dataVM.ArticleId
                                       + "</strong>", "warning");
                                   location.href = kbHomeUrl;
                               }
                           });
                       }
                   });

                });
            }   

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

                var property = !_.isUndefined(jqEle.attr("data-control-bind"))
                                ? jqEle.attr("data-control-bind")
                                : jqEle[0].name;

                if (_.isUndefined(property) && _.isUndefined(jqEle[0].kendoBindingTarget)) {
                    property = jqEle.attr("data-cid-propname");
                } else {
                    property = jqEle[0].kendoBindingTarget.options.propertyName;
                }

                var isEnum = _.isObject(pageForm.viewModel[property]) && !_.isUndefined(pageForm.viewModel[property].Id);
                if ((_.isNull(pageForm.viewModel[property]) || (pageForm.viewModel[property] === "")) ||
                    (_.isObject(pageForm.viewModel[property]) && isEnum && (_.isNull(pageForm.viewModel[property].Id) || pageForm.viewModel[property].Id === "")) ||
                    (((_.isObject(pageForm.viewModel[property]) && !isEnum && (_.isUndefined(pageForm.viewModel[property].BaseId) || _.isNull(pageForm.viewModel[property].BaseId)))))) {
                    valid = false;
                    if (jqEle.hasClass("form-group")) {
                        jqEle.addClass("has-error");
                    } else {
                        jqEle.parents(".form-group").addClass("has-error");
                    }
                }

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
            
            //escape character to blank
           
            if (!_.isNull(dataVM.Abstract)) 
                dataVM.Abstract = app.lib.escapeHTML(dataVM.Abstract);
            if(!_.isNull(dataVM.Title))    
                dataVM.Title = app.lib.escapeHTML(dataVM.Title);
            if(!_.isNull(dataVM.Keywords))
                dataVM.Keywords = app.lib.escapeHTML(dataVM.Keywords);
            if(!_.isNull(dataVM.VendorArticleID))
                dataVM.VendorArticleID = app.lib.escapeHTML(dataVM.VendorArticleID);
            if(!_.isNull(dataVM.ExternalURL))
                dataVM.ExternalURL = app.lib.escapeHTML(dataVM.ExternalURL);
            //if popularity is empty default to 100 (TFS 5313)
            var pop = pageForm.viewModel.get("Popularity");
            if (_.isNull(pop) || _.isUndefined(pop)
                || (_.isString(pop) && pop.length <= 0)) {
                pageForm.viewModel.set("Popularity", 100)
            }

            var postData = encodeURIComponent(JSON.stringify({
                isDirty: true,
                current:dataVM.toJSON(),
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
