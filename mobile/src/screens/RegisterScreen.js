import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    // Limpiar error anterior
    setErrorMessage('');

    // Validar campos vacíos
    if (!username || !email || !password) {
      setErrorMessage('Por favor llena todos los campos');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      setErrorMessage('Ingresa un correo electrónico válido');
      return;
    }

    // Validar dominio @gmail.com
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setErrorMessage('Solo se permiten correos @gmail.com');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      // Si es exitoso, el AuthContext redirige automáticamente
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al registrar. Intenta con otro correo';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* BOTÓN ATRÁS */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a GastanGO</Text>
        </View>

        {/* MENSAJE DE ERROR */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>Nombre de Usuario</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. JoelTapia" 
              placeholderTextColor="#9CA3AF"
              value={username} 
              onChangeText={(text) => {
                setUsername(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@gmail.com" 
              placeholderTextColor="#9CA3AF"
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput 
              style={styles.input} 
              placeholder="Mínimo 6 caracteres" 
              placeholderTextColor="#9CA3AF"
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" /> 
            ) : (
              <Text style={styles.registerText}>Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backButton: { position: 'absolute', top: 50, left: 24, zIndex: 10, backgroundColor: '#fff', padding: 8, borderRadius: 12 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 40 },
  logo: { width: 90, height: 90, resizeMode: 'contain', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280' },
  
  errorContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FEE2E2', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444'
  },
  errorText: { flex: 1, marginLeft: 8, color: '#DC2626', fontSize: 14 },
  
  form: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 16, 
    marginBottom: 16, 
    paddingHorizontal: 16, 
    height: 56 
  },
  inputError: { borderColor: '#EF4444', borderWidth: 2 },
  input: { flex: 1, height: '100%', color: '#1F2937', fontSize: 16 },
  eyeIcon: { padding: 4 },
  registerButton: { 
    backgroundColor: '#10B981', 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12, 
    elevation: 4 
  },
  registerButtonDisabled: { backgroundColor: '#94A3B8' },
  registerText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  footerText: { color: '#6B7280', fontSize: 15 },
  loginLink: { color: '#2563EB', fontWeight: 'bold', fontSize: 15 },
});