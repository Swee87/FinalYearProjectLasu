export const fetchSavingsTrack = async () => {
  try {
    const res = await fetch("http://localhost:5000/Savings/user-savings", {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.error || "Unable to fetch savings track.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching savings track:", error);
    throw error; 
  }
};

export const getTotalSavingsWithdrawable = async () => {
  try {
    const res = await fetch("http://localhost:5000/Savings/totalSavingsWithdrawable", {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.error || "Unable to fetch total savings withdrawable.");
    }

    return data;
  } catch (error) {
    console.log(error)
    console.error("Error fetching total savings withdrawable:", error);
    throw error; 
  }
}
