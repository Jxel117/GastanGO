import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

export default function HelpScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const colors = theme.colors;
  const styles = getStyles(colors);

  const TutorialStep = ({ icon, title, desc }) => (
    <View style={styles.stepContainer}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER FIJO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
        <View style={{width: 40}} />
      </View>

      {/* SCROLLVIEW CON FLEX 1 PARA OCUPAR TODO EL ESPACIO RESTANTE */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        
        <Text style={styles.sectionTitle}>¿CÓMO USAR GASTANGO?</Text>
        
        <View style={styles.card}>
            <TutorialStep 
                icon="dashboard" 
                title="1. Tu Panel Principal" 
                desc="Aquí verás tu balance actual. El resumen verde muestra lo que entra y el rojo lo que gastas."
            />
            <View style={styles.divider} />
            <TutorialStep 
                icon="add-circle" 
                title="2. Registra Movimientos" 
                desc="Pulsa el botón 'Registrar Movimiento' en el inicio para añadir un Ingreso o un Gasto rápidamente."
            />
            <View style={styles.divider} />
            <TutorialStep 
                icon="pie-chart" 
                title="3. Analiza tus Reportes" 
                desc="Ve a la pestaña 'Reportes' para ver gráficos y descargar tu historial en PDF."
            />
            <View style={styles.divider} />
            <TutorialStep 
                icon="account-balance-wallet" 
                title="4. Controla tu Presupuesto" 
                desc="La pestaña 'Presupuesto' te avisa si estás gastando más del 70% de tus ingresos."
            />
            
            {/* NUEVO PASO AGREGADO */}
            <View style={styles.divider} />
            <TutorialStep 
                icon="volume-up" 
                title="5. Asistente de Voz" 
                desc="Pulsa el icono del parlante que está arriba a la izquierda en el Inicio para que la App te lea tu balance en voz alta."
            />
        </View>

        <Text style={styles.sectionTitle}>SOBRE NOSOTROS</Text>
        
        <View style={styles.card}>
            <Text style={styles.creditTitle}>Equipo de Desarrollo</Text>
            <Text style={styles.creditText}>
                Esta aplicación fue desarrollada con mucha dedicación por estudiantes de Computación de la Universidad Nacional de Loja (UNL).
            </Text>
            
            <View style={styles.devRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>JT</Text></View>
                <View>
                    <Text style={styles.devName}>Joel Tapia</Text>
                    <Text style={styles.devEmail}>stalin.tapia@unl.edu.ec</Text>
                </View>
            </View>

            <View style={styles.devRow}>
                <View style={[styles.avatar, {backgroundColor: '#10B981'}]}><Text style={styles.avatarText}>FM</Text></View>
                <View>
                    <Text style={styles.devName}>Freddy Matailo</Text>
                    <Text style={styles.devEmail}>freddy.matailo@unl.edu.ec</Text>
                </View>
            </View>

            <Text style={styles.version}>GastanGO v1.0.0</Text>
        </View>

        {/* ESPACIO FINAL PARA QUE EL SCROLL NO SE CORTE EN WEB/MÓVIL */}
        <View style={{ height: 120 }} />

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
  backBtn: { padding: 8, backgroundColor: colors.card, borderRadius: 12, elevation: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  
  // Padding normal, el View del final se encarga del espacio extra
  content: { paddingHorizontal: 20 },
  
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textSecondary, marginBottom: 15, marginTop: 10, letterSpacing: 1 },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, elevation: 2, marginBottom: 20 },
  
  stepContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 10 },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1, justifyContent: 'center' },
  stepTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10, marginLeft: 65 },

  creditTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  creditText: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  devRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  devName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  devEmail: { fontSize: 14, color: colors.textSecondary },
  version: { textAlign: 'center', color: colors.textSecondary, marginTop: 10, fontSize: 12 }
});