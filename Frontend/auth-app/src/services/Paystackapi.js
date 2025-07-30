
export const PaystackPaymentApi = async ({ amount, email }) => {
  try {
    const res = await fetch('http://localhost:5000/payStackPayment/initialize-payment', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount, email,  })
    });

    const result = await res.json(); 

    if (!res.ok) {
      throw new Error(result.message || "Failed to initialize payment");
    }

    const { authorization_url } = result.data;
    return authorization_url;

  } catch (err) {
    console.error("Payment initialization error:", err);
    throw err;
  }
};

export const PaystackReferencePoint = async ({ reference }) => {
  try {
    const res = await fetch(`http://localhost:5000/payStackPayment/verify-payment/${reference}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Could not get transaction details');
    }
    
    return result.data || result;

  } catch (err) {
    console.error('Could not fetch reference:', err);
    throw err;
  }
};

export const getAdminTransactions = async ({ page = 1 }) => {
  try {
    const res = await fetch(`http://localhost:5000/payStackPayment/admin/transactions?page=${page}&limit=10`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to fetch transactions");
    }

    return data;

  } catch (err) {
    console.error("Admin transaction fetch error:", err);
    throw err;
  }
};
