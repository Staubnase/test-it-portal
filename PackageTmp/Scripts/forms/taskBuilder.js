define([
    "forms/tasks/anchor/controller",
    "forms/tasks/analystByGroup/controller",
    "forms/tasks/assignToMe/controller",
    "forms/tasks/changeStatus/controller",
    "forms/tasks/amChangeStatus/controller",
    "forms/tasks/acknowledge/controller",
    "forms/tasks/convertToParent/controller",
    "forms/tasks/linkToParent/controller",
    "forms/tasks/newStatus/controller",
    "forms/tasks/sendEmail/controller",
    "forms/tasks/custom/controller",
    "forms/tasks/spacer/controller",
    "forms/tasks/associateItem/controller",
    "forms/tasks/setDate/controller",
    "forms/tasks/updateAssetManagement/controller",
    "forms/tasks/updateSupersededHardware/controller",
    "forms/tasks/copyLicenseAssignments/controller",
    "text!/CustomSpace/customtasks.tmpl.html",
    "forms/tasks/copyToNewWI/controller",
    "forms/tasks/increaseAvailableCount/controller",
    "forms/tasks/decreaseAvailableCount/controller",
    "forms/tasks/print/controller",
    "forms/tasks/addMeToWatchList/controller"

], function (
    anchor,
    analystByGroup,
    assignToMe,
    changeStatus,
    amChangeStatus,
    acknowledge,
    convertToParent,
    linkToParent,
    newStatus,
    sendEmail,
    custom,
    spacer,
    associateItem,
    setDate,
    updateAssetManagement,
    updateSupersededHardware,
    copyLicenseAssignments,
    customTmpl,
    copyToNewWI,
    increaseAvailableCount,
    decreaseAvailableCount,
    print,
    addMeToWatchList,
    activityDiagram
        ) {


    var definition = {
        build: function (vm, callback) {
            var ulElement = $('<ul/>');

            if (vm.fromDrawerBuilder) {
                //remap the list of tasks to match what form builder does
                vm.taskTemplate = {
                    tasks: vm.tasks
                }
                ulElement.addClass("drawer-task-menu dropdown-menu");
                ulElement.attr('role', 'menu');
            } else {
                ulElement.addClass("taskmenu");
            }
            
            var taskCallback = function (view) {
                ulElement.append(view);
            };

            //set up each task
            _.each(vm.taskTemplate.tasks, function (task) {
                
                if (_.isString(task.Access)) {
                    //coming from drawerbuild task.Access needs to be evaluated here
                    task.Access = eval(task.Access);
                }
                
                if (task.Access) {
                    //get template and check for existance
                    eval("var _obj = " + task.Task + ";");
                    if (!_obj) {
                        throw Exception(task.Task + " is not part of the templating system");
                        return false;
                    }

                    _obj.build(vm, task, function (view) {
                        var elem = $(view);
                        if (elem[0].tagName == "LI") {
                            elem.addClass("cs-form__task");
                            elem.addClass("cs-form__task--" + task.Task);
                        }
                        else {
                            elem.addClass("cs-form__task-window--" + task.Task);
                        }
                        taskCallback(view);
                    });
                }
            });

            //send back <ul> with <li> of each task
            callback(ulElement);

            if (!vm.fromDrawerBuilder) {
                //not drawer tasks so now add custom template html
                var tmpl = $('<div/>').addClass("hide");
                tmpl.append(customTmpl);
                //add the menu
                callback(tmpl);
            }
        }
    }


    return definition;
});