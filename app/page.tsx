"use client";

import { useState, useEffect } from "react";
import Table from "./components/Table";

import { getLogs } from "./utils/messages";

export default function Home() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function getMessages() {
      const { result: messages } = await getLogs();
      setMessages(messages);
      console.log(messages);
    }

    getMessages();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="bg-white text-black p-4 text-center">
        <h1 className="text-3xl font-bold">Telepathy Message Explorer</h1>
      </div>
      <Table />
    </main>
  );
}
