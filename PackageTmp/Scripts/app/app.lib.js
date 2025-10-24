var app = (!app) ? {} : app;

//simple event bus
//http://stackoverflow.com/questions/2967332/jquery-plugin-for-event-driven-architecture
app.events = {
    subscribe: function (event, fn) {
        $(this).bind(event, fn);
    },
    unsubscribe: function (event, fn) {
        $(this).unbind(event, fn);
    },
    publish: function (event, eventData) {
        $(this).trigger(event, eventData);
    }
};


app.lib = function () {
    var that = this;
    var logs = [];
    var onPageLoadInit = function () {
        $(function () {
            $(document.body).on("keyup", ":input", function (e) {
                if (e.which == 13)
                    $(this).trigger("enter");
            });
        });
    }
    onPageLoadInit();
    this.stopEnterKeySubmitting = function (e) {
        if (e.keyCode == 13) {
            var src = e.srcElement || e.target;
            if (src.tagName.toLowerCase() != "textarea") {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        }
    }

    this.exception = function (message) {
        throw message;
    }
    this.log = function (message) {
        logs.push(message);
    }
    this.getLogs = function () {
        return logs;
    }
    this.forceKendoProp = function (boundObj, propName, type) {
        if (!boundObj[propName]) {
            if ($.type(type) == "object") {
                boundObj.set(propName, new kendo.data.ObservableObject(type)); //need to use set functions on kendo observables to trigger change correctly
            } else if ($.type(type) == "array") {
                boundObj.set(propName, new kendo.data.ObservableArray(type)); //need to use set functions on kendo observables to trigger change correctly
            }
            app.lib.log(propName + " was added to viewModel dynamically from controls");
            boundObj[propName].bind("change", function (e) {
                if (typeof onVmChange != "undefined") {
                    onVmChange(e);
                }
            });
        }
    }
    this.addUrlParam = function (url, key, value) {
        key = encodeURI(key);
        value = encodeURI(value);
        var urlSplit = url.split('?');
        var cleanUrl = urlSplit[0];
        var newProp = key + "=" + value;
        if (urlSplit.length > 1) {
            return cleanUrl + "?" + newProp + "&" + urlSplit[1];
        } else {
            return cleanUrl + "?" + newProp;
        }
    }
    //TODO: cant we do this with underscore
    this.getArrayItemById = function (array, id) {
        var itm = false;
        $.each(array, function (i, item) {
            if (item.Id == id) {
                itm = item;
            }
        });
        return itm;
    }
    this.newGUID = function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
        };
        var guid = function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
        }
        return guid();
    }
    this.generateRandomString = function (length = 6) {
        return Math.random().toString(20).substr(2, length)
    }
    this.CleanPageFormViewModel = function (viewModel) {
        //This will going to fix bug 26395 where if grid is empty, the number validation won't work if first load is empty
        _.each(viewModel.PropertiesToClean, function (propItem) {
            var listItem = viewModel[propItem];
            for (var i in listItem) {
                if (!isNaN(i) && !_.isUndefined(listItem[i].t) && listItem[i].t == true) {
                    listItem.splice(i, 1);
                }
            }
        });
    }
    this.runOnPageLoad = {
        // func: string to be evaled.
        add: function (func) {
            document.cookie = "cireson_app_lib_runOnPageLoad=" + encodeURIComponent(func) + "; path=/";
        },
        run: function () {
            var func = (document.cookie.match('(^|; )cireson_app_lib_runOnPageLoad=([^;]*)') || 0)[2];
            if (func) {
                func = decodeURIComponent(func);
                setTimeout(function () {
                    eval(func);
                }, 300);
                document.cookie = "cireson_app_lib_runOnPageLoad=; path=/";
            }
        }
    }

    this.message = {
        add: function (text, type) {
            // type: warning, success, info, danger, null, undefined
            //document.cookie = "cireson_app_lib_message=" + JSON.stringify({ text: encodeURIComponent(text), type: encodeURIComponent(type) }) + "; path=/; HttpOnly";

            //lets use local storage in a smart way
            try {
                //localStorage.setItem("cireson_app_lib_message", JSON.stringify({ text: encodeURIComponent(text), type: encodeURIComponent(type) }));
                store.session.set("cireson_app_lib_message", JSON.stringify({ text: encodeURIComponent(text), type: encodeURIComponent(type) }));
                return;
            } catch (e) {
                return;
            }
        },
        show: function () {

            //var message = (document.cookie.match('(^|; )cireson_app_lib_message=([^;]*)') || 0)[2];

            try {
                //var message = localStorage.getItem("cireson_app_lib_message");
                var message = store.session.get("cireson_app_lib_message");

            } catch (e) {

            }

            if (message && message != "") {
                message = JSON.parse(message);
                message.text = decodeURIComponent(message.text);
                message.type = decodeURIComponent(message.type);
                // show message
                var container = $('#alertMessagesContainer');
                if (!container) {
                    kendo.ui.ExtAlertDialog.show({
                        title: localization.Warning,
                        message: message.text + "\n\n\n" + "message container is missing, #alertMessagesContainer"
                    });
                } else {
                    //remove any old ones
                    container.children('.alert').remove();

                    var box = $('<div>', { 'class': 'alert', html: message.text });
                    if (message.type) {
                        box.addClass("alert-" + message.type);
                    }
                    if (app.isMobile()) {
                        box.addClass("alert-mobile");
                    }
                    container.append(box);

                    //hide after some time
                    setTimeout(function () {
                        container.children('.alert').slideUp();
                    }, 20000);
                }
                //document.cookie = "cireson_app_lib_message=; path=/";

                try {
                    //var message = localStorage.removeItem("cireson_app_lib_message");
                    var message = store.session.remove("cireson_app_lib_message");

                } catch (e) {

                }

            }
        },
        hide: function () {
            var container = $('#alertMessagesContainer');

            if (!container) {
                kendo.ui.ExtAlertDialog.show({
                    title: localization.Warning,
                    message: message.text + "\n\n\n" + "message container is missing, #alertMessagesContainer"
                });
            } else {
                container.children('.alert').remove();
            }
        }
    }
    this.mask = { //an odject to handle custom assigned from tasks
        apply: function (label) {
            var div = $('<div>', { "class": "k-overlay form-overlay" });
            //add the html need for the laoding animation
            div.html('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
            div.append(label);

            div.appendTo('body');
        },
        whiteOut: function (label) {
            var div = $('<div>', { "class": "k-overlay form-overlay white-out" });
            //add the html need for the laoding animation
            div.html('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
            div.append(label);

            div.appendTo('body');
        },
        remove: function () {
            $('div.k-overlay.form-overlay').remove();
        }
    }
    this.extTemplate = {
        load: function (path) {
            var tmplLoader = $.get(path)
				.success(function (result) {
				    //Add templates to DOM
				    $("body").append(result);

				})
				.error(function (result) {
				    console.log("Error Loading Template: " + path);
				})

            tmplLoader.complete(function () {
                $(document).trigger("TEMPLATE_LOADED", [path]);
            });
        }
    }
    // returns cloned dom fragment with matching data-template
    this.getTemplate = function (name) {
        return $('[data-template="' + name + '"]').clone(true).removeAttr('data-template').show();
    }
    this.objectDiff = function (obj1, obj2) {
        return _.isEqual(obj1, obj2);
    }

    this.handleMessages = function () {
        app.lib.message.show();
    }

    this.getSafeProperty = function (fn, defaultVal) {
        //use try catch to avoid 'cannot read property of undefined' errors
        try {
            return fn();
        } catch (e) {
            return defaultVal;
        }
    }

    // used for pulling functions out of definition files. (http://stackoverflow.com/a/12380392)
    // since valid json cannot store a function, we store
    // them by name as a string.
    // returns the function or undefined.
    this.getFunctionFromString = function (string) {
        if (_.isUndefined(string)) {
            return null;
        }
        var scope = window;
        //remove () if it is there.
        if (string.indexOf('(') !== -1) {
            string = string.split('(')[0];
        }
        var scopeSplit = string.split('.');
        var i;
        for (i = 0; i < scopeSplit.length - 1; i++) {
            scope = scope[scopeSplit[i]];
            if (scope == undefined) {
                return null;
            }
        }
        return scope[scopeSplit[scopeSplit.length - 1]];
    }


    //used for page/form definition
    this.setColumnSizes = function (colList) {

        var numCols = 0;

        _.each(colList, function (col) {
            numCols += (col.ColSpan) ? col.ColSpan : 1;
        });

        _.each(colList, function (col) {
            //calcualte the bootstrap grid width
            //(12/(totalCols [3])) * colspan [1] = 4
            var colspan = (col.ColSpan) ? col.ColSpan : 1;
            col.ColSpan = colspan;
            col.ColSize = (12 / numCols) * colspan;
        });
    }
    //used for wrapping raw html strings in a jquery object
    this.getContainer = function (tplReturn) {
        return (typeof (tplReturn) === "string") ? $(tplReturn) : tplReturn;
    }

    this.showErrorMessage = function (message) {
        kendo.ui.ExtAlertDialog.show({
            title: localization.Warning,
            message: message
        });
    }

    this.getViewPanelDefinition = function (panelId, callback) {
        var node = _.findWhere(app.storage.viewPanels.session.get('all'), { Id: panelId });
        if (_.isUndefined(node)) {
            var name = panelId;
            if (panelId.indexOf(".js") == -1) {
                name = panelId + '.js';
            }
            //check for matching definition file in platform views
            $.ajax({
                type: 'GET',
                dataType: 'text',
                url: '/platform/views/viewPanels/' + name,
                async: false,
                success: function(template) {
                    var templateObj = $.parseJSON(template);
                    callback(templateObj);
                },
                error: function () {
                    //check for matching definition file in customspace
                    $.ajax({
                        type: 'GET',
                        dataType: 'text',
                        url: '/customspace/views/viewPanels/' + name,
                        async: false,
                        success: function (template) {
                            var templateObj = $.parseJSON(template);
                            callback(templateObj);
                        },
                        error: function () {
                            //final check here, for internal/old definition support
                            $.ajax({
                                type: 'GET',
                                dataType: 'text',
                                url: '/scripts/views/viewPanels/' + name,
                                async: false
                            }).done(function (template) {
                                var templateObj = $.parseJSON(template);
                                callback(templateObj);
                            });
                        }
                    });
                }
            });
        } else {
            callback(node);
        }
    };

    this.getNavNode = function (callback) {
        var nodeId = app.getNavNodeIdFromUrl();
        var nodes = app.storage.nodes.session.get('all');
        var matchedNode;

        //todo: abstract this..
        function findNode(node) {
            if (node.Id == nodeId) {
                matchedNode = node;
            }
            _.each(node.Children, function (child) {
                findNode(child);
            });
        };
        _.each(nodes, function (node) {
            findNode(node);
        });

        if (_.isUndefined(matchedNode)) {
            callback(null);
        } else {
            callback(matchedNode);
        }
    };

    this.getNavNodeDefinition = function (callback) {

        this.getNavNode(function (matchedNode) {

            if (_.isNull(matchedNode)) {
                var name = app.getNavNodeIdFromUrl();
                if (name.indexOf(".js") == -1) {
                    name = name + '.js';
                };
                
                //check if name matches file in platform views, load that
                $.ajax({
                    type: 'GET',
                    dataType: 'text',
                    url: '/platform/views/' + name,
                    async: false,
                    success: function (template) {
                        var templateObj = $.parseJSON(template);
                            callback(templateObj);
                    },
                    error: function () {
                        //check if name matches file in customspace, load that
                        $.ajax({
                            type: 'GET',
                            dataType: 'text',
                            url: '/customspace/views/' + name,
                            async: false,
                            success: function (template) {
                                var templateObj = $.parseJSON(template);
                                callback(templateObj);
                            },
                            error: function () {
                                //final check here, for internal/old definition support
                                $.ajax({
                                    type: 'GET',
                                    dataType: 'text',
                                    url: '/scripts/views/' + name,
                                    async: false,
                                    success: function (template) {
                                        var templateObj = $.parseJSON(template);
                                        callback(templateObj);
                                    }
                                });
                            }
                        });
                    }
                });

            } else {
                callback(matchedNode.Definition);
            }
        });
    };

    this.getIcons = function () {
        return [
            { "value": "", "class": "icon-upload fa fa-cloud-upload", "name": "upload custom icon..." },
            { "value": "fa fa-adjust", "class": "fa fa-adjust", "name": "adjust" },
            { "value": "fa fa-adn", "class": "fa fa-adn", "name": "adn" },
            { "value": "fa fa-align-center", "class": "fa fa-align-center", "name": "align-center" },
            { "value": "fa fa-align-justify", "class": "fa fa-align-justify", "name": "align-justify" },
            { "value": "fa fa-align-left", "class": "fa fa-align-left", "name": "align-left" },
            { "value": "fa fa-align-right", "class": "fa fa-align-right", "name": "align-right" },
            { "value": "fa fa-ambulance", "class": "fa fa-ambulance", "name": "ambulance" },
            { "value": "fa fa-anchor", "class": "fa fa-anchor", "name": "anchor" },
            { "value": "fa fa-angle-double-down", "class": "fa fa-angle-double-down", "name": "angle-double-down" },
            { "value": "fa fa-angle-double-left", "class": "fa fa-angle-double-left", "name": "angle-double-left" },
            { "value": "fa fa-angle-double-right", "class": "fa fa-angle-double-right", "name": "angle-double-right" },
            { "value": "fa fa-angle-double-up", "class": "fa fa-angle-double-up", "name": "angle-double-up" },
            { "value": "fa fa-angle-down", "class": "fa fa-angle-down", "name": "angle-down" },
            { "value": "fa fa-angle-left", "class": "fa fa-angle-left", "name": "angle-left" },
            { "value": "fa fa-angle-right", "class": "fa fa-angle-right", "name": "angle-right" },
            { "value": "fa fa-angle-up", "class": "fa fa-angle-up", "name": "angle-up" },
            { "value": "fa fa-archive", "class": "fa fa-archive", "name": "archive" },
            { "value": "fa fa-area-chart", "class": "fa fa-area-chart", "name": "area-chart" },
            { "value": "fa fa-arrow-circle-down", "class": "fa fa-arrow-circle-down", "name": "arrow-circle-down" },
            { "value": "fa fa-arrow-circle-left", "class": "fa fa-arrow-circle-left", "name": "arrow-circle-left" },
            { "value": "fa fa-arrow-circle-o-down", "class": "fa fa-arrow-circle-o-down", "name": "arrow-circle-o-down" },
            { "value": "fa fa-arrow-circle-o-left", "class": "fa fa-arrow-circle-o-left", "name": "arrow-circle-o-left" },
            { "value": "fa fa-arrow-circle-o-right", "class": "fa fa-arrow-circle-o-right", "name": "arrow-circle-o-right" },
            { "value": "fa fa-arrow-circle-o-up", "class": "fa fa-arrow-circle-o-up", "name": "arrow-circle-o-up" },
            { "value": "fa fa-arrow-circle-right", "class": "fa fa-arrow-circle-right", "name": "arrow-circle-right" },
            { "value": "fa fa-arrow-circle-up", "class": "fa fa-arrow-circle-up", "name": "arrow-circle-up" },
            { "value": "fa fa-arrow-down", "class": "fa fa-arrow-down", "name": "arrow-down" },
            { "value": "fa fa-arrow-left", "class": "fa fa-arrow-left", "name": "arrow-left" },
            { "value": "fa fa-arrow-right", "class": "fa fa-arrow-right", "name": "arrow-right" },
            { "value": "fa fa-arrow-up", "class": "fa fa-arrow-up", "name": "arrow-up" },
            { "value": "fa fa-arrows", "class": "fa fa-arrows", "name": "arrows" },
            { "value": "fa fa-arrows-alt", "class": "fa fa-arrows-alt", "name": "arrows-alt" },
            { "value": "fa fa-arrows-h", "class": "fa fa-arrows-h", "name": "arrows-h" },
            { "value": "fa fa-arrows-v", "class": "fa fa-arrows-v", "name": "arrows-v" },
            { "value": "ci ci-asset-management", "class": "ci ci-asset-management", "name": "asset-management" },
            { "value": "fa fa-asterisk", "class": "fa fa-asterisk", "name": "asterisk" },
            { "value": "fa fa-at", "class": "fa fa-at", "name": "at" },
            { "value": "fa fa-backward", "class": "fa fa-backward", "name": "backward" },
            { "value": "fa fa-ban", "class": "fa fa-ban", "name": "ban" },
            { "value": "fa fa-bar-chart-o", "class": "fa fa-bar-chart-o", "name": "bar-chart-o" },
            { "value": "fa fa-barcode", "class": "fa fa-barcode", "name": "barcode" },
            { "value": "fa fa-beer", "class": "fa fa-beer", "name": "beer" },
            { "value": "fa fa-bell", "class": "fa fa-bell", "name": "bell" },
            { "value": "fa fa-bell-o", "class": "fa fa-bell-o", "name": "bell-o" },
            { "value": "fa fa-bell-slash", "class": "fa fa-bell-slash", "name": "bell-slash" },
            { "value": "fa fa-bell-slash-o", "class": "fa fa-bell-slash-o", "name": "bell-slash-o" },
            { "value": "fa fa-bicycle", "class": "fa fa-bicycle", "name": "bicycle" },
            { "value": "fa fa-binoculars", "class": "fa fa-binoculars", "name": "binoculars" },
            { "value": "fa fa-birthday-cake", "class": "fa fa-birthday-cake", "name": "birthday-cake" },
            { "value": "fa fa-bitcoin", "class": "fa fa-bitcoin", "name": "bitcoin" },
            { "value": "fa fa-bold", "class": "fa fa-bold", "name": "bold" },
            { "value": "fa fa-bolt", "class": "fa fa-bolt", "name": "bolt" },
            { "value": "fa fa-bomb", "class": "fa fa-bomb", "name": "bomb" },
            { "value": "fa fa-book", "class": "fa fa-book", "name": "book" },
            { "value": "fa fa-bookmark", "class": "fa fa-bookmark", "name": "bookmark" },
            { "value": "fa fa-bookmark-o", "class": "fa fa-bookmark-o", "name": "bookmark-o" },
            { "value": "fa fa-briefcase", "class": "fa fa-briefcase", "name": "briefcase" },
            { "value": "fa fa-bug", "class": "fa fa-bug", "name": "bug" },
            { "value": "fa fa-building", "class": "fa fa-building", "name": "building" },
            { "value": "fa fa-building-o", "class": "fa fa-building-o", "name": "building-o" },
            { "value": "fa fa-bullhorn", "class": "fa fa-bullhorn", "name": "bullhorn" },
            { "value": "fa fa-bullseye", "class": "fa fa-bullseye", "name": "bullseye" },
            { "value": "fa fa-bus", "class": "fa fa-bus", "name": "bus" },
            { "value": "fa fa-cab", "class": "fa fa-cab", "name": "cab" },
            { "value": "fa fa-calculator", "class": "fa fa-calculator", "name": "calculator" },
            { "value": "fa fa-calendar", "class": "fa fa-calendar", "name": "calendar" },
            { "value": "fa fa-calendar-o", "class": "fa fa-calendar-o", "name": "calendar-o" },
            { "value": "fa fa-camera", "class": "fa fa-camera", "name": "camera" },
            { "value": "fa fa-camera-retro", "class": "fa fa-camera-retro", "name": "camera-retro" },
            { "value": "fa fa-car", "class": "fa fa-car", "name": "car" },
            { "value": "fa fa-caret-down", "class": "fa fa-caret-down", "name": "caret-down" },
            { "value": "fa fa-caret-left", "class": "fa fa-caret-left", "name": "caret-left" },
            { "value": "fa fa-caret-right", "class": "fa fa-caret-right", "name": "caret-right" },
            { "value": "fa fa-caret-up", "class": "fa fa-caret-up", "name": "caret-up" },
            { "value": "fa fa-cc", "class": "fa fa-cc", "name": "cc" },
            { "value": "fa fa-certificate", "class": "fa fa-certificate", "name": "certificate" },
            { "value": "fa fa-chain-broken", "class": "fa fa-chain-broken", "name": "chain-broken" },
            { "value": "fa fa-check", "class": "fa fa-check", "name": "check" },
            { "value": "fa fa-check-circle", "class": "fa fa-check-circle", "name": "check-circle" },
            { "value": "fa fa-check-circle-o", "class": "fa fa-check-circle-o", "name": "check-circle-o" },
            { "value": "fa fa-check-square", "class": "fa fa-check-square", "name": "check-square" },
            { "value": "fa fa-check-square-o", "class": "fa fa-check-square-o", "name": "check-square-o" },
            { "value": "fa fa-chevron-circle-down", "class": "fa fa-chevron-circle-down", "name": "chevron-circle-down" },
            { "value": "fa fa-chevron-circle-left", "class": "fa fa-chevron-circle-left", "name": "chevron-circle-left" },
            { "value": "fa fa-chevron-circle-right", "class": "fa fa-chevron-circle-right", "name": "chevron-circle-right" },
            { "value": "fa fa-chevron-circle-up", "class": "fa fa-chevron-circle-up", "name": "chevron-circle-up" },
            { "value": "fa fa-chevron-down", "class": "fa fa-chevron-down", "name": "chevron-down" },
            { "value": "fa fa-chevron-left", "class": "fa fa-chevron-left", "name": "chevron-left" },
            { "value": "fa fa-chevron-right", "class": "fa fa-chevron-right", "name": "chevron-right" },
            { "value": "fa fa-chevron-up", "class": "fa fa-chevron-up", "name": "chevron-up" },
            { "value": "fa fa-child", "class": "fa fa-child", "name": "child" },
            { "value": "fa fa-circle", "class": "fa fa-circle", "name": "circle" },
            { "value": "fa fa-circle-o", "class": "fa fa-circle-o", "name": "circle-o" },
            { "value": "fa fa-circle-o-notch", "class": "fa fa-circle-o-notch", "name": "circle-o-notch" },
            { "value": "fa fa-circle-thin", "class": "fa fa-circle-thin", "name": "circle-thin" },
            { "value": "fa fa-clipboard", "class": "fa fa-clipboard", "name": "clipboard" },
            { "value": "fa fa-clock-o", "class": "fa fa-clock-o", "name": "clock-o" },
            { "value": "fa fa-cloud", "class": "fa fa-cloud", "name": "cloud" },
            { "value": "fa fa-cloud-download", "class": "fa fa-cloud-download", "name": "cloud-download" },
            { "value": "fa fa-cloud-upload", "class": "fa fa-cloud-upload", "name": "cloud-upload" },
            { "value": "fa fa-code", "class": "fa fa-code", "name": "code" },
            { "value": "fa fa-code-fork", "class": "fa fa-code-fork", "name": "code-fork" },
            { "value": "fa fa-coffee", "class": "fa fa-coffee", "name": "coffee" },
            { "value": "fa fa-cog", "class": "fa fa-cog", "name": "cog" },
            { "value": "fa fa-cogs", "class": "fa fa-cogs", "name": "cogs" },
            { "value": "fa fa-columns", "class": "fa fa-columns", "name": "columns" },
            { "value": "fa fa-comment", "class": "fa fa-comment", "name": "comment" },
            { "value": "fa fa-comment-o", "class": "fa fa-comment-o", "name": "comment-o" },
            { "value": "fa fa-comments", "class": "fa fa-comments", "name": "comments" },
            { "value": "fa fa-comments-o", "class": "fa fa-comments-o", "name": "comments-o" },
            { "value": "fa fa-compass", "class": "fa fa-compass", "name": "compass" },
            { "value": "fa fa-compress", "class": "fa fa-compress", "name": "compress" },
            { "value": "fa fa-copyright", "class": "fa fa-copyright", "name": "copyright" },
            { "value": "fa fa-credit-card", "class": "fa fa-credit-card", "name": "credit-card" },
            { "value": "fa fa-crop", "class": "fa fa-crop", "name": "crop" },
            { "value": "fa fa-crosshairs", "class": "fa fa-crosshairs", "name": "crosshairs" },
            { "value": "fa fa-css3", "class": "fa fa-css3", "name": "css3" },
            { "value": "fa fa-cube", "class": "fa fa-cube", "name": "cube" },
            { "value": "fa fa-cubes", "class": "fa fa-cubes", "name": "cubes" },
            { "value": "fa fa-cutlery", "class": "fa fa-cutlery", "name": "cutlery" },
            { "value": "fa fa-database", "class": "fa fa-database", "name": "database" },
            { "value": "fa fa-dedent", "class": "fa fa-dedent", "name": "dedent" },
            { "value": "fa fa-desktop", "class": "fa fa-desktop", "name": "desktop" },
            { "value": "fa fa-dollar", "class": "fa fa-dollar", "name": "dollar" },
            { "value": "fa fa-dot-circle-o", "class": "fa fa-dot-circle-o", "name": "dot-circle-o" },
            { "value": "fa fa-download", "class": "fa fa-download", "name": "download" },
            { "value": "fa fa-edit", "class": "fa fa-edit", "name": "edit" },
            { "value": "fa fa-eject", "class": "fa fa-eject", "name": "eject" },
            { "value": "fa fa-ellipsis-h", "class": "fa fa-ellipsis-h", "name": "ellipsis-h" },
            { "value": "fa fa-ellipsis-v", "class": "fa fa-ellipsis-v", "name": "ellipsis-v" },
            { "value": "fa fa-envelope", "class": "fa fa-envelope", "name": "envelope" },
            { "value": "fa fa-envelope-o", "class": "fa fa-envelope-o", "name": "envelope-o" },
            { "value": "fa fa-envelope-square", "class": "fa fa-envelope-square", "name": "envelope-square" },
            { "value": "fa fa-eraser", "class": "fa fa-eraser", "name": "eraser" },
            { "value": "fa fa-euro", "class": "fa fa-euro", "name": "euro" },
            { "value": "fa fa-exchange", "class": "fa fa-exchange", "name": "exchange" },
            { "value": "fa fa-exclamation", "class": "fa fa-exclamation", "name": "exclamation" },
            { "value": "fa fa-exclamation-circle", "class": "fa fa-exclamation-circle", "name": "exclamation-circle" },
            { "value": "fa fa-expand", "class": "fa fa-expand", "name": "expand" },
            { "value": "fa fa-external-link", "class": "fa fa-external-link", "name": "external-link" },
            { "value": "fa fa-external-link-square", "class": "fa fa-external-link-square", "name": "external-link-square" },
            { "value": "fa fa-eye", "class": "fa fa-eye", "name": "eye" },
            { "value": "fa fa-eye-slash", "class": "fa fa-eye-slash", "name": "eye-slash" },
            { "value": "fa fa-eyedropper", "class": "fa fa-eyedropper", "name": "eyedropper" },
            { "value": "fa fa-fast-backward", "class": "fa fa-fast-backward", "name": "fast-backward" },
            { "value": "fa fa-fast-forward", "class": "fa fa-fast-forward", "name": "fast-forward" },
            { "value": "fa fa-fax", "class": "fa fa-fax", "name": "fax" },
            { "value": "fa fa-female", "class": "fa fa-female", "name": "female" },
            { "value": "fa fa-fighter-jet", "class": "fa fa-fighter-jet", "name": "fighter-jet" },
            { "value": "fa fa-file", "class": "fa fa-file", "name": "file" },
            { "value": "fa fa-file-archive-o", "class": "fa fa-file-archive-o", "name": "file-archive-o" },
            { "value": "fa fa-file-audio-o", "class": "fa fa-file-audio-o", "name": "file-audio-o" },
            { "value": "fa fa-file-code-o", "class": "fa fa-file-code-o", "name": "file-code-o" },
            { "value": "fa fa-file-excel-o", "class": "fa fa-file-excel-o", "name": "file-excel-o" },
            { "value": "fa fa-file-image-o", "class": "fa fa-file-image-o", "name": "file-image-o" },
            { "value": "fa fa-file-movie-o", "class": "fa fa-file-movie-o", "name": "file-movie-o" },
            { "value": "fa fa-file-o", "class": "fa fa-file-o", "name": "file-o" },
            { "value": "fa fa-file-pdf-o", "class": "fa fa-file-pdf-o", "name": "file-pdf-o" },
            { "value": "fa fa-file-powerpoint-o", "class": "fa fa-file-powerpoint-o", "name": "file-powerpoint-o" },
            { "value": "fa fa-file-text", "class": "fa fa-file-text", "name": "file-text" },
            { "value": "fa fa-file-text-o", "class": "fa fa-file-text-o", "name": "file-text-o" },
            { "value": "fa fa-file-video-o", "class": "fa fa-file-video-o", "name": "file-video-o" },
            { "value": "fa fa-file-word-o", "class": "fa fa-file-word-o", "name": "file-word-o" },
            { "value": "fa fa-files-o", "class": "fa fa-files-o", "name": "files-o" },
            { "value": "fa fa-film", "class": "fa fa-film", "name": "film" },
            { "value": "fa fa-filter", "class": "fa fa-filter", "name": "filter" },
            { "value": "fa fa-fire", "class": "fa fa-fire", "name": "fire" },
            { "value": "fa fa-fire-extinguisher", "class": "fa fa-fire-extinguisher", "name": "fire-extinguisher" },
            { "value": "fa fa-flag", "class": "fa fa-flag", "name": "flag" },
            { "value": "fa fa-flag-checkered", "class": "fa fa-flag-checkered", "name": "flag-checkered" },
            { "value": "fa fa-flag-o", "class": "fa fa-flag-o", "name": "flag-o" },
            { "value": "fa fa-flask", "class": "fa fa-flask", "name": "flask" },
            { "value": "fa fa-floppy-o", "class": "fa fa-floppy-o", "name": "floppy-o" },
            { "value": "fa fa-folder", "class": "fa fa-folder", "name": "folder" },
            { "value": "fa fa-folder-o", "class": "fa fa-folder-o", "name": "folder-o" },
            { "value": "fa fa-folder-open", "class": "fa fa-folder-open", "name": "folder-open" },
            { "value": "fa fa-folder-open-o", "class": "fa fa-folder-open-o", "name": "folder-open-o" },
            { "value": "fa fa-font", "class": "fa fa-font", "name": "font" },
            { "value": "fa fa-forward", "class": "fa fa-forward", "name": "forward" },
            { "value": "fa fa-frown-o", "class": "fa fa-frown-o", "name": "frown-o" },
            { "value": "fa fa-futbol-o", "class": "fa fa-futbol-o", "name": "futbol-o" },
            { "value": "fa fa-gamepad", "class": "fa fa-gamepad", "name": "gamepad" },
            { "value": "fa fa-gavel", "class": "fa fa-gavel", "name": "gavel" },
            { "value": "fa fa-gbp", "class": "fa fa-gbp", "name": "gbp" },
            { "value": "fa fa-gift", "class": "fa fa-gift", "name": "gift" },
            { "value": "fa fa-glass", "class": "fa fa-glass", "name": "glass" },
            { "value": "fa fa-globe", "class": "fa fa-globe", "name": "globe" },
            { "value": "fa fa-graduation-cap", "class": "fa fa-graduation-cap", "name": "graduation-cap" },
            { "value": "fa fa-group", "class": "fa fa-group", "name": "group" },
            { "value": "fa fa-h-square", "class": "fa fa-h-square", "name": "h-square" },
            { "value": "fa fa-hand-o-down", "class": "fa fa-hand-o-down", "name": "hand-o-down" },
            { "value": "fa fa-hand-o-left", "class": "fa fa-hand-o-left", "name": "hand-o-left" },
            { "value": "fa fa-hand-o-right", "class": "fa fa-hand-o-right", "name": "hand-o-right" },
            { "value": "fa fa-hand-o-up", "class": "fa fa-hand-o-up", "name": "hand-o-up" },
            { "value": "fa fa-hdd-o", "class": "fa fa-hdd-o", "name": "hdd-o" },
            { "value": "fa fa-header", "class": "fa fa-header", "name": "header" },
            { "value": "fa fa-headphones", "class": "fa fa-headphones", "name": "headphones" },
            { "value": "fa fa-heart", "class": "fa fa-heart", "name": "heart" },
            { "value": "fa fa-heart-o", "class": "fa fa-heart-o", "name": "heart-o" },
            { "value": "fa fa-history", "class": "fa fa-history", "name": "history" },
            { "value": "fa fa-home", "class": "fa fa-home", "name": "home" },
            { "value": "fa fa-hospital-o", "class": "fa fa-hospital-o", "name": "hospital-o" },
            { "value": "fa fa-html5", "class": "fa fa-html5", "name": "html5" },
            { "value": "fa fa-image", "class": "fa fa-image", "name": "image" },
            { "value": "fa fa-inbox", "class": "fa fa-inbox", "name": "inbox" },
            { "value": "fa fa-indent", "class": "fa fa-indent", "name": "indent" },
            { "value": "fa fa-info", "class": "fa fa-info", "name": "info" },
            { "value": "fa fa-info-circle", "class": "fa fa-info-circle", "name": "info-circle" },
            { "value": "fa fa-institution", "class": "fa fa-institution", "name": "institution" },
            { "value": "fa fa-italic", "class": "fa fa-italic", "name": "italic" },
            { "value": "fa fa-key", "class": "fa fa-key", "name": "key" },
            { "value": "fa fa-keyboard-o", "class": "fa fa-keyboard-o", "name": "keyboard-o" },
            { "value": "fa fa-language", "class": "fa fa-language", "name": "language" },
            { "value": "fa fa-laptop", "class": "fa fa-laptop", "name": "laptop" },
            { "value": "fa fa-leaf", "class": "fa fa-leaf", "name": "leaf" },
            { "value": "fa fa-lemon-o", "class": "fa fa-lemon-o", "name": "lemon-o" },
            { "value": "fa fa-level-down", "class": "fa fa-level-down", "name": "level-down" },
            { "value": "fa fa-level-up", "class": "fa fa-level-up", "name": "level-up" },
            { "value": "fa fa-life-saver", "class": "fa fa-life-saver", "name": "life-saver" },
            { "value": "fa fa-lightbulb-o", "class": "fa fa-lightbulb-o", "name": "lightbulb-o" },
            { "value": "fa fa-line-chart", "class": "fa fa-line-chart", "name": "line-chart" },
            { "value": "fa fa-link", "class": "fa fa-link", "name": "link" },
            { "value": "fa fa-linux", "class": "fa fa-linux", "name": "linux" },
            { "value": "fa fa-list", "class": "fa fa-list", "name": "list" },
            { "value": "fa fa-list-alt", "class": "fa fa-list-alt", "name": "list-alt" },
            { "value": "fa fa-list-ol", "class": "fa fa-list-ol", "name": "list-ol" },
            { "value": "fa fa-list-ul", "class": "fa fa-list-ul", "name": "list-ul" },
            { "value": "fa fa-location-arrow", "class": "fa fa-location-arrow", "name": "location-arrow" },
            { "value": "fa fa-lock", "class": "fa fa-lock", "name": "lock" },
            { "value": "fa fa-long-arrow-down", "class": "fa fa-long-arrow-down", "name": "long-arrow-down" },
            { "value": "fa fa-long-arrow-left", "class": "fa fa-long-arrow-left", "name": "long-arrow-left" },
            { "value": "fa fa-long-arrow-right", "class": "fa fa-long-arrow-right", "name": "long-arrow-right" },
            { "value": "fa fa-long-arrow-up", "class": "fa fa-long-arrow-up", "name": "long-arrow-up" },
            { "value": "fa fa-magic", "class": "fa fa-magic", "name": "magic" },
            { "value": "fa fa-magnet", "class": "fa fa-magnet", "name": "magnet" },
            { "value": "fa fa-mail-forward", "class": "fa fa-mail-forward", "name": "mail-forward" },
            { "value": "fa fa-male", "class": "fa fa-male", "name": "male" },
            { "value": "fa fa-map-marker", "class": "fa fa-map-marker", "name": "map-marker" },
            { "value": "fa fa-medkit", "class": "fa fa-medkit", "name": "medkit" },
            { "value": "fa fa-meh-o", "class": "fa fa-meh-o", "name": "meh-o" },
            { "value": "fa fa-microphone", "class": "fa fa-microphone", "name": "microphone" },
            { "value": "fa fa-microphone-slash", "class": "fa fa-microphone-slash", "name": "microphone-slash" },
            { "value": "fa fa-minus", "class": "fa fa-minus", "name": "minus" },
            { "value": "fa fa-minus-circle", "class": "fa fa-minus-circle", "name": "minus-circle" },
            { "value": "fa fa-minus-square", "class": "fa fa-minus-square", "name": "minus-square" },
            { "value": "fa fa-minus-square-o", "class": "fa fa-minus-square-o", "name": "minus-square-o" },
            { "value": "fa fa-mobile", "class": "fa fa-mobile", "name": "mobile" },
            { "value": "fa fa-money", "class": "fa fa-money", "name": "money" },
            { "value": "fa fa-moon-o", "class": "fa fa-moon-o", "name": "moon-o" },
            { "value": "fa fa-music", "class": "fa fa-music", "name": "music" },
            { "value": "fa fa-newspaper-o", "class": "fa fa-newspaper-o", "name": "newspaper-o" },
            { "value": "fa fa-outdent", "class": "fa fa-outdent", "name": "outdent" },
            { "value": "fa fa-paint-brush", "class": "fa fa-paint-brush", "name": "paint-brush" },
            { "value": "fa fa-paper-plane", "class": "fa fa-paper-plane", "name": "paper-plane" },
            { "value": "fa fa-paper-plane-o", "class": "fa fa-paper-plane-o", "name": "paper-plane-o" },
            { "value": "fa fa-paperclip", "class": "fa fa-paperclip", "name": "paperclip" },
            { "value": "fa fa-paragraph", "class": "fa fa-paragraph", "name": "paragraph" },
            { "value": "fa fa-pause", "class": "fa fa-pause", "name": "pause" },
            { "value": "fa fa-paw", "class": "fa fa-paw", "name": "paw" },
            { "value": "fa fa-pencil", "class": "fa fa-pencil", "name": "pencil" },
            { "value": "fa fa-pencil-square", "class": "fa fa-pencil-square", "name": "pencil-square" },
            { "value": "fa fa-phone", "class": "fa fa-phone", "name": "phone" },
            { "value": "fa fa-phone-square", "class": "fa fa-phone-square", "name": "phone-square" },
            { "value": "fa fa-pie-chart", "class": "fa fa-pie-chart", "name": "pie-chart" },
            { "value": "fa fa-plane", "class": "fa fa-plane", "name": "plane" },
            { "value": "fa fa-play", "class": "fa fa-play", "name": "play" },
            { "value": "fa fa-play-circle", "class": "fa fa-play-circle", "name": "play-circle" },
            { "value": "fa fa-play-circle-o", "class": "fa fa-play-circle-o", "name": "play-circle-o" },
            { "value": "fa fa-plug", "class": "fa fa-plug", "name": "plug" },
            { "value": "fa fa-plus", "class": "fa fa-plus", "name": "plus" },
            { "value": "fa fa-plus-circle", "class": "fa fa-plus-circle", "name": "plus-circle" },
            { "value": "fa fa-plus-square", "class": "fa fa-plus-square", "name": "plus-square" },
            { "value": "fa fa-plus-square-o", "class": "fa fa-plus-square-o", "name": "plus-square-o" },
            { "value": "fa fa-power-off", "class": "fa fa-power-off", "name": "power-off" },
            { "value": "fa fa-print", "class": "fa fa-print", "name": "print" },
            { "value": "fa fa-puzzle-piece", "class": "fa fa-puzzle-piece", "name": "puzzle-piece" },
            { "value": "fa fa-qrcode", "class": "fa fa-qrcode", "name": "qrcode" },
            { "value": "fa fa-question", "class": "fa fa-question", "name": "question" },
            { "value": "fa fa-question-circle", "class": "fa fa-question-circle", "name": "question-circle" },
            { "value": "fa fa-quote-left", "class": "fa fa-quote-left", "name": "quote-left" },
            { "value": "fa fa-quote-right", "class": "fa fa-quote-right", "name": "quote-right" },
            { "value": "fa fa-random", "class": "fa fa-random", "name": "random" },
            { "value": "fa fa-recycle", "class": "fa fa-recycle", "name": "recycle" },
            { "value": "fa fa-refresh", "class": "fa fa-refresh", "name": "refresh" },
            { "value": "fa fa-repeat", "class": "fa fa-repeat", "name": "repeat" },
            { "value": "fa fa-reply", "class": "fa fa-reply", "name": "reply" },
            { "value": "fa fa-reply-all", "class": "fa fa-reply-all", "name": "reply-all" },
            { "value": "fa fa-retweet", "class": "fa fa-retweet", "name": "retweet" },
            { "value": "fa fa-road", "class": "fa fa-road", "name": "road" },
            { "value": "fa fa-rocket", "class": "fa fa-rocket", "name": "rocket" },
            { "value": "fa fa-rss", "class": "fa fa-rss", "name": "rss" },
            { "value": "fa fa-rss-square", "class": "fa fa-rss-square", "name": "rss-square" },
            { "value": "fa fa-ruble", "class": "fa fa-ruble", "name": "ruble" },
            { "value": "fa fa-rupee", "class": "fa fa-rupee", "name": "rupee" },
            { "value": "fa fa-scissors", "class": "fa fa-scissors", "name": "scissors" },
            { "value": "fa fa-search", "class": "fa fa-search", "name": "search" },
            { "value": "fa fa-search-minus", "class": "fa fa-search-minus", "name": "search-minus" },
            { "value": "fa fa-search-plus", "class": "fa fa-search-plus", "name": "search-plus" },
            { "value": "fa fa-share", "class": "fa fa-share", "name": "share" },
            { "value": "fa fa-share-alt", "class": "fa fa-share-alt", "name": "share-alt" },
            { "value": "fa fa-share-alt-square", "class": "fa fa-share-alt-square", "name": "share-alt-square" },
            { "value": "fa fa-share-square", "class": "fa fa-share-square", "name": "share-square" },
            { "value": "fa fa-share-square-o", "class": "fa fa-share-square-o", "name": "share-square-o" },
            { "value": "fa fa-shield", "class": "fa fa-shield", "name": "shield" },
            { "value": "fa fa-shopping-cart", "class": "fa fa-shopping-cart", "name": "shopping-cart" },
            { "value": "fa fa-sign-in", "class": "fa fa-sign-in", "name": "sign-in" },
            { "value": "fa fa-sign-out", "class": "fa fa-sign-out", "name": "sign-out" },
            { "value": "fa fa-signal", "class": "fa fa-signal", "name": "signal" },
            { "value": "fa fa-sitemap", "class": "fa fa-sitemap", "name": "sitemap" },
            { "value": "fa fa-sliders", "class": "fa fa-sliders", "name": "sliders" },
            { "value": "fa fa-smile-o", "class": "fa fa-smile-o", "name": "smile-o" },
            { "value": "fa fa-sort", "class": "fa fa-sort", "name": "sort" },
            { "value": "fa fa-sort-alpha-asc", "class": "fa fa-sort-alpha-asc", "name": "sort-alpha-asc" },
            { "value": "fa fa-sort-alpha-desc", "class": "fa fa-sort-alpha-desc", "name": "sort-alpha-desc" },
            { "value": "fa fa-sort-amount-asc", "class": "fa fa-sort-amount-asc", "name": "sort-amount-asc" },
            { "value": "fa fa-sort-amount-desc", "class": "fa fa-sort-amount-desc", "name": "sort-amount-desc" },
            { "value": "fa fa-sort-down", "class": "fa fa-sort-down", "name": "sort-down" },
            { "value": "fa fa-sort-numeric-asc", "class": "fa fa-sort-numeric-asc", "name": "sort-numeric-asc" },
            { "value": "fa fa-sort-numeric-desc", "class": "fa fa-sort-numeric-desc", "name": "sort-numeric-desc" },
            { "value": "fa fa-sort-up", "class": "fa fa-sort-up", "name": "sort-up" },
            { "value": "fa fa-space-shuttle", "class": "fa fa-space-shuttle", "name": "space-shuttle" },
            { "value": "fa fa-spinner", "class": "fa fa-spinner", "name": "spinner" },
            { "value": "fa fa-spoon", "class": "fa fa-spoon", "name": "spoon" },
            { "value": "fa fa-square", "class": "fa fa-square", "name": "square" },
            { "value": "fa fa-square-o", "class": "fa fa-square-o", "name": "square-o" },
            { "value": "fa fa-star", "class": "fa fa-star", "name": "star" },
            { "value": "fa fa-star-half", "class": "fa fa-star-half", "name": "star-half" },
            { "value": "fa fa-star-half-o", "class": "fa fa-star-half-o", "name": "star-half-o" },
            { "value": "fa fa-star-o", "class": "fa fa-star-o", "name": "star-o" },
            { "value": "fa fa-steam", "class": "fa fa-steam", "name": "steam" },
            { "value": "fa fa-steam-square", "class": "fa fa-steam-square", "name": "steam-square" },
            { "value": "fa fa-step-backward", "class": "fa fa-step-backward", "name": "step-backward" },
            { "value": "fa fa-step-forward", "class": "fa fa-step-forward", "name": "step-forward" },
            { "value": "fa fa-stethoscope", "class": "fa fa-stethoscope", "name": "stethoscope" },
            { "value": "fa fa-stop", "class": "fa fa-stop", "name": "stop" },
            { "value": "fa fa-strikethrough", "class": "fa fa-strikethrough", "name": "strikethrough" },
            { "value": "fa fa-subscript", "class": "fa fa-subscript", "name": "subscript" },
            { "value": "fa fa-suitcase", "class": "fa fa-suitcase", "name": "suitcase" },
            { "value": "fa fa-sun-o", "class": "fa fa-sun-o", "name": "sun-o" },
            { "value": "fa fa-superscript", "class": "fa fa-superscript", "name": "superscript" },
            { "value": "fa fa-table", "class": "fa fa-table", "name": "table" },
            { "value": "fa fa-tablet", "class": "fa fa-tablet", "name": "tablet" },
            { "value": "fa fa-tachometer", "class": "fa fa-tachometer", "name": "tachometer" },
            { "value": "fa fa-tag", "class": "fa fa-tag", "name": "tag" },
            { "value": "fa fa-tags", "class": "fa fa-tags", "name": "tags" },
            { "value": "fa fa-tasks", "class": "fa fa-tasks", "name": "tasks" },
            { "value": "fa fa-terminal", "class": "fa fa-terminal", "name": "terminal" },
            { "value": "fa fa-text-height", "class": "fa fa-text-height", "name": "text-height" },
            { "value": "fa fa-text-width", "class": "fa fa-text-width", "name": "text-width" },
            { "value": "fa fa-th", "class": "fa fa-th", "name": "th" },
            { "value": "fa fa-th-large", "class": "fa fa-th-large", "name": "th-large" },
            { "value": "fa fa-th-list", "class": "fa fa-th-list", "name": "th-list" },
            { "value": "fa fa-thumb-tack", "class": "fa fa-thumb-tack", "name": "thumb-tack" },
            { "value": "fa fa-thumbs-down", "class": "fa fa-thumbs-down", "name": "thumbs-down" },
            { "value": "fa fa-thumbs-o-down", "class": "fa fa-thumbs-o-down", "name": "thumbs-o-down" },
            { "value": "fa fa-thumbs-o-up", "class": "fa fa-thumbs-o-up", "name": "thumbs-o-up" },
            { "value": "fa fa-thumbs-up", "class": "fa fa-thumbs-up", "name": "thumbs-up" },
            { "value": "fa fa-ticket", "class": "fa fa-ticket", "name": "ticket" },
            { "value": "fa fa-times", "class": "fa fa-times", "name": "times" },
            { "value": "fa fa-times-circle", "class": "fa fa-times-circle", "name": "times-circle" },
            { "value": "fa fa-times-circle-o", "class": "fa fa-times-circle-o", "name": "times-circle-o" },
            { "value": "fa fa-tint", "class": "fa fa-tint", "name": "tint" },
            { "value": "fa fa-toggle-down", "class": "fa fa-toggle-down", "name": "toggle-down" },
            { "value": "fa fa-toggle-left", "class": "fa fa-toggle-left", "name": "toggle-left" },
            { "value": "fa fa-toggle-off", "class": "fa fa-toggle-off", "name": "toggle-off" },
            { "value": "fa fa-toggle-on", "class": "fa fa-toggle-on", "name": "toggle-on" },
            { "value": "fa fa-toggle-right", "class": "fa fa-toggle-right", "name": "toggle-right" },
            { "value": "fa fa-toggle-up", "class": "fa fa-toggle-up", "name": "toggle-up" },
            { "value": "fa fa-trash", "class": "fa fa-trash", "name": "trash" },
            { "value": "fa fa-trash-o", "class": "fa fa-trash-o", "name": "trash-o" },
            { "value": "fa fa-tree", "class": "fa fa-tree", "name": "tree" },
            { "value": "fa fa-trophy", "class": "fa fa-trophy", "name": "trophy" },
            { "value": "fa fa-truck", "class": "fa fa-truck", "name": "truck" },
            { "value": "fa fa-tty", "class": "fa fa-tty", "name": "tty" },
            { "value": "fa fa-turkish-lira", "class": "fa fa-turkish-lira", "name": "turkish-lira" },
            { "value": "fa fa-umbrella", "class": "fa fa-umbrella", "name": "umbrella" },
            { "value": "fa fa-underline", "class": "fa fa-underline", "name": "underline" },
            { "value": "fa fa-unlock", "class": "fa fa-unlock", "name": "unlock" },
            { "value": "fa fa-unlock-alt", "class": "fa fa-unlock-alt", "name": "unlock-alt" },
            { "value": "fa fa-upload", "class": "fa fa-upload", "name": "upload" },
            { "value": "fa fa-user", "class": "fa fa-user", "name": "user" },
            { "value": "fa fa-user-md", "class": "fa fa-user-md", "name": "user-md" },
            { "value": "fa fa-users", "class": "fa fa-users", "name": "users" },
            { "value": "fa fa-video-camera", "class": "fa fa-video-camera", "name": "video-camera" },
            { "value": "fa fa-volume-down", "class": "fa fa-volume-down", "name": "volume-down" },
            { "value": "fa fa-volume-off", "class": "fa fa-volume-off", "name": "volume-off" },
            { "value": "fa fa-volume-up", "class": "fa fa-volume-up", "name": "volume-up" },
            { "value": "fa fa-warning", "class": "fa fa-warning", "name": "warning" },
            { "value": "fa fa-wheelchair", "class": "fa fa-wheelchair", "name": "wheelchair" },
            { "value": "fa fa-wifi", "class": "fa fa-wifi", "name": "wifi" },
            { "value": "fa fa-won", "class": "fa fa-won", "name": "won" },
            { "value": "fa fa-wrench", "class": "fa fa-wrench", "name": "wrench" },
            { "value": "fa fa-yen", "class": "fa fa-yen", "name": "yen" }
        ];
    }

    //returns object only if it is valid json
    this.tryParseJSON = function (jsonString) {
        if (_.isObject(jsonString)) {
            return jsonString;
        }

        try {
            var jsonObject = $.parseJSON(jsonString);

            //note: $.parseJSON(null) and $.parseJSON(1234) will not throw errors AND null is an object
            //      make sure we filter those out
            if (_.isObject(jsonObject) && !_.isNull(jsonObject)) {
                return jsonObject;
            }
        }
        catch (e) { }

        return false;
    };



    this.isDateValue = function (value) {
        var val = value;
        if (val) {
            val = val.toString().replace(/\s+/, "");
            if (Date.parse(val) && /^\d+$/.test(val) === false && parseFloat(val))
                return true;
        }
        return false;
    }

    ///From: https://gist.github.com/ryoppy/5780748
    /**
     * Parse query string.
     * ?a=b&c=d to {a: b, c: d}
     * @param {String} (option) queryString
     * @return {Object} query params
     */
    this.getQueryParams = function (queryString) {
        var query = (queryString || window.location.search || window.location.hash.replace("#/", '')).substring(1); // delete ?
        if (!query) {
            return false;
        }
        return _
        .chain(query.split('&'))
        .map(function (params) {
            var p = params.split('=');
            var val = decodeURIComponent(p[1]);
            if (p.length > 2 && val.indexOf("WithRelationship") > -1) {
                //required fix for BUG 19544
                //base64 value like the one used in WithRelationship platform filter contains =
                val = decodeURIComponent(params).substring(p[0].length+1, params.length);
            }
            return [p[0].toLowerCase(), val];
        })
        .object()
        .value();
    }

    this.recurse = function (items, field, depthFirst, callback, parent, depth) {
        if (!items) return;
        if (depth === undefined) depth = 0;

        for (var i = 0; i < items.length; i++) {
            if (!depthFirst) callback(items[i], i, depth, parent);
            recurse(items[i][field], field, depthFirst, callback, items[i], depth + 1);
            if (depthFirst) callback(items[i], i, depth, parent);
        }
    }

    this.CheckedStartAndEndDate = function (startDateName, endDateName, errorMessage) {
        var startDateInput = $("input[name='" + startDateName + "']");
        var endDateInput = $("input[name='" + endDateName + "']");

        //var startDatePickerType = startDateInput.attr("data-control");
        //var endDatePickerType = endDateInput.attr("data-control");

        //var StartDate = (startDatePickerType == "dateTimePicker") ? startDateInput.data("kendoDateTimePicker") : startDateInput.data("kendoDatePicker");
        //var EndDate = (endDatePickerType == "dateTimePicker") ? endDateInput.data("kendoDateTimePicker") : endDateInput.data("kendoDatePicker");

        //var StartDateVal = kendo.parseDate(StartDate.value());
        //var EndDateVal = kendo.parseDate(EndDate.value());
        var StartDateVal = kendo.parseDate(startDateInput.val());
        var EndDateVal = kendo.parseDate(endDateInput.val());
        if (EndDateVal > StartDateVal) {
            return true;
        }

        kendo.ui.ExtOkCancelDialog.show({
            title: localization.Warning,
            message: errorMessage,
            icon: "fa fa-exclamation"
        });
        return false;
    }
    this.CheckedManualActivityStartAndEndDate = function (startDateName, endDateName, errorMessage) {

        var StartDateVal = kendo.parseDate(startDateName);
        var EndDateVal = kendo.parseDate(endDateName);
        //only check if end date is later when both values are set
        if (!_.isNull(startDateName) && !_.isNull(endDateName)) {
            if (EndDateVal < StartDateVal) {

                kendo.ui.ExtOkCancelDialog.show({
                    title: localization.Warning,
                    message: errorMessage,
                    icon: "fa fa-exclamation"
                });
                return false;
            }
        }

        return true;


    }

    this.SetDaysLeft = function (startDate, endDate, dataVM, modelKey) {
        if (startDate != "" && endDate != "") {
            var start = kendo.parseDate(startDate);
            var end = kendo.parseDate(endDate);
            if (start >= end) {
                dataVM.set(modelKey, 0);
            } else {
                var result = app.lib.GetDaysBetween(new Date(), end);
                dataVM.set(modelKey, result < 0 ? 0 : result);
            }
        }
    }

    this.GetDaysLeft = function (startDate, endDate) {
        var daysLeft = 0;
        if (startDate != "" && endDate != "") {
            var start = kendo.parseDate(startDate);
            var end = kendo.parseDate(endDate);
            if (start >= end) {
                daysLeft = 0;
            } else {
                daysLeft = app.lib.GetDaysBetween(new Date(), end);
            }
        }

        return daysLeft < 0 ? 0 : daysLeft;
    }

    this.GetDaysBetween = function (first, second) {
        var diff = new Date(second).setHours(12) - new Date(first).setHours(12);
        return Math.round(diff / 8.64e7);
    }

    this.logout = function (formId) {
        app.clearNodeAndViewPanelStorage();
        $('#' + formId).submit();
    }

    //lets store form return urls in session so it easier to send user back where they belong
    this.getFormReturnUrl = function () {
        return store.session.get("formReturnUrl:" + window.location.pathname);
    }

    //set the form return URL with the option to force over writing exisitng url
    this.setFormReturnUrl = function (url, force) {
        force = _.isUndefined(force) ? false : true;

        if (url.toLowerCase().indexOf("/new") === -1) {
            if (force && url.length > 0) {
                store.session.set("formReturnUrl:" + window.location.pathname, url);
            } else if (_.isNull(this.getFormReturnUrl()) && url.length > 0) {
                store.session.set("formReturnUrl:" + window.location.pathname, url);
            }

            if (window.location.pathname.toLowerCase().indexOf("/new") !== -1) {
                store.session.set("formReturnUrlFromNew", url);
            }
        } else
            store.session.set("formReturnUrl:" + window.location.pathname, store.session.get("formReturnUrlFromNew"));

        return this.getFormReturnUrl();
    }

    this.removeFormReturnUrl = function () {
        return store.session.remove("formReturnUrl:" + window.location.pathname);
    }

    this.isNewForm = function () {
        if (location.pathname.toLowerCase().indexOf("/new") != -1)
            return true;
        else
            return false;
    }

    this.gotoFormReturnUrl = function () {

        var windowOpener;
        var homeURL = "/";

        try {
            //when IR opened from a diff domain it will fail on window.opener.location
            if (window.opener && window.opener.location.host) {
                windowOpener = window.opener;
            }
        } catch (e) {
            windowOpener = false;
        }


        if (windowOpener && (window.opener.location.host === window.location.host) &&
                history.length < 2 //if they browse away don't close the form, reloads don't add to history count
        ) {
            //we have a window that was opened from another portal window
            //let's first clear out the return URL in the session
            this.removeFormReturnUrl();

            if (history.length == 1) {
                location.href = homeURL; //handle new tab
            }
            else {
                //now lets just close ourself
                window.close();
            }
            
        } else {
            //when return url was empty then redirect to alternate homepage.
            if (history.length > 2) {
                //do the normal thing
                if (_.isNull(this.getFormReturnUrl())) {
                    //when previous page is not the login page, go back to document referrer if it isnt empty else to fallback url
                    if (document.referrer.indexOf("/Login") == -1 && document.referrer != "") {
                        location.href = document.referrer;
                    }
                    else {
                        location.href = homeURL;
                    }
                        
                } else {
                    
                    //there were instances were domain/host name was omitted, so send down the absolute path instead
                    var origin = location.protocol + '//' + location.hostname + (location.port ? (':' + location.port) : '');
                    var absolutePath = origin + this.getFormReturnUrl();
                    if (location.href == absolutePath)
                        history.go(-1);
                    location.href = absolutePath;
                }
            } else {
                //alternate homepage redirect.
                location.href = homeURL;
            }
            return;
        }

    }

    // used to make sure we have an actually dom element when using selector.
    //$('#' + gridId + ' td').exists()
    $.fn.exists = function () {
        return this.length > 0 ? this : false;
    }

    //used for removing unsafe tags on input forms
    this.escapeHTML = function (unsafe_str) { // this was done for crossbrowser issue
        return unsafe_str
          //.replace(/&/g, '&emp;')
          .replace(/</g, '')
          .replace(/>/g, '')
          .replace(/\"/g, '');
    },

    //encode html special chars
    this.htmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    this.recheckGridState = function (state, grid) {
        if (_.isUndefined(state.page)) {
            state.page = grid.dataSource.options.page;
        }
        if (_.isUndefined(state.pageSize)) {
            state.page = grid.dataSource.options.pageSize;
        }
    }

    this.getPriorityByMatrix = function (priorityJson, urgencyId, impactId) {
        if (!priorityJson) {
            return null;
        }

        var priority = 0;
        var priorityJsonU = priorityJson.Matrix.U;
        for (var i in priorityJsonU) {
            var obj = priorityJsonU[i];
            if (obj.Id == urgencyId) {
                for (var x in obj.I) {
                    var obj2 = obj.I[x];
                    if (obj2.Id == impactId) {
                        priority = obj2.P;
                        break;
                    } else {
                        priority = 0;
                    }
                }
            }
        }

        return priority;
    }

    this.getLocalDateFromUTCDate = function (date) {
        return new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()));
    }

    //takes date param as string or js Date object, returns local datetime with locale formatting as string
    this.getFormattedLocalDateTime = function (date) {
        if (!_.isDate(date) && !_.isString(date)) {
            //if it is not a date or string, just return what was sent to us
            return date;
        }
        var localDate = null;
        var formattedDateString = '';

        switch (true) {
            case _.isDate(date):
                //this will be a date object from the server that is in UTC time
                localDate = app.lib.getLocalDateFromUTCDate(date);
                break;
            case _.isString(date) && date.length > 0:
                //check if we have UTC on the string, if so parse it first (User Inputs bug fix)
                if (moment(date, moment.ISO_8601).isValid()) {
                    // User input dates are stored in UTC ISO 8601, so convert them to the local time. J.D./S.W. 2020-11-27
                    localDate = kendo.toString(new Date(date),"g");
                } else {
                    // Previous releases stored date times in the User Input in local time format, so they will be displayed as they were input by the user
                    localDate = date;
                }
                break;
            default:
                localDate = null;
        }


        if (_.isNull(localDate)) {
            formattedDateString = '';
        } else {
            formattedDateString = kendo.toString(localDate, 'g');
        }
        return formattedDateString;
    }

    this.ToggleTextboxRequired = function (element, isRequired) {
        var formGroup = element.parents(".form-group");
        if (isRequired) {
            element.attr("required", "");
            formGroup.find("span:last").show(); //this will show required text
        }
        else {
            element.removeAttr("required");
            formGroup.removeClass("has-error").find("span:last").hide(); //this will hide required text
        }
    }

    this.isDefined = function (object) {
        var isNotNull = object != null;
        var isNotUndefined = !_.isUndefined(object);
        return isNotNull && isNotUndefined;
    };

    this.knowledgeManagerDeleteArticle = function (articleId, controlId) {
        var control;
        if (_.isString(controlId)) {
            control = $('#' + controlId).data('kendoGrid');
        }
        if (app.isMobile()) {
            control = $(controlId).closest("[data-control-id]").data('kendoListView');
            //control = $("[data-control-id='" + controlId + "']").data('kendoListView');
        }

        //confirm before archiving.
        $.when(kendo.ui.ExtOkCancelDialog.show({
            title: localization.Warning,
            message: localization.ConfirmDeleteArticle,
            icon: "fa fa-exclamation"
        })).done(function (response) {
            if (response.button === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: app.lib.addUrlParam("/api/V3/KnowledgeBase/DeleteHtmlKnowledge/", "articleId", articleId),
                    success: function () {
                        //sync data to update UI
                        if (app.isMobile()) {
                            control.dataSource.query();
                        } else {
                            control.dataSource.read();
                        }
                    }
                });
            }
        });
    }

    this.vmParseFloat = function (vm, propertyName) { //This will going to set vm to 0 if float is NaN.
        if (_.isNaN(parseFloat(vm.get(propertyName)))) {
            vm.set(propertyName, 0);
        };

        return parseFloat(vm.get(propertyName));
    }

    this.makeDrawer = function (direction, drawerContainer, elementBtnObj, closeOnContainerClick) {
        // class to use for transition
        var transitionClass = 'header_slide_transition';
        // parent of drawer container use for removing its children transitionClass if present.
        var containerParent = drawerContainer.parent();
        // This where hide the drawer elements.
        function hideContainer() {
            containerParent.children().each(function () {
                $(this).removeClass(transitionClass);
            });
        }
        // Click an element to on and off the drawer container.
        elementBtnObj.on('click', function () {
            $('input').blur();
            // for task panel button
            if (elementBtnObj.hasClass('btn-link')) {
                transitionClass = 'task_slide_transition';
               
                if (drawerContainer.hasClass(transitionClass)) {
                    drawerContainer.removeClass(transitionClass);
                    $('body').removeClass('noscroll');
                } else {
                    //Bug 11429: this implemenation to prevent overall changes for the less files affected in this issue.
                    var netHeight = ($(window).height() - 40);//less the header height which is 40px.
                    if (drawerContainer.height() > netHeight) {
                        var height = netHeight - 30;
                        var styles = { height: height + 'px', overflow: 'scroll' };

                        $('body').addClass('noscroll');
                        //drawerContainer.css(styles);
                    }
                    drawerContainer.addClass(transitionClass);
                }
                return;
            }
            // for drawer buttons
            if (drawerContainer.hasClass(transitionClass)) {
                drawerContainer.removeClass(transitionClass);
            } else {
                hideContainer();
                drawerContainer.addClass(transitionClass);
            }
        });
        //This will going to close the drawer if you click it outside
        $(document).click(function (e) {
            if (!elementBtnObj.children('span').is(e.target)
                && elementBtnObj.children('span').has(e.target).length === 0
                && $(e.target).parents('.task-panel').length === 0
                && $(e.target).parents('#drawer-taskbar').length === 0
                && !drawerContainer.is(e.target)
                && drawerContainer.has(e.target).length === 0) {
                //remove the class when clicking any element outside the drawer.
                drawerContainer.removeClass(transitionClass);
            }
        });
    }

    this.filterMobileWiGrid = function (controlId) {
        var listControl = $("[data-control-id='" + controlId + "']").data('kendoListView');
        var dataSource = listControl.dataSource;
        var searchValue = $("input[name=mobileWiGridSearchText]").val();

        $(".mobilegrid__search--help-block").addClass('visible');

        //apply search to title field
        dataSource.query({
            filter: { field: "Title", operator: "contains", value: searchValue },
            page: 1,
            pageSize: 10
        });
    };

    this.adminSettingsTaskPanel = function (settings) {
        var self = $(settings.id);
        var html = "";

        if (app.isMobile()) {
            html = '<div class="nav-dropdown">' +
                   '<span class="nav-dropdown-default">' +
                   settings.active + '</span>' +
                   '<div class="nav-dropdown-trigger">' +
                   '<i class="fa fa-sort-desc"></i></div>' +
                   '<div class="nav-dropdown-content">' +
                   '<ul>' + generateListElement() + '</ul></div></div>';

            
        } else {
            html = '<div class="admin-sidenav col-sm-3 sidebar-right pad-top-1-5">' +
                   '<nav class="tree-dir sidebar-nav">' +
                   '<ul class="nav sidenav abn-tree">' +
                   generateListElement() + '</ul></nav></div>';
        }

        function generateListElement() {
            var listItem = validateListItem(0, "/Settings/Admin/General", localizationHelper.localize("GeneralSettings", "General Settings"), true) +
                validateListItem(0, "/Settings/Admin/AddAIToSMP", localizationHelper.localize("AddAIToSMP", "Add AI to SMP"), true, true) +
                validateListItem(0, "/Settings/Admin/LicenseSettings", localizationHelper.localize("LicenseSettings", "License Settings"), true) +
                validateListItem(3, "", localizationHelper.localize("EmailSettings", "Email Settings"), true) +
                validateListItem(-1, "/Settings/Admin/SMTPDetailsSettings", localizationHelper.localize("SMTPDetails", "SMTP Details"), true) +
                validateListItem(-1, "/Settings/Admin/SendEmailTaskSettings", localizationHelper.localize("SendEmailTask", "Send Email Task"), true) +
                validateListItem(-1, "/Settings/Admin/MentionsNotificationSettings", localizationHelper.localize("ActionLogNotificationSection", "Action Log Mentions Notification"), true) +
                validateListItem(0, "/Settings/Admin/WorkItemsSettings", localizationHelper.localize("WorkItemSettings", "WorkItem Settings"), true) +
                validateListItem(0, "/Settings/Admin/ActivitySettings", localizationHelper.localize("ActivitySettings", "Activity Settings"), true) +
                validateListItem(0, "/Settings/Admin/GroupSettings", localizationHelper.localize("GroupSettings", "Group Settings"), true) +
                validateListItem(0, "/Settings/Admin/DataRetentionSettings", localizationHelper.localize("DataRetentionSettings", "Data Retention Settings"), undefinedChecking(settings.isValidDashboardsLicense)) +
                validateListItem(0, "/Settings/Admin/DataSourceSettings", localizationHelper.localize("DataSourceSettings", "Data Source Settings"), undefinedChecking(settings.isValidDashboardsLicense)) +
                validateListItem(0, "/Settings/Admin/DashboardQuerySettings", localizationHelper.localize("DashboardDataQuery", "Dashboard Query Settings"), undefinedChecking(settings.isValidDashboardsLicense)) +
                validateListItem(0, "/Settings/Admin/HeaderFooterScriptSettings", localizationHelper.localize("HeaderFooterScriptSettings", "Header & Footer Script Settings"), true) +
                validateListItem(0, "/Settings/Admin/IntegrationSettings", localizationHelper.localize("IntegrationSettings", "Integration Settings"), true) +
                validateListItem(2, "", localizationHelper.localize("DynamicData", "Dynamic Data"), true) +
                validateListItem(-1, "/Settings/Admin/DynamicDataConfiguration", localizationHelper.localize("Configuration", "Configuration"), true) +
                validateListItem(-1, "/Settings/Admin/DynamicDataTroubleshooting", localizationHelper.localize("Troubleshooting", "Troubleshooting"), true) +
                validateListItem(0, "/Settings/Admin/GlobalSearchSettings", localizationHelper.localize("GlobalSearchSettings", "Global Search Settings"), true) +
                validateListItem(0, "/Settings/Admin/Features", localizationHelper.localize("Features", "Features"), true) +
                validateListItem(0, "/Settings/Admin/SelfServicePortalSettings", localizationHelper.localize("SelfServicePortalSettings", "SelfServicePortalSettings"), true) +
                validateListItem(0, "/Settings/Admin/ProductMetrics", localizationHelper.localize("ProductMetrics", "Product Metrics"), true) +
                validateListItem(0, "/Settings/Admin/SettingItems", localizationHelper.localize("SettingItems", "Setting Items"), true) +
                validateListItem(0, "/Settings/Admin/CacheBuilderSettings", localizationHelper.localize("CacheBuilderMaintenance", "Cache Builder Maintenance"), true) +
                validateListItem(0, "/Settings/Admin/TeamsIntegrationSettings", localizationHelper.localize("TeamsIntegrationSettings", "Teams Integration Settings"), undefinedChecking(settings.isValidTeamsAppLicense)) +
                validateListItem(2, "", localizationHelper.localize("CloudConnector", "Cloud Connector (Beta)"), true) +
                validateListItem(-1, "/Settings/Admin/CloudConnectorRestAPI", localizationHelper.localize("RestAPI", "Rest API (Beta)"), true)+
                validateListItem(-1, "/Settings/Admin/WebHooks", localizationHelper.localize("WebHooks", "WebHooks (Beta)"), true);
            return listItem;
        }

        function undefinedChecking(obj) {
            return (obj === undefined) ? true : obj;
        }

        function validateListItem(children, href, localize, isValid, isNew = false) {
            if (isValid) {
                if (children < 0) {
                    return (settings.active === localize)
                        ? (app.isMobile())
                        ? '<li  class="level-2 active margin-l20 text-muted">' +
                        localize +
                        '</li>'
                        : '<li  class="level-2 active margin-l20">' +
                        localize +
                        '</li>'
                        : '<li class="level-2 margin-l20 hide"><a ' +
                        ((isNew)
                        ? 'class="settings-new-item"'
                        : '') +
                        'href="' + href + '">' + localize + '</a></li>' ;
                }else if (children > 0) {
                    var childText = '<small>(' + children + ')</small>';
                    return '<li class="level-1" onclick="app.lib.toggleSubList(this, ' + children + ')"><a ' +
                        ((isNew)
                        ? 'class="settings-new-item" '
                        : '') +
                        'href="#">' + localize + ' ' + childText + '<i ng-class="row.icon" class="tree-icon pull-right fa fa-chevron-left"></i></a></li>';
                } else {
                    return (settings.active === localize)
                        ? (app.isMobile())
                        ? '<li class="hide"></li>'
                        : '<li>' +
                        localize +
                        '</li>'
                        : '<li><a ' +
                        ((isNew)
                        ? 'class="settings-new-item" '
                        : '') +
                        'href="' + href + '">' + localize + '</a></li>';
                }
            }
            return '<li class="hide"></li>'; //prevent showing undefiend when isValid false.
        }

        

        self.append(html);

        var childElement = self.find('li.level-2.active')[0];
        if (childElement) {
            var parentELement = $(childElement).prevAll('li.level-1')[0];
            if (parentELement) $(parentELement).click();
        }

        if (app.isMobile()) {
            self.find('.nav-dropdown-trigger').on('click', function () {
                self.toggleClass('show-nav-content');
            });
        }
    };

    this.toggleSubList = function(el, children) {
        var collapsed = $(el).find('i').hasClass('fa-chevron-left');
        var expanded = $(el).find('i').hasClass('fa-chevron-down');
        var iElement = $(el).find('i')[0];

        if (collapsed) {
            $(iElement).removeClass('fa-chevron-left');
            $(iElement).addClass('fa-chevron-down');
        }

        if (expanded) {
            $(iElement).removeClass('fa-chevron-down');
            $(iElement).addClass('fa-chevron-left');
        }

        var sub = $(el).next('.level-2');
        for (var i = 0; i < children; i++) {
            if (collapsed) $(sub).removeClass('hide');
            if (expanded) $(sub).addClass('hide');
            sub = $(sub).next('.level-2');
        }
    }

    this.optimizeFormMultiObject = { //This will be used to optimize the multi object picker to only pass data that will be remove or/and add when saving the form and will make sure to tag object as dirty to make it easier on the server side to process if the object needs to be updated or not.
        newItem: [],
        deletedItem: [],
        ExcludedProperty: ["NameRelationship", "Activity", "FileAttachment", "RelatedHTMLKB", "RemoveRelatedHTMLKB", "AppliesToWorkItem", "AppliesToTroubleTicket",
                            "Target_LeaseSupersedesLease", "Source_LeaseSupersedesLease", "Target_WarrantySupersedesWarranty", "Source_WarrantySupersedesWarranty",
                            "Target_SupportContractSupersedesSupportContract", "Source_SupportContractSupersedesSupportContract", "WatchList", "ChildWorkItem"],
        ActivityLoadedIds: [],
        ActionLogList: [],
        
        OnVmChange: function (e) {
            //This will add or remove the items to a temporary array to be used on removing and adding items that will be only be needed for saving.
            //This will be triggered when you add or remove items from a multiple object picker.
            if (e.action != null) {
                var field = e.field;
                var item = e.items[0];
                if (item["BaseId"] === "") return; 
                item.isDirty = true;

                if (app.lib.optimizeFormMultiObject.newItem[field] == null) {
                    app.lib.optimizeFormMultiObject.newItem[field] = [];
                    app.lib.optimizeFormMultiObject.deletedItem[field] = [];
                }
                if (e.action == "add") { //when you add the items on the grid

                    app.lib.optimizeFormMultiObject.newItem[field].push(item);

                    var temp = app.lib.optimizeFormMultiObject.deletedItem[field];
                    for (var i in temp) {
                        if (item.BaseId == temp[i].BaseId) {
                            app.lib.optimizeFormMultiObject.deletedItem[field].splice(i, 1);
                        }
                    }
                }
                else if (e.action == "remove") { //When you remove the items from the grid
                    app.lib.optimizeFormMultiObject.deletedItem[field].push(item);
                    var temp = app.lib.optimizeFormMultiObject.newItem[field];
                    for (var i in temp) {
                        if (item.BaseId == temp[i].BaseId) {
                            app.lib.optimizeFormMultiObject.newItem[field].splice(i, 1);
                        }
                    }
                }
            }
        },

        BeforeSave: function (currentVM, originalVM) {
            //This will be triggered before the data is created to be passed to the server.
            
            var processProcessDirty = function (_currentVM, _originalVM) {
                var isDirty = false;

                if (_.isUndefined(_currentVM)) return false;

                for (var i in _originalVM) {
        
                    if (Object.prototype.toString.call(_originalVM[i]) === '[object Array]') {
                        //If object is array, it will going to loop and recall the function to evaluate again if it is an array, json or already a property where the checking happens.
                        
                        if (_currentVM[i].length != _originalVM[i].length) { //If count is not equal somethings added or removed
                            _currentVM.isDirty = true;
                            isDirty = true;
                        }

                        for (var activityIndex in _originalVM[i]) {
                            var tempDirty = processProcessDirty(_currentVM[i][activityIndex], _originalVM[i][activityIndex]);

                            if (!_.isUndefined(_currentVM[i][activityIndex]) && !_.isUndefined(_currentVM[i][activityIndex].isDirty) && tempDirty) {
                                isDirty = true;
                                _currentVM[i][activityIndex].isDirty = true;
                            }
                        }
                    }
                    else if (Object.prototype.toString.call(_originalVM[i]) === '[object Object]') { //If object is a json
                        //If object is json, it will call the function again to evaluate if there another json or array.
                        if (!_.isNull(_currentVM) && !_.isUndefined(_currentVM)) {
                            
                            var tempDirty = processProcessDirty(_currentVM[i], _originalVM[i]);
                            if (!_.isUndefined(_currentVM.isDirty) && tempDirty) {
                                isDirty = true;
                            }
                        }
                        
                    }
                    else { //Will check if original and current is not equal to flag as dirty.
                        if (!_.isNull(_currentVM) && !_.isUndefined(_currentVM)) {
                            if (_currentVM[i] instanceof Date) { continue };
                            if (_originalVM[i] != _currentVM[i]) {
                                _currentVM.isDirty = true;
                                isDirty = true;
                            }
                            else if (_currentVM.isDirty) {
                                isDirty = true;
                            }
                        }
                        
                    }
                }

                return isDirty;
            };
            

            //Same logic to the processProcessDirty
            //This will be use on making sure parents of the dirty relationship will be flag as dirty also.
            var finalizeDirtyObjects = function (_currentVM) {
                var isDirty = false;

                for (var i in _currentVM) {
                    if (i == "view") continue;
                    if (Object.prototype.toString.call(_currentVM[i]) === '[object Array]') {
                        for (var activityIndex in _currentVM[i]) {
                            var tempDirty = finalizeDirtyObjects(_currentVM[i][activityIndex]);

                            if (!_.isUndefined(_currentVM[i][activityIndex]) && !_.isUndefined(_currentVM[i][activityIndex].isDirty) && (_currentVM[i][activityIndex].isDirty || tempDirty)) {
                                isDirty = true;
                                _currentVM[i][activityIndex].isDirty = true;
                            }
                        }
                    }
                    else if (Object.prototype.toString.call(_currentVM[i]) === '[object Object]') {
                        if (!_.isUndefined(_currentVM)) {

                            var tempDirty = finalizeDirtyObjects(_currentVM[i]);

                            if (_currentVM.isDirty || tempDirty) {
                                isDirty = true;
                                _currentVM.isDirty = true;
                            }
                        }

                    }
                }

                return isDirty;
            };
            

            //This will going to empty all property that is array except for "NameRelationship" and will add the items to be added or/and removed to the relationship.
            //This will rely on the optimizeFormMultiObject.OnVmChange method.
            //NOTE: all new added items will be stored in currentVM and all items that will be deleted will be stored in originalVM.
            var removedNotDirtyObj = function (_currentVM, _originalVM) {
                var tempDeleted = [];
                var newItem = app.lib.optimizeFormMultiObject.newItem;
                var deletedItem = app.lib.optimizeFormMultiObject.deletedItem;

                for (var i in _originalVM) {
                    if (app.lib.optimizeFormMultiObject.IsPropertyExcluded(i) && Object.prototype.toString.call(_originalVM[i]) === '[object Array]') { }
                    else if (Object.prototype.toString.call(_originalVM[i]) === '[object Array]')
                    {
                        var tempAdded = [];
                        //This will going to check add the needed items to be remove when saving.
                        for (var iAdded in _originalVM[i]) {
                            for (var iNew in deletedItem[i]) {
                                if (_originalVM[i][iAdded].BaseId == deletedItem[i][iNew].BaseId) {
                                    tempAdded.push(_originalVM[i][iAdded]);
                                }
                            }
                        }
                        _originalVM[i] = []; //This will clear out the relationship array.
                        for (var newI in tempAdded) { //this will add the the items the will be removed to the current relationship.
                            _originalVM[i].push(tempAdded[newI]);
                        }
                    }
                }

                //Thiw will going to clear out the relationship array.
                for (var i in _currentVM) {
                    if (app.lib.optimizeFormMultiObject.IsPropertyExcluded(i) && Object.prototype.toString.call(_currentVM[i]) === '[object Array]') { }
                    else if (Object.prototype.toString.call(_currentVM[i]) === '[object Array]')
                    {
                        _.each(_currentVM[i], function (item, index) {

                            //This will going to check if the relationship object is dirty. If it is dirty then it will have to be added back to the current and old vm to be save in the server side.
                            if (item.isDirty) {
                                var itemFound = _.find(newItem[i], function (x) {
                                    return x.BaseId == item.BaseId;
                                });
                                if (_.isUndefined(itemFound)) {
                                    if (_.isUndefined(newItem[i]))
                                    {
                                        newItem[i] = [];
                                    }
                                    newItem[i].push(item);

                                    if (_.isUndefined(_originalVM[i])) {
                                        _originalVM[i] = [];
                                    }
                                    _originalVM[i].push(item);
                                }
                            }
                        });

                        delete _currentVM[i];
                    }
                }
             
                //This will add the new items selected to be save.
                for (var iAdded in newItem) {
                    if (app.lib.optimizeFormMultiObject.IsPropertyExcluded(iAdded)) continue;
                    _currentVM[iAdded] = newItem[iAdded];
                }
            };

            //This will remove activities that have no changes
            var removeNotDirtyActivity = function (_baseLineVM, _currentVM, _orignalVM) {
                var activitiesBaseLine = _baseLineVM.Activity;
                var activitiesCurrent = _currentVM.Activity;
                var activitiesOriginal = _orignalVM.Activity;

                for (var i in activitiesBaseLine) {
                    var activityBaseLine = activitiesBaseLine[i];
                    if (activityBaseLine.isDirty==false) {

                        for (var cur in activitiesCurrent) {
                            if (activitiesCurrent[cur].BaseId == activityBaseLine.BaseId) {
                                activitiesCurrent.splice(cur,1);
                                break;
                            }
                        }

                        for (var orig in activitiesOriginal) {
                            if (activitiesOriginal[orig].BaseId == activityBaseLine.BaseId) {
                                activitiesOriginal.splice(orig, 1);
                                break;
                            }
                        }
                    }
                    else {
                        var cur = _.find(activitiesCurrent, function (item) { return item.BaseId == activityBaseLine.BaseId; });
                        var orig = _.find(activitiesOriginal, function (item) { return item.BaseId == activityBaseLine.BaseId; });

                        if (!_.isUndefined(orig) && !_.isUndefined(orig)) {
                            removeNotDirtyActivity(activityBaseLine, cur, orig);
                        }
                    }
                    
                }
            };

            processProcessDirty(currentVM, originalVM);
            currentVM.isDirty = finalizeDirtyObjects(currentVM);
            removedNotDirtyObj(currentVM, originalVM);

            var baseLineVM = JSON.parse(JSON.stringify(currentVM));
            removeNotDirtyActivity(baseLineVM, currentVM, originalVM);

            //Exclude "new" status from concurrency check
            if (!_.isUndefined(currentVM.Status) && (currentVM.Status.Id == "a87c003e-8c19-a25f-f8b2-151b56670e5c" ||
                currentVM.Status.Id == "a52fbc7d-0ee3-c630-f820-37eae24d6e9b" ||
                currentVM.Status.Id == "9b3c924a-3f95-b9d8-6711-42aa8271dd30" ||
                currentVM.Status.Id == "5e2d3932-cA6d-1515-7310-6f58584df73e")) {
                delete currentVM.Status;
                delete originalVM.Status;
            }
        },


        IsPropertyExcluded: function (propertyName) {
            for (var i in app.lib.optimizeFormMultiObject.ExcludedProperty)
            {
                if (propertyName == app.lib.optimizeFormMultiObject.ExcludedProperty[i])
                {
                    return true;
                }
            }
            return false;
        }

        
    }

    this.isDateExist = function (calDate, arrDate) {
        for (var i in arrDate) {
            if (calDate == arrDate[i].date) {
                return arrDate[i];
            }
        }
    };

    this.getLinkUrl = function (type, id) {
        var link = "";
        switch (type) {
            case "ChangeRequest":
                link = "/ChangeRequest/Edit/" + id + "/";
                break;
            case "ServiceRequest":
                link = "/ServiceRequest/Edit/" + id + "/";
                break;
            case "Problem":
                link = "/Problem/Edit/" + id + "/";
                break;
            case "ReleaseRecord":
                link = "/ReleaseRecord/Edit/" + id + "/";
                break;
            case "ManualActivity":
            case "ReviewActivity":
                link = "/Activity/Edit/" + id + "/";
                break;
            default:
            case "Incident":
                link = "/Incident/Edit/" + id + "/";
                break;

        }
        return link;
    }
 
    this.getQueryResultDisplayText = function (userInput) {
        //if the user input has a tag in it it will break this
        //so lets make sure we have the value
        if (!_.isUndefined(userInput.Answer.Values) && !_.isUndefined(userInput.Answer.Values.Value)) {
            var values = userInput.Answer.Values.Value;
            var displayVals = new Array();
            if (values.length > 1) {
                for (var j in values) {
                    displayVals.push(values[j]['DisplayName']);
                }
            } else {
                displayVals.push(values['DisplayName']);
            }

            //manipulate array
            displayVals = displayVals.filter(function (e) { return e });
            displayVals.sort();
            
            return displayVals.join('<br/>');;
        } else {
            console.warn("Error Parsing User Input for: " + userInput.Question);
        }
        return "";
    }

    this.getEnumDisplayName = function (enumId, callback) {
        return $.ajax({
            type: 'GET',
            async: false,
            timeout: 5000,
            url: '/api/V3/Enum/GetEnumDisplayName',
            data: { Id: enumId },
            success: function(data) {
                callback(data);
            }
        }); 
    }

    this.sanitizeURL = function (url) {
        return decodeURIComponent(url).replace(/(\/#|\/|#)$/, '');
    }

    this.getSetting = function (key, callback) {
        return $.ajax({
            type: 'GET',
            async: false,
            timeout: 5000,
            url: '/api/V3/Settings/GetSetting',
            data: { settingKey: key },
            success: function (data) {
                callback(data);
            }
        });
    }

    this.getChangeStatusRules = function () {
        var workItemStatuses = app.constants.workItemStatuses;
        var incidentResolved = workItemStatuses.Incident.Resolved;
        var incidentActive = workItemStatuses.Incident.Active;
        var incidentClosed = workItemStatuses.Incident.Closed;
        var incidentActivePending = workItemStatuses.Incident.Pending;
        var serviceRequestCancelled = workItemStatuses.ServiceRequest.Cancelled;
        var serviceRequestCompleted = workItemStatuses.ServiceRequest.Completed;
        var serviceRequestSubmitted = workItemStatuses.ServiceRequest.Submitted;
        var serviceRequestInProgress = workItemStatuses.ServiceRequest.InProgress;
        var serviceRequestOnHold = workItemStatuses.ServiceRequest.OnHold;
        var serviceRequestFailed = workItemStatuses.ServiceRequest.Failed;
        var serviceRequestClosed = workItemStatuses.ServiceRequest.Closed;
        var changeRequestFailed = workItemStatuses.ChangeRequest.Failed;
        var changeRequestClosed = workItemStatuses.ChangeRequest.Closed;
        var changeRequestInProgress = workItemStatuses.ChangeRequest.InProgress;
        var changeRequestOnHold = workItemStatuses.ChangeRequest.OnHold;
        var changeRequestCancelled = workItemStatuses.ChangeRequest.Cancelled;
        var changeRequestSubmitted = workItemStatuses.ChangeRequest.Submitted;
        var changeRequestCompleted = workItemStatuses.ChangeRequest.Completed;
        var problemResolved = workItemStatuses.Problem.Resolved;
        var problemClosed = workItemStatuses.Problem.Closed;
        var releaseRecordClosed = workItemStatuses.ReleaseRecord.Closed;
        var releaseRecordCancelled = workItemStatuses.ReleaseRecord.Cancelled;
        var releaseRecordCompleted = workItemStatuses.ReleaseRecord.Completed;
        var releaseRecordFailed = workItemStatuses.ReleaseRecord.Failed;
        var releaseRecordEditing = workItemStatuses.ReleaseRecord.Editing;
        var releaseRecordOnHold = workItemStatuses.ReleaseRecord.OnHold;
        var releaseRecordInProgress = workItemStatuses.ReleaseRecord.InProgress;

        //define change rules and states
        var changeRules = new Array();

        /*ServiceRequest*/
        changeRules['ServiceRequest'] = new Array();

        changeRules['ServiceRequest'][serviceRequestSubmitted] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestCompleted },
                { field: "Id", operator: "eq", value: serviceRequestSubmitted }
            ]
        };

        changeRules['ServiceRequest'][serviceRequestInProgress] = {
            logic: "or",
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestCancelled },
                { field: "Id", operator: "eq", value: serviceRequestInProgress },
                { field: "Id", operator: "eq", value: serviceRequestOnHold }
            ]
        };

        changeRules['ServiceRequest'][serviceRequestOnHold] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestOnHold },
                { field: "Id", operator: "eq", value: serviceRequestCancelled },
                { field: "Id", operator: "eq", value: serviceRequestInProgress }
            ]
        };

        changeRules['ServiceRequest'][serviceRequestFailed] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestFailed },
                { field: "Id", operator: "eq", value: serviceRequestClosed }
            ]
        };

        changeRules['ServiceRequest'][serviceRequestCancelled] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestCancelled },
                { field: "Id", operator: "eq", value: serviceRequestClosed }
            ]
        };

        changeRules['ServiceRequest'][serviceRequestCompleted] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: serviceRequestCompleted },
                { field: "Id", operator: "eq", value: serviceRequestClosed }
            ]
        };

        /*END ServiceRequest*/


        /*Release Record*/
        changeRules['ReleaseRecord'] = new Array();

        changeRules['ReleaseRecord'][releaseRecordInProgress] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordCancelled },
                { field: "Id", operator: "eq", value: releaseRecordEditing },
                { field: "Id", operator: "eq", value: releaseRecordInProgress },
                { field: "Id", operator: "eq", value: releaseRecordOnHold }
            ]
        };

        changeRules['ReleaseRecord'][releaseRecordEditing] = {
            logic: "or",
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordCancelled },
                { field: "Id", operator: "eq", value: releaseRecordEditing }
            ]
        };

        changeRules['ReleaseRecord'][releaseRecordOnHold] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordCancelled },
                { field: "Id", operator: "eq", value: releaseRecordEditing },
                { field: "Id", operator: "eq", value: releaseRecordInProgress },
                { field: "Id", operator: "eq", value: releaseRecordOnHold }
            ]
        };

        changeRules['ReleaseRecord'][releaseRecordFailed] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordEditing },
                { field: "Id", operator: "eq", value: releaseRecordFailed },
                { field: "Id", operator: "eq", value: releaseRecordClosed }
            ]
        };

        changeRules['ReleaseRecord'][releaseRecordCancelled] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordEditing },
                { field: "Id", operator: "eq", value: releaseRecordCancelled },
                { field: "Id", operator: "eq", value: releaseRecordClosed }
            ]
        };

        changeRules['ReleaseRecord'][releaseRecordCompleted] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: releaseRecordEditing },
                { field: "Id", operator: "eq", value: releaseRecordClosed },
                { field: "Id", operator: "eq", value: releaseRecordCompleted }
            ]
        };

        /*END Release Record*/


        /*Change Request*/
        changeRules['ChangeRequest'] = new Array();

        changeRules['ChangeRequest'][changeRequestSubmitted] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: changeRequestCompleted },
                { field: "Id", operator: "eq", value: changeRequestSubmitted }
            ]
        };

        changeRules['ChangeRequest'][changeRequestInProgress] = {
            logic: "or",
            filters: [
                { field: "Id", operator: "eq", value: changeRequestCancelled },
                { field: "Id", operator: "eq", value: changeRequestInProgress },
                { field: "Id", operator: "eq", value: changeRequestOnHold }
            ]
        };

        changeRules['ChangeRequest'][changeRequestOnHold] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: changeRequestOnHold },
                { field: "Id", operator: "eq", value: changeRequestCancelled },
                { field: "Id", operator: "eq", value: changeRequestInProgress }
            ]
        };

        changeRules['ChangeRequest'][changeRequestFailed] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: changeRequestFailed },
                { field: "Id", operator: "eq", value: changeRequestClosed }
            ]
        };

        changeRules['ChangeRequest'][changeRequestCancelled] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: changeRequestCancelled },
                { field: "Id", operator: "eq", value: changeRequestClosed }
            ]
        };

        changeRules['ChangeRequest'][changeRequestCompleted] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: changeRequestCompleted },
                { field: "Id", operator: "eq", value: changeRequestClosed }
            ]
        };
        /*END Change Request*/

        /*Incident*/
        changeRules['Incident'] = new Array();

        changeRules['Incident'][incidentActive] = {
            field: "Id",
            operator: "neq",
            value: incidentClosed
        };

        changeRules['Incident'][incidentActivePending] = {
            field: "Id",
            operator: "neq",
            value: incidentClosed
        };

        changeRules['Incident'][incidentResolved] = {
            logic: 'or',
            filters: [
                { field: "Id", operator: "eq", value: incidentActive },
                { field: "Id", operator: "eq", value: incidentClosed }
            ]
        };

        /*END Incident*/

        /*Problem*/
        changeRules['Problem'] = new Array();
        /*END Problem*/


        return changeRules;
    }

    this.decodeHTML = function (encodedString) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }

    this.encodeHTML = function (stringHTML) {
        var p = document.createElement("p");
        p.textContent = stringHTML;
        return p.innerHTML;
    }

    this.copyToClipboard = function (inputName) {
        var copyText = document.getElementById(inputName);
        var $temp = $("<input>");

        $("body").append($temp);
        $temp.val($(copyText).val()).select();
        document.execCommand("copy");
        $temp.remove();

        $(copyText).css("background-color", "lightgoldenrodyellow");
    }


    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;
    this.sortAlphanumeric = function (a, b) {
        var aA = a.replace(reA, "");
        var bA = b.replace(reA, "");
        if (aA === bA) {
            var aN = parseInt(a.replace(reN, ""), 10);
            var bN = parseInt(b.replace(reN, ""), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    }

    this.isIE = function () {
        var ua = window.navigator.userAgent;
        if (ua.indexOf("Trident/7.0") > -1)
            return 11;
        else if (ua.indexOf("Trident/6.0") > -1)
            return 10;
        else if (ua.indexOf("Trident/5.0") > -1)
            return 9;
        else
            return 0;  // not IE9, 10 or 11
    }

    this.capitalize = function (text) {
        return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
    }
}

app.lib = new app.lib;

//TODO put in it's own space, user require, module, etc
app.custom = function () {
    var that = this;
    this.formTasks = { //an odject to handle custom assigned from tasks
        tasks: [],
        add: function (type, label, func) {
            if (typeof (this.tasks[type]) == 'undefined') {
                this.tasks[type] = [];
            }

            this.tasks[type].push({ label: label, func: func });
            return this.tasks;
        },
        get: function (type) {
            return this.tasks[type];
        }
    }
    this.actionMethod = { //an odject to handle custom assigned from tasks
        viewModel: [],
        add: function (type, index, func) {
            if (typeof (this.viewModel[type]) == 'undefined') {
                this.viewModel[type] = [];
            }

            this.viewModel[type].push({ index: index, func: func });
            return this.viewModel;
        },
        get: function (type) {
            return this.viewModel[type];
        }
    }
    this.dashboard = {
        widgets: [],
        startingOrdinal: 120,
        add: function (name, title, description, callback, editLocation, additionalParams) {
            var widgetConfig = this.createConfig(name, description, title);
            widgetConfig.edit.templateUrl = editLocation;
            var widget = {
                name: name,
                callback: callback,
                config: widgetConfig,
            };
            if (additionalParams) {
                widget.additionalParams = additionalParams;
            }
            this.widgets.push(widget);
            return this;
        },
        createConfig: function (name, description, title) {
            var config = {
                description: description,
                edit: {
                    custom: true,
                    reload: true,
                },
                frameless: false,
                jsonKey: name + "-controller",
                ordinal: this.startingOrdinal + this.widgets.length,
                reload: true,
                title: title,
                custom: true,
            };
            return config;
        },
        getConfig: function (name) {
            var widget = this.widgets.find(function (w) { w.name === name });
            if (widget) {
                return widget.config;
            }
        },
        build: function () {
            app.custom.dashboard.widgets.forEach(function (widget) {
                $('[adf-widget-type="' + widget.name + '"]').each(function (i, e) {
                    var postLinkScope = $(e).scope()["$$childHead"];
                    var originalEdit = postLinkScope.edit;
                    postLinkScope.edit = function () {
                        setTimeout(function () {
                            app.custom.dashboard.clickHandler(widget);
                            originalEdit();
                        }, 100);
                    };
                    if (widget.additionalParams) {
                        var parameters = [e, i];
                        if (_.isString(widget.additionalParams)) {
                            parameters.push(widget.additionalParams);
                        } else {
                            for (var param in widget.additionalParams) {
                                var thisParam = widget.additionalParams[param];
                                var val;
                                if (_.isFunction(thisParam)) {
                                    val = thisParam(e, i);
                                } else {
                                    val = thisParam;
                                }
                                parameters.push(val);
                            }
                        }
                        widget.callback.apply(null, parameters);
                    } else {
                        widget.callback(e, i);
                    }
                });
            });
        },
        clickHandler: function (widget) {
            setTimeout(function () {
                var customArea = $(".modal-body").find(".customWidgetConfig");
                if (!(customArea.length > 0)) {
                    $(".modal-body").append('<div class="customWidgetConfig"></div>');
                }
                $('.progress').remove();
                $(".modal-body")
                    .find(".customWidgetConfig")
                    .load(widget.config.edit.templateUrl);
            }, 100);
        }

    }

    this.gridAction = {
        gridActions: [],
        add: function (customGridAction) {
            if (typeof (this.gridActions) == 'undefined') {
                this.gridActions = [];
            }

            //this.gridActions.push({id: id, label: label, func: func });
            this.gridActions.push(customGridAction);
            return this.gridActions;
        },
        get: function (id) {
            
            return _.find(this.gridActions, function (item) { return item.Id == id; });
        },
        getAll: function () {
            return this.gridActions;
        }
    }
}
app.custom = new app.custom;


//TODO move to own space too.
app.gridUtils = function () {
    var self = this;
    self.GridSubType = null;
    self.denoteAppliedFilters = function (grid, currentState) {
        var gridHeaders = grid.thead.find("th[data-field]");
        var filter = grid.dataSource.filter();
        grid.thead.find(".k-header-column-menu.k-state-active").removeClass("k-state-active");

        if (filter) {
            var filteredMembers = {};
            self.setFilteredMembers(filter, filteredMembers);
            gridHeaders.each(function () {
                var cell = $(this);
                var filtered = filteredMembers[cell.data("field")];
                if (filtered) {
                    if (cell.find(".k-header-column-menu").find(".fa-filter").length <= 0) {
                        cell.find(".k-header-column-menu").append("<i class='fa fa-filter'></i>");
                    }
                }
            });
        } else {
            //no filters, need to make sure the filter icon is not in the col headers
            gridHeaders.each(function () {
                var cell = $(this);
                if (cell.find(".k-header-column-menu").find(".fa-filter").length > 0) {
                    cell.find(".k-header-column-menu").find('.fa-filter').remove();
                }
            });
        }

        // stuff that we have to do to make sure we have the filter icons only on filtered columns
        if (currentState.filter && filter) {
            // just want the col names as arrays so we can get the diff
            var oldFilteredColumns = _.pluck(currentState.filter.filters, 'field');
            var newFilteredColumns = _.pluck(filter.filters, 'field');
            var filtersToRemove = _.difference(oldFilteredColumns, newFilteredColumns);

            _.each(filtersToRemove, function (removeMe) {
                _.each(gridHeaders, function (col) {
                    var cell = $(col);
                    if (cell.data("field") == removeMe) {
                        if (cell.find(".k-header-column-menu").find(".fa-filter").length > 0) {
                            cell.find(".k-header-column-menu").find('.fa-filter').remove();
                        }
                    }
                });
            });
        }
    };

    self.savedState = {
        updateSelectedRows: function (gridId, grid) {
            var currentState = app.gridUtils.savedState.getCurrentState(gridId);

            var selectedIds = grid.select().map(function () {
                return grid.dataItem($(this)).Id;
            }).toArray();

            currentState.selectedRows = selectedIds;
            app.gridUtils.savedState.setSavedState(gridId, currentState);
        },
        setSavedState: function (gridId, stateObj) {
            app.storage.gridStates.set('state_' + gridId, JSON.stringify(stateObj));
        },
        removeSavedState: function (gridId) {
            app.storage.gridStates.remove('state_' + gridId);
        },
        getCurrentState: function (gridId) {
            return app.lib.tryParseJSON(app.storage.gridStates.get('state_' + gridId));
        }
    }

    self.setDashboardGridState = function (gridId, grid, dataSource, currentState) {
        if (grid.options.noState) {
            return;
        }

        //only set up currentState if not present
        if (!currentState) {
            currentState = {
                columns: grid.columns,
                page: dataSource.page() || dataSource.options.page,
                pageSize: dataSource.pageSize() || dataSource.options.pageSize,
                sort: dataSource.sort(),
                group: dataSource.group(),
                filter: dataSource.filter()
            };

            if (currentState.columns == undefined) {
                currentState.columns = grid.columns;
            }
            else {
                grid.columns = currentState.columns;
            }
        }
        
        //save
        app.gridUtils.savedState.setSavedState(gridId, currentState);

        //set
        if (currentState.selectedRows) {
            _.each(currentState.selectedRows, function (selection) {
                var item = _.findWhere(grid.dataItems(), { Id: selection });
                if (item) {
                    var row = grid.tbody.find('[data-uid=' + item.uid + ']');
                    row.addClass('k-state-selected');
                    row.find('.multi-select-checkbox').addClass('fa-check-square-o');
                    row.find('.multi-select-checkbox').removeClass('fa-square-o');
                }
            });

            if (currentState.selectedRows.length === 0) {
                grid.table.find('.multi-select-checkbox').hide();
            }
        } else {
            grid.table.find('.multi-select-checkbox').hide();
        }
    };

    self.setGridStatePersistence = function (gridId, grid, dataSource, currentState) {
        if (grid.options.noState) {
            return;
        }

        //setup
        if (currentState) {
            if (currentState.columns == undefined || currentState.columns.length <= 0) {
                currentState.columns = grid.columns;
            }
            currentState.page = dataSource.page() || dataSource.options.page;
            currentState.pageSize = dataSource.pageSize() || dataSource.options.pageSize;
            currentState.sort = dataSource.sort();
            currentState.group = dataSource.group();
            currentState.filter = dataSource.filter();
        } else {
            currentState = {
                columns: grid.columns,
                page: dataSource.page() || dataSource.options.page,
                pageSize: dataSource.pageSize() || dataSource.options.pageSize,
                sort: dataSource.sort(),
                group: dataSource.group(),
                filter: dataSource.filter()
            }
        }

        //save
        app.gridUtils.savedState.setSavedState(gridId, currentState);

        //set
        if (currentState.selectedRows) {
            _.each(currentState.selectedRows, function (selection) {
                var item = _.findWhere(grid.dataItems(), { Id: selection });
                if (item) {
                    var row = grid.tbody.find('[data-uid=' + item.uid + ']');
                    row.addClass('k-state-selected');
                    row.find('.multi-select-checkbox').addClass('fa-check-square-o');
                    row.find('.multi-select-checkbox').removeClass('fa-square-o');
                }
            });

            if (currentState.selectedRows.length === 0) {
                grid.table.find('.multi-select-checkbox').hide();
            }
        } else {
            grid.table.find('.multi-select-checkbox').hide();
        }
    };

    self.setFilteredMembers = function (filter, members) {
        if (filter.filters) {
            for (var i = 0; i < filter.filters.length; i++) {
                self.setFilteredMembers(filter.filters[i], members);
            }
        } else {
            members[filter.field] = true;
        }
    };

    self.initRowClickHandling = function (gridId, grid, rowClickFunc) {
        var rowEle =
                    $('#' + gridId + " td.grid-highlight-column, #" + gridId + " td.grid-highlight-column-last, #" + gridId + " td.grid-highlight-column-title").exists() ||
                    $('#' + gridId + ' td').exists();
        
        if (rowEle) {
            rowEle.click(function () {
                var row = $(this).closest("tr");
                rowClickFunc(row, grid);
            });
            //do the SLO stuff
            $('#' + gridId + " .slo-grid-container").each(function () {
                var sloPart = $(this);
                SLO.CreateSLOToGrid(sloPart, true);
                SLO.SLOHover(sloPart);
            });
            //remove/hide icon if it is not a parent
            $(".grid-parent-wi-column").each(function () {
                var img = $(this);
                if (img.attr('src') == "") {
                    img.remove();
                }
            });
        }
    };

    self.getLinkUrl = function (data, gridType, bParentLink) {
        var fwdLocation = false;
        //get grid row data type
        var gridRow = data;
        var objectId = gridRow.Id;
        var type;
        var isParentLink = bParentLink;

        //determines type which is used to determine forwarding location and ids needed
        if (!_.isUndefined(gridRow.WorkItemType)) {
            type = gridRow.WorkItemType;
            if (gridRow.WorkItemType == "Activity") {
                type = gridRow.WorkItemTypeClass;
            }

            setDefaultRoute(type);
        } else {
            switch (gridType) {
                case "WarrantyContract":
                    fwdLocation = "/AssetManagement/Contract/Warranty/Edit/" + gridRow.BaseId;
                    break;
                case "LeaseContract":
                    fwdLocation = "/AssetManagement/Contract/Lease/Edit/" + gridRow.BaseId;
                    break;
                case "SupportAndMaintenanceContract":
                    fwdLocation = "/AssetManagement/Contract/SupportandMaintenance/Edit/" + gridRow.BaseId;
                    break;
                case "HardwareAsset":
                    fwdLocation = "/AssetManagement/HardwareAsset/Edit/" + gridRow.BaseId;
                    break;
                case "RequestOffering":
                    fwdLocation = "/ServiceCatalog/RequestOffering/" + gridRow.Id + ',' + gridRow.ServiceInfo.Id;
                    break;
                case "KnowledgeArticle":
                    fwdLocation = "/KnowledgeBase/View/" + gridRow.ArticleId + '?seletedTab=enduser';
                    break;
                case "CostCenter":
                    fwdLocation = "/AssetManagement/Administration/CostCenter/Edit/" + gridRow.BaseId;
                    break;
                case "Location":
                    fwdLocation = "/AssetManagement/Administration/Location/Edit/" + gridRow.BaseId;
                    break;
                case "NoticeEvent":
                    fwdLocation = "/AssetManagement/Administration/NoticeEvent/Edit/" + gridRow.BaseId;
                    break;
                case "Organization":
                    fwdLocation = "/AssetManagement/Administration/Organization/Edit/" + gridRow.BaseId;
                    break;
                case "Standard":
                    fwdLocation = "/AssetManagement/Administration/Standard/Edit/" + gridRow.BaseId;
                    break;
                case "Subnet":
                    fwdLocation = "/AssetManagement/Administration/Subnet/Edit/" + gridRow.BaseId;
                    break;
                case "Vendor":
                    fwdLocation = "/AssetManagement/Administration/Vendor/Edit/" + gridRow.BaseId;
                    break;
                case "CatalogItem":
                    fwdLocation = "/AssetManagement/Administration/CatalogItem/Edit/" + gridRow.BaseId;
                    break;
                case "License":
                    fwdLocation = "/AssetManagement/Administration/License/Edit/" + gridRow.BaseId;
                    break;
                case "Licence":
                    fwdLocation = "/AssetManagement/Administration/License/Edit/" + gridRow.BaseId;
                    break;
                case "SoftwareAsset":
                    fwdLocation = "/AssetManagement/SoftwareAsset/Edit/" + gridRow.BaseId;
                    break;
                case "PurchaseOrder":
                    fwdLocation = "/AssetManagement/Administration/PurchaseOrder/Edit/" + gridRow.BaseId;
                    break;
                case "Purchase":
                    fwdLocation = "/AssetManagement/Administration/Purchase/Edit/" + gridRow.BaseId;
                    break;
                case "Invoice":
                    fwdLocation = "/AssetManagement/Administration/Invoice/Edit/" + gridRow.BaseId;
                    break;
                case "Consumable":
                    fwdLocation = "/AssetManagement/Administration/Consumables/Edit/" + gridRow.BaseId;
                    break;
                case "Announcement":
                    fwdLocation = "/Administration/Announcement/Edit/" + gridRow.Id;
                    break;
                case "EditableKnowledgeArticle":
                    fwdLocation = "/KnowledgeBase/View/" + gridRow.ArticleId;
                    break;
                default:
                    return false;
            }
        }

        function setDefaultRoute(itemType) {
            //default forward location definitions for all current grids.
            if (gridRow.WorkItemType == "Activity") {
                $.get("/grid/GetActivityParentWorkItem", { id: gridRow.BaseId }, function (data) {
                    gridRow.ParentWorkItemType = data.ParentWorkItemType;
                    gridRow.ParentWorkItemId = data.ParentWorkItemId;
                    getActivityParentWorkItem(itemType);
                });
            } else {
                getActivityParentWorkItem(itemType);
            }
        }

        function getActivityParentWorkItem(itemType) {
            if (itemType.indexOf("System.WorkItem") > -1) {
                //It is a work Item
                fwdLocation = '/' + itemType.split('.').pop() + '/Edit/' + objectId + '/';
                if (itemType.indexOf("Activity") > -1) {
                    //if it is from my work->approval page, redirect to RA approval form
                    if (!_.isNull(self.GridSubType) && (_.isUndefined(isParentLink) || !isParentLink)) {
                        var approvalUrl = "";
                        switch (self.GridSubType) {
                            case "myapprovals":
                                approvalUrl = "/ReviewActivity/Approval/" + objectId;
                                break;
                            case "mymanualactivities":
                                approvalUrl = "/ManualActivity/Complete/" + objectId;
                                break;
                            default:
                                approvalUrl = "/Activity/Edit/" + objectId;
                                break;
                        }
                        fwdLocation = approvalUrl;
                    } else {
                        //It is a work item activity
                        fwdLocation = '/Activity/Edit/' + objectId;
                    }
                }
            }
        }

        return fwdLocation;
    };
    self.getObjectLinkUrl = function (data) {
        var fwdLocation = false;
        //get grid row data type
        var gridRow = data;
        var strClass = !_.isUndefined(gridRow.ClassName) ? gridRow.ClassName.split(/[\s.]+/) : "";
        var className = strClass[strClass.length - 1];

        switch (className) {
            case "HardwareAsset":
            case "SoftwareAsset":
                fwdLocation = "/AssetManagement/" + className + "/Edit/" + gridRow.BaseId;
                break;
            case "Lease":
            case "Warranty":
                fwdLocation = "/AssetManagement/Contract/" + className + "/Edit/" + gridRow.BaseId;
                break;
            case "SupportContract":
                fwdLocation = "/AssetManagement/Contract/SupportandMaintenance/Edit/" + gridRow.BaseId;
                break;
            case "Location":
            case "NoticeEvent":
            case "Organization":
            case "Standard":
            case "Subnet":
            case "Vendor":
            case "CatalogItem":
            case "CostCenter":
            case "Invoice":
            case "PurchaseOrder":
            case "Purchase":
                fwdLocation = "/AssetManagement/Administration/" + className + "/Edit/" + gridRow.BaseId;
                break;
            case "Licence":
                fwdLocation = "/AssetManagement/Administration/License/Edit/" + gridRow.BaseId;
                break;
            case "Consumable":
                fwdLocation = "/AssetManagement/Administration/Consumables/Edit/" + gridRow.BaseId;
                break;
            case "ManualActivity":
            case "ReviewActivity":
            case "SequentialActivity":
            case "ParallelActivity":
            case "DependentActivity":
                fwdLocation = "/Activity/Edit/" + gridRow.Id;
                break;
            case "Incident":
            case "ServiceRequest":
            case "ChangeRequest":
            case "Problem":
            case "ReleaseRecord":
                fwdLocation = "/" + className + "/Edit/" + gridRow.Id;
                break;
            case "KnowledgeArticle":
                fwdLocation = "/KnowledgeBase/View/" + gridRow.ArticleId + '?seletedTab=enduser';
                break;
            default:
                fwdLocation = "/DynamicData/Edit/" + gridRow.BaseId;
                break;
        }

        return fwdLocation;
    };
    self.initDashboardRowClickHandling = function (gridId, grid) {
        //set up click for highlight columns
        var highlightCols = $("[adf-grid-state-id=" + gridId + "] td.grid-highlight-column");
        highlightCols.click(function () {
            var anchorLink = ($($(this).children()[0])) ? $($(this).children()[0]).attr('href') : undefined;
            if (anchorLink)
                window.location.href = anchorLink;
            else {
                var selectedData = grid.dataItem(grid.select());
                var forwardLink = '';
                if (selectedData && !_.isUndefined(selectedData) && !_.isUndefined(selectedData.WorkItemType)) {
                    var workItemType = selectedData.WorkItemType.split('.').pop();
                    forwardLink= "/" + workItemType + "/Edit/" + selectedData.Id;

                    //for activities, use parentworkitem type and id
                    if (workItemType.indexOf("Activity") > -1) {
                        forwardLink = "/" + selectedData.ParentWorkItemType + "/Edit/" + selectedData.ParentWorkItemId + "?activityId=" + selectedData.Id + "&tab=activity";
                    }
                } else {
                    forwardLink = $(this).attr('href');
                }

                window.location.href = forwardLink;
            }
        });
    };

    self.handleEmptyResults = function (grid, dataSource, currentState) {
        var colCount = grid.columns.length;
        var noResultsMessage = localization["NoResults"];
        // If there are no results place an indicator row
        if (dataSource._view.length == 0) {
            grid.tbody.append('<tr class="kendo-data-row"><td colspan="' + colCount + '">' + noResultsMessage + '</td></tr>');

            //added to navigate back to page 1 after grid search
            if (grid.dataSource.page() != 1) {
                currentState.page = 1;
                if (!grid.options.noState) {
                    dataSource.query(currentState);
                }
            }
        }
    };
    
    self.saveColumnState = function (gridId, grid, isDirective, event) {
        try {
            if (grid.options.noState) {
                return;
            }

            //This will make sure that it will only going to save data if it is not action rebind to avoid save conflict. bug 23027, 24662
            if (!_.isUndefined(event) && ((!_.isUndefined(event.action) && event.action != "rebind") || _.isUndefined(event.action)))
            {
                //add a defer function as fix for BUG 19525 
                _.defer(function() {
                    var currentState = app.gridUtils.savedState.getCurrentState(gridId);
                    var dataSource = grid.dataSource;

                    currentState.columns = grid.columns;
                    currentState.page = dataSource.page() || dataSource.options.page;
                    currentState.pageSize = dataSource.pageSize() || dataSource.options.pageSize;
                    currentState.sort = dataSource.sort();
                    currentState.group = dataSource.group();
                    currentState.filter = dataSource.filter();

                    app.gridUtils.savedState.setSavedState(gridId, currentState);

                    //don't want to requery for angular directives
                    if (!isDirective) {
                        grid.dataSource.query(currentState);
                    }
                });
            }
            
        } catch (e)
        {
            console.log("error", e);
        }
    }


    self.setDataSourceOverrides = function (vm) {
        if (_.isUndefined(vm.grid.options)) {
            return;
        }
        //check if paging/sorting/filtering is off
        var opts = vm.grid.options;
        if (!_.isUndefined(opts.pageable)) {
            if (opts.pageable != false) {
                vm.dataSource.pageSize = 20;
                vm.dataSource.page = 1;
                vm.dataSource.total = 0;
                vm.dataSource.serverPaging = true;
            }
        }
        if (!_.isUndefined(opts.filterable)) {
            if (opts.filterable != false) {
                vm.dataSource.serverFiltering = true;
            }
        }
        if (!_.isUndefined(opts.sortable)) {
            if (opts.sortable != false) {
                vm.dataSource.serverSorting = true;
            }
        }
        if (!_.isUndefined(opts.groupable)) {
            if (opts.groupable != false) {
                vm.dataSource.serverGrouping = true;
            }
        }

        //override to run everything local
        if (!_.isUndefined(opts.runLocal)) {
            if (opts.groupable != false) {
                vm.dataSource.serverPaging = false;
                vm.dataSource.serverFiltering = false;
                vm.dataSource.serverSorting = false;
                vm.dataSource.serverGrouping = false;
            }
        }
    };

    self.applyLocalizationDataSourceConfig = function (gridId, vm) {

        vm.dataSource = {
            transport: {
                prefix: "",
                parameterMap: function (data, operation) {
                    if (operation === "update" || operation === "create" || operation === "destroy") {
                        _.each(data.models, function (row) {
                            row.Locale = store.session.get('localizationGridLocale');
                        });
                        if (operation === "create" || operation === "destroy") {
                            //create and delete are not batch, so just set the first/only item as the model
                            data.model = data.models[0];
                        }
                        return JSON.stringify(data);
                    }
                    return data;
                }
            },
            batch: true,
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {
                    id: "Id",
                    fields: {}
                }
            }
        };

        //setup endpoints
        _.each(vm.grid.dataSourceEndpoints, function (endpoint, key) {
            if (key == "create") {
                vm.grid.dataSourceEndpoints[key].complete = function (jqXhr, textStatus) {
                    app.lib.mask.remove();
                    if (textStatus == "success") {
                        var grid = $('#' + gridId).data('kendoGrid');
                        grid.refresh();
                        app.lib.message.add(localization.ChangesApplied, "success");
                    } else {
                        app.lib.message.add(localization.ErrorOccured, "danger");
                    }
                    app.lib.message.show();
                }
            }

            if (key == "update" || key == "destroy") {
                vm.grid.dataSourceEndpoints[key].complete = function (jqXhr, textStatus) {
                    app.lib.mask.remove();
                    if (textStatus == "success") {
                        app.lib.message.add(localization.ChangesApplied, "success");
                    } else {
                        app.lib.message.add(localization.ErrorOccured, "danger");
                    }
                    app.lib.message.show();
                }
            }

            if (key == "read" && vm.grid.GridType == "Localization") {
                var endpointDefaults = endpoint.data;
                endpoint.originalConfigData = endpoint.data;
                endpoint.data = function () {
                    var myGrid = $('#' + gridId).data('kendoGrid');

                    if (myGrid) {
                        var comboEle = $(myGrid.element).find("#locale").data('kendoDropDownList');
                        var checkboxEle = $(myGrid.element).find("#showAlreadyTranslated");
                        if (comboEle && checkboxEle) {
                            var locale = comboEle.value();
                            if (locale.length == 0) {
                                locale = session.user.LanguageCode;
                            }
                            store.session.set("localizationGridLocale", locale);
                            return {
                                locale: locale, showAlreadyTranslated: checkboxEle.prop('checked')
                            }
                        }


                    }
                    store.session.set("localizationGridLocale", session.user.LanguageCode);
                    //return defaults
                    return { "locale": session.user.LanguageCode, "showAlreadyTranslated": endpointDefaults.showAlreadyTranslated }
                }
            }
            vm.dataSource.transport[key] = endpoint;
        });
    };

    self.applyKmDashboardDataSourceConfig = function (gridId, vm) {
        vm.dataSource = {
            transport: {
                parameterMap: function (data, operation) {
                    if (operation === "update") {
                        return JSON.stringify(data.models);
                    }
                    return data;
                }
            },
            batch: true,
            schema: {
                model: {
                    id: "ArticleId"
                }
            }
        };

        _.each(vm.grid.dataSourceEndpoints, function (endpoint, key) {
            if (key === "update") {
                //handle callback
                vm.grid.dataSourceEndpoints[key].complete = function (jqXhr, textStatus) {
                    app.lib.mask.remove();
                    if (textStatus == "success") {
                        app.lib.message.add(localization.ChangesApplied, "success");
                    } else {
                        app.lib.message.add(localization.ErrorOccured, "danger");
                    }
                    app.lib.message.show();
                }
            }

            vm.dataSource.transport[key] = endpoint;
        });

    };

    self.configureGenericGrid = function (gridId, vm) {
        vm.dataSource = {
            transport: {
                prefix: "",
                read: {
                    url: vm.grid.dataUrl,
                    data: function () {
                        var paramObj = {};
                        var returnObj = {};
                        var hasName = false;
                        if (!_.isUndefined(vm.grid.queryParameters)) {
                            _.each(vm.grid.queryParameters.params, function (param) {
                                if (_.isUndefined(param.valueSource)) {
                                    //no valueSource, so it is a non-updatable component
                                    paramObj[param.name] = param.value;
                                } else {
                                    switch (param.sourceType) {
                                        case "page-data":
                                            paramObj[param.name] = vm[param.valueSource];
                                            break;
                                        case "dynamic-query-selector":
                                            var otherKey = param.valueSource.substring(param.valueSource.indexOf("{{") + 2, param.valueSource.indexOf("}}"));
                                            var valSource = param.valueSource.replace('{{' + otherKey + '}}', paramObj[otherKey]);
                                            paramObj[param.name] = $(valSource).val();
                                            break;
                                        default:
                                            var paramValue = $(param.valueSource).val(); //if this is not on the dom, it will evaluate to false.
                                            if (_.isUndefined(paramValue) && param.valueSource === '#gridViewId') {
                                                //fallback to default param value of myrequests
                                                paramValue = 'myrequests';
                                            }
                                            paramObj[param.name] = paramValue;
                                    }
                                }
                            });

                            if (!_.isUndefined(vm.grid.queryParameters.name)) {
                                returnObj[vm.grid.queryParameters.name] = "";
                                hasName = true;
                            }
                            switch (vm.grid.queryParameters.type) {
                                case "stringify":
                                    if (hasName) {
                                        returnObj[vm.grid.queryParameters.name] = JSON.stringify(paramObj);
                                        return returnObj;
                                    } else {
                                        return JSON.stringify(paramObj);
                                    }
                                case "ind":
                                    if (hasName) {
                                        returnObj[vm.grid.queryParameters.name] = paramObj;
                                        return returnObj;
                                    } else {
                                        return paramObj;
                                    }
                                default:
                                    return paramObj;
                            }
                        } else {
                            return {};
                        }

                    }
                }
            },
            type: "aspnetmvc-ajax",
            schema: {
                data: "Data",
                total: "Total",
                errors: "Errors",
                model: {

                }
            }
        };
    };

    //iterate through grouped data to get rowData
    function getGroupDataItems(item) {
        if (item[0].hasOwnProperty("hasSubgroups")) {
            return getGroupDataItems(item[0].items);
        }else
            return item;
    }

    /* Fix for BUG 22851: SMP: Grouping work items by dates causes grouped Date to be a day behind
     * Cause: "AsDatePart" field is a Date field only thus defaulting to 12MN as it's server time, and causes the difference in display on client side 
     * Solution: Grouping headers for date should be based on parent field instead of the "AsDatePart" field (i.e. Created insdtead of CreatedAsDatePart)
     * */
    self.getWIDateFieldGroupTemplateValue = function (data) {
        var dataItem = getGroupDataItems(data.items)[0];
        var parentProperty = data.field.replace("AsDatePart", "");
        if (dataItem.hasOwnProperty(parentProperty)) {
            var dt = new Date(dataItem[parentProperty]);
            return dt;
        }
        
        return "";
    }

    self.getApprovalLinkUrl = function (gridRow) {
        var fwdLocation = false;
        var objectId = gridRow.Id;

        switch (gridRow.WorkItemType) {
            case "System.WorkItem.Activity.ManualActivity":
                fwdLocation = "/ManualActivity/Complete/" + objectId;
                break;
            case "System.WorkItem.Activity.ReviewActivity":
                fwdLocation = "/ReviewActivity/Approval/" + objectId;
                break;
        }

        return fwdLocation;
    }

    self.handleRowHoverEvent = function (arg) {
        var icons = $(arg.sender.element[0]).find("tr td span a");
        icons.hover(function () {
            if (!$(this).hasClass("highlight-default-icon")) {
                $(this).parent().find(".highlight-default-icon i").css("color", '#a3b8c2');
            }
        });

        icons.mouseleave(function () {
            if (!$(this).hasClass("highlight-default-icon")) {
                $(this).parent().find(".highlight-default-icon i").removeAttr("style");
            }
        });
    }

}

app.gridUtils = new app.gridUtils;


app.dashboardUtils = function(){
    var self = this;

    self.AddWidgetToggleButton = function () {
        _.defer(function (e) {
            var wigetToggleButon = '<i class="fa fa-minus widget-toggle-icon" style="float:right;"></i>';
            var widgets = $('.adf-widget-title>span')
            $.each(widgets, function (x, widget) {
                if ($(widget).find(".widget-toggle-icon").length < 1) {
                    $(widget).append(wigetToggleButon);
                }
            });

            $('.fa-minus').bind('click', function (e) {
                processToggle(e.currentTarget);
            })

            function processToggle(item) {
                $(item).parent().parent().parent().parent().next().toggle();
                $(item).toggleClass('fa-plus');
                $(item).toggleClass('fa-minus');
            }

            var btnCollapseAll = '<a class="k-button pull-right btn btn-default btn-eyeball-collapse">Collapse All</a>';
            var placement = $('.container-fluid.margin-t20.ng-scope');
            var collapseAll = $(".btn-eyeball-expand");
            if (collapseAll.length == 0) { placement.append(btnCollapseAll); }

            $('.k-button.pull-right.btn.btn-default.btn-eyeball-collapse').bind('click', function (e) {
                var open = $('.fa-minus')
                open.each(function () {
                    processToggle(this);
                });
            })

            var btnExpandAll = '<a class="k-button pull-right btn btn-default btn-eyeball-expand">Expand All</a>';
            var expandAll = $(".btn-eyeball-expand");
            if (expandAll.length == 0) { placement.append(btnExpandAll); }


            $('.k-button.pull-right.btn.btn-default.btn-eyeball-expand').bind('click', function (e) {
                var closed = $('.fa-plus')
                closed.each(function () {
                    processToggle(this);
                });
            })
        });
        
    }


   


}
app.dashboardUtils = new app.dashboardUtils;
