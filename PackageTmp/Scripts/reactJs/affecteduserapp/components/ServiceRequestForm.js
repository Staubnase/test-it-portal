import React, { useState, useEffect } from 'react';
import { Form, FormElement } from '@progress/kendo-react-form';
import { DropDownList } from "@progress/kendo-react-dropdowns";
import 'regenerator-runtime/runtime'

const ServiceRequestForm = (props) => {
    const [titleValue, setTitleValue] = useState(props.data.Title);
    const [descriptionValue, setDescriptionValue] = useState(props.data.Description);
    const [alternateContactValue, setAlternateContactValue] = useState(props.data.AlternateContact);
    const [templateValue, setTemplateValue] = useState({ Id: "03bc9162-041f-c987-8ce4-a5547cd9ca04", Name: "Default Service Request Template" });
    const [templateList, setTemplateList] = useState([]);

    const updateTextProperty = (event) => {
        switch (event.target.name) {
            case "title":
                props.data.Title = event.target.value;
                setTitleValue(event.target.value);
                break;
            case "description":
                props.data.Description = event.target.value;
                setDescriptionValue(event.target.value);
                break;
            case "altcontact":
                props.data.AlternateContact = event.target.value;
                setAlternateContactValue(event.target.value);
                break;
            default:
                break;
        }
    }

    const udpateTemplateProperty = (event) =>{
        props.data.TemplateId = event.target.value.Id;
        setTemplateValue(event.target.value);
    }

    const updateObjectProperty = (name, value) => {
        switch (name) {
            case "priority":
                props.data.Priority = value;
                break;
            case "impact":
                props.data.Impact = value;
                break;
            case "urgency":
                props.data.Urgency = value;
                break;
            case "source":
                props.data.Source = value;
                break;
            case "area":
                props.data.Area = value;
                break;
            case "classification":
                props.data.Classification = value;
                break;
            case "supportgroup":
                props.data.SupportGroup = value;
                break;
            case "tierqueue":
                props.data.TierQueue = value;
                break;
            case "assignedUser":
                props.data.AssignedUser = value;
                break;
            case "affectedUser":
                props.data.AffectedUser = value;
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        props.data.TemplateId = "03bc9162-041f-c987-8ce4-a5547cd9ca04";
        props.data.Type = "SR";
        props.methods.addCreateButton();

        //Set kendo view model value for enumpicker binding
        let boundObj = kendo.observable({});
        boundObj.set("urgency", props.data.Urgency);
        boundObj.set("supportgroup", props.data.Urgency);
        boundObj.set("area", props.data.Area);
        boundObj.set("source", props.data.Source);
        boundObj.set("priority", props.data.Priority);

        //Set kendo view model value for userpicker binding
        boundObj.set("assignedUser", props.data.AssignedUser);
        boundObj.set("affectedUser", props.data.AffectedUser);

        app.controls.apply($('#root'), {
            vm: boundObj, bind: true, localize: true
        });

        boundObj.bind("change", function (e) {            
            let propertyName = e.field.split('.')[0];
            let propertyValue = e.sender[propertyName] || e.sender.source[propertyName] //{Id: "", Name: ""};

            if (!_.isUndefined(propertyValue.BaseId)) {
               updateObjectProperty(propertyName, { BaseId: propertyValue.BaseId, DisplayName: propertyValue.DisplayName });
            } else {
               updateObjectProperty(propertyName, { Id: propertyValue.Id, Name: propertyValue.Name });
            }
        });

        async function populateTemplateList() {
            let classId = "04b69835-6343-4de2-4b19-6be08c612989"; //service request
            let url = "http://localhost:13463/api/V3/Template/GetTemplates?classId=" + classId;
            const response = await fetch(url);
            const result = await response.json();
            setTemplateList(result);
        }
        populateTemplateList();
    });

    

   
    
    return (
        <Form
            render={(formRenderProps) => (
                <FormElement>
                    <fieldset className={"k-form-fieldset"}>
                        <div class={"page-form"}>
                            <div class={"form-panel"}>
                                <div class="row formrow">
                                    <div class="col-md-4">
                                        <label data-localize="AffectedUser"></label>
                                        <div class="editor-field">
                                            <input class="form-group" data-control="userPicker" data-bind="value: affectedUser" data-control-bind="affectedUser" data-control-target="affectedUser" data-control-itemtype="ServiceRequest"></input>
                                         </div>
                                    </div>
                                    <div class="col-md-8">
                                        <label data-localize="AlternateContact"></label>
                                        <input type="text" name='altcontact' value={alternateContactValue} onChange={updateTextProperty} />
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-12">
                                        <label data-localize="Title"></label>
                                        <input type="text" name='title' value={titleValue} onChange={updateTextProperty} />
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-12">
                                        <label data-localize="Description"></label>
                                        <input type="text" name='description' value={descriptionValue} onChange={updateTextProperty} />
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="Priority"></label>
                                        <div data-control="enumPicker" name='priority' data-control-bind="priority" data-control-valuetargetid="priority" data-control-enumid="d55e65ea-fae9-f7db-0937-843bfb1367c0"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="Urgency"></label>
                                        <div data-control="enumPicker" data-control-bind="urgency" data-control-valuetargetid="urgency" data-control-enumid="eb35f771-8b0a-41aa-18fb-0432dfd957c4"></div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="SupportGroup"></label>
                                        <div data-control="enumPicker" data-control-bind="supportgroup" data-control-valuetargetid="supportgroup" data-control-enumid="23c243f6-9365-d46f-dff2-03826e24d228"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="AssignedUser"></label>
                                        <div class="editor-field">
                                            <input class="form-group" data-control="userPicker" data-bind="value: assignedUser" data-control-bind="assignedUser" data-control-target="assigneduser" data-control-itemtype="ServiceRequest"></input>
                                        </div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="Category"></label>
                                        <div data-control="enumPicker" data-control-bind="area" data-control-valuetargetid="area" data-control-enumid="3880594c-dc54-9307-93e4-45a18bb0e9e1"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="Source"></label>
                                        <div data-control="enumPicker" data-control-bind="srsource" data-control-valuetargetid="srsource" data-control-enumid="848211a2-393a-6ec5-9c97-8e1e0cfebba2"></div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="TemplateText"></label>
                                        <DropDownList
                                            data={templateList}
                                            textField="Name"
                                            dataItemKey="Id"
                                            value={templateValue}
                                            onChange={udpateTemplateProperty}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </FormElement>
            )}
        />
    );
};

export default ServiceRequestForm

