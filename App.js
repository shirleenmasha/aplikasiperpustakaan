// App.js
// Entry point. AuthProvider dipasang PALING LUAR supaya semua layar
// di dalamnya (termasuk AppNavigator) bisa membaca siapa yang login.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
