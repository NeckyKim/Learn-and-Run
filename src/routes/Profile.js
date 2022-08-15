import React from "react";
import { authService } from "../FirebaseModules";
import { useNavigate } from "react-router-dom";



function Profile({ userObject }) {
    const navigate = useNavigate();

    function onLogOutClick() {
        authService.signOut();
        navigate("/");
    }



    return (
        <div>
            <div>
                profile
            </div>

            <div>
                {userObject.email}
            </div>

            <button onClick={onLogOutClick}>
                로그아웃
            </button>
        </div>
    )
}

export default Profile;