import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { QueryResultDependentChange } from '../common/EventPrompt';


class Enum extends Component {
    property = "";

    constructor(props) {
        super(props);
    }

    
    componentDidMount() {
        let _this = this;
        let boundObj = this.props.observable;
        boundObj.set(this.props.id, { Id: "", Name: "" });


        app.controls.apply($("#" + this.props.id), {
            vm: boundObj, bind: true, localize: true
        });

        QueryResultDependentChange(this, boundObj);
    }


    render() {
        let enumId = this.props.data.ControlConfiguration.AddressableOutputs.AddressableOutput["@OutputTypeMetadata"];
        let iSRequired = this.props.data["@Optional"] == "false";
        return (
            <div id={this.props.id} class="row question-container">
                <div class={(this.props.data.ConditionalShow ? "" : " hide ") + "col-md-4 col-xs-12" }>
                    <label class="control-label cs-form__enum--label" for={this.props.id }>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid && iSRequired ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                    </label>

                    <div class="form-control form-control-picker input-sm cs-form__enum--dropdown"
                        data-url="/api/V3/Enum/GetList"
                        data-combourl="/api/V3/Enum/GetFlatList/"
                        data-showpath=""
                        data-mustselectleafnode=""
                        data-onChange={function () { alert("test"); }}
                        data-bind={"ciresonDropDownTree: '" + enumId + "', value: " + this.props.id }
                        data-role={this.props.id }>
                </div>

            </div>
            </div>
        );
    }
}

export default Enum;