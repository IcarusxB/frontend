import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';
import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { StoreInfo } from '../components/MadmaStore/StoreInfo';
import Notifications from '../components/Notification'
import { ProgramProvider } from '../contexts/ProgramProvider';
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
          <Head>
            <title>Madma Store</title>
          </Head>

          <ContextProvider>
            <ProgramProvider>
              <div className="flex flex-col h-screen">
                <Notifications />
                <AppBar/>
                <ContentContainer>
                  <Component {...pageProps} />
                </ContentContainer>
              </div>
            </ProgramProvider>
          </ContextProvider>
        </>
    );
};

export default App;