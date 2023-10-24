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

export default function Component() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="py-5">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-500">
          Browse and filter messages by block numbers.
        </p>
      </div>
      <div className="mb-4">
        <form className="flex flex-wrap gap-4">
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
          <Button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Filter
          </Button>
        </form>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nonce</TableHead>
                    <TableHead>Message Hash</TableHead>
                    <TableHead>Shortened Message Bytes</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>123</TableCell>
                    <TableCell>0x8db...</TableCell>
                    <TableCell>0x2e3...</TableCell>
                    <TableCell>0x1f4...</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>124</TableCell>
                    <TableCell>0x3ed...</TableCell>
                    <TableCell>0x4fb...</TableCell>
                    <TableCell>0x5a6...</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>125</TableCell>
                    <TableCell>0x7ac...</TableCell>
                    <TableCell>0x6bd...</TableCell>
                    <TableCell>0x9ce...</TableCell>
                  </TableRow>
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
          >
            Previous
          </Button>
          <Button
            className="border-gray-300 text-gray-500 hover:text-gray-700"
            variant="outline"
          >
            Next
          </Button>
        </nav>
      </div>
    </div>
  );
}
