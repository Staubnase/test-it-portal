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
                                name: "Organization",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "stringOrganizationName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy", Disabled: false },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_OrganizationHasCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentOrganization", PropertyName: "Target_OrganizationContainsOrganization", Required: false, ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8" }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 }
                                        ]
                                    },
                                ]
                            },
                            {
                                name: "PrimaryLocation",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "LocationName", PropertyName: "Target_OrganizationHasLocation", Required: false, ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0" }
                                        ],
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
                name: "Locations",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Locations",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_OrganizationHasLocations",
                                                ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "LocationName", LocationAddress1: "AddressLine1", LocationAddress2: "AddressLine2", LocationCity: "City" },
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
                                                PropertyName: "Source_HardwareAssetHasOrganization",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetStatus.Name": "HardwareAssetStatus" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"

                                            }
                                        ],
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
                                                PropertyName: "Source_SoftwareAssetHasOrganization",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus" },
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
                                name: "ParentOrganization",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentOrganization", PropertyName: "Target_OrganizationContainsOrganization", Required: false, ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8" }
                                        ],
                                    }
                                ],
                            },
                            {
                                name: "ChildOrganization",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_OrganizationContainsOrganization",
                                                ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "OrganizationName" },
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
