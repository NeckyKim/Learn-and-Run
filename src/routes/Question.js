import { dbService } from "../FirebaseModules";
import { updateDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { useState } from "react";

import styles from "./Question.module.css"



function Question({ number, points, question, type, choices, answer, id, classCode, testCode, userType, answerSheet, answerSheetChange, deleteButton }) {
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



    async function editQuestion(event) {
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



    return (
        <div>
            <div>
                <div className={styles.questionInfo}>
                    <div className={styles.questionNumber}>
                        {number + 1}.
                    </div>

                    <div className={styles.pointsContainer}>
                        {points}점
                    </div>
                </div>

                <div className={styles.questionContainer}>
                    {question}
                </div>

                {
                    userType === "teacher"

                        ?

                        // 강사 전용 정답칸, 수정 버튼, 삭제 버튼
                        <div>
                            <div className={styles.answerZone}>
                                정답
                            </div>

                            {
                                type === "주관식"

                                &&

                                <div className={styles.answerContainer}>
                                    {answer}
                                </div>
                            }

                            {
                                type === "객관식"

                                &&

                                <div>
                                    {Object.keys(choices).length >= 1 && <div className={answer === 0 ? styles.answerBlue : styles.answerGray}>{choices[0]}</div>}
                                    {Object.keys(choices).length >= 2 && <div className={answer === 1 ? styles.answerBlue : styles.answerGray}>{choices[1]}</div>}
                                    {Object.keys(choices).length >= 3 && <div className={answer === 2 ? styles.answerBlue : styles.answerGray}>{choices[2]}</div>}
                                    {Object.keys(choices).length >= 4 && <div className={answer === 3 ? styles.answerBlue : styles.answerGray}>{choices[3]}</div>}
                                    {Object.keys(choices).length >= 5 && <div className={answer === 4 ? styles.answerBlue : styles.answerGray}>{choices[4]}</div>}
                                    {Object.keys(choices).length >= 6 && <div className={answer === 5 ? styles.answerBlue : styles.answerGray}>{choices[5]}</div>}
                                    {Object.keys(choices).length >= 7 && <div className={answer === 6 ? styles.answerBlue : styles.answerGray}>{choices[6]}</div>}
                                    {Object.keys(choices).length >= 8 && <div className={answer === 7 ? styles.answerBlue : styles.answerGray}>{choices[7]}</div>}
                                    {Object.keys(choices).length >= 9 && <div className={answer === 8 ? styles.answerBlue : styles.answerGray}>{choices[8]}</div>}
                                    {Object.keys(choices).length >= 10 && <div className={answer === 9 ? styles.answerBlue : styles.answerGray}>{choices[9]}</div>}
                                </div>
                            }
                            <br />

                            {/* <button
                                className={styles.editButton}
                                onClick={() => {
                                    setIsEditingQuestion(true);
                                }}>
                                수정
                            </button> */}

                            {
                                deleteButton

                                &&

                                <button
                                    className={styles.deleteButton}
                                    onClick={deleteQuestion}>
                                    삭제
                                </button>
                            }
                        </div>

                        :

                        // 학생 전용 답안 입력칸
                        <div>
                            {
                                type === "주관식"

                                &&

                                <div>
                                    <div className={styles.answerZone}>
                                        답안
                                    </div>

                                    <textarea
                                        type="text"
                                        name={number}
                                        onChange={onChangeAnswerSheet}
                                        value={answerSheet[number]}
                                        spellCheck="false"
                                        className={styles.answerContainer}
                                    />
                                </div>
                            }



                            {
                                type === "객관식"

                                &&

                                <div>
                                    {Object.keys(choices).length >= 1 && <button className={answerSheet[number] === "0" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={0} onClick={onChangeAnswerSheet}>{choices[0]}</button>}

                                    {Object.keys(choices).length >= 2 && <button className={answerSheet[number] === "1" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={1} onClick={onChangeAnswerSheet}>{choices[1]}</button>}

                                    {Object.keys(choices).length >= 3 && <button className={answerSheet[number] === "2" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={2} onClick={onChangeAnswerSheet}>{choices[2]}</button>}

                                    {Object.keys(choices).length >= 4 && <button className={answerSheet[number] === "3" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={3} onClick={onChangeAnswerSheet}>{choices[3]}</button>}

                                    {Object.keys(choices).length >= 5 && <button className={answerSheet[number] === "4" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={4} onClick={onChangeAnswerSheet}>{choices[4]}</button>}

                                    {Object.keys(choices).length >= 6 && <button className={answerSheet[number] === "5" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={5} onClick={onChangeAnswerSheet}>{choices[5]}</button>}

                                    {Object.keys(choices).length >= 7 && <button className={answerSheet[number] === "6" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={6} onClick={onChangeAnswerSheet}>{choices[6]}</button>}

                                    {Object.keys(choices).length >= 8 && <button className={answerSheet[number] === "7" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={7} onClick={onChangeAnswerSheet}>{choices[7]}</button>}

                                    {Object.keys(choices).length >= 9 && <button className={answerSheet[number] === "8" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={8} onClick={onChangeAnswerSheet}>{choices[8]}</button>}

                                    {Object.keys(choices).length >= 10 && <button className={answerSheet[number] === "9" ? styles.answerBlue : styles.answerGray} type="button" name={number} value={9} onClick={onChangeAnswerSheet}>{choices[9]}</button>}
                                </div>
                            }
                        </div>
                }
                <br />
            </div>



            {/* 문제 수정 칸 */}
            {
                isEditingQuestion

                &&

                <div>
                    <form onSubmit={editQuestion}>
                        <div>
                            {number + 1}.
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
                </div>
            }
        </div>
    )
}

export default Question;