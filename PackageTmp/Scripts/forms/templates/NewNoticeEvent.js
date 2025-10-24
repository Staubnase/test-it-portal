{
    "Default":
    {
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
                                name: "NoticeEvent",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "AssetTitle", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Owner", PropertyName: "Target_NoticeEventHasOwner", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "AssetType", PropertyName: "Type", EnumId: 'B3C80916-8460-A037-3F94-54A4ADB5C248' },
                                            { DataType: "Boolean", PropertyDisplayName: "Enabled", Label: "Enabled", PropertyName: "Enabled", Disabled: false, Inline: true }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Date", PropertyDisplayName: "DueDate", PropertyName: "DueDate", Required: true, Disabled: false },
                                            { DataType: "Boolean", PropertyDisplayName: "IfApplicableContractEndDate", Label: "IfApplicableContractEndDate", PropertyName: "UseContractDate", Disabled: false, Inline: true }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Int32", PropertyDisplayName: "NoticeSpan", PropertyName: "Span", Required: false, MinLength: 0, MaxLength: 200, MinValue: 0 },
                                            { DataType: "Enum", PropertyDisplayName: "NoticePeriod", PropertyName: "NoticePeriod", EnumId: '1A98456A-8606-4C39-950E-D16F2E3B967C' }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "TargetClass",
                                                PropertyName: "Class",
                                                Required: true,
                                                DataSource: {
                                                    Url: "/AssetManagement/Administration/NoticeEvent/GetAllClasses/",
                                                },
                                                IsCascading: true,
                                                Cascade: {
                                                    IsChild: false,
                                                    Target: "Template",
                                                }
                                            },
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "NotificationTemplate",
                                                PropertyName: "Template",
                                                Required: true,
                                                DataSource: {
                                                    Url: "/AssetManagement/Administration/NoticeEvent/GetNotificationTemplatesByClass/",
                                                    ParameterKey: "classId"
                                                },
                                                IsCascading: true,
                                                Cascade: {
                                                    IsChild: true,
                                                    Source: "Class",
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "HardwareAssetNotificationTemplate",
                                                PropertyName: "HardwareAssetTemplate",
                                                IsCascading: false,
                                                DataSource: {
                                                    Url: "/AssetManagement/Administration/NoticeEvent/GetHardwareAssetNotificationTemplates/"
                                                }
                                            },
                                            { DataType: "Boolean", PropertyDisplayName: "AutoRenew", Label: "AutoRenew", PropertyName: "AutoRenew", Disabled: false, Required: true, Inline: true }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "NoticeMessage", PropertyName: "NoticeMessages", HideLabel: false }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StandardNotes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Recipient",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Display", PropertyDisplayName: "", Label: "NoticeEventRecipeintError", PropertyName: "NoticeEventRecipeintError", Disabled: false, Required: true, Inline: true }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "SendToOwner", Label: "SendToOwner", PropertyName: "SendToOwner", Disabled: false, Required: true, Inline: true },
                                            { DataType: "Boolean", PropertyDisplayName: "SendToCustodian", Label: "SendToCustodian", PropertyName: "SendToCustodian", Disabled: false, Required: true, Inline: true }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_NoticeEventRelatesToRecipient",
                                                ClassId: "943D298F-D79A-7A29-A335-8833E582D252",
                                                Required: true,
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "RelateNoticeEvent",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_NoticeEventRelatesToConfigItem",
                                                ClassId: "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", FullClassName: "Class" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"

                                            }
                                        ],
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
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
