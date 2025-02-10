import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Reemplaza con tu clientId de Google

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;