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

require(["forms/taskBuilder", "forms/headerBuilder", "forms/formBuilder", "forms/formHelper"], function (taskBuilder, headerBuilder, formBuilder, formHelper, messagesStructure) {
    
    var saveUrl = pageForm.saveUrl;
    var mainContainer = $(pageForm.container);
    var headerContainer = $('.page_bar').empty(); //use new page header div, just clear it out before adding things
    var formContainer = $('<div/>').addClass("page-form");
    var taskContainer = $('<div data-bind="affix:{top:auto}" class="task-panel task-panel-narrow"></div>');
    var dataVM = pageForm.viewModel;
    var current;

    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
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

    pageForm.taskTemplate = {};

    var init = function () {

        if (!app.isMobile()) {
            //add dynamic containers to main container
            mainContainer.append(formContainer);

            mainContainer.before(taskContainer);
        } else {
            mainContainer.append(formContainer);
            mainContainer.after(taskContainer);
        }

        taskBuilder.build(pageForm, function (view) {
            taskContainer.append(view);
        });

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

            app.lib.handleMessages();

            //manage dirty
            formHelper.manageDirty(dataVM);

            //switch (pageForm.type) { }
        });

        var $taskPanel = $('.task-panel').first();
        $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });

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
            if (!app.lib.CheckedStartAndEndDate("StartDate", "EndDate", localization.StartDateShouldNotGreaterEndDate)) {
                return;
            }
            save(function (data) {
                app.lib.message.add(localization[pageForm.type] + " " + localization.Saved + "&nbsp;&nbsp;<strong>" + getDisplayName() + "</strong>", "success");
                
                app.lib.gotoFormReturnUrl();
                return;

            }, saveFailure);
        });



        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {
            if (!app.lib.CheckedStartAndEndDate("StartDate", "EndDate", localization.StartDateShouldNotGreaterEndDate)) {
                return;
            }
            save(function (data) {
                app.lib.message.add(localization.ChangesApplied, "success");
                
                location = pageForm.returnEditUrl + getObjectId();
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
                        //make sure we set the dirty flag off
                        dataVM.set("isDirty", false);

                        app.lib.gotoFormReturnUrl();
                        return;
                    }
                });
            } else {
                app.lib.gotoFormReturnUrl();
                return;
            }
        });

        if (pageForm.isNew == false) {
            drawermenu.addButton(localization.Delete, "fa fa-trash", function () {
                $.when(kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: localization.DeleteAnnouncement,
                    icon: "fa fa-exclamation"
                })
               ).done(function (response) {
                   if (response.button === "ok") {
                       $.ajax({
                           type: "DELETE",
                           url: app.lib.addUrlParam(pageForm.deleteUrl, "announcementId", getObjectId()),
                           success: function () {
                               location.href = "/View/903eb5d5-fea1-4e4d-85ba-f4c386a6e054";
                           }
                       });
                   }
               });

            });
        }


    }

    var getDisplayName = function () {
        switch (pageForm.type) {
            default:
                return dataVM.Title;
        }
    }

    var getPostObject = function (postData) {
        switch (pageForm.type) {
            case "Announcement":
                var formData = postData.current;
                var announcement = {
                    Id: formData.Id,
                    Title: formData.Title,
                    Priority: formData.Priority,
                    Body: formData.Body,
                    AccessGroupId: formData.AccessGroupId,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    Locale: session.user.LanguageCode
                }
                return JSON.stringify(announcement);
            default:
                return encodeURIComponent(JSON.stringify(postData));
        }
    }

    var getObjectId = function(){
        switch (pageForm.type) {
            case "Announcement":
                return dataVM.Id;
            default:
                return dataVM.BaseId;
        }
    }

    // Ajax Save Method (to be moved)
    var save = function (success, failure) {
        //ensure all values inputted have been bound to VM

        var valid = true;
        formContainer.find(".form-group").removeClass("has-error");
        formContainer.find("[required]").each(function () {
            var jqEle = $(this);

            var property = !_.isUndefined(jqEle.attr("data-control-bind")) ? jqEle.attr("data-control-bind") : jqEle[0].name;
            if (_.isUndefined(property) || property != "") {
                if (!_.isUndefined(jqEle[0].kendoBindingTarget) && !_.isUndefined(jqEle[0].kendoBindingTarget.options)) {
                    property = jqEle[0].kendoBindingTarget.options.propertyName;
                }
            }
            if (!_.isUndefined(property)) {
                var isEnum = _.isObject(pageForm.viewModel[property]) && !_.isUndefined(pageForm.viewModel[property].Id);
                if ((_.isNull(pageForm.viewModel[property]) || (pageForm.viewModel[property] === "")) ||
                    (_.isObject(pageForm.viewModel[property]) && isEnum && (_.isNull(pageForm.viewModel[property].Id) || pageForm.viewModel[property].Id === "")) ||
                    (((_.isObject(pageForm.viewModel[property]) && !isEnum && (_.isUndefined(pageForm.viewModel[property].BaseId) || _.isNull(pageForm.viewModel[property].BaseId)))))) {
                    valid = false;
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
        
        current = dataVM.toJSON();

        //Assign Name to Display Name   
        current.DisplayName = current.Name; 

        var postDataRaw = {
            isDirty: true,
            current: current,
            original: pageForm.jsonRaw
        };

        var postData = getPostObject(postDataRaw);
        
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: saveUrl,
            data: postData,
            contentType: 'application/json',
            success: function (data, status, xhr) {
                //make sure we set the dirty flag off
                dataVM.set("isDirty", false);

                //need this to be a string for the if statement below to work
                var dataAsString = JSON.stringify(data);
                if (dataAsString.search('loginForm') < 0) { // Logged out check                   
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
                    message:  errorMsg,
                    icon: "fa fa-exclamation"
                });
            },
            processData: false,
            async: false
        });
    }

    init();
});