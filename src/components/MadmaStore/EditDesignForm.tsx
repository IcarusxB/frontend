import React, { FC, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { notify } from '../../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

interface EditDesignFormProps {
    design: {
        publicKey: PublicKey;
        account: {
            designId: BN;
            price: BN;
            title: string;
            description: string;
            imageUrl: string;
            available: boolean;
        };
    };
    onClose: () => void;
    onSuccess: () => void;
}

export const EditDesignForm: FC<EditDesignFormProps> = ({ design, onClose, onSuccess }) => {
    const { program } = useProgram();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: design.account.title,
        description: design.account.description,
        imageUrl: design.account.imageUrl,
        price: (design.account.price.toNumber() / 1e9).toString(),
        available: design.account.available
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!program) return;

        setIsLoading(true);
        try {
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            const tx = await program.methods
                .updateDesign(
                    formData.title,
                    formData.description,
                    formData.imageUrl,
                    new BN(parseFloat(formData.price) * 1e9),
                    formData.available
                )
                .accounts({
                    design: design.publicKey,
                    store: storePda,
                })
                .rpc();

            notify({ 
                type: 'success', 
                message: 'Design updated successfully!',
                txid: tx 
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            notify({ 
                type: 'error', 
                message: 'Failed to update design',
                description: error?.message 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-2">Image URL</label>
                <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-2">Price (SOL)</label>
                <input
                    type="number"
                    step="0.000000001"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    required
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-gray-700 font-medium">
                    Available for Purchase
                </label>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 
                             disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Updating...' : 'Update Design'}
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
    );
};