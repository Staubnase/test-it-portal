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
                                name: "CatalogItem",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "CatalogItemName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "Enum", PropertyDisplayName: "Typeb586382a549742ed99a25853ccd3f7b5", PropertyName: "Type", EnumId: 'F165A798-B232-3509-AF88-61AFBAFE714A' }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Manufacturer", PropertyName: "Manufacturer", EnumId: '0E82DAD7-5853-33F7-E4C0-C34C478FE70A' },
                                            { DataType: "Enum", PropertyDisplayName: "Model", PropertyName: "Model", Required: true, EnumId: '5D2715B3-91A1-3868-FAF6-AB7DD98DAAF4' }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Spacer", PropertyName: "ModelAlias" },
                                            { DataType: "String", PropertyDisplayName: "ModelAlias", PropertyName: "ModelAlias", IsVisible: false, Required: false, MinLength: 0, MaxLength: 256 },
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                            [
                                                { DataType: "String", PropertyDisplayName: "ProductId", PropertyName: "Product", Required: false, MinLength: 0, MaxLength: 200 },
                                                { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                                { DataType: "Decimal", PropertyDisplayName: "Price", PropertyName: "Price", DecimalPlaces: 2, MinValue: 1, Required: false }
                                            ]
                                    },
                                    {
                                        columnFieldList:
                                            [
                                                { DataType: "UrlTextbox", PropertyDisplayName: "Website", PropertyName: "WebSite", Required: false },
                                                { DataType: "Enum", PropertyDisplayName: "Status", PropertyName: "Status", Required: false, EnumId: 'C53C0A1F-B33D-8A09-E4A9-E17BC0E284A2' }
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
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_CatalogItemHasVendor", Required: false, ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931" },
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "CatalogImage",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "FileUpload", PropertyDisplayName: "Add Image", PropertyName: "Image", AcceptExtension: ".jpg,.jpeg,.png,.bmp" }
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
                                                PropertyName: "Source_HardwareAssetHasCatalogItem",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
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
                                                PropertyName: "Source_SoftwareAssetHasCatalogItem",
                                                ClassId: "81e3da4f-e41c-311e-5b05-3ca779d030db",
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
            /* {
            name: "CatalogImage",
            content: [
                {
                    customFieldGroupList: [

                        {
                             name: "FileAttachments", 
                             type: "fileAttachments"
                        },

                    ]
                }
            ]
        },*/
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
