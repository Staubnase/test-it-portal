define([
    "structure/drawer/gridTask/multiEditController",
    "forms/taskBuilder"
], function (
    multiEdit,
    taskBuilder
) {
    var definition = {
        build: function (vm, callback) {
            var self = this;
            var drawerOptions = vm.view.drawer;

            if (!_.isUndefined(drawerOptions)) {
                var buttons = drawerOptions.buttons;
                var taskList = drawerOptions.taskList;

                if (!_.isUndefined(buttons)) {
                    if (drawermenu && drawermenu.addButton) {
                        self.initializers.initButtons(vm, buttons);
                    } else {
                        app.events.subscribe("drawerCreated", function () {
                            self.initializers.initButtons(vm, buttons);
                        });
                    }
                }
                if (!_.isUndefined(taskList)) {
                    if (drawermenu && drawermenu.addDropUpButton) {
                        self.initializers.initTaskList(vm, taskList);
                    } else {
                        app.events.subscribe("drawerCreated", function () {
                            self.initializers.initTaskList(vm, taskList);
                        });
                    }
                }
            }

            callback();
        },
        initializers: {
            initButtons: function (vm, buttons) {
                _.each(buttons, function (button) {
                    switch (button.type) {
                        case "MultiEditGrid":
                            if (session.user.Analyst) {
                                multiEdit.build(vm, button);
                            }
                            break;
                        default:
                    }
                });
            },
            initTaskList: function (vm, taskList) {
                if (!session.user.Analyst) {
                    //check if we have any tasks that are available to non-analysts
                    var nonAnalystTaskCount = 0;
                    _.each(taskList.tasks, function(task) {
                        //task.Access is 0 = everyone, 1 = analysts 
                        if (task.Access == 0) { 
                            nonAnalystTaskCount++;
                        }
                    });
                    
                    if (nonAnalystTaskCount == 0) {
                        //no non-analysts tasks, leave.
                        return;
                    }
                }

                var taskListViewModel = kendo.observable({
                    element: {}
                });

                //drawer task list button (dropup toggle)
                var btnElement = drawermenu.addDropUpButton(localizationHelper.localize(taskList.titleKey), "fa " + taskList.icon);
                taskListViewModel.set('element', btnElement[0]);

                var taskViewModel = {
                    fromDrawerBuilder: true,
                    type: "BulkEdit", //<- used in controller file to branch logic
                    tasks: taskList.tasks //<- what taskBuilder wants in order to build the task
                };
                
                //build ze tasks
                taskBuilder.build(taskViewModel, function (view) {
                    //appending the <ul> element from taskbuilder to the drawer button
                    $(taskListViewModel.element).append(view);
                });
            }
        }
    }
    return definition;
});