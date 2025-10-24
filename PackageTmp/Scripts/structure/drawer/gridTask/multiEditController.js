/**
drawer multi edit
**/
define(function (require) {
    var definition = {
        build: function (vm, node) {
            /*
             * Change mustSelectLeafNode and/or showEnumPath to modify
             * bulk edit enum picker behavior. 
             */
            var mustSelectLeafNode = false;
            var showEnumPath = false;

            var drawer = drawermenu;
            var btnConfig = node;
            var btnViewModel = kendo.observable({
                enabled: btnConfig.enabled,
                visible: btnConfig.isVisible,
                titleKey: btnConfig.titleKey,
                formTitleKey: btnConfig.formTitleKey,
                icon: btnConfig.icon,
                endpointUrl: btnConfig.endpointUrl,
                element: false,
                selectedWorkItemProjectionId: false,
                currentSelection: [],
                selectedType: '',
                calculatePriority: false,
                impactId: '',
                urgencyId: '',
                targetControlId: '',
                command: function () {
                    //viewmodel for the form in the drawer
                    var multiEditFormViewModel = {
                        formView: {},
                        formTitleKey: btnViewModel.formTitleKey,
                        workItems: btnViewModel.currentSelection,
                        availableFields: getAvailableFields(),
                        setCanSubmit: function () {
                            var viewModel = this;
                            if (getEditedFields(viewModel).length > 0) {
                                $('.drawer-button-submit').removeClass('disabled');
                            } else {
                                $('.drawer-button-submit').addClass('disabled');
                            }
                        },
                        formSubmit: function () {
                            app.lib.mask.apply();
                            var viewModel = this;
                            var postData = {
                                projectionId: btnViewModel.selectedWorkItemProjectionId,
                                updateServiceManagement: true,
                                itemIds: _.pluck(viewModel.workItems, 'BaseId'),
                                editedFields: getEditedFields(viewModel)
                            }

                            if (btnViewModel.selectedType == "Incident" && btnViewModel.calculatePriority) {
                                //get matrix, calculate it, add it to editedfields
                                $.ajax({
                                    url: '/WIs/Incident/GetPriorityMatrix/',
                                    type: "GET",
                                    success: function (priorityMatrix) {
                                        var matrixObj = JSON.parse(priorityMatrix);
                                        var priority = app.lib.getPriorityByMatrix(matrixObj, btnViewModel.urgencyId, btnViewModel.impactId);
                                        postData.editedFields.push({
                                            propertyName: "Priority",
                                            propertyType: "int",
                                            editedValue: priority
                                        });
                                        submitData(postData);
                                    },
                                    error: function () {
                                        saveFailure();
                                    }
                                });
                            } else {
                                submitData(postData);
                            }

                            function submitData(data) {
                                $.ajax({
                                    url: btnViewModel.endpointUrl,
                                    data: JSON.stringify(data),
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    type: "POST",
                                    success: function () {
                                        saveSuccess();
                                    },
                                    error: function () {
                                        saveFailure();
                                    }
                                });
                            }

                            function saveSuccess() {
                                //close form and clean up
                                multiEditFormViewModel.formDestroy();
                                drawer.actions.closeFormInDrawer();


                                if (app.isMobile()) {
                                    var listControl = $("[data-control-id='" + btnViewModel.targetControlId + "']").data('kendoListView');
                                    listControl.dataSource.query();
                                } else {
                                    //refresh the grid to get updated data.
                                    var targetGrid = $('#' + btnViewModel.targetControlId).data('kendoGrid');
                                    var targetGridState = app.gridUtils.savedState.getCurrentState(btnViewModel.targetControlId);
                                    app.lib.recheckGridState(targetGridState, targetGrid);
                                    targetGrid.dataSource.query(targetGridState);
                                }
                                //display message
                                app.lib.message.add(localizationHelper.localize('SaveSuccessMessage'), "success");
                                app.lib.mask.remove();
                                app.lib.message.show();
                            }

                            function saveFailure() {
                                //close form
                                drawer.actions.closeFormInDrawer();

                                //display message
                                app.lib.message.add(localizationHelper.localize('SaveErrorMessage'), "danger");
                                app.lib.mask.remove();
                                app.lib.message.show();
                            }


                        },
                        formCancel: function () {
                            this.formDestroy();
                            drawer.actions.closeFormInDrawer();
                        },
                        formClose: function () {
                            //puts the drawer back to original setup
                            drawer.actions.closeFormInDrawer();
                        },
                        formDestroy: function () {
                            var viewModel = this;
                            //destroy view
                            viewModel.formView.destroy();

                            //clean up formViewModel 
                            viewModel.set('currentSelectedField', '');
                            viewModel.set('formView', {});
                            viewModel.set('availableFields', []);
                            viewModel.set('selectedType', '');

                            btnViewModel.set('calculatePriority', false);
                            btnViewModel.set('impactId', '');
                            btnViewModel.set('urgencyId', '');
                        }
                    };

                    multiEditFormViewModel = kendo.observable(multiEditFormViewModel);
                    //binds and renders form then opens drawer.
                    drawer.actions.createFormInDrawer('multiEditTemplate', multiEditFormViewModel);

                    //init call to setCanSubmit to disable after we render form
                    multiEditFormViewModel.setCanSubmit();

                    //on forms' viewModel change recheck if 'Save' button should be enabled/disabled
                    multiEditFormViewModel.bind('change', function (e) {
                        var viewModel = this;
                        viewModel.setCanSubmit();
                    });
                },
                //onTargetControlChange fires on grid change and grid dataBound events
                onTargetControlChange: function (grid) {
                    var selectedDataItems = [];
                    if (app.isMobile()) {
                        //grid is selected items array when called from mobile
                        selectedDataItems = grid;
                    } else {
                        selectedDataItems = grid.select().map(function (index, item) {
                            return grid.dataItem($(item));
                        }).toArray();
                    }

                    //we only update 10 items at a time
                    if (selectedDataItems.length > 10) {
                        onExceedSelectionCount();
                    }

                    btnViewModel.set('currentSelection', selectedDataItems);

                    //if nothing is selected disabled the edit button
                    if (selectedDataItems.length <= 0 || selectedDataItems.length > 10) {
                        btnViewModel.setEnabled(false);
                    } else {
                        //one or more item is selected, now determine if selectedDataItems are supported Types
                        var selectedTypes = _.pluck(selectedDataItems, "WorkItemType");

                        var singleSelectedType = _.reduce(selectedTypes, function (memo, currentVal) {
                            // note: returns false if selectedDataItems are not all the same Type, 
                            //       otherwise returns the string value of the type that all selectedDataItems are
                            return (memo === currentVal) ? memo : false;
                        });


                        switch (singleSelectedType) {
                            case "System.WorkItem.ServiceRequest":
                                btnViewModel.set('selectedWorkItemProjectionId', app.constants.projectionIds.SystemWorkItemServiceRequestViewModel);
                                if (session.consoleSetting.AnalystPortalLicense.IsValid) {
                                    btnViewModel.setEnabled(true);
                                } else {
                                    btnViewModel.setEnabled(false);
                                }
                                break;
                            case "System.WorkItem.Incident":
                                btnViewModel.set('selectedWorkItemProjectionId', app.constants.projectionIds.SystemWorkItemIncidentViewModel);
                                btnViewModel.setEnabled(true);
                                break;
                            default:
                                // not a supported bulk edit Type, disable the edit button
                                btnViewModel.setEnabled(false);
                        }
                    }
                },
                setEnabled: function (isEnabled) {
                    //yeah it's ghetto, but it is what it is until we mvvm-ify the drawer.
                    if (isEnabled) {
                        $(btnViewModel.element).prop('disabled', false);
                        $(btnViewModel.element).prev('.tooltip-container-drawer-button').addClass('tooltip-container-hidden');
                        btnViewModel.set('enabled', true);
                    } else {
                        $(btnViewModel.element).prop('disabled', true);
                        $(btnViewModel.element).prev('.tooltip-container-drawer-button').removeClass('tooltip-container-hidden');
                        btnViewModel.set('enabled', false);
                    }
                },
                setVisible: function (isVisible) {
                    isVisible = isVisible || btnViewModel.visible;
                    if (isVisible) {
                        $(btnViewModel.element).show();
                        btnViewModel.set('visible', true);
                    } else {
                        $(btnViewModel.element).hide();
                        btnViewModel.set('visible', false);
                    }
                }
            });

            //add to DOM
            var btnElement = drawer.addButton(localizationHelper.localize(btnViewModel.titleKey), "fa " + btnViewModel.icon, btnViewModel.command, true, localizationHelper.localize('MustSelectSameType'));

            //reference it in the viewModel so we can toggle visibility/enabled on element
            btnViewModel.set('element', btnElement[0]);

            //set initial visibility
            btnViewModel.setVisible();

            if (app.isMobile()) {
                //called on mobile listview checkbox selection
                app.events.subscribe("mobileWiListSelectionChange", function (event, listView) {
                    if (!_.isUndefined(listView)) {
                        btnViewModel.onTargetControlChange(listView.selectedCards);
                        btnViewModel.targetControlId = listView.controlId;
                    }
                });
                app.events.subscribe("mobileWiListInit", function (event, listView) {
                    if (!_.isUndefined(listView)) {
                        btnViewModel.onTargetControlChange(listView.selectedCards);
                        btnViewModel.targetControlId = listView.controlId;
                    }
                });
            } else {
                //called on grid row clicks
                app.events.subscribe("gridChange", function (event, grid) {
                    btnViewModel.onTargetControlChange(grid);
                    btnViewModel.targetControlId = $(grid.wrapper).attr('id');
                });

                //for initial grid load listen to this event so we can set persisted state information
                app.events.subscribe("gridBound", function (event, grid) {
                    btnViewModel.onTargetControlChange(grid);
                    btnViewModel.targetControlId = $(grid.wrapper).attr('id');
                });
            }

            //helper functions
            var getAvailableFields = function () {
                var availableFields = [];
                switch (btnViewModel.selectedWorkItemProjectionId) {
                    case app.constants.projectionIds.SystemWorkItemIncidentViewModel:
                        btnViewModel.set('selectedType', "Incident");
                        availableFields = [
                            {
                                displayName: localizationHelper.localize('Classification'),
                                propertyName: 'Classification',
                                propertyType: 'enum',
                                enumId: '1f77f0ce-9e43-340f-1fd5-b11cc36c9cba',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            },
                            {
                                displayName: localizationHelper.localize('SupportGroup'),
                                propertyName: 'TierQueue',
                                propertyType: 'enum',
                                enumId: 'c3264527-a501-029f-6872-31300080b3bf',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            },
                            {
                                displayName: localizationHelper.localize('Impact'),
                                propertyName: 'Impact',
                                propertyType: 'enum',
                                enumId: '11756265-f18e-e090-eed2-3aa923a4c872',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            },
                            {
                                displayName: localizationHelper.localize('Urgency'),
                                propertyName: 'Urgency',
                                propertyType: 'enum',
                                enumId: '04b28bfb-8898-9af3-009b-979e58837852',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            }
                        ];
                        break;
                    case app.constants.projectionIds.SystemWorkItemServiceRequestViewModel:
                        btnViewModel.set('selectedType', "ServiceRequest");
                        availableFields = [
                            {
                                displayName: localizationHelper.localize('Area'),
                                propertyName: 'Area',
                                propertyType: 'enum',
                                enumId: '3880594c-dc54-9307-93e4-45a18bb0e9e1',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            },
                            {
                                displayName: localizationHelper.localize('SupportGroup'),
                                propertyName: 'SupportGroup',
                                propertyType: 'enum',
                                enumId: '23c243f6-9365-d46f-dff2-03826e24d228',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            },
                            {
                                displayName: localizationHelper.localize('Urgency'),
                                propertyName: 'Urgency',
                                propertyType: 'enum',
                                enumId: 'eb35f771-8b0a-41aa-18fb-0432dfd957c4',
                                selectedValue: {},
                                leafNodeOnly: mustSelectLeafNode,
                                showPath: showEnumPath
                            }
                        ];
                        break;
                    default:
                }

                return availableFields;
            };

            function getEditedFields(viewModel) {
                //reset to blank
                var editedFields = [];

                _.each(viewModel.availableFields, function (field) {
                    
                    if (!_.isUndefined(field.selectedValue) && field.selectedValue != "" && (!_.isEmpty(field.selectedValue) && !_.isUndefined(field.selectedValue.Id))) {
                        var fieldValue = '';
                        //get value based on the type of input control
                        //type is enum, string, date, int, double, bool. gets set when defining viewModel.availableFields
                        switch (field.propertyType) {
                            case 'enum':
                                fieldValue = field.selectedValue.Id;
                            default:
                        }
                        if (field.propertyName == "Impact") {
                            btnViewModel.set('calculatePriority', true);
                            btnViewModel.set('impactId', fieldValue);
                        }
                        if (field.propertyName == "Urgency") {
                            btnViewModel.set('calculatePriority', true);
                            btnViewModel.set('urgencyId', fieldValue);
                        }
                        editedFields.push({
                            propertyName: field.propertyName,
                            propertyType: field.propertyType,
                            editedValue: fieldValue
                        });
                    }
                });

                return editedFields;
            }

            function onExceedSelectionCount() {
                kendo.ui.ExtAlertDialog.show({
                    title: localizationHelper.localize('Warning'),
                    message: localizationHelper.localize('BulkEditExceedMessage')
                });
            }
        }
    }
    return definition;
});