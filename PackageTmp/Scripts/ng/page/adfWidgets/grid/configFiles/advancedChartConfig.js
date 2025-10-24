{
    "GridType":"AdvancedChartGrid",
    "dataSource": {
        "data": []
    },
    "autoBind":false,
    "columnResizeHandleWidth":4,
    "reorderable":true,
    "scrollable":false,
    "resizable":true,
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
            "display":"{0} - {1} of {2} Items",
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