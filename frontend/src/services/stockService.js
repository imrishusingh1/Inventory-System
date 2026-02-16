import api from './api';

const stockService = {
  stockIn: async (data) => { // { productId, quantity, reason }
    const response = await api.post('/stock/in', data);
    return response.data;
  },

  stockOut: async (data) => { // { productId, quantity, reason }
    const response = await api.post('/stock/out', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/stock/history');
    return response.data;
  }
};

export default stockService;
