
$(function () {
    //Load the filter localizations
    $.get("/Localizations/GetCurrentKendoCulture").then((response) => $.getScript("/Scripts/filterLocalization/cireson.filter.messages." + response + ".js"));
    
    var isDisabledToEndUser = false;
    app.platformSettings.getSettings("GlobalSearchDisabledToEndUser", function (res) {
        isDisabledToEndUser = res.Value;
        if (app.featureSet.isActive("GlobalSearch") && (session.user.Analyst == 1 || isDisabledToEndUser == "" || isDisabledToEndUser.toLowerCase() == "false")) {
            var searchTextParam = app.lib.getQueryParams();
            globalSearch.searchText = searchTextParam.searchtext;
            globalSearch.loadGlobalSearch();

            //build query filter control
            setTimeout(function () {
                advanceSearchQueryBuilder.Initialize();
            }, 1000);

            var seachPageInputElement = $("#global-search__form__input_id");
            var search = function () {
                globalSearch.searchText = seachPageInputElement.val();
                globalSearch.searchResultDS.read();

            }

            seachPageInputElement.val(globalSearch.searchText);
            seachPageInputElement.on("keypress", function (event) {
                if (event.keyCode === 13) {
                    search();
                }
            });

            var seachPageSearchButtonElement = $("#global-search__form__button_id");
            seachPageSearchButtonElement.on("click", function (event) {
                search();
            });

            var searchFilterOkButtonElement = $("#global-search-filter-ok__button");
            searchFilterOkButtonElement.on("click", function (event) {
                advanceSearchQueryBuilder.applyFilter();
                globalSearch.updateCheckValuesOnChange(globalSearch.filterClasses, true);

                var filteredClasses = globalSearch.filteredClasses.replace(/'/g, "");
                var selectedClassesToSearch = filteredClasses.split(",");
                var classFilterData = [];
                for (var i in selectedClassesToSearch) {
                    var className = selectedClassesToSearch[i];
                    var classFilters = advanceSearchQueryBuilder.filters[className];

                    if (!_.isUndefined(classFilters)) {
                        _.each(classFilters.filters, function (filter) {
                            classFilterData.push({ ClassName: className, FilterText: filter.field + " " + filter.operator + " " + filter.value })
                        });
                    }
                }

                if (classFilterData.length > 0) {
                    $(".fa-filter").show();
                    $(".results-header-title").html(localizationHelper.localize("FilteredResults"));
                } else {
                    $(".fa-filter").hide();
                    $(".results-header-title").html(localization.Results)
                }

                advanceSearchQueryBuilder.classFilterData = classFilterData;
            });

            var searchFilterCancelButtonElement = $("#global-search-filter-cancel__button");
            searchFilterCancelButtonElement.on("click", function (event) {
                if (advanceSearchQueryBuilder.classFilterData.length > 0) {
                    $(".fa-filter").show();
                    $(".results-header-title").html(localization.FilteredResults)
                } else {
                    $(".fa-filter").hide();
                    $(".results-header-title").html(localization.Results)
                }
            });

            //hide filter icon by default
            $(".fa-filter").hide();
        } else {
            var message = localization.AccessDenied;
            location.href = "/Home/Error?message=" + message;
        }
    });

    
});

var advanceSearchQueryBuilder = {
    filters: [],
    classProperties: [],
    fullTextClassses: [],
    containerFilter: $("#filterContainer"),
    tempFilter: null,
    classFilterData: [],
    Initialize: function () {
        advanceSearchQueryBuilder.containerFilter = $("#filterContainer");
        advanceSearchQueryBuilder.tempFilter = advanceSearchQueryBuilder.containerFilter.find(".tempFilter");

        _.each(globalSearch.filterClasses, function (item) {
            advanceSearchQueryBuilder.fullTextClassses.push({ Id: item.id, Name: item.classname, FriendlyName: item.friendlyname });
        });

        //This will get all the selected properties and assigned it to its parent class
        $.ajax({
            url: "/platform/api/FullTextPropertyDefinition",
            async: false,
        }).done(function (classProps) {
            _.each(advanceSearchQueryBuilder.fullTextClassses, function (cls) {
                var props = _.filter(classProps.value, function (prop) {
                    return prop.FullTextIndexId == cls.Id;
                });

                cls.Properties = props;
            });
        });

        //This will load all classes and properties that are available from the platform cache
        $.ajax({
            url: "/platform/api/$metadata",
            dataType: "xml",
            contentType: "application/atom+xml",
            context: document.body,
            success: function (xml) {
                var default_namespace = "PlatformCache.Data.Models";
                var default_localization_key = "GlobalSearch-" + default_namespace.replace(/\./g, '') + '-';
                var schema = $(xml).find('Schema').filter(function () {
                    return $(this).attr('Namespace') === default_namespace;
                });
                schema.find("EntityType").each(function () {
                    var className = $(this).attr('Name');
                    advanceSearchQueryBuilder.classProperties[className] = [];

                    $(this).find("Property").each(function () {
                        var type = $(this).attr('Type').substring(4).toLowerCase();
                        var dbType = type;
                        switch (type) {
                            case "int64":
                            case "int32":
                                type = "number";
                                break;
                            case "guid":
                                type = "string";
                                break;
                            case "datetimeoffset":
                                type = "date";
                                break;
                            case "boolean":
                                type = "bool";
                                break;
                        }

                        var propertyName = $(this).attr('Name')
                        var friendlyname = localizationHelper.localize(default_localization_key + className + "-" + propertyName, propertyName);
                        advanceSearchQueryBuilder.classProperties[className].push({ Name: $(this).attr('Name'), Type: type, DbType: dbType, FriendlyName: friendlyname });
                    });
                });
            },
            error: function (jqXHR, exception) {
                //var container = $('#alertMessagesContainer');
                //container.children('.alert').remove();
                //var box = $('<div>', { 'class': 'alert', html: '@Model.LocalizedStrings.PlatformCacheIsNotRunning' });
                //box.addClass("alert-danger");
                //if (app.isMobile()) {
                //    box.addClass("alert-mobile");
                //}
                //container.append(box);
            },
            async: false
        });
        
        $("#btnSearchQuery").click(function () {
            advanceSearchQueryBuilder.applyFilter();
        });

        advanceSearchQueryBuilder.buildQueryBuilder();

       
        
    },
    checkIfEnum: function (className, propertyName) {
        return _.find(advanceSearchQueryBuilder.classProperties[className], function (p) { return p.Name == propertyName + "Id" });
    },
    buildQueryBuilder: function () {
        var filteredClasses = globalSearch.filteredClasses.replace(/'/g, "");
        var selectedClassesToSearch = filteredClasses.split(",");
        var tableList;

        //This will get the table SCSM Id and enum properties
        $.ajax({
            type: "POST",
            url: "/GlobalSearch/GetCacheTableSCSMId?cacheTableName=" + filteredClasses,
            async: false,
        }).done(function (result) {
            tableList = result;
        });
        
        
        _.forEach(advanceSearchQueryBuilder.fullTextClassses, function (item) { //This will build the query builder
            var queryId = "gsq_" + item.Name;
            var queryElement = $("#" + queryId);
            var cls = _.find(selectedClassesToSearch, function (cls) { return cls == item.Name; });
            if (!_.find(selectedClassesToSearch, function (cls) { return cls == item.Name; })) {
                //This will remove query builder if a specific class is toggled off.
                if (queryElement.length > 0) {
                    queryElement.parent().parent().parent().parent().remove();
                    queryElement.remove();
                }
                delete advanceSearchQueryBuilder.filters[item.Name];
            }
            else
            {
                if (queryElement.length <= 0) {
                    var filterParent = advanceSearchQueryBuilder.tempFilter.clone();
                    filterParent.show();
                    filterParent.find(".title").html(item.FriendlyName);
                    filterParent.find("span").html(item.FriendlyName);
                    filterParent.find("a").attr("href", "#"+item.Name);
                    filterParent.find(".panel-collapse").attr("id", item.Name);
                    advanceSearchQueryBuilder.containerFilter.append(filterParent);

                    var filter = filterParent.find(".filter");
                    filter.attr("id", queryId);

                    var data = [];
                    var fields = [];
                    var propData = {};
                    var model = {};
                    //This will build the kendoFilter datasource Model and kendoFilter fields that are currently enabled from the global search settings.
                    _.each(advanceSearchQueryBuilder.classProperties[item.Name], function (propItem) {
                        propData[propItem.Name] = "";
                        model[propItem.Name] = { type: "string" };

                        
                        if (_.find(item.Properties, function (p) { return p.PropertyName == propItem.Name })) {
                            var field = { name: propItem.Name, type: propItem.Type, label: propItem.FriendlyName };

                            if (propItem.Type == "number") {
                                field.editorTemplate = function (container, options) {
                                    $('<input data-bind="value: value" name="' + options.field + '"/>').appendTo(container).kendoNumericTextBox();
                                }
                            }
                            else if (propItem.Type == "string") {
                                //This will check if property is enum
                                //if (_.find(advanceSearchQueryBuilder.classProperties[item.Name], function (p) { return p.Name == propItem.Name + "Id" }))
                                if (advanceSearchQueryBuilder.checkIfEnum(item.Name, propItem.Name))
                                {
                                    field.editorTemplate = function (container, options) {
                                        
                                        
                                        var dropTree = $('<input data-bind="value: value" name="' + options.field + '"/>');
                                        var table = _.find(tableList, function (p) { return p.Name == item.Name; });
                                        
                                        var selectedField = _.find(table.Properties, function (p) { return p.Name == options.field });
                                        
                                        var data = [];
                                        $.ajax({
                                            type: "GET",
                                            url: "/api/V3/Enum/GetAllList?Id=" + selectedField.EnumId,
                                            async: false,
                                        }).done(function (enumResult) {
                                            data = enumResult;
                                        });
                                        
                                        
                                        dropTree.appendTo(container);

                                        dropTree.kendoDropDownTree({
                                            placeholder: localization.Select,
                                            dataSource: data,
                                            height: "auto",
                                            dataTextField: "Text",
                                            dataValueField: "Id"
                                        });


                                        _.defer(function () {
                                            //This will going to remove operator that are not needed to the enum list
                                            var newDataList = [];
                                            var opt = container.parent().find(".k-filter-operator select").data("kendoDropDownList");
                                            var dataList = opt.dataSource.data();
                                            for (var i = 0; i < dataList.length; i++) {
                                                switch (dataList[i].value) {
                                                    case "eq":
                                                    case "neq":
                                                    case "isnull":
                                                    case "isnotnull":
                                                        newDataList.push(dataList[i]);
                                                        break;
                                                }
                                            }
                                            opt.setDataSource(newDataList);
                                        });
                                        
                                    }
                                }
                                
                            }
                            
                            fields.push(field);
                        }
                    });

                    

                    data.push(propData); //This will create a dummy data
                    var dataSource = new kendo.data.DataSource({
                        data: data,
                        schema: {
                            model: {
                                fields: model
                            }
                        }
                    });

                    filter.kendoFilter({
                        dataSource: dataSource,
                        expressionPreview: true,
                        applyButton: false,
                        change: function (e) {
                            advanceSearchQueryBuilder.filters[item.Name] = e.expression;

                            var filterExpression = e.expression;
                            var filterPreviewText = $(e.sender._previewContainer)[0].innerText;
                            var filterPreviewLabel = $("#" + item.Name).prev().find(".filter-preview-text");

                            _.each(filterExpression.filters, function (filter) {
                                //when value is enum, replace [object Object] text on filter preview expression with enum's displayname
                                if (!_.isUndefined(filter.value) && !_.isUndefined(filter.value.Id)) {
                                    filterPreviewText = filterPreviewText.replace("[object Object]", filter.value.Name)
                                }
                            });

                            
                            filterPreviewLabel.html(filterPreviewText);

                            var classItem = _.find(globalSearch.filterClasses, function (e) {
                                return e.classname == item.Name;
                            });
                            classItem.filterPreviewText = filterPreviewText;

                            //hide original preview expression text
                            $(e.sender._previewContainer).hide();
                        },
                        fields: fields,
                    });
                }
            }

            
        });
    },
    applyFilter: function () {
        //https://docs.telerik.com/kendo-ui/api/javascript/data/datasource/configuration/filter
        globalSearch.urlParam = "";

        var selectedClassesToSearch = globalSearch.filteredClasses.replace(/'/g, "").split(",");

        function buildFilters(filters, isGroup) {
            var tempUrl = "";
            var logic = "";
            if (!_.isUndefined(filters)) {
                _.each(filters.filters, function (filter) {
                    var filterValue = "";
                    var filterField = filter.field;

                    if (advanceSearchQueryBuilder.checkIfEnum(className, filter.field)) {
                        filterField = filterField + "Id";
                        filterValue = filter.value.Id;
                    }
                    else {
                        filterValue = "'" + filter.value + "'";
                    }

                    filterValue = filterValue.replace(/#/g,"%23");
                    
                    if (!_.isUndefined(filterValue)) {
                        if (_.isUndefined(filter.logic)) {
                            if (filter.operator == "startswith") {
                                tempUrl += logic + "startswith(" + filterField + "," + filterValue + ")";
                            }
                            else if (filter.operator == "contains") {
                                tempUrl += logic + "contains(" + filterField + "," + filterValue + ")";
                            }
                            else if (filter.operator == "doesnotcontain") {
                                tempUrl += logic + "not contains(" + filterField + "," + filterValue + ")";
                            }
                            else if (filter.operator == "endswith") {
                                tempUrl += logic + "endswith(" + filterField + "," + filterValue + ")";
                            }
                            else if (filter.operator == "isnull") {
                                tempUrl += logic + filterField + " eq null";
                            }
                            else if (filter.operator == "isnotnull") {
                                tempUrl += logic + filterField + " ne null";
                            }
                            else if (filter.operator == "isempty") {
                                tempUrl += logic + filterField + " eq ''";
                            }
                            else if (filter.operator == "isnotempty") {
                                tempUrl += logic + filterField + " ne ''";
                            }
                            else if (filter.operator == "isnullorempty") {
                                tempUrl += logic + "(" + filterField + " eq '' or " + filterField + " eq null)";
                            }
                            else if (filter.operator == "isnotnullorempty") {
                                tempUrl += logic + "(" + filterField + " ne '' or " + filterField + " ne null)";
                            }
                            else if (filter.operator == "neq") {
                                tempUrl += logic + filterField + " ne " + filterValue;
                            }
                            else {
                                tempUrl += logic + filterField + " " + filter.operator + " " + filterValue;
                            }
                        }
                        else {
                            tempUrl += logic + buildFilters(filter, true);
                        }

                        if (logic == "") {
                            logic = " " + filters.logic + " ";
                        }
                    }


                });
            }

            if (isGroup) return "(" + tempUrl + ")";
            else return tempUrl;

        }


        for (var i in selectedClassesToSearch) {
            var className = selectedClassesToSearch[i];
            var filterCls = advanceSearchQueryBuilder.filters[className];

            if (!_.isUndefined(filterCls)) {
                globalSearch.urlParam += globalSearch.urlParam == "" ? "" : "&";
                globalSearch.urlParam += "f" + i + "=";
                globalSearch.urlParam += buildFilters(filterCls, false);
            }

        }
        globalSearch.searchResultDS.read();
    }

}


