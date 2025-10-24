import React, { Component } from 'react';

var timeoutChange = setTimeout(function () { }, 1);
var timeoutChange2 = setTimeout(function () { }, 1);

export const ControlTypes = {
    String: "System.SupportingItem.PortalControl.String",
    List: "System.SupportingItem.PortalControl.List",
    InlineList: "System.SupportingItem.PortalControl.InlineList",
    Double: "System.SupportingItem.PortalControl.Double",
    Integer: "System.SupportingItem.PortalControl.Integer",
    DateTime: "System.SupportingItem.PortalControl.DateTime",
    Boolean: "System.SupportingItem.PortalControl.Boolean",
    InstancePicker: "System.SupportingItem.PortalControl.InstancePicker",
    FileAttachment: "System.SupportingItem.PortalControl.FileAttachment"
};

export const QueryResultDependentChange = (_this, boundObj) => {
    boundObj.bind("change", function (e) {
        if (e.field == _this.props.id) {
            QueryResultToken(_this);
            let mainAppContext = _this.props._this;
            if (mainAppContext.state.isARO) {
                ProcessConditionalPrompt(_this.props.prompts, mainAppContext);
            }
        }
    });
}


export const ProcessConditionalPrompt = (prompts, mainAppContext) => {
    clearTimeout(timeoutChange2);
    timeoutChange2 = setTimeout(function (){
        let answer = "";
        let id = "";
                
        prompts.map(conditionPrompt => {
            if (conditionPrompt["@Id"] != "00000000-0000-0000-0000-000000000000") {
                            
                let cireson = conditionPrompt.ControlConfiguration.Configuration.Details.Cireson.Show;
                if (cireson["@When"] != "Always") {
                    let arrCondition = [];
                    if (Array.isArray(cireson.Condition)) {
                        arrCondition = cireson.Condition;
                    }
                    else {
                        let tempCondition = {};
                        for (let i in cireson.Condition) {
                            tempCondition[i] = cireson.Condition[i];
                        }

                        arrCondition.push(tempCondition);
                    }

                    for (let i in arrCondition) {
                        let isBreak = false;
                        let condition = arrCondition[i];
                        let operator = condition["@Operator"];
                        let propertyId = condition["@PropertyId"];
                        id = "prompt" + propertyId.replace(/-/g, "");
                        
                        let value = condition["@Value"];
                        conditionPrompt.ConditionalShow = true;

                        let conditionPromptDetails = _.find(prompts, function (prompt) {
                            return prompt["@Id"] == propertyId;
                        });

                        let controlType = conditionPromptDetails["@ControlType"];
                        let isAnswerOk = true;
                        switch (controlType) {
                            case ControlTypes.String:
                                answer = $("#" + id).val().toLowerCase();
                                value = value.toLowerCase();
                                break;
                            case ControlTypes.InlineList:
                                answer = $("#" + id).find(".k-input").html().toLowerCase();
                                break;
                            case ControlTypes.List:
                                let enumAnswer = mainAppContext.boundObj.get(id);
                                answer = enumAnswer.Id.toLowerCase();
                                value = value.toLowerCase();
                                break;
                            case ControlTypes.Double:
                            case ControlTypes.Integer:
                                answer = parseFloat(mainAppContext.boundObj.get(id));
                                value = parseFloat(value);
                                break;
                            case ControlTypes.DateTime:
                                let isRelative = condition["@IsRelative"];
                                let _answer = new Date(mainAppContext.boundObj.get(id));
                                if (isRelative != undefined && isRelative == "True") {
                                    let relativeOffsetValue = condition["@RelativeOffsetValue"] == undefined ? 0 : parseInt(condition["@RelativeOffsetValue"]);
                                    let dtm = new Date();
                                    let curMonth = dtm.getMonth();
                                    let curYear = dtm.getFullYear();
                                    let curDate = dtm.getDate();
                                    let curDtm = new Date(curYear, curMonth, curDate);
                                    switch (value) {
                                        //case "Today":
                                        //    curDtm = curDtm.getTime();
                                        //    break;
                                        case "Yesterday":
                                            curDtm.setDate(curDate - 1);
                                            break;
                                        case "Tomorrow":
                                            curDtm.setDate(curDate + 1);
                                            break;
                                       case "DaysAgo":
                                            curDtm.setDate(curDate - relativeOffsetValue);
                                            break;
                                        case "DaysFromNow":
                                            curDtm.setDate(curDate + relativeOffsetValue);
                                            break;
                                        case "MonthsAgo":
                                            curDtm.setMonth(curMonth - relativeOffsetValue);
                                            break;
                                        case "MonthsFromNow":
                                            curDtm.setMonth(curMonth + relativeOffsetValue);
                                            break;
                                        case "YearsAgo":
                                            curDtm.setFullYear(curYear - relativeOffsetValue);
                                            break;
                                        case "YearsFromNow":
                                            curDtm.setFullYear(curYear + relativeOffsetValue);
                                            break;
                                        case "FirstDayOfMonth":
                                            curDtm = new Date(curYear, curMonth, 1);
                                            break;
                                        case "FirstDayOfYear":
                                            curDtm = new Date(curYear, 0, 1);
                                            break;
                                        case "LastDayOfMonth":
                                            curDtm = new Date(curYear, curMonth+1, 0);
                                            break;
                                        case "LastDayOfYear":
                                            curDtm = new Date(curYear, 11, 31);
                                            break;
                                        case "FirstDayOfQuarter":
                                            if (curMonth >= 0 && curMonth <= 2)
                                                curDtm = new Date(curYear, 0, 1);
                                            else if (curMonth >= 3 && curMonth <= 5)
                                                curDtm = new Date(curYear, 3, 1);
                                            else if (curMonth >= 6 && curMonth <= 8)
                                                curDtm = new Date(curYear, 6, 1);
                                            else if (curMonth >= 9 && curMonth <= 11)
                                                curDtm = new Date(curYear, 9, 1);

                                            break;
                                        case "LastDayOfQuarter":
                                            if (curMonth >= 0 && curMonth <= 2)
                                                curDtm = new Date(curYear, 3, 0);
                                            else if (curMonth >= 3 && curMonth <= 5)
                                                curDtm = new Date(curYear, 6, 0);
                                            else if (curMonth >= 6 && curMonth <= 8)
                                                curDtm = new Date(curYear, 9, 0);
                                            else if (curMonth >= 9 && curMonth <= 11)
                                                curDtm = new Date(curYear, 12, 0);

                                            break;
                                        
                                        
                                    }
                                    value = curDtm.getTime();
                                    answer = _answer.getTime();
                                }
                                else {
                                    answer = (_answer).getTime();
                                    value = (new Date(value)).getTime();
                                }

                                
                                

                                if (answer == 0) isAnswerOk = false;
                                break;
                            case ControlTypes.Boolean:
                                answer = mainAppContext.boundObj.get(id).toString().toLowerCase();
                                value = value.toString().toLowerCase();
                                break;
                            case ControlTypes.InstancePicker:
                                answer = $("#" + id).val();
                                break;
                            default:
                                answer = mainAppContext.boundObj.get(id);
                                break;
                        }

                        if (answer == null) {
                            answer = "";
                        }

                        if (controlType == ControlTypes.InstancePicker) {
                            conditionPrompt.ConditionalShow = false;
                            if (operator == "AdvanceQuery") {
                                if (condition.Answer == undefined) {
                                    let xmlDoc = $($.parseXML(condition["#text"])).find('Freeform');
                                    const requestMetadata = {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            isProjection: condition["@IsProjection"] == "True",
                                            classOrProjectionId: condition["@ClassOrProjectionId"],
                                            criteria: xmlDoc.html()
                                        })
                                    };

                                    fetch("/SC/ServiceCatalog/GetItemIdListAdvanceQuery", requestMetadata)
                                        .then(res => res.json())
                                        .then((result) => {
                                            if (!Array.isArray(cireson.Condition)) {
                                                value = cireson.Condition.Answer = result.data;
                                            }
                                            else {
                                                value = condition.Answer = result.data;
                                            }
                                        },
                                            (error) => { });
                                }
                                else {
                                    value = condition.Answer;
                                }
                                                    
                            }

                            if (value != undefined) {
                                let conditionIds = value.split(",");
                                for (let i in conditionIds) {
                                    if (operator == "Contains" || operator == "AdvanceQuery") {
                                        if (answer.includes(conditionIds[i])) {
                                            isBreak = true;
                                            conditionPrompt.ConditionalShow = true;
                                            break;
                                        }
                                    }
                                    else if (operator == "Equals") {
                                        if (!answer.includes(conditionIds[i])) {
                                            isBreak = true;
                                            conditionPrompt.ConditionalShow = false;
                                            break;
                                        } else conditionPrompt.ConditionalShow = true;
                                    }
                                }
                            }
                        } else {
                            value = value.toLowerCase();
                            answer = answer.toLowerCase();

                            if (operator == "Equals" && value == answer) isBreak = true;
                            else if (operator == "NotEquals" && value != answer) isBreak = true;
                            else if (operator == "Contains" && answer != "" && value.includes(answer)) {
                                isBreak = true;
                            }
                            else if (operator == "LessThan" && value > answer) isBreak = true;
                            else if (operator == "LessOrEqual" && value >= answer) isBreak = true;
                            else if (operator == "GreaterThan" && value < answer) isBreak = true;
                            else if (operator == "GreaterOrEqual" && value <= answer) isBreak = true;
                            else if (operator == "Between") {
                                let endValue = new Date(condition["@EndValue"]);
                                if (value < answer && endValue > answer) { }
                                else conditionPrompt.ConditionalShow = false;

                                isBreak = true;
                            }
                            else if (operator == "MatchesRegex") {
                                let re = new RegExp(value);
                                if (re.test(answer)) { }
                                else {
                                    conditionPrompt.ConditionalShow = false;
                                }
                                isBreak = true;
                            } else {
                                conditionPrompt.ConditionalShow = false;
                            }
                                                    
                        }

                        if (isAnswerOk && conditionPromptDetails.ConditionalShow) {
                            if (cireson["@When"] == "False") {
                                conditionPrompt.ConditionalShow = !conditionPrompt.ConditionalShow;
                            }

                            if (cireson["@LogicalOperator"] == "Or") {
                                if (isBreak) break;
                            }
                            else {
                                if (isBreak == false) break;
                            }
                        }
                        else {
                            conditionPrompt.ConditionalShow = false;
                        }


                        
                        
                    }

                }
                else {
                    conditionPrompt.ConditionalShow = true;
                }           
            }
        });
                


                

            

        //This will going to update all prompt state
        mainAppContext.setState({
            prompts: mainAppContext.state.prompts.map(prompt => {
                //if (prompt["@Id"] == promptAnswer["@Id"]) {
                //    //prompt.ConditionalShow = promptAnswer.ConditionalShow;
                //}
                return prompt;
            })
        });
    }, 100);
    
}

export const QueryResultToken = (_this, selectedQueryResult) => {
    clearTimeout(timeoutChange);
    timeoutChange = setTimeout(function () {

        

        _this.props.prompts.map(prompt => {
            let controlType = prompt["@ControlType"];
            if (controlType == ControlTypes.InstancePicker && controlType != ControlTypes.PortalControl) {
                if (prompt.DependencyPrompt != undefined && prompt.DependencyPrompt.includes(_this.props.data["@Id"])) {

                    let queryId = "prompt" + prompt["@Id"].replace(/-/g, "")
                    let config = prompt.ControlConfiguration.Configuration.Details;
                    let xmlDoc = $($.parseXML(config.Criteria)).find('Freeform');
                    let kendoGrid = $('[data-control-valuetargetid="' + queryId + '"]').data("kendoGrid");
                    let isKendoGrid = true;
                    if (kendoGrid == undefined) {
                        kendoGrid = $('[data-control-valuetargetid="' + queryId + '"]').find('[data-role="multiselect"]').data("kendoMultiSelect");
                        isKendoGrid = false;
                    }
                    

                    let criteria = xmlDoc.html();
                    let token = null;
                    let tokenEnd = "##&lt;/Token&gt;";
                    prompt.DependencyPrompt.map(promptId => {
                        let answer = "";
                        let id = "prompt" + promptId.replace(/-/g, "");

                        let answerPrompt = _.find(_this.props.prompts, function (prmp) {
                            return prmp["@Id"] == promptId;
                        });

                        token = "&lt;Token&gt;##TokenSourceId__" + promptId + "#TokenId__";
                        

                        switch (answerPrompt["@ControlType"]) {
                            case ControlTypes.String:
                                token = token + "String" + tokenEnd;
                                answer = $("#" + id).val();
                                break;
                            case ControlTypes.Double:
                                token = token + "Doubl" + tokenEnd;
                                answer = _this.props.observable.get(id);
                                break;
                            case ControlTypes.Integer:
                                token = token + "Integer" + tokenEnd;
                                answer = _this.props.observable.get(id);
                                break;
                            case ControlTypes.DateTime:
                                token = token + "Date" + tokenEnd;
                                answer = _this.props.observable.get(id);
                                break;
                            case ControlTypes.List:
                                token = token + "List Item" + tokenEnd;
                                let enumAnswer = _this.props.observable.get(id);
                                answer = enumAnswer.Id;
                                break;
                            case ControlTypes.InlineList:
                                token = token + "ListValue" + tokenEnd;
                                answer = $("#" + id).find(".k-input").html();
                                break;
                            case ControlTypes.Boolean:
                                token = token + "True / False" + tokenEnd;
                                answer = _this.props.observable.get(id);
                                break;
                            case ControlTypes.InstancePicker:
                                let _config = answerPrompt.ControlConfiguration.Configuration.Details;
                                let columns = _config.Columns.Column;
                                if (Array.isArray(columns)) {
                                    for (var i in columns) {
                                        let col = columns[i]["@Name"];
                                        let value = "";
                                        if (selectedQueryResult[col + "_EnumId"] != undefined) {
                                            value = selectedQueryResult[col + "_EnumId"];
                                        }
                                        else {
                                            value = selectedQueryResult[col];
                                        }

                                        criteria = criteria.replace(new RegExp(token + col + tokenEnd, 'g'), value);
                                    }
                                }
                                token = null;
                                break;
                        }

                        if (answer == null)
                        {
                            answer = "";
                        }

                        if (token != null) {
                            criteria = criteria.replace(new RegExp(token, 'g'), answer);
                        }


                    });

                    if (!isKendoGrid) {
                        criteria = encodeURIComponent(criteria);
                    }

                    kendoGrid.dataSource.transport.options.read.data.criteria = criteria;
                    kendoGrid.dataSource.read();
                    
                }
            }
        });
    }, 300);

}