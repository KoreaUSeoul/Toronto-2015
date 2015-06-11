'use strict';

angular.module('fbaApp', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'app/pages/home/home.html',
            controller: 'HomeCtrl'
        });
})

.controller('BodyCtrl', ['$scope', function($scope) {
    $scope.title = 'iGEM UofT Computational Biology';
}]);
