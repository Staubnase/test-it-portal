{
    "Default":{
        layoutType: "formPanelFull",
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
                                name: "Profile",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "String", PropertyDisplayName: "FirstName", PropertyName: "givenName", Disabled: true },
                                            { DataType: "String", PropertyDisplayName: "LastName", PropertyName: "sn", Disabled: true },
                                            { DataType: "String", PropertyDisplayName: "DisplayName", PropertyName: "displayName", Disabled: true },
                                            { DataType: "String", PropertyDisplayName: "MobilePhone", PropertyName: "mobile", Disabled: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "EmailAddresses", PropertyName: "proxyAddresses", Rows: 3, Disabled: true },
                                            { DataType: "String", PropertyDisplayName: "AddEmailAddress", PropertyName: "new_proxyAddresses", Disabled: true },
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "LongString", PropertyDisplayName: "OtherMobilePhone", PropertyName: "otherMobile", Rows: 3, Disabled: true },
                                            { DataType: "String", PropertyDisplayName: "AddOtherMobilePhone", PropertyName: "new_otherMobile", Disabled: true }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "LanguageSettings",
                                rows: [
                                    {
                                        columnFieldList: [
                                            {
                                                type: "DropDownList",
                                                PropertyDisplayName: "Language",
                                                PropertyName: "LanguageCode",
                                                Required: true,
                                                DataSource: {
                                                    Url: "/Settings/User/GetAvailableLanguages/",
                                                }
                                            },
                                            {
                                                type: "DropDownList",
                                                PropertyDisplayName: "DateLanguage",
                                                PropertyName: "LanguageCodeDateTime",
                                                Required: true,
                                                DataSource: {
                                                    Url: "/Settings/User/GetAvailableLanguagesDateTime/",
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "TeamsNotificationSettings",
                                rows: [
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "WorkItemAssignment", PropertyName: "WorkItemAssignment", Inline: true, Disabled: true },
                                            { DataType: "Boolean", PropertyDisplayName: "ReviewActivityAwaitingApproval", PropertyName: "ReviewActivityAwaitingApproval", Inline: true, Disabled: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "CommentAddToWorkItem", PropertyName: "CommentToWorkItem", Inline: true, Disabled: true },
                                            { DataType: "Boolean", PropertyDisplayName: "ManualActivityAwaitingCompletion", PropertyName: "ManualActivityAwaitingCompletion", Inline: true, Disabled: true }
                                        ]
                                    },
                                    {
                                        columnFieldList: [
                                            { DataType: "Boolean", PropertyDisplayName: "ChangeWorkItemStatus", PropertyName: "ChangeWorkItemStatus", Inline: true, Disabled: true }
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