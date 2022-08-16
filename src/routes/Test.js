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
    const [inputQuestion, setInputQuestion] = useState("");
    const [inputAnswer, setInputAnswer] = useState("");

    var [inputStudentsAnswers, setInputStudentsAnswers] = useState({
        answer01: "",
        answer02: "",
        answer03: "",
        answer04: "",
        answer05: "",
        answer06: "",
        answer07: "",
        answer08: "",
        answer09: "",
        answer10: "",
    });



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



    // 자신이 생성한 강의인지 확인
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where("teacherId", "==", userObject.uid),
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
            collection(dbService, "classes/" + classCode + "/tests/"),
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
            collection(dbService, "classes/" + classCode + "/students/"),
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
            collection(dbService, "classes/" + classCode + "/tests/"),
            where(documentId(), "==", testCode),
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                testName: current.testName,
                testDate: current.testDate,
                testTime: current.testTime,
                testAvailable: current.testAvailable,

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

        else if (name === "studentsAnswer01") {
            setInputStudentsAnswers((prev) => {
                return {
                    ...prev, answer01: value
                }
            });
        }

        else if (name === "studentsAnswer02") {
            setInputStudentsAnswers((prev) => {
                return {
                    ...prev, answer02: value
                }
            });
        }

        else if (name === "studentsAnswer03") {
            setInputStudentsAnswers((prev) => {
                return {
                    ...prev, answer03: value
                }
            });
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



    async function sendAnswers(event) {
        event.preventDefault();

        try {
            await setDoc(doc(dbService, "classes/" + classCode + "/tests/" + testCode + "/studentsAnswers", userObject.uid), {
                studentName: currentUserData.name,
                studentId: userObject.uid,
                answer01: inputStudentsAnswers.answer01,
                answer02: inputStudentsAnswers.answer02,
                answer03: inputStudentsAnswers.answer03,
                answer04: inputStudentsAnswers.answer04,
                answer05: inputStudentsAnswers.answer05,
                answer06: inputStudentsAnswers.answer06,
                answer07: inputStudentsAnswers.answer07,
                answer08: inputStudentsAnswers.answer08,
                answer09: inputStudentsAnswers.answer09,
                answer10: inputStudentsAnswers.answer10,
            });
    
            alert("정상적으로 제출되었습니다.");
        }
        
        catch(error) {
            alert("제출 과정에서 오류가 발생했습니다.")
        }
    }



    async function changeTestAvailable() {
        let ok;

        if (!(testInfo[0]?.testAvailable)) {
            ok = window.confirm("시험을 공개로 전환하겠습니까?")

            if (ok) {
                await updateDoc(doc(dbService, "classes/" + classCode + "/tests/" + testCode), {
                    testAvailable: !(testInfo[0]?.testAvailable),
                });
            }
        }
        
        else {
            ok = window.confirm("시험을 비공개로 전환하겠습니까?")

            if (ok) {
                await updateDoc(doc(dbService, "classes/" + classCode + "/tests/" + testCode), {
                    testAvailable: !(testInfo[0]?.testAvailable),
                });
            }
        }
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
                        응시 가능 날짜 : {testInfo[0]?.testDate}
                        <br />
                        응시 시간 : {testInfo[0]?. testTime}
                        <br />
                        시험 공개 여부 : {testInfo[0]?.testAvailable ? "공개됨" : "비공개"}
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
                        <br />

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
                                        [번호]&nbsp;
                                        {myQuestions.length + 1}
                                        <br />

                                        [질문]&nbsp;
                                        <input
                                            type="text"
                                            name="question"
                                            value={inputQuestion}
                                            onChange={onChange}
                                            required
                                        />
                                        <br />

                                        [정답]&nbsp;
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
                                    <br /><br />
                                </div>
                        }

                        <button onClick={changeTestAvailable}>
                            {testInfo[0]?.testAvailable ? "시험 비공개하기" : "시험 공개하기"}
                        </button>
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
                                    <br />

                                    시험 이름 : {testInfo[0]?.testName}
                                    <br />
                                    
                                    {
                                        testInfo[0]?.testAvailable
                                        &&
                                        <div>
                                            응시 가능 날짜 : {testInfo[0]?.testDate}
                                            <br />

                                            응시 시간 : {testInfo[0]?.testTime}
                                            <br />
                                        </div>
                                    }
                                    <br />

                                    {testInfo[0]?.testAvailable ? "현재 응시 가능" : "현재 응시 불가"}
                                    <br /><br />

                                    {
                                        testInfo[0]?.testAvailable
                                        &&
                                        <form onSubmit={sendAnswers}>
                                            {
                                                typeof (myQuestions[0]) === "object" &&
                                                <div>
                                                    [번호] {myQuestions[0].number}<br />
                                                    [질문] {myQuestions[0].question}<br />
                                                    [응답] <input type="text" name="studentsAnswer01" onChange={onChange} value={inputStudentsAnswers.answer01} />
                                                    <br />
                                                </div>
                                            }

                                            {
                                                typeof (myQuestions[1]) === "object" &&
                                                <div>
                                                    [번호] {myQuestions[1].number}<br />
                                                    [질문] {myQuestions[1].question}<br />
                                                    [응답] <input type="text" name="studentsAnswer02" onChange={onChange} value={inputStudentsAnswers.answer02} />
                                                    <br />
                                                </div>
                                            }

                                            {
                                                typeof (myQuestions[2]) === "object" &&
                                                <div>
                                                    [번호] {myQuestions[2].number}<br />
                                                    [질문] {myQuestions[2].question}<br />
                                                    [응답] <input type="text" name="studentsAnswer03" onChange={onChange} value={inputStudentsAnswers.answer03} />
                                                    <br />
                                                </div>
                                            }

                                            <br /><br />
                                            <input
                                                type="submit"
                                                value="제출하기"
                                            />
                                        </form>
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