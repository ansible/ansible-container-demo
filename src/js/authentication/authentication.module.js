(function () {
    'use strict';

    angular
        .module('demo.authentication', [
            'demo.authentication.controllers',
            'demo.authentication.services'
        ]);

    angular
        .module('demo.authentication.controllers', []);

    angular
        .module('demo.authentication.services', ['ngCookies']);

})();