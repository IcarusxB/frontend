import { FC, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import * as anchor from "@project-serum/anchor";

interface PlaceOrderFormProps {
    design: {
        publicKey: PublicKey;
        account: {
            price: BN;
            title: string;
            designId: BN;
        };
    };
    onClose: () => void;
}

export const PlaceOrderForm: FC<PlaceOrderFormProps> = ({ design, onClose }) => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [shippingInfo, setShippingInfo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!program || !publicKey) return;

        setIsLoading(true);
        try {
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            // Get the store account to find its authority
            const storeAccount = await program.account.store.fetch(storePda);
            
            // Use the actual store authority from the store account
            const storeAuthority = storeAccount.authority;

            // Generate Order PDA
            const [orderPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("order"),
                    storePda.toBuffer(),
                    publicKey.toBuffer(),
                ],
                program.programId
            );

            console.log("Store PDA:", storePda.toString());
            console.log("Store Authority:", storeAuthority.toString());
            console.log("Buyer:", publicKey.toString());
            console.log("Generated Order PDA:", orderPda.toString());

            const tx = await program.methods
                .createOrder(shippingInfo)
                .accounts({
                    order: orderPda,
                    design: design.publicKey,
                    store: storePda,
                    storeAuthority: storeAuthority,
                    buyer: publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            notify({ 
                type: 'success', 
                message: 'Order placed successfully!',
                txid: tx 
            });

            onClose();
        } catch (error: any) {
            notify({ 
                type: 'error', 
                message: 'Failed to place order',
                description: error?.message 
            });
            console.error('Error placing order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Place Order</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    <h4 className="font-medium text-gray-700">{design.account.title}</h4>
                    <p className="text-gray-600">Price: {design.account.price.toNumber() / 1e9} SOL</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Shipping Information
                        </label>
                        <textarea
                            value={shippingInfo}
                            onChange={(e) => setShippingInfo(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            rows={4}
                            placeholder="Enter your shipping address and any additional information..."
                            required
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Price:</span>
                            <span className="font-bold">{design.account.price.toNumber() / 1e9} SOL</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading || !publicKey}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 
                                     disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Place Order'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};