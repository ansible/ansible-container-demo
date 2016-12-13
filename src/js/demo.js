(function () {

    'use strict';

    angular.module('demo', [
        'demo.routes',
        'demo.config',
        'demo.authentication',
        'demo.layout',
        'demo.utils',
        'demo.posts',
        'demo.profiles'
    ]);

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