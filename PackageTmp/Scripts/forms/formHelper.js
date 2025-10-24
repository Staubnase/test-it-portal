define([

], function (

        ) {


    var definition = {
        
        manageDirty: function (vm) {
            app.lib.CleanPageFormViewModel(vm);
            //setup is dirty flag
            vm.set('isDirty', false);
            //bind to view model changes to set dirty flag
            vm.bind("change", function (e) {
                //don't trigger isDirty changes on items listed on the excludedProperties list:
                var excludedProperties = ["isDirty", "HistoryButton", "ConfigItemRelatedWI", "ConfigItem","Activity"];
                if (!_.contains(excludedProperties, e.field)) {
                    vm.set("isDirty", true);
                }
            });
            //don't let the user leave the page if form is dirty
            window.onbeforeunload = function () {
                //TODO find a way to over write default browser alert
                if (vm.get("isDirty")) {
                    return localization.UnsavedDataMessage;
                }
            }
        },
        mobileDrawerTaskButton: function (taskContainer) { //This will going to create task button to the drawer for mobile task
            //if (app.isMobileDevice()) 
            var task = drawermenu.addButton(localization.Tasks, "fa fa-tasks", function () { });
            app.lib.makeDrawer("bottom", taskContainer, task, true);

            function mobileTaskShow() {
                if (app.isMobile()) {
                    task.show();
                } else {
                    task.hide();
                }
            }

            $(window).resize(function () {
                mobileTaskShow();
            });

            mobileTaskShow();
        },
        makeFormPristine: function (viewModel) {
            var setFormNotDirty = function (_currentVM) {
                for (var i in _currentVM) {
                    if (i == "view" || i == "_events" || i == "_handlers" || Object.prototype.toString.call(_currentVM[i]) === '[object Function]') continue;

                    if (_currentVM.isDirty) {
                        _currentVM.isDirty = false;
                    }

                    if (i == "Activity") {
                        for (var activityIndex in _currentVM[i]) {
                            setFormNotDirty(_currentVM[i][activityIndex]);
                            _currentVM[i][activityIndex].isDirty = false;
                        }
                    }
                }
            };
            setFormNotDirty(viewModel);
        }

    }


    return definition;
});

