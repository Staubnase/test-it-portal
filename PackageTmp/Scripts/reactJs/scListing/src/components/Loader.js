import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import {
    Route,
    Routes,
    useNavigate,
    Link,
    HashRouter
} from "react-router-dom";
import Body from './Body';
import { Show } from './Common';

export default function Loader(props) {

    return (
        <div class={Show(props.showLoader)}>
            <div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>
        </div>
    );
}
