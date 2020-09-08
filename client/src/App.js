import React, { fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';
//Redux
import { Provider } from 'react-redux';
import store from './store';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div>
                    <Navbar />
                    <Route exact path='/' component={Landing} />
                    <section className='container'>
                        <Alert />
                        <switch>
                            <Route path='/login' component={Login} />
                            <Route path='/register' component={Register} />
                        </switch>
                    </section>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
