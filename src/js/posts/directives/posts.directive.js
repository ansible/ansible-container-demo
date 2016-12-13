/**
* Posts
* @namespace demo.posts.directives
*/
(function () {
  'use strict';

  angular
    .module('demo.posts.directives')
    .directive('posts', posts);

  /**
  * @namespace Posts
  */
  function posts() {
    /**
    * @name directive
    * @desc The directive to be returned
    * @memberOf demo.posts.directives.Posts
    */
    var directive = {
      controller: 'PostsController',
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        posts: '='
      },
      templateUrl: 'templates/posts/posts.html'
    };

    return directive;
  }
})();
