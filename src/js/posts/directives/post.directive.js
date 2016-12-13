/**
* Post
* @namespace demo.posts.directives
*/
(function () {
  'use strict';

  angular
    .module('demo.posts.directives')
    .directive('post', post);

  /**
  * @namespace Post
  */
  function post() {
    /**
    * @name directive
    * @desc The directive to be returned
    * @memberOf demo.posts.directives.Post
    */
    var directive = {
      restrict: 'E',
      scope: {
        post: '='
      },
      templateUrl: 'templates/posts/post.html'
    };

    return directive;
  }
})();
