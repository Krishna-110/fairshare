import axios from 'axios';

// Ensure this matches your testing environment. 
const BASE_URL = 'https://pseudoviscous-holozoic-elian.ngrok-free.dev/api'; // Corrected Full URL 

const getClient = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
};

export const apiService = {
  // --- AUTH / PROFILE ---
  getProfile: async (token) => {
    try {
      const response = await getClient(token).get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // --- PERSONS ---
  getAllPersons: async (token) => {
    try {
      const response = await getClient(token).get('/persons');
      return response.data;
    } catch (error) {
      console.error('Error fetching persons:', error);
      throw error;
    }
  },

  addPerson: async (personData, token) => {
    try {
      const response = await getClient(token).post('/persons', personData);
      return response.data;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  },

  updatePerson: async (personId, personData, token) => {
    try {
      const response = await getClient(token).put(`/persons/${personId}`, personData);
      return response.data;
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  },

  deletePerson: async (personId, token) => {
    try {
      await getClient(token).delete(`/persons/${personId}`);
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  },

  // --- DEBTS ---
  getAllDebts: async (token) => {
    try {
      const response = await getClient(token).get('/debts');
      return response.data;
    } catch (error) {
      console.error('Error fetching debts:', error);
      throw error;
    }
  },

  addDebt: async (debtData, token) => {
    // debtData should now contain debtorEmail, creditorEmail, and amount
    try {
      const response = await getClient(token).post('/debts', debtData);
      return response.data;
    } catch (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
  },

  updateDebt: async (debtId, debtData, token) => {
    try {
      const response = await getClient(token).put(`/debts/${debtId}`, debtData);
      return response.data;
    } catch (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
  },

  deleteDebt: async (debtId, token) => {
    try {
      await getClient(token).delete(`/debts/${debtId}`);
    } catch (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  },

  settleDebts: async (token) => {
    try {
      const response = await getClient(token).get('/settle');
      return response.data;
    } catch (error) {
      console.error('Error settling debts:', error);
      throw error;
    }
  }
};

export default apiService;
