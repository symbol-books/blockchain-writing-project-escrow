import React from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import HistoryIcon from '@mui/icons-material/History';
import { useRouter } from 'next/router';
import Image from 'next/image';

function LeftDrawer(props: {
  openLeftDrawer: boolean;
  setOpenLeftDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const { openLeftDrawer, setOpenLeftDrawer } = props;
  const router = useRouter();

  return (
    <>
      <Drawer anchor={'left'} open={openLeftDrawer} onClose={() => setOpenLeftDrawer(false)}>
        <Box sx={{ width: '65vw', height: '100vh' }}>
          <List>
            <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
              <Image
                src='/logo.jpeg'
                width={2048}
                height={472}
                style={{
                  width: 'auto',
                  height: '50px',
                }}
                alt='logo'
              />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary={'ホーム'} />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/escrow');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <ArrowCircleUpIcon />
                </ListItemIcon>
                <ListItemText primary={'取引要求'} />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  router.push('/history');
                  setOpenLeftDrawer(false);
                }}
              >
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary={'取引履歴'} />
              </ListItemButton>
            </ListItem>
          </List>{' '}
        </Box>
      </Drawer>
    </>
  );
}
export default LeftDrawer;
