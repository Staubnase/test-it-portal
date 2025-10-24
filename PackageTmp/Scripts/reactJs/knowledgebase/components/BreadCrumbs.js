import React, { useState, useEffect } from 'react';
import * as localization from '../common/Localization';

const BreadCrumbs = ({ breadcrumbs }) => {
    const breadcrumbList = !_.isUndefined(breadcrumbs) && !_.isNull(breadcrumbs)?
        breadcrumbs.map((crumb) => <li key={crumb.Id}><a href="/KnowledgeBase/Listing#/category/{crumb.Name}/{crumb.Id}">{crumb.Name}</a></li>)
        : "";

    return (
        <div>
            <ol class="breadcrumb mar-top-1">
                <li><a href="/View/0aef4765-0efa-4a65-84c1-324b09231223">{localization.KnowledgeBase}</a></li>
                {breadcrumbList}
            </ol>
        </div>
    )
}

export default BreadCrumbs