// older browser fix for non window.console objects
if (!console) {
    var console = { log: function () { } }
}

var app = {
    Init: function () { //This will fire after all scripts are loaded but before the page loads.
        if (typeof addIns === 'object' && typeof addIns.loadAddInScripts === 'function') {
            addIns.loadAddInScripts();
        }
        $.ajaxSetup({ xhrFields: { withCredentials: true } });
    },
    PageLoaded: function () {
        $(function () {
            //add ux to side nav
            //app.sideNavInit();
            //app.sideNavAccInit();
            var form = $('#__AntiForgeryForm');
            var token = $('input[name="__RequestVerificationToken"]', form).val() || "";

            (function (send) {
                XMLHttpRequest.prototype.send = function (data) {
                    this.setRequestHeader('__RequestVerificationToken', token);
                    send.call(this, data);
                };
            })(XMLHttpRequest.prototype.send);
            app.featureSet.initList();
            app.setMomentLocale();
            app.initStorageNamespaces();
            app.initSessionStorage();
            app.headerSeachInit();
            app.initHeader();
            app.featureSet.evalFeatureSet();

            //schedule warning popup when session timer option is enabled
            if (session.consoleSetting.UseSessionTimer) {
                $('.session-notification').closest().show();
                app.sessionTimeout.renewSession();
            }

            app.productMetrics.set();

        });
    },
    config: {
        defaultGridRefreshInterval: "",
        enums: {},
        iconPath: "set in _Layout.cshtml",
        icons: {
            //TODO: convert to FA
            "E-Mail Sent": "ActionLogIcons/emailsent.png",

            "Attached File": "ActionLogIcons/attachmentadded.png",
            "Attached File Deleted": "ActionLogIcons/attachmentdeleted.png",

            "Incident Closed": "ActionLogIcons/recordclosed.png",

            "Record Assigned": "ActionLogIcons/recordassigned.png",
            "Record Dispatched": "ActionLogIcons/recorddispatched.png",
            "Record Escalated": "ActionLogIcons/recordescalated.png",
            "Record Opened": "ActionLogIcons/recordopened.png",
            "Record Activated": "ActionLogIcons/recordreopened.png",
            "Record Resolved": "ActionLogIcons/recordresolved.png",

            "Survey Completed": "ActionLogIcons/surveycompleted.png",
            "Task Run": "ActionLogIcons/taskexecuted.png",
            "Template Applied": "ActionLogIcons/templateapplied.png",
            "comment": "ActionLogIcons/comment.png",
            "privateComment": "ActionLogIcons/privatecomment.png",

            taskDefault: "ActionLogIcons/taskexecuted.png",

            "E-Mail Sent": "ActionLogIcons/emailsent.png",

            "aa88cefa-1c40-c1d2-8d64-162f5cb25f2b": "ActionLogIcons/attachmentadded.png",
            "308f9416-c672-200f-adb2-8e8cb10e2c33": "ActionLogIcons/attachmentdeleted.png",
            "6d051b98-bf5d-d63c-595c-daf7ef9919c6": "ActionLogIcons/recordclosed.png",
            "b04370d9-3d4f-3981-61bb-ac9462a1fe65": "ActionLogIcons/recordassigned.png",
            "c80bbb3a-528a-cc9d-58d3-22e6cf6a3ce4": "ActionLogIcons/recorddispatched.png",
            "4c04d527-a16a-58ed-c0a8-821f53b67f09": "ActionLogIcons/recordescalated.png",
            "57c84711-ab28-291a-793b-60d6532a35e3": "ActionLogIcons/recordopened.png",
            "c3b2471e-4662-f394-7d0a-4d54743a8232": "ActionLogIcons/recordreopened.png",
            "5ca2cfee-6740-1576-540b-ce17222840b8": "ActionLogIcons/recordresolved.png",
            "2d5568c7-c16b-71fa-ca3d-9b7b27140feb": "ActionLogIcons/surveycompleted.png",
            "d3a676ea-8251-cb74-f301-fa4a0697d21c": "ActionLogIcons/taskexecuted.png",
            "10d1d40a-80b4-6f35-f9fd-7e536decf297": "ActionLogIcons/templateapplied.png",
            "15e86d4a-1b55-01be-c9fa-660a3cb3fc26": "ActionLogIcons/emailsent.png"
        }
    },

    getNavNodeIdFromUrl: function () {
        var pathArray = window.location.pathname.toLowerCase().split('/');
        var viewPart = pathArray.indexOf('view');

        //TODO: quick hack to make this work with /Page urls.  do this better!
        if (viewPart === -1) {
            viewPart = pathArray.indexOf('page');
        }

        if (viewPart > -1) {
            return pathArray[viewPart + 1] || "";
        }
    },

    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    validateEmail: function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    isMobileDevice: function () {
        //used for side nav
        //maybe better to test for touch device
        //var check = false;
        //(function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        //return check;
        return this.isMobile();
    },

    isMobile: function () {
        if ($('html').hasClass('k-ie9')) //this check only works if you are using kendo
            return false;

        var isMobile = window.matchMedia("only screen and (max-width: 767px)"); //make sure to match media queries in variables.less
        return isMobile.matches;
    },

    isTablet: function () {
        if ($('html').hasClass('k-ie9')) //this check only works if you are using kendo
            return false;

        var isTablet = window.matchMedia("only screen and (min-width: 767px) and (min-width: 1023px)"); //make sure to match media queries in variables.less
        return isTablet.matches;
    },

    isLargeScreen: function () {
        if ($('html').hasClass('k-ie9')) //this check only works if you are using kendo
            return true;

        var isLargeScreen = window.matchMedia("only screen and (min-width: 1024px)"); //make sure to match media queries in variables.less
        return isLargeScreen.matches;
    },

    navDropdown: function () {
        var nav_this = $('.nav-dropdown');
        $('.nav-dropdown-trigger').on('click', function () {
            nav_this.toggleClass('show-nav-content');
        });

        $(document).on('click', function (e) {
            if (!nav_this.is(e.target)
                && nav_this.has(e.target).length === 0) {
                nav_this.removeClass('show-nav-content');
            }
        });
    },

    sideNavInit: function () {
        if ($('#side_nav').length) {
            var nav_timeout = 425, leftPos = 220;

            if (!app.isMobile()) {
                $('#side_nav_toggle').click(function () {
                    $('body').toggleClass('side_nav_hidden');
                    $('.nav_active').toggleClass('nav_trigger');
                });
            } else {
                var close = '<div id="close_nav_button" class="nav-close"><a class="fa fa-close"></div>';
                var drawer = '<div  id="drawer_nav_button" class="nav-drawer drawer-toggle"><a class="fa fa-plus-square"></div>';
                $('#side_nav').append(close);
                $('#side_nav').append(drawer);

                $('#side_nav_toggle').click(function () {
                    $('body').addClass('main_wrapper_offscreen');
                });

                $('#close_nav_button').click(function () {
                    $('body').removeClass('main_wrapper_offscreen pinned_sidenav');

                    $('#side_nav > ul > li').each(function () {
                        if ($(this).hasClass('mark_sidenav')) {
                            $(this).removeClass('mark_sidenav');
                        }
                    });
                });

                $('#drawer_nav_button').click(function () {
                    $('#side_nav').toggleClass('main_wrapper_offscreen');
                    $('body').addClass('overflow-hidden');
                });

                $('#side_nav').on('click', '.drawer-toggle', function () {
                    $('body').removeClass('main_wrapper_offscreen');
                    $("div.drawer").toggleClass('drawer-showmenu');
                    $(".drawermenu-menu > .drawermenu-tile:first-child > ul > li:first-child").trigger('click');
                });
            }

            var sum = 0;
            var end = false;
            $('#side_nav > ul > li').each(function () {
                if ($(this).find('.sub_panel').length) { //don't treat pinned panels as flyouts
                    $(this).addClass('nav_trigger');
                } else {
                    $(this).addClass('nav_hover');
                }

                if (app.isMobile()) {
                    sum = sum + 61; //standard height for nav
                    if ($(this).hasClass('mark_sidenav')) {

                        $(this).find('.side_inner').children().each(function () {
                            if (end) {
                                return;
                            }
                            sum = sum + 55; // for header and other excees height
                            $(this).find('li').each(function () {
                                sum = sum + $(this).height();
                                if ($(this).hasClass('subnav_active')) {
                                    end = true;
                                    return;
                                }
                            });
                        });
                        $('#side_nav > ul').animate({ scrollTop: sum < 1300 ? sum - 200 : sum }).perfectScrollbar('update');
                        return;
                    }
                }
            });

            //add scroll bars to main side nav
            var sidenav_height = $('#side_nav > ul').height() - 92;
            app.sideNavMainScrollBar();

            // adjust nav position
            var nav_side_position = app.getSideNavWidth();

            if (!app.isMobileDevice()) {

                // non-touch devices (hover)

                $('body').addClass('side_nav_hover');

                // hoverintent
                (function (e) {
                    e.fn.hoverIntent = function (t, n) {
                        var r = { sensitivity: 7, interval: 100, timeout: 0 };
                        r = e.extend(r, n ? { over: t, out: n } : t);
                        var i, s, o, u;
                        var a = function (e) {
                            i = e.pageX;
                            s = e.pageY
                        };
                        var f = function (t, n) {
                            n.hoverIntent_t = clearTimeout(n.hoverIntent_t);
                            if (Math.abs(o - i) + Math.abs(u - s) < r.sensitivity) {
                                e(n).unbind("mousemove", a);
                                n.hoverIntent_s = 1;
                                return r.over.apply(n, [t])
                            } else {
                                o = i;
                                u = s;
                                n.hoverIntent_t = setTimeout(function () { f(t, n) }, r.interval)
                            }
                        };
                        var l = function (e, t) {
                            t.hoverIntent_t = clearTimeout(t.hoverIntent_t);
                            t.hoverIntent_s = 0;
                            return r.out.apply(t, [e])
                        };
                        var c = function (t) {
                            var n = jQuery.extend({}, t);
                            var i = this;
                            if (i.hoverIntent_t) {
                                i.hoverIntent_t = clearTimeout(i.hoverIntent_t)
                            }
                            if (t.type == "mouseenter") {
                                o = n.pageX;
                                u = n.pageY;
                                e(i).bind("mousemove", a);
                                if (i.hoverIntent_s != 1) {
                                    i.hoverIntent_t = setTimeout(function () { f(n, i) }, r.interval)
                                }
                            } else {
                                e(i).unbind("mousemove", a);
                                if (i.hoverIntent_s == 1) {
                                    i.hoverIntent_t = setTimeout(function () { l(n, i) }, r.timeout)
                                }
                            }
                        };
                        return this.bind("mouseenter", c).bind("mouseleave", c)
                    }
                })(jQuery);

                $('#side_nav .nav_trigger').hoverIntent({
                    over: function () {
                        var $this = $(this);
                        if (!$this.hasClass('nav_active') || $(window).width() <= 992) {
                            $this.addClass('nav_open');
                            $this.find('.sub_panel').stop(true, true).animate({ left: nav_side_position }, nav_timeout, 'easeInOutExpo', function () {
                                app.sideNavSubScrollBar('nav_open');
                            });
                        }
                    },
                    out: function () {
                        var $this = $(this);
                        if (!$this.hasClass('nav_active') || $(window).width() <= 992) {
                            $this.removeClass('nav_open');
                            $this.find('.sub_panel').stop(true, true).animate({ left: -leftPos }, nav_timeout, 'easeInOutExpo');
                        }
                    },
                    interval: 50,
                    timeout: 50
                }).children('a').click(function (e) {
                    e.preventDefault();
                });

            } else {
                // touch devices
                $('body').addClass('side_nav_click');

                $("#side_nav .nav_trigger > a").kendoTouch({
                    tap: function (e) {
                        e.preventDefault();

                        var $this = $(e.sender.element[0]), $this_parent = $this.closest('.nav_trigger');

                        if ($this_parent.hasClass('nav_open')) {
                            $this_parent.removeClass('nav_open').find('.sub_panel').hide();
                        } else {
                            $('#side_nav .nav_trigger').removeClass('nav_open').find('.sub_panel').hide();
                            $this_parent.addClass('nav_open').find('.sub_panel').show();
                        }
                    }
                });
                // act like a hover for mobile.
                $("#side_nav > ul > li > a").kendoTouch({
                    minHold: 100,
                    hold: function (e) {
                        var $this = $(e.sender.element[0]);
                        var $this_parent = $this.parent().parent();

                        $this_parent.children('li').each(function () {
                            $(this).removeClass('nav_hold_mobile');
                        });

                        $this.parent().addClass('nav_hold_mobile');
                    }
                });
            }

            //lets add scroll for pinned sub nav
            if ($('body').hasClass('pinned_subnav')) {
                app.sideNavSubScrollBar('nav_active');
            }

        }

        // update main navigation position on window resize/orientation change
        $(window).on("resize", function (event) {
            nav_side_position = app.getSideNavWidth();
            app.sideNavMainScrollBar(sidenav_height);
        });
    },

    getSideNavWidth: function () {
        var full_nav_width = ($('#body').hasClass('TRK')) ? '90' : '80';
        var narrow_nav_width = '50';
        return ($('body').hasClass('side_nav_narrow') || $(window).width() <= 992 || $('body').hasClass('pinned_subnav'))
            ? narrow_nav_width
            : full_nav_width;
    },

    sideNavMainScrollBar: function () { //this is for scroll bars on the first level of the nav
        if ($('body').hasClass('active-announcements')) {
            var mainpanel_height = $('#side_nav').height() - 131 //drawer + header height + announcements + a little extra
        } else {
            var mainpanel_height = $('#side_nav').height() - 91; //drawer + header height + a little extra
        }

        // side menu scroll bar
        if (!$('#side_nav > ul').hasClass('ps-ready')) {
            $('#side_nav > ul').addClass('ps-ready').perfectScrollbar({
                wheelSpeed: 100,
                suppressScrollX: true,
                scrollYMarginOffset: 10
            });
            // $('#side_nav > ul').animate({ scrollTop: 500 }).perfectScrollbar('update');
        } else {
            $('#side_nav > ul').perfectScrollbar('update');
        }
    },

    sideNavSubScrollBar: function (cls) { //this is for scrollbars on the fly out
        if ($('body').hasClass('active-announcements')) {
            var subpanel_height = $('.' + cls + ' .sub_panel').height() - 140 //drawer + header height + announcements + a little extra
        } else {
            var subpanel_height = $('.' + cls + ' .sub_panel').height() - 100; //drawer + header height + a little extra
        }

        // side menu scroll bar
        if (!$('.' + cls + ' .side_inner').hasClass('ps-ready')) {
            $('.' + cls + ' .side_inner').addClass('ps-ready').height(subpanel_height).perfectScrollbar({
                wheelSpeed: 100,
                suppressScrollX: true,
                scrollYMarginOffset: 10
            });
        } else {
            $('.' + cls + ' .ps-ready').height(subpanel_height).animate({ scrollTop: 0 }).perfectScrollbar('update');
        }
    },

    sideNavAccInit: function () {
        if ($('#side_nav_acc_wrapper').length) {

            var $accordion_nav = $('#side_nav_acc');

            $('#side_nav_acc_wrapper > ul').wrap('<div id="side_nav_acc" />');
            $('header .navbar-header').before('<div id="side_nav_acc_toggle"><span class="fa fa-bars"></span></div>');

            // show/hide accordion navigation
            $('#side_nav_acc_toggle').click(function () {
                // $('body').toggleClass('side_nav_accordion_hidden');
                $('body').toggleClass('side_nav_accordion_display');
            })

            // check for sections
            $('#side_nav_acc > ul > li').each(function () {
                if ($(this).children('.sub_panel').length) {
                    $(this).addClass('nav_trigger');
                }
            });

            // get nav_trigger top position
            $(this).children('.sub_panel').css('display', 'none');
            $('.nav_trigger').each(function () {
                var el_pos_top = $(this).position().top;
                $(this).data("nav_pos_top", el_pos_top);
            });
            $(this).children('.sub_panel').css('display', '');

            // set accordion height
            $('#side_nav_acc').height($('#side_nav_acc_wrapper').height() - 92); //drawer + header height

            // show section
            $('.nav_trigger > a').click(function (e) {
                e.preventDefault();

                var $this = $(this),
                    $this_parent = $this.parent('.nav_trigger'),
                    panel_active = $this_parent.hasClass('sub_panel_active'),
                    el_pos = '0';

                $('.sub_panel_active').children('.sub_panel').slideUp(400, function () {
                    $(this).parent('.nav_trigger').removeClass('sub_panel_active');
                });

                if (!panel_active) {
                    $this.next('.sub_panel').slideDown(400, function () {
                        $this_parent.addClass('sub_panel_active');
                        if ($('#side_nav_acc').height() > $('#side_nav_acc > ul').height()) {
                            var el_pos = 0;
                        } else {
                            var el_pos = $this_parent.data("nav_pos_top");
                        }
                        app.sideNavAccScrollBar(el_pos);
                    });
                } else {
                    app.sideNavAccScrollBar(el_pos);
                }

            })

            // update accordion scroolbar on window resize/orientation change
            $(window).on("debouncedresize", function (event) {
                // set accordion height
                $('#side_nav_acc').height($('#side_nav_acc_wrapper').height() - 42);

                if ($('.sub_panel_active').length) {
                    var el_pos = $('.sub_panel_active').data("nav_pos_top");
                } else {
                    var el_pos = '0';
                }
                app.sideNavAccScrollBar(el_pos);
            });
        }
    },

    sideNavAccScrollBar: function (el_pos) {
        // scroll to section
        app.isMobileDevice() ? $('#side_nav_acc').animate({ scrollTop: 0 }) : $('#side_nav_acc').animate({ scrollTop: el_pos });

        if (!$('#side_nav_acc').hasClass('ps-container')) {
            $('#side_nav_acc').perfectScrollbar({
                wheelSpeed: 100,
                suppressScrollX: true,
                scrollYMarginOffset: 10
            });
        } else {
            $('#side_nav_acc').perfectScrollbar('update');
        }

    },

    headerSearchWorkItem: function (searchSource) {
        var inputName = searchSource === 'mobile' ? 'searchTextMobile' : 'searchText';
        var searchText = encodeURIComponent($("input[name=" + inputName + "]").val());
        var searchType = $("input[name=search_param]").val().replace(/\s+/g, " ");;
        var searchWorkItems = function () {
            $.ajax({
                type: "GET",
                url: "/Search/GetSearchObjectByWorkItemID",
                data: { searchText: searchText },
                success: function (result) {
                    if (result.search('loginForm') < 0) { // Logged out check                   
                        location.href = result;
                    } else {
                        //session expired
                        window.location = "/Login/Login?ReturnUrl=" + window.location.pathname;
                    }
                }
            });
        };

        switch (searchType) {
            case "KnowledgeBase":
                window.location = "/KnowledgeBase/Listing#/search/" + searchText + "//";
                break;
            case "ServiceCatalog":
                window.location = (searchText != "") ? "/ServiceCatalog/Listing#/Search/searchText=" + searchText + "&searchType=Search%2520All" : "/ServiceCatalog/Listing";
                break;
            case "WorkItem":
                searchWorkItems();
                break;
            default:
                if (session.user.Analyst) {
                    searchWorkItems();
                } else {
                    window.location = (searchText != "") ? "/ServiceCatalog/Listing#/Search/searchText=" + searchText + "&searchType=Search%2520All" : "/ServiceCatalog/Listing";
                }
                break;
        }
    },

    headerSeachInit: function () {
        app.headerSearchSetType();
        $("input[name=searchText]").keypress(function (event) {
            if (event.keyCode == 13) {
                app.headerSearchWorkItem();
            }
        });
    },

    headerSearchSetType: function () {
        var currentURL = window.location.href;
        var searchParam = $("input[name=search_param]"); //the hidden field which holds the search type id
        var searchConcept = $("span[id=search_concept]"); //the span field which displays the search type value
        var searchInput = $("input[name=searchText]");

        //service catalog
        if ((currentURL.indexOf("ServiceCatalog") > -1) ||
            (currentURL.indexOf("94ecd540-714b-49dc-82d1-0b34bf11888f") > -1) ||
            (currentURL.indexOf("02efdc70-55c7-4ba8-9804-ca01631c1a54") > -1)) {
            searchParam.val("ServiceCatalog");
            searchConcept.html(localization.ServiceCatalog);
            searchInput.attr('placeholder', localization.SearchServiceCatalog);
        }
        //knowledge base
        else if ((currentURL.indexOf("KnowledgeBase") > -1) || (currentURL.indexOf("0aef4765-0efa-4a65-84c1-324b09231223") > -1)) {
            searchParam.val("KnowledgeBase");
            searchConcept.html(localization.KnowledgeBase);
            searchInput.attr('placeholder', localization.SearchKnowledgeBase);
        }
        //default to work item if analyst
        else if (session.user.Analyst) {
            searchParam.val("WorkItem");
            searchConcept.html(localization.WorkItem);
            searchInput.attr('placeholder', localization.SearchWorkItem);
        }
        //default to Service Catalog if not an analyst and we are down here
        else {
            searchParam.val("ServiceCatalog");
            searchConcept.html(localization.ServiceCatalog);
            searchInput.attr('placeholder', localization.SearchServiceCatalog);
        }
    },

    storage: {
        nodes: null,
        gridStates: null,
        viewPanels: null,
        sessionTimer: null,
        activityDiagram: null,
        globalSearch: null
    },

    initStorageNamespaces: function () {
        app.storage.nodes = store.namespace('nodes');
        app.storage.viewPanels = store.namespace('viewPanels');
        app.storage.gridStates = store.namespace('gridStates');
        app.storage.sessionTimer = store.namespace('sessionTimer');
        app.storage.activityDiagram = store.namespace('activityDiagram');
        app.storage.globalSearch = store.namespace('globalSearch');
    },

    initSessionStorage: function () {
        //check to see if we need to pull data
        if (this.isSessionStored()) {
            app.events.publish('sessionStorageReady');
            return;
        } else {
            app.populateSessionStorage();
        }
    },

    isSessionStored: function () {
        //checks to see if the storage namespaces have at least 1 value and that the value is 'all'
        var stored = true;

        //some race condifitons cause storage and nodes to be undefined
        //return false and let the bus handle it 
        if (app.lib.isDefined(app.storage) && app.lib.isDefined(app.storage.nodes) && app.lib.isDefined(app.storage.viewPanels)) {
            if (app.storage.nodes.session.keys() <= 0 && !app.storage.nodes.session.has('all')) {
                stored = false;
            }

            if (app.storage.viewPanels.session.keys() <= 0 && !app.storage.viewPanels.session.has('all')) {
                stored = false;
            }
        } else {
            stored = false;
        }

        return stored;

    },

    populateSessionStorage: function () {
        //repopulates navnode and then viewPanel data
        $.ajax({
            type: 'POST',
            url: '/Home/NavigationNodes',
            success: function (nodes) {
                //store nodes
                app.storage.nodes.session.clear();
                app.storage.nodes.session.set('all', nodes);

                //get viewpanels guids from the nodes
                var vpGuids = extractViewPanelGuids(nodes);

                $.ajax({
                    type: 'POST',
                    url: '/Home/ViewPanels/',
                    data: { ids: vpGuids },
                    success: function (panels) {
                        app.storage.viewPanels.session.clear();
                        app.storage.viewPanels.session.set('all', panels);
                        app.events.publish('sessionStorageReady');
                    },
                    dataType: 'json',
                    traditional: true
                });
            },
            dataType: 'json'
        });

        function extractViewPanelGuids(nodes) {
            var guids = [];

            _.each(nodes, function (node) { getViewPanelGuids(node); });

            function getViewPanelGuids(node) {
                if (!_.isNull(node.Definition) && !_.isUndefined(node.Definition.view)) {

                    var viewDef = node.Definition.view;

                    //check if it is semantic structure or v1 structure
                    if (node.Definition.layoutType === 'semantic') {
                        /*
                         * Semantic defs always start with 'content' as the root property, which can be an array of objs or a single obj
                         * If nested objects have a 'content' property then there should NOT be a 'ViewPanelId' property as well.
                         * The structure definition requires that each nested content object will have either: 
                         *      'content' property to define additional nested content
                         *                              ---OR---
                         *      'ViewPanelId' to indicate the object is a viewpanel.
                         * Nested objects with both 'content' and 'ViewPanelId' will ignore the 'ViewPanelId' property and process 'content'.
                         */


                        //calls processContentObject and passes current node if it is plain object, OR passes each array obj if it is an array 
                        function recurseSemanticStructure(currentContentNode) {
                            switch (true) {
                                case _.isArray(currentContentNode): //note: check for array first since arrays are objects too
                                    _.each(currentContentNode, function (contentItem) {
                                        processContentObject(contentItem);
                                    });
                                    break;
                                case _.isObject(currentContentNode):
                                    processContentObject(currentContentNode);
                                    break;
                                default:
                            };
                        };

                        //checks if there are more nested .content props, if none then adds ViewPanelId to guids array
                        function processContentObject(contentObj) {
                            if (_.has(contentObj, "content")) {
                                //has nested content so recurse that property
                                recurseSemanticStructure(contentObj.content);
                            } else if (_.has(contentObj, "ViewPanelId")) {
                                //no nested .content found, take the .ViewPanelId and add it to the array
                                guids.push(contentObj.ViewPanelId);
                            }
                        };


                        recurseSemanticStructure(viewDef.content);
                    } else {
                        //ViewPanelId is optional in header
                        if (viewDef.header.ViewPanelId) {
                            guids.push(viewDef.header.ViewPanelId);
                        };

                        //assumes node is proper structure, per the docs: body: { content: { rows: [ {} ] } }
                        _.each(viewDef.body.content.rows, function (row) {
                            _.each(row.columns, function (col) {
                                if (col) {
                                    guids.push(col.ViewPanelId);
                                }
                            });
                        });
                    }
                }

                _.each(node.Children, function (child) {
                    getViewPanelGuids(child);
                });
            };

            return guids;
        };
    },

    clearNodeStorage: function () {
        app.storage.nodes.session.clear();
    },

    clearViewPanelStorage: function () {
        app.storage.viewPanels.session.clear();
    },

    clearNodeAndViewPanelStorage: function () {
        this.clearNodeStorage();
        this.clearViewPanelStorage();
    },

    clearAllLocalStorage: function () {
        localStorage.clear();
        this.clearNodeStorage();
        this.clearViewPanelStorage();
    },

    setMomentLocale: function () {
        if (session.user.Preferences
            && session.user.Preferences.Culture
            && session.user.Preferences.Culture.IetfLanguageTag) {
            moment.locale(session.user.Preferences.Culture.IetfLanguageTag);
        } else {
            moment.locale('en');
        }
    },

    initHeader: function () {
        //This will going to create drawer for header search and user menu
        if (app.isMobileDevice()) {
            app.lib.makeDrawer("top", $(".small_search_drawer"), $(".small_search"));
            app.lib.makeDrawer("top", $(".user_menu_drawer"), $(".mobile-user-menu"), true);

            //Need to put under document.ready so that the side nav will be ready before doing the binding
            //START: This will be used for mobile to hide/show header when scrolling up and down
            var viewModel = kendo.observable({});
            kendo.bind($("header"), viewModel);
            //END: This will be used for mobile to hide/show header when scrolling up and down
        }
    },
    sessionTimeout: {
        countdownTime: 0,
        popupTimeInterval: 0,
        countDownTimer: 0,
        popupWindow: null,
        isSessionExpired: false,
        updateCountDown: function () {
            var min = Math.floor(app.sessionTimeout.countdownTime / 60);
            var sec = app.sessionTimeout.countdownTime % 60;
            if (sec < 10)
                sec = "0" + sec;

            //display countdown values on popup window
            $(".session-countdown-holder").html(min + ":" + sec);

            if (app.sessionTimeout.countdownTime > 0) {
                app.sessionTimeout.countdownTime--;
                app.sessionTimeout.countDownTimer = window.setTimeout(app.sessionTimeout.updateCountDown, 1000);

                //display "Sesssion Expiring" text
                $(".session-expiring-content").show();
                $(".session-expired-content").hide();
            } else {
                //kill the session 
                $.ajax({
                    type: 'POST',
                    url: '/Login/KillSession/',
                    dataType: 'json',
                    traditional: true
                });

                //tag session as expired
                app.sessionTimeout.isSessionExpired = true;

                //display "Sesssion Expired" text
                $(".session-expiring-content").hide();
                $(".session-expired-content").show();
            }
        },
        showWarningPopup: function () {
            //display countdown dialog
            if (!_.isNull(app.sessionTimeout.popupWindow)) {
                if (app.isMobile()) {
                    app.sessionTimeout.popupWindow.open();
                } else {
                    app.sessionTimeout.popupWindow.center().open();
                }
            };
            app.lib.mask.apply();

            //display countdown value
            app.sessionTimeout.updateCountDown();

            //turn on flasshing tab
            pageTitleNotification.on(localization.SessionExpired);
        },
        sendKeepAlive: function () {
            if (app.sessionTimeout.isSessionExpired) {
                location.reload();
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/Login/RenewSession/',
                    data: { 'renew': 'true' },
                    dataType: 'json',
                    traditional: true,
                    async: false	
                });
                app.sessionTimeout.hideWarningPopup();
            }
        },
        getTimeOutPopup: function () {
            var window = $(".session-notification");
            window.kendoWindow({
                maxWidth: "600px",
                title: localization.SessionTimeoutWaring,
                visible: false,
                actions: {}
            });
            return window.data("kendoWindow");
        },
        hideWarningPopup: function () {
            //stop countdown 
            window.clearTimeout(app.sessionTimeout.countDownTimer);

            //close warning dialog
            if (!_.isNull(app.sessionTimeout.popupWindow)) {
                app.sessionTimeout.popupWindow.close();
            };

            app.lib.mask.remove();

            //turn off flashing tab
            pageTitleNotification.off();

            //restart idle time check
            app.sessionTimeout.renewSession();
        },
        checkIdleTimeout: function () {

            var isPopupWindowOpen = $(".session-notification").is(":visible");
            var timeNow = $.now();

            //calculate the time (in milliseconds) at which the session timer popup must be displayed. 
            //calculated as the last activity time(stored at localstorage) plus the countdown time limit as specified on console settings 
            var warningTime = (app.storage.sessionTimer.get('LastActivityTime') + (1000 * ((session.sessionStateTimeout * 60) - session.consoleSetting.SessionTimerCountdown)));

            if (timeNow > warningTime) {
                //display warning popup if not yet displayed.
                if (isPopupWindowOpen !== true) {
                    app.sessionTimeout.showWarningPopup();
                }
            } else {
                //page is still active, hide warning popup if opened.    
                if (isPopupWindowOpen === true) {
                    app.sessionTimeout.hideWarningPopup();
                }
            }
        },
        renewSession: function () {
            clearInterval(app.sessionTimeout.popupTimeInterval);

            //set default values
            app.sessionTimeout.popupWindow = app.sessionTimeout.getTimeOutPopup();
            app.sessionTimeout.countdownTime = session.consoleSetting.SessionTimerCountdown;


            //store last active time to localstorage
            app.storage.sessionTimer.set('LastActivityTime', $.now());

            //start checking for idle timeout
            app.sessionTimeout.popupTimeInterval = setInterval(app.sessionTimeout.checkIdleTimeout, 1000);

            

        }
    },
    isRTL: function () {
        return $("html").attr("dir") == "rtl";
    },
    slideOutNav: {
        initScript: function (url, callback) {
            $.getScript(url)
                .done(callback)
                .fail(function (jqxhr, settings, exception) {
                    console.log(exception);
                });
        },
        show: function (options) {
            app.slideOutNav.initScript("../../../Scripts/libs/angular/angular.min.js", function () {
                angular.module("notification", []);
                var element = $('#slideout_container_div');
                var isInitialized = element.injector();
                if (!isInitialized)
                    angular.bootstrap(element, ['notification']);
                _.defer(function () {
                    //options
                    var id = options.id;
                    var targetEntity = options.targetEntity;
                    var isSubFlyout = options.isSubFlyout;
                    var tooltip = options.tooltip;
                    var url = options.url;

                    //declaration
                    var iframe = document.getElementById(!isSubFlyout ? 'iframe__slideout__main' : 'iframe__slideout__main_sub');
                    var hideId = !isSubFlyout ? '#slideout__content__trigger__hide' : '#slideout__content__trigger__hide_sub';
                    var showId = !isSubFlyout ? '#slideout__content__trigger_show' : '#slideout__content__trigger_show_sub';
                    var flyoutMainId = '#template-default-cmp-main-flyout';
                    var flyoutSubId = '#template-default-cmp-sub-flyout';
                    var flyoutFormId = '#template-default-cmp-form-flyout';
                    var src = '/platform/app/iframe';
                    var entity = '/' + targetEntity + '/';
                    var srcEntity = src + entity + id;


                    var triggerStateMessage = function () {
                        var stateMessage = {
                            setPlatformState: {
                                pagedefinition: 'IFrame',
                                entityset: targetEntity,
                                entityid: id
                            }
                        };


                        if (!_.isUndefined(url)) {
                            iframe.src = url;
                            return;
                        }

                        //only if this will access via smp.
                        var baseURL = session.consoleSetting.TrueControlCenterURL;
                        var src = srcEntity;

                        if (baseURL.indexOf(window.location.hostname) < 0) src = baseURL + src;

                        if (iframe.src.indexOf(src) > -1)
                            iframe.contentWindow.postMessage(stateMessage, '*');
                        else
                            iframe.src = src;
                    };
                    //set default
                    angular.element(document.querySelector(showId)).click();
                    angular.element(document.querySelector("#slideout__content__trigger__switch_main_false")).click();
                    angular.element(document.querySelector("#slideout__content__trigger__switch_sub_false")).click();
                    angular.element(document.querySelector("slideout__content__trigger__switch_form_false")).click();
                    angular.element(document.querySelector("#slideout__content__trigger_not_modal")).click();
                    angular.element(document.querySelector("#slideout__content__trigger_form_inactive")).click();

                    $(flyoutSubId).find('div.slideout-nav__content__main--full').attr('style', 'padding-top:0;width:auto');

                    if (isSubFlyout) {
                        if (iframe.src !== "" && iframe.src.indexOf(targetEntity) <= -1) {
                            iframe = document.getElementById('iframe__slideout__main');
                            angular.element(document.querySelector("#slideout__content__trigger__switch_main_true")).click();
                            angular.element(document.querySelector("#slideout__content__trigger__switch_sub_false")).click();
                            angular.element(document.querySelector("#slideout__content__trigger_show")).click();
                        } else {
                            $(flyoutMainId).find('div.slideout-nav__content__switch__button__tooltip__content').html(tooltip);
                            $(flyoutFormId).find('div.slideout-nav__content__switch__button__tooltip__content_sub').html(tooltip);
                            angular.element(document.querySelector("#slideout__content__trigger__switch_sub_true")).click();
                        }
                    } else {
                        $(flyoutSubId).find('div.slideout-nav__content__switch__button__tooltip__content').html(tooltip);
                        $(flyoutFormId).find('div.slideout-nav__content__switch__button__tooltip__content_main').html(tooltip);
                    }

                    setTimeout(triggerStateMessage, 500);

                    //listener to close button event
                    window.addEventListener("message", function (e) {
                        if (e.data === "closeCC") {
                            app.slideOutNav.close(isSubFlyout);
                        }
                        if (e.data.rmOptions !== undefined) {
                            app.slideOutNav.show(e.data.rmOptions);
                        }
                        if (e.data.formOptions !== undefined) {
                            app.slideOutNav.showByUrl(e.data.formOptions);
                        }
                    }, false);
                });
            });
        },
        showByUrl: function (options) {
            var path = options.path;
            var tooltip = options.tooltip;
            var width = options.width;
            var iframe = document.getElementById('iframe__slideout__main_form');
            var showId = '#slideout__content__trigger_show_form';
            var flyoutMainId = '#template-default-cmp-main-flyout';
            var flyoutSubId = '#template-default-cmp-sub-flyout';
            var flyoutFormId = '#template-default-cmp-form-flyout';

            if (!_.isUndefined(width)) {
                flyoutFormId = '#template-default-cmp-modal_flyout';
                iframe = document.getElementById('iframe__slideout__main_modal');
                angular.element(document.querySelector("#slideout__content__trigger_modal")).click();
                app.slideOutNav.showModal();
            } else {
                $(flyoutMainId).find('div.slideout-nav__content__switch__button__tooltip__content_form').html(tooltip);
                $(flyoutSubId).find('div.slideout-nav__content__switch__button__tooltip__content_form').html(tooltip);

                angular.element(document.querySelector(showId)).click();
                angular.element(document.querySelector("#slideout__content__trigger_modal_hide")).click();
                angular.element(document.querySelector("#slideout__content__trigger_show_form")).click();

                app.slideOutNav.formSwitch("form");
            }

            var style = 'padding-top:35px;';
            if (width) style = style + 'width:' + width + 'px !important';
            else style = style + 'width:auto';

            $(flyoutFormId).find('div.slideout-nav__content__main--full').attr('style', style);

            if (iframe.src.indexOf(path) > -1)
                return;

            //only if this will access via smp.
            var baseURL = session.consoleSetting.TrueControlCenterURL;
            var src = path;

            if (baseURL.indexOf(window.location.hostname) < 0) src = baseURL + src;


            iframe.src = src;
        },
        close: function (sub) {
            var hideId = !sub ? '#slideout__content__trigger__hide' : '#slideout__content__trigger__hide_sub';
            var mainBack = $('#template-default-cmp-main-flyout > div').hasClass('display-slideout-nav-content--back');
            var subBack = $('#template-default-cmp-sub-flyout > div').hasClass('display-slideout-nav-content--back');
            var formBack = $('#template-default-cmp-form-flyout > div').hasClass('display-slideout-nav-content--back');

            if (!mainBack && !subBack) {
                angular.element(document.querySelector(hideId)).click();
            } else {
                if (mainBack)
                    angular.element(document.querySelector('#slideout__content__trigger__hide_sub')).click();

                if (subBack)
                    angular.element(document.querySelector('#slideout__content__trigger__hide')).click();
            }
            if (formBack) angular.element(document.querySelector("#slideout__content__trigger__switch_form_true")).click();
        },
        hide: function () {
            app.slideOutNav.hideForm();
        },
        hideForm: function () {
            angular.element(document.querySelector("#slideout__content__trigger_hide_form")).click();
            var mainBack = $('#template-default-cmp-main-flyout > div').hasClass('display-slideout-nav-content--back');
            var subBack = $('#template-default-cmp-sub-flyout > div').hasClass('display-slideout-nav-content--back');

            if (mainBack && subBack) {
                angular.element(document.querySelector('#slideout__content__trigger__switch_sub_true')).click();
            } else {
                angular.element(document.querySelector('#slideout__content__trigger__switch_main_true')).click();
            }
        },
        switch: function (sub) {
            var switchMainId = "#slideout__content__trigger__switch_main";
            var switchSubId = "#slideout__content__trigger__switch_sub";

            if (sub) {
                angular.element(document.querySelector(switchSubId + "_false")).click();
                angular.element(document.querySelector(switchMainId + "_true")).click();
            }
            else {
                angular.element(document.querySelector(switchMainId + "_false")).click();
                angular.element(document.querySelector(switchSubId + "_true")).click();
            }
            angular.element(document.querySelector("#slideout__content__trigger__switch_form_false")).click();
        },
        formSwitch: function (switchType) {
            var switchMainId = "#slideout__content__trigger__switch_main";
            var switchSubId = "#slideout__content__trigger__switch_sub";
            var switchFormId = "#slideout__content__trigger__switch_form";

            switch (switchType) {
                case "main":
                    angular.element(document.querySelector(switchMainId + "_true")).click();
                    angular.element(document.querySelector(switchSubId + "_false")).click();
                    angular.element(document.querySelector(switchFormId + "_false")).click();
                    break;
                case "sub":
                    angular.element(document.querySelector(switchMainId + "_false")).click();
                    angular.element(document.querySelector(switchSubId + "_true")).click();
                    angular.element(document.querySelector(switchFormId + "_false")).click();
                    break;
                case "form":
                    angular.element(document.querySelector(switchMainId + "_false")).click();
                    angular.element(document.querySelector(switchSubId + "_false")).click();
                    angular.element(document.querySelector(switchFormId + "_true")).click();
                    break;
            }
        },
        showModal: function () {
            angular.element(document.querySelector("#slideout__content__trigger_modal_show")).click();
        },
        hideModal: function () {
            angular.element(document.querySelector("#slideout__content__trigger_modal_hide")).click();
        },
        getObjectById: function (baseId) {
            return $.ajax({
                type: "GET",
                async: false,
                url: "/Search/GetObjectById",
                data: { id: baseId }
            });
        },
        getTCCSourceURL: function (obj, type) {
            var baseURL = session.consoleSetting.TrueControlCenterURL;
            var sourceURL = baseURL;
            var externCheckURL = "/themes/default/pagenavigation/ExternalLinkingHelper.behavior.html";
            /*check if this page (as in externCheckURL) is accessible on remote support site
                true: use the new '/app/extern/' path that implements deep linking to Users & Devices
                false: use the '/app/iframe/' to look up for users and devices
            */
            $.ajax({
                type: "GET",
                async: false,
                url: baseURL + externCheckURL,
                success: function (data) {
                    switch (type) {
                        case "computer":
                            var dnsName = obj.DNSName;
                            var netbiosName = obj.NetbiosComputerName;
                            //look up for DNSName or NetbiosComputerName when not provided
                            if (_.isUndefined(dnsName) || _.isUndefined(netbiosName)) {
                                app.slideOutNav.getObjectById(obj.BaseId).done(function (foundObj) {
                                    dnsName = (!_.isUndefined(foundObj)) ? foundObj.DNSName : "";
                                    netbiosName = (!_.isUndefined(foundObj)) ? foundObj.NetbiosComputerName : "";
                                });
                            }
                            var dnsNameParam = {
                                "page": "iframe",
                                "entityset": "CmDevice",
                                "entityfilter": "it.NetbiosName=='" + netbiosName + "' || it.DNSName == '" + dnsName + "'",
                                "entityDisplay": {
                                    "metadata": [
                                        "get_CmComputerSystems.Manufacturer",
                                        "get_CmComputerSystems.Model",
                                        "get_CmSystemEnclosure.SerialNumber"
                                    ]
                                },
                                
                            };
                            sourceURL = baseURL + "/app/extern//?tab=" + JSON.stringify(dnsNameParam);
                            break;
                        case "user":
                            var userSID = obj.SID;
                            if (_.isUndefined(userSID)) {
                                app.slideOutNav.getObjectById(obj.BaseId).done(function (foundObj) {
                                    userSID = (!_.isUndefined(foundObj)) ? foundObj.SID : "";
                                });
                            }

                            var sidParam = {
                                "page": "iframe",
                                "entityset": "CmUser",
                                "entityfilter": "it.Sid=='" + userSID + "'",
                                "entityDisplay": {
                                    "metadata": ["UniqueUserName", "FullUserName", "Mail"]
                                }
                            };
                            sourceURL = baseURL + "/app/extern//?tab=" + JSON.stringify(sidParam);
                            break;
                        default:
                            break;
                    }
                },
                error: function (data) {
                    switch (type) {
                        case "computer":
                            var dnsName = obj.DNSName;
                            //look up for DNSName when not provided
                            if (_.isUndefined(dnsName)) {
                                app.slideOutNav.getObjectById(obj.BaseId).done(function (foundObj) {
                                    dnsName = (!_.isUndefined(foundObj)) ? foundObj.DNSName : "";
                                });
                            }
                            var dnsNameParam = "/platform/app/iframe/TCC_U_002_ComputerLookup/DnsName:'" + dnsName + "'";
                            sourceURL = baseURL + dnsNameParam;
                            break;
                        case "user":
                            var userSID = obj.SID;
                            if (_.isUndefined(userSID)) {
                                app.slideOutNav.getObjectById(obj.BaseId).done(function (foundObj) {
                                    userSID = (!_.isUndefined(foundObj)) ? foundObj.SID : "";
                                });
                            }

                            var sidParam = "/platform/app/iframe/UserLookup/SID:'" + userSID + "'";
                            sourceURL = baseURL + sidParam;
                            break;
                        default:
                            break;
                    }
                },
            });
            
            if (pageForm.newWI) {
                return sourceURL;
            }
            else {
                return (sourceURL + "&trackid=" + pageForm.viewModel.Id + "&referrer=" + location.host);
            }
        }
    },
    platformSettings:  {
        getSettings: function (key, callback) {
            var result = { Key: "", Value: "", Description: "Global search disable or enabled end user for end user", SetByName: "PlatformCache" };
             $.ajax({
                 url: "/platform/api/SystemSetting?$filter=Key eq '" + key + "'",
                type: 'GET',
                dataType: "json",
                cache: false, // do not cache to fix feature slider retaining value in ie
                 contentType: "application/json",
                 //async: true, //use synchronous ajax to fix delay issue on ie and firefox (BUG 21477)
                 success: function (data) {
                     if (data.value.length > 0) {
                         result = data.value[0];
                     }

                     if (!_.isUndefined(callback)) {
                         callback(result);
                     }
                 }
             });
            return result;
        },
        update: function (key, value) {
            var url = '/platform/api/SystemSetting';
            var type = "POST";
            var setting;
            app.platformSettings.getSettings(key, function (setRes) {
                setting = setRes;
                if (setting.Key == "") { //This will add new settings key
                    setting.Key = key;
                    setting.Value = value.toString();

                }
                else { //This will update the existing settings
                    setting.Value = value;
                    setting.Description = value.toString();
                    url += "(" + setting.Id + ")";
                    type = "PUT";
                }


                var dataString = JSON.stringify(setting);
                return $.ajax({
                    url: url,
                    data: dataString,
                    type: type,
                    dataType: "json",
                    contentType: "application/json",
                    async: false,
                    error: function (err) {
                        console.log("platformSettings update:", err);
                    }
                });
            });
        },
    },
    featureSet: {
        getList: function () {
            app.featureSet.resetCache();
            var isAsync = app.isIE() ? false : true;
            
            return $.ajax({
                url: '/platform/api/GetAvailableFeatureSets',
                type: 'GET',
                dataType: "json",
                cache: false, // do not cache to fix feature slider retaining value in ie
                contentType: "application/json",
                async: isAsync
            });

        },
        initList: function () {
            app.featureSet.setClassNamesToElement($(body), app.featureSet.getClassNames());
            app.featureSet.evalFeatureSet();
        },
        update: function (featureName, isActive) {
            if (!session.user.IsAdmin) {
                throw ("Error: You need an admin account to use this method.")
            }

            var dataString = JSON.stringify({ "FeatureSetName": featureName, "Active": isActive });
            console.log("datastring", dataString)
            return $.ajax({
                url: '/platform/api/SetFeatureSetState',
                data: dataString,
                type: 'POST',
                dataType: "json",
                contentType: "application/json",
                async: false
            });
        },
        resetCache: function () {
            $.get('/features/ResetCache');
        },
        isActive: function (name) {
            var isActive = false;
            if (session.features.hasOwnProperty(name) && session.features[name]) {
                isActive = session.features[name];
            }
            return isActive;
        },
        setClassNamesToElement:function(ele, classnames) {
            ele.addClass(classnames);
        },
        getClassNames: function() {
            var feature_classnames = _.map(session.features,
                function (el) {
                    var classname = el.Name;
                    if (el.Active)
                        classname += "_active";
                    else
                        classname += "_not_active";

                    return classname;
                });

            return feature_classnames.join(" ");
        },
        evalFeatureSet: function () {
            $("[feature-set]").each(function () {
                var elem = $(this)[0];
                var featureName = elem.getAttribute('feature-set');
                if (!app.featureSet.isActive(featureName)) {
                    $(elem).remove();
                }
            });
        }
    },
    productMetrics: {
        set: function () {
            if (session.consoleSetting.DisableProductMetrics) {
                var headerScripts = document.getElementsByTagName("script")
                for (var i = headerScripts.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
                    if (headerScripts[i] && headerScripts[i].getAttribute("src") != null && headerScripts[i].getAttribute("src").indexOf("app.productMetrics.js") != -1)
                        headerScripts[i].parentNode.removeChild(headerScripts[i]) //remove element by calling parentNode.removeChild()
                }
            }
        }
    },
    teamsIntegration: {
        loadMSGraphScript: function () {
            var result = $.Deferred();
            var script = document.createElement("script");
            script.async = "async";
            script.type = "text/javascript";
            script.src = "/TeamsIntegration/Scripts/ms-graph.min.js";
            script.onload = script.onreadystatechange = function (_, isAbort) {
                if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                    if (isAbort) {
                        result.reject();
                    } else {
                        result.resolve();
                    }
                }
            };
            script.onerror = function () { result.reject(); };
            $("head")[0].appendChild(script);
            return result.promise();
        }
    },
    isIE: function () {
        return (window.navigator.userAgent.match(/MSIE|Trident/) !== null);
    },
    gsMaxResult:1
}

// Execute after the page is fully loaded
$(document).ready(function () {
    app.PageLoaded();
});