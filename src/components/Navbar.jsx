"use client"

import React, {useState} from 'react'
import { SunIcon, MoonIcon } from "@/components/Icons";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {

    const [currentDate] = useState(
        () => new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }).format(new Date())
    );

    return (
        <header className="bg-(--brand) text-white px-6 py-4 flex items-center justify-between shadow-md">
            <h1 className="text-xl font-extrabold tracking-tight">Daily Briefing</h1>
            <div className="flex items-center space-x-6">
                <span className="font-semibold text-sm hidden sm:block">{currentDate}</span>

                <span>
                    <ThemeToggle />
                </span>
            </div>
        </header>
    )
}

export default Navbar