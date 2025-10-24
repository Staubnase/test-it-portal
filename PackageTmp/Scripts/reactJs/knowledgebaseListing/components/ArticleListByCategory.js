import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useParams, useHistory, Link } from 'react-router-dom'
import * as localization from '../common/Localization';
import Spinner from '../components/Spinner';
import InfiniteScroll from "react-infinite-scroll-component";

const ArticleListByCategory = () => {
    let { categoryName, categoryId } = useParams();

    const [showLoading, setShowLoading] = useState(true);
    const [articleList, setArticleList] = useState([]);
    const [hasResult, setHasResult] = useState(false);
    const [hasMoreArticles, setHasMoreArticles] = useState(true);

    const getArticlesByCategory = async (categoryId,skipCount,takeCount) => {
        const url = "/api/V3/ArticleList/Get?categoryId=" + categoryId + "&skipCount=" + skipCount + "&takeCount=" + takeCount;
        const response = await fetch(url);
        const result = await response.json();

        if (result) {
            _.each(result.Articles, function (article) {
                article.Article.LastModifiedDate = kendo.toString(new Date(article.Article.LastModifiedDate), 'd');
            });
            
            setHasResult(result.Articles.length > 0);
            setHasMoreArticles(result.Articles.length == takeCount);

            if (skipCount == 0) {
                setArticleList(result.Articles);
            } else {
                setArticleList(prevState => [
                    ...prevState,
                    ...result.Articles
                ]);
            }

            setShowLoading(false);
        }
    }

    useEffect(() => {
        getArticlesByCategory(categoryId,0,20);
    }, [categoryId])

    const fetchMoreListItems = () => {
        setTimeout(() => {
            getArticlesByCategory(categoryId, articleList.length, 20);
        }, 2000);
    };
  
    const Articles = ({ articles }) => {
        return (
            articles.length > 0 &&
            articles.map((article) =>
                <div className="article-result-group" >
                    <div className="article-result">
                        <h5>
                            <a href={`/KnowledgeBase/View/${article.Article.ArticleId}`} className="article-external-link" target="_blank"><i className="fa fa-external-link"></i></a>
                            <a href={`/KnowledgeBase/View/${article.Article.ArticleId}`} className="article-title">
                                {article.Article.Status.Id == '7557d680-56be-9bde-6f6b-e70a15de2da3' && <span className="text-muted" >[{article.Article.Status.Name}] </span>}
                                {article.Article.Title}
                            </a>
                            <small className="article-meta">
                                <ArticleMiniCrumbs contextCrumbs={article.ContextCrumbs} /> 
                                 &nbsp;&middot;&nbsp;   {localization.Rating} {article.Article.AverageRating}/5 &nbsp;&middot;&nbsp;
                                {article.Article.ViewCount} {localization.Views} &nbsp;&middot;&nbsp;
                                {localization.LastUpdated}: {article.Article.LastModifiedDate}
                            </small>
                        </h5>
                    </div>
                </div>)


        )
    }

    const ArticleMiniCrumbs = ({ contextCrumbs }) => {
        return (
            contextCrumbs.length > 0 &&
            contextCrumbs.map((crumb, index) =>
                <span>
                    {index == 0 &&
                        <span>
                            <span className="mini-crumb-root">{crumb.Name}</span>
                        </span>
                    }
                    &nbsp;
                    {index != 0 &&
                        <span >
                            <a className="mini-crumb-link" href={`/category/${crumb.Name}/${crumb.Id}`}>{crumb.Name}</a>
                        </span>
                    }
                    &nbsp;
                    {index != contextCrumbs.length - 1 &&
                        <i className="fa fa-angle-right"></i>
                    }

                </span>)
        )
    }

    return (
        <div className="articles mar-top-3">
            {showLoading ?
                <div>
                    <Spinner />
                </div> :
                <div>
                    {hasResult ?
                        <div>
                            <h2>
                                {localization.Category} &ndash; {categoryName}
                            </h2>
                            <InfiniteScroll
                                dataLength={articleList.length}
                                next={fetchMoreListItems}
                                hasMore={hasMoreArticles}
                                loader={<Spinner/>}
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

export default ArticleListByCategory