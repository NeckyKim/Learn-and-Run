import { useParams } from "react-router";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection } from "firebase/firestore";
import { documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { where } from "firebase/firestore";

import Question from "./Question";


function Test({ userObject }) {
    let { classCode } = useParams();
    let { testCode } = useParams();

    const [currentUserData, setCurrentUserData] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [classInfo, setClassInfo] = useState([]);
    const [myTests, setMyTests] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [myStudents, setMyStudents] = useState([]);

    const [isCreatingQuestion, setIsCreatingQuestion,] = useState(false);
    const [inputQuestion, setInputQuestion] = useState(null);
    const [inputAnswer, setInputAnswer] = useState(null);
    const [inputPoints, setInputPoints] = useState(null);

    const [answerSheet, setAnswerSheet] = useState({});
    const [answerSheetMessage, setAnswerSheetMessage] = useState("")


    // 사용자 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "users"),
            where(documentId(), "==", userObject.uid)
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



    // 자신이 생성한 강의인지 확인
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where("teacherId", "==", userObject.uid)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => (
                current.id
            ));

            setMyClasses(tempArray);
        });
    }, [])



    // 자신이 생성한 시험인지 확인
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests"),
            orderBy("testName", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => (
                current.id
            ));

            setMyTests(tempArray);
        });
    }, [])



    // 추가한 학생 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "students"),
            orderBy("name", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                name: current.name,
                email: current.email,

                ...current.data()
            }));

            setMyStudents(tempArray);
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
                teacherId: current.teacherId,
                teacherName: current.teacherName,

                ...current.data()
            }));

            setClassInfo(tempArray);
        });
    }, [])



    // 시험 정보 
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests"),
            where(documentId(), "==", testCode)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                testName: current.testName,
                testDate: current.testDate,
                testTime: current.testTime,
                testStatus: current.testStatus,

                ...current.data()
            }));

            setTestInfo(tempArray);
        });
    }, [])



    // 생성한 문제 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests", testCode, "questions"),
            orderBy("createdAt", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                id: current.id,
                points: current.points,
                number: current.number,
                question: current.question,
                answer: current.answer,

                ...current.data()
            }));

            setMyQuestions(tempArray);
        });
    }, [])



    // 제출되어있는 답안지 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests", testCode, "answersheet"),
            where(documentId(), "==", userObject.uid)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                ...current.data()
            }));

            setAnswerSheet(tempArray[0]);
        });
    }, [])



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "points") {
            setInputPoints(value);
        }

        else if (name === "question") {
            setInputQuestion(value);
        }

        else if (name === "answer") {
            setInputAnswer(value);
        }
    }



    async function createQuestion(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes", classCode, "tests", testCode, "questions"), {
            createdAt: Date.now(),
            points: inputPoints,
            question: inputQuestion,
            answer: inputAnswer,
        });

        setIsCreatingQuestion(false);
        setInputQuestion("");
        setInputAnswer("");
        setInputPoints("");
    }



    async function sendAnswerSheet(event) {
        event.preventDefault();

        try {
            await setDoc(doc(dbService, "classes", classCode, "tests", testCode, "answersheet", userObject.uid), answerSheet);

            setAnswerSheetMessage("정상적으로 제출되었습니다." + `${Date(Date.now())}`);
            console.log(Date(Date.now()))
        }

        catch (error) {
            setAnswerSheetMessage("제출 과정에서 오류가 발생했습니다.");
            console.log(error);
        }
    }



    async function changeTestStatus() {
        let ok;

        if (testInfo[0]?.testStatus === "before") {
            ok = window.confirm("시험을 공개로 전환하겠습니까?")

            if (ok) {
                await updateDoc(doc(dbService, "classes", classCode, "tests", testCode), {
                    testStatus: "available",
                });
            }
        }

        else {
            ok = window.confirm("시험을 비공개로 전환하겠습니까?")

            if (ok) {
                await updateDoc(doc(dbService, "classes", classCode, "tests", testCode), {
                    testStatus: "before",
                });
            }
        }
    }



    const mapStyle = {
        border: "1px solid rgb(200, 200, 200)",
        width: "fit-content",
        margin: "20px",
        padding: "20px",
        fontSize: "1rem",
        fontWeight: "bold",
    }

    const inputQStyle = {
        border: "1px solid rgb(200, 200, 200)",
        width: "90vw",
        height: "400px",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: "bold",
        resize: "none"
    }

    const inputAStyle = {
        border: "1px solid rgb(200, 200, 200)",
        width: "90vw",
        height: "100px",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: "bold",
        resize: "none"
    }



    return (
        <div>
            {userObject.email}
            <br />
            {currentUserData.userType}
            <br />
            {currentUserData.name}
            <br /><br />          

            {
                myClasses.includes(classCode) && myTests.includes(testCode) && currentUserData.userType === "teacher"
                    ?
                    <div>
                        강의 이름 : {classInfo[0]?.className}
                        <br />
                        강의 코드 : {classCode}
                        <br /><br />

                        시험 이름 : {testInfo[0]?.testName}
                        <br />
                        시험 코드 : {testCode}
                        <br />
                        응시 가능 날짜 : {Date(testInfo[0]?.testDate)}
                        <br />
                        응시 시간 : {testInfo[0]?.testTime}
                        <br />
                        진행 상황 : {testInfo[0]?.testStatus === "available" ? "진행 중[시험지 공개 됨]" : "진행 전"}
                        <button onClick={changeTestStatus}>
                            {testInfo[0]?.testStatus === "available" ? "시험 중지" : "시험 시작"}
                        </button>
                        <br /><br />

                        <div>
                            {
                                myQuestions.map((current, index) => (
                                    <div style={mapStyle}>
                                        <Question number={index} points={current.points} question={current.question} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={currentUserData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} />
                                    </div>
                                ))
                            }
                        </div>
                        <br />

                        {
                            !isCreatingQuestion
                                ?
                                <div>
                                    <button onClick={() => {
                                        setIsCreatingQuestion(!isCreatingQuestion);
                                    }}>
                                        문제 생성
                                    </button>
                                </div>

                                :

                                <form style={mapStyle} onSubmit={createQuestion}>
                                    <div>
                                        [번호]&nbsp;
                                        {myQuestions.length + 1}
                                        <br />
                                    </div>

                                    <div>
                                        [배점]&nbsp;
                                        <input
                                            type="number"
                                            name="points"
                                            value={inputPoints}
                                            onChange={onChange}
                                            required
                                        />점
                                    </div>

                                    <div>
                                        [질문]
                                        <br />
                                        <textarea
                                            type="text"
                                            name="question"
                                            value={inputQuestion}
                                            onChange={onChange}
                                            required
                                            spellCheck="false"
                                            style={inputQStyle}
                                        />
                                    </div>

                                    <div>
                                        [정답]
                                        <br />
                                        <textarea
                                            type="text"
                                            name="answer"
                                            value={inputAnswer}
                                            onChange={onChange}
                                            required
                                            spellCheck="false"
                                            style={inputAStyle}
                                        />
                                    </div>

                                    <input
                                        type="submit"
                                        value="출제"
                                    />

                                    <button
                                        onClick={() => {
                                            setIsCreatingQuestion(false);
                                            setInputQuestion("");
                                            setInputAnswer("");
                                            setInputPoints("");
                                        }}>
                                        취소
                                    </button>
                                </form>
                        }
                        <br /><br />
                    </div>

                    :

                    <div>
                        {
                            myStudents.map(row => row.studentId).includes(userObject.uid) && currentUserData.userType === "student"
                                ?
                                <div>
                                    강의 이름 : {classInfo[0]?.className}
                                    <br />

                                    강사 이름 : {classInfo[0]?.teacherName}
                                    <br /><br />

                                    시험 이름 : {testInfo[0]?.testName}
                                    <br />

                                    {
                                        testInfo[0]?.testStatus === "available"
                                            ?
                                            <div>
                                                응시 가능 날짜 : {Date(testInfo[0]?.testDate)}
                                                <br />

                                                응시 시간 : {testInfo[0]?.testTime}
                                                <br />

                                                진행 상황 : 진행 중
                                            </div>
                                            :
                                            <div>
                                                현재 응시 불가
                                            </div>
                                    }
                                    <br />

                                    {
                                        testInfo[0]?.testStatus === "available"
                                        &&
                                        <div>
                                            {
                                                myQuestions.map((current, index) => (
                                                    <div style={mapStyle}>
                                                        <Question number={index} points={current.points} question={current.question} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={currentUserData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} />
                                                    </div>
                                                ))
                                            }
                                            <button onClick={sendAnswerSheet}>
                                                제출
                                            </button>
                                            {answerSheetMessage}

                                            <br /><br />
                                        </div>
                                    }

                                </div>
                                :
                                <div>
                                    접근 오류
                                </div>
                        }
                    </div>
            }

            <Link to={"/class/" + classCode} style={{ textDecoration: 'none' }}>
                <span>
                    강의실로 돌아가기
                </span>
            </Link>
        </div>
    )
}

export default Test;