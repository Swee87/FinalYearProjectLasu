import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token || null; 
            state.isAuthenticated = true;
            state.isInitialized = true;
          },
        clearCredentials: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isInitialized = true; // Mark as initialized
        },
        startInitialization: (state) => {
            state.isInitialized = true; // Mark as loading
            state.isAuthenticated = true; // Reset authentication status
            state.user = null; // Reset user data
        }
    },
});
export const { setCredentials, clearCredentials, startInitialization } = authSlice.actions;
export default authSlice.reducer;