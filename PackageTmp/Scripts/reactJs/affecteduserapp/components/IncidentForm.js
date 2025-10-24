import React, { useState, useEffect  } from 'react';
import { Form,  FormElement } from '@progress/kendo-react-form';
import { DropDownList } from "@progress/kendo-react-dropdowns";
import 'regenerator-runtime/runtime'

const IncidentForm = (props) => {

    const [titleValue, setTitleValue] = useState(props.data.Title);
    const [descriptionValue, setDescriptionValue] = useState(props.data.Description);
    const [alternateContactValue, setAlternateContactValue] = useState(props.data.AlternateContact);
    const [templateValue, setTemplateValue] = useState({ Id: "a77bb0c9-e201-dd93-230c-799a66d9e8fa", Name: "Default Incident Template" });
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
    const udpateTemplateProperty = (event) => {
        props.data.TemplateId = event.target.value.Id;
        setTemplateValue(event.target.value);
    }

    useEffect(() => {
        props.data.TemplateId = "a77bb0c9-e201-dd93-230c-799a66d9e8fa";
        props.data.Type = "IR";
        props.methods.addCreateButton();

        //Set kendo view model value for enumpicker binding
        var boundObj = kendo.observable({});
        boundObj.set("impact", props.data.Impact);
        boundObj.set("urgency", props.data.Urgency);
        boundObj.set("tierqueue", props.data.TierQueue);
        boundObj.set("source", props.data.Source);
        boundObj.set("classification", props.data.Classification);
        
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
            let classId = "a604b942-4c7b-2fb2-28dc-61dc6f465c68"; //incident
            let url = "http://localhost:13463/api/V3/Template/GetTemplates?classId=" + classId;
            const response = await fetch(url);
            const result = await response.json();
            setTemplateList(result);
        }
        populateTemplateList();
    },[]);


   
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
                                            <input class="form-group" data-control="userPicker" data-bind="value: affectedUser" data-control-bind="affectedUser" data-control-target="affectedUser" data-control-itemtype="incident"></input>
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
                                        <label data-localize="Impact"></label>
                                        <div data-control="enumPicker" data-control-bind="impact" data-control-valuetargetid="impact" data-control-enumid="11756265-f18e-e090-eed2-3aa923a4c872"></div>

                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="Urgency"></label>
                                        <div data-control="enumPicker" data-control-bind="urgency" data-control-valuetargetid="urgency" data-control-enumid="04b28bfb-8898-9af3-009b-979e58837852"></div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="SupportGroup"></label>
                                        <div data-control="enumPicker" data-control-bind="tierqueue" data-control-valuetargetid="tierqueue" data-control-enumid="c3264527-a501-029f-6872-31300080b3bf"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="AssignedUser"></label>
                                        <div class="editor-field">
                                            <input class="form-group" data-control="userPicker" data-bind="value: assignedUser" data-control-bind="assignedUser" data-control-target="assignedUser" data-control-itemtype="incident"></input>
                                        </div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="Category"></label>
                                        <div data-control="enumPicker" data-control-bind="classification" data-control-valuetargetid="classification" data-control-enumid="1f77f0ce-9e43-340f-1fd5-b11cc36c9cba"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label data-localize="Source"></label>
                                        <div data-control="enumPicker" data-control-bind="source" data-control-valuetargetid="source" data-control-enumid="5d59071e-69b3-7ef4-6dee-aacc5b36d898"></div>
                                    </div>
                                </div>
                                <div class="row formrow">
                                    <div class="col-md-6">
                                        <label data-localize="TemplateText"></label>
                                        <DropDownList
                                            data={templateList}
                                            defaultValue={templateList[0]}
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

export default IncidentForm

