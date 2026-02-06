import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerificationScreen({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return alert('El código debe tener 6 dígitos');
    
    setLoading(true);
    try {
      await api.post('/auth/verify', { email, code });
      
      Alert.alert('¡Verificado!', 'Tu cuenta ha sido activada.', [
        { text: 'Ir a Login', onPress: () => navigation.popToTop() }
      ]);
    } catch (error) {
      alert(error.response?.data?.msg || 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="mark-email-read" size={60} color="#2563EB" />
      </View>
      
      <Text style={styles.title}>Verifica tu Correo</Text>
      <Text style={styles.subtitle}>Hemos enviado un código a:</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  iconContainer: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  email: { fontSize: 16, fontWeight: 'bold', color: '#2563EB', marginBottom: 40 },
  inputContainer: { backgroundColor: '#fff', width: '100%', borderRadius: 16, height: 60, justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { fontSize: 24, fontWeight: 'bold', color: '#111827', letterSpacing: 5 },
  button: { backgroundColor: '#2563EB', width: '100%', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});