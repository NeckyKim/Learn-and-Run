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
import { updateDoc } from "firebase/firestore";
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
    const [studentClassInfo, setStudentsClassInfo] = useState([]);
    const [findingEmailResults, setFindingEmailResults] = useState([]);

    const [isCreatingTest, setIsCreatingTest] = useState(false);
    const [inputTestName, setInputTestName] = useState("");
    const [inputTestDate, setInputTestDate] = useState("");
    const [inputTestTime, setInputTestTime] = useState("");

    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [inputStudentEmail, setInputStudentEmail] = useState("");



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
                id: current.id,
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
                authenticate: current.authenticate,
                name: current.name,
                email: current.email,

                ...current.data()
            }));

            setMyStudents(tempArray);
        });
    }, [])


    // 학생이 자신의 강의 정보 불러오기
    useEffect(() => {
        const myQuery = query(
            collection(dbService, "classes/" + classCode + "/students/"),
            where(documentId(), "==", userObject.uid)
        );

        onSnapshot(myQuery, (snapshot) => {
            const tempArray = snapshot.docs.map((current) => ({
                authenticate: current.authenticate,

                ...current.data()
            }));

            setStudentsClassInfo(tempArray[0]);
        });
    }, [])




    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "testName") {
            setInputTestName(value);
        }

        else if (name === "studentEmail") {
            setInputStudentEmail(value);
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
            testStatus: "before",
        });

        setIsCreatingTest(false);
        setInputTestName("");
    }



    async function deleteTest(testCode) {
        const ok = window.confirm("해당 시험을 삭제하시겠습니까?")

        if (ok) {
            await deleteDoc(doc(dbService, "classes", classCode, "tests", testCode));
        }
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

        try {
            await setDoc(doc(dbService, "classes/" + classCode + "/students", findingEmailResults[0]?.userId), {
                studentId: findingEmailResults[0]?.userId,
                name: findingEmailResults[0]?.name,
                email: findingEmailResults[0]?.email,
                authenticate: false,
            });
    
            await setDoc(doc(dbService, "users/" + findingEmailResults[0]?.userId + "/classes", classCode), {
                classCode: classCode,
                className: classInfo[0]?.className,
                teacherName: classInfo[0]?.teacherName,
            });
    
            setIsAddingStudent(false);
            setInputStudentEmail("");
            setFindingEmailResults([]);

            alert("학생에게 인증을 요청했습니다.")
        }

        catch (error) {
            alert(error);
        }
        
    }



    async function deleteStudent(studentId) {
        const ok = window.confirm("해당 학생을 삭제하시겠습니까?")

        if (ok) {
            await deleteDoc(doc(dbService, "classes", classCode, "students", studentId));
            await deleteDoc(doc(dbService, "users", studentId, "classes", classCode));
        }
    }



    async function acceptAuthenticate () {
        await updateDoc(doc(dbService, "classes", classCode, "students", userObject.uid), {
            authenticate: true,
        });
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

                                    <button onClick={() => {
                                        findStudentByEmail(inputStudentEmail);
                                    }}>
                                        이메일로 찾기
                                    </button>

                                    {
                                        findingEmailResults[0]?.userId
                                        &&
                                        findingEmailResults[0]?.userType === "student"
                                        &&
                                        <button onClick={addStudent}>
                                            학생 인증 요청
                                        </button>
                                    }
                                    
                                    <br /><br />
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

                                        <Link to={"/class/" + classCode + "/test/" + current.id} style={{ textDecoration: 'none' }}>
                                            <button>
                                                관리
                                            </button>
                                        </Link>

                                        <button onClick={() => {
                                            deleteTest(current.id);
                                        }}>
                                            삭제
                                        </button>
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
                                        {current.authenticate ? current.name : "[인증 요청 중]"}{current.email}

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
                            studentClassInfo?.email === userObject.email
                                ?
                                <div>
                                    {
                                        studentClassInfo?.authenticate
                                            ?
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

                                                                        <Link to={"/class/" + classCode + "/test/" + current.id} style={{ textDecoration: 'none' }}>
                                                                            <button>
                                                                                응시
                                                                            </button>
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

                                            :

                                            <div>
                                                강사가 당신을 강의에 추가했습니다. 해당 강의를 수강하시겠습니까?
                                                <br />

                                                <button onClick={acceptAuthenticate}>
                                                    수락하기
                                                </button>
                                            </div>
                                    }
                                </div>

                                :

                                <div>
                                    접근 불가
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