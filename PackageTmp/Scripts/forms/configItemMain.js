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
    var taskContainer = $('<div class="task-panel task-panel-narrow"></div>');
    var headerContainer = $('.page_bar').empty(); //use new page header div, just clear it out before adding things
    var formContainer = $('<div/>').addClass("page-form");
    var formType = pageForm.type;
    var dataVM = pageForm.viewModel;
    var dataVMUnchanged = pageForm.jsonRaw;
    
    //check for errors
    if (!_.isUndefined(pageForm.viewModel.WorkItemErrorMessage)) {
        var jumbotron = $('<div/>').addClass('jumbotron');
        jumbotron.append($('<h1 />').addClass("error uppercase").html("<i class='fa fa-frown-o'></i> " + localization.Failed));
        jumbotron.append($('<p />').addClass("error").html(pageForm.viewModel.WorkItemErrorMessage));

        mainContainer.append(jumbotron);

        app.lib.mask.remove();
        $("body").css("cursor", "auto");
        return;
    }

    //add the ability to bind to form load
    var readyArray = [];
    pageForm.boundReady = function (func) {
        readyArray.push(func);
    }

    //add the ability to bind change to viewModel by index, with support for null index
    var changesArray = [];
    pageForm.boundChange = function (index, func) {
        changesArray[index] = func;
    }

    //add custom viewModel function in the custom space
    var methods = app.custom.actionMethod.get(formType);
    if (_.isArray(methods)) {
        dataVM.custom = {};
        $.each(methods, function (i, method) {
            if (_.isFunction(method.func)) {
                dataVM.custom[method.index] = method.func;
            }
        });
    }

    //add header json definition
    //since all WI have same header structure we put it in this file
    //if this changes we need to move this to all the cshtml New/Edit files
    pageForm.headerTemplate = {
        rows: [
                {
                    columns: [
                    { View: "stickyCI", Class: "" }
                        //{ View: "status", Class: "col-md-5 col-xs-12" }
                    ]
                }
        ]
    };


    //going to define tasks based on pageForm.type & pageForm.newWI to reduce repetative code
    pageForm.taskTemplate = {};
    pageForm.taskTemplate.tasks = [];

    //add custom tasks
    var tasks = app.custom.formTasks.get(pageForm.type);
    if (_.isArray(tasks)) {
        $.each(tasks, function (i, task) {
            pageForm.taskTemplate.tasks.push({ Task: "custom", Type: pageForm.type, Label: task.label, Access: true, Configs: { func: task.func } })
        });
    }

    var commonTasks = app.custom.formTasks.get("ConfigItem");
    if (_.isArray(commonTasks)) {
        $.each(commonTasks, function (i, task) {
            pageForm.taskTemplate.tasks.push({ Task: "custom", Type: pageForm.type, Label: task.label, Access: true, Configs: { func: task.func } })
        });
    }

    var init = function () {
        //strip rtf on Notes
        for (var i in dataVM) {
            if (i.indexOf("Notes") > -1) {
                if (!_.isUndefined(dataVM[i])) {
                    dataVM[i] = stripRTF(dataVM[i]);
                }
            }
        }

        // select template
        setTemplateJSONFromSessionAdJSON();

        var alertContainer = $('#alertMessagesContainer');
        alertContainer.addClass("sticky-header");
        formContainer.addClass("sticky-header");
        taskContainer.addClass("sticky-header");
        headerContainer.addClass("sticky-header");

        if (!app.isMobile()) {
            //add dynamic containers to main container
            mainContainer.append(formContainer);

            mainContainer.before(taskContainer);
        } else {
            mainContainer.append(formContainer);
            mainContainer.after(taskContainer);
        }

        //build out tasks
        taskContainer.append("<h2>" + localization.Tasks + "</h2>");
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
            if (typeof (drawermenu) != 'undefined') {
                createButtons();
            } else {
                app.events.subscribe("drawerCreated", function () {
                    createButtons();
                });
            }

            app.lib.handleMessages();

            //bind change event no that form is built
            dataVM.bind("change", function (e) {
                onVmChange(e);
            });

            // call bound on ready functions
            _.each(readyArray, function (func, index) {
                if (_.isFunction(func)) {
                    func();
                }
            });

            // prevent 'enter' key from submitting form on older browsers.
            formContainer.on('keypress', function (e) {
                app.lib.stopEnterKeySubmitting(e);
            });

            if (!app.isMobileDevice()) {
                var $taskPanel = $('.task-panel').first();
                $taskPanel.affix({ offset: { top: $taskPanel[0].getBoundingClientRect().top - 84 } });
                kendo.data.binders.yScrollOnResize($taskPanel[0], { yScrollOnResize: { path: { top: 'auto', bottom: 50 } } }, {});
            }

            //manage dirty
            formHelper.manageDirty(dataVM);
        });

        //remove the mask
        app.lib.mask.remove();
    }

    // Template Decider
    // Chooses template from JSON by session and work item type
    var setTemplateJSONFromSessionAdJSON = function () {
        var type = formType;
        var defaultName = "Default";
        var json = pageForm.formTemplate;
        var msg = "A '" + defaultName + "' template is required.";
        var customMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found. No Default key is found on the custom template, default template will be used.";
        var defaultMsg = " \r\r When creating a JSON template for '" + type + "' you must add a template with the key of '" + defaultName + "'. This is used for fallback if a specific template is not found.";
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
        pageForm.formTemplate = json[pageForm.CustomFormName];


    }

    // Form Buttons
    var createButtons = function () {
        // Save Failure
        //TODO: this could possibly end up being a switch statement to check what the error source is
        var saveFailure = function (exceptionMessage) {
            //console.log('save failure');
            if (exceptionMessage == localization.RequiredFieldsErrorMessage) {
                app.lib.message.add(exceptionMessage, "danger");
            } else {
                //fallback to generic message
                app.lib.message.add(localization.PleaseCorrectErrors, "danger");
            }
            app.lib.message.show();
            //take use to the error message
            window.scrollTo(0, 0);
        }

        // Save Button
        drawermenu.addButton(localization.Save, "fa fa-check cs-form__drawer--save", function () {

            save(function (data) {
                message = localization.ChangeRequestSavedMessage;
                link = "/DynamicData/Edit/" + data.BaseId + "/";

                app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong> CI - " + dataVM.DisplayName + "</strong></a> ", "success");
                app.lib.gotoFormReturnUrl();

                return;
            }, saveFailure);
        });

        // Apply Button
        drawermenu.addButton(localization.Apply, "fa fa-pencil cs-form__drawer--apply", function () {
            save(function (data) {
                if (pageForm.newWI) {
                    link = "/DynamicData/Edit/" + data.BaseId + "/";
                    message = ""; //localization.ChangeRequestSavedMessage;
                    app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong> CI - " + pageForm.viewModel.DisplayName + "</strong></a> ", "success");
                    location = link;
                }
                else {
                    app.lib.message.add(localization.ChangesApplied, "success");
                    location.reload();
                }

                

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

                        app.lib.gotoFormReturnUrl();
                        return;
                    }
                });
            } else {
                app.lib.gotoFormReturnUrl();
                return;
            }
        });

        // mobile task Button
        formHelper.mobileDrawerTaskButton(taskContainer);
    }


    // Ajax Save Method (to be moved)
    var save = function (success, failure) {
        //ensure all values inputted have been bound to VM
        //not sure this is even needed and it causes many problems
        //need to delete after regression -JK
        //$(".page_content *").blur();


        app.lib.mask.apply();
        var valid = true;
        var required = true;

        //checks all required fields
        formContainer.find(".form-group").removeClass("has-error");
        formContainer.find("[required]").each(function () {
            var jqEle = $(this);

            //This code is to check if enum is required or not for IE9.
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
            //END This code is to check if enum is required or not for IE9.

            var nodeName = jqEle[0].nodeName.toLowerCase();
            if (nodeName != "input" && nodeName != "textarea") {
                jqEle = jqEle.find("input");
            }
            if (jqEle.val() == "") {
                valid = false;
                jqEle.parents(".form-group").addClass("has-error");
            }

        });

        //check for valid enums
        formContainer.find(".input-error").each(function () {
            valid = false;
        });

        formContainer.find("[data-invalid]").each(function () {
            valid = false;
            var jqEle = $(this);
            jqEle.parents(".form-group").addClass("has-error");

            jqEle.css({
                "background-color": "#FBE3E4"
            });

        });
        if (!required) {
            failure(localization.RequiredFieldsErrorMessage);
            app.lib.mask.remove();
            return;
        }
        //end check of req fields


        if (!valid) {
            failure(localization.PleaseCorrectErrors);
            app.lib.mask.remove();
            return;
        }
        //end check for valid enums


        //check for un added action log commnets
        if (dataVM.get('commentDirty')) {
            app.lib.message.add("<strong>" + localization.UnAddedActionLogComment + "</strong>", "warning");

            //only going to warn you once
            dataVM.set('commentDirty', false);

            app.lib.message.show();
            //take use to the error message
            window.scrollTo(0, 0);

            app.lib.mask.remove();
            return;
        }
        //end check for un added action log commnets

        var current = dataVM.toJSON();
        //This will optimized the passing of mulitple object to only send the deleted or/and added items
        if (pageForm.newWI == false) {
            app.lib.optimizeFormMultiObject.BeforeSave(current, pageForm.jsonRaw);
            
        }
        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: current,
            original: pageForm.jsonRaw
        }));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: saveUrl,
            data: "formJson=" + postData,
            success: function (data, status, xhr) {

                $.post("/platform/api/CacheSync", {}, function (cacheData) {
                    var _data = JSON.stringify(data);
                    //make the form clean so we don't trigger onbeforeunload
                    dataVM.set("isDirty", false);
                    if (_data.search('loginForm') < 0) { // Logged out check                   
                        success(JSON.parse(data));
                    } else {
                        //session expired
                        window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                    }
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //do we have a data conflict
                if (xhr.status == 409) {

                    $.when(kendo.ui.ExtYesNoDialog.show({
                        title: localization.DataConflict,
                        message: localization.DataConflictError + "<br/><br/><small>(" + localization.DataConflictDescription + ")</small>",
                        icon: "fa fa-exchange text-danger",
                        width: "500px",
                        height: "300px"
                    })
                    ).done(function (response) {
                        if (response.button === "yes") {
                            //open in new tab, may not work this way in all browsers
                            window.open(window.location.pathname);
                        } else {
                            //refresh page
                            location.href = window.location.pathname;
                        }
                    });

                } else if (xhr.status == 503) { //SDK unavailable
                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);
                    var msgResponse = JSON.parse(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (msgResponse.exception && msgResponse.exception.length > 0) {
                        errorMsg = msgResponse.exception;
                    }
                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });
                } else if (xhr.status == 403) { //user does not have access
                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);
                    var msgResponse = JSON.parse(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (msgResponse.exception && msgResponse.exception.length > 0) {
                        errorMsg = msgResponse.exception;
                    }
                    //alert the user
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: errorMsg,
                        icon: "fa fa-times-circle text-danger"
                    });


                } else {

                    failure();
                    console && app.lib.log(localization.RequestFailed);
                    app.lib.log(thrownError);

                    var jsonRsp = xhr.responseText;
                    app.lib.log(jsonRsp);

                    var msgResponse = JSON.parse(jsonRsp);
                    //determine error Message
                    var errorMsg = localization.RequestFailed;
                    if (msgResponse.exception && msgResponse.exception.length > 0) {
                        errorMsg = msgResponse.exception;
                    }

                    kendo.ui.ExtAlertDialog.show({
                        title: localization.ErrorDescription,
                        message: errorMsg,
                        icon: "fa fa-exclamation"
                    });
                }
            },
            processData: false,
            async: true
        });
    }
    //make pageForm Happy
    pageForm.save = save;


    //set a global vm change function
    var onVmChange = function (e) {
        //This will optimized the passing of mulitple object to only send the deleted or/and added items
        app.lib.optimizeFormMultiObject.OnVmChange(e);
    }
    //make the things global - grrrr
    pageForm.onVmChange = onVmChange;


    var stripRTF = function stripRtf(str) {

        if (_.isNull(str)) return "";

        var basicRtfPattern = /\{\*?\\[^{}]+;}|[{}]|\\[A-Za-z]+\n?(?:-?\d+)?[ ]?/g;
        var newLineSlashesPattern = /\\\n/g;
        var ctrlCharPattern = /\n\\f[0-9]\s/g;
        var rtfString = !_.isNull(str) ? str : "";

        //Remove RTF Formatting, replace RTF new lines with real line breaks, and remove whitespace
        return rtfString
            .replace(ctrlCharPattern, "")
            .replace(basicRtfPattern, "")
            .replace(newLineSlashesPattern, "\n")
            .trim();
    }
    init();

});