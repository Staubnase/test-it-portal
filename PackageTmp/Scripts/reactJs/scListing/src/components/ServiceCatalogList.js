import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import {
    Link,
    HashRouter,
    useParams
} from "react-router-dom";
import { Show, toggleBar, ImgOnError } from './Common';
import { GetRequestOffering } from './factory';
import Loader from './Loader';

export default function ServiceCatalogList(props) {
    let { id } = useParams();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [soItems, setSOItems] = useState([]);
    const [kbByCategory, setKbByCategory] = useState([]);
    const [kbByType, setKbByType] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        getSOById();
    }, [props.allSCList, window.location.href]);

    function getSOById(){
        if (props.allSCList.length > 0) {
            let tempList = props.allSCList.filter(i => {
                return i.ServiceOfferingId == id;
            });
            
            if (tempList.length > 0) {
                let sc = tempList[0];
                setTitle(sc.Service);
                setCategory(sc.Category);
            }

            setSOItems(tempList);

            GetRequestOffering(tempList[0].RequestOfferingId, id,
                session.user.Id,
                session.user.Security.IsServiceCatalogScoped,
                function (data) {
                    if (data != undefined || data != null) {
                        let cacheCategory = {};
                        let cacheType = {};
                        let kbList = data.ServiceInfo.KnowledgeArticles;

                        //Knowledge Article by Category...
                        kbList.map(item => {
                            var articlesCategory = [];

                            if (!_.isNull(item.KACategory)) {
                                if (cacheCategory[item.KACategory.Id] === undefined) {
                                    //$scope.kbNoResultCategory = false;
                                    articlesCategory.push(item);
                                    cacheCategory[item.KACategory.Id] = { Category: { Name: item.KACategory.Name, Count: 1, Articles: articlesCategory } };
                                } else {
                                    cacheCategory[item.KACategory.Id].Category.Articles.push(item);
                                    cacheCategory[item.KACategory.Id].Category.Count = cacheCategory[item.KACategory.Id].Category.Count + 1;
                                }
                            }
                        });

                        let _kbByCategory = [];
                        Object.keys(cacheCategory).map(key => {
                            _kbByCategory.push({ Key: key, Details: cacheCategory[key] });
                        });
                        setKbByCategory(_kbByCategory);
                        

                        //Knowledge Article by Type...
                        kbList.map(item => {
                            var articlesType = [];

                            if (!_.isNull(item.KAType)) {
                                if (cacheType[item.KAType.Id] === undefined) {
                                    //$scope.kbNoResultType = false;
                                    articlesType.push(item);
                                    cacheType[item.KAType.Id] = { Type: { Name: item.KAType.Name, Count: 1, Articles: articlesType } };
                                } else {
                                    cacheType[item.KAType.Id].Type.Articles.push(item);
                                    cacheType[item.KAType.Id].Type.Count = cacheType[item.KAType.Id].Type.Count + 1;
                                }
                            }
                        });

                        let _setKbByType = [];
                        Object.keys(cacheType).map(key => {
                            _setKbByType.push({ Key: key, Details: cacheType[key] });
                        });
                        
                        setKbByType(_setKbByType);

                    }

                    setLoading(false);
                }
            );
        }
    }

    return (
        <>
            <div ui-view="" class="ng-scope">
                <Loader showLoader={loading} />
                <div ng-show="!loading" class="ng-scope">
                    <ol class="breadcrumb mar-top-1 mar-bot-0">
                        <li><Link to="/" class="ng-binding">{localization.NewSCHome}</Link></li>
                        <li class="active ng-binding">{category}</li>
                        <li class="active ng-binding">{title}</li>
                    </ol>
                    <br />
                    <div class="sc__heading">
                        <h1 class="margin-b10 ng-binding">{title}</h1>
                        <hr />
                    </div>
                    <div class="sc__so-details row">
                        <div class="col-sm-2 sc__so-details--image" ng-show="soModel.ServiceInfo.OfferingImage64.length > 0">
                            <img class="img-responsive" onError={(e) => { ImgOnError(e) }}  src={"/ServiceCatalog/GetServiceOfferingImg/" + id} />
                        </div>
                        <div class="col-sm-10 sc__so-details--desc">
                            <p ng-bind-html="soModel.ServiceInfo.Overview" class="ng-binding"></p>
                        </div>
                    </div>
                    <div class="sc__ro-lists sc-page-header">
                        <h3 class="ng-binding">Request Offerings</h3>
                        <hr />
                        <div class="row">
                            {soItems.map(so => {
                                return (
                                    <div class="col-sm-6">
                                        <div class="media">
                                            <div class="pull-left media__so-image">
                                                <a ng-if="so.RequestOfferingLinkUrl==null" href={"/ServiceCatalog/RequestOffering/" + so.RequestOfferingId + "," + so.ServiceOfferingId} class="">
                                                    <img onError={(e) => { ImgOnError(e) }} src={"/ServiceCatalog/GetRequestOfferingImg/" + so.RequestOfferingId} class="img-responsive"/>
                                                </a>
                                            </div>
                                            <div class="media-body">
                                                <h5 class="media-heading">
                                                    <a class={Show(so.RequestOfferingLinkUrl == null)} href={"/ServiceCatalog/RequestOffering/" + so.RequestOfferingId + "," + so.ServiceOfferingId}>
                                                        {so.RequestOfferingTitle}
                                                    </a>
                                                </h5>
                                                <p class="media__so-desc">{so.RequestOfferingDescription}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                        </div>
                    </div>
                    <div class="row sc__ka-lists sc-page-header">
                        <div class="col-sm-6">
                            <h3 class="ng-binding">{localization.RelatedKnowledgeArticles} <small>{localization.ByCategory}</small></h3>
                            <hr />
                            <nav class="sc-kabar-nav">
                                <ul class="sc-kanav article-list">
                                    {kbByCategory.map(ka => {
                                        return (
                                        <li>
                                            <span onClick={(e) => { toggleBar(e) }}>{ka.Details.Category.Name}<small class="ng-binding">({ka.Details.Category.Count})</small> <i class="fa fa-chevron-left pull-right"></i></span>
                                            {ka.Details.Category.Articles.map(article => {
                                                return (
                                                    <ul class="sc-kanav" style={{display:"none"}}>
                                                        <li>
                                                            <div>
                                                                <a class="a-link a-icon" href={"/KnowledgeBase/View/" + article.ArticleId} target="_blank"><i class="fa fa-external-link"></i></a>
                                                                <a class="a-link ng-binding" href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                                                <small>{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified} : {kendo.toString(new Date(article.LastModifiedDate), 'd')}</small>
                                                            </div>
                                                            <p class={Show(article.Abstract.length > 0)}>{article.Abstract}</p>
                                                        </li>
                                                    </ul>
                                                    )
                                            })}
                                            
                                         </li>
                                        )
                                    })}
                                    
                                    <li class={Show(kbByCategory.length == 0)}>
                                        <p>{localization.NoRelatedKnowledgeArticles}</p>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div class="col-sm-6">
                            <h3>{localization.RelatedKnowledgeArticles}<small class="ng-binding">{localization.ByType}</small></h3>
                            <hr />
                            <nav class="sc-kabar-nav">
                                <ul class="sc-kanav article-list">
                                    {kbByType.map(ka => {
                                        return (
                                            <li>
                                                <span onClick={(e) => { toggleBar(e) }}>{ka.Details.Type.Name}<small>({ka.Details.Type.Count})</small> <i class="fa fa-chevron-left pull-right"></i></span>
                                                {ka.Details.Type.Articles.map(article => {
                                                    return (
                                                        <ul class="sc-kanav" style={{ display: "none" }}>
                                                            <li>
                                                                <div>
                                                                    <a class="a-link a-icon" href={"/KnowledgeBase/View/" + article.ArticleId} target="_blank"><i class="fa fa-external-link"></i></a>
                                                                    <a class="a-link ng-binding" href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                                                    <small>{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified} : {kendo.toString(new Date(article.LastModifiedDate), 'd')}</small>
                                                                </div>
                                                                <p class={Show(article.Abstract.length > 0)}>{article.Abstract}</p>
                                                            </li>
                                                        </ul>
                                                    )
                                                })}
                                            </li>
                                            )
                                    })}
                                    
                                    <li class={Show(kbByType.length==0)}>
                                        <p>{localization.NoRelatedKnowledgeArticles}</p>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
