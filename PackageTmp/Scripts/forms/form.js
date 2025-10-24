define([
    "fields/string/definition"
], function (String) {

    /**
    Form Class: used to encapsulate form functions for kendo binding
                button handling, isDirty Flag and saving.
            
            ########
            # args #
            ########
            settings = {
                saveUrl: '',
                jsonRaw: original Json,
				extensionFieldsRaw: ExtensionFields Json,
                onBeforeInit: function(self){}
            }
            ###############################
            # public properties / Methods #
            ###############################
            form.setIsDirty(bool); // sets isDirty value
            form.isDirty(); // return isDirty value
            form.bind("onDirtyChange", function(){}); // listen to dirty event
            form.save(callback); // calls save
            form.ca
            form.disableForm()
            form.shouldDisable(viewModel)
            form.handleStatus()

    */
    var pageForm = {

        isDirty: false,
        settings: {},
        jsonRaw: {},
        viewModel: {},
        formId: '',
        formEle: '',


        // initialization
        init: function () {
            var that = this;
            if (settings.onBeforeInit) {
                settings.onBeforeInit(that);
            }
            this.jsonRaw = that.settings.jsonRaw;
            this.viewModel = kendo.observable(that.jsonRaw);
            this.viewModel.bind("change", onVmChange);
            this.formId = that.settings.formId;
            this.extensionFieldsJson = that.settings.extensionFieldsJson;

        },
        // methods
        disableForm: function () {
            $('form input, form textarea').each(function () {
                $(this).attr("disabled", "disabled");
                $(this).addClass("k-state-disabled");
            });

            $('form .k-icon.k-i-arrow-s, form .k-icon.k-i-arrow-n, form .k-select, form .searchIcon, form .search, form .k-button, form button').each(function () {
                $(this).remove();
            });

            $(".taskmenu").hide();
            $(".reviewer-controls").hide();

        },

        // methods
        shouldDisable: function (vm) {

            if (vm.Status.Id === "c7b65747-f99e-c108-1e17-3c1062138fc4" ||  // SR Closed
                vm.Status.Id === "f228d50b-2b5a-010f-b1a4-5c7d95703a9b" || // CR Closed
                vm.Status.Id === "25eac210-e091-8ae8-a713-fea2472f32ff" || // PR Closed
                vm.Status.Id === "221155fc-ad9f-1e40-c50e-9028ee303137" || // RR Closed
                vm.Status.Id === "bd0ae7c4-3315-2eb3-7933-82dfc482dbaf") { // Incident Closed
                return true;
            } else {
                return false;
            }

        },

        //handle form changes based on status
        handleStatus: function () {
            this.formEle = $("#" + this.formId);

            //set status and bind change
            app.controls.forceProp(this.viewModel, "Status", { Name: null, Id: null });
            $('#statusname').html(this.viewModel.Status.Name);
            $('#statusname').attr('data-status-id', this.viewModel.Status.Id);
            //bind changes to model to the status view pill
            this.viewModel.Status.bind("change", function (obj) {
                if (obj.field === 'Name') {
                    $('#statusname').html(this.viewModel.Status.Name);
                } else if (obj.field === "Id") {
                    $('#statusname').attr('data-status-id', this.viewModel.Status.Id);
                }
            });

            //if WI is closed disable form
            if (this.shouldDisable(this.viewModel)) {
                this.disableForm();
            }

            //should we display the close task
            if (this.viewModel.Status.Id === "2b8830b6-59f0-f574-9c2a-f4b4682f1681") { // Incident Resolved
                if ($('#taskpanel .hide-till-resolved')) {
                    $('#taskpanel .hide-till-resolved').removeClass('hide');
                }
            } else {
                if ($('#taskpanel .hide-till-resolved')) {
                    $('#taskpanel .hide-till-resolved').addClass('hide');
                }
            }
        },

        assignTasks: function (type) {

            //handle default tasks
            app.controls.apply($(".taskmenu"));

            if (typeof (app.lib.formTasks.get(type)) !== 'undefined') {
                var tasks = app.lib.formTasks.get(type);
                var taskContainer = $('.taskmenu.custom');
                app.lib.extTemplate.load("/CustomSpace/customtasks.tmpl.html"); //load custom templates

                //add div for name/value window
                var winEle = $("<div>", { "id": "objectViewerWindow" });
                taskContainer.after();

                var taskWin = winEle.kendoCiresonWindow({
                    width: 550,
                    height: 400,
                    actions: ["Close"]
                }).data("kendoWindow");

                //taskWin.title(title).center().open();

                $(document).bind("TEMPLATE_LOADED", function (e, path) {
                    $.each(tasks, function (i, task) {

                        var li = $("<li>", { html: task.label });
                        li.click(function () {
                            task.func(that, this.viewModel, taskWin);
                        });
                        taskContainer.append(li);
                    });
                });
            }


        },

        onVmChange: function (e) {
            setIsDirty(true);
            //app.lib.log(e);
        },

        setIsDirty: function (bool) {
            isDirty = bool;
            $(that).trigger("onDirtyChange");
        },

        isDirty: function () {
            return isDirty;
        },

        save: function (success, failure) {
            if (!this.isDirty()) {

                kendo.ui.ExtAlertDialog.show({
                    title: localization.Warning,
                    message: localization.Nochangesweremade
                });
                return;
            }
            $("body *").blur;
            var postData = {
                isDirty: this.isDirty(),
                //original: this.jsonRaw,
                current: this.viewModel.toJSON()
            }
            // quick fix for error in  UserInput error
            if (postData.current.UserInput) {
                postData.current.UserInput = postData.current.UserInput;
            }

            var postData = encodeURIComponent(JSON.stringify(postData));

            $.ajax({
                type: 'POST',
                dataType: 'text',
                url: settings.saveUrl,
                data: "formJson=" + postData,
                success: function (data, status, xhr) {
                    //did the login page get sent back
                    if (data.search('loginForm') < 0) {
                        //data = $.parseJSON(data);
                        //if (data.success) {
                        setIsDirty(false);
                        success(data);
                        //} else {
                        //    app.lib.log(data);
                        //}
                    } else {
                        //session expired
                        window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console && app.lib.log(localization.RequestFailed);
                    //app.lib.log(xhr);
                    //app.lib.log(ajaxOptions);
                    app.lib.log(thrownError);

                    var jsonRsp = $.parseJSON(xhr.responseText);
                    app.lib.log(jsonRsp);

                    var errorMsg = localization.RequestFailed;
                    if (jsonRsp.exception.length > 0) {
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

        },

        buildForm: function (formJSON) {
            console.log(formJSON.customFieldGroupList);

            _.each(formJSON.customFieldGroupList, function(fieldGroup) {

                var header = $('<div/>').addClass("row");
                $('<h3/>').html(fieldGroup.name).appendTo(header);
                header.appendTo('#form > div');

                _.each(fieldGroup.rows, function (formRow) {
                    var row = $('<div/>').addClass("row");

                    //determine total number of cols factoring in colSpans
                    var numCols = 0;
                    _.each(formRow.columnFieldList, function (columnField) {
                        numCols += (columnField.colSpan) ? columnField.colSpan : 1;
                    });

                    _.each(formRow.columnFieldList, function (columnField) {
                        
                        //calcualte the bootstrap grid width
                        //(12/(totalCols [3])) * colspan [1] = 4
                        var colspan = (columnField.colSpan) ? columnField.colSpan : 1;
                        var colsize = (12 / numCols) * colspan;

                        var col = $('<div/>').addClass("col-md-" + colsize);

                        //TODO: make dynamic based on columnField.DataType
                        var field = _.clone(String);
                        field = field.build(columnField);
                        col.append(field);

                        col.appendTo(row);

                    });

                    row.appendTo('#form > div');
                });
            });
            

            app.controls.apply($('#form'), { localize: true, vm: this.viewModel, bind: true });

            $('.page-form-loading').hide();
            $('.page-form').fadeIn();
        }
    }

    return pageForm;
});