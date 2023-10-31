import { Core } from "@quicknode/sdk";

import { MessageType } from "./Types";

export async function getLogs(fromBlock: number, toBlock: number) {
  const fromBlockHex = `0x${fromBlock.toString(16)}`;
  const toBlockHex = `0x${toBlock.toString(16)}`;

  const result = await fetch("https://docs-demo.quiknode.pro/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "eth_getLogs",
      params: [
        {
          fromBlock: fromBlockHex,
          toBlock: toBlockHex,
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

export function formatMessages(messages) {
  if (messages) {
    const reverseMessages: MessageType[] = [];
    for (let messageIdx = messages.length - 1; messageIdx >= 0; messageIdx--) {
      const message = messages[messageIdx];

      // The topics field in the response to the above request corresponds with
      // the following tuple: (SentMessageIdentifier, nonce, messageHash) and
      // data corresponds to messageBytes.
      const refinedMessage: MessageType = {
        nonce: parseInt(message.topics[1], 16),
        messageHash: message.topics[2],
        messageBytes: message.data,
        transactionHash: message.transactionHash
      };
      reverseMessages.push(refinedMessage);
    }
    return reverseMessages;
  }
  return messages;
}

export async function getCurrentBlock() {
  const core = new Core({
    endpointUrl: "https://docs-demo.quiknode.pro/"
  });
  const currentBlock = Number(await core.client.getBlockNumber());
  return currentBlock;
}
