import {
  Address,
  CosignatureSignedTransaction,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionStatus,
} from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { connectNode } from '@/utils/connectNode';
import { nodeList } from '@/consts/nodeList';

//SSS用設定
interface SSSWindow extends Window {
  SSS: any;
}
declare const window: SSSWindow;

export const cosignedEscrowWithSSS = async (
  clientAddress: string,
  hash: string
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
  const listener = repo.createListener();

  //clientAddressからAccountInfoを導出
  const clinetAccountInfo = await firstValueFrom(
    accountRepo.getAccountInfo(Address.createFromRawAddress(clientAddress))
  );

  const txInfo = await firstValueFrom(txRepo.getTransaction(hash, TransactionGroup.Partial));
  const serializedTx = txInfo.serialize();
  console.log(serializedTx);
  window.SSS.setTransactionByPayload(serializedTx);
  const signedCosignatureTx: CosignatureSignedTransaction = await new Promise((resolve) => {
    resolve(window.SSS.requestSignCosignatureTransaction());
  });
  console.log(signedCosignatureTx);
  await firstValueFrom(txRepo.announceAggregateBondedCosignature(signedCosignatureTx));
  await listener.open();
  const signedCosignatureTransactionStatus: TransactionStatus = await new Promise((resolve) => {
    //承認トランザクションの検知
    listener
      .confirmed(clinetAccountInfo.address, signedCosignatureTx.parentHash)
      .subscribe(async (confirmedTx) => {
        const response = await firstValueFrom(
          tsRepo.getTransactionStatus(signedCosignatureTx.parentHash)
        );
        listener.close();
        resolve(response);
      });
    //トランザクションでエラーが発生した場合の処理
    setTimeout(async function () {
      const response = await firstValueFrom(
        tsRepo.getTransactionStatus(signedCosignatureTx.parentHash)
      );
      if (response.code !== 'Success') {
        listener.close();
        resolve(response);
      }
    }, 1000); //タイマーを1秒に設定
  });

  console.log(signedCosignatureTransactionStatus);

  return signedCosignatureTransactionStatus;
};
