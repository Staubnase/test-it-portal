{
    "GridType":"QueryBuilderGrid",
    "dataSource": {
        "data": []
    },
    "columns":[
        {
            "DataType":"String",
            "field":"Icon",
            "width":50,
            "filterable":false,
            "attributes":{
                "class":"icon-column grid-highlight-column"
            },
            "template":"<a href='/Search/RedirectToWorkItem?searchText=#:(ParentWorkItemId) ? ParentWorkItemId : Id#'>\u003cimg class=\u0027gridicon\u0027 src=\u0027/Content/Images/Icons/WorkTypeIcons/#:data.Icon#\u0027 alt=\u0027#:data.Icon#\u0027 /\u003e</a>"
        },
        {
            "DataType":"numeric",
            "field":"NumericId",
            "hidden":false,
            "title": "Id",
            "width": 80,
            "attributes":{
                "class":"grid-highlight-column"
            },
            "template": "<a href='/Search/RedirectToWorkItem?searchText=#:(ParentWorkItemId) ? ParentWorkItemId : Id#'>#:Id#</a>"
        },
        {
            "DataType":"string",
            "field":"Id",
            "title":"StringId",
            "hidden":true,
            "width":80,
            "attributes":{
                "class":"grid-highlight-column"
            },
            "template": "<a href='/Search/RedirectToWorkItem?searchText=#:(ParentWorkItemId) ? ParentWorkItemId : Id#'>#:Id#</a>"
        },
        {
            "DataType":"string",
            "field":"Title",
            "width":350,
            "attributes":{
                "class":"grid-highlight-column-title grid-highlight-column"
            },
            "template": "<a href='/Search/RedirectToWorkItem?searchText=#:(ParentWorkItemId) ? ParentWorkItemId : Id#'>#:Title#</a>"
        },
        {
            "DataType":"string",
            "field":"Status",
            "width":100
        },
        {
            "DataType":"string",
            "field":"AssignedUser",
            "analystOnly":true,
            "width":150
        },
        {
            "DataType":"string",
            "field":"Priority",
            "width":90
        },
        {
            "DataType":"string",
            "field":"Category",
            "width":110
        },
        {
            "DataType":"string",
            "field":"AffectedUser",
            "width":150
        },
        {
            "DataType":"string",
            "field":"Tier",
            "title":"SupportGroup",
            "width":150
        },
        {
            "DataType":"datetime",
            "field":"LastModified",
            "width":100
        },
        {
            "DataType":"DateTime",
            "field":"ScheduledStartDate",
            "width":100,
            "hidden":true
        },
        {
            "DataType":"DateTime",
            "field":"ScheduledEndDate",
            "width":100,
            "hidden":true
        },
        {
            "DataType":"string",
            "field":"BaseId",
            "hidden":true
        },
        {
            "DataType":"string",
            "field":"ParentWorkItemId",
            "hidden":true
        },
        {
            "DataType":"string",
            "field":"ParentWorkItemType",
            "hidden":true
        }
    ],
    "autoBind":false,
    "columnResizeHandleWidth":4,
    "reorderable":true,
    "scrollable":true,
    "resizable":true,
    "selectable":true,
    "pageable":{
        "pageSizes":[
            10,
            20,
            50,
            100
        ],
        "pageSize":10,
        "buttonCount":10,
        "messages":{

            "empty":"Empty",
            "of":"Of",
            "first":"First",
            "previous":"Previous",
            "next":"Next",
            "last":"Last",
            "itemsPerPage":"items per page"
        }
    },
    "filterable":{
        "extra":true,
        "messages":{
            "info":"Show items with value that",
            "and":"And",
            "or":"Or",
            "filter":"Filter",
            "clear":"Clear"
        },
        "operators":{
            "string":{
                "eq":"Is equal to",
                "neq":"Is not equal to",
                "contains":"Contains",
                "doesnotcontain":"Does not contain",
                "startswith":"Starts with",
                "endswith":"Ends with"
            },
            "number":{
                "eq":"Is equal to",
                "neq":"Is not equal to",
                "gt":"Is greater than",
                "gte":"Is greater than or equal to",
                "lt":"Is less than",
                "lte":"Is less than or equal to"
            },
            "date":{
                "gte":"Is greater than or equal to",
                "gt":"Is greater than",
                "lte":"Is less than or equal to",  
                "lt":"Is less than"
            },
            "SLOStatus":{
                "contains":"Contains"
            }
        }
    },
    "groupable":{
        "messages":{
            "empty":"Drag a column header and drop it here to group by that column"
        }
    },
    "sortable":{
        "mode":"multiple"
    },
    "columnMenu":{
        "sortable":true,
        "filterable":true,
        "columns":true,
        "messages":{
            "columns":"Choose Columns",
            "filter":"Filter",
            "sortAscending":"Sort Ascending",
            "sortDescending":"Sort Descending"
        }
    }
}