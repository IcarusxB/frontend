import React, { FC, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { notify } from '../../utils/notifications';
import { BN } from '@project-serum/anchor';

export const CreateDesign: FC = () => {
    const { program } = useProgram();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');

    const handleCreateDesign = async () => {
        if (!program) {
            notify({ type: 'error', message: 'Please connect your wallet!' });
            return;
        }

        if (!title || !description || !imageUrl || !price) {
            notify({ type: 'error', message: 'Please fill in all fields!' });
            return;
        }

        setIsLoading(true);
        try {
            const tx = await program.methods
                .createDesign(
                    title,
                    description,
                    imageUrl,
                    new BN(Number(price) * 1e9) // Convert to lamports
                )
                .rpc();
            
            notify({ 
                type: 'success', 
                message: 'Design created successfully!',
                txid: tx 
            });

            // Clear form
            setTitle('');
            setDescription('');
            setImageUrl('');
            setPrice('');
            
        } catch (error: any) {
            notify({ 
                type: 'error', 
                message: error?.message || 'Failed to create design' 
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center p-4 rounded-lg bg-white shadow mt-4">
            <h2 className="text-2xl font-bold">Create New Design</h2>
            
            <div className="flex flex-col gap-2 w-full max-w-md">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                />
                
                <input
                    type="text"
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <input
                    type="number"
                    placeholder="Price in SOL"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.1"
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <button
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                             disabled:bg-gray-400 disabled:cursor-not-allowed
                             transition-colors duration-200"
                    onClick={handleCreateDesign}
                    disabled={!program || isLoading || !title || !description || !imageUrl || !price}
                >
                    {isLoading ? 'Creating...' : 'Create Design'}
                </button>
            </div>
        </div>
    );
};