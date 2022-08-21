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

import styles from "./Home.module.css"



function Home({ userObject }) {
    // 사용자 정보 불러오기
    
    const [userData, setUserData] = useState([]);
    useEffect(() => {
        const myQuery = query(collection(dbService, "users"),where(documentId(), "==", userObject.uid));

        onSnapshot(query(collection(dbService, "users"),where(documentId(), "==", userObject.uid)), (snapshot) => {
            setUserData(snapshot.docs.map((current) => ({...current.data()}))[0]);
        });
    }, [])



    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [inputClassName, setInputClassName] = useState("");
    const [teachersClasses, setTeachersClasses] = useState([]);
    const [studentsClasses, setStudentsClasses] = useState([]);

    const [inputUserType, setInputUserType] = useState("student");
    const [inputName, setInputName] = useState("");



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "className") {
            setInputClassName(value);
        }

        else if (name === "userType") {
            setInputUserType(value);
        }

        else if (name === "name") {
            setInputName(value);
        }
    }



    // [강사] 강의 생성하기
    async function createClass(event) {
        event.preventDefault();

        try {
            await addDoc(collection(dbService, "classes"), {
                className: inputClassName,
                teacherName: userData.name,
                establishedTime: Date.now(),
                teacherId: userObject.uid,
            });

            setIsCreatingClass(false);
            setInputClassName("");
        }

        catch (error) {
            console.log(error);
        }
    };



    // [강사] 개설한 강의 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where("teacherId", "==", userObject.uid),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                className: current.className,
                classCode: current.id,
                establishedTime: current.establishedTime,
                teacherId: current.teacherId,

                ...current.data()
            }));

            setTeachersClasses(tempArray);
        });
    }, [])



    // [학생] 수강 중인 강의 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "users/" + userObject.uid + "/classes")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                className: current.className,
                classCode: current.id,
                teacherName: current.teacherName,
                authenticate: current.authenticate,

                ...current.data()
            }));

            setStudentsClasses(tempArray);
        });
    }, [])



    // 사용자 정보가 DB에 있는 경우 추가하기
    async function addUserToDatabase(event) {
        event.preventDefault();

        await setDoc(doc(dbService, "users", userObject.uid), {
            userId: userObject.uid,
            name: inputName,
            email: userObject.email,
            userType: inputUserType,
            profileIcon: 1,
        });

        setInputName("");
        setInputUserType("student");
    }



    return (
        <div>
            {
                userData?.userType

                    ?

                    // 사용자 정보가 DB에 있는 경우
                    <div>
                        <div className={styles.userInfo}>
                            <img alt="home" className={styles.profileIcon} src={process.env.PUBLIC_URL + "/profile/" + userData.profileIcon + ".png"} />

                            {/* 사용자 정보 표시 */}
                            <div>
                                <div className={styles.userName}>
                                    {userData?.name}
                                </div>

                                <div className={styles.userEmail}>
                                    {userData.email}
                                </div>

                                <div className={userData?.userType === "teacher" ? styles.userTypeTeacher : styles.userTypeStudent}>
                                    {userData?.userType}
                                </div>
                            </div>
                        </div>

                        {
                            userData?.userType === "teacher"

                                ?

                                // 강사 전용 화면
                                <div className={styles.classListZone}>
                                    <div className={styles.classListTitle}>
                                        강의 목록
                                    </div>
                                    {
                                        teachersClasses.map((current) => (
                                            <Link to={"/class/" + current.classCode} style={{ textDecoration: "none" }}>
                                                <div className={styles.classListElements}>
                                                    <div>
                                                        <div className={styles.className}>
                                                            {current.className}
                                                        </div>

                                                        <div className={styles.classCode}>
                                                            {current.classCode}
                                                        </div>
                                                    </div>

                                                    <div className={styles.goToClassButton}>
                                                    강의실 가기
                                                        <img alt="home" src={process.env.PUBLIC_URL + "/icon/goToClass.png"} />
                                                    </div>

                                                </div>
                                            </Link>
                                        ))
                                    }

                                    <button
                                        className={styles.createClassButton}
                                        onClick={() => {
                                            setIsCreatingClass(true);
                                            setInputClassName("");
                                        }}
                                    >
                                        강의 만들기
                                        <img alt="home" src={process.env.PUBLIC_URL + "/icon/add.png"} />
                                    </button>

                                    {
                                        isCreatingClass

                                        &&

                                        <form onSubmit={createClass} className={styles.createClassBackground}>
                                            <div className={styles.createClassContainer}>
                                                <div className={styles.createClassName}>
                                                    강의 이름
                                                </div>
                                                <input
                                                    type="text"
                                                    name="className"
                                                    value={inputClassName}
                                                    onChange={onChange}
                                                    maxLength={30}
                                                    required
                                                    className={styles.createClassNameInput}
                                                />
                                                <br /><br />

                                                <input
                                                    type="submit"
                                                    value="생성"
                                                    className={styles.createClassFinishButton}
                                                />

                                                <button
                                                    onClick={() => {
                                                        setIsCreatingClass(false);
                                                        setInputClassName("");
                                                    }}
                                                    className={styles.createClassCancelButton}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </form>
                                    }
                                </div>

                                :

                                // 학생 전용 화면
                                <div className={styles.classListZone}>
                                    <div className={styles.classListTitle}>
                                        강의 목록
                                    </div>


                                    {
                                        studentsClasses.length > 0 
                                            ?
                                            <div>
                                                {
                                                    studentsClasses.map((current) => (
                                                        <Link to={"/class/" + current.classCode} style={{ textDecoration: "none" }}>
                                                            <div className={styles.classListElements}>
                                                                <div>
                                                                    <div className={styles.className}>
                                                                        {current.className}
                                                                        {
                                                                            !current.authenticate
                                                                            
                                                                            &&

                                                                            <span className={styles.classWarning}>
                                                                                인증 필요
                                                                            </span>
                                                                        }
  
                                                                    </div>

                                                                    <div className={styles.classCode}>
                                                                        {current.teacherName}
                                                                    </div>
                                                                </div>

                                                                <div className={styles.goToClassButton}>
                                                                    강의실 가기
                                                                    <img alt="home" src={process.env.PUBLIC_URL + "/icon/goToClass.png"} />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                }
                                            </div>
                                            :
                                            <div className={styles.nothing}>
                                                현재 수강중인 강의가 없습니다.
                                            </div>
                                    }
                                </div>
                        }
                    </div>

                    :

                    // 사용자 정보가 DB에 없는 경우
                    <form onSubmit={addUserToDatabase} className={styles.createClassContainer}>
                        <div className={styles.createClassZone}>
                            <div className={styles.createClassName}>
                                사용자 이름
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={inputName}
                                onChange={onChange}
                                maxLength={30}
                                required
                                className={styles.createClassNameInput}
                            />
                            <br /><br />

                            <div className={styles.createClassName}>
                                사용자 유형
                            </div>

                            <div className={styles.userTypeButtonZone}>
                                <input
                                    type="button"
                                    onClick={() => { setInputUserType("student") }}
                                    className={inputUserType === "student" ? styles.userTypeOn : styles.userTypeOff}
                                    value="학생"
                                />

                                <input
                                    type="button"
                                    onClick={() => { setInputUserType("teacher") }}
                                    className={inputUserType === "teacher" ? styles.userTypeOn : styles.userTypeOff}
                                    value="강사"
                                />
                            </div>
                            <br />

                            <input
                                type="submit"
                                value="정보 입력" 
                                className={styles.createClassFinishButton}
                            />
                        </div>
                    </form>
            }
        </div>
    )
}

export default Home;