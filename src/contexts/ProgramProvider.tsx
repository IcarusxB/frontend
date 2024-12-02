import { createContext, useContext, ReactNode, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { IDL } from '../idl/madma';
import { notify } from '../utils/notifications';
import { ProgramAccount } from '@project-serum/anchor';

const programId = new PublicKey('Djzp1vsviNw61kJSDFbYfUEGUXwaLTZVW2e1L76S8QtA');

interface ProgramContextState {
    program: anchor.Program<typeof IDL> | null;
    designs: ProgramAccount<any>[];
    orders: ProgramAccount<any>[];
    isLoading: boolean;
    refreshData: (force?: boolean) => Promise<void>;
}

const ProgramContext = createContext<ProgramContextState>({
    program: null,
    designs: [],
    orders: [],
    isLoading: false,
    refreshData: async () => {},
});

const CACHE_DURATION = 30000; // 30 seconds
let lastFetchTime = 0;

export function ProgramProvider({ children }: { children: ReactNode }) {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [designs, setDesigns] = useState<ProgramAccount<any>[]>([]);
    const [orders, setOrders] = useState<ProgramAccount<any>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const program = useMemo(() => {
        if (!wallet) return null;

        const provider = new anchor.AnchorProvider(
            connection,
            wallet,
            anchor.AnchorProvider.defaultOptions()
        );
        anchor.setProvider(provider);

        return new anchor.Program(
            IDL,
            programId,
            provider
        );
    }, [connection, wallet]);

    const refreshData = useCallback(async (force = false) => {
        if (!program || !wallet) return;

        const now = Date.now();
        if (!force && lastFetchTime > 0 && (now - lastFetchTime) < CACHE_DURATION) {
            return;
        }

        setIsLoading(true);
        try {
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            // Fetch designs and orders with proper filters
            const [designAccounts, orderAccounts] = await Promise.all([
                // Fetch all designs for the store
                program.account.design.all([
                    {
                        memcmp: {
                            offset: 8, // After discriminator
                            bytes: storePda.toBase58(),
                        },
                    },
                ]),
                // Fetch orders for the current user
                program.account.order.all([
                    {
                        memcmp: {
                            offset: 8 + 32, // After discriminator + store pubkey
                            bytes: wallet.publicKey.toBase58(),
                        },
                    },
                ]),
            ]);

            console.log('Fetched designs:', designAccounts);
            console.log('Fetched orders:', orderAccounts);

            setDesigns(designAccounts);
            setOrders(orderAccounts);
            lastFetchTime = now;
        } catch (error: any) {
            console.error('Error fetching data:', error);
            notify({
                type: 'error',
                message: 'Failed to fetch data',
                description: error?.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [program, wallet]);

    return (
        <ProgramContext.Provider value={{ program, designs, orders, isLoading, refreshData }}>
            {children}
        </ProgramContext.Provider>
    );
}

export function useProgram() {
    return useContext(ProgramContext);
}