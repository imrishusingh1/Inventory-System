import api from './api';

const orderService = {
    // Public - Search admins by username (no auth)
    searchAdmins: async (username) => {
        const res = await api.get(`/public/admins?username=${username}`);
        return res.data;
    },

    // Public - Get admin's product catalog
    getAdminProducts: async (username) => {
        const res = await api.get(`/public/admins/${username}/products`);
        return res.data;
    },

    // Customer - Place an order
    placeOrder: async (adminUsername, items, note = '') => {
        const res = await api.post('/orders', { adminUsername, items, note });
        return res.data;
    },

    // Customer - Get my orders
    getMyOrders: async () => {
        const res = await api.get('/orders/my');
        return res.data;
    },

    // Admin - Get orders for their store
    getAdminOrders: async () => {
        const res = await api.get('/orders/admin');
        return res.data;
    },

    // Admin - Update order status
    updateOrderStatus: async (orderId, status) => {
        const res = await api.put(`/orders/${orderId}/status`, { status });
        return res.data;
    },
};

export default orderService;
