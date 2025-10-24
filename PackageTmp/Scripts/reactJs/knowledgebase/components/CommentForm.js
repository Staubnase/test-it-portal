import React, { useState, useEffect } from 'react';
import StarComponent from "react-rating-stars-component";
import * as localization from '../common/Localization';
import Moment from 'moment';

const CommentForm = ({ onAddComment, onAddRating, alertMsg, ratings }) => {
    const [ratingValue, setRatingValue] = useState(!_.isNull(ratings) ? ratings.Rating : 0);
    const [newComment, setNewComment] = useState("");
    
    const onSubmit = () => {
        if (newComment != "") { 
            onAddComment(newComment);
        }

        if (ratingValue > 0) {
            onAddRating(ratingValue);
        }

        setNewComment("");
    }

    const onRatingChanged = (newRating) => {
        setRatingValue(newRating);
    };


    return (
        <div>
            <div class="row mar-top-3 bg-dark-grey">
                <div class="col-xs-1 hidden-xs"><i class="fa fa-file-text-o fa-4x"></i></div> 
                <div class="col-xs-12">
                    <div>
                        <h4>{localization.WasArticleHelpful}</h4>
                        <div> {localization.Rate}:
                                <div class="article-star-comment"> <StarComponent count={5} size={24} activeColor="#008FD6" color="#D4D4D4" onChange={onRatingChanged} /> </div>
                            {(!_.isNull(ratings) && ratings.CreatedDate != "") &&
                                <span class="article-user-rating-date article-user-rating"> - {localization.YourLastRating}: {ratings.CreatedDate}</span>
                            }
                        </div>
                        <div class="form-group">
                            <textarea class="form-control" value={newComment} name="comment" onChange={(e) => setNewComment(e.target.value)} placeholder={localization.ArticleCommentPlaceholder} ></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary pull-right mar-top-1" onClick={() => onSubmit()}>{localization.Submit}</button>
                    </div>
                </div>
            </div>
            <div>
                <div class="alert">{alertMsg}</div>
            </div>
        </div>
    )
}

export default CommentForm