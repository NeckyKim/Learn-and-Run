import { useParams } from "react-router";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection } from "firebase/firestore";
import { documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
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
    var navigate = useNavigate();

    const [tab, setTab] = useState(1);

    const [myClasses, setMyClasses] = useState([]);
    const [classInfo, setClassInfo] = useState([]);
    const [myTests, setMyTests] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);
    const [myStudents, setMyStudents] = useState([]);
    const [myAnswersheets, setMyAnswersheets] = useState([]);
    const [myReportCards, setMyReportCards] = useState([]);

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
    const [newTestFeedback, setNewTestFeedback] = useState();

    var beforeTestName = testInfo?.testName;
    var beforeTestDate = testInfo?.testDate;
    var beforeTestTime = testInfo?.testTime;
    var beofreTestFeedback = testInfo?.testFeedback;



    // 사용자 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "users"),
            where(documentId(), "==", userObject.uid)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
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
                ...current.data()
            }));

            setMyStudents(tempArray);
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



    // 강의 정보 
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes"),
            where(documentId(), "==", classCode)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                classCode: current.id,
                ...current.data()
            }));

            setClassInfo(tempArray[0]);
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
                ...current.data()
            }));

            setTestInfo(tempArray[0]);
            setNewTestName(tempArray[0].testName);
            setNewTestTime(tempArray[0].testTime);
            setNewTestFeedback(tempArray[0].testFeedback);
            setNewTestDate(new Date(tempArray[0].testDate).toLocaleDateString("sv-SE") + "T" + new Date(tempArray[0].testDate).toLocaleTimeString('en-US', { hour12: false }))
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



    // 답안지 제출
    async function sendAnswerSheet(event) {
        event.preventDefault();

        var initReportCard = {};
        const numberOfQuestions = Number(Object.keys(myQuestions).length);

        for (var i = 0; i < numberOfQuestions; i++) {
            initReportCard[i] = "notgraded";
        }
        initReportCard.totalScore = "noscore";
        initReportCard.studentsScore = "noscore";

        try {
            await setDoc(doc(dbService, "classes", classCode, "tests", testCode, "answersheet", userObject.uid), answerSheet);
            await setDoc(doc(dbService, "classes", classCode, "tests", testCode, "reportcard", userObject.uid), initReportCard);

            setAnswerSheetMessage("정상적으로 제출되었습니다. " + new Date(Date.now()).toLocaleString());
        }

        catch (error) {
            setAnswerSheetMessage("제출 과정에서 오류가 발생했습니다.");
            console.log(error);
        }
    }



    // 답안지가 없는 경우 생성
    if (!myAnswersheets.includes(userData.userId) && userData.userType === "student") {
        var initAnswerSheet = {};
        const numberOfQuestions = Number(Object.keys(myQuestions).length);

        for (var i = 0; i < numberOfQuestions; i++) {
            initAnswerSheet[i] = null;
        }
        initAnswerSheet.studentId = userData.userId;

        setDoc(doc(dbService, "classes", classCode, "tests", testCode, "answersheet", userData.userId), initAnswerSheet);
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

    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests", testCode, "reportcard")
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => (
                current.id
            ));

            setMyReportCards(tempArray);
        });
    }, [userData])



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
            <span>{time.toLocaleDateString()}<br />{time.toLocaleTimeString()}</span>
        )
    }



    // 현재 시험 응시 가능 확인
    function isTestTime() {
        var startTime = new Date(testInfo.testDate).toLocaleString();
        var currentTime = time.toLocaleString();
        var finishTime = new Date(testInfo.testDate + Number(testInfo.testTime) * 60000).toLocaleString();

        if (currentTime < startTime) {
            return "before"
        }

        else if (currentTime > startTime && currentTime < finishTime) {
            return "running"
        }

        else if (currentTime > finishTime) {
            return "after"
        }
    }



    // 시험 설정 수정
    async function updateTest(event) {
        event.preventDefault();

        await updateDoc(doc(dbService, "classes", classCode, "tests", testCode), {
            testName: newTestName,
            testDate: Date.parse(newTestDate),
            testTime: newTestTime,
            testFeedback: newTestFeedback,
        });

        setIsEditingTestInfo(false);
    }



    // 시험 삭제
    async function deleteTest(testCode) {
        const ok = window.confirm("해당 시험을 삭제하시겠습니까?")
        navigate("/class/" + classCode);

        if (ok) {
            await deleteDoc(doc(dbService, "classes", classCode, "tests", testCode));
        }
    }



    return (
        <div className={styles.testContainer}>

            {
                myClasses.includes(classCode) && myTests.includes(testCode) && userData.userType === "teacher"

                    ?

                    // 강사 전용 화면
                    <div>
                        <div className={styles.className}>
                            {classInfo?.className}
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

                        {/* 설정 탭 */}
                        {
                            tab === 1

                            &&

                            <div>
                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>시작 시각</span>
                                    <span className={styles.blueFont}>{new Date(testInfo?.testDate).toLocaleString()}</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>진행 시간</span>
                                    <span className={styles.blueFont}>{testInfo?.testTime}분</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>종료 시각</span>
                                    <span className={styles.blueFont}>{new Date(testInfo?.testDate + testInfo?.testTime * 60000).toLocaleString()}</span>
                                </div>

                                <div className={styles.testInfoElements}>
                                    <span className={styles.grayFont}>시험지 및 점수 공개</span>
                                    <span className={styles.blueFont}>{testInfo?.testFeedback ? "공개 안 함" : "공개 함"}</span>
                                </div>

                                <button className={styles.acceptButton} onClick={() => { setIsEditingTestInfo(true); }}>
                                    수정
                                </button>

                                <button className={styles.deleteButton} onClick={() => { deleteTest(testCode) }}>
                                    삭제
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
                                            value="수정"
                                        />

                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => {
                                                setIsEditingTestInfo(false);
                                                setNewTestName(beforeTestName);
                                                setNewTestDate(beforeTestDate);
                                                setNewTestTime(beforeTestTime);
                                                setNewTestFeedback(beofreTestFeedback);
                                            }}>
                                            취소
                                        </button>
                                    </form>
                                </div>
                            </div>
                        }

                        {/* 문제 탭 */}
                        {
                            tab === 2

                            &&

                            <div>
                                {
                                    myQuestions.map((current, index) => (
                                        <div>
                                            <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} buttons={true} />
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
                                                        value="객관식"
                                                        className={questionType === "객관식" ? styles.buttonOn1 : styles.buttonOff1}
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
                                                        className={questionType === "진위형" ? styles.buttonOn2 : styles.buttonOff2}
                                                        onClick={() => {
                                                            setQuestionType("진위형");
                                                            setInputAnswer(0);
                                                            setValueOfChoices({});
                                                        }}
                                                    />

                                                    <input
                                                        type="button"
                                                        value="주관식"
                                                        className={questionType === "주관식" ? styles.buttonOn2 : styles.buttonOff2}
                                                        onClick={() => {
                                                            setQuestionType("주관식");
                                                            setInputAnswer("");
                                                            setValueOfChoices({});
                                                        }}
                                                    />

                                                    <input
                                                        type="button"
                                                        value="서술형"
                                                        className={questionType === "서술형" ? styles.buttonOn3 : styles.buttonOff3}
                                                        onClick={() => {
                                                            setQuestionType("서술형");
                                                            setInputAnswer("");
                                                            setValueOfChoices({});
                                                        }}
                                                    />
                                                </div>

                                                <span className={styles.addTypeComment}>
                                                    {questionType} 유형 문제는&nbsp;
                                                    <span className={questionType !== "서술형" ? styles.addTypeCommentBlue : styles.addTypeCommentRed}>
                                                        {questionType !== "서술형" ? "자동으로 채점됩니다." : "자동으로 채점되지 않습니다."}
                                                    </span>
                                                </span>
                                                <br /><br />

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

                                                        <input type="button" value="참" onClick={() => { setInputAnswer(true); }} className={inputAnswer === true ? styles.buttonOn1 : styles.buttonOff1} />
                                                        <input type="button" value="거짓" onClick={() => { setInputAnswer(false); }} className={inputAnswer === false ? styles.buttonOn3 : styles.buttonOff3} />
                                                    </div>
                                                }

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



                        {/* 답안지 탭 */}
                        {
                            tab === 3

                            &&

                            <div>
                                {myStudents.map((current) => (
                                    <div>
                                        {
                                            myAnswersheets.includes(current.studentId)

                                            &&

                                            myReportCards.includes(current.studentId)

                                                ?
   
                                                <Link to={"/class/" + classCode + "/test/" + testCode + "/answersheet/" + current.studentId} style={{ textDecoration: "none" }}>
                                                    <div className={styles.studentElementsZone}>
                                                        <div className={styles.studentName}>
                                                            {current.name}
                                                        </div>

                                                        <div className={styles.goToAnswersheetButton}>
                                                            확인
                                                        </div>
                                                    </div>
                                                </Link>

                                                :

                                                <div className={styles.studentElementsZone}>
                                                    <div className={styles.studentName}>
                                                        {current.name}
                                                    </div>
                                                    
                                                    <div className={styles.noAnswerSheet}>
                                                        미제출
                                                    </div>
                                                </div>
                                        }
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
                                        {classInfo?.className}
                                    </div>

                                    <div className={styles.classCode}>
                                        {classInfo?.teacherName}
                                    </div>
                                    <br />

                                    <div className={styles.className}>
                                        {testInfo?.testName}
                                    </div>
                                    <br />



                                    <div className={styles.timeContainer}>
                                        <div>
                                            <div className={styles.timeSmallText}>시작 시간</div>
                                            <div className={styles.timeBigText}>
                                                {new Date(testInfo?.testDate).toLocaleDateString()}<br />
                                                {new Date(testInfo?.testDate).toLocaleTimeString()}
                                            </div>
                                        </div>

                                        <div>
                                            <div className={styles.timeSmallText}>현재 시간</div>
                                            <div className={styles.timeBigText}><CurrentTime /></div>
                                        </div>

                                        <div>
                                            <div className={styles.timeSmallText}>종료 시간</div>
                                            <div className={styles.timeBigText}>
                                                {new Date(testInfo?.testDate + testInfo?.testTime * 60000).toLocaleDateString()}<br />
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
                                                                    <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} buttons={false} />
                                                                    <br />
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