import React from 'react';
import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Navigation from '../routes/Navigation';
import Auth from '../routes/Auth';
import Home from '../routes/Home';
import Profile from '../routes/Profile';
import Class from '../routes/Class';
import Test from '../routes/Test';



function AppRouter({ isLoggedIn, userObject }) {
    return (
        <div>
            <BrowserRouter>
                {
                    isLoggedIn && <Navigation />
                }

                <Routes>
                    {
                        isLoggedIn
                            ?
                            <Route exact path="/" element={<Home userObject={userObject} />} />
                            :
                            <Route exact path="/" element={<Auth />} />
                    }

                    {
                        isLoggedIn ?
                            <Route exact path="/profile" element={<Profile userObject={userObject} />} />
                            :
                            <Route exact path="/" element={<Auth />} />
                    }

                    {
                        isLoggedIn
                            ?
                            <Route exact path="/class/:classCode" element={<Class userObject={userObject} />} />
                            :
                            <Route exact path="/" element={<Auth />} />
                    }

{
                        isLoggedIn
                            ?
                            <Route exact path="/class/:classCode/test/:testCode" element={<Test userObject={userObject} />} />
                            :
                            <Route exact path="/" element={<Auth />} />
                    }
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default AppRouter;