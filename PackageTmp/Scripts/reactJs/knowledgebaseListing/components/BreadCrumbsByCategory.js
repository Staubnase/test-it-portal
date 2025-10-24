import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useParams, useHistory, Link } from 'react-router-dom'
import * as localization from '../common/Localization';

const BreadCrumbsByCategory = () => {
    const [crumbs, setCrumbs] = useState([]);

    let { categoryName, categoryId } = useParams();

    const getCategoryBreadCrumbs = async (categoryId) => {
        const url = "/api/V3/ArticleCategory/Get?categoryId=" + categoryId;
        const response = await fetch(url);
        const result = await response.json();
        let crumbs = [];

        if (result) {
            _.each(result, function (category) {
                if (category.Id != "032d5e15-761e-e600-3e29-127e9137d926") {
                    category.Url = "/category/" + category.Name + "/" + category.Id;
                    crumbs.push(category);
                }
            });
            setCrumbs(crumbs.reverse());
        }
    }

    useEffect(() => {
        getCategoryBreadCrumbs(categoryId);
    }, [categoryId])

    return (
        <div>
            <ol className="breadcrumb mar-top-1">
                <li><a href="/View/0aef4765-0efa-4a65-84c1-324b09231223">{localization.KnowledgeBase}</a></li>
                {
                    crumbs &&
                    crumbs.map((crumb) =>
                        <li key={crumb.Id}><Link to={crumb.Url}>{crumb.Name}</Link></li>
                    )
                }
            </ol>
        </div>
    )
}

export default BreadCrumbsByCategory