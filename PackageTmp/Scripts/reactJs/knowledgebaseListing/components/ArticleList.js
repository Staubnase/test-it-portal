import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import * as localization from '../common/Localization';
import Spinner from '../components/Spinner';
import InfiniteScroll from "react-infinite-scroll-component";

const ArticleList = () => {
    let { searchText, selectedCategories, selectedTypes } = useParams();

    const [showLoading, setShowLoading] = useState(true);
    const [articleList, setArticleList] = useState([]);
    const [hasSearchResult, setHasSearchResult] = useState(false);
    const [hasMoreArticles, setHasMoreArticles] = useState(true);

    const searchArticle = async (searchInputText, searchCategories, searchTypes, skipCount, takeCount) => {
        let searchURl = "/api/V3/ArticleList?searchText=" + searchInputText;

        if (!_.isUndefined(searchCategories)) { 
            _.each(searchCategories.split("&"), function (catId, i) {
                searchURl += "&selectedCategories=" + catId;
            });
        }

        if (!_.isUndefined(searchTypes)) {
            _.each(searchTypes.split("&"), function (typeId, i) {
                searchURl += "&selectedTypes=" + typeId;
            });
        }

        searchURl += "&skipCount=" + skipCount + "&takeCount=" + takeCount;

        const response = await fetch(searchURl);
        const result = await response.json();

        if (result) {
            _.each(result, function (article) {
                article.LastModifiedDate = kendo.toString(new Date(article.LastModifiedDate), 'd');
            });

            setHasSearchResult(result.length > 0 ? true : false);
            setHasMoreArticles(result.length == takeCount);

            if (skipCount == 0) {
                setArticleList(result);
            } else {
                setArticleList(prevState => [
                    ...prevState,
                    ...result
                ]);
            }

            setShowLoading(false);
        }
    }

    const fetchMoreListItems = () => {
        setTimeout(() => {
            searchArticle(searchText, selectedCategories, selectedTypes, articleList.length, 20);
        }, 2000);
    };


    useEffect(() => {
        searchArticle(searchText, selectedCategories, selectedTypes, 0, 20);
    }, [searchText, selectedCategories, selectedTypes]);
  
    const Articles = ({ articles }) => {
        return (
            articles &&
            articles.map((article) =>
                 <div className="article-result">
                    <h5>
                        <a href={`/KnowledgeBase/View/${article.ArticleId}`} className="article-external-link" target="_blank"><i className="fa fa-external-link"></i></a>
                        <a href={`/KnowledgeBase/View/${article.ArticleId}`} className="article-title">
                            {article.Status.Id == '7557d680-56be-9bde-6f6b-e70a15de2da3' && <span className="text-muted" >[{article.Status.Name}] </span>}
                            {article.Title}
                        </a>

                        <small className="article-meta">
                            {localization.Rating} {article.AverageRating}/5 &nbsp;&middot;&nbsp;
                                {article.ViewCount} {localization.Views} &nbsp;&middot;&nbsp;
                                {localization.LastUpdated}: {article.LastModifiedDate}
                        </small>
                    </h5>
                    {article.Description.length > 0 &&
                        <p className="article-result-desc">
                            <span>{article.Description}</span>
                        <a href={`/KnowledgeBase/View/${article.ArticleId}`}>{ localization.ReadMore }<i className="fa fa-angle-right"></i></a>
                        </p>
                    }

                </div>)
        )
    }

    return (
        <div className="articles mar-top-3">
            {showLoading ?
                <div>
                    <Spinner />
                </div> :
                <div>
                    {hasSearchResult ?
                        <div>
                            <h2>
                                {localization.SearchForLabel} {searchText}
                            </h2>
                            <InfiniteScroll
                                dataLength={articleList.length}
                                next={fetchMoreListItems}
                                hasMore={hasMoreArticles}
                                loader={<Spinner />}
                            >
                                <Articles articles={articleList} />
                            </InfiniteScroll>
                            <hr />
                            {!hasMoreArticles && <p className="lead text-center" >{localization.NoMoreArticlesFound}</p>}
                           
                        </div> :
                        < div >
                            <h2>{localization.NoResults}</h2>
                        </div>
                    }
             
                </div>
            }
        </div>
    )
}

export default ArticleList