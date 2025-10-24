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
                                name: "CostCenter",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "CostCenterCode", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentCostCenter", PropertyName: "Source_CostCenterHasParentCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Organization", PropertyName: "Target_CostCenterHasOrganization", Required: false, ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8" },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy", Disabled: false }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", Required: false, MinLength: 0, MaxLength: 4000 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StandardNotes", PropertyName: "Notes", Required: false, MinLength: 0, MaxLength: 4000 }
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
                name: "RelatedAssets",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedHardwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_HardwareAssetHasCostCenter",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedSoftwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_SoftwareAssetHasCostCenter",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetType.Name": "SoftwareAssetType" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
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
                                        ],
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
                                        ],
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
                                        ],
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
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Levels",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Levels",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentCostCenter", PropertyName: "Source_CostCenterHasParentCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" }
                                        ],
                                    },
                                ]
                            },
                            {
                                name: "ChildCostCenters",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_CostCenterHasParentCostCenter",
                                                PropertyToDisplay: { Name: "CostCenter", "Target_CostCenterHasOrganization.DisplayName": "Organization", "OwnedBy.DisplayName": "Custodian" },
                                                SelectableRow: true,
                                                SelectProperty: "Name",
                                                ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858",
                                                ProjectionId: "AA09A946-652F-0D69-6846-2344B0A429AD",
                                                Disabled: false
                                            }
                                        ],
                                    },
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
