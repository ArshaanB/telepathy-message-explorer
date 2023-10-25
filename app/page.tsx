"use client";

import { useState, useEffect } from "react";
import Table from "./components/Table";

import { getLogs } from "./utils/messages";

export default function Home() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function getMessages() {
      const { result: messages } = await getLogs();
      const updatedMessages = messages.map((message) => {
        // The topics field in the response to the above request corresponds with
        // the following tuple: (SentMessageIdentifier, nonce, messageHash) and
        // data corresponds to messageBytes.
        return {
          nonce: message.topics[1],
          messageHash: message.topics[2],
          messageBytes: message.data,
          transactionHash: message.transactionHash
        };
      });
      setMessages(updatedMessages);
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
