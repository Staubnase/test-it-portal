{
  "Default": {
    "tabList": [
      {
                name: "General",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "FirstName", PropertyName: "FirstName", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "Initials", PropertyName: "Initials", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "LastName", PropertyName: "LastName", Required: true, MinLength: 0, MaxLength: 200 },
                                            //{ DataType: "Enum", PropertyDisplayName: "Classification", PropertyName: "Classification", EnumId: 'DAB2F99E-83F9-25D2-62E9-278E99FD65AA' },
                                        ],
                                    },
                                    {
                                        columnFieldList: [
										    { DataType: "String", PropertyDisplayName: "DisplayAs", PropertyName: "DisplayName", Required: false, Disabled: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "UserName", PropertyName: "UserName", Required: false, Disabled: true, MinLength: 0, MaxLength: 200 },
                                            
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StreetAddress", PropertyName: "StreetAddress", Required: false, MinLength: 0, MaxLength: 400 },
											{ DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Company", PropertyName: "Company", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "City", PropertyName: "City", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Department", PropertyName: "Department", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "State", PropertyName: "State", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Office", PropertyName: "Office", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "Zip", PropertyName: "Zip", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "BusinessPhone", PropertyName: "BusinessPhone", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "Country", PropertyName: "Country", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "ciLocale",
                                                PropertyName: "Preference",
                                                IsFromList: true,
                                                FindFromListProperties: { ClassId: "efa8bbd3-3fa4-2f37-d0d5-7a6bf53be7c8", PropertyName: "LocaleID" },
                                                DataSource: {
                                                    Url: "/configItems/GetLocaleList/"
                                                }
                                            },
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "Timezone",
                                                PropertyName: "Preference",
                                                IsFromList: true,
                                                FindFromListProperties: { ClassId: "efa8bbd3-3fa4-2f37-d0d5-7a6bf53be7c8", PropertyName: "Timezone" },
                                                DataSource: {
                                                    Url: "/configItems/GetTimeZoneList/"
                                                }
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
                  "name": "WorkItemsCreatedByThisUser",
                "rows": [
                  {
                    "columnFieldList": [
                      {
                        PropertyName: "IsCreatedByUser",
                        type: "multipleObjectPicker",
                        ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                        PropertyToDisplay: { Id: "Id", Title: "Title", FullClassName: "Type", "Status.Name": "Status", LastModified: "LastModified" },
                        SelectableRow: true
                      }
                    ]
                  }
                ]
              },
              {
                  "name": "WorkItemsAffectingThisUser",
                  "rows": [
                    {
                        "columnFieldList": [
                          {
                              PropertyName: "IsCreatedForUser",
                              type: "multipleObjectPicker",
                              ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                              PropertyToDisplay: { Id: "Id", Title: "Title", FullClassName: "Type", "Status.Name": "Status", LastModified: "LastModified" },
                              SelectableRow: true
                          }
                        ]
                    }
                  ]
              },
              {
                  "name": "WorkItemsClosedByThisUser",
                  "rows": [
                    {
                        "columnFieldList": [
                          {
                              PropertyName: "ClosedByUser",
                              type: "multipleObjectPicker",
                              ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                              PropertyToDisplay: { Id: "Id", Title: "Title", FullClassName: "Type", "Status.Name": "Status", LastModified: "LastModified" },
                              SelectableRow: true
                          }
                        ]
                    }
                  ]
              },
              {
                  "name": "WorkItemsAssignedtoThisUser",
                  "rows": [
                    {
                        "columnFieldList": [
                          {
                              PropertyName: "IsAssignedToUser",
                              type: "multipleObjectPicker",
                              ClassId: "F59821E2-0364-ED2C-19E3-752EFBB1ECE9",
                              PropertyToDisplay: { Id: "Id", FullClassName: "Type", Title: "Title", "Status.Name": "Status", LastModified: "LastModified" },
                              SelectableRow: true
                          }
                        ]
                    }
                  ]
              },
              {
                  "name": "ConfigurationItemsForWhichThisUserIsACustodian",
                  "rows": [
                    {
                        "columnFieldList": [
                          {
                              PropertyName: "ConfigItem",
                              type: "multipleObjectPicker",
                              ClassId: "62F0BE9F-ECEA-E73C-F00D-3DD78A7422FC",
                              PropertyToDisplay: { DisplayName: "DisplayName", FullClassName: "Type", "Status.Name": "Status", LastModified: "LastModified" },
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
          name: "stringOrganization",
          content: [
              {
                  customFieldGroupList: [
                      {
                          name: "Manager",
                          rows: [
                              {
                                  columnFieldList: [
                                      { DataType: "String", PropertyDisplayName: "", PropertyName: "Manager.DisplayName", Required: false, Disabled:true, MinLength: 0, MaxLength: 200 },
                                  ],
                              }
                          ]

                      },
                      {
                          name: "DirectReports",
                          rows: [
                              {
                                  columnFieldList: [
                                    {
                                        PropertyName: "Manages",
                                        type: "multipleObjectPicker",
                                        ClassId: "10a7f898-e672-ccf3-8881-360bfb6a8f9a",
                                        Disabled: true,
                                        PropertyToDisplay: { FirstName: "FirstName", LastName: "LastName"},
                                        SelectableRow: false
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
          "name": "Notification",
          "content": [
            {
                "customFieldGroupList": [
                  {
                      name: "NotificationAddresses",
                      rows: [
                        {
                            columnFieldList: [
                              {
                                  PropertyName: "Preference",
                                  type: "multipleObjectPicker",
                                  ClassId: "c08e20e3-c0fe-66b8-8c12-bcc1f3f11d5d",
                                  Scoped: true,
                                  Disabled: true,
                                  PropertyToDisplay: { DisplayName: "DisplayName", Desciption: "Description", ChannelName: "Channel", TargetAddress: "Address"},
                                  SelectableRow: false
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
          name: "ComputersandDevices",
          content: [
              {
                  customFieldGroupList: [
                      {
                          name: "UsersComputers",
                          rows: [
                              {
                                  columnFieldList: [
                                    {
                                        PropertyName: "Uses",
                                        type: "multipleObjectPicker",
                                        ClassId: "ea99500d-8d52-fc52-b5a5-10dcd1e9d2bd",
                                        Disabled: true,
                                        PropertyToDisplay: { DisplayName: "Name", "ObjectStatus.Name":"Status", LastModified:"LastModified"},
                                        SelectableRow: false
                                    }
                                  ]
                              }
                          ]

                      },
                      {
                          name: "UsersDevices",
                          rows: [
                              {
                                  columnFieldList: [
                                    {
                                        PropertyName: "ConfigItem",
                                        type: "multipleObjectPicker",
                                        ClassId: "7AD221E0-E4BB-39A8-6514-33B60BBA46F5",
                                        Scoped: true,
                                        Disabled: true,
                                        PropertyToDisplay: { DisplayName: "Name", "ObjectStatus.Name":"Status", LastModified:"LastModified"},
                                        SelectableRow: false
                                    }
                                  ]
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