import React, { Component } from 'react';
import { Calendar } from '@progress/kendo-react-dateinputs';
import { QueryResultToken, ProcessConditionalPrompt } from '../common/EventPrompt';



class Text extends Component {

    state = {
        testlang:""
    };
    timeoutChange = setTimeout(function () { },1);

    constructor(props, state) {
        super(props, state);

        
        
    }

    componentDidMount() {
        //let boundObj = this.props.observable;
        //boundObj.set(this.props.id, null);


        //app.controls.apply($("#" + this.props.id), {
        //    vm: boundObj, bind: true, localize: true
        //});
    }

    inputChange(e) {
        var input = $('#' + this.props.id);
        var areaVal = $('#textArea' + this.props.id).val()
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');

        //set the hidden value
        input.val(areaVal);
        //input.change();

        QueryResultToken(this);

        let mainAppContext = this.props._this;
        if (mainAppContext.state.isARO) {
            ProcessConditionalPrompt(this.props.prompts, this.props._this);
        }
    }

    render() {
        let iSRequired = this.props.data["@Optional"] == "false";
        let isReadOnly = this.props.data["@ReadOnly"] == "true";
        let maxlength;

        if (this.props.data.ControlConfiguration.Configuration != undefined) {
            let config = this.props.data.ControlConfiguration.Configuration.Details;
            if (config.LimitStringLength == "true") {
                maxlength = config.MaximumLength;
            }
        }

        //do not set to required if read-only
        if (isReadOnly) {
            iSRequired = false;
        }
        
        return (
            <div class={(this.props.data.ConditionalShow ? "" : " hide ") + "row question-container"}>
                <div id={"cont" + this.props.id} class="col-md-4 col-xs-12">
                    <label class="control-label cs-form__datetime--label" for={this.props.id}>
                        <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                        <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg }</span>
                    </label>
                    <div class={(isReadOnly ? "hide" : "")}>
                        <input type="text" id={this.props.id} maxlength={maxlength} class="hide" />
                        <textarea id={"textArea" + this.props.id} class="k-textbox k-invalid input-ro form-control input-sm" rows="1" maxlength={maxlength} onChange={(e) => { this.inputChange(e); }}></textarea>
                    </div>
                </div>

            </div>
        );
    }
}

export default Text;