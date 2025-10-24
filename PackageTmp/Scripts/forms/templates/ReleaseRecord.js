
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
                                name: "ReleaseRecordInformation",
                                rows:
                                [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", MinLength: 0, MaxLength: 4000 }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Type", PropertyName: "Type", EnumId: '20497563-7723-D3D2-2C84-0CB70D7F6ADC' },
                                            { DataType: "Enum", PropertyDisplayName: "Category", PropertyName: "Category", EnumId: 'C8416263-3DF1-6170-E857-FC7D0918A65E' },
                                            { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem", FilterByAnalyst: true },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Impact", PropertyName: "Impact", EnumId: "510E6308-9637-DAC7-5814-92465703270A" },
                                            { DataType: "Enum", PropertyDisplayName: "Risk", PropertyName: "Risk", EnumId: "CCF92254-A404-3ED2-BE71-A9B5EEA4F19B" },
                                            { DataType: "Enum", PropertyDisplayName: "Priority", PropertyName: "Priority", EnumId: 'A384FEEB-0FF6-3971-FAAC-9710C250B802' },
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "DateTime", PropertyDisplayName: "UpdatedOn", PropertyName: "LastModified", Disabled: true},
                                            { DataType: "Spacer"},
                                            { DataType: "Spacer"},
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                            [
                                                {DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000}
                                            ]
                                    }
                                ]
                            },
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "ReleasePackage",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ConfigurationItemsToModify",
                                type: "affectedItems"
                            },
                            {
                                name: "AffectedServices",
                                type: "multipleObjectPicker",
                                PropertyName: "ImpactedService",
                                ClassId: "1d870aa6-edb4-7d13-3950-d3c73755d6bf",
                                PropertyToDisplay: {DisplayName:"DisplayName",Path:"Path", "AssetStatus.Name":"Status"},
                                Scoped: true
                            },
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Scheduling",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ReleaseSchedule",
                                rows:[
                                    {
                                        columnFieldList: [
                                            { DataType: "DateTime", PropertyDisplayName: "RequiredBy", PropertyName: "RequiredBy" },
                                            { DataType: "Spacer"},
                                            { DataType: "Spacer"},
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "DateTime", PropertyDisplayName: "ScheduledStartDate", PropertyName: "ScheduledStartDate" },
                                            { DataType: "DateTime", PropertyDisplayName: "ScheduledEndDate", PropertyName: "ScheduledEndDate" },
                                            { DataType: "String", PropertyDisplayName: "ScheduledDuration", PropertyName: "ScheduleDuration", Disabled: true },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "DateTime", PropertyDisplayName: "Actualstartdate", PropertyName: "ActualStartDate" },
                                            { DataType: "DateTime", PropertyDisplayName: "Actualenddate", PropertyName: "ActualEndDate" },
                                            { DataType: "String", PropertyDisplayName: "ActualDuration", PropertyName: "ActualDuration", Disabled: true },
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Downtime",
                                rows:[
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "CausesDowntime", PropertyName: "IsDowntime", Inline: true  },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "DateTime", PropertyDisplayName: "ScheduledDowntimeStartDa", PropertyName: "ScheduledDowntimeStartDate" },
                                            { DataType: "DateTime", PropertyDisplayName: "ScheduledDowntimeEndDate", PropertyName: "ScheduledDowntimeEndDate" },
                                            { DataType: "String", PropertyDisplayName: "ScheduledDuration", PropertyName: "ScheduledDowntimeDuration", Disabled: true },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "DateTime", PropertyDisplayName: "ActualDowntimeStartDate", PropertyName: "ActualDowntimeStartDate" },
                                            { DataType: "DateTime", PropertyDisplayName: "ActualDowntimeEndDate", PropertyName: "ActualDowntimeEndDate" },
                                            { DataType: "String", PropertyDisplayName: "ActualDuration", PropertyName: "ActualDowntimeDuration", Disabled: true },
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Work",
                                rows:[
                                    {
                                        columnFieldList: [
                                             { DataType: "Int32", PropertyDisplayName: "PlannedWork", PropertyName: "PlannedWork", MinValue:0 },
                                              { DataType: "Int32", PropertyDisplayName: "ActualWork", PropertyName: "ActualWork", MinValue:0  },
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Cost",
                                rows:[
                                    {
                                        columnFieldList: [
                                             { DataType: "Int32", PropertyDisplayName: "PlannedCost", PropertyName: "PlannedCost", MinValue:0  },
                                             { DataType: "Int32", PropertyDisplayName: "ActualCost", PropertyName: "ActualCost", MinValue:0  },
                                        ],
                                    },
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
                                name: "ChildWorkIems",
                                type: "childWorkItems"
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
                name: "Results",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Results",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "ImplementationResults", PropertyName: "ImplementationResults", EnumId: '3F02CAB3-0D33-804A-1B3E-7266E2728D69' },
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
