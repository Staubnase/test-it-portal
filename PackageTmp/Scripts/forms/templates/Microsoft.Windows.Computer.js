{
  "Default": {
    "tabList": [
      {
                name: "General",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "CatalogItem",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "PrincipalName", PropertyName: "PrincipalName", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "UserPicker", PropertyDisplayName: "Primaryuser", PropertyName: "UsedBy"},
                                        ],
                                    },
                                    {
                                        columnFieldList: [
										{ DataType: "String", PropertyDisplayName: "DNSName", PropertyName: "DNSName", Required: false, MinLength: 0, MaxLength: 200 },
										{ DataType: "String", PropertyDisplayName: "DNSDomainname", PropertyName: "DomainDnsName", Required: false, MinLength: 0, MaxLength: 200 },
                                        //{ DataType: "Enum", PropertyDisplayName: "Manufacturer", PropertyName: "Manufacturer", EnumId: '0E82DAD7-5853-33F7-E4C0-C34C478FE70A' },
                                            
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "NetbiosComputerName", PropertyName: "NetbiosComputerName", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "NetbiosDomainName", PropertyName: "NetbiosDomainName", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "bsIPAddress", PropertyName: "IPAddress", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "MACAddress", PropertyName: "DeployedComputer[0].MACAddresses", Required: false, MinLength: 0, MaxLength: 200 },
                                            
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "ActiveDirectorySID", PropertyName: "ActiveDirectoryObjectSid", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "ActiveDirectorySite", PropertyName: "ActiveDirectorySite", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "SMBIOSAssetTag", PropertyName: "DeployedComputer[0].SMBIOSAssetTag", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "DateTime", PropertyDisplayName: "LastInventoryDate", PropertyName: "LastInventoryDate", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "SerialNumber", PropertyName: "DeployedComputer[0].SerialNumber", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: 'Boolean', PropertyDisplayName: 'IsVirtualMachine', PropertyName: 'IsVirtualMachine', Required: false, Inline: true }
                                        ]
                                    },
                                ]

                            },
                            {
                                name: "OperatingSystem",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "OperatingSystemVersionDisplayName", PropertyName: "OperatingSystem.OSVersionDisplayName", MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "BuildNumber", PropertyName: "OperatingSystem.BuildNumber", MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "SystemDrive", PropertyName: "OperatingSystem.SystemDrive", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "SerialNumber", PropertyName: "OperatingSystem.SerialNumber", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "windowsManufacturer", PropertyName: "OperatingSystem.Manufacturer", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "OSLanguage", PropertyName: "OperatingSystem.OSLanguage", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "DateTime", PropertyDisplayName: "InstallDate", PropertyName: "OperatingSystem.InstallDate", Required: false, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "WindowsDirectory", PropertyName: "OperatingSystem.WindowsDirectory", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "ProductType", PropertyName: "OperatingSystem.ProductType", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: 'Int32', PropertyDisplayName: 'PhysicalMemory', PropertyName: 'OperatingSystem.PhysicalMemory', Required: false, MinValue: 0 },
                                            { DataType: "String", PropertyDisplayName: "CountryCode", PropertyName: "OperatingSystem.CountryCode", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: 'Int32', PropertyDisplayName: 'LogicalProcessors', PropertyName: 'OperatingSystem.LogicalProcessors', Required: false, MinValue: 0 },
                                            {
                                                type: "Combo",
                                                PropertyDisplayName: "ciLocale",
                                                PropertyName: "OperatingSystem.Locale",
                                                Required: false,
                                                IsSimpleProperty: true,
                                                DataSource: {
                                                    Url: "/configItems/GetLocaleList/"
                                                }
                                            }
                                        ]
                                    },
                                ]
                            },
                            {
                                name: "ComputerDetails",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "Manufacturer", PropertyName: "DeployedComputer[0].Manufacturer", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "Model", PropertyName: "DeployedComputer[0].Model", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "PlatformType", PropertyName: "DeployedComputer[0].PlatformType", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "ISA", PropertyName: "DeployedComputer[0].ISA", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "String", PropertyDisplayName: "ChassisType", PropertyName: "DeployedComputer[0].ChassisType", Required: false, MinLength: 0, MaxLength: 200 },
											{ DataType: "String", PropertyDisplayName: "SystemType", PropertyName: "DeployedComputer[0].SystemType", Required: false, MinLength: 0, MaxLength: 200 },
                                        ]
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: 'Int32', PropertyDisplayName: 'Currenttimezone', PropertyName: 'OffsetInMinuteFromGreenwichTime', Required: false, MinValue: 0 },
                                            { DataType: 'Int32', PropertyDisplayName: 'NumberOfProcessors', PropertyName: 'DeployedComputer[0].NumberOfProcessors', Required: false, MinValue: 0 },
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "CI Information",
                                rows: [
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "Enum", PropertyDisplayName: "Status", PropertyName: "AssetStatus", EnumId: 'DF83475D-D6D1-7236-FC6D-EC8FE52022B0' },
											{ DataType: "UserPicker", PropertyDisplayName: "Custodian", PropertyName: "OwnedBy"},
                                        ]
                                    }
                                ]
                            }
                            
                        ]
                    }
                ]
      },
      {
          name: "Hardware",
          content: [
              {
                  customFieldGroupList: [
                      {
                          name: "Processors",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "LogicalDevice",
                                          ClassId: "AFE398E0-D539-05F6-6AB4-44A84701EC71",
                                          Scoped: true,
                                          Disabled: true,
                                          PropertyToDisplay: { "DisplayName": "DisplayName", "Manufacturer": "Manufacturer", MaxClockSpeed: "MaxSpeed"  },
                                          SelectableRow: true,
                                          SelectProperty: "DisplayName"
                                      }
                                  ]
                              }
                          ]
                      }, 
                      {
                          name: "NetworkAdapters",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "LogicalDevice",
                                          ClassId: "5bdd8f81-9c4a-2d59-48c5-6ea175422592",
                                          Scoped: true,
                                          Disabled: true,
                                          PropertyToDisplay: { "DisplayName": "DisplayName", "Manufacturer": "Manufacturer", MaxSpeed: "MaxSpeed"  },
                                          SelectableRow: true,
                                          SelectProperty: "DisplayName"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          name: "PhysicalHardDrives",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "LogicalDevice",
                                          ClassId: "D6CB51C3-66A7-165D-EBFB-2FC8B525967D",
                                          Scoped: true,
                                          Disabled: true,
                                          PropertyToDisplay: { Manufacturer: "Manufacturer", Model: "Model", Size: "Size"  },
                                          SelectableRow: true,
                                          SelectProperty: "Manufacturer"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          name: "LogicalHardDrives",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "LogicalDevice",
                                          ClassId: "ABF81A57-0A02-F2D9-E240-7DFD9CD58DDA",
                                          Scoped: true,
                                          Disabled: true,
                                          PropertyToDisplay: { VolumeName: "VolumeName", Size: "Size", FreeSpace: "FreeSpace", FileSystem: "FileSystem", DriveType: "DriveType", SupportsDiskQuota:"SupportsQuota", Description: "Description"  },
                                          SelectableRow: true,
                                          SelectProperty: "VolumeName"
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
          name: "Software",
          content: [
              {
                  customFieldGroupList: [
                      {
                          name: "InstalledSoftware",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "SoftwareItem",
                                          ClassId: "e88c746c-27ba-5b70-9f78-13e96ad9cffb",
                                          PropertyToDisplay: { DisplayName: "Name", Publisher: "Publisher", "RelationshipProperty.InstalledDate": "InstalledDate", "RelationshipProperty.InstalledPath": "InstalledLocation"  },
                                          SelectableRow: true,
                                          SelectProperty: "DisplayName"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          name: "Software Updates",
                          rows: [
                              {
                                  columnFieldList: [
                                      {
                                          name: "",
                                          type: "multipleObjectPicker",
                                          PropertyName: "SoftwareUpdate",
                                          ClassId: "7ccd1178-66c1-8fed-c363-e8896651453f",
                                          PropertyToDisplay: { DisplayName: "Title", Vendor: "Vendor"  },
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
                        "PropertyToDisplay": "{ \"Id\": \"Id\", \"Title\": \"Title\", \"Status.Name\": \"Status\", \"LastModified\": \"LastModified\" }",
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
                        "PropertyToDisplay": "{ \"Id\": \"Id\", \"Title\": \"Title\", \"Status.Name\": \"Status\", \"LastModified\": \"LastModified\" }",
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
          name: "Notes",
          content: [
              {
                  customFieldGroupList: [
                      {
                          name: "",
                          rows: [
                              {
                                  columnFieldList: [
                                      { DataType: "LongString", PropertyDisplayName: "Notes", PropertyName: "Notes", MinLength: 0, MaxLength: 4000 },
                                  ]
                              }
                          ]

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