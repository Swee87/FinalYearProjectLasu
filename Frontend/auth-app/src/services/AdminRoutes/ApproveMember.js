export async function ApproveMember() {
  try {
    const res = await fetch("http://localhost:5000/verifyCoop/coop-members", {
      method: "GET",
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
        // Optional: include Authorization header if using JWT
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({})); // fallback
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.data; // return actual member list
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
}