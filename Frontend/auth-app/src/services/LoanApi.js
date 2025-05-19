
const token = localStorage.getItem("token");
export async function getLoan(formData) {
    try {
      const res = await fetch("http://localhost:5000/upLoanpayslip/submit-loan", {
        method: "POST",
        body: formData, // ← Already contains file + form fields
        credentials: "include", // Include cookies for session management
        // headers: {
        //     Authorization: `Bearer ${token}`,
        //   }
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit loan");
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Loan submission error:", error);
      throw error;
    }
  }