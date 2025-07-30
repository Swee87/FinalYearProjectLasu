export async function getAdminLedger (){
    try{
        const response = await fetch('http://localhost:5000/loantrack/admin-ledger',{
              method:"GET",
            credentials: "include", // Important for cookies
            headers: {
                "Content-Type": "application/json",
            },
        })

        if(!response.ok){
            const errorData = await response.json().catch(()=>{})
             throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
    const data = await response.json()
        return data
    }catch(err){
        throw new Error('Could not fetch the ledger ' , + err.message )
    }

}