import React, { Component } from 'react';
import * as ReactDOM from "react-dom";
import { QueryResultToken, ProcessConditionalPrompt } from '../common/EventPrompt';


class Query extends Component {
    property = "";
    config;
    constructor(props) {
        super(props);
    }

    
    componentDidMount() {
        let _this = this;
        let boundObj = this.props.observable;
        boundObj.set(this.props.id, null);

        let container = $("#cont" + this.props.id);
        app.controls.apply(container, {
            vm: boundObj, bind: true, localize: true
        });
        let mainAppContext = _this.props._this;
        let dataControl = $('[data-control-valuetargetid="' + this.props.id + '"]');
        let grid = dataControl.data("kendoGrid");
        if (grid != undefined) {
            grid.bind("change", function (e) {
                QueryResultToken(_this, this.dataItem(e.sender.select()[0]));
                if (mainAppContext.state.isARO) {
                    ProcessConditionalPrompt(_this.props.prompts, mainAppContext);
                }
            });
        }
        else {
            //Need to put inside timeout because listview is not yet renderd
            setTimeout(function () {
                let kendoListView = dataControl.find('[data-role="listview"]').data("kendoListView");
                kendoListView.bind("dataBound", function (e) {
                    if (e.action == "rebind" || e.action == "remove") {
                        QueryResultToken(_this, e.items[e.items.length - 1]);
                        if (mainAppContext.state.isARO) {
                            ProcessConditionalPrompt(_this.props.prompts, mainAppContext);
                        }
                    }
                });
            }, 100);
        }

        
        
    }

    


    render() {
        this.config = this.props.data.ControlConfiguration.Configuration.Details;

        let isMultiSelectAllowed = this.config["@IsMultiSelectAllowed"] != undefined ? this.config["@IsMultiSelectAllowed"] : "true";
        let iSRequired = this.props.data["@Optional"] == "false";
        let dataControlType = this.props.isNewQueryPicker ? "checkboxGridByCriteria" : "checkboxGridByCriteriaOld";
        let columns = "";

        if (Array.isArray(this.config.Columns.Column))
        {
            this.config.Columns.Column.map(col => {
                let name = col["@Name"];
                let displayName = col["@DisplayName"];

                columns += displayName + "(((:)))" + name + "(((;)))";
            });
        }
        else {
            columns = this.config.Columns.Column["@DisplayName"] + "(((:)))" + this.config.Columns.Column["@Name"] + "(((;)))";
        }

        let xmlDoc = $($.parseXML(this.config.Criteria)).find('Freeform');
        return (
            <div id={"cont" + this.props.id} class={"row question-container " + (this.props.data.ConditionalShow ? "" : "hide")}>
                    <input type="hidden" class="question-baseid" value={this.props.data["@Id"]} />
                    <input type="hidden" class="question-answer-type" value="InstancePicker" />
                    <input type="hidden" class="question-answer-id" value={this.props.id} />
                    <div class="col-md-12 col-xs-12">
                        {!this.props.isNewQueryPicker &&
                            <label class="control-label querypicker">
                                <span dangerouslySetInnerHTML={{ __html: `${this.props.data["@Prompt"]} ${iSRequired && localization.RequiredUserInput}`}}></span>
                                <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                            </label>
                        }

                        {this.props.isNewQueryPicker &&
                            <label class="control-label">
                                <span class={"k-form-error k-invalid-msg " + (!this.props.data.isValid ? "" : "hide")}><span class="k-icon k-i-warning"></span>{this.props.data.invalidMsg}</span>
                            </label>
                        }


                        <div>

                            <div data-control-type="queryPicker">
                                <div data-control-type={dataControlType}>
                                    {iSRequired ?
                                    <input type="hidden" id={this.props.id} name={this.props.id} required  />
                                    :
                                    <input type="hidden" id={this.props.id} name={this.props.id} />
                                    }
                                    
                                    <input type="hidden" id={"Json" + this.props.id} name={"Json" + this.props.id} />
                                    <div data-control={dataControlType}
                                        data-control-valuetargetid={this.props.id}
                                        data-control-valuefield="Id"
                                        data-control-criteriaid={"Criteria" + this.props.id}
                                        data-control-columnsid={"Columns" + this.props.id}
                                        data-control-classorprojectionid={this.config.ClassOrProjection["@Id"]}
                                        data-control-isprojection={this.config.ClassOrProjection["@IsProjection"]}
                                        data-control-ismultiselect={isMultiSelectAllowed}
                                        data-control-sourceid={this.props.data["@Id"]}
                                        data-control-sourceprompt={this.props.data["@Prompt"]} ></div>
                                </div>
                                <input type="hidden" id={"Criteria" + this.props.id} value={xmlDoc.html()} />
                                <input type="hidden" id={"Columns" + this.props.id} value={columns} />
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}

export default Query;