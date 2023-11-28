import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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

import { createURL } from "../utils/general";

function TenFalseBooleans() {
  return new Array(10).fill(false);
}

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
   */
  const [displayPage, setDisplayPage] = useState("current");
  const [fromBlockFilter, setFromBlockFilter] = useState(undefined);
  const [toBlockFilter, setToBlockFilter] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageIsExpanded, setCurrentPageIsExpanded] = useState(
    TenFalseBooleans()
  );

  // Fetches from a paginated API with param `id`.
  const fetchData = async ({ pageParam = 0 }) => {
    const res = await fetch(
      new Request(createURL(`/api/messages?id=${pageParam}`), {
        method: "GET"
      })
    );
    const responseData = await res.json();
    const messages = responseData.data;
    return messages;
  };

  /**
   * An infinite query to fetch messages data.
   * It only runs when the current block number is not null.
   */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages"],
      queryFn: fetchData,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.cursor;
      },
      initialPageParam: 0
    });

  useEffect(() => {
    console.log("data is: ", data);
  }, [data]);

  /**
   * Function to go to the next page. It fetches more messages if not enough
   *  data is available.
   */
  const nextPage = (event) => {
    event.preventDefault();
    if (data.pages.length <= currentPage + 1) {
      // Prevents flickering of the page and transporting viewer to the top
      // of the page.
      fetchNextPage().then(() => {
        setCurrentPage(currentPage + 1);
      });
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Function to go to the previous page.
   */
  const previousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  /**
   * Toggles the expanded state of a message at a specific index.
   *
   * @param {number} index The index of the message
   */
  function updateIsExpandedForIndex(index) {
    const intermediateIsExpanded = [...currentPageIsExpanded];
    intermediateIsExpanded[index] = !intermediateIsExpanded[index];

    setCurrentPageIsExpanded(intermediateIsExpanded);
  }

  // Resets the expanded state of the messages when the page changes.
  useEffect(() => {
    setCurrentPageIsExpanded(TenFalseBooleans());
  }, [currentPage]);

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
                  {data?.pages[currentPage]?.messages.map((item, index) => (
                    <TableRow key={index} className="flex w-full">
                      <TableCell className="w-20">{item.nonce}</TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {item.messageHash}
                      </TableCell>
                      <TableCell className="break-words overflow-wrap w-96">
                        {currentPageIsExpanded[index]
                          ? item.messageBytes
                          : item.messageBytes.substring(0, 25)}
                        <button
                          className="border border-gray-600 ml-2 px-2 py-2 rounded"
                          onClick={() => updateIsExpandedForIndex(index)}
                        >
                          {currentPageIsExpanded[index]
                            ? "Show Less"
                            : "Show More"}
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
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              className="border-gray-300 text-gray-500 hover:text-gray-700"
              variant="outline"
              onClick={(event) => nextPage(event)}
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
