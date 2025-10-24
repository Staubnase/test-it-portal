/**
calendar
**/
define(function (require) {
    var tpl = require("text!viewPanels/calendar/view.html");

    var definition = {
        template: tpl,
        build: function (vm, node, callback) {

            var updatedTpl = $(tpl).attr("data-views", JSON.stringify(node.Definition.content.views));
            var built = _.template(updatedTpl.prop('outerHTML'));

            var viewModel = new kendo.observable({
                queryId: node.Definition.content.queryId,
                id: node.Definition.content.id,
                title: node.Definition.content.title,
                description: node.Definition.content.description,
                startDate: node.Definition.content.startDate,
                endDate: node.Definition.content.endDate,
                isVisible: !_.isUndefined(node.Definition.content.isVisible) ? node.Definition.content.isVisible : true,
                defaultView: !_.isUndefined(node.Definition.content.defaultView) ? node.Definition.content.defaultView : "month",
                add: function (e) {
                    e.preventDefault();
                },
                edit: function (e) {
                    e.preventDefault();
                },
                remove: function (e) {
                    e.preventDefault();
                },
                moveStart: function (e) {
                    e.preventDefault();
                },
                move: function (e) {
                    e.preventDefault();
                },
                moveEnd: function (e) {
                    e.preventDefault();
                },
                navigate: function (e) {
                    //it takes a few sec before it formattedDate reflects at model, hence the defer.
                    _.defer(function () {
                        viewModel.set("formattedDate", e.sender._model.formattedDate);
                    });
                },
                click: function (scheduler) {
                    if (!_.isUndefined(scheduler._selection) && !_.isNull(scheduler._selection) && scheduler.data()) {
                        if (scheduler._selection.events.length) {
                            var clickedEl = _.filter(scheduler.data(),
                                function(el) {
                                    return el.uid === scheduler._selection.events[0];
                                });
                            if (clickedEl[0]) {
                                $.ajax({
                                    type: "GET",
                                    url: "/Search/GetSearchObjectByWorkItemID",
                                    data: { searchText: clickedEl[0].id },
                                    success: function (result) {
                                        window.open(result, '_blank');
                                    }
                                });
                            }
                        }
                    }
                },
                formattedDate: ""
            });

            var schedDataSource = new kendo.data.SchedulerDataSource({
                batch: true,
                transport: {
                    read: {
                        url: "/Dashboard/GetCalendarData",
                        data: { queryId: viewModel.get("queryId") },
                        dataType: "json",
                        cache: false
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { from: viewModel.get("id") },
                            title: { from: viewModel.get("title") },
                            start: { from: viewModel.get("startDate"), type: "date" },
                            end: { from: viewModel.get("endDate"), type: "date" },
                            description: { from: viewModel.get("description") },
                        }
                    }
                }
            });

            var view = new kendo.View(built(node), { wrap: false, model: viewModel });
            callback(view.render());
            
            var scheduler = $(view.element[0]).data("kendoScheduler");
            scheduler.date(new Date());
            scheduler.options.dateHeaderTemplate = kendo.template("<strong>#=kendo.toString(date, 'ddd M' + kendo.cultures.current.calendar['/'] + 'd') #</strong>");
            scheduler.view(viewModel.get("defaultView"));
            scheduler.setDataSource(schedDataSource);

            scheduler.wrapper.on("click", function (e) {
                viewModel.click(scheduler);
                scheduler.select(null); //reset selected item onced clicked
            });
            
            //set scheduler's current selected date
            viewModel.set("formattedDate", scheduler._model.formattedDate);
        }
    }

    return definition;

});