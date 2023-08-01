export type escrowAggregateTransaction = {
  recipientAddress: string;
  signerAddress: string;
  blockCreateTime: number;
  expirationTime: number;
  mosaicId: string;
  amount: number;
  price: number;
  message: string;
  hash: string;
};
