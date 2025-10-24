{
    "Id": "localizationGridId",
    "Definition": {
        "id": "localizationGridId",
        "type": "grid",
        "content": {
            "grid":
            {
                "GridType": "Localization",
                "GridContainerId": "localizationGrid",
                "columns":
                [
                    {
                        "DataType": "String",
                        "field": "Id",
                        "hidden": true,
                        "nullable": true,
                        "editable": false
                    },
                    {
                        "DataType": "String",
                        "field": "Key",
                        "nullable": false,
                        "editable": false,
                        "attributes": {
                            "class": "grid-highlight-column"
                        }
                    },
                    {
                        "DataType": "String",
                        "field": "English",
                        "nullable": false,
                        "editable": false
                    },
                    {
                        "DataType": "String",
                        "field": "Translation",
                        "nullable": false,
                        "editable": true
                    },
                    {
                        "DataType": "String",
                        "field": "TranslationOverride",
                        "nullable": true,
                        "editable": true
                    },
                    {
                        "DataType": "String",
                        "field": "ContextNotes",
                        "nullable": true,
                        "editable": false
                    }
                ],
                "options": {
                    "groupable": false,
                    "editable": "incell",
                    "filterable": false,
                    "sortable": false,
                    "pageable": false,
                    "selectable": false,
                    "toolbar": [
                        {
                            "name": "localizationToolbar"
                        }
                    ],
                    "noRefresh": true,
                    "noState": true
                },
                "drawerMenu": {
                    "addLocalization": {
                        "titleKey" : "AddNew",
                        "icon": "fa-plus",
                        "visible": true
                    },
                    "saveLocalization": {
                        "titleKey" : "Save",
                        "icon": "fa-check",
                        "visible": true
                    },
                    "cancelLocalization": {
                        "titleKey" : "Cancel",
                        "icon": "fa-times",
                        "visible": true
                    }
                },
                "dataSourceEndpoints": {
                    "read": { 
                        "url": "/Localizations/GetLocalizationsForLocale",
                        "type": "POST",
                        "data": {
                            "showAlreadyTranslated": false
                        }
                    },
                    "update": { 
                        "url": "/Localizations/UpdateLocalizations/",
                        "contentType": "application/json",
                        "accepts": "application/json",
                        "type": "POST",
                        "dataType": "json"
                    },
                    "create": { 
                        "url": "/Localizations/CreateLocalization/",
                        "contentType": "application/json",
                        "accepts": "application/json",
                        "type": "POST",
                        "dataType": "json"
                    }
                }
            }
        }
    },
    "TypeId": "grid"
}