import { FC, useCallback, useEffect, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Program, ProgramAccount } from '@project-serum/anchor';

interface DesignAccount {
    store: PublicKey;
    designId: BN;
    title: string;
    description: string;
    imageUrl: string;
    price: BN;
    available: boolean;
    salesCount: BN;
    bump: number;
}

type ProgramDesign = ProgramAccount<DesignAccount>;

const DesignList: FC<{ ownerView?: boolean }> = ({ ownerView = false }) => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [designs, setDesigns] = useState<ProgramDesign[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDesigns = useCallback(async () => {
        if (!program) {
            console.log("No program instance");
            return;
        }

        setIsLoading(true);
        try {
            const designAccounts = await program.account.design.all();
            console.log("All designs:", designAccounts);

            setDesigns(designAccounts as ProgramDesign[]);
        } catch (error: any) {
            console.error('Error fetching designs:', error);
            notify({ 
                type: 'error', 
                message: 'Failed to fetch designs',
                description: error?.message 
            });
        } finally {
            setIsLoading(false);
        }
    }, [program]);

    useEffect(() => {
        fetchDesigns();
    }, [fetchDesigns]);

    const filteredDesigns = designs.filter(design => 
        // Show all designs to owner, but only available ones to customers
        ownerView || design.account.available
    );

    if (isLoading) {
        return <div className="text-center py-4">Loading designs...</div>;
    }

    if (!filteredDesigns.length) {
        return <div className="text-center py-4">
            {ownerView ? 'No designs found' : 'No available designs'}
        </div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map(design => (
                <div key={design.publicKey.toString()} 
                     className={`bg-white rounded-lg shadow-md overflow-hidden 
                         ${!design.account.available && ownerView ? 'opacity-60' : ''}`}>
                    <img 
                        src={design.account.imageUrl} 
                        alt={design.account.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/fallback-image.png';
                        }}
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{design.account.title}</h3>
                        <p className="text-gray-600 mb-4">{design.account.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">
                                {design.account.price.toNumber() / 1e9} SOL
                            </span>
                            {ownerView ? (
                                <button
                                    className={`px-4 py-2 text-white rounded
                                        ${design.account.available 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-green-600 hover:bg-green-700'}`}
                                    onClick={() => {
                                        // Add toggle availability logic here
                                        console.log('Toggle availability for:', design.publicKey.toString());
                                    }}
                                >
                                    {design.account.available ? 'Disable' : 'Enable'}
                                </button>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                    onClick={() => {
                                        // Add purchase logic here
                                        console.log('Purchase clicked for:', design.publicKey.toString());
                                    }}
                                >
                                    Buy Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DesignList;