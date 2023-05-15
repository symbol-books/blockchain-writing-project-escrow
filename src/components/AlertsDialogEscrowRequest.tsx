import React from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { EscrowRequestInputs } from '@/types/escrowRequestInputs';

function AlertsDialogEscrowRequest(props: {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleAgreeClick: () => void;
  escrowRequestInputsData:EscrowRequestInputs;
}): JSX.Element {
  const { openDialog, setOpenDialog, handleAgreeClick, escrowRequestInputsData } = props;

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        width={600}
      >
        <DialogTitle>{`取引内容の確認`}</DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            sx={{ m: 2}}
          >
            <DialogContentText>{`以下内容で取引を開始しますか？`}</DialogContentText>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  取引内容
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowRequestInputsData.price} xym ⇆ ${escrowRequestInputsData.mosaicId} × ${escrowRequestInputsData.amount}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  宛先アドレス
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowRequestInputsData.targetAddress}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  メッセージ
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowRequestInputsData.message}`}
              </Typography>
            </Box>
            <Divider/>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  運営手数料
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowRequestInputsData.amount*0.1}xym (取引価格の10%)`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  ネットワーク手数料
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`10xym(デポジット手数料*1) + α(トランザクション手数料*2)`}
              </Typography>
            </Box>
            <Divider/>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box width={100}>
                <Typography
                  sx={{ marginRight: 2 }}
                  component='div'
                  variant='caption'
                >
                  合計
                </Typography>
              </Box>
              <Typography component='div' variant='caption'>
                {`${escrowRequestInputsData.amount*(1+0.1)+10} + α xym`}
              </Typography>
            </Box>
            <Typography component='div' variant='caption'>
                {`*1 ブロックチェーン上でを取引を行うための手数料です。取引成功時に返金されます。ただし48時間以内に取引が完了しなかった場合は返金されません。`}
              </Typography>
              <Typography component='div' variant='caption'>
                {`*2 ブロックチェーン上にデータを書き込むための手数料です。実際に署名する際に右上に表示されます。`}
              </Typography>
              <Typography component='div' variant='caption'>
                {`*3 一度署名を行うとキャンセルすることはできません。`}
              </Typography>
              <Typography component='div' variant='caption'>
                {`*4 署名は続けて二回行います。一回目は取引に対する署名、二回目は取引をブロックチェーン上でロック(HASH_LOCK)しておくための署名です。`}
              </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color='primary' variant='outlined' onClick={() => setOpenDialog(false)}>
            キャンセル
          </Button>
          <Button color='primary' variant='contained' autoFocus onClick={() => handleAgreeClick()}>
            署名に進む
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
export default AlertsDialogEscrowRequest;
