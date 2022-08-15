import React from "react";
import { useState } from "react";

import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { authService } from "../FirebaseModules";


import { dbService } from "../FirebaseModules";
import { collection } from "firebase/firestore";
import { addDoc } from "firebase/firestore";

import styles from "./Main.module.css"



function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [userType, setUserType] = useState()
    const [newAccount, setNewAccount] = useState(false);
    const [findPassword, setFindPassword] = useState(false);
    const [message, setMessage] = useState("")

    const auth = getAuth();

    function onChange(event) {
        const { target: { name, value } } = event;

        if (name === "email") {
            setEmail(value);
        }

        else if (name === "password") {
            setPassword(value);
        }

        else if (name === "passwordCheck") {
            setPasswordCheck(value);
        }

        else if (name === "userType") {
            setUserType(value);
        }
    }

    

    async function onSubmit (event) {
        event.preventDefault();

        try {
            if (newAccount) {
                if (password === passwordCheck) {
                    await createUserWithEmailAndPassword(
                        auth, email, password
                    );
                }

                else {
                    setMessage("비밀번호가 일치하지 않습니다.")
                }
            }

            else if (findPassword) {
                await sendPasswordResetEmail(auth, email);
                setMessage("이메일이 전송되었습니다.");
                setEmail("");
                setPassword("");
                setFindPassword(false);
            }

            else {
                await signInWithEmailAndPassword(
                    auth, email, password
                );
            }

        }

        catch (error) {
            if (error.code === "auth/user-not-found") {
                setMessage("가입되지 않은 이메일입니다.");
            }

            else if (error.code === "auth/invalid-email") {
                setMessage("올바르지 않은 이메일 형식입니다.");
            }

            else if (error.code === "auth/wrong-password") {
                setMessage("올바르지 않은 비밀번호입니다.");
            }

            else if (error.code === "auth/email-already-in-use") {
                setMessage("이미 가입된 이메일입니다.");
            }

            else if (error.code === "auth/weak-password") {
                setMessage("비밀번호가 너무 짧습니다.");
            }

            else {
                setMessage("로그인 중에 오류가 발생했습니다.");
            }
        }
    }

    async function addUserToDatabase(event) {
        event.preventDefault();

        addDoc(collection(dbService, "users"), {
            email: email,
            userType: userType,
        });
    }



    function toggleLoginRegister() {
        setMessage("");
        setEmail("");
        setPassword("");
        setPasswordCheck("");
        setNewAccount(prev => !prev);
    }

    function toggleLoginFindPassword() {
        setMessage("");
        setEmail("");
        setPassword("");
        setPasswordCheck("");
        setFindPassword(prev => !prev);
    }





    return (
        <div className={styles.container}>
            <div className={styles.background} />

            <div className={styles.title}>
                login
            </div>
            <br />

            <form onSubmit={onSubmit}>
                <input
                    name="email"
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={onChange}
                    className={styles.inputZone}
                    required
                />
                <br />

                {
                    !findPassword &&
                    <>
                        <input
                            name="password"
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={onChange}
                            className={styles.inputZone}
                            required
                        />
                    </>
                }
                <br />


                {
                    newAccount && !findPassword &&
                    <div>
                        <input
                            name="passwordCheck"
                            type="password"
                            placeholder="비밀번호 확인"
                            value={passwordCheck}
                            onChange={onChange}
                            className={styles.inputZone}
                            required
                        />
                        <br />

                        <input
                            name="userType"
                            type="text"
                            placeholder="유형 입력"
                            value={userType}
                            onChange={onChange}
                            className={styles.inputZone}
                            required
                        />
                        <br />
                    </div>
                }

                <input
                    type="submit"
                    value={!newAccount ? (!findPassword ? "로그인" : "비밀번호 재설정") : "회원 가입"}
                    className={styles.blueButton}
                />
                <br />
            </form>

            <div className={styles.errorMessage}>
                {message}
            </div>

            <span onClick={toggleLoginRegister} className={styles.toggleButton}>
                {
                    newAccount === true && findPassword === false ?
                        "돌아가기" :
                        (findPassword === false ? "회원가입 하기" : "")
                }
            </span>

            <span className={styles.toggleButtonBeside}>
                {
                    newAccount === false && findPassword === false ? "ㅤ|ㅤ" : ""
                }
            </span>

            <span
                onClick={toggleLoginFindPassword} className={styles.toggleButton}>
                {
                    findPassword === true && newAccount === false ?
                        "돌아가기" :
                        (newAccount === false ? "비밀번호 찾기" : "")
                }
            </span>
        </div>
    )
}

export default Auth;