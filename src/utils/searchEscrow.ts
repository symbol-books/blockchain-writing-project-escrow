import {
  Address,
  AggregateTransaction,
  Order,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionType,
  TransferTransaction,
} from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { connectNode } from '@/utils/connectNode';
import { nodeList } from '@/consts/nodeList';
import { escrowAggregateTransaction } from '@/types/escrowAggregateTransaction';
import { epochAdjustment, servieName } from '@/consts/blockchainProperty';

export const searchEscrow = async (
  clientAddress: string,
  transactionGroup: TransactionGroup.Partial | TransactionGroup.Confirmed
): Promise<escrowAggregateTransaction[] | undefined> => {
  const NODE = await connectNode(nodeList);
  if (NODE === '') return undefined;
  const repo = new RepositoryFactoryHttp(NODE, {
    websocketUrl: NODE.replace('http', 'ws') + '/ws',
    websocketInjected: WebSocket,
  });
  const txRepo = repo.createTransactionRepository();
  const accountRepo = repo.createAccountRepository();
  const blockRepo = repo.createBlockRepository();

  //clientAddressからAccountInfoを導出
  const clinetAccountInfo = await firstValueFrom(
    accountRepo.getAccountInfo(Address.createFromRawAddress(clientAddress))
  );
  const resultSearch = await firstValueFrom(
    txRepo.search({
      type: [TransactionType.AGGREGATE_BONDED],
      group: transactionGroup,
      address: clinetAccountInfo.address,
      order: Order.Desc,
      pageSize: 100,
    })
  );

  console.log(resultSearch.data);
  const resultData: escrowAggregateTransaction[] = [];
  for (let i = 0; i < resultSearch.data.length; i++) {
    try {
      let blockCreateTime = 0;
      if ((resultSearch.data[i].transactionInfo?.height!.compact() as number) > 0) {
        const blockInfo = await firstValueFrom(
          blockRepo.getBlockByHeight(resultSearch.data[i].transactionInfo?.height!)
        );
        blockCreateTime = blockInfo.timestamp.compact() + epochAdjustment * 1000; //unixtime
      }

      const txInfo = (await firstValueFrom(
        txRepo.getTransaction(resultSearch.data[i].transactionInfo?.hash!, transactionGroup)
      )) as AggregateTransaction;

      const tx1 = txInfo?.innerTransactions[0] as TransferTransaction; //ユーザがターゲットに交換用のXYMを送るトランザクション（メッセージにアナウンス時のblockHight）
      const tx2 = txInfo?.innerTransactions[1] as TransferTransaction; //ターゲットがユーザにモザイクを送るトランザクション
      const tx3 = txInfo?.innerTransactions[2] as TransferTransaction; //ユーザが管理者に手数料のXYMを送るトランザクション（メッセージにサービスを特定するキーワード）

      if (tx3.message.payload === servieName) {
        //不要なトランザクションを除外するため
        const escrowAggregateTransaction: escrowAggregateTransaction = {
          signerAddress: tx1.signer?.address.plain()!,
          recipientAddress: tx1.recipientAddress.plain()!,
          blockCreateTime: blockCreateTime,
          expirationTime: Number(tx1.message.payload),
          mosaicId: tx2.mosaics[0].id.toHex(),
          amount: tx2.mosaics[0].amount.compact(),
          price: tx1.mosaics[0].amount.compact() / 1000000,
          message: tx2.message.payload,
          hash: txInfo.transactionInfo?.hash!,
        };
        resultData.push(escrowAggregateTransaction);
        console.log(escrowAggregateTransaction);
      }
    } catch (e) {}
  }
  return resultData;
};
