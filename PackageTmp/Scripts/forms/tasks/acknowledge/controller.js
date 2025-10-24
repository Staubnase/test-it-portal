/**
acknowledge incident
**/

define(function (require) {
    //we only need the achor template for this task
    var anchor = require("text!forms/tasks/anchor/view.html");
    var tpl = require("text!forms/tasks/acknowledge/view.html");


    var definition = {
        template: tpl,
        build: function (vm, node, callback) {
            //build the template for the window
            var built = _.template(tpl);
            var view = new kendo.View(built(properties), { wrap: false });

            //add in hidden window
            callback(view.render());
            
            //this view Model is bound to the anchor element 
            var viewModel = kendo.observable({
                acknowledge: function () {
                    var cont = view.element; //we have the element in memory so no need use a selector
                    win = cont.kendoCiresonWindow({
                        title: localization.Acknowledge,
                        actions: []
                    }).data("kendoWindow");

                    //this view Model is bound to the window element
                    var _vmWindow = new kendo.observable({
                        dateTimeNow: kendo.toString(new Date(), "g"),
                        dateTimeNowUTC: new Date().toISOString(),
                        actionLogComment: "",
                        isPrivate: false,
                        charactersRemaining: "4000",
                        textCounter: function () {
                            var maximumLength = 4000;
                            var actionLogComment = (this.actionLogComment.length) ? this.actionLogComment
                                : ($(cont.find("#acknowledgeComment")).val().length) ? $(cont.find("#acknowledgeComment")).val() : "";
                            var val = actionLogComment.length;

                            if (val > maximumLength) {
                                if (this.actionLogComment.length)
                                    this.actionLogComment.substring(0, maximumLength);
                                else
                                    $(cont.find("#acknowledgeComment")).val(actionLogComment.substring(0, maximumLength));
                            } else {
                                this.set("charactersRemaining", maximumLength - val);
                            }
                        },
                        okClick: function () {
                            var actionLogComment = (this.actionLogComment.length) ? this.actionLogComment
                                : ($(cont.find("#acknowledgeComment")).val().length) ? $(cont.find("#acknowledgeComment")).val() : "";
                            if (vm.viewModel.FirstResponseDate == null){
                                vm.viewModel.FirstResponseDate = this.dateTimeNowUTC;
                                var respondDateEle = $("input[name='FirstResponseDate']");
                                if (respondDateEle.attr('data-control') == 'datePicker') {
                                    respondDateEle.val(kendo.toString(new Date(), "d"));
                                } else if (respondDateEle.attr('data-control') == 'dateTimePicker') {
                                    respondDateEle.val(kendo.toString(new Date(), "g"));
                                }
                            }
                            if (actionLogComment.length) {
                                var newActionLog = {
                                    EnteredBy: session.user.Name,
                                    Title: localization.Analyst + " " + localization.Comment,
                                    IsPrivate: this.isPrivate,
                                    EnteredDate: new Date().toISOString(),
                                    LastModified: new Date().toISOString(),
                                    Description: this.actionLogComment,
                                    DescriptionDisplay: actionLogComment,
                                    Image: (this.isPrivate) ? app.config.iconPath + app.config.icons["privateComment"] : app.config.iconPath + app.config.icons["comment"],
                                    ActionType: "AnalystComment"
                                }
                                if (!vm.viewModel.ActionLog) {
                                    vm.viewModel.ActionLog = [];
                                }
                                var actionLogType = app.controls.getWorkItemLogType(pageForm.viewModel);
                                if (actionLogType) {
                                    pageForm.viewModel[actionLogType].unshift(newActionLog);
                                }
                            }

                            win.close();
                        },
                        cancelClick: function () {
                            win.close();
                        }
                    });

                    //add control to the window
                    kendo.bind(cont, _vmWindow);
                    
                    cont.removeClass('hide');
                    cont.show();

                    win.open();
                }
            });

            //build the anchor and bind viewModel to it
            var link = _.template(anchor);
            //make sure we have all the node set
            var properties = {
                Target: "acknowledge"
            };
            $.extend(true, properties, node);
            //add in anchor
            var anchorElm = new kendo.View(link(properties), { wrap: false, model: viewModel, init: function (e) { } });
            callback(anchorElm.render());
        }
    }

    return definition;

});