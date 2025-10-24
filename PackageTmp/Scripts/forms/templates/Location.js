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
                                            { DataType: "String", PropertyDisplayName: "LocationName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentLocation", PropertyName: "Target_LocationContainsLocation", Required: false, ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0" }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "AddressLine1", PropertyName: "LocationAddress1", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "AddressLine2", PropertyName: "LocationAddress2", Required: false, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "City", PropertyName: "LocationCity", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "State", PropertyName: "LocationState", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "PostalCode", PropertyName: "LocationPostCode", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Country", PropertyName: "LocationCountry", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "ContactName", PropertyName: "LocationContact", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Email", PropertyName: "LocationEmail", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Telephone", PropertyName: "LocationPhone", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Fax", PropertyName: "LocationFax", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Percentage", PropertyDisplayName: "LocationTaxRate", PropertyName: "LocationTaxRate", Required: false, MinValue: 0, MaxValue: 0.99 },
                                            { DataType: "Spacer" }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StandardNotes", PropertyName: "Notes", Required: false, MinLength: 0, MaxLength: 200 }
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
                name: "Subnet",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Subnet",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_LocationHasSubnet",
                                                ClassId: "1A7A71A6-DE25-61C4-A9C6-A3420C5A8564",
                                                PropertyToDisplay: { DisplayName: "SubnetName", SubnetMask: "SubnetMask", IPMask: "IPAddress" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                                Disabled: false
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
                                                PropertyName: "Source_HardwareAssetHasLocation",
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
                                                PropertyName: "Source_SoftwareAssetHasLocation",
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
            {
                name: "Levels",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Location",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentLocation", PropertyName: "Target_LocationContainsLocation", Required: false, ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0" }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "ChildLocations",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_LocationContainsLocation",
                                                ClassId: "b1ae24b1-f520-4960-55a2-62029b1ea3f0",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "LocationName" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ],
                                    }
                                ]
                            },
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
