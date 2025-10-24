{
    grid:
        {
            GridType: "WorkItemSearch",
            GridContainerId: "gridContainerSearchWorkItems",
            columns: [
                { DataType: "string", field: "Id",  width: 80, attributes: { "class": "grid-highlight-column" }},
                { DataType: "numeric", field: "NumericId", hidden: true, attributes: { "class": "grid-highlight-column" }},
                { DataType: "Anchor", field: "Title", width: 350, attributes: { "class": "grid-highlight-column-title" }, template: "<a href='#var url = app.gridUtils.getLinkUrl(data, \"***\");##=url#'>#: Title # </a>" },
                { DataType: "string", field: "Status"},
                { DataType: "string", field: "AssignedUser", analystOnly: true },
                { DataType: "string", field: "Priority", width: 90},
                { DataType: "string", field: "Category", width: 110},
                { DataType: "string", field: "AffectedUser"},
                { DataType: "string", field: "Tier", title: "SupportGroup"},
                { DataType: "datetime", field: "LastModified", width: 100},
                { DataType: "DateTime", field: "ScheduledStartDate", width: 100, hidden: true},
                { DataType: "DateTime", field: "ScheduledEndDate", width: 100, hidden: true},
                { DataType: "string", field: "BaseId", hidden: true},
                { DataType: "string", field: "ParentWorkItemId", hidden: true},
                { DataType: "string", field: "ParentWorkItemType", hidden: true}
            ],
            options: {
                groupable: true,
                filterable: true
            },
            dataSourceOptions: {
                error: "todo"
            },
            dataUrl: "/Search/GetResults",
            queryParameters:
            {
                type: "stringify", //or ind to set them as individual values
                name: "searchFilters",
                params:
                [
                    {
                        name: "RecordCap",
                        value: "",
                        valueSource: "RecordCap",
                        sourceType: "page-data"
                    },
                    {
                        name: "WorkItemType",
                        value: "IR",
                        valueSource: "#WorkItemType"
                    },
                    {
                        name: "Id",
                        value: "",
                        valueSource: "#Search_Id"
                    },
                    {
                        name: "Title",
                        value: "",
                        valueSource: "#Search_Title"
                    },
                    {
                        name: "Description",
                        value: "",
                        valueSource: "#Search_Description"
                    },
                    {
                        name: "StatusId",
                        value: "",
                        valueSource: "#{{WorkItemType}}StatusId",
                        sourceType: "dynamic-query-selector"
                    },
                    {
                        name: "ClassificationId",
                        value: "",
                        valueSource: "#{{WorkItemType}}ClassificationId",
                        sourceType: "dynamic-query-selector"
                    },
                    {
                        name: "AffectedItemId",
                        value: "",
                        valueSource: "#AffectedItemValueId"
                    },
                    {
                        name: "SupportGroupId",
                        value: "",
                        valueSource: "#{{WorkItemType}}SupportGroupId",
                        sourceType: "dynamic-query-selector"
                    },
                    {
                        name: "AffectedUserId",
                        value: "",
                        valueSource: "#AffectedUserId"
                    },
                    {
                        name: "AffectedUserDept",
                        value: "",
                        valueSource: "#Search_AffectedUserDept"
                    },
                    {
                        name: "AssignedUserId",
                        value: "",
                        valueSource: "#AssignedUserId"
                    },
                    {
                        name: "CreatedFrom",
                        value: "",
                        valueSource: "#CreatedFrom"
                    },
                    {
                        name: "CreatedTo",
                        value: "",
                        valueSource: "#CreatedTo"
                    },
                    {
                        name: "CompletedFrom",
                        value: "",
                        valueSource: "#CompletedFrom"
                    },
                    {
                        name: "CompletedTo",
                        value: "",
                        valueSource: "#CompletedTo"
                    }
                ]
            }
        }
}