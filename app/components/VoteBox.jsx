"use client";
import { useState } from "react";

export default function VoteBox({ unitId }) {
  const [vote, setVote] = useState(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!vote) {
      setMessage("Please select a thumbs up or thumbs down first.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          voteType: vote,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setMessage("Feedback submitted successfully!");
      setReason("");
      setVote(null);
    } catch (err) {
      setMessage(err.message || "Error submitting feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 text-center">
      <p
        className="text-[1.3rem] font-bold mb-2"
        style={{
          color: "#fff",
          textShadow: "0 0 12px rgba(173,118,255,0.6)",
        }}
      >
        Do you agree with this value?
      </p>

      <div className="flex space-x-6 mb-3">
        {/* 👍 */}
        <button
          className={`relative p-3 text-2xl rounded-full transition-all duration-300 border-2 ${
            vote === "up"
              ? "bg-[#00ff88] border-black shadow-[0_0_6px_#00ff88] scale-105"
              : "bg-[#00cc6a]/70 border-black hover:bg-[#00ff88]/80"
          } text-white font-bold`}
          onClick={() => setVote("up")}
          disabled={submitting}
        >
          👍
        </button>

        {/* 👎 */}
        <button
          className={`relative p-3 text-2xl rounded-full transition-all duration-300 border-2 ${
            vote === "down"
              ? "bg-[#ff0033] border-black shadow-[0_0_6px_#ff0033] scale-105"
              : "bg-[#cc0029]/70 border-black hover:bg-[#ff0033]/80"
          } text-white font-bold`}
          onClick={() => setVote("down")}
          disabled={submitting}
        >
          👎
        </button>
      </div>

      {/* Feedback box */}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={200}
        placeholder="Why or Why Not?"
        className="w-72 h-16 p-2 text-sm bg-transparent border border-purple-400/60 text-white rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-gray-400 mb-3"
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-white text-black font-semibold py-2 px-6 rounded-md hover:bg-gray-200 transition-colors"
      >
        Submit Feedback
      </button>

      {message && (
        <p
          className={`text-sm mt-2 ${
            message.includes("success") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
