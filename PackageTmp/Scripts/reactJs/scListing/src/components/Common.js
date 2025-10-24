import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";

export const Show = (isShow) => {
    return isShow ? "" : " hide ";
}

export const toggleBar = (e) => {
    e.preventDefault();
    var _this = e.currentTarget;
    var elementCollapse = $(_this).siblings();
    var elementToggle = $(_this).children()[1];
    var left = 'fa fa-chevron-left';
    var down = 'fa fa-chevron-down';

    if ($(elementToggle).hasClass(left)) {
        $(elementToggle).removeClass(left);
        $(elementToggle).addClass(down);
    } else {
        $(elementToggle).removeClass(down);
        $(elementToggle).addClass(left);
    }
    $(elementCollapse).slideToggle(100);
};

export const CloneJson = (json) => {
    return JSON.parse(JSON.stringify(json));

}

export const ImgOnError = (e) => {
    e.target.src = "/Content/Images/Icons/RequestOffering/RO_Default.png";
}