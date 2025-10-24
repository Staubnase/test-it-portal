import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { QueryResultToken, ProcessConditionalPrompt } from '../common/EventPrompt';


class DropdownList extends Component {
    contId = null;
    _this=null;
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    componentDidMount() {
        this._this = this;
    }

    onChange(e) {
        QueryResultToken(e.target.base.component.props.mainProps);

        let mainAppContext = e.target.base.component.props.mainProps.props._this;
        if (mainAppContext.state.isARO) {
            ProcessConditionalPrompt(e.target.base.component.props.mainProps.props.prompts, mainAppContext);
        }
    }

    render() {
        let iSRequired = this.props.data["@Optional"] == "false";
        this.contId = "dropdownlist" + this.props.id;
        const listItem = [""];
        let listValues = this.props.data.ControlConfiguration.Configuration.Details.ListValue;
        if (listValues != null && listValues != undefined) {
            if (Array.isArray(listValues)) {
                listValues.map(item => {
                    listItem.push(item["@DisplayName"]);
                });
            }
            else {
                listItem.push(listValues["@DisplayName"]);
            }
        }
        


      

        return (
            <div class={(this.props.data.ConditionalShow ? "" : " hide ") + "row question-container"}>
                <div class="col-md-4 col-xs-12">
                    <label class="control-label cs-form__datetime--label" for={this.props.id}>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid && iSRequired ? "" : " hide ")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                    </label>
                    <DropDownList id={this.props.id} data={listItem} mainProps={this} onChange={this.onChange} />
                </div>
            </div>
        );
    }
    

}

export default DropdownList;