/* global define: true */
/* global _: true */
/* global app: true */

// This is a stubbed-out port of navigationAdmin.navigationService;
// I'm assuming we'll want to translate it to angular at some point

(function() {
	'use strict';

	define([
		'app'
	], function(ngApp) { //avoid collisions with the global app.js

		ngApp.factory('NavigationNodeService', ['$http', '$log', NavigationNodeService]);

		function NavigationNodeService($http, $log) {

			var selectedNode = null;

			var service = {

				findNodes: function(collection, filter) {
					var results = _.where(collection, filter);
					var self = this;
					_.each(collection, function(node) {
						if(node.Children) {
							results = results.concat(self.findNodes(node.Children, filter));
						}
					});
					return results;
				},
				findNodeById: function(id) {
					var results = this.findNodes(this.getSessionStorageNodes(), {Id: id});
					if(results.length === 0) {
						$log.info('no node with id ' + id + ' was found');
					} else if(results.length > 1) {
						$log.info(results.length + ' nodes were found with id ' + id, results);
					} else {
						return results[0];
					}
				},
				getBreadcrumbNodes: function(node) {
					var crumbs = [];
					crumbs.push(node);
					var currentNode = node;
					while(currentNode.ParentId) {
						currentNode = this.findNodeById(currentNode.ParentId);
						crumbs.push(currentNode);
					}
					crumbs = crumbs.reverse();
					return crumbs;
				},
				getSelectedNode: function() {
					return selectedNode;
				},
				getSessionStorageNodes: function() {
					//app exists in the global space
					return app.storage.nodes.session.getAll().all;
				},
				isNodeSelected: function(node) {
					return node === selectedNode;
				},
				selectNode: function(node) {
					selectedNode = node;
				}
			};

			return service;
		}
	});
})();