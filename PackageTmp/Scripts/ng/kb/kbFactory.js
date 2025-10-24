define(['app'], function (app) {
    'use strict';
    app.factory('kbFactory', ['$resource', function ($resource) {
        //we can add private funstions here
        var privateFunc = function (name) {
            return name.split("").reverse().join(""); //reverses the name
        };

        var dropUnchangedCreatedDate = function (data, headerGetter) {
            delete data['CreatedDate'];

            return data;
        }

        return {
            //get a single article
            article: function () {
                return $resource('/api/V3/Article/Get', {}, {
                    query: { method: 'GET', params: { articleId: '@Id' }, isArray: false }
                });
            },

            //get top articles
            topArticles: function () {
                return $resource('/api/V3/KnowledgeBase/GetTopHTMLKnowledgeArticleList');
            },

            //comments CRUD endpoint
            comments: function () {
                return $resource('/api/V3/ArticleComment');
            },
            rating: function () {
                return $resource('/api/V3/ArticleRating', {}, {
                    query: {
                        method: 'GET',
                        params: { articleId: '@Id', userId: '@Id' },
                        isArray: false
                    },
                    update: {
                        method: 'PUT',
                        params: { rating: '@Rating' },
                    },
                    save: {
                        method: 'POST',
                        params: { rating: '@Rating' },
                    }
                });
            }

        };

    }]);
});