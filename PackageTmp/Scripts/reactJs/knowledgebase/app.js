import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Spinner from './components/Spinner'
import BreadCrumbs from './components/BreadCrumbs'
import Article from './components/Article'
import Comments from './components/Comments'
import Ratings from './components/Ratings'
import TableOfContents from './components/TableOfContents'
import 'regenerator-runtime/runtime'

const App = () => {
    
    const [article, setArticle] = useState({
        Title: "",
        CategoryBreadcrumbs: [{ Id: "", Name: "" }],
        Status: [{ Id: "", Name: "" }],
        Comments:[],
        Rating: 0,
        ViewCount: 0,
        LastModifiedDate: "",
    });

    const id = window.location.pathname.split("/").pop();

    const [ratings, setRatings] = useState({
        Rating: 0,
        CreatedDate: ""
    });
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);
    const [breadcrumbs, setBreadCrumbs] = useState([]);
    const [alertMessage, setAlertMessage] = useState("");
    const [endUserContent, setEndUserContent] = useState("");
    const [analystContent, setAnalystContent] = useState("");

    const deleteComment = async (id) => {
        const url = "/api/V3/ArticleComment/Delete?commentId=" + id;
        const response = await fetch(url, { method: 'DELETE' });
        const result = await response.json();
        if (result == true) {
            setCommentCount(commentCount - 1);
            setComments(comments.filter((comment) => comment.CommentId !== id))
        }
    }

    const addComment = async (newComment) => {
       
        const requestBody = {
            KnowledgeArticleID: id,
            UserID: session.user.Id,
            Comment: newComment,
            Helpful: true,
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };


        const url = "/api/V3/ArticleComment/";
        const response = await fetch(url, requestOptions);
        const result = await response.json();
       
        if (result == true) {
            setAlertMessage(localization.RatingCommentSubmitSuccessMessage);
            getComments(id);
        } else {
            setAlertMessage(localization.RatingCommentSubmitErrorMessage)
        }
    };

    const getComments = async (articleId) => {
        const url = "/api/V3/ArticleComment/Get?articleId=" + articleId;
        const response = await fetch(url);
        const result = await response.json();

        _.each(result, function (comment) {
            if (!_.isUndefined(comment.CreatedDate)) {
                comment.CreatedDate = kendo.toString(new Date(comment.CreatedDate), 'd');
            }
        });

        setComments(result);
        setCommentCount(result.length);
    };

    const fetchArticle = async (id) => {
        const url = "/api/V3/Article/Get?articleId=" + id;
        const response = await fetch(url);
        const result = await response.json();
        const crumbs = [];

        result.LastModifiedDate = kendo.toString(new Date(result.LastModifiedDate), 'd');

        _.each(result.CategoryBreadcrumbs, function (articleCrumb, i) {

            if (articleCrumb.Id != "032d5e15-761e-e600-3e29-127e9137d926") {
                crumbs.push(articleCrumb);
            }
        });

        setArticle(result);
        setBreadCrumbs(crumbs);
        setEndUserContent(result.EndUserContent);
        setAnalystContent(result.AnalystContent);
    }

    const onAddRating = async (newRating) => {
        const requestBody = {
            ArticleID: id,
            UserID: session.user.Id,
            Rating: newRating,
            CreatedDate: new Date(),
        }

        const requestOptions = {
            method: (ratings == null) ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };


        const url = "/api/V3/ArticleRating/";
        const response = await fetch(url, requestOptions);
        const result = await response.json();

        if (result == true) {
            setAlertMessage(localization.RatingCommentSubmitSuccessMessage);
            getUserRatings(id, session.user.Id);
        } else {
            setAlertMessage(localization.RatingCommentSubmitErrorMessage)
        }
    };

    const getUserRatings = async (articleId, userId) => {
        const url = "/api/V3/ArticleRating/Get?articleId=" + articleId + "&userId=" + userId;
        const response = await fetch(url);
        const result = await response.json();
        
        if (!_.isNull(result))
            result.CreatedDate = kendo.toString(new Date(result.CreatedDate), 'd');

        setRatings(result);
    };

    const onAnalystContentClick = () => {
        $('html,body').animate({
            scrollTop: $("#analyst-content").offset().top - 50
        }, 'slow');
    }

    useEffect(() => {
        fetchArticle(id);
        getComments(id);
        getUserRatings(id, session.user.Id);
    },[]);

    return (
        <div class="container-fluid kb-mobile-container-content">
            <div class="row">
                <div class="col-sm-12 kb">
                    {!_.isUndefined(article) ?
                        <div class="row">
                            <div class="col-sm-9 col-sm-right-offset-3">
                                <BreadCrumbs breadcrumbs={breadcrumbs} />
                                <Article article={article} />
                                <Comments comments={comments} commentCount={commentCount} onDeleteComment={deleteComment} onAddComment={addComment}
                                    ratings={ratings} onAddRating={onAddRating} alertMsg={alertMessage} />
                            </div>
                            <div class="col-sm-3 sidebar-right pad-top-1-5 hidden-xs">
                                <Ratings article={article} />
                                <hr class="tree-heading-hr" />
                                <div class="article-table-of-contents">
                                    <p class="article-table-of-contents-title">{localization.TableOfContents}</p>
                                    <nav class="sidebar-nav">
                                        {(endUserContent != "") && <TableOfContents content={endUserContent} contentType={"end-user"} />}
                                    </nav>
                                    {(analystContent != "" && session.user.Analyst) ?
                                        <nav class="sidebar-nav" ng-if="isAnalyst && article.AnalystContent">
                                        <hr />
                                            <ul class="nav sidenav"><li class="analyst-link"><a href="#analyst-content" onClick={() => onAnalystContentClick() }><h1>{localization.AnalystContent}</h1></a></li></ul>
                                         <TableOfContents content={analystContent} contentType={"analyst-content"} /> 
                                        </nav>
                                        : ""}
                                </div>
                                
                            </div>
                        </div> : <Spinner />}
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('KBArticleView'));
