
    
    export async function getBankDetails() {
        try{
            const res = await fetch('http://localhost:5000/bankList/bankList',{
               method: 'GET',
               credentials: 'include', // Important for cookies
            })
            if(!res.ok){
                const errorData = await res.json().catch(() => ({})); // fallback
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            return data.data; // return actual bank details list
        }catch(err){
            throw new Error("we could not fetch your bank details at this time ", err.message)
        }
    }

export async function verifyBankAccount(account_number, bank_code) {
  try {
    if (!account_number || !bank_code) {
      throw new Error("Account number and bank code are required");
    }

    const res = await fetch(
      `http://localhost:5000/bankList/VerifyBank_Account?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Bank verification failed: ${res.status}`);
    }

    const data = await res.json();
     console.log("Bank account verified successfully:", data);
    // Ensure we return a consistent structure
    return data
  } catch (err) {
    throw new Error(err.message || "Bank account verification error");
  }
}