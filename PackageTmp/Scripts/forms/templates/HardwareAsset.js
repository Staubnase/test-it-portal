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
                                name: "Hardware Asset",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "AssetName", PropertyName: "Name", Required: true, },
                                            { DataType: "String", PropertyDisplayName: "HardwareAssetID", PropertyName: "HardwareAssetID", Required: true, Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "UserPicker", PropertyDisplayName: "PrimaryUser", PropertyName: "Target_HardwareAssetHasPrimaryUser", Disabled: false },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CatalogItem", PropertyName: "Target_HardwareAssetHasCatalogItem", ClassId: "98FBECC7-F76A-DCD6-7B17-62CEE34E38DE", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", Required: false, }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Manufacturer", PropertyName: "Manufacturer", Required: false, EnumId: '0E82DAD7-5853-33F7-E4C0-C34C478FE70A' },
                                            { DataType: "String", PropertyDisplayName: "Model", PropertyName: "Model", Required: false, EnumId: '5D2715B3-91A1-3868-FAF6-AB7DD98DAAF4' }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "SerialNumber", PropertyName: "SerialNumber", Required: true, },
                                            { DataType: "String", PropertyDisplayName: "AssetTag", PropertyName: "AssetTag", Required: true, }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "HWAssetStatus", PropertyName: "HardwareAssetStatus", EnumId: '6B7304C4-1B09-BFFC-3FE3-1CFD3EB630CB' },
                                            { DataType: "Enum", PropertyDisplayName: "HWAssetType", PropertyName: "HardwareAssetType", EnumId: 'F165A798-B232-3509-AF88-61AFBAFE714A' }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Miscellaneous",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Location", PropertyName: "Target_HardwareAssetHasLocation", ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0", Disabled: false },
                                            { DataType: "String", PropertyDisplayName: "LocationDetails", PropertyName: "LocationDetails", Required: false, }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Organization", PropertyName: "Target_HardwareAssetHasOrganization", ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8", Disabled: false },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "AssociatedConfigurationItem", PropertyName: "Target_HardwareAssetHasAssociatedCI", ClassId: "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "ManualInventoryDate", PropertyName: "ManualInventoryDate" },
                                            { DataType: "Date", PropertyDisplayName: "ConfigMgrInventoryDate", PropertyName: "Target_HardwareAssetHasAssociatedCI.LastInventoryDate", Disabled: true }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: "LeaseorWarranty",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "LeaseOrWarrantyStatus", HideLabel: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "WarrantyContract", PropertyName: "Target_HardwareAssetHasWarranty", ClassId: "8D5257C7-BFA4-A9F0-84BC-E4D9DF120264", Disabled: false },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "LeaseContract", PropertyName: "Target_HardwareAssetHasLease", ClassId: "DA47B130-6BF6-10EB-B8A0-A9288B729160", Disabled: false },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "UseLeaseNotWarranty", PropertyName: "useLease", Inline: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "SupportandMaintenanceContract",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "SupportandMaintenanceContractStatus", HideLabel: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "SupportandMaintenanceContract", PropertyName: "Target_HardwareAssetHasSupportContract", ClassId: "B2C105D4-D8C7-B57C-FE3D-205D47E07141", Disabled: false },
                                        ],
                                    }
                                ]
                            },
                        ]
                    }
                ]
            },
            /*********/
            /** TAB **/
            /*********/
            {
                name: "Notes",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Notes",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", Required: false, }
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
                name: "Mobile",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "Mobile",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "SIMSerial", PropertyName: "SIMSerial", },
                                            { DataType: "String", PropertyDisplayName: "SIMPIN", PropertyName: "SIMPIN", }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "MobileNumber", PropertyName: "MobileNumber", },
                                            { DataType: "String", PropertyDisplayName: "IMEINumber", PropertyName: "IMEINumber", }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "CSNNumber", PropertyName: "CSNNumber", },
                                            { DataType: "String", PropertyDisplayName: "AccountNumber", PropertyName: "AccountNumber", }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "ServiceProviderEnum", PropertyName: "ServiceProviderEnum", EnumId: 'F0A90573-6A18-BFE0-9DDC-2142AC2BC36D' },
                                            { DataType: "Enum", PropertyDisplayName: "ServiceTypeEnum", PropertyName: "ServiceTypeEnum", EnumId: 'BB7AAD81-F1FC-730F-229E-430CF931582E' }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "DataPlanTypeEnum", PropertyName: "DataPlanTypeEnum", EnumId: 'E7E92004-1949-974F-77B7-C4727A8E7135' },
                                            { DataType: "Enum", PropertyDisplayName: "ServiceStatusEnum", PropertyName: "ServiceStatusEnum", EnumId: '557682C1-57FC-CE6F-E0BA-5B4B934BBAAF' }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "InternationalRoaming", PropertyName: "InternationalRoaming", Inline: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "ActivationDate", PropertyName: "ActivationDate" },
                                            { DataType: "Date", PropertyDisplayName: "CancelledDate", PropertyName: "CancelledDate" }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "Plandetails", PropertyName: "Plandetails", Required: false, }
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
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_HardwareAssetHasCostCenter", ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858", Disabled: false },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "PurchaseOrder", PropertyName: "Target_HardwareAssetHasPurchaseOrder", ClassId: "2AFE355C-24A7-B20F-36E3-253B7249818D", Disabled: false },
                                            { DataType: "ObjectPicker", PropertyDisplayName: "Invoice", PropertyName: "Target_HardwareAssetHasInvoice", ClassId: "E57C1C12-16CF-3E2D-576E-C9BE562A1A37", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "ExpectedDate", PropertyName: "ExpectedDate", Disabled: false },
                                            { DataType: "Date", PropertyDisplayName: "ReceivedDate", PropertyName: "ReceivedDate", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "Cost", PropertyName: "Cost", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "Date", PropertyDisplayName: "MasterLeaseWarrantyStarts", PropertyName: "MasterContractRenewedOn", Disabled: false }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "LoanedDate", PropertyName: "LoanedDate" },
                                            { DataType: "Date", PropertyDisplayName: "LoanReturnDate", PropertyName: "LoanReturnedDate", }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "DisposalDate", PropertyName: "DisposalDate" },
                                            { DataType: "String", PropertyDisplayName: "DisposalReference", PropertyName: "DisposalReference", }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Date", PropertyDisplayName: "AssignedDate", PropertyName: "AssignedDate" },
                                            { DataType: "Date", PropertyDisplayName: "ExpectedEndDate", PropertyName: "ExpectedEndDate", }
                                        ],
                                    },
                                ]
                            },
                            {
                                name: "Vendor",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_HardwareAssetHasVendor", ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931", Disabled: false },
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
                name: "LineItem",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedPurchases",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_HardwareAssetHasPurchase",
                                                ClassId: "001556ed-3ad5-5640-fee8-beb748da9e03",
                                                ProjectionId: "376FEAFF-84BE-25F5-0AD0-E591F843479C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_PurchaseHasCostCenter.DisplayName": "CostCenter", "Target_PurchaseHasPurchaseOrder.DisplayName": "PurchaseOrder", "Target_PurchaseHasInvoice.DisplayName": "Invoice", "Currency.Name": "Currency", Cost: "Cost", "Target_PurchaseHasVendor.DisplayName": "Vendor" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "HWTotalCost", HideLabel: false }
                                        ]
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
                                name: "Target_HardwareAssetHasHardwareAsset",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_HardwareAssetHasHardwareAsset",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "Source_HardwareAssetHasHardwareAsset",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_HardwareAssetHasHardwareAsset",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "HardwareAssetType.Name": "HardwareAssetType" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedConfigurationItemSoftwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "RelatedConfigurationItemSoftwareAssets",
                                                ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus", "SoftwareAssetType.Name": "SoftwareAssetType", PurchaseCount: "PurchaseCount", InstallCount: "stringInstallCount", AuthorizedComputerCount: "AuthorizedComputerCount", UnauthorizedComputerCount: "UnauthorizedComputerCount" },
                                                ShowAddButton: false,
                                                ShowRemoveButton: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedConsumables",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { name: "", type: "multipleObjectPicker", SelectableRow: true, SelectProperty: "DisplayName", PropertyName: "Source_ConsumableHasAssignedAssets", ClassId: "C72EB9D5-5716-DC18-670E-1007CC63238A", PropertyToDisplay: { DisplayName: "DisplayName" } }
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
                                name: "WorkItemsAffectingThisConfigurationItem",
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
