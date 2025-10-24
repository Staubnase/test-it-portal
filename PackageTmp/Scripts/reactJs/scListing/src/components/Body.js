import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import {
    Route,
    Routes,
    useNavigate,
    Link,
    HashRouter
} from "react-router-dom";
import { Show } from './Common';
import { SearchRequest, SCItems } from './factory';
import Home from './Home';
import SearchResult from './SearchResult.js';
import ServiceCatalogPane from './ServiceCatalogPane';
import ServiceCatalogList from './ServiceCatalogList';
import Favorites from './Favorites';
import Loader from './Loader';

export default function Body(props) {
    let navigate  = useNavigate();

    let _InitialQuery = getQuery();
    let _searchtext = _InitialQuery.searchText;
    let _searchType = _InitialQuery.searchType;

    //const [queryStringParam, setQueryString] = useState(app.lib.getQueryParams(queryString));
    const [userId, setUserId] = useState(session.user.Id);
    const [isSCScoped, setIsSCScoped] = useState(session.user.Security.IsServiceCatalogScoped);
    const [searchText, setSearchText] = useState(_searchtext);
    const [filterText, setFilterText] = useState('');
    const [filterLabel, setFilterLabel] = useState(localization.SearchAll);
    const [searchType, setSearchType] = useState(_searchType);
    const [catalogItems, setCatalogItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAppliedFiltersIcon, setShowAppliedFiltersIcon] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showEmptySearchMessage, setShowEmptySearchMessage] = useState(false);

    const [scCategory, setScCategory] = useState([]);
    const [allSCList, setAllSCList] = useState([]);

    const [roLoading, setROLoading] = useState(true);
    const [requestItems, setRequestItems] = useState([]);

    




    const [filterItems, setFilterItems] = useState([
        { name: localization.IWantToReportAnIssue, value: 'Incidents' },
        { name: localization.IWantToRequestSomething, value: 'Requests' },
        { name: localization.ChooseAFavoriteRequest, value: 'Favorites' }
    ]);

    const [kbParams, setKBParams] = useState({
        searchText: searchText,
        skipCount: 0
    });



    const [searchParams, setSearchParams] = useState({
        searchText: searchText,
        searchType: searchType,
        skipCount: 0,
        takeCount: 10
    });


    useEffect(() => {
        
        if (!window.location.hash.startsWith("#/Service") && !window.location.hash.startsWith("#/Favorites")) {
            onFilterSelect(_searchType)
            search({ which: 13 }, true);
        }
        
        if (scCategory.length == 0) {
            listCatalog();
        }
    }, []);



    window.onpopstate = function (e) {
        let query = getQuery();
        setSearchText(query.searchText);
        setSearchType(query.searchType);
        onFilterSelect(query.searchType)
        search({ which: 13 }, true);
    }

    function getQuery() {
        let toReturn = {};
        let queryProp = app.lib.getQueryParams(window.location.hash.substr(1));
        if (queryProp != false) {
            toReturn.searchText = queryProp["search/searchtext"];
            toReturn.searchType = queryProp.searchtype;
        }

        return toReturn;
    }

    function search(e, isonpopstate) {


        _searchtext = $("#searchText").val();
        setSearchText(_searchtext);



        if (e.which === 13) {
            if (_searchtext.length > 0) {

                if (!isonpopstate) {
                    navigate("/Search/searchText=" + _searchtext + "&searchType=" + searchType);
                }

                //$scope.roLoading = true;
                setRequestItems([]);
                setShowEmptySearchMessage(false);


                setSearchParams({
                    searchText: _searchtext,
                    searchType: searchType,
                    skipCount: 0,
                    takeCount: 10
                });
                setKBParams({
                    searchText: _searchtext,
                    skipCount: 0
                });


            } else {
                if (!isonpopstate) {
                    setShowEmptySearchMessage(true);
                }
            }

        }

    }



    function onFilterSelect(value) {
        let sType = filterItems.find(i => i.value == value);
        if (sType == undefined) {
            setSearchType("All");
            setFilterLabel(localization.SearchAll);
        }
        else {
            setSearchType(sType.value);
            setFilterLabel(sType.name);
        }
    }

    function getFilterItems() {
        let items = [];
        filterItems.map(filter => {
            items.push(
                <li searchtype={filter.value}>
                    <a onClick={(e) => { onFilterSelect(filter.value); }}>{filter.name}</a>
                </li>);
        });

        return items;
    }

    

    function listCatalog() {
        
        SCItems(session.user.Id, session.user.Security.IsServiceCatalogScoped, function (data) {
            let _scCategory = [];
            let service = _.uniq(data, function (serv) { return serv.ServiceOfferingId; });
            let cacheService = {};

            setAllSCList(data);

            //Right side panel: Array for service category and its respective service offerings.
            service.map((item) => {
                let serviceCategory = [];

                if (cacheService[item.CategoryId] === undefined) {
                    serviceCategory.push(item);
                    cacheService[item.CategoryId] = { Category: { Name: item.Category, Services: serviceCategory } };
                } else {
                    cacheService[item.CategoryId].Category.Services.push(item);
                }
            });
            Object.keys(cacheService).map(key => {
                _scCategory.push({ Key: key, Details: cacheService[key] });
            });
            setScCategory(_scCategory);
            
        });
    }




    return (
        <div>
            <div class="container-fluid">
                <div class="row sc-main-wrapper">
                    <div class="col-sm-9 col-sm-right-offset-3">
                        <Routes>
                            <Route path="/Service/:id" element={<ServiceCatalogList allSCList={allSCList} />} />
                            <Route path="/Favorites" element={<Favorites />} />
                            <Route path="*" element={
                                <>
                                    <Loader showLoader={loading} />
                                    <div class={Show(!loading)}>
                                        <Routes>
                                            <Route path="/" element={
                                                <div class="sc__header">
                                                    <h1>{localization.Home}</h1>
                                                    <service-panel categorydata="scData" placeholder={localization.BrowseByCategory}></service-panel>
                                                    <br />
                                                    <hr />
                                                </div>
                                            } />

                                            <Route path="/Search/:searchText" element={
                                                <>
                                                    <ol class="breadcrumb mar-top-1 mar-bot-0">
                                                        <li><Link to="/">{localization.Home}</Link></li>
                                                        <li class="active">{localization.SearchRequestOffering}</li>
                                                    </ol>
                                                    <div class="sc__header">
                                                        <h1>{localization.ServiceCatalogSearch}</h1>
                                                        <service-panel categorydata="scData" placeholder="localization.BrowseByCategory"></service-panel><br />
                                                        <hr />
                                                    </div>
                                                </>
                                            } />

                                        </Routes>
                                        <div class="sc__search">
                                            <div class="search-row search-directive ng-pristine ng-valid" name="advSearchForm">
                                                <div class={"alert-container" + Show(showEmptySearchMessage)}>
                                                    <div class="alert alert-danger ng-binding">{localization.Required}</div>
                                                </div>
                                                <div class="search-wrapper pull-left">
                                                    <div class="input-group">
                                                        <input type="text" id="searchText" class="form-control ng-pristine ng-untouched ng-valid"
                                                            value={searchText}
                                                            onChange={(e) => { search(e, false); }}
                                                            onKeyUp={(e) => { search(e, false); }}
                                                            placeholder={localization.SearchRequestOffering + "..."} />
                                                        <div class="input-group-btn hidden-xs">
                                                            <button type="button" class="btn btn-default filter-toggle ng-binding" data-toggle="dropdown">
                                                                <i class={"fa fa-filter" + Show(showAppliedFiltersIcon)}></i>{filterLabel}<i class="fa fa-caret-down margin-l10"></i>
                                                            </button>
                                                            <ul class="dropdown-menu pull-right" role="menu">
                                                                {getFilterItems()}
                                                                <li class="divider"></li>
                                                                <li searchtype="All">
                                                                    <a onClick={(e) => { onFilterSelect("All"); }} filterlabel={localization.SearchAll}>{localization.SearchAll}</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <span class="input-group-btn">
                                                            <button class="btn btn-primary btn-search" type="button" onClick={(e) => { search({ which: 13 }, false); }}>
                                                                <span class="fa fa-search"></span>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Routes>
                                            <Route path="/" element={<Home setLoading={setLoading} />} />
                                            <Route path="/Search/:searchText" element={<SearchResult kbParams={kbParams} searchParams={searchParams} />} />
                                        </Routes>

                                    </div>
                                </>
                            } />
                        </Routes>
                                
                            
                                
                    </div>
                    <div class="col-sm-3 sidebar-right pad-top-1-5 hidden-xs">
                        <ServiceCatalogPane scCategory={scCategory} />
                    </div>
                </div>
            </div>
        </div>  
    );



}
