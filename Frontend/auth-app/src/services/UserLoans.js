export const getAllUserLoans = async()=>{
    try {
        const response = await fetch("http://localhost:5000/getLoanRoutes/getAllUserLoans", {
        method: "GET",
        credentials: "include", // Include cookies for session management
        });
    
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user loans");
        }
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user loans:", error);
        throw error;
    }
}