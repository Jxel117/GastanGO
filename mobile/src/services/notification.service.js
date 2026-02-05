import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de cómo se ven las alertas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return false;
  }
  return true;
}

export async function scheduleDailyNotifications() {
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
        repeats: true, // Se repite todos los días
      },
    });
  }
  
  console.log("Notificaciones programadas exitosamente");
}

export async function cancelNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Notificaciones desactivadas");
}