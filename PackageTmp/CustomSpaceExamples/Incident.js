{  
        tabList:
            [
                {
                    name: "Main",
                    content: 
                    [
                        {
                            customFieldGroupList:
                            [
                                {
                                    name: "General",
                                    rows: 
                                    [
                                        {
                                            columnFieldList: [
                                                { Id: "mybutton", DataType: "Button", Action: "someAction", ButtonType: "warning", PropertyDisplayName: "My custom button", PropertyName: "mybutton", ColSpan: 2 },
                                            ],
                                        },
                                        { // AssignedUser,Alternate Contact Method,Caller
                                            columnFieldList:
                                            [
                                                { DataType: "UserPicker", PropertyDisplayName: "AssignedUser", PropertyName: "RequestedWorkItem", ExtraProps: "BusinessPhone,Country", Required: true },
                                                { DataType: "String", PropertyDisplayName: "Alternatecontactmethod", PropertyName: "ContactMethod" },
                                                { DataType: "UserPicker", PropertyDisplayName: "Caller", PropertyName: "Caller" },
                                            ]
                                        },
                                        { // Title
                                            columnFieldList: 
                                            [
                                                { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true }
                                            ]
                                        },
                                        { // Description
                                            columnFieldList: 
                                            [
                                                { DataType: "LongString", PropertyDisplayName: "Description", PropertyName: "Description", Required: true  }
                                            ]
                                        },
                                        { // Classification, Source
                                            columnFieldList: 
                                            [
                                                { DataType: "Enum", PropertyDisplayName: "Classification", PropertyName: "Classification", EnumId: '1f77f0ce-9e43-340f-1fd5-b11cc36c9cba' },
                                                { DataType: "Enum", PropertyDisplayName: "Source", PropertyName: "Source", EnumId: '5d59071e-69b3-7ef4-6dee-aacc5b36d898' },
                                            ]
                                        },
                                        {// Impact, Urgency, Priority
                                            columnFieldList: 
                                            [
                                                    { DataType: "Enum", PropertyDisplayName: "Impact", PropertyName: "Impact", EnumId: '11756265-f18e-e090-eed2-3aa923a4c872', Required: true },
                                                    { DataType: "Enum", PropertyDisplayName: "Urgency", PropertyName: "Urgency", EnumId: '04b28bfb-8898-9af3-009b-979e58837852', Required: true },
                                                    { DataType: "String", PropertyDisplayName: "Priority", PropertyName: "Priority", Disabled: true },
                                            ]
                                        },
                                        {// Support Group, Assigned To, Primary Owner
                                            columnFieldList: 
                                            [
                                                { DataType: "Enum", PropertyDisplayName: "SupportGroup", PropertyName: "TierQueue", EnumId: 'c3264527-a501-029f-6872-31300080b3bf', Disabled: true  },
                                                { DataType: "UserPicker", PropertyDisplayName: "AssignedTo", PropertyName: "AssignedWorkItem", Disabled: true  },
                                                { DataType: "UserPicker", PropertyDisplayName: "PrimaryOwner", PropertyName: "RelatesToIncident", Disabled: true  },
                                            ]
                                        }                    
                                    ]
                                },
                                    { // predefined customFieldGroup
                                        name: "Activities",
                                        type: "activities"
                                    },
                                {
                                    name: "Action Log",
                                    type: "actionLog"
                                },
                                {
                                    name: "File Attachments",
                                    type: "fileAttachments"
                                },
                                {
                                    name: "Child Work Items",
                                    type: "childWorkItems"
                                }
                            ]
                        }
                    ]
                },
                {
                    name:"Remedy Integration",
                    content: 
                    [
                        {
                            customFieldGroupList:
                            [
                                {
                                    name: "General",
                                    rows:
                                    [
                                        {
                                            columnFieldList: 
                                            [
                                                { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title" },
                                                { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title" }                        
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

