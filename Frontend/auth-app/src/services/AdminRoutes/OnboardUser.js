// // src/api/onboardUser.js
export async function onboardUser({ FirstName, LastName, email, role }) {
  const res = await fetch('http://localhost:5000/auth1/onboard-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ FirstName, LastName, email, role }),
  });

  const { status, message, user, ...rest } = await res.json();

  if (!res.ok) {
    throw new Error(message || 'Failed to onboard user');
  }

  return { status, message, user, ...rest };
}

// export async function onboardUser(payload) {
//   const response = await fetch('http://localhost:5000/auth1/onboard-user', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
//     credentials: 'include', // Important to send cookies (adminAccessToken)
//     body: JSON.stringify(payload),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || 'Failed to onboard user');
//   }

//   return data;
// }
