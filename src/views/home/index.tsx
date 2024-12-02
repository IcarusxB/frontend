import { FC } from 'react';
import DesignList from '../../components/MadmaStore/DesignList';
import { OrderList } from '../../components/MadmaStore/OrderList';  
import { useWallet } from '@solana/wallet-adapter-react';

export const Home: FC = () => {
    const { publicKey } = useWallet();

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white text-center mb-8">
                Madma Store
            </h1>

            <div className="mt-8 p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6">
                    Available Designs
                </h2>
                <DesignList ownerView={false} />
            </div>

            {publicKey && (
                <div className="mt-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
                    <OrderList ownerView={false} />
                </div>
            )}
        </div>
    );
};

export default Home;