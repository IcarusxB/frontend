import { FC, useEffect, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

// Add this interface for store account data
interface StoreAccount {
    authority: PublicKey;
    designsCount: BN;
    earnings: BN;
    bump: number;
}

export const StoreInfo: FC = () => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [storeData, setStoreData] = useState<StoreAccount | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStoreInfo = async () => {
            if (!program) return;

            try {
                const [storePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("store")],
                    program.programId
                );
                
                // Type cast the store data
                const store = await program.account.store.fetch(storePda) as StoreAccount;
                setStoreData(store);
            } catch (error) {
                console.error("Error fetching store info:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreInfo();
    }, [program]);

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <span className="loading loading-spinner loading-md"></span>
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="text-center p-4">
                <p>Store not initialized</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 bg-blue-200 p-2 rounded">
                Store Information
            </h2>
            
            <div className="space-y-2">
                <p className="bg-blue-200 p-2 rounded">
                    <span className="font-medium">Owner: </span>
                    <span className="font-mono">{storeData.authority.toString()}</span>
                </p>
                
                <p className="bg-blue-200 p-2 rounded">
                    <span className="font-medium">Total Designs: </span>
                    {storeData.designsCount.toString()}
                </p>
                
                <p className="bg-blue-200 p-2 rounded">
                    <span className="font-medium">Total Earnings: </span>
                    {(storeData.earnings.toNumber() / 1e9).toFixed(4)} SOL
                </p>
                
                {publicKey && storeData.authority.equals(publicKey) && (
                    <p className="bg-green-200 text-green-800 font-medium p-2 rounded">
                        You are the store owner
                    </p>
                )}
            </div>
        </div>
    );
};