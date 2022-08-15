import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { where } from "firebase/firestore";

import styles from "./Main.module.css"



function Home({ userObject }) {
    const navigate = useNavigate();

    const [isCreatingClass, setIsCreatingClass] = useState(false);

    const [inputClassName, setInputClassName] = useState("");
    const [inputTeacherName, setInputTeacherName] = useState("");

    const [myClasses, setMyClasses] = useState([]);

    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "className") {
            setInputClassName(value);
        }

        else if (name === "teacherName") {
            setInputTeacherName(value);
        }
    }

    async function createClass(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes"), {
            className: inputClassName,
            teacherName: inputTeacherName,
            establishedTime: Date.now(),
            teacherid: userObject.uid,
        });

        setIsCreatingClass(false);
        setInputClassName("");
        setInputTeacherName("");
    };

    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where("teacherid", "==", userObject.uid),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                className: current.className,
                classCode: current.id,
                establishedTime: current.establishedTime,
                teacherid: current.teacherid,

                ...current.data()
            }));

            setMyClasses(tempArray);
        });
    }, [])



    return (
        <div>
            {userObject.email}
            <br /><br />

            <button
                onClick={() => {
                    setIsCreatingClass(!isCreatingClass);
                    setInputClassName("");
                    setInputTeacherName("");
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
                    <input
                        type="text"
                        name="teacherName"
                        value={inputTeacherName}
                        onChange={onChange}
                        maxLength={30}
                        required
                    />
                    <br />


                    <input type="submit" value="강의 만들기" />
                    <br /><br />
                </form>
            }

            <div>
                {
                    myClasses.map((current) => (
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
    )
}

export default Home;