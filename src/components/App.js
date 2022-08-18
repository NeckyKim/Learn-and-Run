import React from "react";

import { useState } from "react";
import { useEffect } from "react";

import { authService } from "../FirebaseModules";

import AppRouter from "./Router";
import Loading from "./Loading";

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
            {
                init
                    ?
                    <AppRouter isLoggedIn={isLoggedIn} userObject={userObject} />
                    :
                    <Loading message="로딩 중" />
            }
        </div>
    );
}

export default App;