import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import {
    HashRouter, Link
} from "react-router-dom";
import { Show, toggleBar, CloneJson } from './Common';

export default function ServiceCatalogPane(props) {

    let searchTimeout = setTimeout(function () { }, 1);
    const [scCategoryDisplay, setScCategoryDisplay] = useState([]);
    
    useEffect(() => {
        setScCategoryDisplay(props.scCategory);
    }, [props.scCategory]);

    

    function search(e) {
        let tempList = [];
        clearTimeout(searchTimeout); //This will prevent performance issue
        searchTimeout = setTimeout(function () {
            CloneJson(props.scCategory).map(so => {
                let services = so.Details.Category.Services;
                so.Details.Category.Services = services.filter(serv => {
                    return serv.Service.toLowerCase().includes(e.target.value.toLowerCase());
                });

                tempList.push(so);
            });
            setScCategoryDisplay(tempList);
        }, 200);
        
    }
    

    return (
        <>
            <h4 class="text-left">{localization.BrowseByCategory}</h4>
            <hr class="tree-heading-hr" />
            <div class="sc-filter">
                <input type="text" onKeyUp={(e) => { search(e); }} class="form-control sc-text-search ng-pristine ng-untouched ng-valid ng-empty" placeholder={localization.FilterServices} />
                <nav class="bottom-mb10 sidebar-nav ng-isolate-scope" categorydata="scData" searchtext="filterText" favorites="Favorites">
                    <ul class="nav sidenav">
                        <li><Link class="link" to="/Favorites">{localization.Favorites}</Link></li>
                        {scCategoryDisplay.map(cat => {
                            return (
                                <>
                                    <li class="">
                                        <a class="link" onClick={(e) => { toggleBar(e); }}>
                                            {cat.Details.Category.Name}<small class=""> ({cat.Details.Category.Services.length})</small>
                                            <i class="fa fa-chevron-left pull-right"></i>
                                        </a>
                                        <ul class={"nav" + Show(cat.Details.Category.Services.length > 0)} style={{ display: "none" }}>
                                            {cat.Details.Category.Services.map(serv => {
                                                return (
                                                    <li class="">
                                                        <Link class="link" to={"/Service/" + serv.ServiceOfferingId}>{serv.Service}</Link>
                                                    </li>
                                                    )
                                            })}
                                            
                                        </ul>
                                    </li>
                                </>
                            
                             )
                        })}
                        
                    </ul>
                </nav>
            </div>
        </>
    );
}
