/* global define:true */
/* global app:true */

(function() {
	'use strict';

	define([
		'app'
	], function(ngApp) {

		ngApp.factory('pageService', ['$http', '$q', '$log', PageService]);

		function PageService($http, $q, $log) {

			var navigationAdminUrl = '/NavigationAdmin/';

			var service = {
				getNavigationNode: function () {
	                var d = $q.defer();
	                //*app.lib* exists in the global space, apart from angular
	                app.lib.getNavNode(function(matchedNode) {
	                    d.resolve(matchedNode);
	                });

	                return d.promise;
	            },

	            updateDefinition: function (guid, definition) {
	                var d = $q.defer();
                    var url = navigationAdminUrl + 'ChangeDefinition/';

                    //Clear the allColumns property before saving. Bug-32130
                    _.each(definition.rows, function (row) {
                        _.each(row.columns, function (col) {
                            _.each(col.widgets, function (widget) {
                                if (widget.config?.allColumns != null) {
                                    widget.config.allColumns = [];
                                };
                            });
                        });
                    });

	                var postData = {
	                    id: guid,
                        definition: JSON.stringify(definition)
	                };
                  
                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: url,
                        data: postData,
                        success: function (data, status, xhr) {
                            d.resolve(data);
                            app.populateSessionStorage();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            $log.warn(xhr, ajaxOptions, thrownError);
                            d.reject(data);
                        },
                        async: true
                    });


	                return d.promise;
	            }
			};

			return service;
		}
	});
})();