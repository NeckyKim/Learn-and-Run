import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection, documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { where } from "firebase/firestore";

import styles from "./Main.module.css"



function Home({ userObject }) {
    const navigate = useNavigate();

    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [inputClassName, setInputClassName] = useState("");
    const [teachersClasses, setTeachersClasses] = useState([]);
    const [studentsClasses, setStudentsClasses] = useState([]);
    const [currentUserData, setCurrentUserData] = useState([]);

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

    async function createClass(event) {
        event.preventDefault();

        try {
            await addDoc(collection(dbService, "classes"), {
                className: inputClassName,
                teacherName: currentUserData.name,
                establishedTime: Date.now(),
                teacherId: userObject.uid,
            });
    
            setIsCreatingClass(false);
            setInputClassName("");
        }
        
        catch(error) {
            console.log(error);
        }
    };

    // 내가 개설한 강의 불러오기
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
    


    // [학생] 내가 수강하는 강의불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "users/" + userObject.uid + "/classes")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                className: current.className,
                classCode: current.id,

                ...current.data()
            }));

            setStudentsClasses(tempArray);
        });
    }, [])



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

                ...current.data()
            }));

            setCurrentUserData(tempArray[0]);
        });
    }, [])



    async function addUserToDatabase(event) {
        event.preventDefault();

        await setDoc(doc(dbService, "users", userObject.uid), {
            userId: userObject.uid,
            name: inputName,
            email: userObject.email,
            userType: inputUserType,
        });

        setInputName("");
        setInputUserType("student");
    }



    return (
        <div>
            {userObject.email}
            <br />
            {currentUserData?.userType}
            <br />
            {currentUserData?.name}
            <br /><br />

            {
                currentUserData?.userType
                    ?
                    <div>
                        {
                            currentUserData?.userType === "teacher"
                                ?
                                <div>
                                    <button
                                        onClick={() => {
                                            setIsCreatingClass(!isCreatingClass);
                                            setInputClassName("");
                                        }}
                                    >
                                        {
                                            isCreatingClass
                                                ?
                                                "강의 만들기 취소"
                                                :
                                                "강의 만들기"
                                        }
                                    </button>

                                    {
                                        isCreatingClass
                                        &&
                                        <form onSubmit={createClass}>
                                            강의 이름
                                            <input
                                                type="text"
                                                name="className"
                                                value={inputClassName}
                                                onChange={onChange}
                                                maxLength={30}
                                                required
                                            />
                                            <br />

                                            강사 이름
                                            &nbsp;
                                            {currentUserData.name}
                                            <br />

                                            <input type="submit" value="강의 만들기" />
                                            <br /><br />
                                        </form>
                                    }

                                    <br /><br />
                                    <div>
                                        ---강의목록---
                                        {
                                            teachersClasses.map((current) => (
                                                <div>
                                                    {current.className}
                                                    {current.classCode}

                                                    <Link to={"/class/" + current.classCode} style={{ textDecoration: 'none' }}>
                                                        <span>
                                                            강의실 가기
                                                        </span>
                                                    </Link>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                :
                                <div>
                                    ---강의목록---
                                    {
                                        studentsClasses.map((current) => (
                                            <div>
                                                {current.className}

                                                <Link to={"/class/" + current.classCode} style={{ textDecoration: 'none' }}>
                                                    <span>
                                                        강의실 가기
                                                    </span>
                                                </Link>
                                            </div>
                                        ))
                                    }
                                </div>
                        }
                    </div>
                    :
                    <form onSubmit={addUserToDatabase}>
                        이름
                        <input
                            type="text"
                            name="name"
                            value={inputName}
                            onChange={onChange}
                            maxLength={30}
                            required
                        />
                        <br />

                        유형
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value="student"
                                checked={inputUserType === "student"}
                                onChange={onChange}
                            />
                            학생
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="userType"
                                value="teacher"
                                checked={inputUserType === "teacher"}
                                onChange={onChange}
                            />
                            강사
                        </label>
                        <br /><br />

                        <input type="submit" value="정보 입력" />
                        <br /><br />
                    </form>
            }
        </div>
    )
}

export default Home;