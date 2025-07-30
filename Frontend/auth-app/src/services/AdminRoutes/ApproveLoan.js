//http://localhost:5000/getLoanRoutes/appliedLoans", {

export async function getAllappliedLoan(){
    try{
        const res = await fetch("http://localhost:5000/getLoanRoutes/appliedLoans",{
            method:"GET",
            credentials: "include", // Important for cookies
            headers: {
                "Content-Type": "application/json",
            },
        })

        if(!res.ok){const errorData = await res.json().catch(() => ({})); // fallback
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data.data; // return actual loan list
        // return { data: data.data, userId: data.userId}; // return actual loan list and user ID

    }catch(err){
        throw new Error("We could not fetch the applied loans at this time." + err.message);
    }
}

export async function LoanActions (loanIds, newStatus){
    try {
        const res = await fetch("http://localhost:5000/getLoanRoutes/loanAction", {
            method: "PATCH",
            credentials: "include", // Important for cookies
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ loanIds, newStatus }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); // fallback
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data; // return actual loan list

    } catch (err) {
        throw new Error("We could not update the loan status at this time." + err.message);
    }
}

export async function getTrackedLoans(){
    try{    
        const res = await fetch('http://localhost:5000/loantrack/trackedLoans', {
            method: "GET",
            credentials: "include", // Important for cookies
            headers: {
                "Content-Type": "application/json",
            },
        }); 
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); // fallback
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json()
        return data

    }catch(err){
        throw new Error("we could not fetch the tracked loans at the moment." + err.message);
    }
}