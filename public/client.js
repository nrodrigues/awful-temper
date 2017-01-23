// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

angular.module('random-lunch-places', [])

.controller('placesCtrl', function($scope, lunchPlaces, auth) {
  Object.assign($scope, {
    isReadOnly: () => !auth.get(),
    addLunchPlace,
    lunchPlaces: lunchPlaces.getAllLunchPlaces(),
    deleteLunchPlace: lunchPlaces.deleteLunchPlace,
    rejectTodaysPlace,
    votersMessage,
    model: {
      newPlace: null,
    },
    voteDown: {
      visible: false,
      user: null,
      error: null,
    },
    unlock,
    lock,
  });
  
  lunchPlaces.getTodaysLunchPlace()
    .then((todaysPlaceData) => $scope.todaysPlaceData = todaysPlaceData);
  
  $scope.$watch('voteDown.visible', visible => { if (visible) $scope.voteDown.user = null;});
  
  function rejectTodaysPlace() {
    $scope.voteDown.error = null;
    lunchPlaces.voteDown($scope.voteDown.user)
      .then(() => {
        $scope.voteDown.visible = false;
      })
      .then()
      .catch(res => {
        if (res.status === 400) {
          $scope.voteDown.error = res.data;
        }
      });
  }
  
  function addLunchPlace() {
    lunchPlaces.addLunchPlace($scope.model.newPlace)
    .then(() => $scope.model.newPlace = null);
  }
  
  function votersMessage() {
    const data = $scope.todaysPlaceData;
    if (!data || !data.voters || data.voters.length === 0 ) {
      return '';
    }
    
    const len = data.voters.length;
    if (len === 1) {
      return data.voters[0];
    }

    const firsts =  $scope.todaysPlaceData.voters.slice(0, len - 1);
    const last = $scope.todaysPlaceData.voters[len -1];
    return [firsts.join(', '), last].join(' and ');
  }
  
  function lock() {
    auth.reset();
  }
  
  function unlock() {
    auth.authenticate(prompt('Password please'));
  }
  
})

.service('auth', function ($http) {
  let password = null;
  return {
    authenticate,
    get: () => password,
    reset: () => set(null),
  };
  
  function authenticate(pwd) {
    $http.post('/auth', { password: pwd})
      .then(() => set(pwd))
      .catch(resp => alert(resp.data.message));
  }
  
  function set(pwd) {
    password = pwd;
    $http.defaults.headers.common.Authorization = pwd;
  }

})

.service('lunchPlaces', function($http) {
  
  const lunchPlaces = [];
  
  return {
    getAllLunchPlaces,
    getTodaysLunchPlace,
    getRandomLunchPlace,
    addLunchPlace,
    deleteLunchPlace,
    voteDown,
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
  
  function getTodaysLunchPlace() {
    return $http.get('/lunch-places/todays')
                .then((response) => response.data);
  }
  
  function addLunchPlace(lunchPlace) {
    return $http.post('/lunch-places', { place: lunchPlace })
    .then(() => lunchPlaces.push(lunchPlace));
  }
  
  function deleteLunchPlace(lunchPlace) {
    return $http.delete('/lunch-places/' + lunchPlace)
    .then(() => getAllLunchPlaces());
  }
  
  function voteDown(user) {
    return $http.post('/lunch-places/todays/votedown', { user });
  }
 
})


;