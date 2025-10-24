import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { QueryResultDependentChange } from '../common/EventPrompt';


class DateTime extends Component {
    contId = null;
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    componentDidMount() {
        let _this = this;
        
        let boundObj = this.props.observable;
        boundObj.set(this.props.id, null);
        app.controls.apply($("#" + this.props.id), {
            vm: boundObj, bind: true, localize: true
        });

        QueryResultDependentChange(this, boundObj);

        if (this.props.data.ControlConfiguration.Configuration != undefined) {
            let config = this.props.data.ControlConfiguration.Configuration.Details;

            let dtmPicker = $("#" + this.props.id).find('[data-control="dateTimePicker"]').data("kendoDateTimePicker");

            if (config.SelectedDateConstraint == "AbsoluteDateRange") {
                if (config.LimitEarliestDate == "true") {
                    dtmPicker.min(new Date(config.StartDate));
                }

                if (config.LimitLatestDate == "true") {
                    dtmPicker.max(new Date(config.EndDate));
                }
            }
            else if (config.SelectedDateConstraint == "RelativeDateRange") {
                let numberOfDaysAfterRelativeStart = parseInt(config.NumberOfDaysAfterRelativeStart);
                let relativeStartOffsetInDays = parseInt(config.RelativeStartOffsetInDays);

                var start = new Date();
                start.setDate(start.getDate() + parseInt(relativeStartOffsetInDays));
                dtmPicker.min(start);

                let end = new Date();
                end.setDate(start.getDate() + parseInt(numberOfDaysAfterRelativeStart));
                dtmPicker.max(end);
            }
        }
        
    }

    render() {
        this.contId = "datetime" + this.props.id;
        let defaultValue = new Date();
        let iSRequired = this.props.data["@Optional"] =="false";

        return (
            <div id={this.props.id} class={(this.props.data.ConditionalShow ? "" : " hide ") + "row question-container"}>
                <div class="col-md-4 col-xs-12">
                    <label class="control-label cs-form__datetime--label" for={this.props.id}>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid && iSRequired ? "" : " hide ")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                    </label>

                    <input name="PropertyName" class="cs-form__datetime--input"
                        data-control="dateTimePicker"
                        data-control-bind={this.props.id} />
                </div>
            </div>
        );
    }
    

    //render() {

    //    let defaultValue = new Date();


    //    return (
    //        <div>
    //            <div className="row">
    //                <div className="col-xs-12 col-md-12 example-col">
    //                    <p>DatePicker with default value</p>
    //                    <DatePicker defaultValue={defaultValue} />
    //                </div>
    //            </div>
    //        </div>
    //    );
    //}
}

export default DateTime;