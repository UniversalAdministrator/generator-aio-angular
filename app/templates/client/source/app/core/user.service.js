(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('User', UserSerivce);

    UserSerivce.$inject = ['$http', '$q', '$rootScope', 'Event'];
    /* @ngInject */
    function UserSerivce($http, $q, $rootScope, Event) {
        var _isLoggedIn;
        var _userInfo;
        var service = {
            isLoggedIn: isLoggedIn,
            checkLoggedInStatus: checkLoggedInStatus,
            login: login,
            logout: logout,
            userInfo: getUserInfo,
        };

        return service;

        /////////////

        function isLoggedIn () {
            return _isLoggedIn;
        }

        function checkLoggedInStatus () {
            var d = $q.defer();
            $http.get('api/user/loginstatus')
                .success(success)
                .error(fail);
            return d.promise;

            function success (response, status) {
                if (status === 200 && response.code === 0) {
                    _setUser(response.result.user);
                    $rootScope.$broadcast(Event.AUTH_SESSION_VALID, response.result.user);
                    d.resolve();
                } else {
                    _clearUser();
                    d.reject();
                }
            }

            function fail () {
                _clearUser();
                d.reject();
            }
        }

        function login (email, password) {
            var d = $q.defer();
            var req = {
                email: email,
                password: password
            };
            $http.post('api/user/login', req)
                .success(success)
                .error(fail);
            return d.promise;

            function success (response, status) {
                if (status === 200 && response.code === 0) {
                    _setUser(response.result.user);
                    $rootScope.$broadcast(Event.AUTH_LOGIN, response.result.user);
                    d.resolve(response.result.user);
                } else {
                    _clearUser();
                    d.reject(response.message);
                }
            }

            function fail () {
                _clearUser();
                d.reject('$SERVER');
            }

        }

        function logout () {
            var d = $q.defer();
            $http.post('api/user/logout')
                .success(success)
                .error(fail);
            return d.promise;

            function success (response, status) {
                if (status === 200 && response.code === 0) {
                    $rootScope.$broadcast(Event.AUTH_LOGOUT);
                    d.resolve();
                } else {
                    d.reject();
                }
                _clearUser();

            }

            function fail () {
                _clearUser();
                d.reject('$SERVER');
            }
        }

        function getUserInfo () {
            return _userInfo;
        }

        function _setUser (userData) {
            _isLoggedIn = true;
            _userInfo = userData;
        }

        function _clearUser () {
            _isLoggedIn = false;
            _userInfo = null;
        }

    }
})();
