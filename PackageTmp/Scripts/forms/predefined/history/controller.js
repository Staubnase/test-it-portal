/**
history
**/

define(function (require) {
    const tpl = require("text!forms/predefined/history/view.html");


    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            const built = _.template(tpl);
            const templateFrag = $(built(node));

            const getActivities = (activity, res = new Map(), prefix = [], depth) => {
                activity.forEach(act => {
                    const values = [...prefix, act.Id];
                    res.set(act.BaseId, { title: values, depth: depth });
                    if (act.Reviewer) {
                        act.Reviewer.forEach(rev => {
                            res.set(rev.BaseId, { title: values, depth: depth });
                        })
                    }
                    if (act.Activity) {
                        getActivities(act.Activity, res, values, depth + 1);
                    }
                });
                return res;
            };

            if (!_.isUndefined(pageForm.newWI)) { vm.set("HistoryButton", !pageForm.newWI); } //workitem
            if (!_.isUndefined(pageForm.isNew)) { vm.set("HistoryButton", !pageForm.isNew); } //AM 

            vm.view.loadHistory = function () {

                //hide button *before* history loads
                //originally the button was hidden after a successful load of the history,
                //but that allowed the user to repeatedly mash the button, causing
                //multiple instances of the history to load
                vm.set("HistoryButton", false);
                //this DOM element will be needed again later, so store it in a variable
                //to prevent unneccessary scans of the DOM
                const $historyView = $("#historyView");

                //is there a proper kendo way to do this?
                $historyView.children().remove();
                let historyUri = ((!!vm.CiresonAnalyticsArchive) ? "/Search/GetObjectHistoryArchive?id=" : "/Search/GetObjectHistory?id=") + vm.BaseId + "&languageCode=" + session.user.LanguageCode;
                //Is the feature which includes activity history enabled?
                const itemMap = new Map();
                $.ajax({
                    url: "/Search/IsSubType",
                    type: "GET",
                    data: { classId: vm.ClassTypeId, baseClassId: "f59821e2-0364-ed2c-19e3-752efbb1ece9" },
                    timeout: 3000,
                    success: function (data) {
                        if (data.isSubType && session.features.IncludeActivityHistory) {
                            //create a map object with the details of the work item
                            itemMap.set(vm.BaseId, { title: [vm.Id], depth: 0 });
                            let depth = 1;
                            //add the activities to the map
                            getActivities(vm.Activity ?? [], itemMap, [vm.Id], depth);

                            const ids = Array.from(itemMap.keys()).reduce((queryString, value) => queryString + 'ids=' + value + '&', '?');
                            historyUri = "/Search/GetObjectHistoryArchiveList" + ids + "&languageCode=" + session.user.LanguageCode;
                        }

                        //kendo.ui.progress(templateFrag, true);
                        $.ajax({
                            url: historyUri,
                            type: "GET",
                            cache: false,
                        }).done(function (data, textStatus, jqXHR) {
                            const includeActivityHistory = (session.features.IncludeActivityHistory && itemMap.size > 0)
                            const namedData = includeActivityHistory ? data.map(e => ({ ...e, Name: (itemMap.get(e.Id)).title.join(' > '), Depth: (itemMap.get(e.Id)).depth, includeActivityHistory: includeActivityHistory })) : data.map(e => ({ ...e, includeActivityHistory: includeActivityHistory }));

                            //build a view model
                            const historyModel = kendo.observable({
                                nodes: namedData
                            });

                            //create then render the new view
                            const htmlTemplate = '<ul class="timeline" data-template="propertyHistoryTemplate" data-bind="source: nodes"></ul>';
                            const settings = {
                                model: historyModel,
                                wrap: false,
                                init: $.noop //empty function
                            };
                            const history = new kendo.View(htmlTemplate, settings);
                            history.render($historyView);
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            //should we alert the user?
                            //at least log the error
                            console.log(textStatus + ":", errorThrown);
                        }).always(function () {
                            //show the button
                            vm.set("HistoryButton", true);
                        });
                    }
                });
            }
            callback(templateFrag);
        }
    }

    return definition;

});