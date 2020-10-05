import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import AddExperience from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
//Redux
import { Provider } from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/auth';

if (localStorage.token) {
    setAuthToken(localStorage.token);
}
function App() {
    useEffect(() => {
        store.dispatch(loadUser());
    }, []);
    return (
        <Provider store={store}>
            <Router>
                <div>
                    <Navbar />
                    <Route exact path='/' component={Landing} />
                    <section className='container'>
                        <Alert />
                        <Switch>
                            <Route path='/login' component={Login} />
                            <Route path='/register' component={Register} />
                            <PrivateRoute
                                path='/dashboard'
                                component={Dashboard}
                            />
                            <PrivateRoute
                                path='/create-profile'
                                component={CreateProfile}
                            />
                            <PrivateRoute
                                path='/edit-profile'
                                component={EditProfile}
                            />
                            <PrivateRoute
                                path='/add-experience'
                                component={AddExperience}
                            />
                            <PrivateRoute
                                path='/add-education'
                                component={AddEducation}
                            />
                        </Switch>
                    </section>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
