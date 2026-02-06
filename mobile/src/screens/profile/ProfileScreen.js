import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, ScrollView, Modal, FlatList 
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext'; 
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import api from '../../services/api';

// 🎨 LISTA AMPLIADA DE AVATARES DISPONIBLES
const AVATARS = [
    // Clásicos
    { id: '1', name: 'face', lib: 'MaterialIcons', color: '#3B82F6' },
    { id: '2', name: 'face-3', lib: 'MaterialIcons', color: '#EC4899' },
    { id: '3', name: 'face-6', lib: 'MaterialIcons', color: '#10B981' },
    // Profesiones / Roles
    { id: '4', name: 'user-astronaut', lib: 'FontAwesome5', color: '#8B5CF6' },
    { id: '5', name: 'user-ninja', lib: 'FontAwesome5', color: '#EF4444' },
    { id: '6', name: 'user-secret', lib: 'FontAwesome5', color: '#6B7280' },
    { id: '7', name: 'user-graduate', lib: 'FontAwesome5', color: '#F59E0B' },
    { id: '8', name: 'user-md', lib: 'FontAwesome5', color: '#0EA5E9' },
    // Fantasía / Divertidos
    { id: '9', name: 'ghost', lib: 'FontAwesome5', color: '#6366F1' },
    { id: '10', name: 'robot', lib: 'FontAwesome5', color: '#94A3B8' },
    { id: '11', name: 'dragon', lib: 'FontAwesome5', color: '#DC2626' },
    { id: '12', name: 'hat-wizard', lib: 'FontAwesome5', color: '#7C3AED' },
    // Animales
    { id: '13', name: 'cat', lib: 'FontAwesome5', color: '#F472B6' },
    { id: '14', name: 'dog', lib: 'FontAwesome5', color: '#A78BFA' },
    { id: '15', name: 'crow', lib: 'FontAwesome5', color: '#1F2937' },
    { id: '16', name: 'frog', lib: 'FontAwesome5', color: '#22C55E' },
    // Hobbies / Varios
    { id: '17', name: 'gamepad', lib: 'FontAwesome5', color: '#3B82F6' },
    { id: '18', name: 'music', lib: 'FontAwesome5', color: '#E11D48' },
    { id: '19', name: 'bicycle', lib: 'FontAwesome5', color: '#F97316' },
    { id: '20', name: 'camera', lib: 'FontAwesome5', color: '#06B6D4' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  // Estados
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user?.username || '');
  
  // Estado para el Modal de Avatares
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.username) setTempName(user.username);
  }, [user]);

  // GUARDAR NOMBRE
  const handleSaveName = async () => {
    if (tempName.trim().length === 0) return Alert.alert("Error", "El nombre no puede estar vacío");
    
    try {
        await api.put('/auth/update', { username: tempName });
        updateUserData({ username: tempName });
        setIsEditing(false);
        Alert.alert("Éxito", "Nombre actualizado");
    } catch (error) {
        Alert.alert("Error", "No se pudo guardar en el servidor.");
    }
  };

  // GUARDAR AVATAR
  const handleSelectAvatar = async (avatarItem) => {
      try {
          // Guardamos en backend
          await api.put('/auth/update', { avatar: avatarItem.name }); 
          
          // Guardamos en local
          updateUserData({ avatar: avatarItem.name });
          
          setModalVisible(false);
      } catch (error) {
          Alert.alert("Error", "No se pudo cambiar el avatar.");
      }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: logout }
    ]);
  };

  // Renderizar el avatar actual (Icono o Letra)
  const renderCurrentAvatar = () => {
      const avatarObj = AVATARS.find(a => a.name === user?.avatar);

      if (avatarObj) {
          if (avatarObj.lib === 'FontAwesome5') {
              return <FontAwesome5 name={avatarObj.name} size={45} color="#fff" />;
          }
          return <MaterialIcons name={avatarObj.name} size={50} color="#fff" />;
      }
      
      // Si no tiene avatar o no está en la lista, mostramos la inicial
      return <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Mi Perfil</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CABECERA */}
        <View style={styles.headerProfile}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => setModalVisible(true)}>
                <View style={[styles.avatarPlaceholder, user?.avatar && { backgroundColor: AVATARS.find(a => a.name === user.avatar)?.color || colors.primary }]}>
                    {renderCurrentAvatar()}
                </View>
                {/* Icono de camarita */}
                <View style={styles.cameraIcon}>
                    <MaterialIcons name="edit" size={14} color="#fff" />
                </View>
            </TouchableOpacity>
            <Text style={styles.headerName}>{user?.username || 'Usuario'}</Text>
        </View>

        {/* MENÚ */}
        <View style={styles.menuContainer}>
            
            {/* 1. INFORMACIÓN PERSONAL (DESPLEGABLE) */}
            <TouchableOpacity 
                style={[styles.menuItem, isInfoExpanded && styles.menuItemActive]} 
                onPress={() => setIsInfoExpanded(!isInfoExpanded)}
            >
                <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="person" size={20} color="#0284C7" />
                </View>
                <Text style={styles.menuText}>Información Personal</Text>
                <MaterialIcons 
                    name={isInfoExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color={colors.border} 
                />
            </TouchableOpacity>

            {isInfoExpanded && (
                <View style={styles.accordionContent}>
                    <View style={styles.fieldRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>NOMBRE (MÁX 20)</Text>
                            {isEditing ? (
                                <TextInput 
                                    style={styles.inputEdit}
                                    value={tempName}
                                    onChangeText={setTempName}
                                    maxLength={20}
                                    autoFocus
                                />
                            ) : (
                                <Text style={styles.valueText}>{user?.username}</Text>
                            )}
                        </View>
                        <TouchableOpacity 
                            onPress={() => isEditing ? handleSaveName() : setIsEditing(true)}
                            style={styles.editIcon}
                        >
                            <MaterialIcons name={isEditing ? "check" : "edit"} size={20} color={isEditing ? colors.success : colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.fieldRow}>
                        <View><Text style={styles.label}>CORREO</Text><Text style={[styles.valueText, { color: colors.textSecondary }]}>{user?.email}</Text></View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.fieldRow}>
                        <View><Text style={styles.label}>MONEDA</Text><Text style={styles.valueText}>Dólar ($)</Text></View>
                    </View>
                </View>
            )}

            <View style={{height: 1, backgroundColor: colors.border, marginLeft: 60}} />

            {/* 2. CONFIGURACIÓN */}
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="settings-outline" size={20} color={colors.text} />
                </View>
                <Text style={styles.menuText}>Configuración</Text>
                <MaterialIcons name="chevron-right" size={24} color={colors.border} />
            </TouchableOpacity>

            <View style={{height: 1, backgroundColor: colors.border, marginLeft: 60}} />

            {/* 3. AYUDA */}
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
                <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.text} />
                </View>
                <Text style={styles.menuText}>Ayuda y Soporte</Text>
                <MaterialIcons name="chevron-right" size={24} color={colors.border} />
            </TouchableOpacity>

            <View style={{height: 1, backgroundColor: colors.border, marginLeft: 60}} />

            {/* 4. CERRAR SESIÓN */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                </View>
                <Text style={[styles.menuText, { color: colors.danger }]}>Cerrar Sesión</Text>
            </TouchableOpacity>

        </View>

        <Text style={styles.version}>GastanGO v1.0.0</Text>
      </ScrollView>

      {/* --- MODAL DE SELECCIÓN DE AVATAR --- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Elige tu Avatar</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
                {/* Usamos FlatList para mostrar la rejilla de iconos.
                   numColumns={4} los organiza en filas de 4.
                */}
                <FlatList
                    data={AVATARS}
                    numColumns={4}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.avatarOption, user?.avatar === item.name && styles.avatarSelected]}
                            onPress={() => handleSelectAvatar(item)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                                {item.lib === 'FontAwesome5' ? (
                                    <FontAwesome5 name={item.name} size={24} color="#fff" />
                                ) : (
                                    <MaterialIcons name={item.name} size={28} color="#fff" />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
  
  // Header
  headerProfile: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { marginBottom: 10, position: 'relative' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: colors.card, elevation: 5 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.text, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: colors.background },
  headerName: { fontSize: 22, fontWeight: 'bold', color: colors.text },

  // Menú
  menuContainer: { backgroundColor: colors.card, borderRadius: 20, paddingVertical: 5, elevation: 2, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemActive: { backgroundColor: colors.background },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.text },

  // Acordeón
  accordionContent: { backgroundColor: colors.background, padding: 20, borderTopWidth: 1, borderTopColor: colors.border },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 11, color: colors.textSecondary, fontWeight: 'bold', marginBottom: 4 },
  valueText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  inputEdit: { fontSize: 16, color: colors.text, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: colors.primary, paddingBottom: 2, minWidth: 150 },
  editIcon: { padding: 8, backgroundColor: colors.card, borderRadius: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

  version: { textAlign: 'center', marginTop: 30, color: colors.textSecondary, fontSize: 12 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, height: '60%', backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  avatarOption: { margin: 8, padding: 2 },
  avatarSelected: { borderWidth: 3, borderColor: colors.primary, borderRadius: 30 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }
});