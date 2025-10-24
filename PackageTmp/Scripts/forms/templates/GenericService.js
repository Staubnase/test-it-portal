{
    "Default": {
        "tabList": [
            {
                name: "General",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "ServiceMapProperties",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "DisplayName", PropertyName: "DisplayName", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "Enum", PropertyDisplayName: "Classification", PropertyName: "Classification", EnumId: 'DAB2F99E-83F9-25D2-62E9-278E99FD65AA' },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "OwnedByOrganization", PropertyName: "OwnedByOrganization", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "Enum", PropertyDisplayName: "Priority", PropertyName: "Priority", EnumId: 'C272E3A4-8F75-5E1A-032E-6F68C788DDC8' },

                                        ],
                                    },
                                    {
                                        columnFieldList:
                                            [
                                                { DataType: "Enum", PropertyDisplayName: "Status", PropertyName: "Status", EnumId: '883EF020-BB9C-2102-32A5-B60DBE2F9BCA' },
                                                { DataType: "String", PropertyDisplayName: "AvailabilitySchedule", PropertyName: "AvailabilitySchedule", Required: false, MinLength: 0, MaxLength: 200 },
                                            ]
                                    }
                                ]

                            },
                            {
                                name: "ServiceUser",
                                rows: [
                                    {
                                        columnFieldList:
                                            [
                                                { DataType: "UserPicker", PropertyDisplayName: "ServiceOwner", PropertyName: "OwnedBy" }
                                            ]
                                    }
                                ]
                            },
                            {
                                name: "ServiceContacts",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "ServicedBy",
                                                ClassId: "eca3c52a-f273-5cdc-f165-3eb95a2b26cf",
                                                ProjectionId: "8C62F1D6-1BD6-3750-DBF3-CBD5EEB3A9DC",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "BusinessPhone": "BusinessPhone" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "ServiceCustomer",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "BusinessCustomers",
                                                ClassId: "eca3c52a-f273-5cdc-f165-3eb95a2b26cf",
                                                ProjectionId: "8C62F1D6-1BD6-3750-DBF3-CBD5EEB3A9DC",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "BusinessPhone": "BusinessPhone" },
                                                SelectableRow: true,
                                                SelectProperty: "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "AffectedUsers",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "ImpactedUser",
                                                ClassId: "eca3c52a-f273-5cdc-f165-3eb95a2b26cf",
                                                ProjectionId: "8C62F1D6-1BD6-3750-DBF3-CBD5EEB3A9DC",
                                                PropertyToDisplay: { DisplayName: "DisplayName", "BusinessPhone": "Phone" },
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
                "name": "ServiceComponents",
                "content": [
                    {
                        "customFieldGroupList": [
                            {
                                "name": "ServiceComponents",
                                "rows": [
                                    {
                                        columnFieldList: [
                                            {
                                                type: "serviceComponents"
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
                "name": "ServiceDependent",
                "content": [
                    {
                        "customFieldGroupList": [
                            {
                                "name": "ServiceDependent",
                                "rows": [
                                    {
                                        columnFieldList: [
                                            {
                                                type: "dependentComponents"
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
                "name": "RelatedItems",
                "content": [
                    {
                        "customFieldGroupList": [
                            {
                                "name": "WIAffectCI",
                                "rows": [
                                    {
                                        "columnFieldList": [
                                            {
                                                "PropertyName": "IsAboutConfigItems",
                                                "type": "multipleObjectPicker",
                                                "ClassId": "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                                                "PropertyToDisplay": { "Id": "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                "SelectableRow": true,
                                                "SelectProperty": "Id"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "WorkItems",
                                "rows": [
                                    {
                                        "columnFieldList": [
                                            {
                                                "PropertyName": "RelatesToWorkItem",
                                                "type": "multipleObjectPicker",
                                                "ClassId": "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                                                "PropertyToDisplay": { Id: "Id", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                                                "SelectableRow": true,
                                                "SelectProperty": "Id"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "ConfigurationItemsComputersServicesAndPeaple",
                                "rows": [
                                    {
                                        "columnFieldList": [
                                            {
                                                "PropertyName": "TargetConfigItem",
                                                "type": "multipleObjectPicker",
                                                "ClassId": "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC",
                                                "PropertyToDisplay": "{ \"DisplayName\": \"DisplayName\", \"FullClassName\": \"Type\", \"ObjectStatus.Name\": \"ObjectStatus\", \"LastModified\": \"LastModified\" }",
                                                "SelectableRow": true,
                                                "SelectProperty": "DisplayName"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "KnowledgeArticles",
                                "rows": [
                                    {
                                        "columnFieldList": [
                                            {
                                                "PropertyName": "KnowledgeDocument",
                                                "type": "multipleObjectPicker",
                                                "ClassId": "CA1410D8-6182-1531-092B-D2232F396BB8",
                                                "PropertyToDisplay": "{ \"ArticleId\": \"ArticleId\", \"Title\": \"Title\", \"LastModified\": \"LastModified\" }",
                                                "SelectableRow": true,
                                                "SelectProperty": "ArticleId"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "FileAttachments",
                                "type": "fileAttachmentsDragDrop"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "History",
                "content": [
                    {
                        "customFieldGroupList": [
                            {
                                "name": "History",
                                "type": "history"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}