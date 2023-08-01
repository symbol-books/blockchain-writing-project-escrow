import React from 'react';
import { Box, Button, Typography, Card, CardContent, CardActions } from '@mui/material';
import { escrowAggregateTransaction } from '@/types/escrowAggregateTransaction';
import { unixTimeToDateTime } from '@/utils/unixTimeToDateTime';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { useRouter } from 'next/router';
function CardEscrowPartial(props: {
  clientAddress: string;
  escrowData: escrowAggregateTransaction;
}): JSX.Element {
  const { clientAddress, escrowData } = props;
  const router = useRouter();
  return (
    <Card variant='outlined'>
      <CardContent>
        {clientAddress === escrowData.signerAddress ? (
          <Box width={600} display={'flex'} justifyContent={'center'} flexDirection={'row'} mb={3}>
            <ArrowCircleUpIcon />
            <Typography variant='body1' component='div' sx={{ ml: 1 }}>
              要求している取引
            </Typography>
          </Box>
        ) : (
          <Box width={600} display={'flex'} justifyContent={'center'} flexDirection={'row'} mb={3}>
            <ArrowCircleDownIcon />
            <Typography variant='body1' component='div' sx={{ ml: 1 }}>
              要求されている取引
            </Typography>
          </Box>
        )}
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              モザイクID
            </Typography>
          </Box>
          <Typography variant='body2' component='div'>
            {escrowData.mosaicId}
          </Typography>
        </Box>
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              枚数
            </Typography>
          </Box>
          <Typography variant='body2' component='div'>
            {`${escrowData.amount}枚`}
          </Typography>
        </Box>
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              取引価格
            </Typography>
          </Box>
          <Typography variant='body2' component='div'>
            {`${escrowData.price} xym`}
          </Typography>
        </Box>
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              公開メッセージ
            </Typography>
          </Box>
          <Box width={500}>
            <Typography variant='body2' component='div'>
              {escrowData.message}
            </Typography>
          </Box>
        </Box>
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              取引期限
            </Typography>
          </Box>
          <Typography variant='body2' component='div'>
            {`${unixTimeToDateTime(escrowData.expirationTime)}`}
          </Typography>
        </Box>
        <Box display={'flex'} alignItems={'center'} margin={0.5}>
          <Box width={100}>
            <Typography variant='caption' component='div'>
              hash値
            </Typography>
          </Box>
          <Typography
            variant='caption'
            component='div'
            sx={{
              color: 'blue',
              '&:hover': {
                cursor: 'pointer',
              },
            }}
            onClick={() => {
              window.open(`https://testnet.symbol.fyi/transactions/${escrowData.hash}`, '_blank');
            }}
          >
            {`${escrowData.hash}`}
          </Typography>
        </Box>
      </CardContent>
      {clientAddress === escrowData.signerAddress ? (
        <></>
      ) : (
        <CardActions>
          <Box width={600} display={'flex'} justifyContent={'center'} mb={3}>
            <Button
              variant='contained'
              size='small'
              onClick={() =>
                router.push({
                  pathname: `/detail`,
                  query: { hash: escrowData.hash },
                })
              }
            >
              取引内容確認
            </Button>
          </Box>
        </CardActions>
      )}
    </Card>
  );
}
export default CardEscrowPartial;
