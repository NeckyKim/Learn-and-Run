import { useParams } from "react-router";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { dbService } from "../FirebaseModules";
import { collection, deleteDoc } from "firebase/firestore";
import { documentId } from "firebase/firestore";
import { FieldPath } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
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
    const [currentUserData, setCurrentUserData] = useState([]);
    const [myStudents, setMyStudents] = useState([]);
    const [findingEmail, setFindingEmail] = useState("");
    const [findingEmailResults, setFindingEmailResults] = useState([]);

    const [isCreatingTest, setIsCreatingTest] = useState(false);
    const [inputTestName, setInputTestName] = useState("");
    const [inputTestDate, setInputTestDate] = useState("");
    const [inputTestTime, setInputTestTime] = useState("");

    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [inputStudentEmail, setInputStudentEmail] = useState("");
    const [inputStudentName, setInputStudentName] = useState("");
    const [inputStudentId, setInputStudentId] = useState("");



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



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "testName") {
            setInputTestName(value);
        }

        else if (name === "studentName") {
            setInputStudentName(value);
        }

        else if (name === "studentEmail") {
            setInputStudentEmail(value);
        }

        else if (name === "studentCode") {
            setInputStudentId(value);
        }

        else if (name === "testDate") {
            setInputTestDate(value);
        }

        else if (name === "testTime") {
            setInputTestTime(value);
        }
    }



    function timeConverter(date) {
        var datum = Date.parse(date);
        return datum/1000;
    }


    async function createTest(event) {
        event.preventDefault();

        await addDoc(collection(dbService, "classes/" + classCode + "/tests"), {
            testName: inputTestName,
            testDate: timeConverter(inputTestDate),
            testTime: inputTestTime,
            testAvailable: false,
        });

        setIsCreatingTest(false);
        setInputTestName("");
    }



    // 이메일로 학생 찾기
    function findStudentByEmail(email) {
        const myQuery = query(
            collection(dbService, "users"),
            where("email", "==", email)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                name: current.name,
                email: current.email,
                userId: current.userId,
                userType: current.userType,

                ...current.data()
            }));

            setFindingEmailResults(tempArray);
        });
    }



    async function addStudent(event) {
        event.preventDefault();

        await setDoc(doc(dbService, "classes/" + classCode + "/students", findingEmailResults[0]?.userId), {
            studentId: findingEmailResults[0]?.userId,
            name: findingEmailResults[0]?.name,
            email: findingEmailResults[0]?.email,
        });

        await setDoc(doc(dbService, "users/" + findingEmailResults[0]?.userId + "/classes", classCode), {
            classCode: classCode,
            className: classInfo[0]?.className,
            teacherName: classInfo[0]?.teacherName,
        });

        setIsAddingStudent(false);
    }



    async function deleteStudent(studentId) {
        const ok = window.confirm("해당 학생을 삭제하시겠습니까?")

        if (ok) {
            await deleteDoc(doc(dbService, "classes/" + classCode + "/students/" + studentId));
            await deleteDoc(doc(dbService, "users/" + studentId + "/classes/" + classCode));
        }
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
                myClasses.includes(classCode) && currentUserData?.userType === "teacher"
                    ?
                    <div>
                        강의 이름 : {classInfo[0]?.className}
                        <br />
                        강의 코드 : {classCode}
                        <br /><br />

                        {
                            !isCreatingTest
                                ?
                                <div>
                                    <button onClick={() => {
                                        setIsCreatingTest(true);
                                        setIsAddingStudent(false);
                                    }}>
                                        시험 만들기
                                    </button>
                                </div>
                                :
                                <div>
                                    <form onSubmit={createTest}>
                                        시험 이름
                                        <input
                                            type="text"
                                            name="testName"
                                            value={inputTestName}
                                            onChange={onChange}
                                            maxLength={30}
                                            required
                                        />
                                        <br />

                                        응시 가능 날짜
                                        <input
                                            type="datetime-local"
                                            name="testDate"
                                            value={inputTestDate}
                                            onChange={onChange}
                                            required
                                        />
                                        <br />

                                        응시 시간
                                        <input
                                            type="number"
                                            name="testTime"
                                            value={inputTestTime}
                                            onChange={onChange}
                                            required
                                        />분
                                        <br />

                                        <input
                                            type="submit"
                                            value="시험 만들기"
                                        />
                                        <br />
                                    </form>

                                    <button onClick={() => {
                                        setIsCreatingTest(false);
                                        setInputTestName("");
                                    }}>
                                        시험 만들기 취소
                                    </button>
                                </div>
                        }
                        <br />

                        {
                            !isAddingStudent
                                ?
                                <div>
                                    <button onClick={() => {
                                        setIsCreatingTest(false);
                                        setIsAddingStudent(true);
                                    }}>
                                        학생 추가하기
                                    </button>
                                </div>
                                :
                                <div>
                                    학생 이메일
                                        <input
                                            type="email"
                                            name="studentEmail"
                                            value={inputStudentEmail}
                                            onChange={onChange}
                                            maxLength={30}
                                            required
                                        />
                                        <br />

                                        <button onClick={() => {
                                            findStudentByEmail(inputStudentEmail);
                                        }}>
                                            이메일로 찾기
                                        </button>
                                        <br />

                                        <div>
                                            {findingEmailResults[0]?.name}
                                            < br />
                                            {findingEmailResults[0]?.userId}
                                            < br />
                                        </div>

                                    <form onSubmit={addStudent}>
                                        <input
                                            type="submit"
                                            value="학생 추가하기"
                                        />
                                    </form>

                                    <button onClick={() => {
                                        setIsAddingStudent(false);
                                        setInputStudentEmail("");
                                        setFindingEmailResults([]);
                                    }}>
                                        학생 추가하기 취소
                                    </button>
                                </div>
                        }
                        <br />

                        <div>
                            <div>
                                ---시험 정보---
                            </div>
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
                            <br />

                            <div>
                                ---학생 정보---
                            </div>
                            {
                                myStudents.map((current) => (
                                    <div>
                                        {current.name} : {current.email}

                                        <button onClick={() => {
                                            deleteStudent(current.studentId);
                                        }}>
                                            삭제
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    :
                    <div>
                        {
                            currentUserData?.userType === "student" && myStudents.map(row => row.email).includes(userObject.email)
                                ?
                                <div>
                                    강의 이름 : {classInfo[0]?.className}
                                    <br />

                                    강사 이름 : {classInfo[0]?.teacherName}
                                    <br /><br />

                                    <div>
                                        ---시험 정보---
                                    </div>
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
                                    <br />
                                </div>
                                :
                                <div>
                                    접근 오류
                                </div>
                        }
                    </div>
            }

            <br /><br /><br />
            <Link to={"/"} style={{ textDecoration: 'none' }}>
                <span>
                    홈으로 돌아가기
                </span>
            </Link>
        </div>
    )
}

export default Class;