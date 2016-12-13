(function () {

    'use strict';

    angular
        .module('demo.routes', ['ngRoute'])
        .config(config);

    config.$inject = ['$routeProvider'];

    /**
     * @name config
     * @desc Define valid application routes
     */
    function config($routeProvider) {
        $routeProvider.when('/register', {
            controller: 'RegisterController',
            controllerAs: 'vm',
            templateUrl: '/static/templates/register.html'
        }).when('/login', {
            controller: 'LoginController',
            controllerAs: 'vm',
            templateUrl: '/static/templates/login.html'
        }).when('/', {
            controller: 'IndexController',
            controllerAs: 'vm',
            templateUrl: '/static/templates/layout/index.html'
        }).when('/+:username', {
            controller: 'ProfileController',
            controllerAs: 'vm',
            templateUrl: '/static/templates/profiles/profile.html'
        }).when('/+:username/settings', {
            controller: 'ProfileSettingsController',
            controllerAs: 'vm',
            templateUrl: '/static/templates/profiles/settings.html'
        }).otherwise('/');
    }

})();
