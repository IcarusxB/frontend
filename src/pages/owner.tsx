import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { useProgram } from '../contexts/ProgramProvider';
import { notify } from '../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import * as anchor from "@project-serum/anchor";
import { InitializeStore } from '../components/MadmaStore/InitializeStore';
import DesignList from '../components/MadmaStore/DesignList';
import { OrderList } from '../components/MadmaStore/OrderList';

interface StoreAccount {
    authority: PublicKey;
    designsCount: BN;
    earnings: BN;
    bump: number;
}

const OwnerPage: FC = () => {
    const { program } = useProgram();
    const { connected, publicKey } = useWallet();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [storeInitialized, setStoreInitialized] = useState(false);

    useEffect(() => {
        const checkStore = async () => {
            if (!program || !publicKey) return;
            
            try {
                const [storePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("store")],
                    program.programId
                );
                const store = await program.account.store.fetch(storePda) as StoreAccount;
                setStoreInitialized(true);
                setIsOwner(store.authority.toString() === publicKey.toString());
            } catch (error) {
                setStoreInitialized(false);
                console.error("Error checking store:", error);
            }
        };

        checkStore();
    }, [program, publicKey]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!program) return;

        setIsLoading(true);
        try {
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            const priceInLamports = new BN(parseFloat(price) * 1e9);

            const store = await program.account.store.fetch(storePda) as StoreAccount;
            const designId = store.designsCount.toNumber();

            const [designPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("design"),
                    storePda.toBuffer(),
                    new BN(designId).toArrayLike(Buffer, 'le', 8)
                ],
                program.programId
            );

            const tx = await program.methods
                .createDesign(
                    title,
                    description,
                    imageUrl,
                    priceInLamports
                )
                .accounts({
                    design: designPda,
                    store: storePda,
                    authority: program.provider.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            notify({ 
                type: 'success', 
                message: 'Design created successfully!',
                txid: tx 
            });

            // Reset form
            setTitle('');
            setDescription('');
            setImageUrl('');
            setPrice('');

        } catch (error: any) {
            notify({ 
                type: 'error', 
                message: error?.message || 'Failed to create design' 
            });
            console.error('Error creating design:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!connected) {
        return (
            <div className="text-center mt-8 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800">Wallet Not Connected</h2>
                <p className="mt-2 text-gray-600">Please connect your wallet to continue</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            {!storeInitialized ? (
                <InitializeStore />
            ) : (
                <>
                    <div className="p-6 bg-white rounded-lg shadow mb-8">
                        <h2 className="text-2xl font-bold mb-6">Create New Design</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                    placeholder="https://example.com/image.jpg"
                                />
                                {imageUrl && (
                                    <img 
                                        src={imageUrl} 
                                        alt="Preview" 
                                        className="mt-2 max-h-40 rounded"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            notify({ 
                                                type: 'error', 
                                                message: 'Invalid image URL' 
                                            });
                                        }}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (SOL)</label>
                                <input
                                    type="number"
                                    step="0.000000001"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Design'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow mb-8">
                        <h2 className="text-2xl font-bold mb-6">Your Designs</h2>
                        <DesignList ownerView={true} />
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-6">Order Management</h2>
                        <OrderList ownerView={true} />
                    </div>
                </>
            )}
        </div>
    );
};

export default OwnerPage;