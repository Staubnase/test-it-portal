import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { QueryResultDependentChange } from '../common/EventPrompt';


class Bool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        };
    }

    componentDidMount() {
        let boundObj = this.props.observable;
        boundObj.set(this.props.id, false);

        app.controls.apply($("#" + this.props.id), {
            vm: boundObj, bind: true, localize: true
        });

        QueryResultDependentChange(this, boundObj);
    }

    render() {
        let iSRequired = this.props.data["@Optional"] == "false";
        return (
            <div class={(this.props.data.ConditionalShow ? "" : "hide")}>
                <div class="checkbox checkbox-inline cs-form__checkbox__div">
                    <input type="checkbox" class="cs-form__checkbox--input"
                        name={ this.props.id }
                        id={this.props.id}
                        data-bind={"checked:" + this.props.id} />

                    <label class="control-label cs-form__checkbox--label-inline" for={this.props.id}>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid && iSRequired ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                    </label>
                </div>
            </div>
        );
    }
}

export default Bool;