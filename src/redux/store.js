import {configureStore} from '@reduxjs/toolkit';
// import authReducer from './features/authSlice';
import loadingReducer from './features/loadingSlice';
// import staffReducer from './features/staffSlice';
export const store = configureStore({
    reducer: {
        // auth: authReducer, 
        loading: loadingReducer, 
        // staff:staffReducer
    }
})