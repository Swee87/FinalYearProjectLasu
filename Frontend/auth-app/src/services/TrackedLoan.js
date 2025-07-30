// src/services/api.js
const API_BASE = 'http://localhost:5000/loantrack';
export const fetchTrackedLoans = async () => {
  try {
    const response = await fetch(`${API_BASE}/trackedLoans
        `, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tracked loans:', error);
    throw error; // Re-throw to allow calling code to handle
  }
};

export const fetchLoanTrack = async (loanId) => {
  try {
    const response = await fetch(`${API_BASE}/loan-track/${loanId}
        `, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });
    if (!response.ok) {
      throw new Error('Failed to fetch loan track');
    }
    const data = await response.json();
    return data 
  } catch (error) {
    console.error('Error fetching loan track:', error);
    throw error;
  }
};

export const updatePayment = async ({ loanId, month, year , repaymentAmount}) => {
  try {
    const response = await fetch(`${API_BASE}/update-payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',

      },
        credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ loanId, month, year, repaymentAmount }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};