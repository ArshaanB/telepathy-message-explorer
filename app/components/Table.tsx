import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table
} from "@/components/ui/table";

import { getLogs, getCurrentBlock, formatMessages } from "../utils/messages";

export default function Component() {
  const [buffer, setBuffer] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);

  useEffect(() => {
    getCurrentBlock().then((currentBlock) => setCurrentBlock(currentBlock));
  }, []);

  // For a given pageParam (and it's unique 10,000 block range), returns all the
  //  relevant logs within that block range.
  async function fetchMessages({ pageParam = 0 }) {
    const fromBlock = currentBlock - (pageParam + 1) * 10000;
    const toBlock = currentBlock - pageParam * 10000;
    const logs = await getLogs(fromBlock, toBlock);
    return logs.result;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(["messages"], fetchMessages, {
      // pages holds how many calls we have made already, and each page holds
      //  the logs for a 10,000 block range.
      getNextPageParam: (lastPage, pages) => {
        return pages.length;
      },
      // Only run the query when currentBlock is not null.
      enabled: currentBlock !== null
    });

  useEffect(() => {
    if (data) {
      const newData = data.pages[data.pages.length - 1];

      const formattedMessages = formatMessages(newData);
      setBuffer((oldBuffer) => [...oldBuffer, ...formattedMessages]);
    }
  }, [data]);

  const nextPage = () => {
    const fetchUntilEnoughMessages = async () => {
      while (buffer.length < (pageIndex + 1) * 10) {
        await fetchNextPage();
      }
    };

    fetchUntilEnoughMessages().then(() => {
      setPageIndex((oldIndex) => oldIndex + 1);
    });
  };

  const previousPage = () => {
    setPageIndex((oldIndex) => Math.max(oldIndex - 1, 0));
  };

  const currentPage = buffer?.slice(pageIndex * 10, (pageIndex + 1) * 10);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-500">
          Browse and filter messages by block numbers.
        </p>
      </div>
      <div className="mb-4">
        <form className="flex flex-wrap gap-4 items-stretch">
          <Label className="flex-grow">
            <span>From Block</span>
            <Input
              className="mt-1"
              placeholder="Enter block number"
              type="number"
            />
          </Label>
          <Label className="flex-grow">
            <span>To Block</span>
            <Input
              className="mt-1"
              placeholder="Enter block number"
              type="number"
            />
          </Label>

          <div>
            <Button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded h-full"
              type="submit"
            >
              Filter
            </Button>
          </div>
        </form>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="flex w-full">
                    <TableHead className="w-20">Nonce</TableHead>
                    <TableHead className="break-words overflow-wrap w-96">
                      Message Hash
                    </TableHead>
                    <TableHead className="break-words overflow-wrap w-96">
                      Message Bytes
                    </TableHead>
                    <TableHead className="break-words overflow-wrap w-96">
                      Transaction Hash
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPage?.map((item, index) => (
                    <TableRow key={index} className="flex w-full">
                      <TableCell className="w-20">{item.nonce}</TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {item.messageHash}
                      </TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {
                          false //isExpanded[index]
                            ? item.messageBytes
                            : item.messageBytes // item.messageBytes.substring(0, 25)
                        }
                        <button
                          className="border border-gray-600 ml-2 px-2 py-2 rounded"
                          // onClick={() => updateIsExpandedForIndex(index)}
                        >
                          {false //isExpanded[index]
                            ? "Show Less"
                            : "Show More"}
                        </button>
                      </TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {item.transactionHash}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <nav className="flex justify-between text-sm">
          <Button
            className="border-gray-300 text-gray-500 hover:text-gray-700"
            variant="outline"
            onClick={previousPage}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            className="border-gray-300 text-gray-500 hover:text-gray-700"
            variant="outline"
            onClick={nextPage}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Next"
              : "No more results"}
          </Button>
        </nav>
      </div>
    </div>
  );
}

/*
Previous Implementation: 

data was previously passed in from parent:
const [messages, setMessages] = useState<MessageType[]>([]);
useEffect(() => {
  getMessages(setMessages);
}, []);

const [isExpanded, setIsExpanded] = useState([]);

function updateIsExpandedForIndex(index) {
  const isExpandedIntermediate = [...isExpanded];
  isExpandedIntermediate[index] = !isExpandedIntermediate[index];
  setIsExpanded(isExpandedIntermediate);
}

useEffect(() => {
  const isExpandedIntermediate = [];
  for (let indexOfData = 0; indexOfData < data.length; indexOfData++) {
    isExpandedIntermediate.push(false);
  }
  setIsExpanded(isExpandedIntermediate);
}, [data]);
*/
