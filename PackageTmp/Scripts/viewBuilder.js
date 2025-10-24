define([
    "structure/header/controller",
    "structure/tab/tabNavigation/controller",
    "structure/tab/tabPane/controller",
    "structure/tab/tabContent/controller",
    "structure/tab/tabData/controller",
    "structure/column/controller",
    "structure/content/controller",
    "viewPanels/viewPanelBuilder"
], function (
    header,
    tabNavigation,
    tabPane,
    tabContent,
    tabData,
    column,
    content,
    viewPanel
) {
    var definition = {
        build: function (vm, callback) {
            var viewModel = vm.view;
            viewModel.tempProperties = {};

            /*
             * set local variables to the different DOM elements we will be using
             */
            var wrapperContainer = $('#main_wrapper');
            var pageContainer = $('.page_content');
            pageContainer.find('.container-fluid').append("<div class='page_container'></div>");
            var viewContainer = $('.page_container');


            /*
             * compose page based on layout type
             */
            if (vm.layoutType === 'semantic') {

                //don't want anything in there so clear it out the current html (except ng-view)
                $('.viewbuilder-struct').remove();
                
                //wrapperContainer = $("div [ui-view]");
                composeSemanticPage(viewModel, wrapperContainer);

                /*
                 * example of what def file looks like:
                 * "appFilePath": "ng/kb/home/app"
                 */
                if (vm.appFilePath && _.isString(vm.appFilePath)) {
                    //use require to load and initialize application
                    var ngApp = require([vm.appFilePath]);
                };

                //set the page title if in definition
                if (vm.pageTitle && vm.pageTitle.length > 0) {
                    document.title = localizationHelper.localize(vm.pageTitle, vm.pageTitle);
                };

            } else {
                composeHeader(viewModel.header);    //vm.view.header
                composeBody(viewModel.body);        //vm.view.body
            }


            //page composed, call the callback so viewMain can finish up.
            callback();


            /*
             * functions/helpers
             */
            function composeHeader(headerTemplate) {
                if (!headerTemplate) {
                    $('.page_bar').remove();
                    return;
                }

                var headerTmpl;
                if (!headerTemplate.type) {
                    header.build(viewModel, headerTemplate, function (tmpl) {
                        headerTmpl = tmpl;
                    });
                } else {
                    viewPanel.build(viewModel, headerTemplate, function (tmpl) {
                        headerTmpl = tmpl;
                    });
                }

                //render a little differnt if it is a unique header
                switch (vm.layoutType) {
                    case "homepage":
                        $('.page_bar').remove();
                        pageContainer.before(headerTmpl);
                        break;
                    case "full":
                    default:
                        var rowElm = $('<div/>').addClass("row");
                        var headerElm = rowElm.append(headerTmpl);
                        $('.page_bar').empty().append(headerElm);
                        break;
                }
            };

            function composeTabs(layoutTemplate, nestedContent) {
                composeTabNavigation(layoutTemplate.tabs, nestedContent);
                tabContent.build(viewModel, layoutTemplate, function (tabsContTmpl) {
                    //tabsContainer is a div that wraps all the tab-pane's together
                    var tabsContainer = app.lib.getContainer(tabsContTmpl);
                    _.each(layoutTemplate.tabs, function (tab) {
                        tabPane.build(viewModel, tab, function (paneTmpl) {
                            var tabPaneContainer = app.lib.getContainer(paneTmpl);
                            composeContent(tab, tabPaneContainer, function (tmpl) {
                                tabsContainer.append(tmpl);
                            });
                        });
                    });

                    !_.isUndefined(nestedContent) ? $(nestedContent).append(tabsContainer) : viewContainer.append(tabsContainer);
                });
            }

            function composeBody(body) {
                if (body.tabs) {
                    //page with tabs.
                    composeTabs(body, viewContainer);
                } else {
                    //standard row/col page with now tabs
                    composeBodyContent(body, viewContainer, function () { });
                }
            }

            function composeSemanticPage(contentObject, containerEle) {
                var scopedContainer = app.lib.getContainer(containerEle);

                //build current contentObj..
                content.build(viewModel, contentObject, function (divTmpl) {
                    //take returned container and appended to current scopedContainer
                    var builtContainer = app.lib.getContainer(divTmpl);
                    scopedContainer.append(builtContainer);

                    //move the container scope down to what we built
                    scopedContainer = builtContainer;

                    //add classes to container if defined
                    if (contentObject.cssClass) {
                        scopedContainer.addClass(contentObject.cssClass);
                    }

                    //check if we have nested content
                    if (_.isUndefined(contentObject.content) && contentObject.type == "viewPanel") {
                        //no nested .content so it is require for now to have a viewPanel in it.
                        viewPanel.build(viewModel, contentObject, function (tmpl) {
                            //add the viewpanel inside the current content block
                            //if (tmpl.isDirective) {
                            //scopedContainer.append($compile(tmpl.html));
                            //} else {
                            scopedContainer.append(app.lib.getContainer(tmpl));
                            //}
                        });
                    } else {
                        //nested content, check if it is an array or a single content
                        if (_.isArray(contentObject.content)) {
                            //declare contentArray since contentObject.content is getting hard to follow
                            var contentArray = contentObject.content;
                            _.each(contentArray, function (content) {
                                composeSemanticPage(content, scopedContainer)
                            });
                        } else {
                            //not an array so we just pass in contentObject.content to this function to start all over
                            var childContent = contentObject.content;
                            composeSemanticPage(childContent, scopedContainer)
                        }
                    }
                });
            };

            function composeBodyContent(structure, container, localCallback) {
                var scopedContainer = app.lib.getContainer(container);
                var rows = structure.content.rows;

                //the actual rows and columns now
                _.each(rows, function (rowNode) {
                    //var rowContainer = app.isMobile() ? app.lib.getContainer("<div></div>") : app.lib.getContainer("<div class='row'></div>");
                    var rowContainer = app.lib.getContainer("<div class='row'></div>");
                    scopedContainer.append(rowContainer);

                    app.lib.setColumnSizes(rowNode.columns);
                    _.each(rowNode.columns, function (columnNode) {
                        column.build(viewModel, columnNode, function (panelTmpl) {
                            var panelContainer = app.lib.getContainer(panelTmpl);
                            rowContainer.append(panelContainer);

                            //used for nested builder calls (passed to viewPanelBuilder and then on to the others)
                            viewModel.tempProperties.currentContainer = panelContainer;
                            viewPanel.build(viewModel, columnNode, function (tmpl) {
                                if (viewModel.tempProperties.fromGridBuilder && columnNode.type == "panel") {
                                    panelContainer.find('.panel').addClass('panel-flat');
                                } else {
                                    var returnedContainer = app.lib.getContainer(tmpl);
                                    panelContainer.find('.append-here').append(returnedContainer);
                                }

                                //clean up temp props
                                delete viewModel.tempProperties.fromViewBuilder;
                                delete viewModel.tempProperties.fromGridBuilder;
                                delete viewModel.tempProperties.currentContainer;
                            });
                        });
                    });
                });//-end _each

                localCallback(container);
            }

            function composeTabNavigation(tabs, nestedContainer) {
                tabNavigation.build(viewModel, tabs, function (tabtplString) {
                    var tabnavCont = $(tabtplString);

                    var focusSet = false;
                    _.each(tabs, function (tab, index) {
                        //set vals needed for tab functionality
                        tab.tabId = app.lib.newGUID();
                        tab.active = (index == 0) ? "active" : "";
                        tab.content.tabId = tab.tabId;
                        tab.content.active = tab.active;

                        var focusedTabName = app.getParameterByName("tab").toLowerCase();
                        var tabNodeNameKey = tab.name.toLowerCase(); //need to be set here before .localize is called in tabData.build
                        tabData.build(tabs, tab, function (tplString) {
                            var element = $(tplString);
                            tabnavCont.append(element);
                            //sets which tab is focused based off url param
                            if (!focusSet && focusedTabName.length > 0) {
                                if (tabNodeNameKey === focusedTabName) {
                                    element.find("a").attr("selected", "true");
                                    focusSet = true;
                                }
                            };
                        });
                    });//--end _each on tabnav

                    !_.isUndefined(nestedContainer) ? $(nestedContainer).append(tabnavCont) : viewContainer.append(tabnavCont);
                });
            };
            /*
             * --END functions/helpers
             */
        }//--END build function
    }
    return definition;
});

