import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../views/screens/LoginScreen';
import HomeScreen from '../views/screens/HomeScreen';
import EJournalScreen from '../views/screens/EJournalScreen';
import BookDetailScreen from '../views/screens/BookDetailScreen';
import BookReaderScreen from '../views/screens/BookReaderScreen';
import BookFormScreen from '../views/screens/BookFormScreen';
import AdminDashboardScreen from '../views/screens/AdminDashboardScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import SubscriptionScreen from '../views/screens/SubscriptionScreen';

import { useAuth } from '../context/AuthContext';
import { ROLES, can } from '../constants/roles';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ikon tiap tab
const TAB_ICONS = {
  Dashboard: 'grid',
  Katalog: 'book',
  'E-Journal': 'newspaper',
  Langganan: 'card',
  Profil: 'person',
};

function MainTabs() {
  const { user } = useAuth();
  const isAdmin = can(user, 'viewDashboard');
  const isExternal = user?.role === ROLES.EKSTERNAL;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E5AAC',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] || 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      {}
      {isAdmin && <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />}

      <Tab.Screen name="Katalog" component={HomeScreen} />
      <Tab.Screen name="E-Journal" component={EJournalScreen} />

      {/* Tab khusus pengguna umum (skema Access Fee) */}
      {isExternal && <Tab.Screen name="Langganan" component={SubscriptionScreen} />}

      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Selama mengecek sesi tersimpan, tampilkan loading dulu supaya
  // layar Login tidak "berkedip" muncul sekilas bagi user yang sudah login.
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E5AAC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Belum login: satu-satunya layar yang ada hanyalah Login.
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen
              name="BookDetail"
              component={BookDetailScreen}
              options={{ headerShown: true, title: 'Detail Buku' }}
            />
            {/* Layar baca -- terbuka untuk semua role yang login, aksesnya
                sendiri tetap dicek ulang di dalam layar (harus sedang
                meminjam, atau admin). */}
            <Stack.Screen
              name="BookReader"
              component={BookReaderScreen}
              options={{ headerShown: true, title: 'Baca E-Book' }}
            />
            {/* Form tambah/edit (sudah termasuk isi konten) hanya untuk admin */}
            {can(user, 'manageBooks') && (
              <Stack.Screen
                name="BookForm"
                component={BookFormScreen}
                options={{ headerShown: true, title: 'Form Koleksi' }}
              />
            )}
            {/* Layar langganan bisa dibuka dari mana saja oleh pengguna umum */}
            {user.role === ROLES.EKSTERNAL && (
              <Stack.Screen
                name="Langganan"
                component={SubscriptionScreen}
                options={{ headerShown: true, title: 'Paket Akses' }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6FA' },
});
