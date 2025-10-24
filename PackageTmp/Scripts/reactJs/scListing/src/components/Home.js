import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import { Show, ImgOnError } from './Common'
import { SearchRequest, ArticleList, ArticlesPopularity, ArticlesView, TopRequest, FavoriteRequest } from './factory';

function Home(props) {
    let featuredArticleLI = [];
    const [featuredArticle, setFeaturedArticle] = useState([]);

    const [popularArticle, setPopularArticle] = useState([]);
    const [topRequest, setTopRequest] = useState([]);
    const [favoriteRequest, setFavoriteRequest] = useState([]);
    //const [loading, setLoading] = useState(true);
    //props.setLoading(true);


    useEffect(() => {
        props.setLoading(true);

        ArticlesPopularity(5, function (data) {
            setFeaturedArticle(data);
        });

        ArticlesView(5, function (data) {
            setPopularArticle(data);
        });

        TopRequest(session.user.Id, 5, session.user.Security.IsServiceCatalogScoped, function (data) {
            setTopRequest(data);
        });
        
        FavoriteRequest(session.user.Id, 5, session.user.Security.IsServiceCatalogScoped, 10, 0, function (data) {
            setFavoriteRequest(data);
            props.setLoading(false);
        });

    }, []);

    
    return (<div class="sc__home">
                <div class="sc-page-header sc__home-kb-lists row">
                    <div class="col-md-6 col-xs-12">
                        <h2>{localization.FeaturedArticles}</h2>
                        <hr />
                {featuredArticle.map(article => {
                    return (
                        <ul class="sc-kanav-home">
                            <li>
                                <div class="col-xs-12">
                                    <a href={"/KnowledgeBase/View/" + article.ArticleId} target='_blank'><i class="fa fa-external-link a-icon"></i></a>
                                    <a href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                    <small>{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified} : {kendo.toString(new Date(article.LastModifiedDate), 'd')}</small>
                                </div>
                            </li>
                        </ul>);
                })}
                <div class={Show(featuredArticle.length==0) } ng-show="featuredArticle.length === 0">
                            <span>{localization.NoKnowledgeArticles}</span>
                        </div>
                    </div>
                    <div class="col-md-6 col-xs-12">
                        <h2>{localization.PopularArticles}</h2>
                <hr />
                {popularArticle.map(article => {
                    return (<ul class="sc-kanav-home">
                        <li>
                            <div class="col-xs-12">
                                <a href={"/KnowledgeBase/View/" + article.ArticleId} target="_blank"><i class="fa fa-external-link a-icon"></i></a>
                                <a href={"/KnowledgeBase/View/" + article.ArticleId}>{article.Title}</a><br />
                                <small>{localization.Rating} {article.Rating}/5 | {localization.Views}: {article.ViewCount} | {localization.LastModified}: {kendo.toString(new Date(article.LastModifiedDate), 'd')} </small>
                            </div>
                        </li>
                    </ul>)
                })}
                        
                <div class={Show(popularArticle.length == 0)}>
                            <span>{localization.NoKnowledgeArticles}</span>
                        </div>
                    </div>
                </div>
                <div class="sc-page-header sc__home-ro-lists row">
                    <div class="col-md-6 col-xs-12">
                        <h2>{localization.TopRequests}</h2>
                <hr />
                {topRequest.map(request => {
                    return (<div>
                        <div class="col-xs-12 ro-item-home">
                            {request.LinkUrl != null ?
                                <a href={request.LinkUrl} target={request.LinkTargetType}>
                                    <img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} onError={(e) => { ImgOnError(e) }}
                                        class="img-responsive pad-top-0-5" />{request.RequestOfferingLinkTargetType}
                                </a>
                                :
                                <a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id }>
                                    <img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} onError={(e) => { ImgOnError(e) }}
                                    class="img-responsive pad-top-0-5" />
                            </a>
                            }
                            <h5>
                                {request.LinkUrl != null ?
                                    <a href={request.LinkUrl} target={request.LinkTargetType}>{request.Title}</a>
                                    :
                                    <a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id}>{request.Title}</a>
                                }
                            </h5>
                        </div>
                    </div>);
                })}
                        
                    <div class={Show(topRequest.length == 0)}>
                            <span>{localization.NoRequestOfferings}</span>
                        </div>
            </div>

                    <div class="col-md-6 col-xs-12">
                        <h2>{localization.FavoriteRequests}</h2>
                        <hr />
                {favoriteRequest.map(request => {
                    return (<div>
                        <div class="col-xs-12 ro-item-home">
                            {request.LinkUrl != null ?
                                <a href={request.LinkUrl} target={request.LinkTargetType}>
                                    <img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} onError={(e) => { ImgOnError(e) }}
                                        class="img-responsive pad-top-0-5" />{request.RequestOfferingLinkTargetType}
                                </a>
                                :
                                <a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id}>
                                    <img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} onError={(e) => { ImgOnError(e) }}
                                        class="img-responsive pad-top-0-5" />
                                </a>
                            }
                            <h5>
                                {request.LinkUrl != null ?
                                    <a href={request.LinkUrl} target={request.LinkTargetType}>{request.Title}</a>
                                    :
                                    <a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id}>{request.Title}</a>
                                }
                            </h5>
                        </div>
                    </div>);
                })}
                <div class={Show(favoriteRequest.length == 0)}>
                            <span>{localization.NoRequestOfferings}</span>
                        </div>
                    </div>
                </div>
            </div>);
}


export default Home;