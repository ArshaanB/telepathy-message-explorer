export type Message = {
  nonce: number; // A counter used to ensure that a particular message cannot be resent over and over.
  messageHash: string; // The hash of the message content.
  messageBytes: string; // The actual content of the message, in bytes.
  transactionHash: string; // The hash of the transaction in which this message was included.
  isExpanded: boolean; // Whether or not the message is expanded in the table.
  blockNumber: number; // The block number in which this message was included.
};
