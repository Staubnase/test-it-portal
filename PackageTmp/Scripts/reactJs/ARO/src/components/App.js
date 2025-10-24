import React, { Component } from 'react';
import Text from './fields/Text';
import Numeric from './fields/Numeric';
import DateTime from './fields/DateTime';
import Enum from './fields/Enum';
import DropdownList from './fields/DropdownList';
import Bool from './fields/Bool';
import Query from './fields/Query';
import File from './fields/File';
import { ProcessConditionalPrompt, ControlTypes } from './common/EventPrompt';


class App extends Component {
    boundObj = kendo.observable({});
    ciresonDetails;
    directLinkUrl = "";
    directLinkDescription = "";
    isWatchlistEnabled = false;
    isDirectLink = false;
    isAdvanceRO = false;
    action = {
        previous:"previous",
        next:"next",
        save:"save"
    };

    constructor(props, state) {
        super(props, state);

        let isARO = true;
        let source = pageForm.PresentationMappingTemplate.Object.Data.PresentationMappingTemplate.Sources.Source;
        let isPromptsArray = Array.isArray(source);
        let configuration = null;

        if (isPromptsArray) {
            configuration = source[0].ControlConfiguration.Configuration;
        }
        else
            configuration = source.ControlConfiguration.Configuration;

        if (configuration == undefined) isARO = false;

        this.state = {
            prompts: source,
            isPromptsArray: isPromptsArray,
            pages: null,
            configPrompts: null,
            isARO: isARO
        };

        if(isPromptsArray) {
            source.map(item => {
                item.isValid = true;
                item.invalidMsg = "";
                item.ConditionalShow = isARO ? false : true;
            });
        }

        
    }

    componentWillMount() {

        if (this.state.isARO) {
            if (this.state.isPromptsArray)
                this.state.configPrompts = this.state.prompts[0].ControlConfiguration.Configuration.Details;
            else
                this.state.configPrompts = this.state.prompts.ControlConfiguration.Configuration.Details;

            this.ciresonDetails = this.state.configPrompts.Cireson;

            if (this.state.configPrompts.Cireson.DirectLink != undefined) {
                this.directLinkUrl = this.state.configPrompts.Cireson.DirectLink["@Url"];
                if (this.directLinkUrl != "") {
                    this.isDirectLink = true;
                    this.directLinkDescription = this.state.configPrompts.Cireson.DirectLink["#text"];
                }
            }

            this.isWatchlistEnabled = this.ciresonDetails.WatchList != undefined && this.ciresonDetails.WatchList["@Enabled"] != undefined ? this.ciresonDetails.WatchList["@Enabled"] == "True" : false;

            if (!this.isDirectLink) {
                this.state.prompts.map(query => {
                    //This will going to replace token for query result token filter
                    if (query["@ControlType"] == ControlTypes.InstancePicker) {
                        let config = query.ControlConfiguration.Configuration.Details;
                        this.state.prompts.map(prompt => {
                            if (config.Criteria != null && config.Criteria.includes(prompt["@Id"]) && prompt["@ControlType"] != "System.SupportingItem.PortalControl") {
                                if (prompt.QueryPrompt == undefined) prompt.QueryPrompt = [];
                                prompt.QueryPrompt.push(query);

                                if (query.DependencyPrompt == undefined) query.DependencyPrompt = [];
                                query.DependencyPrompt.push(prompt["@Id"]);
                            }
                        });
                    }
                });


                if (this.ciresonDetails != undefined) {
                    let pages = [];

                    if (!Array.isArray(this.ciresonDetails.Pages.Page)) {
                        pages.push(this.ciresonDetails.Pages.Page);
                    } else {
                        pages = this.ciresonDetails.Pages.Page;
                    }



                    if (this.isWatchlistEnabled) {
                            pages.push({
                                "@Name": "WatchList",
                                isActive: false,
                                Prompt: [{
                                    "@PromptId": 'WatchList'
                                }]
                            });

                        this.state.prompts.push({ "@Id": "WatchList", "@Ordinal": "1000", "@Prompt": "WatchList", "@ReadOnly": "false", "@Optional": "true", "@ControlType": "System.SupportingItem.PortalControl.InstancePicker", "ControlConfiguration": { "Dependencies": null, "AddressableOutputs": { "AddressableOutput": [] }, "Configuration": { "Details": { "ClassOrProjection": { "@Id": "eca3c52a-f273-5cdc-f165-3eb95a2b26cf", "@IsProjection": "false" }, "Columns": { "Column": [{ "@Name": "FirstName", "@Type": "string", "@DisplayName": "First Name" }, { "@Name": "LastName", "@Type": "string", "@DisplayName": "Last Name" }, { "@Name": "Title", "@Type": "string", "@DisplayName": "Title" }, { "@Name": "UserName", "@Type": "string", "@DisplayName": "User Name" }, { "@Name": "Domain", "@Type": "string", "@DisplayName": "Domain" }, { "@Name": "Company", "@Type": "string", "@DisplayName": "Company" }] }, "Criteria": null, "Cireson": { "Show": { "@When": "Always" } } } } }, "ConditionalShow": true });
                    }

                    this.state.pages = pages;
                    pages.map((page, index) => {
                        if (index == 0)
                            page.isActive = true;
                        else
                            page.isActive = false;
                    });


                }
                else {
                    this.state.pages = null;
                }
            }
        }
        

    }

    componentDidMount() {
        if (!this.isDirectLink) {
            let _this = this;
            let btnNext, btnPrev, btnSave;


            btnPrev = $(drawermenu.addButton(localization.Previous, "fa fa-arrow-left", function () { _this.save(btnNext, btnPrev, btnSave, _this.action.previous); }));
            btnNext = $(drawermenu.addButton(localization.Next, "fa fa-arrow-right", function (e) { _this.save(btnNext, btnPrev, btnSave, _this.action.next); }));
            btnSave = $(drawermenu.addButton(localization.Save, "fa fa-check", function () { _this.save(btnNext, btnPrev, btnSave, _this.action.save); }));

            if (this.state.isARO) {
                ProcessConditionalPrompt(this.state.prompts, this);

                if (this.state.pages != null && this.state.pages.length > 1) {
                    btnPrev.attr("disabled", "");
                    btnSave.attr("disabled", "");
                }
                else if (this.state.pages != null && this.state.pages.length <= 1) {
                    btnPrev.attr("disabled", "");
                    btnNext.attr("disabled", "");
                }
            }
            else {
                btnPrev.addClass("hide");
                btnNext.addClass("hide");
            }
            
        }
    }

    save(btnNext, btnPrev, btnSave, action) {
        
        let answer, selectedQuery, enumDisplayName, answerType, controlType = "";
        let pagePromptsId = [];
        let isValid, isCurrentPageValid = true;
        let model = {
            Id: this.props.offeringId,
            TargetTemplateId: this.props.templateId,
            AffectedUserId: $("#AffectedUserId").val(),
            AnswerCollection: [],
            WatchListUserIds: [],
            isValid: true
        };


        if (this.state.isARO) {
            let currentPage = _.find(this.state.pages, function (page) {
                return page.isActive == true;
            });

            if (Array.isArray(currentPage.Prompt)) {
                currentPage.Prompt.map(prompt => {
                    pagePromptsId.push(prompt["@PromptId"]);
                });
            }
            else {
                pagePromptsId.push(currentPage.Prompt["@PromptId"]);
            }
            
        }
        else {
            this.state.prompts.map(prompt => {
                pagePromptsId.push(prompt["@Id"]);
            });
        }
        


        this.state.prompts.map((item) => {
            isValid = true;
            answer = "";
            selectedQuery = "";
            enumDisplayName = "";
            controlType = item["@ControlType"];

            if (item["@Id"] == "00000000-0000-0000-0000-000000000000") {
                //this.configPrompts = item;
            }
            else {
                if (item.ConditionalShow) {
                    let isOptional = item["@Optional"] == "true";
                    let itemInPage = pagePromptsId.includes(item["@Id"]);
                    let id = "prompt" + item["@Id"].replace(/-/g, "");

                    switch (controlType) {
                        case ControlTypes.String:
                            answerType = "String";
                            answer = $("#" + id).val();
                            if (answer != "" || !isOptional) {
                                isValid = this.validateText(answer, item);
                            }
                            
                            break;
                        case ControlTypes.List:
                            answerType = "List";
                            let enumAnswer = this.boundObj.get(id);
                            enumDisplayName = enumAnswer.Text;
                            answer = enumAnswer.Id;
                            break;
                        case ControlTypes.InlineList:
                            answerType = "List";
                            answer = $("#" + id).find(".k-input").html();
                            break;
                        case ControlTypes.InstancePicker:
                            answerType = "InstancePicker";
                            selectedQuery = $("#Json" + id).val();
                            answer = $("#" + id).val();
                            break;
                        case ControlTypes.FileAttachment:
                            answerType = "FileAttachment";
                            selectedQuery = $("#Json" + id).val();
                            answer = $("#" + id).val();
                            break;
                        default:
                            answerType = controlType.replace("System.SupportingItem.PortalControl.", "");
                            answer = this.boundObj.get(id);
                            break;
                    }
                    item.isValid = true;

                    if (itemInPage) {
                        
                        if (!isOptional && (answer == null || answer == "")) {
                            item.invalidMsg = "This is a required field.";
                            item.isValid = false;
                        }
                        else item.isValid = true;

                        if (!isValid) {
                            item.invalidMsg = item.invalidMsg;
                            item.isValid = false;

                        }

                        if (!item.isValid) {
                            model.isValid = false;
                        }

                        

                        if (itemInPage && isCurrentPageValid && !item.isValid) {
                            isCurrentPageValid = false;
                        }
                    }
                    

                    model.AnswerCollection.push({
                        QuestionId: item["@Id"],
                        AnswerType: answerType,
                        EnumDisplayName: enumDisplayName,
                        SelectedQuery: selectedQuery,
                        Answer: answer,
                        Prompt: item["@Prompt"],
                        ControlType: controlType,
                        OutputType: item.ControlConfiguration.AddressableOutputs != undefined ? item.ControlConfiguration.AddressableOutputs.AddressableOutput["@OutputType"] : ""
                    });
                }

            }
        });

        
        if (this.state.isARO) {
            let index, nextIndex = 0;
            let pages = this.state.pages;

            let pageLenght = pages.length - 1;
            for (let i in pages) {
                let page = pages[i];
                if (page.isActive) {
                    index = parseInt(i);
                    break;
                }
            }

            if (action == this.action.next && isCurrentPageValid) {

                nextIndex = index + 1;

                if (nextIndex == pageLenght) {
                    btnSave.removeAttr("disabled");
                    btnNext.attr("disabled", "");

                }
                else {
                    btnSave.attr("disabled", "");
                    btnNext.removeAttr("disabled");
                }


                if (nextIndex <= pageLenght) {
                    btnPrev.removeAttr("disabled");
                    pages[index].isActive = false;
                    pages[nextIndex].isActive = true;
                }

            } else if (action == this.action.previous) {
                nextIndex = index - 1;

                btnSave.attr("disabled", "");
                btnNext.removeAttr("disabled");

                if (nextIndex == 0) {
                    btnPrev.attr("disabled", "");

                }
                else {
                    btnPrev.removeAttr("disabled");
                }

                if (nextIndex >= 0) {
                    pages[index].isActive = false;
                    pages[nextIndex].isActive = true;
                }
            } else if (action == this.action.save && isCurrentPageValid) {

                if (this.ciresonDetails != undefined && this.isWatchlistEnabled) {
                    let index = model.AnswerCollection.length - 1;
                    let watchList = model.AnswerCollection[index].SelectedQuery;
                    if (watchList != "") {
                        let watchListAnswers = JSON.parse(watchList);
                        watchListAnswers.map(watch => {
                            model.WatchListUserIds.push(watch.BaseId);
                        });
                        model.AnswerCollection.splice(index, 1);
                    }

                }
                this.saveNow(model);
            }

            this.setState({
                pages: this.state.pages.map(page => {
                    return page;
                })
            });
        }
        else
        {
            if (isCurrentPageValid) {
                this.saveNow(model);
            }
        }
        

        if (!isCurrentPageValid){
            app.lib.message.add(localization.PleaseCorrectErrors, "danger");
            app.lib.message.show();

            //animate scroll to top
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: 0
                }, 300);
            }, 100);
        }
        
        this.setState({
            prompts: this.state.prompts.map(prompt => { return prompt; })
        });
        

        
    }

    saveNow(model) {
        app.lib.mask.apply();
        roService.ProcessData(pageForm.ViewModel, pageForm.PresentationMappingTemplate, model);

        var postData = encodeURIComponent(JSON.stringify({
            isDirty: true,
            current: pageForm.ViewModel,
            original: {},
            RequestOfferingId: model.Id
        }));

        $.ajax({
            type: 'POST',
            dataType: 'text',
            url: "/SC/ServiceCatalog/SaveRequestOfferingNew",
            data: "formJson=" + postData,
            success: function (data, status, xhr) {
                data = JSON.parse(data);
                let link = "";
                if (data.success) {
                    setTimeout(function (e) {
                        let id = pageForm.ViewModel.Id;
                        let wType = pageForm.ViewModel.ClassName;
                        if (wType.indexOf("ChangeRequest") != -1)
                            link = "/ChangeRequest/Edit/" + id + "/";

                        else if (wType.indexOf("ServiceRequest") != -1)
                            link = "/ServiceRequest/Edit/" + id + "/";

                        else if (wType.indexOf("Incident") != -1)
                            link = "/Incident/Edit/" + id + "/";

                        else if (wType.indexOf("Problem") != -1)
                            link = "/Problem/Edit/" + id + "/";

                        else if (wType.indexOf("ReleaseRecord") != -1)
                            link = "/ReleaseRecord/Edit/" + id + "/";

                        app.lib.message.add(localization.RequestCreated + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + id + "</strong></a> ", "success");
                        app.events.publish('ROSubmitted', JSON.stringify(model));
                        $("input").val(""); //Clear all text field
                        location.href = "/View/c5161e06-2378-4b44-aa89-5600e2d3b9d8";
                    }, 100);
                }
                else {
                    app.lib.mask.remove();
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Failed,
                        message: JSON.parse(data[3]).message,
                        icon: "fa fa-times-circle text-danger"
                    });
                }


            },
            error: function (xhr, ajaxOptions, thrownError) {
                kendo.ui.ExtAlertDialog.show({
                    title: localization.Warning,
                    message: localization.ErrorOccured
                });
                app.lib.mask.remove();
            },
            processData: false,
            async: true
        });
    }

    validateText(answer, prompt) {
        if (prompt.ControlConfiguration.Configuration != undefined) {
            let config = prompt.ControlConfiguration.Configuration.Details;
            if (config.LimitStringLength == "true") {
                if (answer.length < parseInt(config.MinimumLength)) {
                    prompt.invalidMsg = localization.MinimumTextLengthRequired;
                    return false;
                }
                else if (answer.length > parseInt(config.MaximumLength)) {
                    prompt.invalidMsg = "Maximum length is " + config.MaximumLength;
                    return false;
                }
            }
            else if (config.SelectedContentConstraint == "EmailAddress") {
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(answer)) {
                    prompt.invalidMsg = localization.InvalidEmailAddress;
                    return false;
                }
            }
            else if (config.SelectedContentConstraint == "PhoneNumber") {
                let re = /^(?:\s*)\d{3}-\d{3}-\d{4}(?:\s*)$/;
                if (!re.test(answer)) {
                    prompt.invalidMsg = localization.InvalidPhoneNumber;
                    return false;
                }
            }
            else if (config.SelectedContentConstraint == "InternationalPhoneNumber") {
                let re = /^\+(?:[0-9] ?){6,14}[0-9]$/;
                if (!re.test(answer)) {
                    prompt.invalidMsg = localization.InvalidIntPhoneNumber;
                    return false;
                }
            }
            else if (config.SelectedContentConstraint == "URL") {
                let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                if (!re.test(answer)) {
                    prompt.invalidMsg = localization.InvalidUrl;
                    return false;
                }
            }
            else if (config.SelectedContentConstraint == "RegularExpression") {
                let re = new RegExp(config.RegularExpression);
                if (!re.test(answer)) {
                    prompt.invalidMsg = config.RegularExpressionToolTip;
                    return false;
                }
            }
        }
        
        return true;
    }

    

    createPromptFields(prompt) {
        let fields = [];
        let id = "prompt" + prompt["@Id"].replace(/-/g, "");
        switch (prompt["@ControlType"]) {
            case ControlTypes.String:
                fields.push(<Text key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.Double:
            case ControlTypes.Integer:
                fields.push(<Numeric key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.DateTime:
                fields.push(<DateTime key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.List:
                fields.push(<Enum key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.InlineList:
                fields.push(<DropdownList key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.Boolean:
                fields.push(<Bool key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
            case ControlTypes.InstancePicker:
                fields.push(<Query key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} isNewQueryPicker={this.props.isNewQueryPicker=="True"} />);
                break;
            case ControlTypes.FileAttachment:
                fields.push(<File key={id} id={id} data={prompt} observable={this.boundObj} prompts={this.state.prompts} _this={this} />);
                break;
        }

        return fields;
    }

    render() {
        let sections = [];
        let wizardSection = [];
        let fields = [];
        let returnDisplay;

        if (this.state.isARO) {
            if (!this.isDirectLink) {
                let pages = this.state.pages;
                if (pages != null) {
                    pages.map((page, index) => {
                        fields = [];
                        
                        let pagePrompts = []
                        if (Array.isArray(page.Prompt)) {
                            pagePrompts = page.Prompt;
                        }
                        else {
                            pagePrompts.push(page.Prompt);
                        }
                        
                        pagePrompts.map(promptId => {

                            let prompt = _.find(this.state.prompts, function (item) {
                                return promptId["@PromptId"] == item["@Id"];
                            });

                            fields.push(this.createPromptFields(prompt));

                        });

                        wizardSection.push(<li pageId={page["@Name"]} class={(page.isActive ? " active " : "")}><a><span>{index + 1}</span>{page["@Name"]}</a></li>);
                        sections.push(<section pageId={page["@Name"]} class={(page.isActive ? "" : " hide ")}><div class="page-panel">{fields}</div></section>);
                    });

                }
                else {
                    this.state.prompts.map((item) => {
                        if (item["@Id"] != "00000000-0000-0000-0000-000000000000") {
                            fields.push(this.createPromptFields(item));
                        }
                    });
                }
            }

            returnDisplay = (this.isDirectLink) ?
                <div class="panel">
                    <div class="col-md-8 col-xs-12">
                        <a href={this.directLinkUrl} target="_self">{this.directLinkUrl}</a>
                        <div>{this.directLinkDescription}</div>
                    </div>
                </div>
                :
                <div class="page form-wizard">
                    <ul class="form-wizard-levels">
                        {wizardSection}
                    </ul>
                    <article>
                        {sections}
                    </article>
                </div>;
        }
        else {
            this.state.prompts.map(prompt => {
                fields.push(this.createPromptFields(prompt));
            });

            returnDisplay =
            <div class="panel">
                <div class="page-panel">{fields}</div>
            </div>;
        }
        

        
        
        return (<form id="" name="roForm" data-role="validator" novalidate="novalidate" class="">
            <div class="ro-form">
                {returnDisplay}
            </div>
        </form>);
    }
}

export default App;