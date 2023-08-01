import React, { useEffect, useState } from 'react';
import LeftDrawer from '@/components/LeftDrawer';
import Header from '@/components/Header';
import AlertsSnackbar from '@/components/AlertsSnackbar';
import {
  Box,
  Typography,
  Button,
  Backdrop,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { PublicAccount, TransactionStatus } from 'symbol-sdk';
import useSssInit from '@/hooks/useSssInit';
import { networkType } from '@/consts/blockchainProperty';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { EscrowRequestInputs } from '@/types/escrowRequestInputs';
import AlertsDialogRequestEscrow from '@/components/AlertsDialogRequestEscrow';
import { requestEscrowWithSSS } from '@/utils/requestEscrowWithSSS';

function EscrowRequest(): JSX.Element {
  //共通設定
  const [progress, setProgress] = useState<boolean>(false); //ローディングの設定
  const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false); //LeftDrawerの設定
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); //AlertsSnackbarの設定
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error'); //AlertsSnackbarの設定
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); //AlertsSnackbarの設定
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
  const [inputData, setInputData] = useState<EscrowRequestInputs>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EscrowRequestInputs>({
    defaultValues: { targetAddress: '', mosaicId: '', amount: 1, price: 1, message: '' },
  });

  const validationRules = {
    targetAddress: {
      required: '宛先アドレスを入力して下さい',
      pattern: {
        value: /^([A-Z0-9]{39,39})$/,
        message: '正しいアドレスのフォーマットではありません',
      },
    },
    mosaicId: {
      required: 'モザイクIDを入力して下さい',
      pattern: {
        value: /^([A-Z0-9]{16,16})$/,
        message: '正しいモザイクIDのフォーマットではありません',
      },
    },
    amount: {
      required: '数量を入力して下さい',
      validate: {
        nonZero: (value: number) => value > 0 || '数量には0より多い数値を入力して下さい',
      },
    },
    price: {
      required: '取引価格を指定して下さい',
      validate: {
        nonZero: (value: number) => value > 0 || '取引価格は0より多い数値を入力して下さい',
      },
    },
    message: {
      maxLength: {
        value: 300,
        message: '公開メッセージは３００文字以内にして下さい',
      },
    },
  };

  const onSubmit: SubmitHandler<EscrowRequestInputs> = (inputData: EscrowRequestInputs) => {
    setInputData(inputData);
    setOpenDialog(true);
  };

  const [openDialog, setOpenDialog] = useState<boolean>(false); //AlertsDialogの設定(個別)
  const handleAgreeClick = async () => {
    console.log(inputData);
    try {
      setProgress(true);
      const transactionStatus: TransactionStatus | undefined = await requestEscrowWithSSS(
        clientAddress,
        inputData!.targetAddress,
        inputData!.mosaicId,
        inputData!.amount,
        inputData!.price,
        inputData!.message
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
      <AlertsDialogRequestEscrow
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleAgreeClick={() => {
          handleAgreeClick();
          setOpenDialog(false);
        }}
        escrowRequestInputsData={
          inputData
            ? inputData
            : { targetAddress: '', mosaicId: '', amount: 1, price: 1, message: '' }
        }
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
          <Typography component='div' variant='h6' sx={{ mt: 5, mb: 1 }}>
            取引要求
          </Typography>
          <Stack
            component='form'
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            spacing={2}
            sx={{ m: 2, width: '100%', maxWidth: 700 }}
          >
            <Controller
              name='targetAddress'
              control={control}
              rules={validationRules.targetAddress}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='text'
                  label='宛先アドレス'
                  error={errors.targetAddress !== undefined}
                  helperText={errors.targetAddress?.message}
                />
              )}
            />
            <Controller
              name='mosaicId'
              control={control}
              rules={validationRules.mosaicId}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='text'
                  label='交換モザイク'
                  error={errors.mosaicId !== undefined}
                  helperText={errors.mosaicId?.message}
                />
              )}
            />
            <Controller
              name='amount'
              control={control}
              rules={validationRules.amount}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='text'
                  label='数量'
                  error={errors.amount !== undefined}
                  helperText={errors.amount?.message}
                />
              )}
            />
            <Controller
              name='price'
              control={control}
              rules={validationRules.price}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='text'
                  label='取引価格'
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>xym</InputAdornment>,
                  }}
                  error={errors.price !== undefined}
                  helperText={errors.price?.message}
                />
              )}
            />
            <Controller
              name='message'
              control={control}
              rules={validationRules.message}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  type='text'
                  label='公開メッセージ'
                  error={errors.message !== undefined}
                  helperText={errors.message?.message}
                />
              )}
            />
            <Button variant='contained' type='submit'>
              内容を確認する
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );
}
export default EscrowRequest;
