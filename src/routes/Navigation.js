import React from "react";
import { Link } from "react-router-dom";



function Navigation() {
    return (
        <ul>
            <li>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span>
                        홈
                    </span>
                </Link>
            </li>

            <li>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <span>
                        프로필
                    </span>
                </Link>
            </li>
        </ul>
    )
}

export default Navigation;