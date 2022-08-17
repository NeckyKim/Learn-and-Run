import { dbService } from "../FirebaseModules";
import { updateDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { useState } from "react";



function Question({ number, points, question, answer, id, classCode, testCode, userType, answerSheet, answerSheetChange }) {
    const [isEditingQuestion, setIsEditingQuestion] = useState(false);
    const [newPoints, setNewPoints] = useState(points);
    const [newQuestion, setNewQuestion] = useState(question);
    const [newAnswer, setNewAnswer] = useState(answer);

    const beforePoints = points;
    const beforeQuestion = question;
    const beforeAnswer = answer;



    async function deleteQuestion() {
        const ok = window.confirm("삭제하시겠습니까?");

        if (ok) {
            await deleteDoc(doc(dbService, "classes", classCode, "tests", testCode, "questions", id));
        }
    }



    async function changeQuestion(event) {
        event.preventDefault();

        const ok = window.confirm("수정하시겠습니까?");

        if (ok) {
            await updateDoc(doc(dbService, "classes", classCode, "tests", testCode, "questions", id), {
                points: newPoints,
                question: newQuestion,
                answer: newAnswer,
            });

            setIsEditingQuestion(false);
        }
    }



    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "newPoints") {
            setNewPoints(value);
        }

        else if (name === "newQuestion") {
            setNewQuestion(value);
        }

        else if (name === "newAnswer") {
            setNewAnswer(value);
        }
    }

    

    function onChangeAnswerSheet(event) {
        answerSheetChange((prev) => {
            return { ...prev, [event.target.name]: event.target.value }
        });
    }



    const qaStyle = {
        whiteSpace: "pre-wrap",
        border: "1px solid rgb(200, 200, 200)",
        width: "90vw",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: "bold",
        resize: "none"
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
            {
                !isEditingQuestion

                    ?

                    <div>
                        <div>
                            [번호]&nbsp;
                            {number + 1}
                        </div>

                        <div>
                            [배점]&nbsp;
                            {points}점
                        </div>

                        <div>
                            [질문]
                            <div style={qaStyle}>
                                {question}
                            </div>
                        </div>

                        {
                            userType === "teacher"

                                ?

                                <div>
                                    [정답]
                                    <div style={qaStyle}>
                                        {answer}
                                    </div>
                                    

                                    <button onClick={() => {
                                        setIsEditingQuestion(true);
                                    }}>
                                        수정
                                    </button>

                                    <button onClick={deleteQuestion}>
                                        삭제
                                    </button>
                                </div>

                                :

                                <div>
                                    [정답]
                                    <br />
                                    <textarea
                                        type="text"
                                        name={number}
                                        onChange={onChangeAnswerSheet}
                                        value={answerSheet[number]}
                                        spellCheck="false"
                                        style={inputAStyle}
                                    />
                                </div>
                        }
                    </div>

                    :

                    <form onSubmit={changeQuestion}>
                        <div>
                            [번호]&nbsp;
                            {number + 1}
                            <br />
                        </div>

                        <div>
                            [배점]&nbsp;
                            <input
                                type="number"
                                name="newPoints"
                                value={newPoints}
                                onChange={onChange}
                                required
                                spellCheck="false"
                            />점
                        </div>

                        <div>
                            [질문]
                            <br />
                            <textarea
                                type="text"
                                name="newQuestion"
                                value={newQuestion}
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
                                name="newAnswer"
                                value={newAnswer}
                                onChange={onChange}
                                required
                                spellCheck="false"
                                style={inputAStyle}
                            />
                        </div>

                        <input
                            type="submit"
                            value="수정"
                        />

                        <button
                            onClick={() => {
                                setIsEditingQuestion(false);
                                setNewQuestion(beforeQuestion);
                                setNewAnswer(beforeAnswer);
                                setNewPoints(beforePoints);
                            }}>
                            취소
                        </button>
                    </form>
            }



        </div>
    )
}

export default Question;