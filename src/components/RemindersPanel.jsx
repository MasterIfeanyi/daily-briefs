"use client";

import { useState, useEffect } from "react";
import { TrashIcon } from "./Icons";

export default function RemindersPanel() {
    const [reminders, setReminders] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);

    const getTodayDateString = () => new Date().toISOString().split("T")[0];

    // 1. Read directly from MongoDB on mount
    useEffect(() => {
        async function fetchReminders() {
            try {
                const today = getTodayDateString();
                const res = await fetch(`/api/reminders?date=${today}`);
                if (res.ok) {
                    const json = await res.json();
                    // Map database items. MongoDB uses '_id' instead of 'id'
                    const formatted = (json.data || []).map(item => ({
                        id: item._id,
                        text: item.text
                    }));
                    setReminders(formatted);
                } else {
                    setReminders([]);
                }
            } catch (error) {
                console.error("Failed fetching reminders:", error);
                setReminders([]);
            } finally {
                setLoading(false);
            }
        }
        fetchReminders();
    }, []);

    // 2. Network Sync: Create new item in MongoDB
    const addReminder = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const textToSend = inputValue.trim();
        setInputValue("");

        // Create a temporary local item for instantaneous UI feedback
        const tempId = `temp-${Date.now()}`;
        const tempReminder = { id: tempId, text: textToSend };
        setReminders(prev => [...prev, tempReminder]);

        try {
            const res = await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: textToSend,
                    date: getTodayDateString()
                })
            });

            if (res.ok) {
                const json = await res.json();
                // Replace temporary string item with real database entry schema
                setReminders(prev =>
                    prev.map(r => r.id === tempId ? { id: json.data._id, text: json.data.text } : r)
                );
            } else {
                throw new Error("Server rejected write transaction");
            }
        } catch (err) {
            console.error("Failed adding reminder to database:", err);
            // Revert UI additions if network drop occurs
            setReminders(prev => prev.filter(r => r.id !== tempId));
        }
    };

    // 3. Network Sync: Delete item from MongoDB
    const deleteReminder = async (id) => {
        // Optimistic UI update: remove item immediately
        const backupReminders = [...reminders];
        setReminders(prev => prev.filter((r) => r.id !== id));

        try {
            const res = await fetch(`/api/reminders?id=${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Server rejected delete execution");
        } catch (err) {
            console.error("Failed removing record from database:", err);
            // Rollback UI to previous safe array state
            setReminders(backupReminders);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-(--surface-alt) h-48 rounded-lg w-full" />;
    }

    return (
        <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
            <h3 className="text-xl font-extrabold text-(--foreground) mb-4">Today</h3>
            <ul className="space-y-3 mb-4">
                {reminders.length === 0 ? (
                    <li className="text-(--muted-foreground) text-sm">No reminders for today.</li>
                ) : (
                    reminders.map((reminder) => (
                        <li key={reminder.id} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-(--brand)"></span>
                                <span className="text-(--foreground) text-sm">{reminder.text}</span>
                            </div>
                            <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="text-(--muted-foreground) hover:text-(--error) transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Delete reminder"
                            >
                                <TrashIcon />
                            </button>
                        </li>
                    ))
                )}
            </ul>
            <form onSubmit={addReminder} className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="New reminder..."
                    className="flex-1 bg-(--input) border border-border rounded-md px-3 py-2 text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--ring) focus:ring-brand placeholder:text-(--muted-foreground)"
                />
                <button
                    type="submit"
                    className="bg-(--brand) hover:bg-(--brand-hover) text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                    Add
                </button>
            </form>
        </div>
    );
}