import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

import { authService } from "../FirebaseModules";
import { dbService } from "../FirebaseModules";
import { collection, documentId } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";

import styles from "./Profile.module.css"



function Profile({ userObject }) {
    const navigate = useNavigate();

    const [currentUserData, setCurrentUserData] = useState([]);

    function onLogOutClick() {
        authService.signOut();
        navigate("/");
    }

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
        <div className={styles.userInfo}>
            <img alt="home" className={styles.profileIcon} src={process.env.PUBLIC_URL + "/profile/" + currentUserData.profileIcon + ".png"} />
            <br />

            <div className={styles.userName}>
                {currentUserData?.name}
            </div>

            <div className={styles.userEmail}>
                {userObject.email}
            </div>

            <div className={currentUserData?.userType === "teacher" ? styles.userTypeTeacher : styles.userTypeStudent}>
                {currentUserData?.userType}
            </div>
            <br />

            <button onClick={onLogOutClick} className={styles.logOutButton}>
                로그아웃
            </button>

        </div>
    )
}

export default Profile;