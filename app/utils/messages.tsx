import { Core } from "@quicknode/sdk";

import { Message } from "./Types";

const QUICKNODE_API_URL =
  process.env.NEXT_PUBLIC_QUICKNODE_API_URL ||
  "https://docs-demo.quiknode.pro/";
const BLOCK_RANGE = 10000;

/**
 * Fetches logs from the Succinct contract on the Ethereum blockchain using the
 * QuickNode API.
 *
 * @param {number} fromBlock - The starting block number for the logs.
 * @param {number} toBlock - The ending block number for the logs.
 *
 * @returns {Promise} - A promise that resolves to the logs from the Ethereum blockchain.
 *
 * @throws Will throw an error if the fetch operation fails.
 */
export async function getLogs(fromBlock: number, toBlock: number) {
  try {
    // Convert block numbers to hexadecimal for the API request
    const fromBlockHex = `0x${fromBlock.toString(16)}`;
    const toBlockHex = `0x${toBlock.toString(16)}`;

    const result = await fetch(QUICKNODE_API_URL, {
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
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

/**
 * Formats the messages received from the Ethereum logs.
 *
 * @param {Array} messages - The array of messages to be formatted.
 *
 * @returns {Array} - An array of formatted messages, or the original messages if they are falsy.
 */
export function formatMessages(messages) {
  if (messages) {
    const reverseMessages: Message[] = [];
    for (let messageIdx = messages.length - 1; messageIdx >= 0; messageIdx--) {
      const message = messages[messageIdx];

      // Create a new message object with the desired properties:
      // The topics field in the response to the above request corresponds with
      // the following tuple: (SentMessageIdentifier, nonce, messageHash) and
      // data corresponds to messageBytes.
      const refinedMessage: Message = {
        nonce: parseInt(message.topics[1], 16),
        messageHash: message.topics[2],
        messageBytes: message.data,
        transactionHash: message.transactionHash,
        isExpanded: false,
        blockNumber: parseInt(message.blockNumber, 16)
      };
      reverseMessages.push(refinedMessage);
    }
    return reverseMessages;
  }
  return messages;
}

/**
 * Fetches the current block number from the Ethereum blockchain using the QuickNode API.
 *
 * @returns {Promise} - A promise that resolves to the current block number.
 */
export async function getCurrentBlock() {
  const core = new Core({
    endpointUrl: "https://docs-demo.quiknode.pro/"
  });
  const currentBlock = Number(await core.client.getBlockNumber());
  return currentBlock;
}

/**
 * Callback to fetch messages data. It calculates the block range based on the
 * current block number and the page parameter.
 *
 * @returns {Promise<Array>} The fetched messages data.
 */
export async function fetchMessagesOld({ pageParam = 0 }) {
  const currentBlock = await getCurrentBlock();

  const fromBlock = currentBlock - (pageParam + 1) * BLOCK_RANGE;
  const toBlock = currentBlock - pageParam * BLOCK_RANGE;
  const logs = await getLogs(fromBlock, toBlock);
  return logs.result;
}

/**
 * Callback to fetch messages data. It calculates the block range based on the
 * current block number and the page parameter.
 *
 * @returns {Promise<Array>} The fetched messages data.
 */
export async function fetchMessages(mostRecentBlock: number) {
  try {
    const fromBlock = mostRecentBlock - BLOCK_RANGE;
    const toBlock = mostRecentBlock - 1;
    const logs = await getLogs(fromBlock, toBlock);
    return logs.result;
  } catch (error) {
    console.error("Error in fetchMessages:", error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMessagesBatch(
  entriesSoFar: number,
  lastBlock: number,
  depth: number
) {
  await sleep(1000);
  const messages = await fetchMessages(lastBlock);
  if (messages == undefined) {
    return [];
  } else if (depth >= 10) {
    return [];
  } else if (entriesSoFar + messages.length >= 10) {
    return messages;
  } else {
    const moreMessages = await fetchMessagesBatch(
      entriesSoFar + messages.length,
      lastBlock - BLOCK_RANGE,
      depth + 1
    );
    return [...messages, ...moreMessages];
  }
}
