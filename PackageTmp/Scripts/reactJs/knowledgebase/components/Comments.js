import React, { useState, useEffect } from 'react';
import Moment from 'moment';
import CommentForm from '../components/CommentForm';
import UserAvatar from '../components/UserAvatar';
import * as localization from '../common/Localization';

const Comments = ({ comments, commentCount, onDeleteComment, onAddComment, onAddRating, alertMsg, ratings }) => {

    let commentAlignment = app.isRTL() ? "pull-left" : "pull-right";
    let className = 'comment ' + commentAlignment;
    return (
        <div class="article-comment-rating">
            <CommentForm onAddComment={onAddComment} onAddRating={onAddRating} alertMsg={alertMsg} ratings={ratings} />
            <h2>{localization.Comments}<small>({commentCount})</small></h2>
            <hr />
            {!_.isUndefined(comments) &&
                comments.map((comment) => <div>
                    <div class="row mar-top-2 article-comment">
                        <div class="col-xs-12">
                            <UserAvatar userFirstName={comment.UserFirstName} userLastName={comment.UserLastName} />
                            <div className={className}>
                                <div>
                                    <small>{comment.UserFirstName} {comment.UserLastName} - {comment.CreatedDate}</small>
                                    <span class="pull-right fa fa-trash-o fa-lg cursor-pointer" onClick={() => onDeleteComment(comment.CommentId)}></span>
                                </div>
                                <p>{comment.Comment}</p>
                            </div>
                        </div>
                    </div>
                </div>)
            }
        </div>
    )
}

export default Comments