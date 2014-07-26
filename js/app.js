angular.module('ionicApp', ['ionic', 'controller'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('eventmenu', {
      url: "/event",
      abstract: true,
      templateUrl: "event-menu.html"
    })
    .state('eventmenu.home', {
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "home.html"
        }
      }
    })
    // .state('eventmenu.checkin', {
    //   url: "/check-in",
    //   views: {
    //     'menuContent' :{
    //       templateUrl: "check-in.html",
    //       controller: "CheckinCtrl"
    //     }
    //   }
    // })
    // .state('eventmenu.attendees', {
    //   url: "/attendees",
    //   views: {
    //     'menuContent' :{
    //       templateUrl: "attendees.html",
    //       controller: "AttendeesCtrl"
    //     }
    //   }
    // });
  
  $urlRouterProvider.otherwise("/event/home");
});
