import React, { useState, useEffect } from 'react';
import * as localization from '../common/Localization';

const Article = ({ article }) => {
    const addArticleHeaderIds = (elements, type) => {
        let idCount = 0;
        _.each(elements, function (child) {
            if (child.nodeName.toLowerCase() == 'h1' || child.nodeName.toLowerCase() == 'h2' || child.nodeName.toLowerCase() == 'h3' || child.nodeName.toLowerCase() == 'h4'
                || child.nodeName.toLowerCase() == 'h5' || child.nodeName.toLowerCase() == 'h6') {
                idCount = idCount + 1;

                let currentId = "heading-" + idCount + "-" + type;
                let childElem = $(child)[0];

                childElem.id = currentId;
            }
        });
    }

    useEffect(() => {
        let endUserContentElements = $(".article-enduser-content")[0];
        let analystContentElements = $(".kb-analyst-content")[0];
        
        if (!_.isUndefined(endUserContentElements))
            addArticleHeaderIds(endUserContentElements.children, "end-user");
        if (!_.isUndefined(analystContentElements))
            addArticleHeaderIds(analystContentElements.children, "analyst-content");
       
            
    },[article]);

    return (
        <div>
            <h1>{article.Title}</h1>
            <div class="visible-xs"></div> {/*todo: small screen layout*/}
            <hr class="hidden-xs" />
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12" id="alertMessagesContainer"></div>
                </div>
            </div>
            <div class="article-enduser-content" dangerouslySetInnerHTML={{ __html: article.EndUserContent }}></div>

            {(session.user.Analyst == 1 && article.AnalystContent!="") &&
                <div id="analyst-content"  class="article-analyst-content">
                    <h4 >{localization.AnalystContent}</h4>
                    <div class="kb-analyst-content" dangerouslySetInnerHTML={{ __html: article.AnalystContent}}></div>
                </div>
            }
        </div>
    )
}

export default Article
