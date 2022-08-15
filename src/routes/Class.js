import { useParams } from "react-router";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection } from "firebase/firestore";
import { documentId } from "firebase/firestore";
import { FieldPath } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { getDocs } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { where } from "firebase/firestore";





function Class({ userObject }) {
    let { classCode } = useParams();

    const [myClasses, setMyClasses] = useState([]);
    const [classInfo, setClassInfo] = useState([]);
    const [myTests, setMyTests] = useState([]);

    const [isCreatingTest, setIsCreatingTest] = useState(false);
    const [inputTestName, setInputTestName] = useState("");



    // 자신이 생성한 강의인지 확인
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where("teacherid", "==", userObject.uid),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => (
                current.id
            ));

            setMyClasses(tempArray);
        });
    }, [])



    // 강의 정보 
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where(documentId(), "==", classCode)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                className: current.className,
                classCode: current.id,
                establishedDay: current.establishedDay,
                teacherid: current.teacherid,
                teacherName: current.teacherName,

                ...current.data()
            }));

            setClassInfo(tempArray);
        });
    }, [])



    // 생성한 시험 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes/" + classCode + "/tests/"),
            orderBy("testName", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                testCode: current.id,
                testName: current.testName,

                ...current.data()
            }));

            setMyTests(tempArray);
        });
    }, [])



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "testName") {
            setInputTestName(value);
        }
    }



    async function createTest(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes/" + classCode + "/tests"), {
            testName: inputTestName,
        });

        setIsCreatingTest(false);
        setInputTestName("");
    }



    return (
        <div>
            {
                myClasses.includes(classCode)
                    ?
                    <div>
                        접속 ID : {userObject.uid}
                        <br /><br />

                        
                        
                        강의 이름 : {classInfo[0]?.className}
                        <br />
                        강사 이름 : {classInfo[0]?.teacherName}
                        <br />
                        강의 코드 : {classCode}
                        <br /><br />

                        {
                            !isCreatingTest
                                ?
                                <div>
                                    <button onClick={() => {
                                        setIsCreatingTest(!isCreatingTest);
                                    }}>
                                        시험 만들기
                                    </button>
                                </div>
                                :
                                <div>
                                    <form onSubmit={createTest}>
                                        <input
                                            type="text"
                                            name="testName"
                                            value={inputTestName}
                                            onChange={onChange}
                                            maxLength={30}
                                            required
                                        />

                                        <input
                                            type="submit"
                                            value="시험 만들기"
                                        />
                                    </form>

                                    <button onClick={() => {
                                        setIsCreatingTest(!isCreatingTest);
                                        setInputTestName("");
                                    }}>
                                        시험 만들기 취소
                                    </button>
                                </div>
                        }

                        <div>
                            {
                                myTests.map((current) => (
                                    <div>
                                        {current.testName}

                                        <Link to={"/class/" + classCode + "/test/" + current.testCode} style={{ textDecoration: 'none' }}>
                                            <span>
                                                →
                                            </span>
                                        </Link>
                                    </div>
                                ))
                            }
                        </div>

                        <br /><br /><br />
                        <Link to={"/"} style={{ textDecoration: 'none' }}>
                            <span>
                                홈으로 돌아가기
                            </span>
                        </Link>
                    </div>
                    :
                    <div>
                        접근할 수 없습니다.
                    </div>
            }
        </div>
    )
}

export default Class;