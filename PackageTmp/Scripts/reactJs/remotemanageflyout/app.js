import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import 'regenerator-runtime/runtime'

const App = () => {
    const [displaySlideOut, setDisplaySlideOut] = useState(false);
    const [displaySlideOutSub, setDisplaySlideOutSub] = useState(false);
    const [switchMain, setSwitchMain] = useState(false);
    const [form, setForm] = useState(false);
    const [modal, setModal] = useState(false);
    const [switchForm, setSwitchForm] = useState(false);
    const [switchSub, setSwitchSub] = useState(false);

    const stopPropagation = (e) => {
        e.stopPropagation();
    }

    const closeSlideOutNav = (isSubFlyout) => {
        var mainBack = $('#template-default-cmp-main-flyout > div').hasClass('display-slideout-nav-content--back');
        var subBack = $('#template-default-cmp-sub-flyout > div').hasClass('display-slideout-nav-content--back');

        if (!mainBack && !subBack) {
            (!isSubFlyout) ? setDisplaySlideOut(false) : setDisplaySlideOutSub(false);
        } else {
            if (mainBack)
                setDisplaySlideOutSub(false);

            if (subBack)
                setDisplaySlideOut(false);
        }
        
    }

    const showSlideOutNav = (options) => {
        setDefaults(options);
        setTimeout(() => {
            triggerStateMessage(options);
        }, 500);

        //listener to close button event
        window.addEventListener("message", function (e) {
            if (e.data === "closeCC") {
                closeSlideOutNav(options.isSubFlyout);
            }
            if (e.data.rmOptions !== undefined) {
                showSlideOutNav(e.data.rmOptions);
            }
            if (e.data.formOptions !== undefined) {
                showSlideOutNavByUrl(e.data.formOptions);
            }
        }, false);
    }

    const showSlideOutNavByUrl = (options) => {
        var path = options.path;
        var tooltip = options.tooltip;
        var width = options.width;
        var iframe = document.getElementById('iframe__slideout__main_form');
        var flyoutMainId = '#template-default-cmp-main-flyout';
        var flyoutSubId = '#template-default-cmp-sub-flyout';
        var flyoutFormId = '#template-default-cmp-form-flyout';

        if (!_.isUndefined(width)) {
            flyoutFormId = '#template-default-cmp-modal_flyout';
            iframe = document.getElementById('iframe__slideout__main_modal');
            //angular.element(document.querySelector("#slideout__content__trigger_modal")).click();
            setModal(true);
        } else {
            $(flyoutMainId).find('div.slideout-nav__content__switch__button__tooltip__content_form').html(tooltip);
            $(flyoutSubId).find('div.slideout-nav__content__switch__button__tooltip__content_form').html(tooltip);

            setForm(true);
            setModal(false);

            formSwitch("form");
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
    }

    const switchSlideOutNav = (sub) => {
        if (sub) {
            setSwitchSub(false);
            setSwitchMain(true);
        }
        else {
            setSwitchMain(false);
            setSwitchSub(true);
        }
        setSwitchForm(false);
    }

    const formSwitch = (switchType) => {
        switch (switchType) {
            case "main":
                setSwitchMain(true);
                setSwitchSub(false);
                setSwitchForm(false);
                break;
            case "sub":
                setSwitchMain(false);
                setSwitchSub(true);
                setSwitchForm(false);
                break;
            case "form":
                setSwitchMain(false);
                setSwitchSub(false);
                setSwitchForm(true);
                break;
        }
    }

    const hideForm = () => {
        setForm(false);
        var mainBack = $('#template-default-cmp-main-flyout > div').hasClass('display-slideout-nav-content--back');
        var subBack = $('#template-default-cmp-sub-flyout > div').hasClass('display-slideout-nav-content--back');

        if (mainBack && subBack) {
            setSwitchSub(true);
        } else {
            setSwitchMain(true);
        }
    }

    const triggerStateMessage = (options) => {
        //options
        let id = options.id;
        let targetEntity = options.targetEntity;
        let isSubFlyout = options.isSubFlyout;
        let url = options.url;

        let iframe = document.getElementById(!isSubFlyout ? 'iframe__slideout__main' : 'iframe__slideout__main_sub');
        let platformSRC = '/platform/app/iframe';
        let entity = '/' + targetEntity + '/';
        let srcEntity = platformSRC + entity + id;

        let stateMessage = {
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
        let baseURL = session.consoleSetting.TrueControlCenterURL;
        let src = srcEntity;

        if (baseURL.indexOf(window.location.hostname) < 0) src = baseURL + src;

        if (iframe.src.indexOf(src) > -1)
            iframe.contentWindow.postMessage(stateMessage, '*');
        else
            iframe.src = src;


        
    }

    const setDefaults = (options) => {
        //options
        let targetEntity = options.targetEntity;
        let isSubFlyout = options.isSubFlyout;
        let tooltip = options.tooltip;

        let iframe = document.getElementById(!isSubFlyout ? 'iframe__slideout__main' : 'iframe__slideout__main_sub');
        let flyoutMainId = '#template-default-cmp-main-flyout';
        let flyoutSubId = '#template-default-cmp-sub-flyout';
        let flyoutFormId = '#template-default-cmp-form-flyout';
        let platformSRC = '/platform/app/iframe';
        let entity = '/' + targetEntity + '/';

        (!isSubFlyout) ? setDisplaySlideOut(true) : setDisplaySlideOutSub(true);
     
        setSwitchMain(false);
        setSwitchSub(false);
        setSwitchForm(false);

        $(flyoutSubId).find('div.slideout-nav__content__main--full').attr('style', 'padding-top:0;width:auto');

        if (isSubFlyout) {
            if (iframe.src !== "" && iframe.src.indexOf(targetEntity) <= -1) {
                iframe = document.getElementById('iframe__slideout__main');
                setSwitchMain(true)
                setSwitchSub(false)
                setForm(true)
            } else {
                $(flyoutMainId).find('div.slideout-nav__content__switch__button__tooltip__content').html(tooltip);
                $(flyoutFormId).find('div.slideout-nav__content__switch__button__tooltip__content_sub').html(tooltip);
                setSwitchSub(true)
            }
        } else {
            $(flyoutSubId).find('div.slideout-nav__content__switch__button__tooltip__content').html(tooltip);
            $(flyoutFormId).find('div.slideout-nav__content__switch__button__tooltip__content_main').html(tooltip);
        }
    }

    

    useEffect(() => {
        let options = app.storage.remoteFlyout.get('options');
        showSlideOutNav(options);
    }, []);
  

    return (
        <div id="slideout_container_div">
            <div>
                <div id="slideout__content__trigger_show" onClick={() => setDisplaySlideOut(true)}></div>
                <div id="slideout__content__trigger__hide" onClick={() => setDisplaySlideOut(false)}></div>

                <div id="slideout__content__trigger_show_sub" onClick={() => setDisplaySlideOutSub(true)}></div>
                <div id="slideout__content__trigger__hide_sub" onClick={() => setDisplaySlideOutSub(false)}></div>

                <div id="slideout__content__trigger__switch_main_true" onClick={() => setSwitchMain(true)}></div>
                <div id="slideout__content__trigger__switch_main_false" onClick={() => setSwitchMain(false)}></div>

                <div id="slideout__content__trigger__switch_sub_true" onClick={() => setSwitchSub(true)}></div>
                <div id="slideout__content__trigger__switch_sub_false" onClick={() => setSwitchSub(false)}></div>

                <div id="slideout__content__trigger_show_form" onClick={() => setForm(true)}></div>
                <div id="slideout__content__trigger_hide_form" onClick={() => setForm(false)}></div>

                <div id="slideout__content__trigger_modal_show" onClick={() => setModal(true)}></div>
                <div id="slideout__content__trigger_modal_hide" onClick={() => setModal(false)}></div>

                <div id="slideout__content__trigger__switch_form_true" onClick={() => setSwitchForm(true)}></div>
                <div id="slideout__content__trigger__switch_form_false" onClick={() => setSwitchForm(false)}></div>

                {/*<!-- slide out navigation flyout main-->*/}
                <div id="template-default-cmp-main-flyout" class="template-default-cmp">
                    {displaySlideOut &&
                        <div class="display-slideout-nav-content" className={(!switchMain && (displaySlideOutSub || form)) ? 'display-slideout-nav-content--back' : 'display-slideout-nav-content'}>
                        <div class="slideout-nav__content cui-z-index-9" onClick={() => closeSlideOutNav(false)}>
                            <div class="slideout-nav__content__container cui-flexbox">
                                {(displaySlideOutSub && switchMain) &&
                                    <div class="slideout-nav__content__switch">
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content"></div>
                                                </div>
                                            <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => switchSlideOutNav()}>
                                                    {/*<md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {(form && switchMain) &&
                                    <div class="slideout-nav__content__switch" className={(form && displaySlideOutSub) ? 'slideout-nav__content__switch_form' : 'slideout-nav__content__switch' }>
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content slideout-nav__content__switch__button__tooltip__content_form"></div>
                                                </div>
                                            <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => formSwitch('form')}>
                                                    {/*<md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <div class="slideout-nav__content__main slideout-nav__content__main--full" onClick={(e) => stopPropagation(e)}>
                                    <iframe id="iframe__slideout__main" class="iframe__slideout_nav_content"></iframe>
                                </div>
                            </div>
                        </div>
                        </div>
                    }
                </div>
                {/*<!-- slide out navigation flyout sub-->*/}
                <div id="template-default-cmp-sub-flyout" class="template-default-cmp">
                    {displaySlideOutSub &&
                        <div class="display-slideout-nav-content" className={(!switchSub && (displaySlideOut || form)) ? 'display-slideout-nav-content--back' : 'display-slideout-nav-content' } >
                        <div class="slideout-nav__content" className={switchSub ? 'cui-z-index-9' : 'cui-z-index-8'} onClick={() => closeSlideOutNav(true)}>
                                <div class="slideout-nav__content__container cui-flexbox">
                                {(displaySlideOut && switchSub) &&
                                    <div class="slideout-nav__content__switch">
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content"></div>
                                                </div>
                                            <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => switchSlideOutNav(true)}>
                                                   {/* <md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {(form && switchSub) &&
                                    <div class="slideout-nav__content__switch" className={(form && displaySlideOut) ? 'slideout-nav__content__switch_form' :'slideout-nav__content__switch'}>
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content slideout-nav__content__switch__button__tooltip__content_form"></div>
                                                </div>
                                            <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => formSwitch('form')}>
                                                    {/*<md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                    <div class="slideout-nav__content__main slideout-nav__content__main--full" onClick={(e) => stopPropagation(e)}>
                                        <iframe id="iframe__slideout__main_sub" class="iframe__slideout_nav_content"></iframe>
                                    </div>
                                </div>
                            </div>
                            </div>
                    }
                </div>
                {/*<!-- slide out navigation flyout form-->*/}
                <div id="template-default-cmp-form-flyout" class="template-default-cmp">
                    {form &&
                        <div class="display-slideout-nav-content" className={(!switchForm && (displaySlideOut || displaySlideOutSub)) ? 'display-slideout-nav-content--back' :'display-slideout-nav-content' }>
                        <div class="slideout-nav__content" className={switchForm ? 'cui-z-index-9' : 'cui-z-index-8'} onClick={() => hideForm()}>
                                <div class="slideout-nav__content__container cui-flexbox">
                                {(displaySlideOut && switchForm) &&
                                    <div class="slideout-nav__content__switch">
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content slideout-nav__content__switch__button__tooltip__content_main"></div>
                                                </div>
                                                <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => formSwitch('main')} >
                                                    {/*<md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {(displaySlideOutSub && switchForm) &&
                                    <div class="slideout-nav__content__switch" className={(displaySlideOutSub && displaySlideOut) ? 'slideout-nav__content__switch_form' : 'slideout-nav__content__switch'}>
                                        <div class="slideout-nav__content__switch__button-container">
                                            <div class="slideout-nav__content__switch__button__tooltip-container cui-flexbox">
                                                <div class="slideout-nav__content__switch__button__tooltip">
                                                    <div class="slideout-nav__content__switch__button__tooltip__header">Switch to</div>
                                                    <div class="slideout-nav__content__switch__button__tooltip__content slideout-nav__content__switch__button__tooltip__content_sub"></div>
                                                </div>
                                                <button class="md-icon-button slideout-nav__content__switch__button md-button md-ink-ripple" type="button" aria-label="icon" onClick={() => formSwitch('sub')}>
                                                    {/*<md-icon md-svg-icon="switch" aria-label="switch" class="ng-scope" role="img"><svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><defs><path id="switch_a" d="M8.571 0H24v20.571H8.571z"></path></defs><g fill="none" fill-rule="evenodd"><path fill="#AD9983" d="M0 4.429h15.429V25H0z"></path><g transform="translate(0 1)"><use fill="#AD9983" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#switch_a"></use><path stroke="#FFF" d="M8.071-.5H24.5v21.571H8.071z"></path></g><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></g></svg></md-icon>*/}
                                                    <svg id="switch" viewBox="0 0 25 25" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.971 4.714l6.6 6.4-6.6 6.4v-3.657c-11.314 0-12.257 4.572-12.257 4.572S2.657 8.37 13.971 8.37V4.714z" fill="#FFF" fill-rule="nonzero"></path></svg>
                                                    <div class="md-ripple-container"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <div class="slideout-nav__content__main slideout-nav__content__main--full" onClick={(e) => stopPropagation(e)}>
                                        <iframe id="iframe__slideout__main_form" class="iframe__slideout_nav_content"></iframe>
                                        <a class="slideout-nav__content__main__close-button contrl-center__close__z-index" onClick={() => hideForm()}>
                                            <svg id="actions-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                {/*<!-- slide out navigation flyout modal-->*/}
                <div id="template-default-cmp-modal_flyout" class="template-default-cmp">
                    {modal &&
                        <div class="display-slideout-nav-content">
                        <div class="slideout-nav__content" className={modal ? 'cui-z-index-9' : 'cui-z-index-5'} onClick={() => setModal(false)}>
                                <div class="slideout-nav__content__container cui-flexbox">
                                <div class="slideout-nav__content__main slideout-nav__content__main--full" onClick={(e) => stopPropagation(e)}>
                                        <iframe id="iframe__slideout__main_modal" class="iframe__slideout_nav_content"></iframe>
                                    <a class="slideout-nav__content__main__close-button contrl-center__close__z-index" onClick={() => setModal(false)}>
                                            <md-icon class="material-icons" md-svg-icon="actions-close" aria-label="close" aria-hidden="true"><svg id="actions-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></md-icon>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('slideout_container_react_div'));

