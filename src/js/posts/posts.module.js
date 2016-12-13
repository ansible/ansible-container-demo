(function () {
    'use strict';

    angular
        .module('demo.posts', [
            'demo.posts.controllers',
            'demo.posts.directives',
            'demo.posts.services'
        ]);

    angular
        .module('demo.posts.directives',  ['ngDialog'])

    angular
        .module('demo.posts.controllers', [])

    angular
        .module('demo.posts.services', [])

})();