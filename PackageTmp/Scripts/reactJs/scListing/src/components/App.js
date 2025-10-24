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

export default function App(props) {
    return (
        <HashRouter hashType="slash" basename="/">
            <Body />
            
        </HashRouter>
        );
}
