var globalSearch = kendo.observable({
    searchText: "",
    languageFields: ["LanguageCode"],
    languageCode: 'ENU',
    default_namespace: "PlatformCache.Data.Models",
    default_localization_key: "",
    filteredClasses: "",
    roList: [],
    filterClasses: [],
    urlParam: "",
    publishedArticleStatusId: "0",
    searchResultDS: new kendo.data.DataSource({
        pageSize: 10,
        transport: {
            read: function (options) {
                if (globalSearch.filteredClasses !== "''" && globalSearch.filteredClasses.length > 0) {
                    $.ajax({
                        url: "/platform/api/GlobalSearch(EntitySets=@entitysets)" + (globalSearch.urlParam != "" ? "?" + globalSearch.urlParam : globalSearch.urlParam),
                        dataType: "json",
                        data: {
                            search: globalSearch.searchText.replace(/#/g, "%23"),
                            $top: app.gsMaxResult,
                            "@entitysets": globalSearch.filteredClasses,
                            publishedArticleStatusId: globalSearch.publishedArticleStatusId,
                            languageCode: globalSearch.languageCode,
                            searchLimit: app.gsMaxResult
                        },
                        contentType: "application/json",
                        success: function (result) {
                            var resultSet = [];
                            globalSearch.default_localization_key = "GlobalSearch-" + globalSearch.default_namespace.replace(/\./g, '') + '-';

                            $.each(result.value, function (i, el) {
                                var content = JSON.parse(el.EntityJson);
                                var thisClassProperty = _.findWhere(classProperties, { TypeToSearch: el.EntityType });
                                var dataFields = (thisClassProperty && thisClassProperty.DataFields) ? thisClassProperty.DataFields.split(',') : [];
                                var contentData = [];
                                var entityType = el.EntityType.replace(globalSearch.default_namespace + ".", "").toString();

                                $.each(dataFields, function (i, field) {
                                    var value = (content[field]) ? content[field].toString() : "";

                                    if (value) {
                                        //trim white spaces to prevent parsing strings ending with a number as date
                                        var val = value.replace(/\s+/g, "");

                                        if (Date.parse(val) && /^\d+$/.test(val) == false && parseFloat(val))
                                            value = kendo.toString(new Date(val), 'g');

                                        contentData.push({ dataClass: globalSearch.getClassToAppend(field, val), dataProperty: localizationHelper.localize(globalSearch.default_localization_key + entityType + "-" + field, field), dataValue: globalSearch.highlightMatch(value) });
                                    }
                                });

                                entityType = entityType.toLowerCase();
                                var title = (thisClassProperty && thisClassProperty.TitleField) ? { dataClass: globalSearch.getClassToAppend(thisClassProperty.TitleField, content[thisClassProperty.TitleField]), dataProperty: thisClassProperty.TitleField, dataValue: globalSearch.highlightMatch(content[thisClassProperty.TitleField]) } : el.EntityType;
                                var objLink = "", obj = {};

                                if ((entityType.indexOf("cached_") > -1) || (entityType.indexOf("archive_") > -1)) {
                                    var baseFullName = content["Base_FullName"].split(":");
                                    if (baseFullName.length > 0) {
                                        obj = {
                                            ClassName: baseFullName[0],
                                            BaseId: content["Guid"],
                                            Id: baseFullName[1] //sets the WorkItemId (i.e IR100)
                                        }
                                    }
                                } else if (entityType.indexOf("knowledgearticle") > -1) {
                                    obj = {
                                        ClassName: "KnowledgeArticle",
                                        ArticleId: content["ArticleId"]
                                    }
                                }

                                if (obj)
                                    objLink = app.gridUtils.getObjectLinkUrl(obj);


                                var classname = "";

                                if (!_.isUndefined(thisClassProperty.EntityTypeName)) {
                                    classname = thisClassProperty.EntityTypeName.replace(globalSearch.default_namespace + ".", "");
                                }
                                //This will be used for US-24330
                                var entityProp = _.find(classProperties, function (data) {
                                    return classname != "" && data.EntityTypeName == thisClassProperty.EntityTypeName;
                                });

                                if (!_.isUndefined(entityProp) && entityProp.CustomURL != null && entityProp.CustomURL != "") {
                                    for (var i in content) {
                                        if (entityProp.CustomURL.indexOf("{{" + i + "}}") > -1) {
                                            objLink = entityProp.CustomURL.replace(new RegExp("{{" + i + "}}", "g"), content[i]);
                                        }
                                    }
                                }
                                else if (classname == "Cached_MT_System_RequestOffering") {
                                    for (var i in globalSearch.roList) {
                                        if (globalSearch.roList[i].RequestOfferingId == content.Guid) {
                                            objLink = "/SC/ServiceCatalog/RequestOffering/" + globalSearch.roList[i].RequestOfferingId + "," + globalSearch.roList[i].ServiceOfferingId;
                                            break;
                                        }
                                    }
                                }
                                else if (classname == "Cached_MT_System_ServiceOffering") {
                                    objLink = "/View/94ecd540-714b-49dc-82d1-0b34bf11888f?SCId=" + content.Guid;
                                }


                                var set = {
                                    id: el.Id,
                                    objectLink: (objLink.length > 0) ? objLink : "#",
                                    title: title,
                                    body: (thisClassProperty && thisClassProperty.BodyField) ? { dataClass: globalSearch.getClassToAppend(thisClassProperty.BodyField, content[thisClassProperty.BodyField]), dataProperty: thisClassProperty.BodyField, dataValue: globalSearch.highlightMatch(content[thisClassProperty.BodyField]) } : "",
                                    data: contentData,
                                    iconClass: (thisClassProperty && thisClassProperty.Icon) ? thisClassProperty.Icon : "fa fa-exclamation",
                                    classname: classname,
                                    namespace: globalSearch.default_namespace,
                                    friendlyname: localizationHelper.localize(globalSearch.default_localization_key + classname, classname),
                                };

                                var item = _.find(resultSet, function (item) { return item.objectLink == set.objectLink; });
                                if (_.isUndefined(item)) {
                                    resultSet.push(set);
                                }
                            });
                            options.success(resultSet);
                        }
                    });
                } else {
                    options.success([]);
                }
            },
            schema: {
                model: {
                    id: "id"
                }
            }
        }
    }),
    searchClassesData: [],
    loadGlobalSearch: function () {
        var classProperties;
        var tableResults = $("#search-classes-table-details");
        globalSearch.languageCode = session.user.LanguageCode;

        //Get KB's Publish Status Id
        $.get("/platform/api/DisplayStrings?$filter=ElementID eq 9508797E-0B7A-1D07-9FA3-587723F09908 and LocaleID eq '" + globalSearch.languageCode + "'", function (res) {
            if (res.value[0] && res.value[0].Id)
                globalSearch.publishedArticleStatusId = res.value[0].Id;
        });

        //Start Global Search Scripts
        $.ajax({
            url: "/platform/api/GlobalSearchResultSettings",
            dataType: "json",
            data: {
                $count: true
            },
            contentType: "application/json",
            async: false,
            success: function (result) {
                classProperties = result.value.map(el => { if (el.IncludeArchive) { return { ...el, TypeToSearch: el.EntityArchiveTypeName } } else { return { ...el, TypeToSearch: el.EntityTypeName } } });
            }
        });

        //This will be used for US-24330
        $.ajax({
            url: "/ServiceCatalog/GetUserRequestOffering",
            xhrFields: {
                withCredentials: true
            },
            success: function (ROList) {
                globalSearch.roList = ROList;
            }
        });

        var searchClassesDS = new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    $.ajax({
                        url: "/platform/api/FullTextIndexDefinition",
                        dataType: "json",
                        data: {
                            $count: true
                        },
                        contentType: "application/json",
                        success: function (result) {
                            globalSearch.default_localization_key = "GlobalSearch-" + globalSearch.default_namespace.replace(/\./g, '') + '-';
                            var searchClassesData = app.storage.globalSearch.get('searchClasses');
                            var resultSet = [];
                            $.each(result.value, function (i, el) {

                                var classname = el.EntityTypeName.replace(globalSearch.default_namespace + ".", "");
                                var thisClassProperty = _.findWhere(classProperties, { TypeToSearch: el.EntityTypeName });
                                let friendlyName = classname;

                                if (!_.isUndefined(thisClassProperty)) {
                                    if (session.user.Analyst == 1 && (!_.isNull(thisClassProperty.EnableSearchForAnalyst) && !thisClassProperty.EnableSearchForAnalyst)) {
                                        return;
                                    }

                                    if (session.user.Analyst != 1 && (!_.isNull(thisClassProperty.EnableSearchForEndUser) && !thisClassProperty.EnableSearchForEndUser)) {
                                        return;
                                    }
                                    friendlyName = thisClassProperty.EntityTypeName.replace(globalSearch.default_namespace + ".", "");
                                }


                                var globalSearchClass = _.findWhere(searchClassesData, { classname: classname });
                                var isChecked = (!_.isUndefined(globalSearchClass) && !_.isNull(globalSearchClass)) ? globalSearchClass.checked : isChecked;

                                var set = {
                                    id: el.Id,
                                    namespace: globalSearch.default_namespace,
                                    classname: classname,
                                    friendlyname: localizationHelper.localize(globalSearch.default_localization_key + friendlyName, friendlyName),
                                    checked: (thisClassProperty && thisClassProperty.EnableSearchByDefault === true) ? true : isChecked,
                                    iconClass: (thisClassProperty && thisClassProperty.Icon) ? thisClassProperty.Icon : "fa fa-exclamation",
                                    filterPreviewText: ""
                                };
                                resultSet.push(set);
                            });

                            var sortTrueFirst = sortEnabledClasses(resultSet);

                            globalSearch.filterClasses = sortTrueFirst;
                            options.success(sortTrueFirst);
                        }
                    });

                },
                schema: {
                    model: {
                        id: "id"
                    }
                }
            }
        });


        $("#search-classes-table-switch").kendoGrid({
            dataSource: searchClassesDS,
            pageable: false,
            scrollable: false,
            persistSelection: true,
            sortable: true,
            filterable: {
                extra: false
            },
            dataBound: function (e) {
                var grid = this;
                var rows = grid.items();

                $(rows).each(function (e) {
                    var row = this;
                    var dataItem = grid.dataItem(row);

                    if (dataItem.checked)
                        $(row).addClass("k-state-selected");

                });

                globalSearch.setfilteredClasses(globalSearch.filterClasses);

                var noRecordTemplate = (classProperties.length > 0) ? $("#gsNoResultTemplate").html() : $("#gsNoSettingsResultTemplate").html();

                if (!tableResults.data("kendoGrid")) {
                    globalSearch.languageFields.push("LocaleID");
                    $("#search-classes-table-details").kendoGrid({
                        dataSource: globalSearch.searchResultDS,
                        pageable: {
                            pageSizes: true
                        },
                        scrollable: false,
                        persistSelection: true,
                        sortable: false,
                        filterable: false,
                        noRecords: {
                            template: noRecordTemplate
                        },
                        dataBound: function (e) {
                            var grid = this;
                            var rows = grid.items();

                            $(rows).each(function (e) {
                                var row = this;
                                var dataItem = grid.dataItem(row);
                                $(row).addClass(dataItem.classname.replace(/\s+/g, ""));
                            });

                            var maxLength = (app.isMobile()) ? 150 : 300;
                            $(".results-details-body > span").each(function () {
                                var myStr = $(this).html();
                                if ($.trim(myStr).length > maxLength) {
                                    var newStr = myStr.substring(0, maxLength);
                                    var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
                                    $(this).empty().html(newStr);

                                    $(this).append('<div class="hidden-text display-none"><span>' + removedStr + '</span></div>');
                                    $(this).append(' <a class="arrow arrow-right show-more-text"></a>');
                                }
                            });

                            $(".show-more-text").on("click", function () {
                                $(this).siblings(".hidden-text").toggleClass("display-none");
                                $(this).toggleClass("arrow-right");
                            });

                            //if datasource is empty
                            if (e.sender._data.length == 0) {
                                $(e.sender.table).hide();
                                this.pager.element.hide();
                            } else {
                                $(e.sender.table).show();
                                this.pager.element.show();
                            }



                        },
                        columns: [
                            {
                                headerTemplate: $("#globalSearchResultHeaderTemplate").html(),
                                template: $("#globalSearchResultTemplate").html(),
                                field: "title",
                                title: localization.Results,
                                headerAttributes: {
                                    "class": "filter-on-left"
                                },
                                filterable: {
                                    search: true
                                }
                            }
                        ]
                    });
                }

                var uncheckedCount = _.where(globalSearch.filterClasses, { checked: false }).length;
                if (uncheckedCount == 0)
                    $("#checkAllClassSearchFilter").find("input.k-checkbox").attr("checked", "checked");
                else
                    $("#checkAllClassSearchFilter").find("input.k-checkbox").removeAttr("checked");
            },
            columns: [
                {
                    headerTemplate: kendo.template($("#globalSearchClassFilterHeaderTemplate").html())(localization.Class),
                    template: $("#globalSearchClassFilterTemplate").html(),
                    field: "classname",
                    title: localization.Class,
                    sortable: {
                        compare: function (a, b) {
                            if (a.checked !== b.checked) {
                                return a.checked ? -1 : 1;
                            } else {
                                return a.friendlyname > b.friendlyname ? 1 : -1;
                            }
                        }
                    }
                }
            ],
            columnMenu: {
                sortable: true,
                filterable: true,
                columns: false,
                messages: {
                    filter: "Filter",
                    sortAscending: "Sort Ascending",
                    sortDescending: "Sort Descending"
                }
            }
        });

        kendo.ui.FilterMenu.fn.options.operators.string = {
            contains: "Contains",
        };

        $(".table-picker__filter1").find(".k-grid-header").click(function (e) {
            globalSearch.classAllSwitchChange(e.target);
        });


    },
    classAllSwitchChange: function (e) {
        if ($(e).hasClass("gs-switch") || $(e).parent().hasClass("gs-switch")) {
            $('#search-classes-table-switch').getKendoGrid().dataSource.sort({});
            var checkAll = !$("#checkAllClassSearchFilter").find("input").is(':checked');

            if (checkAll) {
                $(".global-search__result_main .gs-switch1").find("input.k-checkbox").attr("checked", "checked");
            } else {
                $(".global-search__result_main .gs-switch1").find("input.k-checkbox").removeAttr("checked");
            }

            globalSearch.filterClasses = _.map(globalSearch.filterClasses, function (el) {
                el.checked = checkAll;
                return el;
            });

            globalSearch.updateCheckValuesOnChange(globalSearch.filterClasses, true);
        }
    },
    classSwitchChange: function (checkbox) {
        checkbox = $(checkbox);
        var classId = checkbox.val();

        globalSearch.filterClasses = _.map(globalSearch.filterClasses, function (el) {
            if (classId == el.id) {
                el.checked = checkbox[0].checked;

                //clear filter preview text when class is disabled
                if (!el.checked) {
                    el.filterPreviewText = "";
                }
            }
            return el;
        });

        globalSearch.updateCheckValuesOnChange(globalSearch.filterClasses, false);
    },
    updateCheckValuesOnChange: function (classes, sort) {
        var tableResults = $("#search-classes-table-details");

        globalSearch.filterClasses = (sort) ? globalSearch.sortEnabledClasses(classes) : classes;
        globalSearch.setfilteredClasses(globalSearch.filterClasses);

        $("#search-classes-table-switch").data("kendoGrid").dataSource.data(globalSearch.filterClasses);

        advanceSearchQueryBuilder.buildQueryBuilder();


        globalSearch.searchResultDS.read();
        tableResults.data("kendoGrid").dataSource.data([]);



    },
    sortEnabledClasses: function (resultSet) {
        return resultSet.sort(function (a, b) {
            if (a.checked !== b.checked) {
                return a.checked ? -1 : 1;
            } else {
                return a.friendlyname > b.friendlyname ? 1 : -1;
            }
        });
    },
    getClassToAppend: function (field, value) {
        value = (value) ? value.toString().replace(/\s+/g, "") : "";
        var cls = field.toString().replace(/\s+/g, "") + " " + value;
        return cls;
    },
    setfilteredClasses: function (classes) {
        globalSearch.filteredClasses = _.where(classes, { checked: true });
        globalSearch.filteredClasses = _.pluck(globalSearch.filteredClasses, "classname");
        globalSearch.filteredClasses = "'" + globalSearch.filteredClasses.join() + "'";
    },
    highlightMatch: function (text) {
        text = (text) ? text.toString() : "";
        var val = globalSearch.searchText;
        var textHtml = text;
        var patt = new RegExp(val, "gi");
        var matchDetails = [];

        while (match = patt.exec(text)) {
            matchDetails.push({
                start: match.index,
                end: patt.lastIndex,
                highlightedText: '<span class="results-details-highlight">' + text.substr(match.index, val.length) + '</span>'
            });
        }

        //allow multiple highlighted match in one property
        for (var c = 0; c < matchDetails.length; c++) {
            if (c === 0) {
                textHtml = text.substring(0, matchDetails[c].start) + matchDetails[c].highlightedText;
            } else {
                textHtml += text.substring(matchDetails[c - 1].end, matchDetails[c].start) + matchDetails[c].highlightedText;
            }

            if (c === matchDetails.length - 1) {
                textHtml += text.substring(matchDetails[c].end, text.length);
            }
        }

        return textHtml;
    },
    toggleFilterPane: function () {
        $("#search-classes-table-switch").toggleClass("table-picker__filter--collapse");
        $(".gs-toggle-sidenav__icon").toggleClass("display-none");
    },
    clearSearch: function () {
        var seachPageInputElement = $("#global-search-page__header__form__input_id");
        seachPageInputElement.val("").change();
    },
    toggleClassFilterPane: function (element) {
        var classname = "#" + $(element).attr("data-classname");
        if ($(classname).length > 0) {
            $('#global-search_advancedFilter').modal({ backdrop: false }).show();
            $(classname).collapse('show');
        }
    }
});

