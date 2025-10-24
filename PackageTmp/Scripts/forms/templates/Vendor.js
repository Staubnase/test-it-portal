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
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "VendorName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UrlTextbox", PropertyDisplayName: "Website", PropertyName: "WebSite", Required: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "AddressLine1", PropertyName: "VendorAddress1", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "AddressLine2", PropertyName: "VendorAddress2", Required: false, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "City", PropertyName: "VendorCity", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "State", PropertyName: "VendorState", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "PostalCode", PropertyName: "VendorPostCode", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Country", PropertyName: "VendorCountry", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "ContactName", PropertyName: "VendorContact", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Email", PropertyName: "VendorEmail", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Telephone", PropertyName: "VendorPhone", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Fax", PropertyName: "VendorFax", Required: false, MinLength: 0, MaxLength: 200 }
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
                                                PropertyName: "Source_HardwareAssetHasVendor",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
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
                                                PropertyName: "Source_SoftwareAssetHasVendor",
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
