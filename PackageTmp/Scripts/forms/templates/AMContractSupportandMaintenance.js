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
                                name: "SupportandMaintenanceContract",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "ContractName", PropertyName: "Name", Required: true, },
                                            { DataType: "Enum", PropertyDisplayName: "ContractStatus", PropertyName: "ContractStatus", Disabled: true, EnumId: "32F99D00-EBB1-BECE-AA58-8FF68ECD2F4B" }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "ContractStartDate", PropertyName: "ContractStartDate", Required: true, Disabled: false },
                                            { DataType: "Date", PropertyDisplayName: "ContractEndDate", PropertyName: "ContractEndDate", Required: true }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "DaysLeft", PropertyName: "DaysLeft", Disabled: true, },
                                            { DataType: "DateTime", PropertyDisplayName: "LastUpdated", PropertyName: "LastUpdated", Disabled: true, }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", Required: false, },
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_SupportContractHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false },
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
                name: "Finance",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Finance",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_SupportContractHasCostCenter", ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858", Disabled: false },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "PurchaseOrder", PropertyName: "Target_SupportContractHasPurchaseOrder", ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D", Disabled: false },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Invoice", PropertyName: "Target_SupportContractHasInvoice", ClassId: "E57C1C12-16CF-3E2D-576E-C9BE562A1A37", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "Cost", PropertyName: "Cost", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "Spacer", ColSpan: 2 }
                                        ],
                                    },
                                ]
                            },
                            {
                                name: "ContractSupersedesContracts",
                                rows: [
                                    {
                                        columnFieldList: [{ name: "", type: "multipleObjectPicker", SelectableRow: true, SelectProperty: "DisplayName", PropertyName: "Target_SupportContractSupersedesSupportContract", ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141", PropertyToDisplay: { DisplayName: "DisplayName", "ContractStatus.Name": "ContractStatus" }, Disabled: false }]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ContractSupersededBy", PropertyName: "Source_SupportContractSupersedesSupportContract", ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141", Disabled: false },
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
                                                name: "Hardawre",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_HardwareAssetHasSupportContract",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    },
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
                                                PropertyName: "Source_SoftwareAssetHasSupportContract",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
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
                                                PropertyToDisplay: { Id: "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                Disabled: false,
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
                                                PropertyToDisplay: { Id: "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "Id"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "ConfigurationItemsComputersServicesAndPeaple",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "TargetConfigItem",
                                                ClassId: "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC",
                                                PropertyToDisplay: { DisplayName: "DisplayName", FullClassName: "Type", "ObjectStatus.Name": "ObjectStatus", LastModified: "LastModified" },
                                                Disabled: false,
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
