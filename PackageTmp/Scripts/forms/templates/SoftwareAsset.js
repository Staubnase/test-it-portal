{
    "Default":
    {
        tabList: [
            {
                name: 'General',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'SoftwareAsset',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'String', PropertyDisplayName: 'SoftwareAssetName', PropertyName: 'Name', Required: true },
                                            { DataType: 'String', PropertyDisplayName: 'Version', PropertyName: 'Version', Required: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'LongString', PropertyDisplayName: 'Description', PropertyName: 'Description', Required: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'String', PropertyDisplayName: 'Manufacturer', PropertyName: 'Manufacturer', Required: false, EnumId: '0E82DAD7-5853-33F7-E4C0-C34C478FE70A' },
                                            { DataType: 'UserPicker', PropertyDisplayName: 'PrimaryUser', PropertyName: 'Target_SoftwareAssetHasPrimaryUser', Disabled: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'Organization', PropertyName: 'Target_SoftwareAssetHasOrganization', ClassId: 'ED0D8659-FBA9-6E08-C213-5CD88F5480A8', Required: false, Disabled: false },
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'Location', PropertyName: 'Target_SoftwareAssetHasLocation', ClassId: 'B1AE24B1-F520-4960-55A2-62029B1EA3F0', Required: false, Disabled: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'SupportAndMaintenanceContract', PropertyName: 'Target_SoftwareAssetHasSupportContract', ClassId: 'B2C105D4-D8C7-B57C-FE3D-205D47E07141', Required: false, Disabled: false },
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'CatalogItem', PropertyName: 'Target_SoftwareAssetHasCatalogItem', ClassId: '98fbecc7-f76a-dcd6-7b17-62cee34e38de', Required: false, Disabled: false },
                                            
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'Enum', PropertyDisplayName: 'SoftwareAssetType', PropertyName: 'SoftwareAssetType', EnumId: '43BA79D1-14F4-8466-4144-407C7F1D7734' },
                                            { DataType: 'Enum', PropertyDisplayName: 'SoftwareAssetStatus', PropertyName: 'SoftwareAssetStatus', EnumId: '2FDA317F-714C-D12C-BBB3-14A1885B92DB' }
                                        ]
                                    }
                                    ,
                                    {
                                        columnFieldList: [
                                            { DataType: 'LongString', PropertyDisplayName: 'SoftwareLibraryLocation', PropertyName: 'SoftwareLibraryLocation', Required: false, Disabled: false }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'AssociatedSoftware',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'String', PropertyDisplayName: 'SoftwarePattern', PropertyName: 'SoftwarePattern', Required: true },
                                            { DataType: 'String', PropertyDisplayName: 'VersionPattern', PropertyName: 'VersionPattern' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'WarningThresholdPercent', PropertyName: 'WarningThresholdPercent', Required: true, MinValue: 0 },
                                            { DataType: 'String', PropertyDisplayName: 'ExclusionPattern', PropertyName: 'ExclusionPattern', Required: false }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'Spacer', ColSpan: 2 },
                                            {
                                                name: "Bundle",
                                                type: "Bundle"
                                            },
                                            { DataType: 'Boolean', PropertyDisplayName: 'IsBundle', PropertyName: 'IsBundle', Inline: true, Disabled: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'LicensingMode',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'Boolean', PropertyDisplayName: 'IsOS', PropertyName: 'IsOS', Required: false, Inline: true },
                                            { DataType: 'Boolean', PropertyDisplayName: 'IsNamed', PropertyName: 'IsNamed', Required: false, Inline: true },
                                            { DataType: 'Boolean', PropertyDisplayName: 'EnableCPUMode', PropertyName: 'EnableCPUMode', Disabled: false, Inline: true },
                                            { DataType: 'Enum', PropertyDisplayName: 'CPUMode', PropertyName: 'CPUMode', EnumId: 'B6297719-4609-88A8-66AC-AEB4441CD20F', Required: true, Disabled: false }
                                        ]
                                    },
                                    //TODO: AM 7.1 to be added back for 7.1
                                    //{
                                    //    columnFieldList: [
                                    //        { DataType: 'Boolean', PropertyDisplayName: 'ScopeComputers', PropertyName: 'ScopeComputers', Disabled: false, Inline: true },
                                    //        { DataType: 'Boolean', PropertyDisplayName: 'ScopeUsers', PropertyName: 'ScopeUsers', Disabled: false, Inline: true },
                                    //        { DataType: "Spacer", ColSpan: 2 }
                                    //    ]
                                    //}
                                ]
                            },
                            {
                                name: 'PurchaseandInstallCountOptions',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'Boolean', PropertyDisplayName: 'CountAllMatches', PropertyName: 'CountAllMatches', Required: false, Inline: true },
                                            { DataType: 'Boolean', PropertyDisplayName: 'IsUnlimited', PropertyName: 'IsUnlimited', Required: false, Inline: true },
                                            { DataType: 'Boolean', PropertyDisplayName: 'CountLicenceSeats', PropertyName: 'CountLicenceSeats', Required: false, Disabled: false, Inline: true },
                                            //TODO: AM 7.1
                                            //{ DataType: 'Boolean', PropertyDisplayName: 'CountDowngradeUpgrade', PropertyName: 'CountDowngradeUpgrade', Required: false, Disabled: false, Inline: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'Boolean', PropertyDisplayName: 'ExcludeAuth', PropertyName: 'ExcludeAuth', Required: false, Disabled: false, Inline: true },
                                            { DataType: "Spacer", ColSpan: 3 }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'CountsandTotals',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'PurchaseCount', PropertyName: 'PurchaseCount', Required: true, MinValue: 0 },
                                            { DataType: 'Int32', PropertyDisplayName: 'TotalPurchaseCount', PropertyName: 'TotalPurchaseCount', Disabled: true }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'stringInstallCount', PropertyName: 'InstallCount', Disabled: true },
                                            { DataType: 'Int32', PropertyDisplayName: 'DowngradeLicenses', PropertyName: 'DowngradeLicences', MinValue: 0 }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'stringAvailableCount', PropertyName: 'AvailableCount', Disabled: true },
                                            { DataType: 'Int32', PropertyDisplayName: 'DowngradesAvailable', PropertyName: 'DowngradesAvailable', Disabled: true }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Spacer' },
                                            { DataType: 'Int32', PropertyDisplayName: 'UpgradeLicenses', PropertyName: 'UpgradeLicences', MinValue: 0 }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'AuthorizedComputerCount', PropertyName: 'AuthorizedComputerCount', Disabled: true },
                                            { DataType: 'Int32', PropertyDisplayName: 'UpgradesAvailable', PropertyName: 'UpgradesAvailable', Disabled: true }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Int32', PropertyDisplayName: 'UnauthorizedComputerCount', PropertyName: 'UnauthorizedComputerCount', Disabled: true },
                                            { DataType: 'Int32', PropertyDisplayName: 'AuthorizedInstallCount', PropertyName: 'AuthorizedInstallCount', Disabled: true }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: 'Enum', PropertyDisplayName: 'LicenseStatus', PropertyName: 'LicenceStatus', EnumId: "DF3B7857-07E8-99B8-895A-4B7AD6C7D4E6", Disabled: true },
                                            { DataType: 'DateTime', PropertyDisplayName: 'LastUpdated', PropertyName: 'LastUpdated', Disabled: true }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: 'Finance',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'Finance',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'CostCenter', PropertyName: 'Target_SoftwareAssetHasCostCenter', ClassId: '128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858' },
                                            { DataType: 'UserPicker', PropertyDisplayName: 'Custodian', PropertyName: 'OwnedBy' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'PurchaseOrder', PropertyName: 'Target_SoftwareAssetHasPurchaseOrder', ClassId: '2AFE355C-24A7-B20F-36E3-253B7249818D' },
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'Invoice', PropertyName: 'Target_SoftwareAssetHasInvoice', ClassId: 'E57C1C12-16CF-3E2D-576E-C9BE562A1A37' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: 'Date', PropertyDisplayName: 'ExpectedDate', PropertyName: 'ExpectedDate' },
                                            { DataType: 'Date', PropertyDisplayName: 'ReceivedDate', PropertyName: 'ReceivedDate' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "Currency", PropertyName: "Currency", EnumId: '0A8C6F3A-00E8-B556-0F42-423B9506E3F9' },
                                            { DataType: "Decimal", PropertyDisplayName: "Cost", PropertyName: "Cost", DecimalPlaces: 2, Required: false, MinValue: 0 },
                                            { DataType: "Spacer", ColSpan: 2 }
                                        ],
                                    }
                                ]
                            },
                            {
                                name: 'Vendor',
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: 'ObjectPicker', PropertyDisplayName: 'Vendor', PropertyName: 'Target_SoftwareAssetHasVendor', ClassId: 'F26C94F2-1045-3D60-4C1F-59B8CBFE9931' }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'RelatedLicenses',
                                rows: [
                                    {
                                        //TODO: AM 7.1 to be remove
                                        columnFieldList: [
                                            { name: '', type: 'multipleObjectPicker', SelectableRow: true, SelectProperty: "Name", PropertyName: 'Target_SoftwareAssetHasLicence', ClassId: "a3ad0993-def0-e2ff-dbcf-9ca04040a219", PropertyToDisplay: { Name: "Name", "Type.Name": "Type", "Status.Name": "Status", ExpiryDate: "ExpiryDate", AllocatedSeats: "AllocatedSeats", SeatsRemaining: "SeatsRemaining" }, Disabled: false }
                                        ]
                                    }
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                name: 'LineItem',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'RelatedPurchases',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasPurchase',
                                                ClassId: "001556ed-3ad5-5640-fee8-beb748da9e03",
                                                ProjectionId: "376FEAFF-84BE-25F5-0AD0-E591F843479C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "Target_PurchaseHasCostCenter.DisplayName": "CostCenter", "Target_PurchaseHasPurchaseOrder.DisplayName": "PurchaseOrder", "Target_PurchaseHasInvoice.DisplayName": "Invoice", "Currency.Name": "Currency", Cost: "Cost", "Target_PurchaseHasVendor.DisplayName": "Vendor" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Display", PropertyDisplayName: "", PropertyName: "SATotalCost", HideLabel: false }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: 'RelatedAssets',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'RelatedComputers',
                                rows: [
                                    {
                                        name: '',
                                        type: 'multipleObjectPicker',
                                        PropertyName: 'Target_SoftwareAssetHasRelatedComputer',
                                        ClassId: "b4a14ffd-52c8-064f-c936-67616c245b35",
                                        ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
                                        PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
                                        Disabled: true,
                                        SelectableRow: true,
                                        SelectProperty: "DisplayName"
                                    }
                                ]
                            },
                            {
                                name: 'RelatedSoftwareItem',
                                rows: [
                                    {
                                        name: '',
                                        type: 'multipleObjectPicker',
                                        PropertyName: 'Target_SoftwareAssetHasRelatedSoftwareItem',
                                        ClassId: "e88c746c-27ba-5b70-9f78-13e96ad9cffb",
                                        PropertyToDisplay: { DisplayName: "DisplayName", VersionString: "VersionString", Publisher: "Publisher", IsVirtualApplication: "IsVirtualApplication" },
                                        ShowAddButton: false,
                                        ShowRemoveButton: false,
                                        SelectableRow: true,
                                        SelectProperty: "DisplayName"
                                    }
                                ]
                            },
                            //TODO: AM 7.1
                            //{
                            //    name: 'ChildSoftwareAssets',
                            //    rows: [
                            //      {
                            //          name: '',
                            //          type: 'multipleObjectPicker',
                            //          PropertyName: 'Target_SoftwareAssetHasParent',
                            //          ClassId: "81e3da4f-e41c-311e-5b05-3ca779d030db",
                            //          PropertyToDisplay: { DisplayName: "DisplayName", },
                            //          SelectableRow: true,
                            //          SelectProperty: "DisplayName"
                            //      }
                            //    ]
                            //},
                            {
                                name: 'RelatedAssignComputer',
                                rows: [
                                    {
                                        name: '',
                                        type: 'multipleObjectPicker',
                                        PropertyName: 'Target_SoftwareAssetHasAssignedComputers',
                                        ClassId: "b4a14ffd-52c8-064f-c936-67616c245b35",
                                        ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
                                        PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
                                        Disabled: false,
                                        SelectableRow: true,
                                        SelectProperty: "DisplayName"
                                    },
                                    { DataType: 'Boolean', PropertyDisplayName: 'CountAssignedComputers', PropertyName: 'CountAssignedComputers', Required: false, Disabled: false, Inline: true }
                                ]
                            },
                            {
                                name: 'RelatedAssignUsers',
                                rows: [
                                    {
                                        name: '',
                                        type: 'multipleObjectPicker',
                                        PropertyName: 'Target_SoftwareAssetHasAssignedUsers',
                                        ClassId: "10A7F898-E672-CCF3-8881-360BFB6A8F9A",
                                        PropertyToDisplay: { DisplayName: "DisplayName", UserName: "UserName", Domain: "Domain", Title: "Title", Department: "Department", Office: "Office" },
                                        Disabled: false,
                                        SelectableRow: true,
                                        SelectProperty: "DisplayName"
                                    },
                                    { DataType: 'Boolean', PropertyDisplayName: 'CountAssignedComputers', PropertyName: 'CountAssignedUsers', Required: false, Disabled: false, Inline: true }
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                name: 'Authorization',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'AuthorizedCostCenters',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasAuthorizedCostCenters',
                                                ClassId: "128bdb2d-f5bd-f8b6-440e-e3f7d8ab4858",
                                                PropertyToDisplay: { DisplayName: "DisplayName" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'AuthorizedOrganization',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasAuthorizedOrganizations',
                                                ClassId: "ED0D8659-FBA9-6E08-C213-5CD88F5480A8",
                                                PropertyToDisplay: { DisplayName: "DisplayName" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'AuthorizedLocation',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasAuthorizedLocations',
                                                ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0",
                                                PropertyToDisplay: { DisplayName: "DisplayName" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'AuthorizedComputers',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasAuthorisedComputer',
                                                ClassId: "b4a14ffd-52c8-064f-c936-67616c245b35",
                                                ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'UnAuthorizedComputer',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'UnAuthorizedComputer',
                                                ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                                ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
                                                ShowAddButton: false,
                                                ShowRemoveButton: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    } //here
                                ]
                            },
                            {
                                name: 'AuthorizedUsers',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasAuthorisedUser',
                                                ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                                PropertyToDisplay: { DisplayName: "DisplayName", UserName: "UserName", Domain: "Domain", Title: "Title", Department: "Department", Office: "Office" },
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
                name: 'DowngradesandUpgrades',
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: 'DowngradeLicenses',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasDowngradeLicences',
                                                ClassId: "81e3da4f-e41c-311e-5b05-3ca779d030db",
                                                PropertyToDisplay: { DisplayName: "DisplayName", Version: "VersionString", "SoftwareAssetStatus.Name": "SoftwareAssetStatus", "SoftwareAssetType.Name": "SoftwareAssetType" },
                                                Disabled: false,
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: 'UpgradeLicenses',
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: '',
                                                type: 'multipleObjectPicker',
                                                PropertyName: 'Target_SoftwareAssetHasUpgradeLicences',
                                                ClassId: "81e3da4f-e41c-311e-5b05-3ca779d030db",
                                                PropertyToDisplay: { DisplayName: "DisplayName", Version: "VersionString", "SoftwareAssetStatus.Name": "SoftwareAssetStatus", "SoftwareAssetType.Name": "SoftwareAssetType" },
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
            //TODO: AM 7.1
            //{
            //    name: 'Licensing',
            //    content: [{
            //        customFieldGroupList: [
            //            {
            //                name: 'RelatedLicenses',
            //                rows: [
            //                         { name: '', type: 'multipleObjectPicker', SelectableRow: true, SelectProperty: "Name", PropertyName: 'Target_SoftwareAssetHasLicence', ClassId: "a3ad0993-def0-e2ff-dbcf-9ca04040a219", PropertyToDisplay: { Name: "Name", "Type.Name": "Type", "Status.Name": "Status", ExpiryDate: "ExpiryDate", AllocatedSeats: "AllocatedSeats", SeatsRemaining: "SeatsRemaining", "LicenceModel.Name":"LicenceModel" }, Disabled: false }
            //                ]
            //            },
            //            {
            //                name: 'LicensedComputers',
            //                rows: [
            //                  {
            //                      name: '',
            //                      type: 'multipleObjectPicker',
            //                      PropertyName: 'Target_SoftwareAssetHasLicensedComputers',
            //                      ClassId: "B4A14FFD-52C8-064F-C936-67616C245B35",
            //                      ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
            //                      PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
            //                      Disabled: true
            //                  }
            //                ]
            //            },
            //            {
            //                name: 'UnlicensedComputers',
            //                rows: [
            //                  {
            //                      name: '',
            //                      type: 'multipleObjectPicker',
            //                      PropertyName: 'UnAuthorized_SoftwareAssetHasLicensedComputers',
            //                      ClassId: "B4A14FFD-52C8-064F-C936-67616C245B35",
            //                      ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
            //                      PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
            //                      Disabled: true
            //                  }
            //                ]
            //            },
            //            {
            //                name: 'LicensedUsers',
            //                rows: [
            //                  { name: '', type: 'multipleObjectPicker', PropertyName: 'Target_SoftwareAssetHasLicensedUsers', ClassId: "10A7F898-E672-CCF3-8881-360BFB6A8F9A", PropertyToDisplay: { DisplayName: "DisplayName", Domain: "Domain", UserName: "UserName" }, Disabled: true }
            //                ]
            //            }
            //        ]
            //    }]
            //},
            {
                name: "RelatedItems",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "WorkItemsAffectingThisSoftwareAsset",
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