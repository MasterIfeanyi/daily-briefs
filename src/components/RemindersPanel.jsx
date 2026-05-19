"use client";

import { useState, useEffect } from "react";
import { TrashIcon } from "./Icons";

export default function RemindersPanel() {
  const [reminders, setReminders] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReminders() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/reminders?date=${today}`);
        if (res.ok) {
          const data = await res.json();
          setReminders(data.reminders || []);
        } else {
          setReminders([{ id: 1, text: "Review weekly goals" }, { id: 2, text: "Call the bank" }]);
        }
      } catch (error) {
        setReminders([{ id: 1, text: "Review weekly goals" }, { id: 2, text: "Call the bank" }]);
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, []);

  const addReminder = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newReminder = { id: Date.now(), text: inputValue.trim() };
    setReminders([...reminders, newReminder]);
    setInputValue("");
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  if (loading) {
    return <div className="animate-pulse bg-surface-alt h-48 rounded-lg w-full" />;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-xl font-extrabold text-foreground mb-4">Today</h3>
      <ul className="space-y-3 mb-4">
        {reminders.length === 0 ? (
          <li className="text-muted-foreground text-sm">No reminders for today.</li>
        ) : (
          reminders.map((reminder) => (
            <li key={reminder.id} className="flex items-center justify-between group">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                <span className="text-foreground text-sm">{reminder.text}</span>
              </div>
              <button
                onClick={() => deleteReminder(reminder.id)}
                className="text-muted-foreground hover:text-error transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
          className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="bg-brand hover:bg-(--brand-hover) text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}