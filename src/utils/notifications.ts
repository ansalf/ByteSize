// Sistem Pengelola Notifikasi Browser / OS (HP & Laptop) untuk ByteSize Ramah Anak

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
}

class NotificationService {
  private reminderTimerId: number | null = null;

  // Cek apakah browser HP / Laptop mendukung Web Notification API
  public getStatus(): NotificationStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { isSupported: false, permission: 'denied' };
    }
    return {
      isSupported: true,
      permission: Notification.permission,
    };
  }

  // Minta izin ke orang tua / anak untuk menyalakan notifikasi sistem
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Beri sambutan hangat dengan notifikasi percobaan pertama
        this.sendSystemNotification(
          '🔔 Notifikasi ByteSize Aktif!',
          'Hore! Sekarang robot Byte akan mengingatkanmu menjawab kuis koding setiap hari agar streak apimu tidak padam! 🔥',
          'streak_activated'
        );
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Gagal meminta izin notifikasi browser:', e);
      return false;
    }
  }

  // Mengirim notifikasi asli sistem operasi (muncul di lockscreen HP atau pojok laptop)
  public sendSystemNotification(title: string, body: string, tag: string = 'bytesize_reminder'): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(title, {
        body,
        tag,
        icon: 'https://api.iconify.design/noto:rocket.svg', // Icon roket ramah anak
        badge: 'https://api.iconify.design/noto:fire.svg', // Badge api TikTok
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      // Fallback untuk perangkat mobile tertentu yang hanya mendukung via ServiceWorker
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            tag,
            icon: 'https://api.iconify.design/noto:rocket.svg',
            badge: 'https://api.iconify.design/noto:fire.svg',
          });
        });
      }
    }
  }

  // Cek jadwal pengingat kuis harian saat website aktif di background tab
  public startBackgroundReminderCheck(playerName: string, currentStreakParam?: number, lastCompletedDateParam?: string): void {
    if (this.reminderTimerId) {
      clearInterval(this.reminderTimerId);
    }

    // Periksa setiap 1 jam apakah kuis hari ini sudah dikerjakan
    const checkAndNotify = () => {
      const todayDateString = new Date().toISOString().split('T')[0];
      const lastCompletedDate = lastCompletedDateParam || localStorage.getItem(`bytesize_daily_date_${playerName}`);
      const isCompleted = lastCompletedDate === todayDateString;
      const currentStreak = currentStreakParam !== undefined 
        ? currentStreakParam 
        : parseInt(localStorage.getItem(`bytesize_daily_streak_${playerName}`) || '1', 10);

      // Jika belum dikerjakan dan sudah diizinkan notifikasi
      if (!isCompleted && this.getStatus().permission === 'granted') {
        const currentHour = new Date().getHours();
        // Kirim pengingat ramah anak di siang/sore hari (pukul 12:00 - 20:00)
        if (currentHour >= 12 && currentHour <= 20) {
          this.sendSystemNotification(
            `🔥 Jangan Biarkan Streak Padam, ${playerName}!`,
            `Kuis koding 1 menit hari ini belum selesai! Jawab 1 tebakan logika sekarang untuk raih +25 Koin & jaga streak ${currentStreak} hari!`,
            'daily_quiz_reminder'
          );
        }
      }
    };

    // Jalankan sekali saat load, lalu interval
    checkAndNotify();
    this.reminderTimerId = window.setInterval(checkAndNotify, 1000 * 60 * 60); // tiap 1 jam
  }
}

export const notifications = new NotificationService();
