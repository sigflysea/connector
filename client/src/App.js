import React, { fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';

function App() {
    return (
        <Router>
            <div>
                <Navbar />
                <Route exact path='/' component={Landing} />
                <section className='container'>
                    <switch>
                        <Route path='/login' component={Login} />
                        <Route path='/register' component={Register} />
                    </switch>
                </section>
            </div>
        </Router>
    );
}

export default App;
