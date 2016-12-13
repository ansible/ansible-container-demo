(function () {

    'use strict';

    angular.module('demo', [
        'demo.authentication',
        'demo.layout',
        'demo.utils',
        'demo.posts',
        'demo.profiles',
        'ngRoute'
    ]);

    angular.module('demo').config(config);

    config.$inject = ['$locationProvider', '$routeProvider'];

    /**
     * @name config
     * @desc Enable HTML5 routing. Configure routes.
     */
    function config($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.when('/register', {
            controller: 'RegisterController',
            controllerAs: 'vm',
            templateUrl: '/templates/register.html'
        }).when('/login', {
            controller: 'LoginController',
            controllerAs: 'vm',
            templateUrl: '/templates/login.html'
        }).when('/', {
            controller: 'IndexController',
            controllerAs: 'vm',
            templateUrl: '/templates/layout/index.html'
        }).when('/+:username', {
            controller: 'ProfileController',
            controllerAs: 'vm',
            templateUrl: '/templates/profiles/profile.html'
        }).when('/+:username/settings', {
            controller: 'ProfileSettingsController',
            controllerAs: 'vm',
            templateUrl: '/templates/profiles/settings.html'
        }).otherwise('/');
    }


    angular.module('demo').run(run);

    run.$inject = ['$http'];

    /**
     * @name run
     * @desc Update xsrf $http headers to align with Django's defaults
     */
    function run($http) {
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    }

})();
