import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";

export const SearchRequest = (searchParams, callback) => {
    
   
    fetch("/api/v3/servicecatalog/search?searchText=" + searchParams.searchText + "&searchType=" + searchParams.searchType + "&skipCount=" + searchParams.skipCount + "&takeCount=" + searchParams.takeCount)
            .then(res => res.json())
        .then((result) => {
                callback(result);
            },
            (error) => { callback([]); });
    
    
}

export const ArticleList = (searchParams, callback) => {
    //query: { method: 'GET', params: { searchText: '@searchText', selectedCategories: '@selectedCategories', selectedTypes: '@selectedTypes', skipCount: '@skipCount' }, isArray: true }
    fetch("/api/V3/ArticleList?searchText=" + searchParams.searchText + "&skipCount=" + searchParams.skipCount)
        .then(res => res.json())
        .then((result) => {

            callback(result);
        },
        (error) => { callback([]); });
}



export const ArticlesPopularity = (count, callback) => {

    fetch("/api/V3/Article/GetTopArticlesByPopularity?count=" + count)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
        (error) => { callback([]); });
}

export const ArticlesView = (count, callback) => {

    fetch("/api/V3/Article/GetTopArticlesByViewCount?count=" + count)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
        (error) => { callback([]); });
}

export const TopRequest = (userId, returnAmount, isScoped, callback) => {

    fetch("/api/V3/ServiceCatalog/GetTopRequestOffering?userId=" + userId + "&returnAmount=" + returnAmount + "&isScoped=" + isScoped)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
         (error) => { callback([]); });
}

export const FavoriteRequest = (userId, returnAmount, isScoped, takeCount, skipCount, callback) => {

    fetch("/api/V3/ServiceCatalog/GetFavoriteRequestOffering?userId=" + userId + "&returnAmount=" + returnAmount + "&isScoped=" + isScoped + "&skipCount=" + skipCount + "&takeCount=" + takeCount)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
         (error) => { callback([]); });
}

export const SCItems = (userId, isScoped, callback) => {

    fetch("/api/V3/ServiceCatalog/GetServiceCatalog?userId=" + userId + "&isScoped=" + isScoped)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
        (error) => { callback([]); });
}

export const GetRequestOffering = (requestOfferingId, serviceOfferingId, userId, isScoped, callback) => {
 
    fetch("/api/V3/ServiceCatalog/GetRequestOffering?userId=" + userId + "&isScoped=" + isScoped + "&requestOfferingId=" + requestOfferingId + "&serviceOfferingId=" + serviceOfferingId)
        .then(res => res.json())
        .then((result) => {
            
            callback(result);
        },
        (error) => {
            callback(undefined);
        });
}

export const GetFavoriteRequest = (userId, isScoped, returnAmount, skipCount, takeCount, callback) => {


    fetch("/api/V3/ServiceCatalog/GetFavoriteRequestOffering?userId=" + userId + "&isScoped=" + isScoped + "&skipCount=" + skipCount + "&returnAmount=" + returnAmount + "&takeCount=" + takeCount)
        .then(res => res.json())
        .then((result) => {
            if (result == undefined || result == null || !Array.isArray(result)) result = [];
            callback(result);
        },
        (error) => {
            callback([]);
        });
}