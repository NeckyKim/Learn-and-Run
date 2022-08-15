import React from "react";
import AppRouter from "./Router";
import { authService } from "../FirebaseModules";

import { useState } from "react";
import { useEffect } from "react";
import styles from "./App.css"



function App() {
    const [init, setInit] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userObject, setUserObject] = useState(null);

    useEffect(() => {
        authService.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(true);
                setUserObject(user);
            }

            else {
                setIsLoggedIn(false);
            }

            setInit(true);
        })
    }, [])



    return (
        <div>
            {init ?
                <AppRouter isLoggedIn={isLoggedIn} userObject={userObject} /> :
                <div>초기화 중...</div>}
        </div>
    );
}

export default App;