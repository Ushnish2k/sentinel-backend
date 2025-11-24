"use client"; // This tells Next.js this page runs in the browser

import { useEffect, useState } from "react";

// Define the shape of our data
interface SentimentLog {
  id: number;
  text: string;
  sentiment: string;
  score: number;
  source: string;
}

export default function Home() {
  const [logs, setLogs] = useState<SentimentLog[]>([]);
  const [loading, setLoading] = useState(true);

  // This runs when the page loads
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/history")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => console.error("Failed to fetch data:", err));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
          SENTINEL
        </h1>
        <p className="text-gray-400 mb-10">Live Brand Reputation Monitor</p>

        {/* The Data Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            Recent Analysis <span className="ml-2 text-sm text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Live</span>
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 animate-pulse">Connecting to Neural Network...</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors">
                  
                  {/* Text Content */}
                  <div className="flex-1 mr-4">
                    <p className="text-gray-200 text-sm">{log.text}</p>
                    <span className="text-xs text-gray-500 uppercase mt-1 inline-block">{log.source}</span>
                  </div>

                  {/* Sentiment Badge */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${log.sentiment === "POSITIVE" ? "text-green-400" : "text-red-400"}`}>
                        {log.sentiment}
                      </p>
                      <p className="text-xs text-gray-600">{(log.score * 100).toFixed(1)}% confidence</p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}