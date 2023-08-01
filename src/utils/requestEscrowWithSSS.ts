import {
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  PlainMessage,
  RepositoryFactoryHttp,
  SignedTransaction,
  TransactionStatus,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { connectNode } from '@/utils/connectNode';
import { nodeList } from '@/consts/nodeList';
import {
  currencyMosaicID,
  epochAdjustment,
  hashLockTxDuration,
  networkType,
  servieFee,
  servieName,
} from '@/consts/blockchainProperty';
import axios from 'axios';

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
}
declare const window: SSSWindow;

export const requestEscrowWithSSS = async (
  clientAddress: string,
  targetAddress: string,
  mosaicId: string,
  amount: number,
  price: number,
  message: string
): Promise<TransactionStatus | undefined> => {
  const NODE = await connectNode(nodeList);
  if (NODE === '') return undefined;
  const repo = new RepositoryFactoryHttp(NODE, {
    websocketUrl: NODE.replace('http', 'ws') + '/ws',
    websocketInjected: WebSocket,
  });
  const txRepo = repo.createTransactionRepository();
  const tsRepo = repo.createTransactionStatusRepository();
  const accountRepo = repo.createAccountRepository();
  const chainRepo = repo.createChainRepository();
  const chainInfo = await firstValueFrom(chainRepo.getChainInfo());
  const blockRepo = repo.createBlockRepository();
  const blockInfo = await firstValueFrom(blockRepo.getBlockByHeight(chainInfo.height));
  const currentTime = blockInfo.timestamp.compact() + epochAdjustment * 1000; //unixtime
  const expirationTime = hashLockTxDuration * 30 * 1000 + currentTime; //unixtime

  const listener = repo.createListener();

  //targetAddressからAccountInfoを導出
  const targetAccountInfo = await firstValueFrom(
    accountRepo.getAccountInfo(Address.createFromRawAddress(targetAddress))
  );
  //clientAddressからAccountInfoを導出
  const clinetAccountInfo = await firstValueFrom(
    accountRepo.getAccountInfo(Address.createFromRawAddress(clientAddress))
  );

  const res = await axios.get('/api/fetch-address');
  const adminAddress: string = res.data;

  const tx1 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    targetAccountInfo.address,
    [
      new Mosaic(
        new MosaicId(currencyMosaicID), //XYM
        UInt64.fromUint(price * 1000000)
      ),
    ],
    PlainMessage.create(expirationTime.toString()), //取引の有効期限を記録しておく
    networkType
  );

  const tx2 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    clinetAccountInfo.address,
    [new Mosaic(new MosaicId(mosaicId), UInt64.fromUint(amount))],
    PlainMessage.create(message),
    networkType
  );

  const tx3 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(adminAddress),
    [
      new Mosaic(
        new MosaicId(currencyMosaicID), //XYM
        UInt64.fromUint(price * servieFee * 1000000)
      ),
    ],
    PlainMessage.create(servieName),
    networkType
  );

  const aggregateArray = [
    tx1.toAggregate(clinetAccountInfo.publicAccount),
    tx2.toAggregate(targetAccountInfo.publicAccount),
    tx3.toAggregate(clinetAccountInfo.publicAccount),
  ];

  const aggregateTx = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  window.SSS.setTransaction(aggregateTx);
  const signedAggregateTx: SignedTransaction = await new Promise((resolve) => {
    resolve(window.SSS.requestSign());
  });

  const hashLockTx = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(
      new MosaicId(currencyMosaicID), //XYM
      UInt64.fromUint(10 * 1000000)
    ),
    UInt64.fromUint(hashLockTxDuration), // ロック有効期限 テストネットは上限2時間　🌟TODO 要調査
    signedAggregateTx,
    networkType
  ).setMaxFee(100);

  const signedHashLockTx: SignedTransaction = await new Promise((resolve) => {
    setTimeout(async function () {
      window.SSS.setTransaction(hashLockTx);
      resolve(window.SSS.requestSign());
    }, 1000); //SSSの仕様で連続で署名する場合は時間をあける必要があるため
  });
  console.log(signedHashLockTx.hash);
  console.log(signedAggregateTx.hash);

  await firstValueFrom(txRepo.announce(signedHashLockTx));
  await listener.open();
  const hashLockTransactionStatus: TransactionStatus = await new Promise((resolve) => {
    //承認トランザクションの検知
    listener
      .confirmed(clinetAccountInfo.address, signedHashLockTx.hash)
      .subscribe(async (confirmedTx) => {
        const response = await firstValueFrom(tsRepo.getTransactionStatus(signedHashLockTx.hash));
        listener.close();
        resolve(response);
      });
    //トランザクションでエラーが発生した場合の処理
    setTimeout(async function () {
      const response = await firstValueFrom(tsRepo.getTransactionStatus(signedHashLockTx.hash));
      if (response.code !== 'Success') {
        listener.close();
        resolve(response);
      }
    }, 1000); //タイマーを1秒に設定
  });

  console.log(hashLockTransactionStatus);

  //ハッシュロックトランザクションが成功した場合、すぐにAggregateBondedトランザクションを送信すると検知できないノードが発生する場合があるため、5秒待機する
  console.log('start wait 5sec spread node hashLockTransactionStatus');
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('end wait 5sec spread node hashLockTransactionStatus');
      resolve();
    }, 5000);
  });

  await firstValueFrom(txRepo.announceAggregateBonded(signedAggregateTx));
  await listener.open();
  const aggregateBondedTransactionStatus: TransactionStatus = await new Promise((resolve) => {
    //承認トランザクションの検知
    listener
      .aggregateBondedAdded(clinetAccountInfo.address, signedAggregateTx.hash)
      .subscribe(async (partialTx) => {
        const response = await firstValueFrom(tsRepo.getTransactionStatus(signedAggregateTx.hash));
        listener.close();
        resolve(response);
      });
    //トランザクションでエラーが発生した場合の処理
    setTimeout(async function () {
      const response = await firstValueFrom(tsRepo.getTransactionStatus(signedAggregateTx.hash));
      if (response.code !== 'Success') {
        listener.close();
        resolve(response);
      }
    }, 1000); //タイマーを1秒に設定
  });

  console.log(aggregateBondedTransactionStatus);

  return aggregateBondedTransactionStatus;
};
