// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

angular.module('random-lunch-places', [])

.factory('LunchPlaces', ['$resource', function($resource) {
  return $resource({
    url: '/lunch-places',
  });
}])

.service('lunchPlaces', ['$http', function($http) {
  
  const lunchPlaces = [];
  
  return {
    getAllLunchPlaces,
    getRandomLunchPlace,
    addLunchPlace,
    deleteLunchPlace,
  };
  
  function getAllLunchPlaces() {
    $http.get('/lunch-places')
    .success((res) => {
      lunchPlaces.length = 0;
      res.lunchPlaces.forEach((place) => lunchPlaces.push(place));
    });
    
    return lunchPlaces;
  }
  
  function getRandomLunchPlace() {
    return $http.get('/lunch-places/random')
    .then((response) => response.data.randomPlace);
  }
  
  function addLunchPlace(lunchPlace) {
    return $http.post('/lunch-places', { place: lunchPlace })
    .then(() => lunchPlaces.push(lunchPlace));
  }
  
  function deleteLunchPlace(lunchPlace) {
    return $http.delete('/lunch-places/' + lunchPlace)
    .then(() => getAllLunchPlaces());
  }
 
}])

.controller('placesCtrl', ['$scope', 'lunchPlaces', function($scope, lunchPlaces) {
  Object.assign($scope, {
    addLunchPlace,
    lunchPlaces: lunchPlaces.getAllLunchPlaces(),
    deleteLunchPlace: lunchPlaces.deleteLunchPlace
  });

  lunchPlaces.getRandomLunchPlace()
  .then((randomPlace) => $scope.randomPlace = randomPlace);
  
  function addLunchPlace() {
    lunchPlaces.addLunchPlace($scope.newPlace)
    .then(() => $scope.newPlace = '');
  }
  
}])


;