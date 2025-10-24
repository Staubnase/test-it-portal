{

    tabList: [
    /*********/
    /** TAB **/
    /*********/
    {
        name: "",
        content: [
            {
                customFieldGroupList: [
                    {
                        name: "AnnouncementDetails",
                        rows: [
                             {
                                 columnFieldList: [
                                    { DataType: "String", PropertyDisplayName: "Title", PropertyName: "Title", Required: true },
                                    { DataType: "Enum", PropertyDisplayName: "Priority", PropertyName: "Priority", EnumId: "cc71e675-334a-46e8-9da1-d73461793290", Required: true }
                                 ],
                             },
                            {
                                columnFieldList: [
                                    {
                                        type: "Combo",
                                        PropertyDisplayName: "AccessGroupId",
                                        PropertyName: "AccessGroupId",
                                        IsCascading: false,
                                        Required: true,
                                        serverFiltering: true,
                                        pageSize: 500,
                                        DataSource: {
                                            Url: "/administration/Announcement/GetAdAccessGroups/"
                                        }
                                    },
                                    { DataType: "DateTime", PropertyDisplayName: "StartDate", PropertyName: "StartDate", Required: true },
                                    { DataType: "DateTime", PropertyDisplayName: "EndDate", PropertyName: "EndDate", Required: true }
                                ],
                            },
                            {
                                columnFieldList:
                                [
                                    { DataType: "Editor", PropertyDisplayName: "Body", PropertyName: "Body", Options: ["bold", "italic", "underline", "strikethrough", "foreColor", "backColor", "createLink"] }
                                ]
                            },
                        ]
                    }

                ]
            }]
    }
    ]


}
