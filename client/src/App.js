import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';

import { Provider } from 'react-redux';
import store from './store';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';

import './App.css';
import { clearCurrentProfile } from './actions/profileActions';

// Check for token

if (localStorage.jwtToken) {
  // Set auth token header auth
  setAuthToken(localStorage.jwtToken);
  // Decode token and get user info and expiration
  const decoded = jwt_decode(localStorage.jwtToken);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Todo: Clear current profile
    store.dispatch(clearCurrentProfile());

    // Redirect to login
    window.location.href = '/';
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div>
          <Router>
            <div>
              <Navbar />
              <Route exact path="/" component={Landing} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/dashboard" component={Dashboard} />
            </div>
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
