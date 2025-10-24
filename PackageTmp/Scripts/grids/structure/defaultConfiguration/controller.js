/**
Default Grid Configuration settings
**/
define(function (require) {

    var definition = {
        build: function (vm, node, callback) {


            var defaultConfig = {
                autoBind: false,
                columnResizeHandleWidth: 4
            };
            
            //set up defaults for settings that were not defined
            if (!_.isUndefined(vm.grid.options)) {
                var opts = vm.grid.options;
                //reorderable
                if (_.isUndefined(opts.reorderable)) {
                    defaultConfig.reorderable = true;
                }
                //scrollable
                if (_.isUndefined(opts.scrollable)) {
                    defaultConfig.scrollable = true;
                }
                //selectable
                if (_.isUndefined(opts.selectable)) {
                    defaultConfig.selectable = "Single, Row";
                }
                //resizable
                if (_.isUndefined(opts.resizable)) {
                    defaultConfig.resizable = true;
                }
                //pageable
                if (_.isUndefined(opts.pageable)) {
                    defaultConfig.pageable = {
                        pageSizes: [10, 20, 50, 100],
                        pageSize: 20,
                        buttonCount: 10,
                        messages: {
                            
                            empty: localization.Empty,
                            of: localization.Of,
                            first: localization.First,
                            previous: localization.Previous,
                            next: localization.Next,
                            last: localization.Last,
                            itemsPerPage: localization.ItemsPerPage
                        }
                    };
                }
                //filterable
                
                if (_.isUndefined(opts.filterable) || opts.filterable == true) {
                    defaultConfig.filterable = {
                        extra: true,
                        messages: {
                            info: localization.Showitemswithvaluethat,
                            and: localization.And,
                            or: localization.Or,
                            filter: localization.Filter,
                            clear: localization.Clear
                        },
                        operators: {
                            string: {
                                eq: localizationHelper.localize("Isequalto"),
                                neq: localizationHelper.localize("Isnotequalto"),
                                contains: localizationHelper.localize("Contains"),
                                doesnotcontain: localizationHelper.localize("DoesNotContain"),
                                startswith: localizationHelper.localize("Startswith"),
                                endswith: localizationHelper.localize("Endswith"),
                            },
                            number: {
                                eq: localizationHelper.localize("Isequalto"),
                                neq: localizationHelper.localize("Isnotequalto"),
                                gt: localizationHelper.localize("GreaterThan"),
                                gte: localizationHelper.localize("GreaterOrEqual"),
                                lt: localizationHelper.localize("LessThan"),
                                lte: localizationHelper.localize("LessOrEqual"),
                            },
                            "SLOStatus": {
                                contains: localization.Contains
                            },
                            "slostatus": {
                                contains: localization.Contains
                            },
                            anchor: {
                                eq: localizationHelper.localize("Isequalto"),
                                neq: localizationHelper.localize("Isnotequalto"),
                                contains: localizationHelper.localize("Contains"),
                                doesnotcontain: localizationHelper.localize("DoesNotContain"),
                                startswith: localizationHelper.localize("Startswith"),
                                endswith: localizationHelper.localize("Endswith"),
                            },
                            date: {
                                gte: localization.GreaterOrEqual,
                                gt: localization.GreaterThan,
                                lte: localization.LessOrEqual,
                                lt: localization.LessThan
                            },
                            enums: {
                                eq: localization.Isequalto,
                                neq: localization.Isnotequalto,
                            }
                        }
                    };
                }
                //groupable
                if (_.isUndefined(opts.groupable)) {
                    defaultConfig.groupable = {
                        messages: {
                            empty: localization.Dragacolumnheader
                        }
                    };
                }
                //sortable
                if (_.isUndefined(opts.sortable)) {
                    defaultConfig.sortable = {
                        mode: "multiple"
                    };
                }
                //columnMenu
                if (_.isUndefined(opts.columnMenu)) {
                    defaultConfig.columnMenu = {
                        sortable: true,
                        filterable: true,
                        columns: true,
                        messages: {
                            columns: localization.ChooseColumns,
                            filter: localization.Filter,
                            sortAscending: localization.SortAscending,
                            sortDescending: localization.SortDescending
                        }
                    };
                }
            }
            
            if (node) {
                $.extend(true, node, defaultConfig);
            } else {
                node = defaultConfig;
            }
            if (node.editable) {
                node.selectable = false;
            }
            vm.grid.options = node;
            callback(node);
        }
    }
    return definition;
});
