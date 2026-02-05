import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext'; 
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  // LOGOUT COMPATIBLE CON WEB Y MÓVIL
  const handleLogout = () => {
    if (Platform.OS === 'web') {
        const confirm = window.confirm("¿Estás seguro que quieres salir?");
        if (confirm) logout();
    } else {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que quieres salir?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Salir", style: "destructive", onPress: logout }
            ]
        );
    }
  };

  // SOPORTE COMPATIBLE CON WEB Y MÓVIL (Aquí estaba el fallo)
  const handleSupport = () => {
    const message = "Ayuda y Soporte\n\n" +
                    "Joel Tapia\n✉️ stalin.tapia@unl.edu.ec\n\n" +
                    "Freddy Matailo\n✉️ freddy.matailo@unl.edu.ec\n\n" +
                    "Estudiantes de Computación UNL\n\n" +
                    "Versión 1.0.0";

    if (Platform.OS === 'web') {
        // En web usamos la alerta del navegador
        window.alert(message);
    } else {
        // En celular usamos la alerta nativa bonita
        Alert.alert("Créditos y Soporte", message, [{ text: "Entendido" }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mi Perfil</Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.cameraIcon}>
                <MaterialIcons name="camera-alt" size={16} color="#fff" />
            </View>
        </View>
        <Text style={styles.name}>{user?.username || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'correo@ejemplo.com'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons name="settings" size={24} color={colors.textSecondary} />
            <Text style={styles.menuText}>Configuración</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
        </TouchableOpacity>
        
        {/* BOTÓN SOPORTE */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
            <MaterialIcons name="help-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.menuText}>Ayuda y Soporte</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.border} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={colors.danger} />
            <Text style={[styles.menuText, { color: colors.danger }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>GastanGO v1.0.0</Text>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text },
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: colors.primary },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: colors.background },
  name: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  menu: { backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15, fontWeight: '500', color: colors.text },
  version: { textAlign: 'center', marginTop: 30, color: colors.textSecondary, fontSize: 12 }
});