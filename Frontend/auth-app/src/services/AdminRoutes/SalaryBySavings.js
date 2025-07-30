export const fetchAllSavingsBySalary = async ()=>{
try{
const res = await fetch('http://localhost:5000/SalarySavings/SavingsBySalary',{
    method:'GET',
    mode: 'cors',
    headers:{
        'Content-type':'application/json',
         Accept: 'application/json',
    },
    credentials: 'include'
})

  if(!res.ok){
            throw new Error ('We are unable to process your request at the moment.')
        }
        const data = await res.json()
        return data;
}catch(err){
    throw err
}
}



// Update payment status
export const updatePaymentStatus = async (userId, data) => {
    try{
         const response = await fetch(`http://localhost:5000/SalarySavings/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
     credentials:'include'
  });

 
  
  if (!response.ok) {
    const error = new Error('Failed to update payment status');
    error.status = response.status;
    throw error;
  }
  
  return response.json();
    }catch(err){
        throw err
    }
 
};