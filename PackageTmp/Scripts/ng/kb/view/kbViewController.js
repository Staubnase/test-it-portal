define(['app',
        '../kbFactory.js',
        '../../shared/providers/userAvatarService.js',
        '../../shared/directives/tableOfContentsDirective.js',
        '../../shared/directives/ratingDirective.js',
        '../../shared/directives/userAvatar.js'
], function (app) {
    'use strict';
    app.controller('kbViewController', ['$scope', '$sanitize', '$timeout', 'kbFactory', '$location', '$anchorScroll', '$sce', '$window', function ($scope, $sanitize, $timeout, kbFactory, $location, $anchorScroll, $sce, $window) {
        //mask while loading
        $scope.loading = true;

        //add localization to the scope
        $scope.localization = localization;

        // what article do we want to show
        $scope.kbId = kbReadID; //had to pull from the global namespace here

        //get article service
        var articleSrvs = kbFactory.article();
        $scope.article = articleSrvs.get({ articleId: $scope.kbId },
            function (data) {
                if (_.isUndefined($scope.article.ArticleId)) {
                    //article was not returned, redirect to error page.
                    window.location = "/Home/Error?message=" + $scope.localization.ArticleNotFound;
                }
                //add two props to $scope.article that are functions to force html trus
                $scope.article.EndUserContentTrusted = function () {
                    return $sce.trustAsHtml($scope.article.EndUserContent);
                };
                $scope.article.AnalystContentTrusted = function () {
                    return $sce.trustAsHtml($scope.article.AnalystContent);
                };

                //remove last item in breadcrumb result (root enum, KA Category, which we do not show)
                if (!_.isNull($scope.article.CategoryBreadcrumbs) && !_.isUndefined($scope.article.CategoryBreadcrumbs)) {
                    $scope.article.CategoryBreadcrumbs.splice($scope.article.CategoryBreadcrumbs.length - 1, 1);
                }

                //use kendo's localization for dates here, ng 'date' filter would require using ng's localization libraries (no)
                if (!_.isUndefined($scope.article.LastModifiedDate)) {
                    $scope.article.LastModifiedDate = kendo.toString(new Date($scope.article.LastModifiedDate), 'd');
                }

                $timeout(function () {
                    hljs.initHighlighting();
                    $window.document.title = $scope.article.Title;
                    $scope.loading = false;
                });
            });

        //should we show analyst content 
        $scope.isAnalyst = session.user.Analyst;
        $scope.isKnowledgeManager = (session.user.KnowledgeManager > 0) ? true : false;
        $scope.alertClass = false;

        /*
         * COMMENTS
         */

        //get comments service
        var commentsSrvs = kbFactory.comments();

        //get comments callback
        $scope.commentsGetCallback = function commentsGetCallback(comments) {
            //use kendo's localization for dates here, ng 'date' filter would require using ng's localization libraries (no)
            _.each(comments, function (comment) {
                if (!_.isUndefined(comment.CreatedDate)) {
                    comment.CreatedDate = kendo.toString(new Date(comment.CreatedDate), 'd');
                }
            });
        };

        //call service
        $scope.articleComments = commentsSrvs.query({ articleId: $scope.kbId }, $scope.commentsGetCallback);

        //save new comment
        $scope.addCommentRating = function (comment, rating) {
            if (!_.isEmpty(comment.Comment)) {
                commentsSrvs.save(comment, function (result) {
                    $scope.articleComments = commentsSrvs.query({ articleId: $scope.kbId }, $scope.commentsGetCallback);
                    $scope.newComment.Comment = '';
                    showSuccess();
                });
            }

            if (rating.Rating > 0) {
                //do we need to add or update rating
                if (rating.CreatedDate) {
                    ratingSrvs.update(rating, function (result) {
                        $scope.rating = ratingSrvs.get({ articleId: $scope.kbId, userId: session.user.Id }, $scope.ratingGetCallback);
                        showSuccess();
                    });
                } else if (rating.Rating > 0) {//make sure we have an actual rating
                    ratingSrvs.save(rating, function (result) {
                        $scope.rating = ratingSrvs.get({ articleId: $scope.kbId, userId: session.user.Id }, $scope.ratingGetCallback);
                        showSuccess();
                    });
                }


            } else {
                $scope.alertClass = 'alert-warning';
                $scope.alertMsg = localization.RatingCommentSubmitErrorMessage;
            }

            function showSuccess() {
                //make the form clean and set the success message
                $scope.commentForm.$setPristine();
                $scope.alertClass = 'alert-success';
                $scope.alertMsg = localization.RatingCommentSubmitSuccessMessage;

                $timeout(function () {
                    $scope.alertClass = false;
                }, 3000);

            }
        }

        //delete comment
        $scope.deleteComment = function (comment) {
            commentsSrvs.delete({ commentId: comment.CommentId }, function (result) {
                //refresh comments
                $scope.articleComments = commentsSrvs.query({ articleId: $scope.kbId }, $scope.commentsGetCallback);
                $scope.newComment.Comment = '';
            });
        };

        //new comment object
        $scope.newComment = {
            KnowledgeArticleID: $scope.kbId,
            Comment: "",
            UserID: session.user.Id
        }

        
        /*
         * RATINGS
         */
        
        //get rating service
        var ratingSrvs = kbFactory.rating();

        //get rating callback
        $scope.ratingGetCallback = function ratingGetCallback(rating) {
            //use kendo's localization for dates here, ng 'date' filter would require using ng's localization libraries (no)
            if (!_.isUndefined(rating.CreatedDate)) {
                rating.CreatedDate = kendo.toString(new Date(rating.CreatedDate), 'd');
            }
        };

        //call service
        $scope.rating = ratingSrvs.get({ articleId: $scope.kbId, userId: session.user.Id }, $scope.ratingGetCallback);
        $scope.rating.ArticleId = $scope.kbId;
        $scope.rating.UserId = session.user.Id;


        /*
         * OTHER
         */
        //scroll to content
        $scope.scrollToContent = function (id) {
            // the element you wish to scroll to.
            $location.hash(id);

            // call $anchorScroll()
            $anchorScroll();
        }

        $scope.commentAlignment = $window.app.isRTL()? "pull-left": "pull-right"
    }]);
});

