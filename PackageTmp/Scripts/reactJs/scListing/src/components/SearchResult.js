import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import { Show, toggleBar, ImgOnError } from './Common';
import Loader from './Loader';
import InfiniteScroll from "react-infinite-scroll-component";
import { SearchRequest, ArticleList, ArticlesPopularity, ArticlesView, TopRequest, FavoriteRequest } from './factory';

function SearchResult(props) {
    let newSearch = false;

    const [kbBycategory, setKbBycategory] = useState([]);
    const [kbBytype, setKbBytype] = useState([]);
    const [requestItems, setRequestItems] = useState([]);
    const [kbNoResultCategory, setKBNoResultCategory] = useState(true);
    const [kbNoResultType, setKBNoResultType] = useState(true);
    const [lastSearchParams, setLastSearchParams] = useState("");

    const [infiniteLoading, setInfiniteLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(true);

    
    useEffect(() => {
        setLastSearchParams(props.searchParams.searchText);
        serviceFunction();
        articleListFunction();
        
    }, [props.kbBycategory, props.kbParams, props.searchParams]);

    function serviceFunction() {
        props.searchParams.skipCount = requestItems.length;
        if (props.searchParams.searchText != lastSearchParams) {
            props.searchParams.skipCount = 0;
            newSearch = true;
            setShowLoader(true);
        }
        else {
            newSearch = false;
        }

        setInfiniteLoading(true);
        SearchRequest(props.searchParams, function (data) {
            if (newSearch) {
                setRequestItems([]);
            }

            setRequestItems(pre => [
                ...pre,
                ...data
            ]);

            setLastSearchParams(props.searchParams.searchText);
            setInfiniteLoading(false);
            setShowLoader(false); 
        });
        
        
    }
    
    function articleListFunction() {
        ArticleList(props.kbParams, function (data) {
            let cacheCategory = {};
            let cacheType = {};
            setKBNoResultCategory(true);
            setKBNoResultType(true);

            //Knowledge Article by Category...

            
            data.map((item) => {
                let articlesCategory = [];
                let catId = item.Category.Id == null ? "catId" : item.Category.Id;

                if (cacheCategory[catId] === undefined) {
                    setKBNoResultCategory(false);
                    articlesCategory.push(item);
                    cacheCategory[catId] = {
                        Group: { Name: item.Category.Name, Count: 1, Articles: articlesCategory },
                        ViewAll: { SearchText: props.kbParams.searchText, Id: item.Category.Id },
                        isCategory: true,
                        isExcess: false
                    };
                } else {
                    if (cacheCategory[catId].Group.Count < 5) {
                        cacheCategory[catId].Group.Articles.push(item);
                        cacheCategory[catId].Group.Count = cacheCategory[catId].Group.Count + 1;
                    } else {
                        cacheCategory[catId].isExcess = true;
                        cacheCategory[catId].Group.Count = cacheCategory[catId].Group.Count + 1;
                    }
                }
            });

            //Knowledge Article by Type...
            data.map((item) => {
                let articlesType = [];
                let typeId = item.Type.Id == null ? "typeId" : item.Type.Id;

                if (cacheType[typeId] === undefined) {
                    setKBNoResultType(false);
                    articlesType.push(item);
                    cacheType[typeId] = {
                        Group: { Name: item.Type.Name, Count: 1, Articles: articlesType },
                        ViewAll: { SearchText: props.kbParams.searchText, Id: item.Type.Id },
                        isType: true,
                        isExcess: false
                    };
                } else {
                    if (cacheType[typeId].Group.Count < 5) {
                        cacheType[typeId].Group.Articles.push(item);
                        cacheType[typeId].Group.Count = cacheType[typeId].Group.Count + 1;
                    } else {
                        cacheType[typeId].isExcess = true;
                        cacheType[typeId].Group.Count = cacheType[typeId].Group.Count + 1;
                    }
                } 
            });

            let _kbBycategory = [];
            let _kbBytype = [];

            Object.keys(cacheCategory).map(key => {
                _kbBycategory.push({ Key: key, Details: cacheCategory[key]});
            });
            setKbBycategory(_kbBycategory);

            Object.keys(cacheType).map(key => {
                _kbBytype.push({ Key: key, Details: cacheType[key] });
            });
            setKbBytype(_kbBytype);
            

            
        });
    }



    return (

        <div>
            
            <div class="sc__search--kb mar-top-2 row">
                <div class="col-md-6 kb-group-container" kb-data="kbBycategory" kb-class="col-md-6" kb-localization="localization" kb-noresult="kbNoResultCategory" kb-groupby="By Category">
                    <h3 class="">{localization.MatchingKnowledgeArticles}<small class="ng-binding">{localization.ByCategory}</small></h3>
                    <hr />
                    <nav class="sc-kabar-nav">
                        <ul class="sc-kanav article-list">
                            
                            {kbBycategory.map(ka => {
                                return (<li>
                                    <span onClick={(e) => { toggleBar(e) }}>{ka.Details.Group.Articles[0].Category.Name}
                                        <small>({ka.Details.Group.Count})</small> <i class="pull-right fa fa-chevron-left"></i>
                                    </span>
                                    <ul class="sc-kanav" style={{display:"none"}}>

                                        {ka.Details.Group.Articles.map(article => {
                                            return (
                                            <>

                                            <li>
                                                <div>
                                                    <a class="a-link a-icon" href={"/KnowledgeBase/View/" + article.ArticleId} target="_blank"><i class="fa fa-external-link"></i></a>
                                                    <a class="a-link" href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                                            <small class="">{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified}: {kendo.toString(new Date(article.LastModifiedDate), 'd')}</small>
                                                </div>
                                                <p class={Show(article.Description.length > 0)}>{article.Description}</p>
                                            </li>
                                            <li>
                                                        <div class={Show(ka.isExcess)}>
                                                            <a class="a-link" href={"/KnowledgeBase/Listing#/search/" + props.searchParams.searchText}>{localization.ViewAllKA}</a><br />
                                                </div>
                                            </li>
                                            </>)
                                        })}

                                    </ul>
                                </li>);
                            })}
                            
                            <li class={Show(kbBycategory.length<=0)}>
                                <p class="ng-binding">{localization.NoMatchingKnowledgeArticles}</p>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div class="col-md-6 kb-group-container">
                    <h3 class="">{localization.MatchingKnowledgeArticles} <small class="">{localization.ByType}</small></h3>
                    <hr />
                    <nav class="sc-kabar-nav">
                        <ul class="sc-kanav article-list">
                            {kbBytype.map(ka => {
                                return (
                                    <li class="">
                                        <span onClick={(e) => { toggleBar(e) }}>{ka.Details.Group.Articles[0].Type.Name}
                                            <small>({ka.Details.Group.Count})</small> <i class="pull-right fa fa-chevron-left"></i>
                                        </span>
                                        <ul class="sc-kanav" style={{ display: "none" }}>
                                            {ka.Details.Group.Articles.map(article => {
                                                return (
                                                    <>
                                                        <li class="ng-scope">
                                                            <div>
                                                                <a class="a-link a-icon" href={"/KnowledgeBase/View/" + article.ArticleId} target="_blank"><i class="fa fa-external-link"></i></a>
                                                                <a class="a-link ng-binding" href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                                                <small class="ng-binding">{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified}: {kendo.toString(new Date(article.LastModifiedDate), 'd')}</small>
                                                            </div>
                                                            <p class={Show(article.Description.length > 0)}>{article.Description}</p>
                                                        </li>
                                                        <li>
                                                            <div class={Show(ka.isExcess)}>
                                                                <a class="a-link" href={"/KnowledgeBase/Listing#/search/" + props.searchParams.searchText}>{localization.ViewAllKA}</a><br />
                                                            </div>
                                                        </li>
                                                    </>
                                                )
                                            })}

                                        </ul>
                                    </li>
                                    )
                            })}
                            
                            <li ng-show="kbNoresult" class={Show(kbBytype.length <= 0)}>
                                <p class="ng-binding">{localization.NoMatchingKnowledgeArticles}</p>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div class="sc__search--ro row">
                <div class="col-xs-12 ng-isolate-scope" search-type="searchType" noresult="">
                    <Loader showLoader={showLoader} />
                    <div class="sc__ro-lists sc-group-container">
                        <h3>{localization.MatchingRequestOfferings}</h3>
                        <hr />
                        <div class="row">

                            <InfiniteScroll
                                dataLength={requestItems.length}
                                next={serviceFunction}
                                hasMore={true}
                                loader={<Loader showLoader={infiniteLoading} />}
                            >
                                {requestItems.map((request) => (
                                    <div class="ro-item-list">
                                        <div class="media-link">
                                            <a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceOfferingId} class={Show(request.RequestOfferingLinkUrl == null)}>
                                                <img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} class="img-responsive pad-top-0-5" onError={(e) => { ImgOnError(e) }} />
                                            </a>
                                            <div>
                                                <h5><a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceOfferingId} class={Show(request.RequestOfferingLinkUrl == null)}>{request.Title}</a>
                                                    <span class="ro-desc">{request.Description}</span>
                                                </h5>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </InfiniteScroll>

                            
                        </div>
                        <div class={Show(requestItems.length == 0)}>
                            <div class="media-link">
                                <span class="">{localization.NoMatchingRequestOfferings}</span>
                            </div>
                        </div>
                    </div>
                </div>


                


                <div class={Show(!infiniteLoading)}>
                    <hr />
                    <p class="lead text-center">{localization.NoMoreRequestsFound }</p>
                </div>
            </div>
        </div>
        );
}


export default SearchResult;