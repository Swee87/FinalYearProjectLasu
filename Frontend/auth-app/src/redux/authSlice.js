import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isInitialized = true; // Mark as initialized
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