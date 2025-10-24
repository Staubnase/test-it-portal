import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { QueryResultDependentChange } from '../common/EventPrompt';


class File extends Component {
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

        console.log("this.props", this.props._this.props.offeringId);
    }

    render() {
        
        let iSRequired = this.props.data["@Optional"] == "false";
        return (


            <div id={this.props.id} class={"row question-container " + (this.props.data.ConditionalShow ? "" : " hide ")}>
                    <input type="hidden" class="question-baseid" value={this.props.data["@Id"]} />
                    <input type="hidden" class="question-answer-type" value="FileAttachment" />
                    <input type="hidden" class="question-answer-id" value={this.props.id} />
                    <div class="col-md-12 col-xs-12">
                        <label class="control-label">
                            <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                            <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                        </label>
                        <div class="form-group">
                            <input required name={this.props.id} type="hidden" id={this.props.id} value="" />
                            <input name={this.props.id} type="hidden" id={"Json"+this.props.id} value="" />
                            <div
                                data-control="fileAttachmentGrid"
                                data-control-valuetargetid={this.props.id}
                            data-control-url={"/FileAttachment/UploadRequestOfferingFile/" + this.props._this.props.offeringId}
                                required
                            ></div>
                        </div>
                    </div>
                </div>

        );
    }
}

export default File;