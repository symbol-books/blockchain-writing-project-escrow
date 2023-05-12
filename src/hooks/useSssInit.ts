import { useState, useEffect } from 'react';

//SSS用設定
interface SSSWindow extends Window {
  SSS: any
  isAllowedSSS: () => boolean
}
declare const window: SSSWindow

const useSssInit = () => {
  const [sssState, setSssState] = useState<'ACTIVE' | 'INACTIVE' | 'NONE' | 'LOADING'>('LOADING');
  const [clientPublicKey, setClientPublicKey] = useState<string>('');
  
  useEffect(() => {
    setTimeout(() => {
      try {
        if (window.isAllowedSSS()) {
          setSssState('ACTIVE');
          const publicKey = window.SSS.activePublicKey;
          setClientPublicKey(publicKey);
        } else {
          setSssState('INACTIVE');
        }
      } catch (e) {
        console.error(e);
        setSssState('NONE');
      }
    }, 200); // SSSのプログラムがwindowに挿入されるよりも後に実行するために遅らせる
  }, []);
  
  return { clientPublicKey,sssState };
};

export default useSssInit;
