
export async function fetchAdminSavings(page = 1, limit = 10) {
  try {
    const response = await fetch(`http://localhost:5000/Savings/admin-savings?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include', // Send cookies with request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch admin savings');
    }
    return {
      success: true,
      data: data, // includes savings, coopMembers, pagination
    };
  } catch (err) {
    console.error('[fetchAdminSavings] Error:', err.message);
    return {
      success: false,
      error: err.message || 'Unexpected error occurred',
    };
  }
}
