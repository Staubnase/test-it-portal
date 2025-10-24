{
    "Default":{
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
                            name: "General",
                            rows: [
                                {
                                    columnFieldList: [
                                        { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true, MinLength: 0, MaxLength: 200 }
                                    ],
                                },
                                {
                                    columnFieldList: [
                                        { DataType: "LongString", PropertyDisplayName: "KnowledgeArticleAbstract", PropertyName: "Abstract", Required: false, Rows: 4, MinLength: 0, MaxLength: 256 }
                                    ],
                                },
                                { 
                                    columnFieldList:
                                    [
                                        { DataType: "Enum", PropertyDisplayName: "Status", PropertyName: "Status", EnumId: '2b978582-d8a5-83bf-31c2-327a3b8a0d77', Required: true },
                                        { DataType: "Int32", PropertyDisplayName: "Popularity", PropertyName: "Popularity", Required: false , MinValue:1},
                                        { DataType: "Enum", PropertyDisplayName: "Language", PropertyName: "LanguageLocaleID", EnumId: 'ab188574-5d95-094b-d146-cb045e0de41a', Required : true }
                                    ]
                                },
                                {
                                    columnFieldList:
                                    [
                                            { DataType: "Enum", PropertyDisplayName: "Category", PropertyName: "KACategory", EnumId: '032d5e15-761e-e600-3e29-127e9137d926' },
                                            { DataType: "Enum", PropertyDisplayName: "Type", PropertyName: "KAType", EnumId: 'c37cb971-710a-d4d8-bbac-478013a00721' },
                                            //{ DataType: "Enum", PropertyDisplayName: "Type", PropertyName: "KAType", EnumId: '0EBBDDFE-8F21-116A-311C-A7BAA9372109' },
                                            { DataType: "UserPicker", PropertyDisplayName: "Owner", PropertyName: "RelatesToIncident", Disabled: false }
                                    ]
                                },
                                {
                                    columnFieldList: 
                                    [
                                        { DataType: "String", PropertyDisplayName: "Keywords", PropertyName: "Keywords", Required: false },
                                        { DataType: "String", PropertyDisplayName: "KnowledgeArticleVendorID", PropertyName: "VendorArticleID", Required: false },
                                        { DataType: "String", PropertyDisplayName: "KnowledgeArticleExternalURL", PropertyName: "ExternalURL", Required: false }
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
            name: "KnowledgeArticleAnalystContent",
            content: [
                {
                    customFieldGroupList: [
                        {
                            name: "KnowledgeArticleAnalystContent",
                            rows: [
                                {
                                    columnFieldList: [
                                        { DataType: "Editor", PropertyDisplayName: "", PropertyName: "AnalystContent", Required: false, Height:500 }
                                    ],
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
            name: "KnowledgeArticleEndUserContent",
            content: [
                {
                    customFieldGroupList: [
                        {
                            name: "KnowledgeArticleEndUserContent",
                            rows: [
                                {
                                    columnFieldList: [
                                        { DataType: "Editor", PropertyDisplayName: "", PropertyName: "EndUserContent", Required: false, Height: 500 }
                                    ],
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
            name: "RelatedItems",
            content: [
                {
                    customFieldGroupList: [
                        {
                            name: "ServiceOffering",
                            type: "multipleObjectPicker",
                            PropertyName: "RelatesToServiceOffering",
                            ClassId: "2c40c623-a0df-7166-9e9a-2f869fb4d93f",
                            PropertyToDisplay: { Title: "Title", BriefDescription: "BriefDescription" }
                        },
                        {
                            name: "RequestOffering",
                            type: "multipleObjectPicker",
                            PropertyName: "RelatesToRequestOffering",
                            ClassId: "8fc1cd4a-b39e-2879-2ba8-b7036f9d8ee7",
                            PropertyToDisplay: { Title: "Title", BriefDescription: "BriefDescription" }
                        }
                    ]
                }
            ]
        }
        ]
    }
    
}
