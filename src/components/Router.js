import React from 'react';
import { useEffect } from "react";
import { useState } from "react";

import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { dbService } from "../FirebaseModules";
import { collection, documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";

import Navigation from '../routes/Navigation';
import Auth from '../routes/Auth';
import Home from '../routes/Home';
import Profile from '../routes/Profile';
import Class from '../routes/Class';
import Test from '../routes/Test';
import AnswerSheet from '../routes/AnswerSheet';



function AppRouter({ isLoggedIn, userObject }) {
    return (
        <div>
            <BrowserRouter>
                {
                    isLoggedIn && <Navigation userObject={userObject} />
                }

                <div>
                    <Routes>
                        {
                            isLoggedIn
                                ?
                                <Route path="/" element={<Home userObject={userObject} />} />
                                :
                                <Route path="/" element={<Auth />} />
                        }

                        {
                            isLoggedIn ?
                                <Route path="/profile" element={<Profile userObject={userObject} />} />
                                :
                                <Route path="/" element={<Auth />} />
                        }

                        {
                            isLoggedIn
                                ?
                                <Route path="/class/:classCode" element={<Class userObject={userObject} />} />
                                :
                                <Route path="/" element={<Auth />} />
                        }

                        {
                            isLoggedIn
                                ?
                                <Route path="/class/:classCode/test/:testCode" element={<Test userObject={userObject} />} />
                                :
                                <Route path="/" element={<Auth />} />
                        }

                        {
                            isLoggedIn
                                ?
                                <Route path="/class/:classCode/test/:testCode/answersheet/:answersheetCode" element={<AnswerSheet userObject={userObject} />} />
                                :
                                <Route path="/" element={<Auth />} />
                        }
                    </Routes>
                </div>
            </BrowserRouter>
        </div>
    )
}

export default AppRouter;