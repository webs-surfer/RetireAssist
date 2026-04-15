import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Use VITE_GOOGLE_CLIENT_ID from .env — leave it blank for demo mode
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';

export default function Root() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <SocketProvider>
                        <App />
                    </SocketProvider>
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

