import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import { QueryResultToken, QueryResultDependentChange } from '../common/EventPrompt';


class Numeric extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let _this = this;
        let boundObj = this.props.observable;
        boundObj.set(this.props.id, null);

        app.controls.apply($("#" + this.props.id), {
            vm: boundObj, bind: true, localize: true
        });

        QueryResultDependentChange(this, boundObj);
    }

    render() {
        let iSRequired = this.props.data["@Optional"] == "false";
        let limit = false;
        let config;
        let decimals = "2";
        if (this.props.data.ControlConfiguration.Configuration != undefined) {
            config = this.props.data.ControlConfiguration.Configuration.Details;

            limit = config.LimitDoubleRange == "true";
            
        }

        
        if (this.props.data["@ControlType"] == "System.SupportingItem.PortalControl.Integer") {
            if (config != undefined) {
                limit = config.LimitIntegerRange == "true";
            }
            
            decimals = "0";
        }
        
        
        return (
            <div class="row question-container">
                <div id={this.props.id} data-cid="NumericControl" data-cid-propname={this.props.id} class={(this.props.data.ConditionalShow ? "" : " hide ") + "col-md-4 col-xs-12"}>
                    <label class="control-label cs-form__numeric--label" for={this.props.id}>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid && iSRequired ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                    </label>
                    <input type="number"
                        name={this.props.id}
                        class={"form-control form-control-picker input-sm cs-form__numeric--input"}
                        data-control="numericTextBox"
                        data-bind={"value: " + this.props.id}
                        data-control-decimals={decimals}
                        data-control-min={limit ? config.MinimumValue : "-99999999999"}
                        data-control-max={limit ? config.MaximumValue : "99999999999"}

                        data-step="1" />
                </div>
            </div>
                
        );
    }
}

export default Numeric;