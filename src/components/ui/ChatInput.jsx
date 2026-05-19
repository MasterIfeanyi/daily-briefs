// components/ChatInput.jsx
"use client";

import { useRef } from "react";
import { FaSpinner } from 'react-icons/fa';
import { FaArrowUp } from 'react-icons/fa';

export default function ChatInput({
    value,
    onChange,
    onSend,
    loading = false,
    placeholder = "Ask something...",
}) {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        onChange(e.target.value);
        // Auto-resize
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
        }
    };

    const handleKeyDown = (e) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !loading) onSend();
        }
    };

    return (
        <div className="shrink-0 px-3 py-4">
            <div className="max-w-2xl mx-auto">
                <div className="relative flex items-end bg-surface border border-border rounded-2xl shadow-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-4 py-3.5 pr-14 rounded-2xl outline-none leading-relaxed overflow-y-auto"
                        style={{ minHeight: "52px", maxHeight: "160px" }}
                    />

                    {/* Send button */}
                    <div className="absolute right-2 bottom-2">
                        <button
                            onClick={onSend}
                            disabled={!value.trim() || loading}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
                                value.trim() && !loading
                                    ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                        >
                        {loading ? (
                            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <FaArrowUp />
                        )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}