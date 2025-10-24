
{
    "Default":
    {
        tabList:
        [
            /*********/
            /** TAB **/
            /*********/
            {
                name: "General",
                content:
                [
                    {
                        customFieldGroupList:
                        [
                            {
                                name: "ProblemInformation",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem", FilterByAnalyst: true },
                                            { DataType: "Enum", PropertyDisplayName: "Source", PropertyName: "Source", EnumId: '91C21D12-7E66-3E02-CC44-824F6B131547' }
                                        ]
                                    },
									{
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "SupportGroup", PropertyName: pageForm.PRSupportGroupField, EnumId: pageForm.PRSupportGroupGuid, Visible: pageForm.PRSupportGroupField != ""},
                                            { DataType: "Spacer", ColSpan:3}
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Category", PropertyName: "Classification", EnumId: '9b2c7fa1-6a48-9592-4116-3f7385b068ac', Required: true },
                                            { DataType: "Enum", PropertyDisplayName: "Impact", PropertyName: "Impact", EnumId: '11756265-F18E-E090-EED2-3AA923A4C872', Required: true },
                                            { DataType: "Enum", PropertyDisplayName: "Urgency", PropertyName: "Urgency", EnumId: '04b28bfb-8898-9af3-009b-979e58837852', Required: true },
                                            { DataType: "String", PropertyDisplayName: "Priority", PropertyName: "Priority", Disabled: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "AffectedServices",
                                type: "multipleObjectPicker",
                                PropertyName: "HasRelatedWorkItems",
                                ClassId: "1d870aa6-edb4-7d13-3950-d3c73755d6bf",
                                PropertyToDisplay: {DisplayName:"DisplayName",Path:"Path", "AssetStatus.Name":"Status"},
                                Scoped: false
                            },
                            {
                                name: "AffectedItems",
                                type: "affectedItems"
                            },
                            {
                                name: "ActionLog",
                                type: "actionLog"
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
                name: "RelatedItems",
                content: [
                    {
                        customFieldGroupList: [
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
                                name: "CIComputerService",
                                type: "relatedItems"
                            },
                            {
                                name: "FileAttachments",
                                type: "fileAttachmentsDragDrop"
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
                name: "Resolution",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ProblemErrorAndProblemReview",
                                rows: [
                                    
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "KnownError", PropertyName: "KnownError", Required: false, Inline: true  }
                                        ]
                                    },
                                     {
                                         columnFieldList: [
                                             { DataType: "LongString", PropertyDisplayName: "ErrorDescription", PropertyName: "ErrorDescription", Required: false, MinLength: 0, MaxLength: 4000 }
                                         ]
                                     },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Workarounds", PropertyName: "Workarounds", Required: false, MinLength: 0, MaxLength: 4000 }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "RequiresMajorProblemRevi", PropertyName: "RequiresMajorProblemReview", Required: false, Inline: true  }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "ReviewNotes", PropertyName: "ReviewNotes", Required: false, MinLength: 0, MaxLength: 4000 }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "ResolutionDetails",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "ProblemAutoResolveIncident", PropertyName: "AutoResolve", Required: false, Disabled: true, Inline: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Resolution", PropertyName: "Resolution", EnumId: '52A0BFB0-B7E6-D16E-D06E-97CE62B4A335', Disabled: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "ResolutionDescription", PropertyName: "ResolutionDescription", Required: false, MinLength: 0, MaxLength: 4000, Disabled: true }
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
                name: "History",
                content:
                [
                    {
                        customFieldGroupList:
                        [
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
    "DefaultEndUser":
    {
        tabList:
        [
            /*********/
            /** TAB **/
            /*********/
            {
                name: "General",
                content:
                [
                    {
                        customFieldGroupList:
                        [
                            {
                                name: "ProblemInformation",
                                rows:
                                [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200, Disabled: true }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000, Disabled: true }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "ActionLog",
                                type: "actionLog"
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
    }
}
