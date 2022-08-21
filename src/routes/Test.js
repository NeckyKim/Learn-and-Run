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

import styles from "./Test.module.css";



function Test({ userObject }) {
    // 사용자 정보 불러오기

    const [userData, setUserData] = useState([]);
    useEffect(() => {
        const myQuery = query(collection(dbService, "users"), where(documentId(), "==", userObject.uid));

        onSnapshot(query(collection(dbService, "users"), where(documentId(), "==", userObject.uid)), (snapshot) => {
            setUserData(snapshot.docs.map((current) => ({ ...current.data() }))[0]);
        });
    }, [])



    let { classCode } = useParams();
    let { testCode } = useParams();

    const [tab, setTab] = useState(1);

    const [myClasses, setMyClasses] = useState([]);
    const [classInfo, setClassInfo] = useState([]);
    const [myTests, setMyTests] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [myStudents, setMyStudents] = useState([]);
    const [myAnswersheets, setMyAnswersheets] = useState([]);

    const [isCreatingQuestion, setIsCreatingQuestion,] = useState(false);
    const [questionType, setQuestionType] = useState("서술형");
    const [inputQuestion, setInputQuestion] = useState(null);
    const [inputAnswer, setInputAnswer] = useState(null);
    const [inputPoints, setInputPoints] = useState(null);
    const [numberOfChoices, setNumberOfChoices] = useState(3);
    const [valueOfChoices, setValueOfChoices] = useState({});

    const [answerSheet, setAnswerSheet] = useState({});
    const [answerSheetMessage, setAnswerSheetMessage] = useState("");
    const [showNotice, setShowNotice] = useState(true);

    const [isEditingTestInfo, setIsEditingTestInfo] = useState(false);
    const [newTestName, setNewTestName] = useState();
    const [newTestDate, setNewTestDate] = useState();
    const [newTestTime, setNewTestTime] = useState();
    const [newTestAutoGrading, setNewTestAutoGrading] = useState();
    const [newTestFeedback, setNewTestFeedback] = useState();

    var beforeTestName = testInfo?.testName;
    var beforeTestDate = testInfo?.testDate;
    var beforeTestTime = testInfo?.testTime;
    var beforeTestAutoGrading = testInfo?.testAutoGrading;
    var beofreTestFeedback = testInfo?.testFeedback;



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

            setUserData(tempArray[0]);
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
                testAutoGrading: current.testAutoGrading,
                testFeedback: current.testFeedback,

                ...current.data()
            }));

            const tempDate = new Date(tempArray[0].testDate);



            const newFormat = String(tempDate.getFullYear()) + "-" + String(tempDate.getMonth() + 1) + "-" + String(tempDate.getDay())
            console.log(newFormat);

            setTestInfo(tempArray[0]);
            setNewTestName(tempArray[0].testName);
            setNewTestDate(newFormat);
            setNewTestTime(tempArray[0].testTime);
            setNewTestAutoGrading(tempArray[0].testAutoGrading);
            setNewTestFeedback(tempArray[0].testFeedback);
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
                question: current.question,
                answer: current.answer,
                type: current.type,
                choice: current.choice,

                ...current.data()
            }));

            setMyQuestions(tempArray);
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

        else if (name === "newTestName") {
            setNewTestName(value);
        }

        else if (name === "newTestDate") {
            setNewTestDate(value);
        }

        else if (name === "newTestTime") {
            setNewTestTime(value);
        }
    }


    function onChangeChoices(event) {
        setValueOfChoices((prev) => {
            return { ...prev, [event.target.name]: event.target.value }
        });
    }



    async function createQuestion(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes", classCode, "tests", testCode, "questions"), {
            createdAt: Date.now(),
            points: inputPoints,
            question: inputQuestion,
            answer: inputAnswer,
            type: questionType,
            choice: valueOfChoices,
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



    // 제출되어 있는 답안지 목록 확인
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests", testCode, "answersheet"),
            orderBy("studentId", "asc")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => (
                current.id
            ));

            setMyAnswersheets(tempArray);
        });
    }, [userData])



    // 답안지가 없는 경우 생성
    if (!myAnswersheets.includes(userData.userId) && userData.userType === "student") {
        setDoc(doc(dbService, "classes", classCode, "tests", testCode, "answersheet", userData.userId), { studentId: userData.userId });
    }



    // 현재 시간
    const [time, setTime] = useState(new Date());

    function CurrentTime() {
        useEffect(() => {
            const id = setInterval(() => {
                setTime(new Date());
            }, 1000);
            return (() => clearInterval(id))
        }, []);

        return (
            <span>{time.toLocaleTimeString()}</span>
        )
    }



    // 현재 시험 응시 가능 확인
    function isTestTime() {
        if (time.toLocaleTimeString() < new Date(testInfo?.testDate).toLocaleTimeString()) {
            return "before"
        }

        else if (time.toLocaleTimeString() >= new Date(testInfo?.testDate).toLocaleTimeString() && time.toLocaleTimeString() <= new Date(testInfo?.testDate + testInfo.testTime * 60000).toLocaleTimeString()) {
            return "running"
        }

        else if (time.toLocaleTimeString() > new Date(testInfo?.testDate + testInfo.testTime * 60000).toLocaleTimeString()) {
            return "after"
        }
    }




    // 시험 정보 수정
    async function updateTest(event) {
        event.preventDefault();

        await updateDoc(doc(dbService, "classes", classCode, "tests", testCode), {
            testName: newTestName,
            testDate: Date.parse(newTestDate),
            testTime: newTestTime,
            testAutoGrading: newTestAutoGrading,
            testFeedback: newTestFeedback,
        });

        setIsEditingTestInfo(false);
    }



    return (
        <div className={styles.testContainer}>

            {
                myClasses.includes(classCode) && myTests.includes(testCode) && userData.userType === "teacher"

                    ?

                    // 강사 전용 화면
                    <div>
                        <div className={styles.className}>
                            {classInfo[0]?.className}
                        </div>

                        <div className={styles.classCode}>
                            {classCode}
                        </div>
                        <br />

                        <div className={styles.className}>
                            {testInfo?.testName}
                        </div>

                        <div className={styles.classCode}>
                            {testCode}
                        </div>

                        {/* 메뉴 탭 */}
                        <div className={styles.tabButtonZone}>
                            <button
                                className={tab === 1 ? styles.tabOn : styles.tabOff}
                                onClick={() => { setTab(1) }}>
                                설정
                            </button>

                            <button
                                className={tab === 2 ? styles.tabOn : styles.tabOff}
                                onClick={() => { setTab(2) }}>
                                문제
                            </button>

                            <button
                                className={tab === 3 ? styles.tabOn : styles.tabOff}
                                onClick={() => { setTab(3) }}>
                                답안지
                            </button>
                        </div>

                        {
                            tab === 1

                            &&

                            <div>
                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>시작 시각</span>
                                    <span className={styles.blueFont}>{new Date(testInfo?.testDate).toLocaleTimeString()}</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>진행 시간</span>
                                    <span className={styles.blueFont}>{testInfo?.testTime}분</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>종료 시각</span>
                                    <span className={styles.blueFont}>{new Date(testInfo?.testDate + testInfo?.testTime * 60000).toLocaleTimeString()}</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>채점 방식</span>
                                    <span className={styles.blueFont}>{testInfo?.testAutoGrading ? "종료 후 자동 채점" : "직접 채점"}</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>시험지 및 점수 공개</span>
                                    <span className={styles.blueFont}>{testInfo?.testFeedback ? "공개 안 함" : "공개 함"}</span>
                                </div>

                                <button className={styles.acceptButton} onClick={() => { setIsEditingTestInfo(true); }}>
                                    수정
                                </button>
                            </div>
                        }

                        {
                            isEditingTestInfo

                            &&

                            <div className={styles.addBackground}>
                                <div className={styles.addContainer}>
                                    <form onSubmit={updateTest}>
                                        <div className={styles.addType}>
                                            이름
                                        </div>
                                        <input
                                            type="text"
                                            name="newTestName"
                                            value={newTestName}
                                            onChange={onChange}
                                            maxLength={30}
                                            required
                                            className={styles.addInput}
                                        />
                                        <br /><br />

                                        <div className={styles.addType}>
                                            시작 시각
                                        </div>
                                        <input
                                            type="datetime-local"
                                            name="newTestDate"
                                            value={newTestDate}
                                            onChange={onChange}
                                            required
                                            className={styles.addInput}
                                        />
                                        <br /><br />

                                        <div className={styles.addType}>
                                            진행 시간
                                        </div>
                                        <input
                                            type="number"
                                            name="newTestTime"
                                            value={newTestTime}
                                            onChange={onChange}
                                            required
                                            className={styles.addTimeInput}
                                        />분
                                        <br /><br />

                                        <div className={styles.addType}>
                                            채점 방식
                                        </div>
                                        <input
                                            type="button"
                                            value="직접 채점"
                                            className={newTestAutoGrading === false ? styles.buttonOn1 : styles.buttonOff1}
                                            onClick={() => {
                                                setNewTestAutoGrading(false);
                                            }}
                                        />
                                        <input
                                            type="button"
                                            value="종료 후 자동 채점"
                                            className={newTestAutoGrading === true ? styles.buttonOn3 : styles.buttonOff3}
                                            onClick={() => {
                                                setNewTestAutoGrading(true);
                                            }}
                                        />
                                        <br /><br />

                                        <div className={styles.addType}>
                                            시험지 및 점수 공개
                                        </div>
                                        <input
                                            type="button"
                                            value="공개 안 함"
                                            className={newTestFeedback === false ? styles.buttonOn1 : styles.buttonOff1}
                                            onClick={() => {
                                                setNewTestFeedback(false);
                                            }}
                                        />
                                        <input
                                            type="button"
                                            value="공개 함"
                                            className={newTestFeedback === true ? styles.buttonOn3 : styles.buttonOff3}
                                            onClick={() => {
                                                setNewTestFeedback(true);
                                            }}
                                        />
                                        <br /><br /><br />

                                        <input
                                            className={styles.acceptButton}
                                            type="submit"
                                            value="만들기"
                                        />

                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => {
                                                setIsEditingTestInfo(false);
                                                setNewTestName(beforeTestName);
                                                setNewTestDate(beforeTestDate);
                                                setNewTestTime(beforeTestTime);
                                                setNewTestAutoGrading(beforeTestAutoGrading);
                                                setNewTestFeedback(beofreTestFeedback);
                                            }}>
                                            취소
                                        </button>
                                    </form>
                                </div>
                            </div>
                        }

                        {
                            tab === 2

                            &&

                            <div>
                                {
                                    myQuestions.map((current, index) => (
                                        <div>
                                            <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} deleteButton={true} />
                                        </div>
                                    ))
                                }

                                <button
                                    className={styles.addButton}
                                    onClick={() => {
                                        setIsCreatingQuestion(true);
                                        setQuestionType("주관식");
                                    }}>
                                    문제 생성
                                    <img alt="home" src={process.env.PUBLIC_URL + "/icon/add.png"} />
                                </button>

                                {
                                    isCreatingQuestion

                                    &&

                                    <form onSubmit={createQuestion}>
                                        <div className={styles.addBackground}>
                                            <div className={styles.addContainer}>
                                                <div>
                                                    <div className={styles.addType}>
                                                        유형
                                                    </div>
                                                    <input
                                                        type="button"
                                                        value="주관식"
                                                        className={questionType === "주관식" ? styles.buttonOn1 : styles.buttonOff1}
                                                        onClick={() => {
                                                            setQuestionType("주관식");
                                                            setInputAnswer("");
                                                            setValueOfChoices({});
                                                        }}
                                                    />

                                                    <input
                                                        type="button"
                                                        value="객관식"
                                                        className={questionType === "객관식" ? styles.buttonOn2 : styles.buttonOff2}
                                                        onClick={() => {
                                                            setQuestionType("객관식");
                                                            setInputAnswer(0);
                                                            setNumberOfChoices(3);
                                                            setValueOfChoices({});
                                                        }}
                                                    />

                                                    <input
                                                        type="button"
                                                        value="진위형"
                                                        className={questionType === "진위형" ? styles.buttonOn3 : styles.buttonOff3}
                                                        onClick={() => {
                                                            setQuestionType("진위형");
                                                            setInputAnswer(0);
                                                            setValueOfChoices({});
                                                        }}
                                                    />
                                                </div>
                                                <br />

                                                <div>
                                                    <div className={styles.addType}>
                                                        배점
                                                    </div>

                                                    <input
                                                        type="number"
                                                        name="points"
                                                        value={inputPoints}
                                                        onChange={onChange}
                                                        required
                                                        className={styles.addPoints}
                                                    />점
                                                </div>
                                                <br />

                                                <div>
                                                    <div className={styles.addType}>
                                                        질문
                                                    </div>

                                                    <textarea
                                                        type="text"
                                                        name="question"
                                                        value={inputQuestion}
                                                        onChange={onChange}
                                                        required
                                                        spellCheck="false"
                                                        className={styles.addQuestion}
                                                    />
                                                </div>

                                                {
                                                    questionType === "주관식"

                                                    &&

                                                    <div>
                                                        <br />
                                                        <div className={styles.addType}>
                                                            정답
                                                        </div>

                                                        <textarea
                                                            type="text"
                                                            name="answer"
                                                            value={inputAnswer}
                                                            onChange={onChange}
                                                            required
                                                            spellCheck="false"
                                                            className={styles.addAnswer}
                                                        />
                                                    </div>
                                                }

                                                {
                                                    questionType === "객관식"

                                                    &&

                                                    <div>
                                                        <div className={styles.addChoicesContainer}>
                                                            <div className={styles.addChoicesNumber}>1</div>
                                                            <input name={0} onChange={onChangeChoices} value={valueOfChoices[0]} className={styles.addChoicesValue} required />
                                                            <input type="button" className={inputAnswer === 0 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(0); }} />
                                                        </div>

                                                        <div className={styles.addChoicesContainer}>
                                                            <div className={styles.addChoicesNumber}>2</div>
                                                            <input name={1} onChange={onChangeChoices} value={valueOfChoices[1]} className={styles.addChoicesValue} required />
                                                            <input type="button" className={inputAnswer === 1 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(1); }} />
                                                        </div>

                                                        <div className={styles.addChoicesContainer}>
                                                            <div className={styles.addChoicesNumber}>3</div>
                                                            <input name={2} onChange={onChangeChoices} value={valueOfChoices[2]} className={styles.addChoicesValue} required />
                                                            <input type="button" className={inputAnswer === 2 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(2); }} />
                                                        </div>

                                                        {
                                                            numberOfChoices >= 4 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>4</div>
                                                                <input name={3} onChange={onChangeChoices} value={valueOfChoices[3]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 3 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(3); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 5 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>5</div>
                                                                <input name={4} onChange={onChangeChoices} value={valueOfChoices[4]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 4 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(4); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 6 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>6</div>
                                                                <input name={5} onChange={onChangeChoices} value={valueOfChoices[5]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 5 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(5); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 7 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>7</div>
                                                                <input name={6} onChange={onChangeChoices} value={valueOfChoices[6]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 6 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(6); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 8 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>8</div>
                                                                <input name={7} onChange={onChangeChoices} value={valueOfChoices[7]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 7 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(7); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 9 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>9</div>
                                                                <input name={8} onChange={onChangeChoices} value={valueOfChoices[8]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 8 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(8); }} />
                                                            </div>
                                                        }

                                                        {
                                                            numberOfChoices >= 10 && <div className={styles.addChoicesContainer}>
                                                                <div className={styles.addChoicesNumber}>10</div>
                                                                <input name={9} onChange={onChangeChoices} value={valueOfChoices[9]} className={styles.addChoicesValue} required />
                                                                <input type="button" className={inputAnswer === 9 ? styles.answerChecked : styles.answerNotChecked} value="정답" onClick={() => { setInputAnswer(9); }} />
                                                            </div>
                                                        }

                                                        <div className={styles.choicesButtonZone}>
                                                            <input
                                                                type="button"
                                                                value="-"
                                                                className={styles.choicesButton}
                                                                onClick={() => {
                                                                    if (numberOfChoices === 3) {
                                                                        alert("최소 3개의 선택지는 있어야합니다.")
                                                                    }
                                                                    setNumberOfChoices(numberOfChoices - 1);
                                                                    setInputAnswer(0);
                                                                }}
                                                            />
                                                            <input
                                                                type="button"
                                                                value="+"
                                                                className={styles.choicesButton}
                                                                onClick={() => {
                                                                    if (numberOfChoices === 10) {
                                                                        alert("더 이상 선택지를 추가할 수 없습니다.")
                                                                    }
                                                                    setNumberOfChoices(numberOfChoices + 1);
                                                                    setInputAnswer(0);
                                                                }}
                                                            />
                                                        </div>

                                                        <div className={styles.addType}>
                                                            정답
                                                        </div>
                                                        {inputAnswer + 1}번 {valueOfChoices[inputAnswer]}<br />
                                                    </div>
                                                }

                                                {
                                                    questionType === "진위형"

                                                    &&

                                                    <div>
                                                        <br />
                                                        <div className={styles.addType}>
                                                            정답
                                                        </div>

                                                        {inputAnswer === 0 ? "참" : "거짓"}<br />
                                                        <input type="button" value="참" onClick={() => { setInputAnswer(0); }} className={inputAnswer === 0 ? styles.buttonOn1 : styles.buttonOff1} />
                                                        <input type="button" value="거짓" onClick={() => { setInputAnswer(1); }} className={inputAnswer === 1 ? styles.buttonOn3 : styles.buttonOff3} />
                                                    </div>
                                                }

                                                <br />
                                                <input
                                                    type="submit"
                                                    value="출제"
                                                    className={styles.acceptButton}
                                                />

                                                <button
                                                    className={styles.cancelButton}
                                                    onClick={() => {
                                                        setIsCreatingQuestion(false);
                                                        setInputQuestion("");
                                                        setInputAnswer("");
                                                        setInputPoints("");
                                                    }}>
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                }
                            </div>
                        }

                        {
                            tab === 3

                            &&

                            <div>
                                {myStudents.map((current) => (
                                    <div>
                                        {current.name}&nbsp;&nbsp;&nbsp;
                                        <Link to={"/class/" + classCode + "/test/" + testCode + "/answersheet/" + current.studentId}>확인</Link>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    :

                    // 학생 전용 화면
                    <div>

                        {
                            myStudents.map(row => row.studentId).includes(userObject.uid) && userData.userType === "student"

                                ?

                                <div>
                                    <div className={styles.className}>
                                        {classInfo[0]?.className}
                                    </div>

                                    <div className={styles.classCode}>
                                        {classInfo[0]?.teacherName}
                                    </div>
                                    <br />

                                    <div className={styles.className}>
                                        {testInfo?.testName}
                                    </div>
                                    <br />



                                    <div className={styles.timeContainer}>
                                        <div>
                                            <div className={styles.timeSmallText}>시작 시간</div>
                                            <div className={styles.timeBigText}>{new Date(testInfo?.testDate).toLocaleTimeString()}</div>
                                        </div>

                                        <div>
                                            <div className={styles.timeSmallText}>현재 시간</div>
                                            <div className={styles.timeBigText}><CurrentTime /></div>
                                        </div>

                                        <div>
                                            <div className={styles.timeSmallText}>종료 시간</div>
                                            <div className={styles.timeBigText}>
                                                {new Date(testInfo?.testDate + testInfo?.testTime * 60000).toLocaleTimeString()}
                                            </div>
                                        </div>

                                        {/* 응시 가능 여부 : {isTestTime() ? "가능" : "불가능"}<br /> */}
                                    </div>



                                    {
                                        isTestTime() === "running"

                                        &&

                                        <div>
                                            {
                                                showNotice

                                                    ?

                                                    <div>
                                                        안내사항

                                                        <button onClick={() => {
                                                            setShowNotice(false);
                                                        }}>
                                                            시험 시작하기
                                                        </button>
                                                    </div>

                                                    :

                                                    <div>
                                                        {
                                                            myQuestions.map((current, index) => (
                                                                <div>
                                                                    <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} deleteButton={false} />
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
                                    }

                                    {
                                        isTestTime() === "before"

                                        &&

                                        <div className={styles.notTestTime}>
                                            시험 시작 전입니다.
                                        </div>
                                    }

                                    {
                                        isTestTime() === "after"

                                        &&

                                        <div className={styles.notTestTime}>
                                            시험이 종료되었습니다.

                                            <div>
                                                {
                                                    testInfo.testFeedback === true

                                                        ?

                                                        <Link to={"/class/" + classCode + "/test/" + testCode + "/answersheet/" + userData.userId}>
                                                            답안지 및 성적 확인
                                                        </Link>

                                                        :

                                                        <div>
                                                            시험 종료후 문제 및 답안이 공개되지 않은 시험입니다.
                                                        </div>
                                                }
                                            </div>
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
        </div>
    )
}

export default Test;