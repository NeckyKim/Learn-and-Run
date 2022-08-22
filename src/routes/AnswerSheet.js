import React from 'react';
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router";

import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { dbService } from "../FirebaseModules";
import { collection, documentId } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";
import { orderBy } from "firebase/firestore";

import Question from "./Question";
import styles from "./AnswerSheet.module.css";



function AnswerSheet({ userObject }) {
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
    let { answersheetCode } = useParams();

    const [classInfo, setClassInfo] = useState([]);
    const [testInfo, setTestInfo] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [myTests, setMyTests] = useState([]);
    const [myAnswersheets, setMyAnswersheets] = useState([]);
    const [myQuestions, setMyQuestions] = useState([]);

    const [answerSheet, setAnswerSheet] = useState([]);



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

            setClassInfo(tempArray[0]);
        });
    }, [])



    // 문제 정보
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
    }, [userData])



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



    // 답안지 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes", classCode, "tests", testCode, "answersheet"),
            where("studentId", "==", answersheetCode)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                ...current.data()
            }));

            setAnswerSheet(tempArray[0]);
        });
    }, [userData])


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

            setTestInfo(tempArray[0]);
        });
    }, [])



    var studentsScore = 0;
    var totalScore = 0;
    var reportCard = {}

    for (var i = 0; i < myQuestions?.length; i++) {
        if (String(myQuestions[i].answer) === answerSheet[i]) {
            studentsScore = studentsScore + Number(myQuestions[i].points);
            reportCard[i] = "true";
        }

        else {
            reportCard[i] = "false";
        }

        totalScore = totalScore + Number(myQuestions[i].points);

    }

    reportCard.studentsScore = studentsScore;
    reportCard.totalScore = totalScore;
    setDoc(doc(dbService, "classes", classCode, "tests", testCode, "reportcard", answersheetCode), reportCard);



    return (
        <div className={styles.answersheetContainer}>

            {/* 강사 전용 화면 */}
            {
                (userData.userType === "teacher" && myClasses.includes(classCode) && myTests.includes(testCode) && myAnswersheets.includes(answersheetCode))

                &&

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
                    <br />

                    {
                        myQuestions.map((current, index) => (
                            <div>
                                <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} buttons={false} mode="feedback" />

                                <div className={styles.gradingZone}>
                                    답안
                                </div>

                                {
                                    current.type === "객관식"

                                    &&

                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                        <div>
                                            {current.choice[answerSheet[index]]}
                                        </div>

                                        <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                            <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                            </div>

                                            <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenRight}>
                                                {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                            </div>
                                        </div>
                                    </div>
                                }

                                {
                                    current.type === "주관식"

                                    &&

                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                        <div>
                                            {answerSheet[index]}
                                        </div>

                                        <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                            <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                            </div>

                                            <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenRight}>
                                                {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                            </div>
                                        </div>
                                    </div>
                                }

                                {
                                    current.type === "진위형"

                                    &&

                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                        <div>
                                            {answerSheet[index] !== undefined && <span>{answerSheet[index] ? "참" : "거짓"}</span>}
                                        </div>

                                        <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                            <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                            </div>

                                            <div>
                                                {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                            </div>
                                        </div>
                                    </div>
                                }
                                <br /><br />
                            </div>
                        ))
                    }

                    [총점] {studentsScore} / {totalScore}점
                </div>
            }

            {/* 학생 전용 화면 */}
            {
                (userData.userType === "student" && answersheetCode === userData.userId)

                &&


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

                    {
                        testInfo.testFeedback === true

                            ?

                            <div>
                                {
                                    myQuestions.map((current, index) => (
                                        <div>
                                            <Question number={index} points={current.points} type={current.type} question={current.question} choices={current.choice} answer={current.answer} id={current.id} classCode={classCode} testCode={testCode} userType={userData.userType} answerSheet={answerSheet} answerSheetChange={setAnswerSheet} buttons={false} mode="feedback" />

                                            <div className={styles.gradingZone}>
                                                답안
                                            </div>

                                            {
                                                current.type === "객관식"

                                                &&

                                                <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                                    <div>
                                                        {current.choice[answerSheet[index]]}
                                                    </div>

                                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                                        <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                            {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                                        </div>

                                                        <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenRight}>
                                                            {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            {
                                                current.type === "주관식"

                                                &&

                                                <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                                    <div>
                                                        {answerSheet[index]}
                                                    </div>

                                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                                        <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                            {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                                        </div>

                                                        <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenRight}>
                                                            {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            {
                                                current.type === "진위형"

                                                &&

                                                <div className={String(current.answer) === answerSheet[index] ? styles.gradingContainerGreen : styles.gradingContainerRed}>
                                                    <div>
                                                        {answerSheet[index] !== undefined && <span>{answerSheet[index] ? "참" : "거짓"}</span>}
                                                    </div>

                                                    <div className={String(current.answer) === answerSheet[index] ? styles.gradingResultsGreen : styles.gradingResultsRed}>
                                                        <div className={String(current.answer) === answerSheet[index] && styles.gradingResultsGreenLeft}>
                                                            {String(current.answer) === answerSheet[index] ? "정답" : "오답"}
                                                        </div>

                                                        <div>
                                                            {String(current.answer) === answerSheet[index] && <span>+{current.points}점</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            <br /><br />
                                        </div>
                                    ))
                                }

                                [총점] {studentsScore} / {totalScore}점
                            </div>

                            :

                            <div>
                                시험 종료후 문제 및 답안이 공개되지 않은 시험입니다.
                            </div>
                    }
                </div>

            }
        </div>
    )
}

export default AnswerSheet;