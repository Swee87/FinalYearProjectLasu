export const fetchLoanHistory = async ({ loanId, filters = {} }) => {
  // Remove null/undefined from filters
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
  );
  const query = new URLSearchParams(cleanFilters).toString();

  try {
    const res = await fetch(`http://localhost:5000/getLoanRoutes/loan/${loanId}/history?${query}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch loan history");
    }

    return await res.json();
  } catch (error) {
    console.error("Fetch Loan History Error:", error);
    throw error;
  }
};
