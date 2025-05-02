

export async function Login(email, password) {
  
    try {
        const res = await fetch("http://localhost:5000/auth1/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json",
                // Include the token in the request headers
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to login");
        }
        
        const {  data } = await res.json();

        return {  data }; 
    } catch (error) {
        console.error("Error logging in:", error.message);
        throw error; // Rethrow the error for the caller to handle
    }

}



export async function Register(email, password) {
    try {
        

        const res = await fetch("http://localhost:5000/auth1/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json",
               
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to register");
        }

        const { data } = await res.json();
        return{ data}
    } catch (error) {
        console.error("Error registering:", error.message);
        throw error;
    }
}

export async function OtpVerification(email, otp) {
    try {
        const res = await fetch("http://localhost:5000/auth1/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to verify OTP");
        }

        const { data } = await res.json();
        return { data };
    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        throw error;
    }
}

export async function ForgottenPassword (email){
    try {
        const res = await fetch("http://localhost:5000/auth1/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to send reset link");
        }

        const { status } = await res.json();
        return { status };    
    }catch (error) {
        console.error("Error sending reset link:", error.message);
        throw error;
    }
}



export async function UpdateUserPassword({ tokenId, token, password }) {
    try {
        const res = await fetch("http://localhost:5000/auth1/update-password", {
            method: "POST",
            body: JSON.stringify({ tokenId, token, password }),
            headers: {
                "Content-Type": "application/json",
            },
             credentials: 'include'
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update password");
        }

        return await res.json();
    } catch (error) {
        console.error("Error updating password:", error.message);
        throw error;
    }
}

// Function to handle Google login success
// export const verifyGoogleToken = async (credential) => {
//     try {
//         // Send the Google token to your backend for verification using fetch
//         const response = await fetch('http://localhost:5000/auth/google', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ token: credential }),
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to verify Google token');
//         }

//         // Extract user data and JWT from the backend response
//         const { token, user } = await response.json();

//         return { token, user }; // Return the token and user data
//     } catch (error) {
//         console.error('Google login failed:', error.message);
//         throw error; // Re-throw the error for the caller to handle
//     }
// };
// export const verifyGoogleToken = async (credential) => {
//     try {
//         // Send the Google token to your backend for verification using fetch
//         const response = await fetch('http://localhost:5000/auth/home', { // Correct route
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json', // Specify JSON content type
//             },
//             body: JSON.stringify({ token: credential }), // Send the token in JSON format
//             credentials: 'include',
//         });

//         console.log('Backend response:', response); // Log the full response

//         if (!response.ok) {
//             const errorData = await response.text(); // Use `.text()` to capture non-JSON responses
//             console.error('Error data from backend:', errorData);
//             throw new Error(errorData || 'Failed to verify Google token');
//         }

//         // Extract user data and JWT from the backend response
//         const { token, user } = await response.json();

//         return { token, user }; // Return the token and user data
//     } catch (error) {
//         console.error('Google login failed:', error.message);
//         throw error; // Re-throw the error for the caller to handle
//     }
// };
export const verifyGoogleToken = async (credential) => {
    try {
      const response = await fetch('http://localhost:5000/auth/home', { // Note auth
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
        credentials: 'include' // Crucial for cookies
      });
  
      if (!response.ok) throw new Error('Auth failed');
      
      return await response.json(); // { user, token }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };
  export async function fetchCurrentUser() {
    try {
      const response = await fetch("http://localhost:5000/auth/current", {
        method: "GET",
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        },
        // Important for slow networks
        signal: AbortSignal.timeout(5000) 
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Clear cookie if invalid
        if (response.status === 401) {
          document.cookie = 'authtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        throw new Error(data.message || `Authentication failed (${response.status})`);
      }
  
      return data.user;
    } catch (error) {
      console.error("Auth check failed:", error);
      throw error;
    }
  }
  export async function Logout() {
    try {
        const res = await fetch("http://localhost:5000/auth/logout", {
            method: "POST",
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!res.ok) {
            throw new Error("Failed to logout");
        }

        // Clear client-side cache
        if (window.location.reload) {
            window.location.reload(true); // Force reload ignoring cache
        }
        
        return await res.json();
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}
// Add this to your authApi service
export const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/refreshToken', {
        method: 'POST',
        credentials: 'include', // Necessary for cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };
// export async function fetchCurrentUser() {
//     try {
//         const res = await fetch("http://localhost:5000/auth/current", {
//             method: "GET",
//             credentials: 'include', // Ensure cookies are sent with the request
//         });

//         if (!res.ok) {
//             // Handle non-JSON responses gracefully
//             const errorData = await res.text();
//             throw new Error(errorData || "Failed to fetch current user");
//         }

//         const { user } = await res.json();
//         return { user };
//     } catch (error) {
//         console.error("Error fetching current user:", error.message);
//         throw error; // Rethrow the error for the caller to handle
//     }
// }
// export async function UpdateUserPassword ( token, password ){
//     try {
//         const res = await fetch("http://localhost:5000/auth/update-password", {
//             method: "POST",
//             body: JSON.stringify({ token , password}),
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });

//         if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(errorData.message || "Failed to update password");
//         }

//         const { status } = await res.json();
//         return { status };
//     } catch (error) {
//         console.error("Error updating password:", error.message);
//         throw error;
//     }
// }