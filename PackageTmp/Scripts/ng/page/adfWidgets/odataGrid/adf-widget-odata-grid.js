/* global define: true */
/* global _: true */

var var_languageField = "LanguageCode";
function addNew(widgetId, value) {
    var widget = $("#" + widgetId).getKendoMultiSelect();
    widget.options.addNew(widget, widgetId, value);
}
(function () {

    'use strict';

    define([
        'app'
    ], function ( /*app*/) {

        function ODataService($http, $q, navigationNodeService, viewPanelService) {
            return {
                getData: function (url) {
                    var deferred = $q.defer();
                    url += "?$format=json&$top=1";

                    if (url.indexOf("/Action.") > -1)
                        url += "&$count=true";

                    $.getJSON(url,
                        function (result) {
                            deferred.resolve(result.value);
                        }).fail(function (err) {
                            deferred.reject(err)
                        });

                    return deferred.promise;
                }
            };
        }

        function ODtataGridEditController($scope, config, ODataService, ODataGridConfigService, localizationService) {
            
            $scope.config = angular.extend(config, {
                isCustomMobile: config.isCustomMobile || false,
                mobGridGUID: config.mobGridGUID || ODataGridConfigService.getGuid(),
                customTemplate: config.customTemplate || '',
                given_url: config.given_url || null,
                data_url: config.data_url || null,
                queryString: config.queryString || '',
                gridColumns: config.gridColumns || [],
                allColumns: config.allColumns || [],
                gridCollection: config.gridCollection || [],
                configurationName: "odataGridConfig",
                queryParamKeys: config.queryParamKeys || [],
                filterByCurrentLang: config.filterByCurrentLang || false,
                showFilterLang: config.showFilterLang || false,
                isAddQuickActions: config.isAddQuickActions || false,
                gridQuickActions: config.gridQuickActions || ODataGridConfigService.getDefaultGridActions()
            });

            $scope.config.gridColumns = _.filter($scope.config.gridColumns,
                function (el) {
                    return !el.hidden;
                });



            var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));
            //Add new parameters
            _.each(queryParamKeys,
                function (key) {

                    var token = key.replace('{{', '').replace('}}', '');

                    var exist = _.filter(config.queryParamKeys,
                        function (item) {
                            return item.Key === token;
                        });

                    if (exist.length === 0) {
                        config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                    }
                });

            var lang = (session.user.LanguageCode) ? session.user.LanguageCode : 'ENU';

            var vm = this;
            angular.extend(vm, {
                entity: '',
                languageCodeFilter: var_languageField + " eq '" + lang + "'",
                queryInvalid: function () {
                    var invalids = ["$top", "$count", "$format", "$sort"];

                    for (var i in invalids) {
                        if (config.queryString.indexOf(invalids[i]) > -1) {
                            $('#saveAdfDialog').attr("disabled", "disabled");
                            return true;
                        }
                    }
                    $('#saveAdfDialog').removeAttr("disabled");
                    return false;
                },
                setShowFilterLang: function () {
                    var langCodeField = _.filter(config.allColumns, function (el) {
                        return el.field === var_languageField;
                    });

                    config.showFilterLang = (langCodeField.length > 0 && config.queryString.indexOf(var_languageField) === -1);
                },
                isCustomMobile: $scope.config.isCustomMobile,
                isCustomGrid: $scope.config.isCustomGrid,
                useCustomGrid: function () {
                    if (!$("#" + vm.entity + "_tpl").html()) {

                        var columns = (config.gridColumns && config.gridColumns.length > 0) ? config.gridColumns : config.allColumns;

                        var initTemplate = '<tr data-uid="#: uid #"> \n';
                        if (vm.isCustomGrid && columns.length > 0) {
                            angular.forEach(columns, function (item, index) {
                                initTemplate += '<td>' + item.template + '</td> \n';

                            });
                        }

                        initTemplate += '</tr>';

                        config.customGridTemplate = initTemplate;
                    } else {
                        config.customGridTemplate = $("#" + vm.entity + "_tpl").html();
                    }
                },
                useCustomMobile: function () {

                    var initTemplate = '<div class="gridcard gridcard--asset"> \n';

                    if (!$("#" + vm.entity + "_tpl").html()) {

                        var columns = (config.gridColumns && config.gridColumns.length > 0) ? config.gridColumns : config.allColumns;

                        if (vm.isCustomMobile && columns.length > 0) {
                            angular.forEach(columns, function (item, index) {
                                if (index == 0) {
                                    initTemplate += '<p class="gridcard__title"> \n';
                                    initTemplate += '<a href="">#: ' + item.field + ' #</a> \n </p> \n';
                                    initTemplate += '<div class="gridcard__detailblock"> \n';
                                } if (index == config.gridColumns.length - 1) {
                                    if (item.field=="CustomAction") {
                                        initTemplate += '<div>' + item.template + '</div> \n </div> \n'
                                    } else {
                                        initTemplate += '<p>' + item.template + '</p> \n </div> \n'
                                    }
                                } else {
                                    initTemplate += '<p>' + item.template + '</p> \n'
                                }
                            });
                        }
                        initTemplate += '</div>'

                        config.customTemplate = initTemplate;
                    } else {
                        config.customTemplate = $("#" + vm.entity + "_mtpl").html()
                    }
                },
                localize: function (key) {
                    return localizationService.getValue(key);
                },
                gridColumns: _.map(config.gridColumns, function (el) {
                    //return el.propertyName;
                    //return _.isUndefined(el.propertyName) ? el.title : el.propertyName;
                    return el.field;
                }),
                collections: [$scope.config.gridCollection] || [],
                onCollectionsChange: function () {
                    var url = config.given_url;
                    if (url.charAt(url.length - 1) !== "/")
                        url += "/";
                    url += $scope.config.gridCollection.field;
                    vm.configColumnMultiSelect([]); //uncomment this code again related to this issue when odata table is new. b-26087. Did testing and bug-25656 cannot replicate now.
                    vm.getColumns(url);
                    vm.setQuickActionVisibility();
                    //reset gridcolumns config on collection change
                    config.gridColumns = [];
                },
                getCollections: function (url) {
                    config.showFilterLang = false;

                    $('#columns').attr('disabled', true);
                    $('#collections').attr('disabled', true);

                    if ($("#columns").parent().hasClass("k-multiselect")) {
                        vm.gridColumns = [];
                        $("#columns").parent().replaceWith("<select id=columns disabled class=\"form-control input-sm\" ng-model=\"gridColumns\">")
                    }

                    if (!url)
                        url = config.given_url;

                    if (url) {
                        ODataService.getData(config.given_url).then(function (data) {
                            var sets = data || [];
                            if (data[0] && data[0].kind == 'EntitySet') {
                                $('#collections').removeAttr("disabled");
                                for (var i in sets) {
                                    if (sets[i].name) {
                                        vm.collections.push({
                                            field: sets[i].name,
                                            title: sets[i].name
                                        });
                                    }
                                }

                                if ($scope.config.gridCollection.length != 0) {
                                    if (url.charAt(url.length - 1) !== "/")
                                        url += "/";
                                    url += $scope.config.gridCollection.field;
                                    vm.getColumns(url);
                                }
                            } else {
                                $scope.config.gridCollection = [];
                                $scope.config.data_url = url;
                                config.allColumns = [];
                                if (config.queryString.indexOf("/Action.") > -1)
                                    vm.getColumns(url);
                                else
                                    vm.setColumns(data, url);
                            }
                        });
                    }


                },
                getColumns: function (url) {
                    $scope.config.data_url = url;
                    if (config.queryString.indexOf("/Action.") > -1) {

                        var newQueryString = config.queryString || '';

                        if (newQueryString.indexOf('@User') !== -1) {
                            newQueryString = newQueryString.replace('@User', session.user.Id);
                        }

                        if (newQueryString.indexOf('@Lang') !== -1) {
                            newQueryString = newQueryString.replace('@Lang', lang);
                        }

                        url += newQueryString;
                    }
                    ODataService.getData(url).then(function (data) {
                        config.allColumns = [];
                        var expand = app.lib.getQueryParams($scope.config.queryString);
                        if (expand.expand != undefined && data.length>0) {
                            //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                            vm.setExpandedPropertyColumns(url, expand, data);
                        }
                        else {
                            vm.setColumns(data, url);
                        }
                    });
                },
                setExpandedPropertyColumns: function (url, expand, data) {
                    //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                    $.ajax({
                        type: 'GET',
                        url: url + "?$top=1&expand=" + expand.expand,
                        async: true,
                        success: function (rel, status, xhr) {
                            if (rel.value.length > 0) {
                                _.each(expand.expand.split(","), function (relProp) {
                                    var tempProp = relProp + "_Details";
                                    var relItem = rel.value[0][tempProp];
                                    if (!_.isUndefined(relItem) && !_.isNull(relItem)) {
                                        for (var prop in relItem) {
                                            data[0][tempProp + "." + prop] = "";
                                        }
                                    }
                                });
                            }

                            vm.setColumns(data, url);
                        }
                    });
                },
                setColumns: function (data, data_url) {
                    var el = document.createElement('a');
                    el.href = data_url;
                    var path = el.pathname;
                    if (path.lastIndexOf("/") + 1 === path.length)
                        path = path.substring(0, path.length - 1);
                    vm.entity = path.substring(path.indexOf("api/") + 4, path.length);
                    if (config.queryString.indexOf("/Action.") > -1) {
                        vm.entity = path.substring(path.indexOf("api/") + 4, path.lastIndexOf("/"));
                    }

                    $('#columns').removeAttr("disabled");

                    var dbColumns = config.allColumns;

                    if (data.length > 0 && dbColumns.length == 0) {
                        
                        if (config.queryString.indexOf("/Action.") === -1 && $("#" + vm.entity + "_tpl").html()) {
                            ODataGridConfigService.getColumnConfig(vm.entity).then(function (res) {
                                vm.columnTemplate(data, res);
                            });
                        } else {
                            vm.columnTemplate(data, []);
                        }
                    } else {
                        vm.configColumnMultiSelect(dbColumns);
                    }
                },
                columnTemplate: function (data, defaultColumns) {

                    var dbColumns = [];
                    var friendlyNameList = [];
                    angular.forEach(_.keys(data[0]), function (item, index) {
                        //if (item != '__metadata' && app.lib.stringEndsWith(item, "__FriendlyName")) {
                        //    var id = item.split("__");
                        //    friendlyNameList.push({ id: id[0], name: data[0][item] });
                        //}

                        var ln = item.length;
                        var idx = ln - "__FriendlyName".length;
                        var isFriendlyNameField = (item.substr(idx) == "__FriendlyName");

                        if (item != '__metadata' && isFriendlyNameField) {



                            var id = item.split("__");
                            friendlyNameList.push({ id: id[0], name: data[0][item] });
                        }
                    });


                    angular.forEach(_.keys(data[0]), function (item, index) {
                        if (item != '__metadata') {

                            var props = item.split("__");
                            var relationshipName = "";
                            var friendlyName = item;
                            //var title = (defaultColumns[item]) ? localizationHelper.localize(defaultColumns[item].title, defaultColumns[item].title) : localizationHelper.localize(item, item);

                            var frndItem = _.find(friendlyNameList, function (fnItem) {
                                return fnItem.id == props[0];
                            });

                            if (!_.isUndefined(frndItem)) {
                                //relationshipName = frndItem.name;
                                friendlyName = item.replace(frndItem.id, frndItem.name);
                                //title = friendlyName;
                            }

                            var templ = "";
                            var dataType = '';
                            var subProp = item.split(".");
                            if (subProp.length > 1) {
                                //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                                templ = "#= (" + subProp[0] + " && " + item + ") ? " + item + " : '' #";
                            }
                            else {
                                templ = "#= (" + item + ") ? " + item + " : '' #";
                            }

                            

                            var val = data[0][item];

                            if (!val) {
                                for (var i = 1; i < data.length; i++) {
                                    if (data[i][item]) {
                                        val = data[i][item];
                                        i = data.length
                                    }
                                }
                            }

                            //check if value is null, if not then convert to string to prevent  error in replace and regex methods
                            if (val) {
                                val = val.toString();

                                //trim white spaces to prevent parsing strings ending with a number as date
                                val = val.replace(/\s+/, "");

                                var guidCheck = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

                                if (Date.parse(val) && /^\d+$/.test(val) == false && parseFloat(val)) {
                                    //prevent parsing number objects and link strings as date 
                                    templ = "#= (" + item + ") ? kendo.toString(new Date(" + item + "), 'g') : '' #";
                                    dataType = 'date';
                                } else if (parseFloat(val) && !isNaN(val)) {
                                    templ = "#= (" + item + ") ? " + kendo.toString(item, 'n') + " : 0 #";
                                    //dataType = 'number';
                                } else if (guidCheck.test(val)) {
                                    dataType = 'GUID';
                                } else {
                                    dataType = 'string';
                                }
                            }


                            var locKey = _.find(config.gridColumns, function (colKey) {
                                return colKey.field == item;
                            });
                            
                            if (_.isUndefined(locKey)) {
                                dbColumns.push({
                                    field: (defaultColumns[item]) ? defaultColumns[item].field : item,
                                    title: item,
                                    friendlyName: friendlyName,
                                    template: (defaultColumns[item]) ? defaultColumns[item].template : templ,
                                    DataType: (defaultColumns[item]) ? defaultColumns[item].DataType : dataType,
                                    hidden: (defaultColumns[item]) ? defaultColumns[item].hidden : false
                                    //localizationKey: $scope.config.stateGuid + "_col_" + propertyName
                                });
                            }
                            else {
                                dbColumns.push({
                                    field: (defaultColumns[item]) ? defaultColumns[item].field : item,
                                    title: item,
                                    friendlyName: friendlyName,
                                    template: (defaultColumns[item]) ? defaultColumns[item].template : templ,
                                    DataType: (defaultColumns[item]) ? defaultColumns[item].DataType : dataType,
                                    hidden: (defaultColumns[item]) ? defaultColumns[item].hidden : false,
                                    localizationKey: locKey.localizationKey
                                });
                            }

                        }
                    });
                    
                    vm.configColumnMultiSelect(dbColumns);
                },
                configColumnMultiSelect: function (dbColumns) {
                    if (dbColumns.length > 0) $("#columns").removeClass("form-control input-sm");
                    if (dbColumns.length > 0 && config.gridColumns.length > 0) {
                        _.each(config.gridColumns, function (item) {
                            //This will going to add manually added column into dbColumns
                            var col = _.find(dbColumns, function (col) {
                                return col.field == item.field;
                            });
                            
                            if (_.isUndefined(col)) {
                                dbColumns.push({
                                    field: item.field,
                                    title: item.field,
                                    friendlyName: item.friendlyName,
                                    template: item.template,
                                    DataType: item.DataType,
                                    hidden: item.hidden,
                                    localizationKey: item.localizationKey
                                });
                            }
                            
                        });

                    }
                    
                    config.allColumns = dbColumns;
                    vm.getColumnTranslations(config.allColumns);
                    vm.setShowFilterLang();

                    vm.selectOptions = {
                        placeholder: vm.localize("ChooseColumns"),
                        dataTextField: "title",
                        dataValueField: "title",
                        filter: "contains",
                        valuePrimitive: false,
                        autoBind: true,
                        itemTemplate: '<div>#: (localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field, data.localizationKey!=null?data.localizationKey:data.field)==data.localizationKey || localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field, data.localizationKey!=null?data.localizationKey:data.field)==data.field) ? data.friendlyName : localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field, data.localizationKey!=null?data.localizationKey:data.field) #<p>#: data.field #</p></div>',
                        tagTemplate: '<div>#: (localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field,data.localizationKey!=null?data.localizationKey:data.field)==data.localizationKey || localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field, data.localizationKey!=null?data.localizationKey:data.field)==data.field) ? data.friendlyName : localizationHelper.localize(data.localizationKey!=null?data.localizationKey:data.field, data.localizationKey!=null?data.localizationKey:data.field) #</div>',
                        change: function (e) {
                            if (config.gridColumns.length > 0)
                                $('.k-multiselect-wrap.k-floatwrap').addClass('columnsselected');
                            else
                                $('.k-multiselect-wrap.k-floatwrap').removeClass('columnsselected');

                            $("#columns_taglist > li").css("cssText", "cursor: pointer; height:inherit !important;");
                            $("#columns_taglist > li > .k-select").css("cursor", "pointer");
                        },
                        select: function (e) {
                            config.gridColumns.push(e.dataItem);
                            vm.getColumnTranslations(config.gridColumns);
                        },
                        deselect: function (e) {
                            var tempColumns = [];
                            for (var i in config.gridColumns) {
                                if (e.dataItem.field == config.gridColumns[i].field) continue;
                                tempColumns.push(config.gridColumns[i]);
                            }
                            config.gridColumns = tempColumns;
                        },
                        dataSource: new kendo.data.DataSource({
                            data: _.reject(config.allColumns, function (item) { return item.field == "CustomAction"; })//config.allColumns
                        }),
                        noDataTemplate: $("#noDataTemplate").html(),
                        value: vm.gridColumns,
                        addNew: function (widget, widgetId, value) {
                            var locKey = $scope.config.stateGuid + "_col_" + value.replace(".","");
                            var template = {
                                field: value,
                                title: value,
                                friendlyName: value,
                                template: "#= (" + value + ") ? " + value + " : '' #",
                                DataType: "string",
                                hidden: false,
                                localizationKey: locKey,
                                translations: []
                            };


                            if (config.allColumns.length > 0) {
                                var tempLoc = JSON.parse(JSON.stringify(config.allColumns[0].translations));
                                _.each(tempLoc, function (loc) {
                                    loc.Key = locKey;
                                    if (loc.Locale == session.user.LanguageCode) {
                                        loc.Translation = value;
                                    }
                                });

                                template.translations = tempLoc;
                            }

                            widget.dataSource.add(template);
                            widget.dataSource.sync();
                            config.allColumns.push(template);

                        }
                    };

                    var cols = false;

                    if ($("#columns").parent().hasClass("k-multiselect")) {
                        cols = $("#columns").data("kendoMultiSelect").setDataSource(new kendo.data.DataSource({ data: dbColumns }));
                        $("#columns_taglist > li").css("cssText", "cursor: move; height:inherit !important;");
                        $("#columns_taglist > li > .k-select").css("cursor", "pointer");
                    } else {
                        cols = $("#columns").kendoMultiSelect(vm.selectOptions).data("kendoMultiSelect");
                    }

                    if (config.gridColumns.length > 0)
                        $('.k-multiselect-wrap.k-floatwrap').addClass('columnsselected');
                    else
                        $('.k-multiselect-wrap.k-floatwrap').removeClass('columnsselected');

                    if (cols) {

                        $("#columns_taglist > li").css("cssText", "cursor: pointer; height:inherit !important;");
                        $("#columns_taglist > li > .k-select").css("cursor", "pointer");

                        cols.tagList.kendoSortable({
                            hint: function (element) {
                                return element.clone().addClass("hint");
                            },
                            placeholder: function (element) {
                                return element.clone().addClass("placeholder").text("drop here");
                            },
                            change: function (e) {

                                var listElements = e.sender.element.children();

                                var listValues = [];

                                if (vm.gridColumns.length > 0) {

                                    var dataItems = [];

                                    for (var a in config.gridColumns) {
                                        var found = false;
                                        for (var c in vm.gridColumns) {
                                            var text1 = vm.gridColumns[c].toString().toLowerCase();
                                            if (text1 === config.gridColumns[a].title.toString().toLowerCase()) {
                                                dataItems.push(config.gridColumns[a]);
                                                found = true;
                                            }
                                        }
                                        if (!found) dataItems.push(config.gridColumns[a]);
                                    }

                                    config.gridColumns = dataItems;
                                }

                                for (var i in listElements) {
                                    if (listElements[i].tagName == "LI") {
                                        var text = listElements[i].innerText.toLowerCase();
                                        for (var x in config.gridColumns) {
                                            if (text === config.gridColumns[x].title.toString().toLowerCase()) {
                                                listValues.push(config.gridColumns[x]);
                                            }
                                        }
                                    }
                                }
                                config.gridColumns = listValues;
                            }
                        });
                    }

                    if ($("#columns").data("kendoMultiSelect")) {
                        if (config.queryString.indexOf("$select") !== -1)
                            $("#columns").data("kendoMultiSelect").enable(false);
                        else
                            $("#columns").data("kendoMultiSelect").enable(true);
                    }
                },
                onChangeQueryString: function () {
                    var queryParamKeys = _.uniq(config.queryString.match(/{{([^}]+)}}/g));

                    //Add new parameters
                    _.each(queryParamKeys,
                        function (key) {

                            var token = key.replace('{{', '').replace('}}', '');

                            var exist = _.filter(config.queryParamKeys,
                                function (item) {
                                    return item.Key === token;
                                });

                            if (exist.length === 0) {
                                config.queryParamKeys.push({ Key: key.replace('{{', '').replace('}}', ''), Value: '' });
                            }
                        });

                    //Delete unused parameters
                    var i = 0;
                    _.each(config.queryParamKeys,
                        function (item) {

                            var exist = _.filter(queryParamKeys,
                                function (key) {
                                    var token = key.replace('{{', '').replace('}}', '');
                                    return item.Key === token;
                                });

                            if (exist.length === 0)
                                config.queryParamKeys.splice(i, 1);

                            i++;
                        });

                    vm.getColumns(config.data_url);

                    if (config.queryString.indexOf("$select") !== -1)
                        $("#columns").data("kendoMultiSelect").enable(false);
                    else
                        $("#columns").data("kendoMultiSelect").enable(true);

                    vm.setShowFilterLang();
                },
                getColumnTranslations: function (columns) {
                    var keys = [];
                    for (var i in columns) {
                        var column = columns[i];
                        if (_.isUndefined(column.localizationKey)) {
                            column.localizationKey = $scope.config.stateGuid + "_col_" + column.field;
                        }
                        keys.push(column.localizationKey);
                    }

                    //Optimize the load query for bug 24546
                    localizationService.getAvailableLocale(keys.join()).then(function (localizations) {
                        for (var i in columns) {
                            var column = columns[i];
                            var loc = _.filter(localizations, function (item) { return item.Key == column.localizationKey; });
                            _.each(loc, function (localizationItem) {
                                if (localizationItem.Locale.toLowerCase() == "enu" && localizationItem.Translation == "") {
                                    localizationItem.Translation = column.field;
                                }
                            });
                            column.translations = loc;
                        }
                    });
                },
                isAddQuickActions: $scope.config.isAddQuickActions,
                gridQuickActions: $scope.config.gridQuickActions,
                setQuickActionVisibility: function () {
                    var selectedClass = $scope.config.gridCollection.field;
                    
                    _.each($scope.config.gridQuickActions, function (action) {

                        if (!_.isUndefined(action.ScopedClasses)) {
                            if (action.ScopedClasses.length > 0) {
                                _.contains(action.ScopedClasses, selectedClass) ? action.IsVisible = true : action.IsVisible = false;
                            } else {
                                action.IsVisible = true;
                            }
                        } else {
                            action.IsVisible = true;
                        }
                    });
                },
                getColumnGridActions: function () {
                    var availableList = app.custom.gridAction.getAll(); 
                    _.each(availableList, function (action) {
                        var newQuickAction = {
                            Id: action.Id,
                            DisplayName: action.DisplayName,
                            IsActive: false,
                            ScopedClasses: action.ScopedClasses,
                            IsVisible: true,
                            IconClass: action.IconClass,
                            IconPath: action.IconPath
                        }
                        var obj = _.find($scope.config.gridQuickActions, function (i) {
                            return i.Id == action.Id;
                        })

                        if (_.isUndefined(obj)) {
                            $scope.config.gridQuickActions.push(newQuickAction);
                        }
                    });
                },
                updateGridAction: function () {
                    if (!config.isAddQuickActions) {
                        _.each($scope.config.gridQuickActions, function (action) {
                            action.IsActive = false;
                        });
                    }
                }
               
            });

            vm.getCollections();
            vm.getColumnTranslations($scope.config.gridColumns);
            vm.getColumnGridActions();
        }

        function ODataGridController($scope, config, ODataGridConfigService, localizationService) {
            $scope.stateGuid = config.stateGuid;

            var newQueryString = config.queryString || '';
            var urlParams = app.lib.getQueryParams() || {};

            if (newQueryString.length > 0) {

                _.each(config.queryParamKeys,
                    function (item) {
                        var itemKey = item.Key.toLowerCase();
                        if (urlParams.hasOwnProperty(itemKey))
                            newQueryString = newQueryString.replace("{{" + item.Key + "}}", urlParams[itemKey]);
                        else
                            newQueryString = newQueryString.replace("{{" + item.Key + "}}", item.Value);
                    });

                if (newQueryString.indexOf('@User') !== -1) {
                    newQueryString = newQueryString.replace('@User', session.user.Id);
                }

                if (newQueryString.indexOf('@Lang') !== -1) {
                    newQueryString = newQueryString.replace('@Lang', lang);
                }
            }

            var invalids = ["$top", "$count", "$format", "$sort"];

            for (var i in invalids) {
                if (newQueryString.indexOf(invalids[i]) > -1) {
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Warning,
                        message: localization.ODATAQueryInvalid
                    });
                    return;
                }
            }

            var langCodeField = _.filter(config.allColumns, function (el) {
                return el.field === var_languageField;
            });
            
            if ((config.filterByCurrentLang && config.showFilterLang) ||
                (typeof config.filterByCurrentLang === 'undefined' && typeof config.showFilterLang === 'undefined' && langCodeField.length > 0)) {

                var langFilter = var_languageField + " eq '" + lang + "'";

                if (newQueryString.length > 0) {

                    var params = app.lib.getQueryParams(newQueryString) || {};
                    var filterParams = params["$filter"] || "";
                    if (filterParams.length > 0) {
                        newQueryString = "";
                        for (var key in params) {
                            var val = params[key];
                            if (key === "$filter") {
                                val = "(" + val + ") and " + langFilter;
                            }

                            newQueryString += (newQueryString.length > 0)
                                ? "&" + key + "=" + val
                                : "?" + key + "=" + val;

                        }
                    }
                    else {
                        //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                        newQueryString = newQueryString + "&$filter=" + langFilter;
                    }

                    

                } else
                    newQueryString += '?$filter=' + langFilter;
            }

            

            $scope.$on("kendoWidgetCreated", function (event, widget) {

                widget.dataSource.transport.parameterMap = function (options, type) {

                    var paramMap = kendo.data.transports["odata-v4"].parameterMap(options);

                    var filters = options.filter || [];
                    for (var i in filters) {

                        if (filters[i].constructor === Array) {
                            var innerFilters = filters[i];
                            for (var x in innerFilters) {
                                if (innerFilters[x].filters) {
                                    var nestedFilters = innerFilters[x].filters;
                                    for (var q in nestedFilters) {
                                        var val = nestedFilters[q].value.toString().replace(/\s+/, "");
                                        if (parseFloat(val)) {
                                            var n = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                            var operator = nestedFilters[q].operator;
                                            operator = (operator == "lte") ? "le" : (operator == "gte") ? "ge" : operator;
                                            var fil = nestedFilters[q].field + " " + operator + " ";
                                            if (paramMap.$filter.indexOf(fil + n) != -1) {
                                                paramMap.$filter = paramMap.$filter.replace(fil + n, fil + nestedFilters[q].value)
                                            }
                                        }
                                    }
                                } else {
                                    var val = innerFilters[x].value.toString().replace(/\s+/, "");
                                    if (parseFloat(val)) {
                                        var n = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                        var operator = innerFilters[x].operator;
                                        operator = (operator == "lte") ? "le" : (operator == "gte") ? "ge" : operator;
                                        var fil = innerFilters[x].field + " " + operator + " ";
                                        if (paramMap.$filter.indexOf(fil + n) != -1) {
                                            paramMap.$filter = paramMap.$filter.replace(fil + n, fil + innerFilters[x].value)
                                        }
                                    }
                                }
                            }
                        }

                    }
                    paramMap.$count = true;
                    delete paramMap.$inlinecount; // <-- remove inlinecount parameter.
                    return paramMap;
                }

                if (widget === event.currentScope.grid) {

                    var gridId = event.currentScope.stateGuid;
                    var currentState = app.gridUtils.savedState.getCurrentState(gridId);
                    if (currentState) {
                        if (currentState.group)
                            widget.dataSource.group(currentState.group);
                        if (currentState.sort)
                            widget.dataSource.sort(currentState.sort);
                        if (currentState.filter)
                            widget.dataSource.filter(currentState.filter);
                        if (currentState.pageSize) widget.dataSource.options.pageSize = currentState.pageSize;

                        if (!_.isUndefined(widget.dataSource.pageSize())) {
                            widget.dataSource.pageSize(currentState.pageSize);
                        }
                    } else
                        widget.dataSource.read();

                    $('.clear-filters-' + gridId).on('click', function () {
                        app.gridUtils.savedState.removeSavedState(gridId);
                        document.location.reload(false);
                    });

                    var pageSizeDropDownList = widget.wrapper.children(".k-grid-pager").find("select").data("kendoDropDownList");

                    if (pageSizeDropDownList) {
                        pageSizeDropDownList.bind("change",
                            function (e) {
                                setTimeout(function () {
                                    app.gridUtils.saveColumnState(gridId, widget, true);
                                }, 100);
                            });
                    }

                    widget.bind("columnResize", function (e) {
                        vm.onColumnChange(e);
                    });

                    widget.bind("dataBinding", function (e) {
                        vm.onColumnChange(e);
                    });

                }

                //function to iterate call while data fetched < Odata count  
                //response data are transformed to row-cell value and appended to the workbook
                //when iteration return all data count, export the updated workbook
                $scope.iterateNextData = function (wb, grid, filename, fetchCount, page) {
                    var queryOptions = "$skip=" + page * 500;
                    var uri = grid.options.dataSource.transport.read.url;
                    var queryString = uri.substr(uri.indexOf('?'), uri.length);
                    uri += (queryString.length > 0) ? '&' : '?';
                    uri += queryOptions;

                    var options = angular.copy(grid.options.dataSource);
                    options.transport.read.url = uri;
                    options.pageSize = 500;

                    var dataSource = new kendo.data.DataSource(options);
                    //copy current grid's filter, sort and group configuration
                    dataSource._filter = angular.copy(grid.dataSource._filter);
                    dataSource._sort = angular.copy(grid.dataSource._sort);
                    dataSource._group = angular.copy(grid.dataSource._group);

                    dataSource.fetch(function () {
                        var nextData = dataSource.data();

                        var columns = _.reject(grid.columns, function (el) {
                            return el.hidden === true;
                        });

                        for (var i = 0; i < nextData.length; i++) {
                            var cells = [];
                            for (var c = 0; c < columns.length; c++) {
                                var cellValue = nextData[i][columns[c].field];
                                //apply date formatting if value is a date/datetime
                                if (!_.isNull(cellValue) && cellValue instanceof Date && !_.isNaN(Date.parse(cellValue))) {
                                    cellValue = kendo.toString(new Date(cellValue), 'g');
                                }
                                cells.push({
                                    value: cellValue
                                });
                            }

                            wb.sheets[0].rows.push(
                                {
                                    cells: cells
                                });
                        }

                        if ((nextData.length + fetchCount) < grid.dataSource.total()) {
                            page += 1;
                            $scope.iterateNextData(wb, grid, filename, (nextData.length + fetchCount), page);
                        } else {
                            var workbook = new kendo.ooxml.Workbook(wb);

                            kendo.saveAs({
                                dataURI: workbook.toDataURL(),
                                fileName: filename
                            });
                        }
                    });
                }

                //intercept Excel export and access the configuration object of the Excel workbook
                widget.bind("excelExport", function (e) {
                    var grid = e.sender;
                    var data = e.data || [];
                    var columns = _.reject(grid.columns, function (el) {
                        return el.hidden === true;
                    });

                    var sheet = e.workbook.sheets[0];

                    for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                        var row = sheet.rows[rowIndex];
                        for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                            var cellValue = row.cells[cellIndex].value;
                            //apply date formatting if value is a date/datetime
                            if (!_.isNull(cellValue) && cellValue instanceof Date && !_.isNaN(Date.parse(cellValue))) {
                                row.cells[cellIndex].value = kendo.toString(new Date(cellValue), 'g');
                            }
                        }
                    }

                    //if grid count exceeds 500, 
                    //call $scope.iterateNextData to fetch all nextLink data and include to workbook
                    if (grid.dataSource.total() > 500) {
                        e.preventDefault();
                        if (data.length < grid.dataSource.total()) {
                            $scope.iterateNextData(e.workbook, grid, grid.options.excel.fileName, 500, 1);
                        }
                    }
                });
            });

            var el = document.createElement('a');
            el.href = config.data_url;
            var path = el.pathname;
            var entity = path.substring(path.lastIndexOf("/") + 1, path.length);
            var vm = this;
            config.gridColumns = config.gridColumns || [];
            config.allColumns = config.allColumns || [];
            angular.extend(vm, {
                gridOptions: null,
                gridColumns: (config.gridColumns.length > 0) ? config.gridColumns : config.allColumns || [],
                onColumnChange: function (e) {
                    var gridId = this.gridStateId;
                    var grid = e.sender;
                    _.defer(function () {
                        app.gridUtils.saveColumnState(gridId, grid, false, e);
                    });
                },
                onColumnGroupChange: function (e) {
                    var gridId = this.gridStateId;
                    var grid = e.sender;
                    _.defer(function () {
                        app.gridUtils.saveColumnState(gridId, grid, true);
                       // app.gridUtils.saveColumnState(gridId, grid, false, e);
                    });
                },
                getGridOptions: function () {
                    var configName = config.configurationName || "odataGridConfig";
                    vm.gridStateId = config.stateGuid;

                    var columns = vm.gridColumns || [];
                    var selectQuery = "";

                    var guidColumn = _.filter(columns,
                        function (el) {
                            return el.field === "Guid";
                        });

                    var guidColumnAll = _.filter(config.allColumns,
                        function (el) {
                            return el.field === "Guid";
                        });
                    if (guidColumn.length === 0 && guidColumnAll.length > 0) {
                        guidColumnAll[0].hidden = true;
                        columns.push(guidColumnAll[0]);
                    }

                    if (newQueryString.indexOf("$select") === -1) {
                        if (columns.length !== config.allColumns.length) {
                            var selection1 = _.map(columns,
                                function (el) {
                                    return el.field;
                                });
                            var isFunctionImport = false;

                            $.ajax({
                                type: 'GET',
                                url: "/platform/api",
                                success: function (data, status, xhr) {
                                    //This will check if endpoint is FunctionImport to not include the $select on the query string
                                    for (var i in data.value) {
                                        var item = data.value[i];
                                        if (item.kind == "FunctionImport" && "/platform/api/" + item.name.toLowerCase() == config.data_url.toLowerCase()) {
                                            isFunctionImport = true;
                                            break;
                                        }
                                    }
                                },
                                processData: false,
                                async: false
                            });


                            if (!isFunctionImport) {
                                selection1 = _.filter(selection1, function (item) { return (!_.isUndefined(item) && item != "CustomAction") });
                                selectQuery = "$select=" + selection1.toString();
                            }
                            selectQuery = (newQueryString.length > 0) ? "&" + selectQuery : "?" + selectQuery;

                            if (selectQuery == "?") selectQuery = "";
                        }
                    } else {
                        var selection2 = app.lib.getQueryParams(newQueryString) || {};
                        var selectItems = selection2["$select"] || "";
                        if (selectItems.length > 0) {
                            selectItems = selectItems.split(',');
                            columns = [];

                            for (var n in selectItems) {
                                var col = _.filter(config.allColumns,
                                    function (el) {
                                        return el.field === selectItems[n];
                                    });

                                if (col.length > 0) columns.push(col[0]);
                            }

                            var guidCol = _.filter(columns,
                                function (el) {
                                    return el.field === "Guid";
                                });

                            var guidColAll = _.filter(config.allColumns,
                                function (el) {
                                    return el.field === "Guid";
                                });

                            if (guidCol.length === 0 && guidColAll.length > 0) {
                                guidColAll[0].hidden = true;
                                newQueryString = "";
                                for (var key in selection2) {
                                    var val = selection2[key];
                                    if (key === "$select")
                                        val = val + ",Guid";
                                    newQueryString += (newQueryString.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                                columns.push(guidColumnAll[0]);
                            }

                            vm.gridColumns = columns;
                        } else {
                            newQueryString = "";
                            for (var key in selection2) {
                                var val = selection2[key];
                                if (urlParams.hasOwnProperty(key) && key !== "$select") {
                                    newQueryString += (newQueryString.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                            }
                        }
                    }

                    ODataGridConfigService.getGridConfig(configName).then(function (response) {
                        response.dataSource.transport.read.url = config.data_url + newQueryString + selectQuery;
                        vm.gridOptions = response;
                        vm.gridOptions.reorderable = false;
                        vm.gridOptions.columnMenu.columns = false;
                        vm.selectedItem = null;

                        if (_.isUndefined(config.isCustomGrid)) {
                            config.isCustomGrid = false;
                        }

                        //default template
                        angular.forEach(columns, function (column, index) {
                            //apply grid highlight on the first two columns
                            var attr = (index == 0) ? "grid-highlight-column" : (index == 1) ? "grid-highlight-column grid-highlight-column-title" : "";
                            column.attributes = { "class": attr }

                            if (column.DataType.toLowerCase() === "guid") {
                                var col1, col2;
                                var field1 = columns[0].field;
                                var field2 = columns[1].field;

                                var subProp1 = field1.split(".");
                                if (subProp1.length > 1) {
                                    //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                                    col1 = "#= (" + subProp1[0] + " && " + field1 + ") ? " + field1 + " : '' #";
                                }
                                else {
                                    col1 = "#= (" + columns[0].field + ") ? " + columns[0].field + " : '' #";
                                }

                                var subProp2 = field2.split(".");
                                if (subProp2.length > 1) {
                                    //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                                    col2 = "#= (" + subProp2[0] + " && " + field2 + ") ? " + field2 + " : '' #";
                                }
                                else {
                                    col2 = "#= (" + field2 + ") ? " + field2 + " : '' #";
                                }


                                //update first and second column template
                                columns[0].template = "<a href=\"/DynamicData/Edit/#:" + column.field + "#\">" + col1 + "</a>";
                                columns[1].template = "<a href=\"/DynamicData/Edit/#:" + column.field + "#\">" + col2 + "</a>";
                            }

                            //format date column based on user's preference format
                            if (column.DataType.toLowerCase() === "date") {
                                column.template = "#: kendo.toString(" + column.field + ",'g')#";
                            }

                            //localize column headers
                            var localizedTitle = localizationHelper.localize(column.localizationKey);
                            if (localizedTitle != "*" + column.localizationKey + "*") {
                                column.title = localizedTitle;
                            }
                        });

                        //add quick actions column
                        if (config.isAddQuickActions) {
                            _.map(config.gridQuickActions, function (obj) {
                                if (obj.Id == "AssignToMe" || obj.Id == "AddComment" || obj.Id == "AddRelatedCI") {
                                    return;
                                }
                                if (obj.IsActive == true) {
                                    var customAction = app.custom.gridAction.get(obj.Id);
                                    if (_.isUndefined(customAction)) {
                                        obj.IsActive = false;
                                        obj.IsVisible = false;
                                    }
                                }
                            });

                            var activeActions = _.where(config.gridQuickActions, { IsActive: true });
                            if (activeActions.length > 0) {
                                var actionColumnTemplate = ""

                                actionColumnTemplate = "<div>";

                                _.each(activeActions, function (action) {
                                    var quickActionTemplate = "<span style='padding-right:25px'><a href ng-click='vm.executeQuickAction(\"" + action.Id + "\", this)'>" + action.DisplayName + "</a></span>";

                                    if (!_.isUndefined(action.IconClass) && !_.isNull(action.IconClass) && action.IconClass != "") {
                                        quickActionTemplate = "<span style='padding-right:25px'><a href ng-click='vm.executeQuickAction(\"" + action.Id + "\", this)'><i class='" + action.IconClass + "' title='" + action.DisplayName + "'></i></a></span>";
                                    }

                                    actionColumnTemplate += quickActionTemplate

                                });

                                actionColumnTemplate += "</div>"


                                var IsAdded = _.where(columns, { field: "CustomAction" }).length > 0;
                                if (!IsAdded) {
                                    var customActionColumn = {
                                        field: "CustomAction",
                                        title: localizationHelper.localize("Actions", "Actions"),
                                        friendlyName: "Custom Action",
                                        DataType: "string",
                                        template: actionColumnTemplate,
                                    }
                                   
                                    columns.push(customActionColumn)
                                } else {
                                    _.each(columns, function (col) {
                                        if (col.field == "CustomAction") {
                                            col.template = actionColumnTemplate;
                                        }
                                    });
                                }
                            } else {
                                _.map(columns, function (col) {
                                    if (col.field == "CustomAction") {
                                        col.hidden = true;
                                    }
                                });
                            }
                        } else {
                            _.map(columns, function (col) {
                                if (col.field == "CustomAction") {
                                    col.hidden = true;
                                }
                            });
                        }

                        //always append action column at the end
                        var key = _.findKey(columns, { field: "CustomAction" });
                        if (!_.isUndefined(key)) {
                            var currentActionColumnindex = _.pluck(columns, { field: "CustomAction" });
                            if (currentActionColumnindex != columns.length - 1) {
                                var actionColumn = _.find(columns, { field: "CustomAction" });
                                columns = _.reject(columns, { field: "CustomAction" });
                                columns.push(actionColumn);
                            }
                        }
                        vm.gridOptions.columns = columns;

                        ////if defined, apply entity template 
                        if ($("#" + entity + "_tpl").html() && !config.isCustomGrid) {
                            vm.gridOptions.rowTemplate = $.proxy(kendo.template($("#" + entity + "_tpl").html()), vm);
                        }

                        //if defined, apply custom template 
                        if (config.isCustomGrid) {
                            vm.gridOptions.rowTemplate = $.proxy(kendo.template(config.customGridTemplate), vm);
                        }

                        //format for all columns
                        var fields = {};
                        angular.forEach(config.allColumns,
                            function (item) {
                                if (item.DataType == "date") {
                                    fields[item.field] = {
                                        type: item.DataType,
                                        parse: function (dateString) {
                                            if (_.isNull(dateString) || _.isUndefined(dateString)) {
                                                return '';
                                            } else {
                                                return new Date(dateString);
                                            }
                                        }
                                    };
                                } else
                                    fields[item.field] = { type: item.DataType };

                            });

                        vm.gridOptions.dataSource.schema = {
                            model: {
                                id: "id",
                                fields: fields
                            }
                        }
                    });

                },
                searchGrid: function (event) {


                    if (event.which == "13" || !event) {

                        var data = $("#search_" + config.stateGuid).val();

                        var grid = $("div").find("[adf-grid-state-id='" + config.stateGuid + "']");

                        var dataSource = grid.data("kendoGrid").dataSource;

                        var current_url = dataSource.options.transport.read.url;
                        var queryStr = "";
                        if (current_url.indexOf('?') !== -1) {
                            queryStr = current_url.substr(current_url.indexOf('?'), current_url.length - 1);
                            var path = current_url.substr(0, current_url.indexOf('?'));

                            var queryParams = app.lib.getQueryParams(queryStr) || {};
                            queryStr = "";

                            if (queryParams.hasOwnProperty("search")) {
                                for (var key in queryParams) {
                                    var val = queryParams[key];
                                    if (key === "search")
                                        val = data;
                                    queryStr += (queryStr.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                                current_url = path + queryStr;
                            } else
                                current_url += "&search=" + data;

                        } else
                            current_url += "?search=" + data;

                        dataSource.options.transport.read.url = current_url;

                    }

                },
                executeQuickAction: function (actionId, selectedItem) {
                    app.lib.mask.apply();

                    switch (actionId) {
                        case "AssignToMe":
                            ODataGridConfigService.defaultGridActions.AssignToMe(selectedItem.dataItem);
                            break;
                        case "AddComment":
                            ODataGridConfigService.defaultGridActions.AddComments(selectedItem.dataItem);
                            break;
                        case "AddRelatedCI": 
                            ODataGridConfigService.defaultGridActions.AddRelatedCI(selectedItem.dataItem);
                            break;
                        default:
                            var customQuickAction = app.custom.gridAction.get(actionId);
                            if (!_.isUndefined(customQuickAction)) {
                                customQuickAction.Callback(selectedItem.dataItem);
                            }
                            break;
                    }

                    app.lib.mask.remove();
                }
            });

            localizationService.getKendoMessageUrl().then(function (kendoMessageUrl) {
                $.getScript(kendoMessageUrl,
                    function () {
                        vm.getGridOptions();
                    });
            });
        }

        function ODataMobileGridController($scope, config, localizationService) {

            var newQueryString = config.queryString || '';
            var lang = (session.user.LanguageCode) ? session.user.LanguageCode : 'ENU';
            var urlParams = app.lib.getQueryParams() || {};

            if (newQueryString.length > 0) {

                _.each(config.queryParamKeys,
                    function (item) {
                        if (urlParams.hasOwnProperty(item.Key))
                            newQueryString = newQueryString.replace("{{" + item.Key + "}}", urlParams[item.Key]);
                        else
                            newQueryString = newQueryString.replace("{{" + item.Key + "}}", item.Value);
                    });

                if (newQueryString.indexOf('@User') !== -1) {
                    newQueryString = newQueryString.replace('@User', session.user.Id);
                }

                if (newQueryString.indexOf('@Lang') !== -1) {
                    newQueryString = newQueryString.replace('@Lang', lang);
                }
            }

            var invalids = ["$top", "$count", "$format", "$sort"];
            for (var i in invalids) {
                if (newQueryString.indexOf(invalids[i]) > -1) {
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Warning,
                        message: localization.ODATAQueryInvalid
                    });
                    return;
                }
            }
            
            var langCodeField = _.filter(config.allColumns, function (el) {
                return el.field === var_languageField;
            });

            if ((config.filterByCurrentLang && config.showFilterLang) ||
                (typeof config.filterByCurrentLang === 'undefined' && typeof config.showFilterLang === 'undefined' && langCodeField.length > 0)) {

                var langFilter = var_languageField + " eq '" + lang + "'";

                if (newQueryString.length > 0) {
                    
                    var params = app.lib.getQueryParams(newQueryString) || {};
                    var filterParams = params["$filter"] || "";

                    if (filterParams.length > 0) {
                        newQueryString = "";
                        for (var key in params) {
                            var val = params[key];
                            if (key === "$filter")
                                val = "(" + val + ") and " + langFilter;

                            newQueryString += (newQueryString.length > 0)
                                ? "&" + key + "=" + val
                                : "?" + key + "=" + val;
                        }
                    } else {
                        //This is exclusively for MyWork,MyRequest,TeamRequest,TeamWork,ActiveWork custom expand property for now. US-26368
                        newQueryString = newQueryString + "&$filter=" + langFilter;
                    }

                } else
                    newQueryString += '?$filter=' + langFilter;
            }

            var columns = (config.gridColumns && config.gridColumns.length > 0) ? config.gridColumns : config.allColumns;
            var selectQuery = "";

            if (newQueryString.indexOf("$select") === -1) {
                if (columns && columns.length !== config.allColumns.length) {
                    var selection1 = _.map(columns,
                        function (el) {
                            return el.field ;
                        });

                    var isFunctionImport = false;
                    $.ajax({
                        type: 'GET',
                        url: "/platform/api",
                        success: function (data, status, xhr) {
                            //This will check if endpoint is FunctionImport to not include the $select on the query string
                            for (var i in data.value) {
                                var item = data.value[i];
                                if (item.kind == "FunctionImport" && "/platform/api/" + item.name.toLowerCase() == config.data_url.toLowerCase()) {
                                    isFunctionImport = true;
                                    break;
                                }
                            }
                        },
                        processData: false,
                        async: false
                    });

                    if (!isFunctionImport) {
                        selection1 = _.filter(selection1, function (item) { return (!_.isUndefined(item) && item != "CustomAction") });
                        selectQuery = "$select=" + selection1.toString();
                        selectQuery = (newQueryString.length > 0) ? "&" + selectQuery : "?" + selectQuery;
                    } else {
                        var selection2 = app.lib.getQueryParams(newQueryString) || {};
                        var selectItems = selection2["$select"] || "";
                        if (selectItems.length > 0) {
                            selectItems = selectItems.split(',');
                            columns = [];

                            for (var n in selectItems) {
                                var col = _.filter(config.allColumns,
                                    function (el) {
                                        return el.field === selectItems[n];
                                    });

                                if (col.length > 0) columns.push(col[0]);
                            }

                            var guidCol = _.filter(columns,
                                function (el) {
                                    return el.field === "Guid";
                                });

                            var guidColAll = _.filter(config.allColumns,
                                function (el) {
                                    return el.field === "Guid";
                                });

                            if (guidCol.length === 0 && guidColAll.length > 0) {
                                guidColAll[0].hidden = true;
                                newQueryString = "";
                                for (var key in selection2) {
                                    var val = selection2[key];
                                    if (key === "$select")
                                        val = val + ",Guid";
                                    newQueryString += (newQueryString.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                                columns.push(guidColumnAll[0]);
                            }

                            vm.gridColumns = columns;
                        } else {
                            newQueryString = "";
                            for (var key in selection2) {
                                var val = selection2[key];
                                if (urlParams.hasOwnProperty(key) && key !== "$select") {
                                    newQueryString += (newQueryString.length > 0)
                                        ? "&" + key + "=" + val
                                        : "?" + key + "=" + val;
                                }
                            }
                        }
                    }
                }
            } else {
                var selection2 = app.lib.getQueryParams(newQueryString) || {};
                var selectItems = selection2["$select"];
                selectItems = selectItems.split(',');
                columns = [];

                for (var n in selectItems) {
                    var col = _.filter(config.allColumns,
                        function (el) {
                            return el.field === selectItems[n];
                        });

                    if (col.length > 0) columns.push(col[0]);
                }
            }

            var el = document.createElement('a');
            el.href = config.data_url;
            var path = el.pathname;
            var entity = path.substring(path.lastIndexOf("/") + 1, path.length);

            var fields = {};
            angular.forEach(config.allColumns, function (item) {
                if (item.DataType == "date") {
                    fields[item.field] = {
                        type: item.DataType,
                        parse: function (dateString) {
                            if (_.isNull(dateString) || _.isUndefined(dateString)) {
                                return '';
                            } else {
                                return kendo.toString(new Date(dateString), 'M/d/yyyy h:mm tt');
                            }
                        }
                    };
                } else
                    fields[item.field] = { type: item.DataType };

            });

            var vm = this;
            angular.extend(vm, {
                mobGridTemplate: (config.isCustomMobile) ? 'Custom' : (entity) ? entity : 'Default',
                gridStateId: config.stateGuid,
                dataSource: new kendo.data.DataSource({
                    type: "odata-v4",
                    transport: {
                        read: {
                            url: config.data_url + newQueryString + selectQuery,
                            dataType: "json"
                        }
                    },
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: fields
                        }
                    },
                    serverPaging: true,
                    serverSorting: true,
                    serverFiltering: true
                }),
                columns: columns,
                pagerOptions: {
                    pageSizes: [10, 20, 50, 100],
                    pageSize: 10,
                    buttonCount: 1,
                    messages: {
                        display: localization.Viewing + " <strong>" + localization.Items.toLowerCase() + " {0}-{1}</strong> of {2} " + localization.Total + ".",
                        empty: "<span class='mobilegrid__pager--empty'>" + localization.NoResults + "</span>",
                        of: localization.Of,
                        first: localization.First,
                        previous: localization.Previous,
                        next: localization.Next,
                        last: localization.Last,
                        itemsPerPage: localization.ItemsPerPage,
                        allPages: localization.ViewingAllItems
                    }
                },
                dataBound: function (e) {
                    if (this.dataSource.view().length <= 0) {
                        //hide pager elements minus the info label
                        $('.mobilegrid__pager').children().not('.k-pager-info').hide();
                    } else {
                        //show pager
                        $('.mobilegrid__pager').children().show();
                    }
                },
                listViewOptions: {
                    dataBound: vm.dataBound
                },
                executeQuickAction: function (actionId, selectedItem) {
                    app.lib.mask.apply();

                    switch (actionId) {
                        case "AssignToMe":
                            ODataGridConfigService.defaultGridActions.AssignToMe(selectedItem.dataItem);
                            break;
                        case "AddComment":
                            ODataGridConfigService.defaultGridActions.AddComments(selectedItem.dataItem);
                            break;
                        case "AddRelatedCI":
                            ODataGridConfigService.defaultGridActions.AddRelatedCI(selectedItem.dataItem);
                            break;
                        default:
                            var customQuickAction = app.custom.gridAction.get(actionId);
                            if (!_.isUndefined(customQuickAction)) {
                                customQuickAction.Callback(selectedItem.dataItem);
                            }
                            break;
                    }

                    app.lib.mask.remove();
                }
            });

            var template = '';
            if (vm.mobGridTemplate !== 'Default') {
                if (vm.mobGridTemplate === 'Custom')
                    template = kendo.template(config.customTemplate);
                else if ($("#" + vm.mobGridTemplate + "_mtpl").html() && vm.mobGridTemplate !== 'Custom')
                    template = kendo.template($("#" + vm.mobGridTemplate + "_mtpl").html());
                else
                    template = kendo.template($("#Cached_Default_mtpl").html());

                setTimeout(function () {
                    $("#" + config.mobGridGUID).kendoListView({
                        dataSource: vm.dataSource,
                        template: template,
                        dataBound: vm.dataBound
                    });
                }, 1);
            }
        }

        angular.module('adf.widget.odata.grid', ['adf.provider'])
            .config(["dashboardProvider", function (dashboardProvider) {
                dashboardProvider
                    .widget('odata-grid', {
                        title: localizationHelper.localize('AdfODataGridWidgetTitle', 'OData Table Widget'), //localization key
                        description: localizationHelper.localize('AdfODataGridWidgetDescription', 'Add a table based on an OData End Point'), //localization key
                        templateUrl: app.isMobile() ? '{widgetsPath}/odata-grid/src/viewMobile.html' : '{widgetsPath}/odata-grid/src/view.html',
                        controller: app.isMobile() ? 'ODataMobileGridController' : 'ODataGridController',
                        controllerAs: 'vm',
                        edit: {
                            templateUrl: '{widgetsPath}/odata-grid/src/edit.html',
                            controller: 'ODataGridEditController',
                            controllerAs: 'vm'
                        },
                        reload: true,
                        ordinal: 7
                    });
            }])
            .factory('ODataService', ['$http', '$q', 'NavigationNodeService', 'ViewPanelService', ODataService])
            .controller('ODataGridController', ['$scope', 'config', 'ODataGridConfigService', 'LocalizationService', ODataGridController])
            .controller('ODataMobileGridController', ['$scope', 'config', 'LocalizationService', ODataMobileGridController])
            .controller('ODataGridEditController', ['$scope', 'config', 'ODataService', 'ODataGridConfigService', 'LocalizationService', ODtataGridEditController]);

        angular.module("adf.widget.odata.grid").run(["$templateCache", function ($templateCache) {

            var editTemplate = [
                "<form role=form><div class=form-group>",
                "<label for=url>{{ ::vm.localize('ODataEndPoint') }}</label>",
                "<input type=text id=url ng-model=\"config.given_url\" class=\"form-control input-sm\" ng-change=\"vm.getCollections()\" />",
                "</div><div class=form-group>",
                "<label for=collections>{{ ::vm.localize('ChooseCollection') }}</label>",
                "<select id=collections class=\"form-control input-sm\" ng-model=\"config.gridCollection\" ng-change=\"vm.onCollectionsChange()\" ng-options=\"c.title for c in vm.collections track by c.field\">",
                "</select>",
                "</div><div class=form-group>",
                "<label for=queryString>{{ ::vm.localize('QueryString') }}</label>",
                "<input type=text id=queryString ng-model=\"config.queryString\" class=\"form-control input-sm\" ng-change=\"vm.onChangeQueryString()\"/>",
                "<p class='help-block' style='color: red' ng-if=\"vm.queryInvalid()\">{{ ::vm.localize('ODATAQueryInvalid') }}</p>",
                "</div>",
                "<div class=\"form-horizontal\">",
                "<div class=form-group ng-if=\"config.queryParamKeys.length>0\">",
                "<ul id=\"param-content\"><li ng-repeat=\"param in config.queryParamKeys track by $index\">",
                "<div class=\"query-param\">",
                "<label class=\"margin-l50\">{{param.Key}}</label>",
                "</div>",
                "<div class=\"col-sm-12 pad-bot-1\"><input type=\"text\" class=\"k-textbox form-control input-sm \" ng-model=\"param.Value\"/></div>",
                "</li></ul>",
                "</div>",
                "</div><div class=form-group ng-if=\"config.showFilterLang\">",
                "<div class=checkbox checkbox-inline>",
                "<input id=filterByCurrentLang name=filterByCurrentLang type=checkbox ng-model=\"config.filterByCurrentLang\"/>",
                "<label class=control-label for=filterByCurrentLang>",
                "{{ ::vm.localize('FilterByLanguageOption') }}",
                "</label>",
                "<p class='help-block margin-l10'>i.e. {{vm.languageCodeFilter}}</p>",
                "</div>",
                "</div>",
                "<div class=form-group>",
                "<label for=columns>{{ ::vm.localize('ChooseArrangeColumns') }}</label>",
                "<select id=columns class=\"form-control input-sm\" ng-model=\"gridColumns\">",
                "</select>",
                "</div>",
                "<div class=form-group>",
                "<p class='help-block'>Drag items to change order.</p>",
                "<a class=control-label ng-click=\"config.isSetColumnTranslation = !config.isSetColumnTranslation;\">{{ ::vm.localize('EnterColumnTranslations') }}</a>",
                "</div>",
                "<div class=\"modal-showtranslation\" ng-if=\"config.isSetColumnTranslation\">",
                "<div><table><tr ng-repeat=\"c in config.gridColumns\"><td><label style=\"word-break: break-all\"><i class=\"fa fa-plus-circle\" ng-show=\"!c.showTranslation\" ng-click=\"c.showTranslation = !c.showTranslation;\"></i><i class=\"fa fa-minus-circle\" ng-show=\"c.showTranslation\" ng-click=\"c.showTranslation = !c.showTranslation;\"></i>  {{ c.friendlyName }} </label>",
                "<table ng-if=\"c.showTranslation\"><tr ng-repeat=\"t in c.translations\"><td>{{t.Locale}}</td><td><input ng-model=\"t.Translation\"/></td></tr></table></td></tr>",
                "</table></div>",

                " </div > ",
                "<div class=form-group>",
                "<label>{{ ::vm.localize('AdvancedCustomization') }}</label>",
                "<div class=checkbox checkbox-inline>",
                "<input id=isCustomGrid name=isCustomGrid type=checkbox ng-model=\"config.isCustomGrid\" ng-change=\"vm.useCustomGrid()\"/>",
                "<label class=control-label for=isCustomGrid ng-click=\"vm.isCustomGrid = !vm.isCustomGrid; config.customGridTemplate = ''\">",
                "Custom Desktop Template",
                "</label>",
                "</div>",
                "</div><div class=form-group ng-if=\"config.isCustomGrid\">",
                "<textArea class=form-control id=customGridTemplate ng-model=config.customGridTemplate rows=3></textArea>",
                "</div><div class=form-group>",
                "<div class=checkbox checkbox-inline>",
                "<input id=isCustomMobile name=isCustomMobile type=checkbox ng-model=\"config.isCustomMobile\" ng-change=\"vm.useCustomMobile()\"/>",
                "<label class=control-label for=isCustomMobile ng-click=\"vm.isCustomMobile = !vm.isCustomMobile; config.customTemplate = ''\">",
                "{{ ::vm.localize('CustomMobileTemplate') }}",
                "</label>",
                "</div>",
                "</div><div class=form-group ng-if=\"config.isCustomMobile\">",
                "<textArea class=form-control id=customTemplate ng-model=config.customTemplate rows=3></textArea>",
                "</div>",

                "<div class=checkbox checkbox-inline>",
                "<input id=quickActions name=quickActions type=checkbox ng-model=\"config.isAddQuickActions\" />",
                "<label class=control-label for=quickActions ng-click=\"vm.isAddQuickActions = !vm.isAddQuickActions; vm.updateGridAction() \">",
                "Quick Actions",
                "</label>",
                "</div>",
                "</div><div class=\"modal-quickactions\" ng-if=\"config.isAddQuickActions\">",
                "<table><tr ng-repeat=\"action in config.gridQuickActions\" \"><td></td><td>",
                "<div ng-show=\"action.IsVisible==true\" class=checkbox checkbox-inline><input  type=checkbox ng-model=\"action.IsActive\" />",
                "<label class=control-label ng-click=\"action.IsActive = !action.IsActive; \">",
                "{{ action.DisplayName }}",
                "</label>",
                "</div>",
                "</td></tr></table>",


                "</div><div class=form-group>",
                "<script id=\"noDataTemplate\" type=\"text/x-kendo-tmpl\">",
                "    # var value = instance.input.val(); #",
                "    # var id = instance.element[0].id; #",
                "    <div>",
                "        " + localization.AddNewColumnField + " - '#: value #' ?",
                "    </div>",
                "    <br />",
                "    <button class=\"k-button\" onclick=\"addNew('#: id #', '#: value #')\" ontouchend=\"addNew('#: id #', '#: value #')\">Add new item</button>",
                "</script>",
                "</form >"].join("");
            $templateCache.put("{widgetsPath}/odata-grid/src/edit.html", editTemplate);

            var viewTemplate = [
                "<div class=\"clearfix\">",
                "<div class=\"pull-left\">",
                "<span class=\"odata-search-toolbar k-textbox k-space-right\">",
                "<input type=\"text\" id=\"{{'search_' + vm.gridStateId}}\" value=\"\" placeholder=\"Search...\" ng-keypress=\"vm.searchGrid($event)\">",
                "<a class=\"k-icon k-i-search ci-search\" ng-click=\"vm.searchGrid(false)\"></a>",
                "</span>",
                "</div>",
                "<div class=\"pull-right\">",
                "<a class=\"margin-l10 btn clear-filters-{{vm.gridStateId}}\">" + localization.ResetState + "</a>",
                "</div>",
                "</div>",
                "<div adf-grid-state-id={{vm.gridStateId}} ",
                "kendo-grid=grid k-options=vm.gridOptions k-rebind=vm.gridOptions ",
                "k-on-column-reorder=vm.onColumnChange(kendoEvent) ",
                "k-on-sort=vm.onColumnChange(kendoEvent) ",
                "k-on-group=vm.onColumnGroupChange(kendoEvent) ",
                "k-on-filter=vm.onColumnChange(kendoEvent)>",
                "</div>"
            ].join("");
            $templateCache.put("{widgetsPath}/odata-grid/src/view.html", viewTemplate);

            var viewMobileTemplate = [
                "<div>",
                "<div class=\"mobilegrid__header\"></div>",
                "<div class=\"mobilegrid\" id=\"{{config.mobGridGUID}}\"></div>",
                "<div ng-if=\"vm.mobGridTemplate=='Default'\" kendo-list-view k-data-source=\"vm.dataSource\" k-options=\"vm.listViewOptions\" class=\"mobilegrid\">",
                "<div class=\"gridcard\" k-template>",
                "<p class=\"gridcard__title\">",
                "<a> {{dataItem[vm.columns[0].field]}} </a>",
                "</p>",
                "<div class=\"gridcard__detailblock\">",
                "<p ng-repeat=\"item in vm.columns\" ng-if=\"$index > 0\"> {{dataItem[item.field]}} </p>",
                "</div></div></div>",
                "<div class=\"mobilegrid__pager\" kendo-pager k-data-source=\"vm.dataSource\" k-options=\"vm.pagerOptions\"></div>",
                "</div>"
            ].join("");
            $templateCache.put("{widgetsPath}/odata-grid/src/viewMobile.html", viewMobileTemplate);
        }]);

        angular.module("adf.widget.odata.grid").filter("kendoFormatDate", function () {
            return function (date) {

                if (date)
                    return kendo.toString(new Date(date), 'M/d/yyyy h:mm tt');
                else return '';
            };
        });
    });
})();
