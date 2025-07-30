
///THIS FUNCTION IS FOR SUBMITTING  MEMBERSHIP DETAILS FOR VERIFICATION
export async function verifyCoopMember(formData) {
    try {
      const res = await fetch("http://localhost:5000/verifyCoop/verify-coop", {
        method: "POST",
        body: formData, // ← Already contains file + form fields
        credentials: "include", // Include cookies for session management
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to verify membership");
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("membership submission error:", error);
      throw error;
    }
  }