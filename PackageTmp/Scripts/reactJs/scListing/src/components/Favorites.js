import React, { Component, useState, useEffect } from 'react';
import * as ReactDOM from "react-dom";
import {
    Link,
    HashRouter,
    useParams
} from "react-router-dom";
import { Show, toggleBar, ImgOnError } from './Common';
import { GetFavoriteRequest } from './factory';
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from './Loader';

export default function Favorites(props) {

	const [favoriteRequests, setSavoriteRequests] = useState([]);
	const [infiniteLoading, setInfiniteLoading] = useState(false);
	let skipCount = 0;
    useEffect(() => {
		LoadFavoriteRequest();
	}, []);

	function LoadFavoriteRequest() {
		setInfiniteLoading(true);
		skipCount = favoriteRequests.length;
		GetFavoriteRequest(session.user.Id, session.user.Security.IsServiceCatalogScoped, -1, skipCount, 10,
			function (data) {
				setSavoriteRequests(pre => [
					...pre,
					...data
				]);
				setInfiniteLoading(false);
			});

	}

    return (
		<div ui-view="" class="">
			<div class="ng-scope">
				<ol class="breadcrumb mar-top-1 mar-bot-0">
					<li><Link to="/" class="ng-binding">{localization.Home}</Link></li>
					<li class="active ng-binding">{localization.FavoriteRequests}</li>
				</ol>
			</div>
			<br />
			<div class="sc__ro-lists ng-scope" ng-show="!loading">
				<h3 class="margin-b10">{localization.FavoriteRequests}</h3>
				<hr />
				<div class="row" infinite-scroll-immediate-check="false" infinite-scroll-disabled="fetching" infinite-scroll-distance="0">
					

					<InfiniteScroll
						dataLength={favoriteRequests.length}
						next={LoadFavoriteRequest}
						hasMore={true}
						loader={<Loader showLoader={infiniteLoading} />}
					>
						{favoriteRequests.map((request) => (
							<div class="ro-item-list">
								<div class="media-link">
									<a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id} class={Show(request.LinkUrl == null)}>
										<img src={"/ServiceCatalog/GetRequestOfferingImg/" + request.Id} onError={(e) => { ImgOnError(e) }} class="img-responsive pad-top-0-5"  />
									</a>
									<div>
										<h5>
											<a href={"/ServiceCatalog/RequestOffering/" + request.Id + "," + request.ServiceInfo.Id} class={Show(request.LinkUrl == null)}>{request.Title}</a>
											<span class="ro-desc">{request.BriefDescription}</span>
										</h5>

									</div>
								</div>
							</div>
						))}
					</InfiniteScroll>
				</div>
				<div ng-show="noMoreFavoritesMessage.length > 0" class="">
					<hr />
					<p class="lead text-center"></p>
				</div>
				<div class={Show(favoriteRequests.length === 0)}>
					<div class="media-link">
						<span class="ng-binding">{localization.NoRequestOfferings}</span>
					</div>
				</div>
			</div>
		</div>
    );
}
