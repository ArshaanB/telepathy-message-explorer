import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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

const BLOCK_RANGE = 10000;
const PAGE_SIZE = 10;

/**
 * This component displays a table of messages. It allows users to browse and
 * filter messages by block numbers.
 * It uses the react-query library to fetch data in an "infinite" manner.
 */
export default function Component() {
  /**
   * The state variables for the component:
   * - displayPage: The current page being displayed ("current" or "filtered").
   * - fromBlockFilter: The starting block number for the filter.
   * - toBlockFilter: The ending block number for the filter.
   * - buffer: The buffer that holds the messages data.
   * - pageIndex: The current page index.
   * - currentBlock: The current block number.
   */
  const [displayPage, setDisplayPage] = useState("current");
  const [fromBlockFilter, setFromBlockFilter] = useState(undefined);
  const [toBlockFilter, setToBlockFilter] = useState(undefined);
  const [buffer, setBuffer] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);

  /**
   * Fetch the current block number when the component mounts.
   */
  useEffect(() => {
    const fetchCurrentBlock = async () => {
      try {
        const currentBlock = await getCurrentBlock();
        setCurrentBlock(currentBlock);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCurrentBlock();
  }, []);

  /**
   * Callback to fetch messages data. It calculates the block range based on the
   * current block number and the page parameter.
   *
   * @returns {Promise<Array>} The fetched messages data.
   */
  const fetchMessages = useCallback(
    async ({ pageParam = 0 }) => {
      const fromBlock = currentBlock - (pageParam + 1) * BLOCK_RANGE;
      const toBlock = currentBlock - pageParam * BLOCK_RANGE;
      const logs = await getLogs(fromBlock, toBlock);
      return logs.result;
    },
    [currentBlock]
  );

  /**
   * An infinite query to fetch messages data.
   * It only runs when the current block number is not null.
   */
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

  /**
   * Formats and adds the new data to the buffer when the data changes.
   */
  useEffect(() => {
    if (data) {
      const newData = data.pages[data.pages.length - 1];

      if (newData) {
        const formattedMessages = formatMessages(newData);
        setBuffer((oldBuffer) => [...oldBuffer, ...formattedMessages]);
      }
    }
  }, [data]);

  /**
   * Function to go to the next page. It fetches more messages data until there
   * are enough messages for the next page.
   */
  const nextPage = () => {
    const fetchUntilEnoughMessages = async (currentBuffer) => {
      if (currentBuffer.length < (pageIndex + 2) * PAGE_SIZE) {
        const newBuffer = await fetchNextPage();
        const totalLengthOfNewBuffer = newBuffer.data.pages.reduce(
          (sum, page) => {
            return sum + (Array.isArray(page) ? page.length : 0);
          },
          0
        );
        await fetchUntilEnoughMessages(totalLengthOfNewBuffer);
      }
    };

    fetchUntilEnoughMessages(buffer).then(() => {
      setPageIndex((oldIndex) => oldIndex + 1);
    });
  };

  /**
   * Function to go to the previous page.
   */
  const previousPage = () => {
    setPageIndex((oldIndex) => Math.max(oldIndex - 1, 0));
  };

  /**
   * The current page data.
   */
  const currentPage = buffer?.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE
  );

  /**
   * The filtered page data.
   */
  const filteredPage = buffer?.filter(
    (item) =>
      item.blockNumber >= fromBlockFilter && item.blockNumber <= toBlockFilter
  );

  /**
   * Toggles the expanded state of a message at a specific index.
   *
   * @param {number} index The index of the message
   */
  function updateIsExpandedForIndex(index) {
    const paginatedIndex = pageIndex * PAGE_SIZE + index;
    const isExpandedIntermediate = [...buffer];
    isExpandedIntermediate[paginatedIndex].isExpanded =
      !isExpandedIntermediate[paginatedIndex].isExpanded;
    setBuffer(isExpandedIntermediate);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-500">
          Browse and filter messages by block numbers.
        </p>
      </div>
      <div className="mb-4">
        <form
          className="flex flex-wrap gap-4 items-stretch"
          onSubmit={(e) => {
            e.preventDefault();
            setDisplayPage("filtered");
          }}
        >
          <Label className="flex-grow">
            <span>From Block</span>
            <Input
              className="mt-1"
              placeholder="Enter block number"
              type="number"
              value={fromBlockFilter}
              onChange={(e) => setFromBlockFilter(e.target.value)}
            />
          </Label>
          <Label className="flex-grow">
            <span>To Block</span>
            <Input
              className="mt-1"
              placeholder="Enter block number"
              type="number"
              value={toBlockFilter}
              onChange={(e) => setToBlockFilter(e.target.value)}
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
                  {(displayPage === "current"
                    ? currentPage
                    : filteredPage
                  )?.map((item, index) => (
                    <TableRow key={index} className="flex w-full">
                      <TableCell className="w-20">{item.nonce}</TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {item.messageHash}
                      </TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {item.isExpanded
                          ? item.messageBytes
                          : item.messageBytes.substring(0, 25)}
                        <button
                          className="border border-gray-600 ml-2 px-2 py-2 rounded"
                          onClick={() => updateIsExpandedForIndex(index)}
                        >
                          {item.isExpanded ? "Show Less" : "Show More"}
                        </button>
                      </TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        <Link
                          href={`https://etherscan.io/tx/${item.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.transactionHash}
                        </Link>
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
        {displayPage === "current" ? (
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
        ) : null}
      </div>
    </div>
  );
}
