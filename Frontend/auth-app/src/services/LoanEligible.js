
export const checkLoanEligibility = async () => {
  try {
    const res = await fetch("http://localhost:5000/getLoanRoutes/eligibleForLoan", {
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();

    // Parse response, even if it's an error
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // Handle cases where server doesn't send JSON
      console.error("Failed to parse JSON response:", parseError);
      throw new Error("Invalid response from server.");
    }

    console.log("Loan eligibility response:", data);

    // Return everything so frontend can handle both success and failure
    return {
      success: res.ok,
      status: res.status,
      ...data,
    };
  } catch (error) {
    console.error("Error checking loan eligibility:", error.message);
    return {
      success: false,
      eligibility: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

