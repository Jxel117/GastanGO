import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    // Limpiar error anterior
    setErrorMessage('');

    // Validaciones básicas
    if (!email || !password) {
      setErrorMessage('Ingresa tu correo y contraseña');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      // Si es exitoso, el AuthContext redirige automáticamente
    } catch (error) {
      const msg = error.response?.data?.message || 'Credenciales incorrectas';
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
        
        {/* LOGO Y TÍTULO */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>GastanGO</Text>
          <Text style={styles.subtitle}>Tu gestor de finanzas</Text>
        </View>

        {/* MENSAJE DE ERROR */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* FORMULARIO */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput 
              style={styles.input} 
              placeholder="ejemplo@gmail.com" 
              placeholderTextColor="#9CA3AF" 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage(''); // Limpiar error al escribir
              }}
              keyboardType="email-address" 
              autoCapitalize="none" 
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputContainer, errorMessage && styles.inputError]}>
            <TextInput 
              style={styles.input} 
              placeholder="Tu contraseña" 
              placeholderTextColor="#9CA3AF" 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(''); // Limpiar error al escribir
              }}
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" /> 
            ) : (
              <Text style={styles.loginText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SEPARADOR */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* BOTÓN REGISTRO */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 12 },
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
  loginButton: { 
    backgroundColor: '#2563EB', 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12, 
    elevation: 4, 
    shadowColor: '#2563EB', 
    shadowOffset: {width: 0, height: 4}, 
    shadowOpacity: 0.3, 
    shadowRadius: 5 
  },
  loginButtonDisabled: { backgroundColor: '#94A3B8' },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  footerText: { color: '#6B7280', fontSize: 15 },
  signupText: { color: '#2563EB', fontWeight: 'bold', fontSize: 15 },
});