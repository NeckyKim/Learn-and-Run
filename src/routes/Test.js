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



function Test({ userObject }) {
    let { classCode } = useParams();
    let { testCode } = useParams();

    const [myClasses, setMyClasses] = useState([]);
    const [classInfo, setClassInfo] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);

    const [isCreatingQuestion, setIsCreatingQuestion,] = useState(false);
    const [inputQuestion, setInputQuestion] = useState("");
    const [inputAnswer, setInputAnswer] = useState("");

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



    // 시험 정보 
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes/" + classCode + "/tests/"),
            where(documentId(), "==", testCode),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                testName: current.testName,

                ...current.data()
            }));

            setTestInfo(tempArray);
        });
    }, [])



    // 생성한 문제 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes/" + classCode + "/tests/" + testCode + "/questions"),
            orderBy("number", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                number: current.number,
                question: current.question,
                answer: current.answer,

                ...current.data()
            }));

            setMyQuestions(tempArray);
        });
    }, [])



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "question") {
            setInputQuestion(value);
        }

        else if (name === "answer") {
            setInputAnswer(value);
        }
    }



    async function createQuestion(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes/" + classCode + "/tests/" + testCode + "/questions"), {
            number: myQuestions.length + 1,
            question: inputQuestion,
            answer: inputAnswer,
        });

        setIsCreatingQuestion(false);
        setInputQuestion("");
        setInputAnswer("");
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

                        시험 이름 : {testInfo[0]?.testName}
                        <br />
                        시험 코드 : {testCode}
                        <br /><br />

                        <div>
                            {
                                myQuestions.map((current) => (
                                    <div>
                                        <div>
                                            [번호] {current.number}
                                        </div>
                                        <div>
                                            [질문] {current.question}
                                        </div>
                                        <div>
                                            [정답] {current.answer}
                                        </div>
                                        <br />
                                    </div>
                                ))

                            }
                        </div>
                        <br /><br /><br />

                        {
                            !isCreatingQuestion
                                ?
                                <div>
                                    <button onClick={() => {
                                        setIsCreatingQuestion(!isCreatingQuestion);
                                    }}>
                                        문제 만들기
                                    </button>
                                </div>
                                :
                                <div>
                                    <form onSubmit={createQuestion}>
                                        번호
                                        {myQuestions.length + 1}
                                        <br />

                                        질문
                                        <input
                                            type="text"
                                            name="question"
                                            value={inputQuestion}
                                            onChange={onChange}
                                            required
                                        />
                                        <br />

                                        정답
                                        <input
                                            type="text"
                                            name="answer"
                                            value={inputAnswer}
                                            onChange={onChange}
                                            required
                                        />
                                        <br />

                                        <input
                                            type="submit"
                                            value="문제 만들기"
                                        />
                                    </form>

                                    <button onClick={() => {
                                        setIsCreatingQuestion(!isCreatingQuestion);
                                        setInputQuestion("");
                                        setInputAnswer("");
                                    }}>
                                        문제 만들기 취소
                                    </button>
                                </div>
                        }

                        <br /><br /><br />
                        <Link to={"/class/" + classCode} style={{ textDecoration: 'none' }}>
                            <span>
                                강의실로 돌아가기
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

export default Test;