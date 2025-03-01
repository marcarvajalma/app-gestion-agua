import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styled from 'styled-components';
import bogota_app_logo from './favicon.png';
// Estilos personalizados para el contenedor del login
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  background: linear-gradient(135deg, #007bff, #00bfff);
  color: white;
  padding: 20px;
`;

const Logo = styled.img`
  width: 300px;
  margin-bottom: 20px;
`;

const LoginDescription = styled.p`
  margin-bottom: 20px;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  font-size: 1.1rem;
`;

// Estilos personalizados para el botón de Google Login
const StyledGoogleLogin = styled(GoogleLogin)`
  font-family: 'Montserrat', sans-serif;
  background-color: #ffffff;
  color: #007bff;
  border-radius: 25px;
  padding: 10px 20px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
  }
`;

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Reemplaza con tu clientId de Google

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContainer>

        {/* Logo de la aplicación */}
        <Logo src={bogota_app_logo} alt="Logo de la aplicación" />
        {/* Botón de Google Login */}
        <StyledGoogleLogin
          onSuccess={onSuccess}
          onError={onFailure}
          theme="filled_blue"
          shape="pill"
          text="signin"
          logo_alignment="center"
        />


        {/* Descripción del login */}
        <LoginDescription>
          Esta aplicación es una <strong>herramienta interactiva</strong> que te ayuda a monitorear y optimizar el consumo de agua en tu hogar.
          <br /><br />
          Su objetivo es promover el <strong>ahorro eficiente</strong> de agua, permitiéndote identificar patrones de consumo y tomar decisiones informadas para reducir el desperdicio.
          <br /><br />
          <strong>⚠️ Importante:</strong> Esta aplicación es una herramienta de <strong>monitoreo y concienciación</strong>, y no está asociada a ninguna entidad oficial. ¡Úsala para contribuir al cuidado del planeta desde cualquier parte del mundo! 🌍💧
        </LoginDescription>

        
      </LoginContainer>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;