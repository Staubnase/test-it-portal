/* global define: true */
/* global session: true */
(function() {

	'use strict';

	define(['app'], function(ngApp) {

		ngApp.factory('UserService', ['$http', '$q', UserService]);

		function UserService($http, $q) {

			var sessionUser = null;
			return {
				getSessionUser: function() {
					var deferred = $q.defer();
					if(sessionUser) {
						deferred.resolve(sessionUser);
					} else {
						sessionUser = session.user; //global
						deferred.resolve(sessionUser);
					}
					return deferred.promise;
				},
				setSessionUser: function(user) {
					sessionUser = user;
				}
			};
		}
	});
})();