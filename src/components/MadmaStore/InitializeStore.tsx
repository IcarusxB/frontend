import React, { FC, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { notify } from '../../utils/notifications';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export const InitializeStore: FC = () => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [isLoading, setIsLoading] = useState(false);

    const handleInitialize = async () => {
        if (!program || !publicKey) {
            notify({ type: 'error', message: 'Please connect your wallet!' });
            return;
        }

        setIsLoading(true);
        try {
            // Derive the store PDA
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            const tx = await program.methods
                .initializeStore()
                .accounts({
                    store: storePda,
                    authority: publicKey,
                    systemProgram: PublicKey.default,
                })
                .rpc();
            
            notify({ 
                type: 'success', 
                message: 'Store initialized successfully!',
                txid: tx 
            });
            
        } catch (error: any) {
            notify({ 
                type: 'error', 
                message: error?.message || 'Failed to initialize store' 
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center p-4 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-bold">Initialize Madma Store</h2>
            <p className="text-gray-600">Start by initializing your store on the blockchain.</p>
            
            <button
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-colors duration-200"
                onClick={handleInitialize}
                disabled={!program || isLoading}
            >
                {isLoading ? 'Initializing...' : 'Initialize Store'}
            </button>
        </div>
    );
};