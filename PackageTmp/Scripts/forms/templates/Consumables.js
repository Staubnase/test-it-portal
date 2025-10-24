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
                                name: "Location",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "headerConsumableName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Owner", PropertyName: "OwnedBy", Disabled: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "Manufacturer", PropertyName: "Manufacturer", EnumId: "0402838A-EB46-E8ED-6D13-0E10A5FD5F83", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Model", PropertyName: "Model", EnumId: "D0F91FD5-6D03-53D7-602E-B753F0FDE499", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Status", PropertyName: "Status", EnumId: 'BB41A720-79FE-556C-ED47-79E74AA774E1', Disabled: true },
                                            { DataType: "Enum", PropertyDisplayName: "Type", PropertyName: "Type", EnumId: '08CCB3B7-C3AE-6F7C-DD91-F455311AC180' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "Price", PropertyName: "Price", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Location", PropertyName: "Target_ConsumableHasLocation", ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0", Disabled: false, ColSpan: 2 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Int32", PropertyDisplayName: "stringAvailableCount", PropertyName: "Count", Required: false, MinValue: 0, Disabled: true },
                                            { DataType: "Int32", PropertyDisplayName: "ReorderPointForm", PropertyName: "Threshold", Required: true, MinValue: 0 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Int32", PropertyDisplayName: "AssignedCount", PropertyName: "AssignedCount", Required: false, MinValue: 0 },
                                            { DataType: "Int32", PropertyDisplayName: "MaximumAvailableLevel", PropertyName: "MaximumAvailable", Required: false, MinValue: 0 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "NotificationTemplate",
                                                PropertyName: "Template",
                                                IsCascading: false,
                                                DataSource: {
                                                    Url: "/AssetManagement/Administration/Consumables/GetConsumableNotificationTemplates/"
                                                }
                                            },
                                            { DataType: "Spacer", ColSpan: 2 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StandardNotes", PropertyName: "Notes", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "ActivityLog",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { name: "", type: "multipleObjectPicker", PropertyName: "Target_ConsumableHasLogs", ClassId: "67CE5B07-835D-246D-478D-29CEE397C66E", Disabled: true, PropertyToDisplay: { Title: "Title", Comment: "Comment", "Type.Name": "Type", CreatedDate: "CreatedDate" } }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_ConsumableHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false }
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
                name: "Assignment",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedAssignementAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                                PropertyName: "Target_ConsumableHasAssignedAssets",
                                                ClassId: "c0c58e7f-7865-55cc-4600-753305b9be64",
                                                Disabled: false,
                                                ProjectionId: "7DD5144C-BD5D-AF27-E3AF-DEBCB5A53546",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_HardwareAssetHasPrimaryUser.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" }
                                            }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "CountAssignedConsumableAssets", PropertyName: "CountAssignedConsumableAssets", Required: false, Inline: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedAssignedUser",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "", type: "multipleObjectPicker", PropertyName: "Target_ConsumableHasAssignedUsers", ClassId: "10A7F898-E672-CCF3-8881-360BFB6A8F9A", Disabled: false,
                                                PropertyToDisplay: {
                                                    DisplayName: "DisplayName", UserName: "UserName", Domain: "Domain", Title: "Title", Department: "Department", Office: "Office",
                                                    "RelationshipProperty.Count": {
                                                        Header: "Count",
                                                        FieldType: "number",
                                                        Editable: true,
                                                        Validation: { min: 1 }
                                                    }
                                                }
                                            }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "CountAssignedConsumableUsers", PropertyName: "CountAssignedConsumableUsers", Required: false, Inline: true }
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
                name: "RelatedItems",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "WIAffectCI",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "IsAboutConfigItems",
                                                ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                                                Disabled: false,
                                                PropertyToDisplay: { Id: "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                SelectableRow: true,
                                                SelectProperty: "Id"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "WorkItems",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "RelatesToWorkItem",
                                                ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                                                Disabled: false,
                                                PropertyToDisplay: { Id: "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                SelectableRow: true,
                                                SelectProperty: "Id"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "CIComputerService",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "TargetConfigItem",
                                                ClassId: "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", FullClassName: "Type", "ObjectStatus.Name": "ObjectStatus", LastModified: "LastModified" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "KnowledgeArticle",
                                type: "knowledgeArticle",
                            },
                            {
                                name: "FileAttachments",
                                type: "fileAttachmentsDragDrop"
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
