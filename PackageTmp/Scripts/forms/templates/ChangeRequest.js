{
    "Default": {
        tabList: [
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "General",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "ChangeRequestInformation",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000}
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Reason", PropertyName: "Reason", MinLength: 0, MaxLength: 4000}
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "UserPicker", PropertyDisplayName: "CreatedBy", PropertyName: "CreatedWorkItem", Disabled: true },
                                                { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod", ColSpan: 2, MinLength: 0, MaxLength: 256 }
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "Enum", PropertyDisplayName: "SupportGroup", PropertyName: pageForm.CRSupportGroupField, EnumId: pageForm.CRSupportGroupGuid, Visible: pageForm.CRSupportGroupField != "" },
                                                { DataType: "Spacer", ColSpan:2}
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem"},
                                                { DataType: "Enum", PropertyDisplayName: "Area", PropertyName: "Area", EnumId: "28f88c04-d11d-78c0-a237-fa9abd6c6478", ColSpan: 2},
                                                
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "Enum", PropertyDisplayName: "Priority", PropertyName: "Priority", EnumId: 'b40092af-f163-af28-6150-bb0ffa677660' },
                                                { DataType: "Enum", PropertyDisplayName: "Impact", PropertyName: "Impact", EnumId: '44edd2ff-6280-afb7-3a0d-d6e8a711d894' },
                                                { DataType: "Enum", PropertyDisplayName: "Risk", PropertyName: "Risk", EnumId: '347a02c1-9784-f335-04b0-662efc8d6676' },
                                            ]
                                        }]
                                },
                                {
                                    name: "ActionLog",
                                    type: "actionLog"
                                },
                                {
                                    name: "AffectedConfigurationItems",
                                    type: "affectedItems"
                                },
                                {
                                    name: "",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 }
                                            ]
                                        }
                                    ]
                                }]
                        }]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Planning",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "Planning",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "DateTime", PropertyDisplayName: "ScheduledStartDate", PropertyName: "ScheduledStartDate" },
                                                { DataType: "DateTime", PropertyDisplayName: "ScheduledEndDate", PropertyName: "ScheduledEndDate" },
                                                { DataType: "Spacer" }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "ImplementationPlan", PropertyName: "ImplementationPlan", minLength: 0, maxLength: 4000 }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "RiskAssessmentPlan", PropertyName: "RiskAssessmentPlan", minLength: 0, maxLength: 4000 }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "TestPlan", PropertyName: "TestPlan", minLength: 0, maxLength: 4000 }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "BackoutPlan", PropertyName: "BackoutPlan", minLength: 0, maxLength: 4000 }
                                            ]
                                        }
                                    ]
                                }

                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Activities",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "Activities",
                                    type: "activities",
                                    defaultview: "diagram"
                                }
                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Results",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "Results",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "Enum", PropertyDisplayName: "ImplementationResults", PropertyName: "ImplementationResults", EnumId: '4b3a5150-c125-d993-9691-7906e60bfab7' },
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "PostImplementationReview", PropertyName: "PostImplementationReview", minLength: 0, maxLength: 4000 }
                                            ]
                                        }
                                    ]
                                    
                                },
                                {
                                    name: "TimeWorked",
                                    type: "billableTime"
                                }
                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "RelatedItems",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "RelatedConfigurationItems",
                                    type: "relatedItems"
                                },
                                {
                                    name: "FileAttachments",
                                    type: "fileAttachmentsDragDrop"
                                },
                                {
                                    name: "WorkItems",
                                    type: "multipleObjectPicker",
                                    PropertyName: "RelatesToWorkItem",
                                    ClassId: "f59821e2-0364-ed2c-19e3-752efbb1ece9",
                                    PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},
                                    SelectableRow: true,
                                    SelectProperty: "Id"
                                },
                                {
                                    name: "KnowledgeArticle",
                                    type: "knowledgeArticle",
                                },
                                {
                                    name: "WatchList",
                                    type: "multipleObjectPicker",
                                    PropertyName: "WatchList",
                                    ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                    PropertyToDisplay: {FirstName:"FirstName",LastName:"LastName",Title:"Title",UserName:"Username",Domain:"Domain",Company:"Company"},
                                    Visible: session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
                                }
                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "History",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "History",
                                    type: "history"
                                }
                            ]
                        }
                    ]
                }
        ]
    },
    "DefaultEndUser": {
        tabList: [
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "General",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "ChangeRequestInformation",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200, Disabled: true }
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000, Disabled: true}
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Reason", PropertyName: "Reason", MinLength: 0, MaxLength: 4000, Disabled: true}
                                            ],
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "UserPicker", PropertyDisplayName: "CreatedBy", PropertyName: "CreatedWorkItem", Disabled: true },
                                                { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod", ColSpan: 2, MinLength: 0, MaxLength: 256 }
                                            ],
                                        }]
                                },
                                {
                                    name: "ActionLog",
                                    type: "actionLog"
                                },
                                {
                                    name: "AffectedConfigurationItems",
                                    type: "affectedItems"
                                },
                                {
                                    name: "",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000, Disabled:true }
                                            ]
                                        }
                                    ]
                                }]
                        }]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Planning",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "Planning",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                { DataType: "DateTime", PropertyDisplayName: "ScheduledStartDate", PropertyName: "ScheduledStartDate", Disabled: true },
                                                { DataType: "DateTime", PropertyDisplayName: "ScheduledEndDate", PropertyName: "ScheduledEndDate", Disabled: true },
                                                { DataType: "Spacer" }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "ImplementationPlan", PropertyName: "ImplementationPlan", minLength: 0, maxLength: 4000, Disabled: true }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "RiskAssessmentPlan", PropertyName: "RiskAssessmentPlan", minLength: 0, maxLength: 4000, Disabled: true }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "TestPlan", PropertyName: "TestPlan", minLength: 0, maxLength: 4000, Disabled: true }
                                            ]
                                        },
                                        {
                                            columnFieldList: [
                                                { DataType: "LongString", PropertyDisplayName: "BackoutPlan", PropertyName: "BackoutPlan", minLength: 0, maxLength: 4000, Disabled: true }
                                            ]
                                        }
                                    ]
                                }

                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Activities",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "Activities",
                                    type: "activities", 
                                    disabled: "true",
                                    defaultview: "diagram"
                                }
                            ]
                        }
                    ]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "RelatedItems",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "RelatedConfigurationItems",
                                    type: "relatedItems"
                                },
                                {
                                    name: "FileAttachments",
                                    type: "fileAttachmentsDragDrop"
                                },
                                {
                                    name: "WatchList",
                                    type: "multipleObjectPicker",
                                    PropertyName: "WatchList",
                                    ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                    PropertyToDisplay: {FirstName:"FirstName",LastName:"LastName",Title:"Title",UserName:"Username",Domain:"Domain",Company:"Company"},
                                    Visible: session.consoleSetting.DashboardsLicense.IsValid && session.enableWatchlist
                                }
                            ]
                        }
                    ]
                }]
    }            
}
