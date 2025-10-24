import React, { useState, useEffect } from 'react';
import StarComponent from "react-rating-stars-component";

const Ratings = ({ article }) => {

    return (
        <div>
            <ul class="list-unstyled">
                <li class="article-ratings"><strong>{localization.Ratings}:</strong>
                    <div class="article-star-rating">
                        {
                            (!_.isUndefined(article) && (article.Rating > 0)) &&
                            <StarComponent count={5} size={24} value={article.Rating} activeColor="#000" color="#D4D4D4" edit={false} /> 
                        }
                        {
                            (!_.isUndefined(article) && (article.Rating <= 0)) &&
                            <StarComponent count={5} size={24} color="#D4D4D4" edit={false} />
                        }
                    </div>
                </li>
                <li class="article-view-count"><strong>{localization.Views}:</strong> {article.ViewCount}</li>
                <li class="article-modified"><strong>{localization.Modified}:</strong> {article.LastModifiedDate}</li>
                <li class="article-status"><strong>{localization.Status}:</strong> {article.Status.Name}</li>
            </ul>
        </div>
    )
}

export default Ratings
