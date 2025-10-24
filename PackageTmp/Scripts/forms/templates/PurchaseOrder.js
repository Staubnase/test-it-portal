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
                                name: "PurchaseOrder",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "PurchaseOrderNumber", PropertyName: "PurchaseOrderNumber", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Purchaser", PropertyName: "Target_PurchaseOrderHasPurchaser" }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "TotalCost", PropertyName: "Amount", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: 'Boolean', PropertyDisplayName: 'AutoCalculate', PropertyName: 'AutoCalculate', Inline: true },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_PurchaseOrderHasCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Date", PropertyDisplayName: "stringPurchaseOrderDate", PropertyName: "PurchaseOrderDate", Disabled: false, Required: true },
                                            { DataType: "Enum", PropertyDisplayName: "headerPurchaseOrderStatus", PropertyName: "PurchaseOrderStatus", EnumId: '4150E434-E09E-70DB-3573-EEC1FFF96BD4' },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "PurchaseOrderType", PropertyName: "PurchaseOrderType", EnumId: '2E654705-A8BC-D13F-7013-D5D1D7FC529C' },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "ParentPurchaseOrder", PropertyName: "Source_PurchaseOrderHasChildPurchaseOrder", Required: false, ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D" }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", Required: false, },
                                        ]
                                    },
                                ]
                            },
                            {
                                name: "RelatedPurchase",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_PurchaseHasPurchaseOrder",
                                                ClassId: "001556ED-3AD5-5640-FEE8-BEB748DA9E03",
                                                Disabled: false,
                                                ProjectionId: "376FEAFF-84BE-25F5-0AD0-E591F843479C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_PurchaseHasCostCenter.DisplayName": "CostCenter", "Target_PurchaseHasPurchaseOrder.DisplayName": "PurchaseOrder", "Target_PurchaseHasInvoice.DisplayName": "Invoice", "Currency.Name": "Currency", Cost: "Cost", "Target_PurchaseHasVendor.DisplayName": "Vendor" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }, {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "PurchaseTotalCost", HideLabel: false }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_PurchaseOrderHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false },
                                            { DataType: "Spacer" },
                                        ],
                                    }
                                ]
                            }
                        ]

                    }
                ]
            },
            {
                name: "Shipping",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "PurchaseOrder",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "SHIPPINGLOCATION", PropertyName: "Target_PurchaseOrderHasShipToLocation", Required: false, ClassId: "b1ae24b1-f520-4960-55a2-62029b1ea3f0" },
                                            { DataType: "Decimal", PropertyDisplayName: "ShippingCost", PropertyName: "ShippingCost", DecimalPlaces: 2, Required: false, MinValue: 0 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Percentage", PropertyDisplayName: "LocationTaxRate", PropertyName: "Target_PurchaseOrderHasShipToLocation.LocationTaxRate", Required: false, MinValue: 0, Disabled: true },
                                            { DataType: "Spacer" },
                                            { DataType: "Spacer" },
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
                                name: "RelatedHardwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_HardwareAssetHasPurchaseOrder",
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
                                                PropertyName: "Source_SoftwareAssetHasPurchaseOrder",
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
                                name: "ChildPurchaseOrder",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseOrderHasChildPurchaseOrder",
                                                ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D",
                                                ProjectionId: "F27DAAE2-280C-DD8B-24E7-9BDB5120D6D2",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_PurchaseOrderHasCostCenter.DisplayName": "CostCenter", "Currency.Name": "Currency", Amount: "Amount", "Target_PurchaseOrderHasVendor.DisplayName": "Vendor" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "POTotalCost", HideLabel: false }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedInvoices",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_PurchaseOrderHasInvoices",
                                                ClassId: "E57C1C12-16CF-3E2D-576E-C9BE562A1A37",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", "Status.Name": "Status", "Currency.Name": "Currency", TotalAmount: "TotalAmount", ReceivedDate: "ReceivedDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
                                            }
                                        ]
                                    }, {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "InvoiceTotalCost", HideLabel: false }
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
                                                PropertyName: "Target_PurchaseOrderHasSupportContracts",
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
                                                PropertyName: "Target_PurchaseOrderHasWarranties",
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
                                                PropertyName: "Target_PurchaseOrderHasLeases",
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
