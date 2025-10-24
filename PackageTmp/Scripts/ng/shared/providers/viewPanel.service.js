/* global define: true */
/* global app: true */
/* global _: true */

(function() {
	'use strict';

	define(['app'], function(ngApp) { //avoid collision with app.js in global space

		ngApp.factory('ViewPanelService', [ViewPanelService]);

		function ViewPanelService() {

			return {

				getSessionStorageViewPanels: function() {
					//app exists in the global space
					return app.storage.viewPanels.session.getAll().all;
				},
				findViewPanel: function(collection, filter) {
					return _.where(collection, filter);
				},
				findViewPanelById: function(id) {
					var results = [];
					var match = null;
					results = this.findViewPanel(this.getSessionStorageViewPanels(), { Id: id });
					if(results.length === 1) {
						match = results[0];
					} else if (results.length > 1) {
						//id should be unique, but what should we do if more than one result is returned?
						match = results[0];
					} 

					return match;
				},
				findViewPanelByTypeId: function(typeId) {
					return this.findViewPanel(this.getSessionStorageViewPanels(), { TypeId: typeId });
				},
				findQueryBuilderViewPanels: function() {
					return this.findViewPanelByTypeId('queryBuilder');
				}
			};
		}
	});
})();