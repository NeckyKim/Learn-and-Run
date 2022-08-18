import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection, documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";

import styles from "./Navigation.module.css";



function Navigation({ userObject }) {
    const [currentUserData, setCurrentUserData] = useState([]);

    // 사용자 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "users"),
            where(documentId(), "==", userObject.uid),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                name: current.name,
                userType: current.userType,
                profileIcon: current.profileIcon,

                ...current.data()
            }));

            setCurrentUserData(tempArray[0]);
        });
    }, [])



    return (
        <div className={styles.container}>
            <Link to="/" style={{ textDecoration: "none" }}>
                <span className={styles.homeButton}>
                    learn and run
                </span>
            </Link>

            {
                currentUserData?.userType
                &&
                <Link to="/profile" style={{ textDecoration: "none" }}>
                    <img alt="home" className={styles.profileIcon} src={process.env.PUBLIC_URL + "/profile/" + currentUserData.profileIcon + ".png"} />
                </Link>
            }
            
        </div>
    )
}

export default Navigation;