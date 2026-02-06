import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configuración de cómo se ven las alertas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    // Verificación rápida para Web
    if (Platform.OS === 'web') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  } catch (error) {
    console.log("Error en notificaciones (probablemente por Expo Go):", error);
    // Retornamos true falsamente para que la app no se rompa, 
    // pero avisamos en consola que no funcionará full en Expo Go
    return false;
  }
}

export async function scheduleDailyNotifications() {
  try {
    // Cancelamos las anteriores para no duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    const schedules = [
      { hour: 11, minute: 30, title: "🌞 ¡Buenos días!", body: "¿Ya registraste tus gastos de la mañana?" },
      { hour: 19, minute: 30, title: "🌆 Cierra el día", body: "No olvides anotar tus gastos de la tarde." },
      { hour: 23, minute: 30, title: "🌙 Buenas noches", body: "Revisa tu balance antes de dormir." },
    ];

    for (const item of schedules) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          sound: true,
        },
        trigger: {
          hour: item.hour,
          minute: item.minute,
          repeats: true, 
        },
      });
    }
    console.log("Notificaciones programadas exitosamente");
  } catch (error) {
    console.log("No se pudieron programar las notificaciones:", error);
  }
}

export async function cancelNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Notificaciones desactivadas");
  } catch (error) {
    console.log("Error cancelando notificaciones:", error);
  }
}