import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import * as localization from '../common/Localization';

const BreadCrumbs = ({ Breadcrumbs }) => {
    const [crumbs, setCrumbs] = useState([]);

    useEffect(() => {
        setCrumbs(Breadcrumbs);
    }, [Breadcrumbs]);

    return (
        <div>
            <ol className="breadcrumb mar-top-1">
                <li><a href="/View/0aef4765-0efa-4a65-84c1-324b09231223">{localization.KnowledgeBase}</a></li>
                {
                    crumbs &&
                    crumbs.map((crumb) => <li key={crumb.Id}><li key={crumb.Id}><Link to={crumb.Url}>{crumb.Name}</Link></li></li>)
                }
            </ol>
        </div>
    )
}

export default BreadCrumbs