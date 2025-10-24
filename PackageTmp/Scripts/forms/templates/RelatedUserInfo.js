{
    "Default":{
        layoutType: "formPanelFull",
        tabList: [
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Details",
                    content: [
                        {
                            customFieldGroupList: [
                                    {
                                        name: "General",
                                        rows: [
                                            {
                                                columnFieldList: [
                                                    { DataType: "Display", PropertyDisplayName: "Title", PropertyName: "Title"},
                                                    { DataType: "Display", PropertyDisplayName: "FirstName", PropertyName: "FirstName" },
                                                    { DataType: "Display", PropertyDisplayName: "Initials", PropertyName: "Initials"},
                                                    { DataType: "Display", PropertyDisplayName: "LastName", PropertyName: "LastName"},
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        name: "Contact",
                                        rows: [{
                                            columnFieldList: [
                                                { DataType: "Display", PropertyDisplayName: "Email", PropertyName: "Email", ColSpan: 1},
                                                { DataType: "Display", PropertyDisplayName: "Mobile", PropertyName: "Mobile"},
                                                { DataType: "Display", PropertyDisplayName: "HomePhone", PropertyName: "HomePhone"},
                                                { DataType: "Display", PropertyDisplayName: "HomePhone2", PropertyName: "HomePhone2" },
                                            ]
                                        },
                                            {
                                                columnFieldList: [
                                                    { DataType: "Display", PropertyDisplayName: "BusinessPhone", PropertyName: "BusinessPhone"},
                                                    { DataType: "Display", PropertyDisplayName: "BusinessPhone2", PropertyName: "BusinessPhone2"},
                                                    { DataType: "Display", PropertyDisplayName: "Fax", PropertyName: "Fax" },
                                                    { DataType: "Spacer"}
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        name: "Location",
                                        rows: [
                                           {
                                               columnFieldList: [
                                                   { DataType: "Display", PropertyDisplayName: "Office", PropertyName: "Office"},
                                                   { DataType: "Display", PropertyDisplayName: "StreetAddress", PropertyName: "StreetAddress"},
                                                   { DataType: "Display", PropertyDisplayName: "State", PropertyName: "State"},
                                                   { DataType: "Display", PropertyDisplayName: "Zip", PropertyName: "Zip" }

                                               ]
                                           },
                                           {
                                               columnFieldList: [
                                                   { DataType: "Display", PropertyDisplayName: "Company", PropertyName: "Company"},
                                                   { DataType: "Display", PropertyDisplayName: "Department", PropertyName: "Department"},
                                                   { DataType: "Display", PropertyDisplayName: "OrganizationalUnit", PropertyName: "OrganizationalUnit" },
                                                   { DataType: "Spacer"}
                                               ]
                                           }
                                        ]
                                    },
                                    {
                                        name: "OtherInformation",
                                        rows: [
                                       {
                                           columnFieldList: [
                                               { DataType: "Display", PropertyDisplayName: "Notes", PropertyName: "Notes" }
                                           ]
                                       }
                                        ]
                                    }
                            ]
                        }]
                },
                /*********/
                /** TAB **/
                /*********/
                {
                    name: "Assets",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "RelatedHardwareAssets",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                 { name: "", type: "multipleObjectPicker", PropertyName: "Source_HardwareAssetHasPrimaryUser", ClassId: "C0C58E7F-7865-55CC-4600-753305B9BE64",PropertyToDisplay: {DisplayName:"DisplayName","HardwareAssetStatus.Name":"HardwareAssetStatus",LastModified:"LastModified"}, Disabled: false,ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "DisplayName"  }
                                            ],
                                        }
                                    ]
                                },
                                {
                                    name: "RelatedSoftwareAssets",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                 { name: "", type: "multipleObjectPicker", PropertyName: "Source_SoftwareAssetHasPrimaryUser", ClassId: "81E3DA4F-E41C-311E-5B05-3CA779D030DB", PropertyToDisplay: {DisplayName:"DisplayName","SoftwareAssetStatus.Name":"SoftwareAssetStatus",LastModified:"LastModified"},Disabled: false,ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "DisplayName"  }
                                            ],
                                        }
                                    ]
                                },
                                {
                                    name: "Computer",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                 { name: "", type: "multipleObjectPicker", PropertyName: "computers", ClassId: "B4A14FFD-52C8-064F-C936-67616C245B35", PropertyToDisplay: {DisplayName:"DisplayName","ObjectStatus.Name":"ObjectStatus",LastModified:"LastModified"},Disabled: false,ShowAddButton: false, ShowRemoveButton: false  }
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
                    name: "Requests",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "UserRequest",
                                    rows: [
                                        {
                                            columnFieldList: [
                                                 { name: "", type: "multipleObjectPicker", PropertyName: "MyRequest", ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9", PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "Id" }
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
                    name: "AssignedWorkItems",
                    content: [
                        {
                            customFieldGroupList: [
                                {
                                    name: "UsersAssignedWorkItems",
                                    rows: [
                                       {
                                           columnFieldList: [
                                                { name: "", type: "multipleObjectPicker", PropertyName: "IsAssignedToUser", ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9", PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "Id" }
                                           ],
                                       }
                                    ]
                                }
                            ]
                        }
                    ]
                }
        ]
    },
    "withOutAsset":{
            layoutType: "formPanelFull",
            tabList: [
                    /*********/
                    /** TAB **/
                    /*********/
                    {
                        name: "Details",
                        content: [
                            {
                                customFieldGroupList: [
                                    {
                                        name: "General",
                                        rows: [
                                            {
                                            columnFieldList: [
                                                { DataType: "Display", PropertyDisplayName: "Title", PropertyName: "Title"},
                                                { DataType: "Display", PropertyDisplayName: "FirstName", PropertyName: "FirstName" },
                                                { DataType: "Display", PropertyDisplayName: "Initials", PropertyName: "Initials"},
                                                { DataType: "Display", PropertyDisplayName: "LastName", PropertyName: "LastName"},
                                            ]
                                            }
                                        ]
                                    },
                                    {
                                        name: "Contact",
                                        rows: [{
                                                columnFieldList: [
                                                    { DataType: "Display", PropertyDisplayName: "Email", PropertyName: "Email", ColSpan: 1},
                                                    { DataType: "Display", PropertyDisplayName: "Mobile", PropertyName: "Mobile"},
                                                    { DataType: "Display", PropertyDisplayName: "HomePhone", PropertyName: "HomePhone"},
                                                    { DataType: "Display", PropertyDisplayName: "HomePhone2", PropertyName: "HomePhone2" },
                                                ]
                                            },
                                            {
                                                columnFieldList: [
                                                    { DataType: "Display", PropertyDisplayName: "BusinessPhone", PropertyName: "BusinessPhone"},
                                                    { DataType: "Display", PropertyDisplayName: "BusinessPhone2", PropertyName: "BusinessPhone2"},
                                                    { DataType: "Display", PropertyDisplayName: "Fax", PropertyName: "Fax" },
                                                    { DataType: "Spacer"}
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        name: "Location",
                                        rows: [
                                           {
                                               columnFieldList: [
                                                   { DataType: "Display", PropertyDisplayName: "Office", PropertyName: "Office"},
                                                   { DataType: "Display", PropertyDisplayName: "StreetAddress", PropertyName: "StreetAddress"},
                                                   { DataType: "Display", PropertyDisplayName: "State", PropertyName: "State"},
                                                   { DataType: "Display", PropertyDisplayName: "Zip", PropertyName: "Zip" }

                                               ]
                                           },
                                           {
                                               columnFieldList: [
                                                   { DataType: "Display", PropertyDisplayName: "Company", PropertyName: "Company"},
                                                   { DataType: "Display", PropertyDisplayName: "Department", PropertyName: "Department"},
                                                   { DataType: "Display", PropertyDisplayName: "OrganizationalUnit", PropertyName: "OrganizationalUnit" },
                                                   { DataType: "Spacer"}
                                               ]
                                           }
                                        ]
                                    },
                                    {
                                        name: "OtherInformation",
                                        rows: [
                                       {
                                           columnFieldList: [
                                               { DataType: "Display", PropertyDisplayName: "Notes", PropertyName: "Notes" }
                                           ]
                                       }
                                        ]
                                    }
                                ]
                            }]
                    },
                    /*********/
                    /** TAB **/
                    /*********/
                    {
                        name: "Assets",
                        content: [
                            {
                                customFieldGroupList: [
                                    {
                                        name: "Computer",
                                        rows: [
                                            {
                                                columnFieldList: [
                                                     { name: "", type: "multipleObjectPicker", PropertyName: "computers", ClassId: "B4A14FFD-52C8-064F-C936-67616C245B35", PropertyToDisplay: {DisplayName:"DisplayName","ObjectStatus.Name":"ObjectStatus",LastModified:"LastModified"},Disabled: false,ShowAddButton: false, ShowRemoveButton: false  }
                                                ],
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Requests",
                        content: [
                            {
                                customFieldGroupList: [
                                    {
                                        name: "UserRequest",
                                        rows: [
                                            {
                                                columnFieldList: [
                                                     { name: "", type: "multipleObjectPicker", PropertyName: "MyRequest", ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9", PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "Id" }
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
                        name: "AssignedWorkItems",
                        content: [
                            {
                                customFieldGroupList: [
                                    {
                                        name: "UsersAssignedWorkItems",
                                        rows: [
                                           {
                                               columnFieldList: [
                                                    { name: "", type: "multipleObjectPicker", PropertyName: "IsAssignedToUser", ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9", PropertyToDisplay: {Id:"Id",Title:"Title","Status.Name":"Status",LastModified:"LastModified"},ShowAddButton: false, ShowRemoveButton: false, SelectableRow: true, SelectProperty: "Id" }
                                               ],
                                           }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
            ]
    }
}