import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import AlertsSnackbar from '@/components/AlertsSnackbar';
import AlertsDialog from '@/components/AlertsDialog';
import Divider from '@mui/material/Divider';
import {
  Box,
  Typography,
  Button,
  Backdrop,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { PublicAccount, TransactionStatus } from 'symbol-sdk';
import useSssInit from '@/hooks/useSssInit';
import { networkType } from '@/consts/blockchainProperty';
import { sendMessageWithSSS } from '@/utils/sendMessageWithSSS';
import { useRouter } from 'next/router';

function Home(): JSX.Element {
  //共通設定
  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
  const [dialogTitle, setDialogTitle] = useState<string>(''); //AlertsDialogの設定(共通)
  const [dialogMessage, setDialogMessage] = useState<string>(''); //AlertsDialogの設定(共通)
  const router = useRouter();

  //SSS共通設定
  const { clientPublicKey, sssState } = useSssInit();
  const [clientAddress, setClientAddress] = useState<string>('');
  useEffect(() => {
    if (sssState === 'ACTIVE') {
      const clientPublicAccount = PublicAccount.createFromPublicKey(clientPublicKey, networkType);
      setClientAddress(clientPublicAccount.address.plain());
    } else if (sssState === 'INACTIVE' || sssState === 'NONE') {
      router.push('/sss');
    }
  }, [clientPublicKey, sssState, router]);

  //ページ個別設定
  const [hash, setHash] = useState<string>('');
  const [openDialogSendMessage, setOpenDialogSendMessage] = useState<boolean>(false); //AlertsDialogの設定(個別)
  const handleAgreeClickSendMessage = async () => {
    try {
      setProgress(true);
      const transactionStatus: TransactionStatus | undefined = await sendMessageWithSSS(
        clientAddress
      );
      if (transactionStatus === undefined) {
        setSnackbarSeverity('error');
        setSnackbarMessage('NODEの接続に失敗しました');
        setOpenSnackbar(true);
      } else if (transactionStatus.code === 'Success') {
        setHash(transactionStatus.hash);
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
      <AlertsDialog
        openDialog={openDialogSendMessage}
        setOpenDialog={setOpenDialogSendMessage}
        handleAgreeClick={() => {
          handleAgreeClickSendMessage();
          setOpenDialogSendMessage(false);
        }}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
      />
      {progress ? (
        <Backdrop open={progress}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Box
          sx={{ p: 3 }}
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Typography component='div' variant='h6' sx={{ mt: 5, mb: 1 }}>
            エクスクロー一覧
          </Typography>
          <List sx={{ width: '100%', maxWidth: 700, bgcolor: 'background.paper' }}>
            <ListItem alignItems='flex-start'>
              <ListItemAvatar>
                <Avatar
                  alt='これは要求か承認待ちでアイコンを変えるか'
                  src='/static/images/avatar/1.jpg'
                />
              </ListItemAvatar>
              <ListItemText
                primary='要求中'
                secondary={
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          メッセージ
                        </Typography>
                      </Box>
                      {'めちゃくちゃほしいです。ぜひ交換お願いします'}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          取引期限
                        </Typography>
                      </Box>
                      {'2021/10/10 10:10:10'}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          モザイクID
                        </Typography>
                      </Box>
                      {'69601B95CF27C9C3'}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          枚数
                        </Typography>
                      </Box>
                      {'1枚'}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          取引価格
                        </Typography>
                      </Box>
                      {'400xym'}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box width={100}>
                        <Typography
                          sx={{ marginRight: 2 }}
                          component='div'
                          variant='body2'
                          color='text.primary'
                        >
                          ハッシュ値
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ marginRight: 2 }}
                        component='div'
                        variant='caption'
                        color='text.primary'
                        onClick={() => {
                          window.open(
                            `https://testnet.symbol.fyi/transactions/${'0FCCAED8BC13BFC62465F1501D857E8C3FE99DBBA3FA31A99EE6DDB6F2130E79'}`,
                            '_blank'
                          );
                        }}
                      >
                        {'0FCCAED8BC13BFC62465F1501D857E8C3FE99DBBA3FA31A99EE6DDB6F2130E79'}
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
            <Divider variant='inset' component='li' />
          </List>
          {/* <Button
            color='primary'
            variant='contained'
            onClick={() => {
              setDialogTitle('メッセージ送信');
              setDialogMessage('クライアントから管理者へメッセージを送信しますか？');
              setOpenDialogSendMessage(true);
            }}
          >
            送信
          </Button>
          {hash !== '' ? (
            <Typography
              component='div'
              variant='body1'
              sx={{ mt: 5, mb: 1 }}
              onClick={() => {
                window.open(`https://testnet.symbol.fyi/transactions/${hash}`, '_blank');
              }}
            >
              {`hash値 : ${hash}`}
            </Typography>
          ) : (
            <></>
          )} */}
        </Box>
      )}
    </>
  );
}
export default Home;
