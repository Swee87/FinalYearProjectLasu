export const getUserReport = async () => {
  try {
    const res = await fetch('http://localhost:5000/report/userReport', {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.error || data?.message || 'Unknown error occurred';
      throw new Error(message);
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching user report:', error);
    throw new Error(error.message || 'Something went wrong');
  }
};
