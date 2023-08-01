import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import AlertsSnackbar from '@/components/AlertsSnackbar';
import { Box, Typography, Backdrop, CircularProgress, Button, Stack, Divider } from '@mui/material';
import { PublicAccount, TransactionGroup, TransactionStatus } from 'symbol-sdk';
import useSssInit from '@/hooks/useSssInit';
import { networkType } from '@/consts/blockchainProperty';
import { useRouter } from 'next/router';
import { searchEscrow } from '@/utils/searchEscrow';
import { escrowAggregateTransaction } from '@/types/escrowAggregateTransaction';
import { cosignedEscrowWithSSS } from '@/utils/cosignedEscrowWithSSS';

function Detail(): JSX.Element {
  //共通設定
  const [progress, setProgress] = useState<boolean>(true); //ローディングの設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const router = useRouter();

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();
  const [clientAddress, setClientAddress] = useState<string>('');
  const [escrowData, setescrowData] = useState<escrowAggregateTransaction>({
    recipientAddress: '',
    signerAddress: '',
    blockCreateTime: 0,
    expirationTime: 0,
    mosaicId: '',
    amount: 0,
    price: 0,
    message: '',
    hash: '',
  });
  const escrowHash = router.query.hash as string;

  useEffect(() => {
    if (sssState === 'ACTIVE') {
      const clientPublicAccount = PublicAccount.createFromPublicKey(clientPublicKey, networkType);
      setClientAddress(clientPublicAccount.address.plain());
    } else if (sssState === 'INACTIVE' || sssState === 'NONE') {
      router.push('/sss');
    }
  }, [clientPublicKey, sssState, router]);

  useEffect(() => {
    if (sssState === 'ACTIVE' && clientAddress !== '') {
      initalescrowDataList();
    }
  }, [clientAddress, sssState]);

  const initalescrowDataList = async () => {
    const result = await searchEscrow(clientAddress, TransactionGroup.Partial);
    if (result === undefined) return;
    result.forEach((escrow) => {
      if (escrowHash === escrow.hash) {
        setescrowData(escrow);
        setProgress(false);
      }
    });
  };

  //ページ個別設定
  const handleAgreeClick = async () => {
    try {
      setProgress(true);
      const transactionStatus: TransactionStatus | undefined = await cosignedEscrowWithSSS(
        clientAddress,
        escrowData.hash
      );
      if (transactionStatus === undefined) {
        setSnackbarSeverity('error');
        setSnackbarMessage('NODEの接続に失敗しました');
        setOpenSnackbar(true);
      } else if (transactionStatus.code === 'Success') {
        setSnackbarSeverity('success');
        setSnackbarMessage(`${transactionStatus.group} TXを検知しました`);
        setOpenSnackbar(true);
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage(`TXに失敗しました ${transactionStatus.code}`);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProgress(false);
    }
  };

  return (
    <>
      <Header setOpenLeftDrawer={setOpenLeftDrawer} />
      <LeftDrawer openLeftDrawer={openLeftDrawer} setOpenLeftDrawer={setOpenLeftDrawer} />
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={'bottom'}
        snackbarSeverity={snackbarSeverity}
        snackbarMessage={snackbarMessage}
      />
      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          p={3}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' mt={5} mb={1}>
            取引詳細
          </Typography>
          <Stack spacing={2} sx={{ m: 2, width: 500 }}>
            <Typography>{`以下内容に合意して署名を行いますか？`}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography sx={{ marginRight: 2 }} component='div' variant='caption'>
                  取引内容
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`あなたの ${escrowData.mosaicId} × ${escrowData.amount} と ${escrowData.price}xym を交換して下さい`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography sx={{ marginRight: 2 }} component='div' variant='caption'>
                  依頼アドレス
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowData.signerAddress}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography sx={{ marginRight: 2 }} component='div' variant='caption'>
                  メッセージ
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowData.message}`}
              </Typography>
            </Box>
            <Divider />
            <Typography component='div' variant='caption'>
              {`*1 合意の署名に対して手数料は発生しません。`}
            </Typography>
            <Typography component='div' variant='caption'>
              {`*2 一度署名を行うとキャンセルすることはできません。`}
            </Typography>
          </Stack>
          <Box width={500} display={'flex'} justifyContent={'space-around'} m={5}>
            <Button variant='outlined' size='small' onClick={() => router.push(`/`)}>
              一覧に戻る
            </Button>
            <Button variant='contained' size='small' onClick={() => handleAgreeClick()}>
              署名に進む
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
export default Detail;
