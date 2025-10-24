import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import TaskPane from './components/TaskPane'
import IncidentForm from './components/IncidentForm'
import ServiceRequestForm from './components/ServiceRequestForm'
import 'regenerator-runtime/runtime'

const App = () => {
    const workItemData = {
        TemplateId: "",
        Type: "",
        Title: "",
        Description: "",
        AlternateContact: "",
        Priority: { Id: null, Name: null },
        Impact: { Id: null, Name: null },
        Urgency: { Id: null, Name: null },
        Area: { Id: null, Name: null },
        Classification: { Id: null, Name: null },
        SupportGroup: { Id: null, Name: null },
        TierQueue: { Id: null, Name: null },
        Source: { Id: null, Name: null },
        AssignedUser: { BaseId: null, DisplayName: null },
        AffectedUser: { BaseId: null, DisplayName: null }
    }

    const methods = {
        addCreateButton: () => {
            setTimeout(function () {
                let addIRButtonElement = document.getElementsByClassName("ci-incident");
                let addSRButtonElement = document.getElementsByClassName("ci-service-request");
                let saveButtonTile = workItemData.Type == "IR" ? "Create Incident" : "Create Service Request";

                if (addIRButtonElement.length == 1) {
                    $(addSRButtonElement).parent("button").remove();
                }

                if (addSRButtonElement.length == 1) {
                    $(addIRButtonElement).parent("button").remove();
                }

                drawermenu.addButton(saveButtonTile, "drawer-icon ci ci-service-request", function () {
                    methods.createWorkItem(workItemData);
                });

            }, 100);
        },
        createWorkItem: (dataItem) => {
            $.get("/api/V3/Projection/CreateProjectionByTemplate",
                { id: dataItem.TemplateId, createdById: session.user.Id },
                function (response, status) {
                    app.lib.mask.apply("Creating " + response.Id + "...");

                    // SHARED PROPERTIES
                    response.Title = dataItem.Title;
                    if (dataItem.Description != "") //do not send back empty value to prevent from overwriting template values
                        response.Description = dataItem.Description;
                    if (dataItem.AlternateContact != "") //do not send back empty value to prevent from overwriting template values
                        response.ContactMethod = dataItem.AlternateContact;

                    if (dataItem.Source.Id != null) {
                        response.Source.Id = dataItem.Source.Id;
                        response.Source.Name = dataItem.Source.Name;
                    }

                    if (dataItem.Urgency.Id != null) {
                        response.Urgency.Id = dataItem.Urgency.Id;
                        response.Urgency.Name = dataItem.Urgency.Name;
                    }

                    // IR PROPERTIES
                    if (dataItem.Type == "IR") {
                        if (dataItem.TierQueue.Id != null) {
                            response.TierQueue.Id = dataItem.TierQueue.Id;
                            response.TierQueue.Name = dataItem.TierQueue.Name;
                        }

                        if (dataItem.Classification.Id != null) {
                            response.Classification.Id = dataItem.Classification.Id;
                            response.Classification.Name = dataItem.Classification.Name;
                        }

                        if (dataItem.Impact.Id != null) {
                            response.Impact.Id = dataItem.Impact.Id;
                            response.Impact.Name = dataItem.Impact.Name;
                        }
                    }
                    // SR PROPERTIES
                    else if (dataItem.Type == "SR") {
                        if (dataItem.SupportGroup.Id != null) {
                            response.SupportGroup.Id = dataItem.SupportGroup.Id;
                            response.SupportGroup.Name = dataItem.SupportGroup.Name;
                        }

                        if (dataItem.Area.Id != null) {
                            response.Area.Id = dataItem.Area.Id;
                            response.Area.Name = dataItem.Area.Name;
                        }

                        if (dataItem.Priority.Id != null) {
                            response.Priority.Id = dataItem.Priority.Id;
                            response.Priority.Name = dataItem.Priority.Name;
                        }
                    }

                    if (dataItem.AffectedUser.Id != null) {
                        response.RequestedWorkItem = { "BaseId": dataItem.AffectedUser.BaseId };
                    }

                    if (dataItem.AssignedUser.Id != null) {
                        response.AssignedWorkItem = { "BaseId": dataItem.AssignedUser.BaseId };
                    }

                    var workItemID = response.Id;

                    // CREATE THE ACTUAL WORK ITEM
                    var strData = { "isDirty": true, "original": response, "current": response };

                    return $.post('/AffectedUser/Save',
                        { formJson: JSON.stringify(strData) },
                        function (result) {
                            if (result.success) {
                                let message = "";
                                let link = "";

                                switch (dataItem.Type) {
                                    case "SR":
                                        message = localization.ServiceRequestSavedMessage;
                                        link = "/ServiceRequest/Edit/" + workItemID;
                                        break;
                                    case "IR":
                                        message = localization.IncidentSavedMessage;
                                        link = "/Incident/Edit/" + workItemID;
                                        break;
                                    default:
                                        message = localization.WorkItemSavedMessage;
                                        break;

                                }
                                app.lib.message.add(message + "&nbsp;&nbsp;<a href='" + link + "'><strong>" + workItemID + "</strong></a> ", "success");
                                app.lib.handleMessages();
                                app.lib.mask.remove();
                                return workItemID;
                            }
                            else {
                                console.log(result);
                            }
                        });
                });
        }
    }

    return (
        <Router basename="/AffectedUser">
            <div class="viewbuilder-struct">
                <div class="page_content">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-12" id="alertMessagesContainer"></div>
                        </div>
                    </div>
                    <div class="container-fluid">
                        <TaskPane />
                        <Switch>
                            <Route exact path="/"><IncidentForm data={workItemData} methods={methods} /></Route>
                            <Route exact path="/incident" ><IncidentForm data={workItemData} methods={methods} /></Route>
                            <Route exact path="/servicerequest"><ServiceRequestForm data={workItemData} methods={methods} /></Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </Router>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));