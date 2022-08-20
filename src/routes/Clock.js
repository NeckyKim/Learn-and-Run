import React from "react";
import { useEffect } from "react";
import { useState } from "react";



function Clock() {
    const [time, setTime] = useState(new Date());

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

export default Clock;