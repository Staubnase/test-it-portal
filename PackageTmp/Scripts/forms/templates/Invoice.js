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
                                name: "Invoice",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "InvoiceNumber", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "Date", PropertyDisplayName: "ReceivedDate", PropertyName: "ReceivedDate", Required: true, }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "InvoiceAmount", PropertyName: "TotalAmount", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_InvoiceHasCostCenter", ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858", Disabled: false }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "InvoiceStatus", PropertyName: "Status", EnumId: 'BECC7E84-E208-6BF9-6340-04DF05D1FE14' }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_InvoiceHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false },
                                            { DataType: "Spacer" }
                                        ],
                                    }
                                ]
                            }
                        ]

                    }
                ]
            },
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
                                                PropertyName: "Source_HardwareAssetHasInvoice",
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
                                                PropertyName: "Source_SoftwareAssetHasInvoice",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedPurchaseOrders",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_PurchaseOrderHasInvoices",
                                                ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Currency.Name": "Currency", Amount: "Amount" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                            }
                                        ]
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
                                name: "RelatedPurchases",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_PurchaseHasInvoice",
                                                ClassId: "001556ED-3AD5-5640-FEE8-BEB748DA9E03",
                                                ProjectionId: "376FEAFF-84BE-25F5-0AD0-E591F843479C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_PurchaseHasCostCenter.DisplayName": "CostCenter", "Target_PurchaseHasPurchaseOrder.DisplayName": "PurchaseOrder", "Target_PurchaseHasInvoice.DisplayName": "Invoice", "Currency.Name": "Currency", Cost: "Cost", "Target_PurchaseHasVendor.DisplayName": "Vendor" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName",
                                            }
                                        ]
                                    }, {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "PurchaseTotalCost", HideLabel: false }
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
                                                PropertyName: "Target_InvoiceHasSupportContracts",
                                                ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", ContractStartDate: "ContractStartDate", ContractEndDate: "ContractEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
                                            }
                                        ]
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
                                                PropertyName: "Target_InvoiceHasWarranties",
                                                ClassId: "8D5257C7-BFA4-A9F0-84BC-E4D9DF120264",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", WarrantyStartDate: "WarrantyStartDate", WarrantyEndDate: "WarrantyEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
                                            }
                                        ]
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
                                                PropertyName: "Target_InvoiceHasLeases",
                                                ClassId: "DA47B130-6BF6-10EB-B8A0-A9288B729160",
                                                Disabled: false,
                                                PropertyToDisplay: { Name: "Name", LeaseStartDate: "LeaseStartDate", LeaseEndDate: "LeaseEndDate" },
                                                SelectableRow: true,
                                                SelectProperty: "Name"
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
