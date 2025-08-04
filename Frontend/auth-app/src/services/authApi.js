

export async function Login(email, password) {
  
    try {
        const res = await fetch("http://localhost:5000/auth1/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-Type": "application/json",
                // Include the token in the request headers
            },
             credentials: 'include'
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


export async function Register(email, password,LastName,FirstName) {
    try {
        

        const res = await fetch("http://localhost:5000/auth1/register", {
            method: "POST",
            body: JSON.stringify({ email, password ,LastName,FirstName}),
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
export async function RegisterAdmin(email, password,FirstName, LastName) {
    try {
        const res = await fetch("http://localhost:5000/auth1/register-administer", {
            method: "POST",
            body: JSON.stringify({ email, password ,FirstName, LastName}),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to register admin");
        }

        const { data } = await res.json();
        return { data };
    } catch (error) {
        console.error("Error registering admin:", error.message);
        throw error;
    }
}


export const LoginAdmin = async (email, password) => {
    try{
        // Check if email and password are provided
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
            const res = await fetch("http://localhost:5000/auth1/admin-login", {
                method: "POST",
                body: JSON.stringify({ email, password }),      
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include" // 
              });
            
              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to login admin");
              }
            
              const {data }= await res.json();
              return {data };
    }catch (error) {
        console.error("Error logging in admin:", error.message);
        throw error; // Rethrow the error for the caller to handle
    }
   
}

export const verifyGoogleToken = async (credential) => {
  try {
    const response = await fetch('http://localhost:5000/auth/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
      credentials: 'include', // For cookies
    });

    const data = await response.json(); // Parse JSON response

    if (!response.ok) {
      // Create custom error with backend message
      const error = new Error(data.message || 'Authentication failed');
      error.status = response.status; // Attach status (e.g., 409)
      throw error;
    }
    return data; // { success: true, user, token }
  } catch (error) {
    console.error('Google auth error:', error);
    throw error; // Re-throw for caller to handle (e.g., redirect)
  }
};

export async function fetchCurrentUser() {
    try {
      const response = await fetch("http://localhost:5000/auth/current", {
        method: "GET",
        credentials: 'include', 
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(5000)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
      const response = await fetch('http://localhost:5000/auth1/refreshToken', {
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
export const adminRefreshToken = async () => {
    try {
        const response = await fetch('http://localhost:5000/auth1/adminRefreshToken', {
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
}
