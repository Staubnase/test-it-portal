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
                                name: "Purchase",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "stringPurchaseName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Purchaser", PropertyName: "Target_PurchaseHasPurchaser" }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", Required: false, },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_PurchaseHasCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy" }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "PurchaseOrder", PropertyName: "Target_PurchaseHasPurchaseOrder", Required: false, ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D" },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Invoice", PropertyName: "Target_PurchaseHasInvoice", Required: false, ClassId: "E57C1C12-16CF-3E2D-576E-C9BE562A1A37" },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Date", PropertyDisplayName: "ExpectedDate", PropertyName: "ExpectedDate", Disabled: false, },
                                            { DataType: "Date", PropertyDisplayName: "ReceivedDate", PropertyName: "ReceivedDate", Disabled: false, },
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "PurchaseType", PropertyName: "PurchaseType", EnumId: 'C09E6337-8160-F902-2703-7805EAC0ACFA' },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "SupportAndMaintenanceContract", PropertyName: "Target_PurchaseHasSupportContract", Required: false, ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141" }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Financial",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Numeric", PropertyDisplayName: "Units", PropertyName: "Units", Required: false, MinLength: 0, MaxLength: 200, MaxValue:999999 },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "SHIPPINGLOCATION", PropertyName: "Target_PurchaseHasLocation", Required: false, ClassId: "b1ae24b1-f520-4960-55a2-62029b1ea3f0" },
                                            { DataType: "Percentage", PropertyDisplayName: "PURCHASETAXRATE", PropertyName: "PurchaseTaxRate", Required: false, MinValue: 0 },
                                            { DataType: "Boolean", PropertyDisplayName: "OVERRIDELOCATIONTAX", PropertyName: "OverrideLocationTax", Inline: true }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "UNITCOST", PropertyName: "UnitCost", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "Decimal", PropertyDisplayName: "ADDITIONALCHARGES", PropertyName: "AdditionalCharges", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "Decimal", PropertyDisplayName: "TotalCost", PropertyName: "Cost", DecimalPlaces: 2, Required: false, MinValue: 0, Disabled: true }
                                        ],
                                    },
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_PurchaseHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false },
                                            { DataType: "Spacer" }
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
                                name: "RelatedSoftwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_SoftwareAssetHasPurchase",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "RelatedHardwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_HardwareAssetHasPurchase",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetStatus.Name": "HardwareAssetStatus" },
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
                name: "Licenses",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Licensing",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseHasLicence",
                                                ClassId: "A3AD0993-DEF0-E2FF-DBCF-9CA04040A219",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", "Type.Name": "Type", "Status.Name": "Status", "ExpiryDate": "ExpiryDate", "AllocatedSeats": "AllocatedSeats", "SeatsRemaining": "SeatsRemaining" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
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
                name: "Contracts",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "SupportandMaintenance",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseHasSupportContracts",
                                                ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", ContractStartDate: "ContractStartDate", ContractEndDate: "ContractEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
                                            }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Warranties",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseHasWarranties",
                                                ClassId: "8D5257C7-BFA4-A9F0-84BC-E4D9DF120264",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", WarrantyStartDate: "WarrantyStartDate", WarrantyEndDate: "WarrantyEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
                                            }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "Leases",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseHasLeases",
                                                ClassId: "DA47B130-6BF6-10EB-B8A0-A9288B729160",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", LeaseStartDate: "LeaseStartDate", LeaseEndDate: "LeaseEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
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
