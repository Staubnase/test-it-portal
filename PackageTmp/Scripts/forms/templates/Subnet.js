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
                                name: "Subnet",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "SubnetName", PropertyName: "Name", Required: true, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "IPAddress", PropertyName: "IPMask", Required: true, MinLength: 0, MaxLength: 200 },
                                            { DataType: "String", PropertyDisplayName: "SubnetMask", PropertyName: "SubnetMask", Required: true, MinLength: 0, MaxLength: 200 }
                                        ],
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Display", PropertyDisplayName: "SubnetMessage", PropertyName: "SubnetMaskMessage", HideLabel: false }
                                        ],
                                    },
                                    {
                                        columnFieldList:
                                        [
                                            { DataType: "LongString", PropertyDisplayName: "StandardNotes", PropertyName: "Notes", Required: false, MinLength: 0, MaxLength: 4000 }
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
                name: "RelatedLocations",
                content: [
                    {
                        customFieldGroupList: [
                            {
                                name: "RelatedLocations",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                name: "",
                                                type: "multipleObjectPicker",
                                                PropertyName: "Source_LocationHasSubnet",
                                                ClassId: "B1AE24B1-F520-4960-55A2-62029B1EA3F0",
                                                PropertyToDisplay: { Name: "LocationName", LocationAddress1: "AddressLine1", LocationAddress2: "AddressLine2", LocationCity: "City", LocationCountry: "Country" },
                                                SelectableRow: true,
                                                SelectProperty: "Name",
                                                Disabled: false
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
