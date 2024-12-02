import { FC, useEffect, useState } from 'react';
import { useProgram } from '../../contexts/ProgramProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../../utils/notifications';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

type OrderStatusEnum = 
    { created: Record<string, never> } |
    { pending: Record<string, never> } |
    { shipped: Record<string, never> } |
    { delivered: Record<string, never> } |
    { cancelled: Record<string, never> } |
    { completed: Record<string, never> };

type OrderStatus = {
    Created: {} | null;
    Pending: {} | null;
    Shipped: {} | null;
    Delivered: {} | null;
    Cancelled: {} | null;
    Completed: {} | null;
};

type OrderAccount = {
    store: PublicKey;
    buyer: PublicKey;
    designId: BN;
    pricePaid: BN;
    shippingInfo: string;
    status: OrderStatus;
    createdAt: BN;
    bump: number;
};

interface ProgramOrder {
    publicKey: PublicKey;
    account: OrderAccount;
}

type OrderStatusOption = keyof OrderStatus;

export const OrderList: FC<{ ownerView?: boolean }> = ({ ownerView = false }) => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [orders, setOrders] = useState<ProgramOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchOrders = async () => {
        if (!program || !publicKey) return;
        
        setIsLoading(true);
        try {
            let orderAccounts;
            if (ownerView) {
                orderAccounts = await program.account.order.all();
            } else {
                orderAccounts = await program.account.order.all([
                    {
                        memcmp: {
                            offset: 8 + 32,
                            bytes: publicKey.toBase58(),
                        },
                    },
                ]);
            }
            setOrders(orderAccounts);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            notify({ type: 'error', message: 'Failed to fetch orders', description: error?.message });
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderPda: PublicKey, newStatus: OrderStatusOption) => {
        if (!program || !publicKey) return;

        try {
            const [storePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("store")],
                program.programId
            );

            const statusUpdate = {
                [newStatus.toLowerCase()]: {} as Record<string, never>
            } as OrderStatusEnum;

            const tx = await program.methods
                .updateOrderStatus(statusUpdate)
                .accounts({
                    order: orderPda,
                    store: storePda,
                    authority: publicKey,
                })
                .rpc();

            notify({ type: 'success', message: 'Order status updated!', txid: tx });
            fetchOrders();
        } catch (error: any) {
            console.error('Error updating order status:', error);
            notify({ type: 'error', message: 'Failed to update order status', description: error?.message });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [program, publicKey, ownerView]);

    const filteredOrders = orders
        .filter(order => 
            order.publicKey.toString().includes(searchTerm) ||
            order.account.shippingInfo.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const timeA = a.account.createdAt.toNumber();
            const timeB = b.account.createdAt.toNumber();
            return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
        });

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    {ownerView ? 'All Orders' : 'My Orders'}
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-white text-gray-800 rounded border border-gray-300 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-4 py-2 bg-white text-gray-800 rounded border border-gray-300 hover:bg-gray-50"
                    >
                        Sort {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            {ownerView && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipping Info</th>
                            {ownerView && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.publicKey.toString()} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.publicKey.toString().slice(0, 8)}...
                                </td>
                                {ownerView && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.account.buyer.toString().slice(0, 4)}...
                                        {order.account.buyer.toString().slice(-4)}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.account.pricePaid.toNumber() / 1e9} SOL
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {Object.keys(order.account.status)[0]}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.account.createdAt.toNumber() * 1000).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {order.account.shippingInfo}
                                </td>
                                {ownerView && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <select
                                            onChange={(e) => updateOrderStatus(order.publicKey, e.target.value as OrderStatusOption)}
                                            className="px-4 py-2 bg-white text-gray-800 rounded border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                            defaultValue={Object.keys(order.account.status)[0]}
                                        >
                                            <option value="Created">Created</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isLoading && (
                    <div className="text-center py-4 text-gray-600">Loading orders...</div>
                )}
                {!isLoading && filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-600">No orders found</div>
                )}
            </div>
        </div>
    );
};