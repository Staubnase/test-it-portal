require.config({
    waitSeconds: 0,
    urlArgs: "v=" + session.staticFileVersion,
    baseUrl: '/scripts/',
    paths: {
        text: 'require/text'
    },
    shim: {
    }
});

$(function () {
    function getIcons() {
        return app.lib.getIcons();
    }

    var navigationNodeService = (function () {
        function assignGroup(navigationNodeId, groupId, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/AssignGroup',
                contentType: 'application/json',
                data: JSON.stringify({ navigationNodeId: navigationNodeId, groupId: groupId }),
            }).done(function () {
                callback();
            });
        }

        function unassignGroup(navigationNodeId, groupId, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/UnassignGroup',
                contentType: 'application/json',
                data: JSON.stringify({ navigationNodeId: navigationNodeId, groupId: groupId }),
            }).done(function () {
                callback();
            });
        }

        function changeTitle(id, title, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/ChangeDisplayString',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, displayString: title }),
                traditional: true
            }).done(function () {
                callback();
            });
        }
        
        function changeDefinition(id, definition, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/ChangeDefinition',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, definition: definition }),
                traditional: true
            }).done(function () {
                callback();
            });
        }

        function updateIconClass(id, iconClass, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/UpdateIconClass',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, iconClass: iconClass }),
                traditional: true
            }).done(function () {
                callback();
            });
        }

        function deleteIconImage(id, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/DeleteIconImage',
                contentType: 'application/json',
                data: JSON.stringify({ id: id })
            }).done(function () {
                callback();
            });
        }

        function deleteNode(id, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/Delete',
                contentType: 'application/json',
                data: JSON.stringify({ id: id }),
                traditional: true
            }).done(function () {
                callback();
            });
        }

        function updateVisibility(id, isVisible, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/UpdateVisibility',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, isVisible: isVisible }),
            }).done(function () {
                callback();
            });
        }

        function updatePublic(id, isPublic, callback) {
            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/UpdatePublic',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, isPublic: isPublic }),
            }).done(function () {
                callback();
            });
        }

        function setDescendentCounts(navigationNodes) {
            recurse(navigationNodes, 'Children', true, function (node, index, depth, parent) {
                node.Depth = depth;

                if (node.Children && node.Children.length > 0) {
                    node.DescendentCount = node.Children.length + _.reduce(node.Children, function (sum, child) {
                        return sum + child.DescendentCount;
                    }, 0);
                } else {
                    node.DescendentCount = 0;
                }
            });

            recurse(navigationNodes, 'Children', false, function (node, index, depth, parent) {
                if (!node.Parents) node.Parents = [];

                if (!_.isNull(parent) && !_.isUndefined(parent)) {
                    node.Parents = parent.Parents;
                    node.Parents.push(parent.Id);
                    node.Parents = _.uniq(node.Parents);
                }
            });

            recurse(navigationNodes, 'Children', false, function (node) {
                if (!node.HasImage && !node.IconClass) {
                    node.IconClass = 'fa fa-folder';
                }
            });
        }

        function syncPositions(navigationNodes, callback) {
            var ordinalChangeList = [];
            var hierarchyChangeList = [];

            // Sync ordinals
            recurse(navigationNodes, 'Children', false, function (item, i) {
                if (item.Ordinal != i) {
                    ordinalChangeList.push({ id: item.Id, ordinal: i });
                    item.Ordinal = i;
                }
            });

            // Sync hierarchies
            recurse(navigationNodes, 'Children', false, function (item, i, depth, parent) {
                var parentId = parent && parent.Id ? parent.Id : null;
                if (item.ParentId !== parentId) {
                    hierarchyChangeList.push({ id: item.Id, parent: parentId });
                    item.ParentId = parentId;
                }
            });

            var changes = {
                ordinalIds: _.pluck(ordinalChangeList, 'id'),
                ordinals: _.pluck(ordinalChangeList, 'ordinal'),
                hierarchyIds: _.pluck(hierarchyChangeList, 'id') || [],
                hierarchyParentIds: _.pluck(hierarchyChangeList, 'parent') || []
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/UpdatePositions',
                contentType: 'application/json',
                data: JSON.stringify(changes),
                traditional: true
            }).done(function () {
                callback();
            });
        }

        function retrieve(callback) {
            $.ajaxSetup({ cache: false });
            $.getJSON('/NavigationAdmin/NavigationNodes', function (navigationNodes) {
                var filteredNavigationNodes = _.where(navigationNodes, { 'LocationId': '6cfc4d00-d8eb-4f51-b63d-f776576cf25a' });

                //if EnableCiresonAnalytics setting item is false, filter out analytics page
                if (!session.enableCiresonAnalytics) {
                    filteredNavigationNodes = _.filter(filteredNavigationNodes, function (el) {
                        return el.Id != '66f1e6e8-5f80-45d4-8dc0-1f7559bc778f';
                    });
                }

                //if EnableWatchlist setting item is false, filter out watchlist page
                if (!session.enableWatchlist) {
                    filteredNavigationNodes = _.filter(filteredNavigationNodes, function (el) {
                        return el.Id != '71dab6bd-ba26-4f14-a724-156dff8d5de8';
                    });
                }

                //if dashboard license is invalid, filter out dashboard pages
                if (!session.consoleSetting.DashboardsLicense.IsValid) {
                    filteredNavigationNodes = filteredNavigationNodes.filter(function (nav) {
                        return _.isNull(nav.Definition) || _.isUndefined(nav.Definition.isDashboardPage);
                    });
                }

                //if analyst portal license is valid, filter out all incidents view
                if (session.consoleSetting.AnalystPortalLicense.IsValid) {
                    filteredNavigationNodes = filteredNavigationNodes.filter(function (nav) {
                        return nav.Id != '714a1564-14d4-4471-83ee-a925c4039646';
                    });
                }

                setDescendentCounts(filteredNavigationNodes);
                $.ajaxSetup({ cache: true });
                callback(filteredNavigationNodes);
            });
        }

        function createDashboardPage(parentId, displayString, definition, callback) {

            var d = $.extend(definition, {
                  "title": displayString,
                  "editable": true,
                  "structure": "6-6"
            });

            var definitionAsString = JSON.stringify(d);

            var model = {
                parentId: parentId,
                displayString: displayString,
                definition: definitionAsString
            };

            if (session.consoleSetting.DashboardsLicense.IsValid) {

                $.ajax({
                    type: 'POST',
                    url: '/NavigationAdmin/CreateDashboardPage',
                    contentType: 'application/json',
                    data: JSON.stringify(model),
                    traditional: true
                }).done(function (result) {
                    callback(result);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log('Error:', errorThrown);
                });

            } else {
                alert(localization.DashboardLicenseRequired);
            }
        }

        function createFolder(displayString, callback) {
            var model = {
                displayString: displayString
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/CreateFolder',
                contentType: 'application/json',
                data: JSON.stringify(model),
                traditional: true
            }).done(function (result) {
                callback(result.folderId, result.sectionId);
            });
        }

        function createSection(parentId, displayString, callback) {
            var model = {
                parentId: parentId,
                displayString: displayString
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/CreateSection',
                contentType: 'application/json',
                data: JSON.stringify(model),
                traditional: true
            }).done(function (id) {
                callback(id);
            });
        }

        function createLink(parentId, displayString, definition, callback) {
            var model = {
                parentId: parentId,
                displayString: displayString,
                definition: definition
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/CreateLink',
                contentType: 'application/json',
                data: JSON.stringify(model),
                traditional: true
            }).done(function (id) {
                callback(id);
            });
        }

        function duplicateDashboardPage(parentId, displayString, definition, parentDefinition, callback) {

            var d = $.extend(definition, {
                "title": displayString,
                "editable": true,
                "structure": "6-6"
            });

            var definitionAsString = JSON.stringify(d);
            var parentDefinitionAsString = JSON.stringify(parentDefinition)

            var model = {
                parentId: parentId,
                displayString: displayString,
                definition: definitionAsString,
                parentDefinition: parentDefinitionAsString
            };

            if (session.consoleSetting.DashboardsLicense.IsValid) {

                $.ajax({
                    type: 'POST',
                    url: '/NavigationAdmin/DuplicateDashboardPage',
                    contentType: 'application/json',
                    data: JSON.stringify(model),
                    traditional: true
                }).done(function (result) {
                    callback(result);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log('Error:', errorThrown);
                });

            } else {
                alert(localization.DashboardLicenseRequired);
            }
        }

        function duplicateFolder(parentDefinition, callback) {
            var parentDefinitionAsString = JSON.stringify(parentDefinition)

            var model = {
                parentDefinition: parentDefinitionAsString
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/DuplicateFolder',
                contentType: 'application/json',
                data: JSON.stringify(model),
                traditional: true
            }).done(function (result) {
                callback(result.folderId, result.sectionId);
            });
        }

        function duplicateSection(parentDefinition, callback) {
            var parentDefinitionAsString = JSON.stringify(parentDefinition)

            var model = {
                parentDefinition: parentDefinitionAsString
            };

            $.ajax({
                type: 'POST',
                url: '/NavigationAdmin/DuplicateSection',
                contentType: 'application/json',
                data: JSON.stringify(model),
                traditional: true
            }).done(function (result) {
                callback(result.folderId, result.sectionId);
            });
        }
        return {
            createDashboardPage: createDashboardPage,
            createFolder: createFolder,
            createSection: createSection,
            createLink: createLink,
            'delete': deleteNode,
            retrieve: retrieve,
            syncPositions: syncPositions,
            updateVisibility: updateVisibility,
            updatePublic: updatePublic,
            changeTitle: changeTitle,
            assignGroup: assignGroup,
            unassignGroup: unassignGroup,
            changeDefinition: changeDefinition,
            updateIconClass: updateIconClass,
            deleteIconImage: deleteIconImage,
            duplicateDashboardPage: duplicateDashboardPage,
            duplicateFolder: duplicateFolder,
            duplicateSection: duplicateSection
        };
    })();

    navigationNodeService.retrieve(initialize);

    var refreshNavs = _.throttle(function () {
        app.clearNodeStorage();
        app.initSessionStorage();
    }, 2000);

    function initialize(navigationNodes) {
        var watchViewModel = true;
        var $iconFile = $('#iconFile');
        var $icons = $('#icon');
        var $details = $('.navigation-node-details');
        var $tooltips = $('.navigation-node-details span.tooltip');
        var $treeview = $('.navigation-node-treeview');
        var $template = $('#navigation-node-treeview-template');
        var $iconTemplate = $('#navigation-node-icon-list-template');
        var $iconHeaderTemplate = $('#navigation-node-icon-list-header-template');
        var $treeviewContextMenu = $('.navigation-node-treeview-context-menu');
        var $groups = $('#adGroupList');
        var $window = $(window);

        var adGroupsDataSource = new kendo.data.DataSource({
            data: [],
            sort: [
                { field: 'Domain', dir: 'asc' },
                { field: 'UserName', dir: 'asc' }
            ],
            schema: {
                model: {
                    id: 'Id'
                }
            }
        });
        var dataSource = new kendo.data.HierarchicalDataSource({
            data: navigationNodes,
            schema: {
                model: {
                    hasChildren: function (item) {
                        return item.Children && item.Children.length > 0;
                    },
                    children: 'Children',
                    id: 'Id'
                }
            }
        });
        var viewModel = kendo.observable({
            showSaveMessage: false,
            hasImage: true,
            showDetails: false,
            canDelete: false,
            canCreateSection: (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid) && false,
            canCreatePage: (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid),
            canCreateLink: (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid),
            canCreateFolder: (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid),
            group: null,
            userDetailDataSource: [],
            hasAssignedADGroups: false,
            isVisible: false,
            isPublic: false,
            sealed: false,
            title: '',
            link: '',
            linkTarget: '_self',
            id: null,
            parentIds: [],
            dirty: false,
            imageSrc: '',
            iconClass: '',
            hideMessage: _.debounce(function() {
                viewModel.set('showSaveMessage', false);
            }, 6000),
            showMessage: function() {
                viewModel.set('showSaveMessage', true);
                viewModel.hideMessage();
            },
            dismissSaveMessage: function() {
                viewModel.set('showSaveMessage', false);
            },
            createDashboardPage: function () {
                var displayString = 'New Page';
                var parentIds = viewModel.parentIds ? viewModel.parentIds.slice(0) : [];
                var id = viewModel.id;
                parentIds.push(id);
                parentIds = _.uniq(parentIds);

                // If nothing or a folder is seleted, then put the link at the top level
                if (parentIds.length < 2) {
                    parentIds = [];
                    id = null;
                }

                // If a section or link is selected, put the link under the section
                if (parentIds.length > 2) {
                    parentIds = parentIds.slice(0, 2);
                    id = parentIds[1];
                }

                 var definition = {
                    Id: this.id,
                    link: '/',
                    target: '_self',
                    isDashboardPage: true
                 };

                 navigationNodeService.createDashboardPage(id, displayString, definition, function (newId) {
                     //display info message when dashboard license is not valid
                     if (!session.consoleSetting.DashboardsLicense.IsValid) {
                         alert(localization.DashboardLicenseRequired);
                     } else {
                         navigationNodeService.retrieve(function (data) {
                             navigationNodeService.syncPositions(dataSource.data(), function () {
                                 dataSource.data(data);
                                 dataSource.sync();
                                 selectTreeChildNodeById(dataSource, treeview, newId, parentIds);
                                 //selectTreeNodeById(dataSource, treeview, newId);
                                 ajaxComplete();
                                 refreshNavs();
                             });
                         });
                     }
                     
                });
            },
            createFolder: function() {
                app.lib.mask.apply();
                var displayString = 'Placeholder text';

                navigationNodeService.createFolder(displayString, function(folderId, sectionId) {
                    dataSource.insert(0, { Id: folderId, ParentId: null, Ordinal: 0 });
                    navigationNodeService.syncPositions(dataSource.data(), function() {
                        navigationNodeService.retrieve(function(data) {
                            dataSource.data(data);
                            dataSource.sync();
                            _.delay(function() {
                                selectTreeChildNodeById(dataSource, treeview, sectionId, [folderId]);
                                ajaxComplete();
                                refreshNavs();
                            }, 100);
                        }); 
                    });
                });
            },
            createSection: function () {
                app.lib.mask.apply();
                var displayString = 'Placeholder text';
                var parentIds = viewModel.parentIds.slice(0);
                parentIds.push(viewModel.id);

                navigationNodeService.createSection(viewModel.id, displayString, function (id) {
                    navigationNodeService.retrieve(function (data) {
                        navigationNodeService.syncPositions(dataSource.data(), function () {
                            dataSource.data(data);
                            dataSource.sync();
                            selectTreeChildNodeById(dataSource, treeview, id, parentIds);
                            ajaxComplete();
                            refreshNavs();
                        });
                    });
                });
            },
            createLink: function () {
                app.lib.mask.apply();
                var id = viewModel.id;
                var displayString = 'Placeholder text';
                var parentIds = viewModel.parentIds.slice(0);
                parentIds.push(id);
                parentIds = _.uniq(parentIds);

                // Hierarchy: folder > section > links

                // If nothing or a folder is seleted, then put the link at the top level
                if (parentIds.length < 2) {
                    parentIds = [];
                    id = null;
                }

                // If a section or link is selected, put the link under the section
                if (parentIds.length > 2) {
                    parentIds = parentIds.slice(0, 2);
                    id = parentIds[1];
                }

                var definition = {
                    Id: this.id,
                    link: '/',
                    target: '_self'
                };
                var definitionString = JSON.stringify(definition);

                navigationNodeService.createLink(id, displayString, definitionString, function (newId) {
                    navigationNodeService.retrieve(function (data) {
                        navigationNodeService.syncPositions(dataSource.data(), function () {
                            dataSource.data(data);
                            dataSource.sync();
                            selectTreeChildNodeById(dataSource, treeview, newId, parentIds);
                            ajaxComplete();
                            refreshNavs();
                        });
                    });
                });
            },
            addGroup: function() {
                app.lib.mask.apply();
                var parentIds = viewModel.parentIds.slice(0);

                navigationNodeService.assignGroup(viewModel.id, viewModel.group.Id, function () {
                    navigationNodeService.retrieve(function(data) {
                        dataSource.data(data);
                        dataSource.sync();
                        selectTreeChildNodeById(dataSource, treeview, viewModel.id, parentIds);
                        ajaxComplete();
                        refreshNavs();
                    });
                });
            },
            change: function() {
                var dataItem = dataSource.get(this.id);
                var hasChanged = dataItem.DisplayString !== this.title;

                if (!this.dirty && hasChanged) this.dirty = true;

                dataItem.set('DisplayString', this.title);
                dataSource.sync();
            },
            blur: function() {
                var dataItem = dataSource.get(this.id);
                dataItem.set('DisplayString', this.title);
                dataSource.sync();

                if (this.dirty) {
                    app.lib.mask.apply();

                    navigationNodeService.changeTitle(this.id, this.title, function() {
                        this.dirty = false;
                        ajaxComplete();
                        refreshNavs();
                    });
                }
            },
            changeLink: function (e) {
                //self, blank, top
                var newLinkTarget = e.currentTarget.getAttribute("value");

                var dataItem = dataSource.get(this.id);
                var definition = dataItem.Definition;
                $.extend(definition, {
                    Id: this.id,
                    link: this.link,
                    target: this.linkTarget
                });
                definition.target = newLinkTarget;
                 
                var definitionString = JSON.stringify(definition);
                
                var hasChanged = dataItem.Definition !== definitionString;

                if (!hasChanged) return;

                dataItem.set('Definition', definition);
                dataSource.sync();
                app.lib.mask.apply();

                navigationNodeService.changeDefinition(this.id, definitionString, function () {
                    ajaxComplete();
                    refreshNavs();
                });
            },
            'delete': function () {
                app.lib.mask.apply();
                viewModel.set('showDetails', false);
                var parentIds = viewModel.parentIds.slice(0);

                navigationNodeService.delete(this.id, function() {
                    navigationNodeService.syncPositions(dataSource.data(), function() {
                        navigationNodeService.retrieve(function(data) {
                            dataSource.data(data);
                            dataSource.sync();
                            viewModel.set('canCreateSection', (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid) && false);
                            selectTreeChildNodeById(dataSource, treeview, parentIds[parentIds.length - 1], parentIds);
                            ajaxComplete();
                            refreshNavs();
                        });
                    });
                });
            },
            canEditPage: true,
            editPage: function () {
                var dataItem = dataSource.get(this.id);
                var definition = dataItem.Definition;
                window.open(definition.link, "_self");
            },
            duplicateDashboardPage: function (parentDefinition) {
                var displayString = 'New Page';
                var parentIds = viewModel.parentIds ? viewModel.parentIds.slice(0) : [];
                var id = viewModel.id;
                parentIds.push(id);
                parentIds = _.uniq(parentIds);

                // If nothing or a folder is seleted, then put the link at the top level
                if (parentIds.length < 2) {
                    parentIds = [];
                    id = null;
                }

                // If a section or link is selected, put the link under the section
                if (parentIds.length > 2) {
                    parentIds = parentIds.slice(0, 2);
                    id = parentIds[1];
                }

                var definition = {
                    Id: this.id,
                    link: '/',
                    target: '_self',
                    isDashboardPage: true
                };

                navigationNodeService.duplicateDashboardPage(id, displayString, definition, parentDefinition, function (newId) {
                    //display info message when dashboard license is not valid
                    if (!session.consoleSetting.DashboardsLicense.IsValid) {
                        alert(localization.DashboardLicenseRequired);
                    } else {
                        navigationNodeService.retrieve(function (data) {
                            navigationNodeService.syncPositions(dataSource.data(), function () {
                                dataSource.data(data);
                                dataSource.sync();
                                selectTreeChildNodeById(dataSource, treeview, newId, parentIds);
                                //selectTreeNodeById(dataSource, treeview, newId);
                                ajaxComplete();
                                refreshNavs();
                            });
                        });
                    }

                });
            },
            duplicateFolder: function (parentDefinition) {
                app.lib.mask.apply();

                navigationNodeService.duplicateFolder(parentDefinition, function (folderId, sectionId) {
                    dataSource.insert(parentDefinition.Ordinal+1, { Id: folderId, ParentId: null, Ordinal: parentDefinition.Ordinal });
                    navigationNodeService.syncPositions(dataSource.data(), function () {
                        navigationNodeService.retrieve(function (data) {
                            dataSource.data(data);
                            dataSource.sync();
                            _.delay(function () {
                                selectTreeChildNodeById(dataSource, treeview, sectionId, [folderId]);
                                ajaxComplete();
                                refreshNavs();
                            }, 100);
                        });
                    });
                });
            },
            duplicateSection: function (parentDefinition) {
                app.lib.mask.apply();

                navigationNodeService.duplicateSection(parentDefinition, function (folderId, sectionId) {
                    navigationNodeService.syncPositions(dataSource.data(), function () {
                        navigationNodeService.retrieve(function (data) {
                            dataSource.data(data);
                            dataSource.sync();
                            _.delay(function () {
                                selectTreeChildNodeById(dataSource, treeview, sectionId, [folderId]);
                                ajaxComplete();
                                refreshNavs();
                            }, 100);
                        });
                    });
                });
            }
        });

        var modelChangeEvents = {
            isPublic: function () {
                var dataItem = dataSource.get(this.id);
                dataItem.set('IsPublic', this.isPublic);
                dataSource.sync();
                app.lib.mask.apply();

                navigationNodeService.updatePublic(this.id, this.isPublic, function () {
                    ajaxComplete();
                    refreshNavs();
                });
            },
            isVisible: function () {
                var dataItem = dataSource.get(this.id);
                dataItem.set('IsVisible', this.isVisible);
                dataSource.sync();
                app.lib.mask.apply();
                
                navigationNodeService.updateVisibility(this.id, this.isVisible, function () {
                    ajaxComplete();
                    refreshNavs();
                });
            }
        }

        var ajaxComplete = function() {
            app.lib.mask.remove();
            viewModel.showMessage();
        }

        kendo.bind($('.page_content'), viewModel);
        viewModel.bind("change", function (e) {
            var fieldName = e.field;

            if (watchViewModel && modelChangeEvents[fieldName]) modelChangeEvents[fieldName].call(this);
        });

        function dontFireViewModelChangeEvents(callback) {
            watchViewModel = false;
            callback();
            watchViewModel = true;
        }

        var detailWindowData = $('#groupDetails').kendoCiresonWindow({ modal: true }).data('kendoWindow');
        
        var groups = $groups.kendoGrid({
            dataSource: adGroupsDataSource,
            columns: [
            {
                field: 'UserName',
                title: localization.Username
            }, {
                field: 'Domain',
                title: localization.Domain
            }, {
                field: 'DistinguishedName',
                title: localization.DistinguishedName
            }, {
                command: [{
                    text: localization.Delete,
                    click: function (e) {
                        var selectedItem = this.dataItem($(e.currentTarget).closest('tr'));
                        var groupId = selectedItem.Id;
                        var groupData = adGroupsDataSource.data();
                        var filteredGroups = _.reject(groupData, function (g) {
                            return g.Id == groupId;
                        });
                        adGroupsDataSource.data(filteredGroups);
                        adGroupsDataSource.sync();

                        viewModel.set('hasAssignedADGroups', (filteredGroups || []).length > 0);

                        app.lib.mask.apply();

                        navigationNodeService.unassignGroup(viewModel.id, groupId, function () {
                            var dataItem = dataSource.get(viewModel.id);
                            dataItem.AssignedADGroups = _.reject(dataItem.AssignedADGroups, function(g) {
                                return g.Id == groupId;
                            });
                            
                            ajaxComplete();
                        });
                    }
                }],
                title: '&nbsp;',
                width: app.isMobile() ? 75 : 100
            }]
        }).data('kendoGrid');

        $details.on('click', '.open-modal', function (e) {
            var selectedItem = groups.dataItem($(e.currentTarget).closest('tr'));
            var groupId = selectedItem.Id;
            if (!groupId) return;

            $.ajax({
                type: 'GET',
                url: '/search/GetObjectProperties/',
                contentType: 'application/json',
                data: {
                    id: groupId
                },
            }).done(function (data) {
                var transformedData = _(data).chain().map(function (val, key) {
                    return {
                        key: key,
                        val: val
                    };
                }).filter(function (item) {
                    return item.val;
                }).value();

                viewModel.set('userDetailDataSource', transformedData);
                detailWindowData.title(selectedItem.Domain + '\\' + selectedItem.UserName);
                detailWindowData.center().open();
            });
        });

        $tooltips.kendoTooltip({
            position: 'bottom'
        });

        var treeview = $treeview.kendoTreeView({
            loadOnDemand:false,
            template: kendo.template($template.html()),
            dragAndDrop: true,
            dataSource: dataSource,
            select: function (e) {
                var that = this;
                viewModel.set('showDetails', false);
               
                _.delay(function() {
                    var dataItem = that.dataItem(e.node);
                    dontFireViewModelChangeEvents(function() {
                        viewModel.set('sealed', dataItem.Sealed);
                        viewModel.set('showDetails', true);
                        viewModel.set('title', dataItem.DisplayString);
                        viewModel.set('id', dataItem.Id);
                        viewModel.set('parentIds', dataItem.Parents);
                        viewModel.set('imageSrc', dataItem.HasImage ? dataItem.Icon : '');
                        viewModel.set('hasImage', dataItem.HasImage);
                        viewModel.set('iconClass', dataItem.IconClass);
                        viewModel.set('isVisible', dataItem.IsVisible);
                        viewModel.set('isPublic', dataItem.IsPublic);
                        viewModel.set('hasAssignedADGroups', (dataItem.AssignedADGroups || []).length > 0);
                        viewModel.set('group', null);
                        viewModel.set('canDelete', !dataItem.Sealed && !dataItem.hasChildren);
                        viewModel.set('canCreateSection', (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid) && dataItem.Depth === 0);

                        var hasLink = dataItem.Definition
                                      && !_.isUndefined(dataItem.Definition.link)
                                      && !_.isUndefined(dataItem.Definition.target)
                                      && !dataItem.Definition.isDashboardPage;

                        var link = hasLink ? dataItem.Definition.link : '';
                        var linkTarget = hasLink ? dataItem.Definition.target : '_self';
                        
                        viewModel.set('hasLink', hasLink);
                        viewModel.set('link', link);
                        viewModel.set('linkTarget', linkTarget);

                        var canEditPage = (!_.isUndefined(dataItem.Definition) && !_.isNull(dataItem.Definition)) ? dataItem.Definition.isDashboardPage : false;
                        viewModel.set('canEditPage', canEditPage);
                    });
                    
                    adGroupsDataSource.data(dataItem.AssignedADGroups || []);

                    iconList.value(dataItem.IconClass);
                }, 250);
            },
            dragstart: function (e) {
                var $element = e.sourceNode;

                var that = this;
                var sourceNode = e.sourceNode;

                var sourceDataItem = that.dataItem(sourceNode);

                if (sourceDataItem.hasChildren && e.dropPosition == "over") {
                    e.preventDefault();
                } 

                treeview.select($element);
                treeview.trigger('select', { node: $element });
                
            },
            dragend: function (e) {
                app.lib.mask.apply();
                viewModel.set('showDetails', false);
                var id = viewModel.id;

                var that = this;
                var sourceNode = e.sourceNode;
                
                var sourceDataItem = that.dataItem(sourceNode);
                
                if (sourceDataItem.hasChildren && e.dropPosition == "over") {
                    e.preventDefault();
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Warning,
                        message: localization.NavNodeNestFolderError
                    }).done(function () { location.reload(); });
                    app.lib.mask.remove();
                    return;
                } 

                navigationNodeService.syncPositions(dataSource.data(), function () {
                    navigationNodeService.retrieve(function (data) {
                        var parentIds = [];

                        recurse(data, 'Children', false, function (item) {
                            if (item.Id === id) {
                                parentIds = item.Parents;
                            }
                        });

                        dataSource.data(data);
                        dataSource.sync();
                        viewModel.set('canCreateSection', (session.consoleSetting.DashboardsLicense.IsValid || session.consoleSetting.AnalystPortalLicense.IsValid) && false);
                        selectTreeChildNodeById(dataSource, treeview, id, parentIds);
                        ajaxComplete();
                        refreshNavs();
                    });
                });


                
            }
        }).data('kendoTreeView');

       

        $treeviewContextMenu.kendoContextMenu({
            target: $treeview,
            filter: ".node-details-sealed-false",
            select: function (e) {
                var node = $(e.target);
                var nodeData = $treeview.data("kendoTreeView").dataItem(node);

                if (nodeData.hasChildren == true) {
                    if (nodeData.ParentId == null) {
                        viewModel.duplicateFolder(nodeData);
                    } else {
                        viewModel.duplicateSection(nodeData);
                    }
                } else { 
                    viewModel.duplicateDashboardPage(nodeData);
                }
            }
        });
        
        $iconFile.kendoUpload({
            multiple: false,
            showFileList: false,
            async: {
                saveUrl: '/NavigationAdmin/SaveNavigationNodeImage',
                removeUrl: 'remove',
                autoUpload: true
            },
            localization: {
                cancel: localization.Cancel,
                dropFilesHere: localization.DropFilesHere,
                headerStatusUploaded: localization.HeaderStatusUploaded,
                headerStatusUploading: localization.HeaderStatusUploading,
                remove: localization.Remove,
                retry: localization.Retry,
                select: localization.UploadIcon,
                statusFailed: localization.StatusFailed,
                statusWarning: localization.StatusWarning,
                statusUploaded: localization.StatusUploaded,
                statusUploading: localization.StatusUploading,
                uploadSelectedFiles: localization.UploadSelectedFiles
            },
            upload: function (e) {
                e.data = { id: viewModel.id };
            },
            success: function() {
                var dataItem = dataSource.get(viewModel.id);
                var icon = dataItem.Icon;

                navigationNodeService.updateIconClass(viewModel.id, '', function() {
                    dataItem.set('HasImage', true);
                    dataItem.set('IconClass', '');

                    if (icon.indexOf('?') === -1) {
                        dataItem.set('Icon', icon + '?' +new Date().getTime());
                    } else {
                        dataItem.set('Icon', icon.replace(/[0-9]+$/g, new Date().getTime()));
                    }

                    dataSource.sync();

                    viewModel.set('hasImage', true);
                    viewModel.set('imageSrc', dataItem.Icon);
                    viewModel.set('iconClass', '');
                    iconList.value('');

                    refreshNavs();
                });
            }
        });
        
        var iconList = $icons.kendoComboBox({
            filter: "startswith",
            dataTextField: "name",
            dataValueField: "value",
            headerTemplate: $iconHeaderTemplate.html(),
            template: $iconTemplate.html(),
            dataSource: {
                data: getIcons()
            },
            select: function (e) {
                var listItem = this.dataItem(e.item.index());
                var iconClass = listItem.value;
                
                if (iconClass && iconClass !== viewModel.iconClass) {
                    navigationNodeService.updateIconClass(viewModel.id, iconClass, function() {
                        navigationNodeService.deleteIconImage(viewModel.id, function() {
                            var dataItem = dataSource.get(viewModel.id);
                            dataItem.set('HasImage', false);
                            dataItem.set('IconClass', iconClass);

                            viewModel.set('hasImage', false);
                            viewModel.set('iconClass', iconClass);

                            dataSource.sync();
                            refreshNavs();
                        });
                    });
                } else {
                    viewModel.set('iconClass', iconClass);
                }
            }
        }).data("kendoComboBox");
    }

    function selectTreeChildNodeById(treeDataSource, tree, id, parentIds) {
        if (_.isArray(parentIds) && parentIds.length > 0) tree.expandPath(parentIds.slice(0));
        if (!_.isUndefined(id) && !_.isNull(id)) selectTreeNodeById(treeDataSource, tree, id);
    }

    function selectTreeNodeById(treeDataSource, tree, id) {
        var item = treeDataSource.get(id);
        var $element = tree.findByUid(item.uid);
        tree.select($element);
        tree.trigger('select', { node: $element });
    }

    function recurse(items, field, depthFirst, callback, parent, depth) {
        if (!items) return;
        if (depth === undefined) depth = 0;

        for (var i = 0; i < items.length; i++) {
            if (!depthFirst) callback(items[i], i, depth, parent);
            recurse(items[i][field], field, depthFirst, callback, items[i], depth + 1);
            if (depthFirst) callback(items[i], i, depth, parent);
        }
    }
});