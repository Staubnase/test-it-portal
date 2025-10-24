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
                                name: "License",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "LicenceName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 },
                                            //TODO: AM 7.1 to be added back for 7.1
                                            //{ DataType: "Enum", PropertyDisplayName: "LicenceModel", PropertyName: "LicenceModel", EnumId: 'BAEE5C8C-39C4-1F63-C31B-15689561D1D1' }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Enum", PropertyDisplayName: "LicenseType", PropertyName: "Type", Required: true, EnumId: 'E293AD08-8875-CF59-2346-D22F1F4EB62B' },
                                            { DataType: "Enum", PropertyDisplayName: "LicenseStatus", PropertyName: "Status", EnumId: 'E4B2CD96-C4D7-69D1-BF4B-4D62B83ED74F', Disabled: true }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Date", PropertyDisplayName: "ExpiryDate", PropertyName: "ExpiryDate", Disabled: false },
                                            { DataType: "String", PropertyDisplayName: "Version", PropertyName: "Version", Required: false, MinLength: 0, MaxLength: 200 }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "ObjectPicker", PropertyDisplayName: "CostCenter", PropertyName: "Target_LicenceHasCostCenter", Required: false, ClassId: "128BDB2D-F5BD-F8B6-440E-E3F7D8AB4858" },
                                            { DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy", Disabled: false }
                                        ]
                                    },
                                    //TODO: AM 7.1 to be added back for 7.1
                                    //{
                                    //    columnFieldList:
                                    //    [
                                    //         { DataType: "ObjectPicker", PropertyDisplayName: "Organization", PropertyName: "Target_LicenceHasOrganization", Required: false, ClassId: "ed0d8659-fba9-6e08-c213-5cd88f5480a8" },
                                    //         { DataType: "ObjectPicker", PropertyDisplayName: "Location", PropertyName: "Target_LicenceHasLocation", Required: false, ClassId: "b1ae24b1-f520-4960-55a2-62029b1ea3f0" }
                                    //    ]
                                    //},
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "LicenseKey", PropertyName: "Key", MinLength: 0, MaxLength: 4000, IsVisible: true }
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Int32", PropertyDisplayName: "AllocatedSeats", PropertyName: "AllocatedSeats", Required: false, MinLength: 0, MaxLength: 200, MinValue: 0 },
                                            { DataType: "Int32", PropertyDisplayName: "SeatsRemaining", PropertyName: "SeatsRemaining", Required: false, Disabled: true, MinLength: 0, MaxLength: 200 }
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
                                            { DataType: "ObjectPicker", PropertyDisplayName: "VendorName", PropertyName: "Target_LicenceHasVendor", Required: false, ClassId: "F26C94F2-1045-3D60-4C1F-59B8CBFE9931" }
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
                name: "Assignment",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedAssignedComputers",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_LicenceHasAssignedComputers",
                                                ClassId: "B4A14FFD-52C8-064F-C936-67616C245B35",
                                                Disabled: false,
                                                ProjectionId: "C95D4106-3F24-D3CC-232E-9F51198B295C",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "UsedBy.DisplayName": "PrimaryUser", "OwnedBy.DisplayName": "Custodian" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "ListToUsedSeats", Label: "ListToUsedSeats", PropertyName: "CountAssignedComputers", Disabled: false, Inline: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "RelatedAssignedUser",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Target_LicenceHasAssignedUsers",
                                                ClassId: "10A7F898-E672-CCF3-8881-360BFB6A8F9A",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", UserName: "UserName", Domain: "Domain", Title: "Title", Department: "Department", Office: "Office" },
                                                HiddenProperty: "FirstName,LastName,Company",
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }, {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "ListToUsedSeats", Label: "ListToUsedSeats", PropertyName: "CountAssignedUsers", Disabled: false, Inline: true }
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
                                name: "RelatedSoftwareAssets",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_SoftwareAssetHasLicence",
                                                ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB",
                                                Disabled: false,
                                                PropertyToDisplay: { DisplayName: "DisplayName", "SoftwareAssetStatus.Name": "SoftwareAssetStatus" },
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
            /*********/
            /** TAB **/
            /*********/
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
