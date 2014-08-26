(function (ns) {
    'use strict';
    ns.app = angular.module('RicochetApp', ['ngRoute']);

    ns.app.config(function ($routeProvider) {
        $routeProvider
          .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
          })
          .otherwise({
            redirectTo: '/'
          });
      });
})(window);