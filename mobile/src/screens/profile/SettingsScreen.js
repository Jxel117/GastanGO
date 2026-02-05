import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { scheduleDailyNotifications, cancelNotifications, registerForPushNotificationsAsync } from '../../services/notification.service';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, isDarkMode } = useContext(ThemeContext);
  const colors = theme.colors;

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Manejo de Notificaciones
  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
        if (Platform.OS === 'web') {
            Alert.alert("Aviso", "Las notificaciones push no están soportadas en la versión web.");
            return;
        }
        const hasPermission = await registerForPushNotificationsAsync();
        if (hasPermission) {
            await scheduleDailyNotifications(); // Se programan a las 11:30, 19:30, 23:30
            Alert.alert("Activado", "Te avisaremos a las 11:30, 19:30 y 23:30 para registrar tus gastos.");
        } else {
            setNotificationsEnabled(false);
            Alert.alert("Permiso denegado", "No podemos enviar notificaciones sin tu permiso.");
        }
    } else {
        await cancelNotifications();
    }
  };

  // Manejo de PDF (Descargar Términos)
  const handleDownloadPDF = async () => {
    if (Platform.OS === 'web') {
        // En web, simplemente abrimos el archivo (si estuviera hosteado) o mostramos alerta
        Alert.alert("Descarga", "En la versión web, el PDF se abriría en una nueva pestaña.");
        return;
    }

    try {
        // 1. Cargar el asset
        const asset = Asset.fromModule(require('../../../assets/terminos.pdf'));
        await asset.downloadAsync();

        // 2. Mover a carpeta caché
        const fileUri = `${FileSystem.cacheDirectory}terminos_condiciones.pdf`;
        await FileSystem.copyAsync({
            from: asset.localUri,
            to: fileUri
        });

        // 3. Compartir / Guardar
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert("Error", "No se puede compartir en este dispositivo");
        }
    } catch (error) {
        console.log("Error PDF:", error);
        Alert.alert("Error", "No se encontró el archivo 'terminos.pdf' en assets.");
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SECCIÓN GENERAL */}
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.section}>
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, {backgroundColor: colors.primary + '20'}]}>
                         <MaterialIcons name="dark-mode" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.label}>Modo Oscuro</Text>
                </View>
                <Switch 
                    value={isDarkMode} 
                    onValueChange={toggleTheme}
                    trackColor={{ false: "#64748B", true: colors.primary }}
                    thumbColor={"#fff"}
                />
            </View>
        </View>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.section}>
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, {backgroundColor: colors.primary + '20'}]}>
                        <MaterialIcons name="notifications" size={24} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.label}>Recordatorios Diarios</Text>
                        <Text style={styles.subLabel}>11:30 AM • 07:30 PM • 11:30 PM</Text>
                    </View>
                </View>
                <Switch 
                    value={notificationsEnabled} 
                    onValueChange={toggleNotifications}
                    trackColor={{ false: "#64748B", true: colors.primary }}
                    thumbColor={"#fff"}
                />
            </View>
        </View>

        {/* SECCIÓN LEGAL */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.section}>
             <TouchableOpacity style={styles.linkRow} onPress={handleDownloadPDF}>
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, {backgroundColor: colors.iconBg}]}>
                        <MaterialIcons name="picture-as-pdf" size={24} color={colors.text} />
                    </View>
                    <Text style={styles.label}>Términos y Condiciones</Text>
                </View>
                <MaterialIcons name="file-download" size={24} color={colors.textSecondary} />
             </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginTop: Platform.OS === 'android' ? 40 : 60,
    marginBottom: 20
  },
  backBtn: { padding: 8, backgroundColor: colors.card, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  
  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 10, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  section: { backgroundColor: colors.card, borderRadius: 20, padding: 5, marginBottom: 20 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: colors.text },
  subLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
});