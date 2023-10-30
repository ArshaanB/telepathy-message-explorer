import { MessageType } from "./Types";

export async function getLogs() {
  const result = await fetch("https://docs-demo.quiknode.pro/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "eth_getLogs",
      params: [
        {
          fromBlock: "0x1191704",
          toBlock: "0x1193E13",
          address: "0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a",
          topics: [
            "0xe5944a34d67c652e0ebf2304b48432aae0b55e40f79ba8a21a4d7054c169ffac"
          ]
        }
      ],
      id: 1,
      jsonrpc: "2.0"
    })
  });

  return result.json();
}

export async function getMessages(
  setMessages: (messages: MessageType[]) => void
) {
  const { result: messages } = await getLogs();
  if (messages) {
    const reverseMessages = [];
    for (let messageIdx = messages.length - 1; messageIdx >= 0; messageIdx--) {
      const message = messages[messageIdx];

      // The topics field in the response to the above request corresponds with
      // the following tuple: (SentMessageIdentifier, nonce, messageHash) and
      // data corresponds to messageBytes.
      const refinedMessage = {
        nonce: parseInt(message.topics[1], 16),
        messageHash: message.topics[2],
        messageBytes: message.data,
        transactionHash: message.transactionHash
      };
      reverseMessages.push(refinedMessage);
    }
    setMessages(reverseMessages);
  }
}
