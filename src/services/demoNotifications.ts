export interface DemoNotification {
  id: string;
  type: 'collaboration_accepted' | 'tip_received';
  title: string;
  message: string;
  delay: number; // seconds
  executed: boolean;
}

class DemoNotificationService {
  private demoNotifications: Map<string, DemoNotification[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // Schedule demo notifications for collaboration flow
  scheduleCollaborationDemo(
    requestId: string,
    ideaTitle: string,
    ideaOwnerName: string,
    tipAmount: number = 25
  ) {
    const notifications: DemoNotification[] = [
      {
        id: `demo_accept_${requestId}`,
        type: 'collaboration_accepted',
        title: '🎉 Collaboration Accepted!',
        message: `${ideaOwnerName} accepted your collaboration request for "${ideaTitle}"`,
        delay: 5, // 45 seconds
        executed: false
      },
      {
        id: `demo_tip_${requestId}`,
        type: 'tip_received',
        title: '💝 Tip Received!',
        message: `${ideaOwnerName} accepted your $${tipAmount} tip for the collaboration!`,
        delay: 10, // 5 seconds after acceptance
        executed: false
      }
    ];

    this.demoNotifications.set(requestId, notifications);

    // Schedule the notifications
    notifications.forEach(notification => {
      const timeout = setTimeout(() => {
        this.executeNotification(requestId, notification);
      }, notification.delay * 1000);

      this.timeouts.set(notification.id, timeout);
    });

    console.log(`📅 Demo notifications scheduled for request ${requestId}`);
  }

  private executeNotification(requestId: string, notification: DemoNotification) {
    if (notification.executed) return;

    // Mark as executed
    notification.executed = true;

    // Create browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/Logo.png',
        badge: '/Logo.png'
      });
    }

    // Create in-app notification
    this.createInAppNotification(notification);

    // Clean up timeout
    this.timeouts.delete(notification.id);

    console.log(`✅ Demo notification executed: ${notification.title}`);
  }

  private createInAppNotification(notification: DemoNotification) {
    // Create a toast-style notification
    const toast = document.createElement('div');
    toast.className = `
      fixed top-24 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm
      transform translate-x-full transition-transform duration-300 ease-out
    `;
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          ${notification.type === 'collaboration_accepted' ? '🎉' : '💝'}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-gray-800 text-sm">${notification.title}</h4>
          <p class="text-gray-600 text-xs mt-1">${notification.message}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="this.parentElement.parentElement.remove()">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 5000);
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Cancel all scheduled notifications for a request
  cancelNotifications(requestId: string) {
    const notifications = this.demoNotifications.get(requestId);
    if (notifications) {
      notifications.forEach(notification => {
        const timeout = this.timeouts.get(notification.id);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(notification.id);
        }
      });
      this.demoNotifications.delete(requestId);
    }
  }

  // Get pending notifications for a request
  getPendingNotifications(requestId: string): DemoNotification[] {
    const notifications = this.demoNotifications.get(requestId) || [];
    return notifications.filter(n => !n.executed);
  }

  // Check if demo is active for a request
  isDemoActive(requestId: string): boolean {
    return this.demoNotifications.has(requestId);
  }
}

export const demoNotificationService = new DemoNotificationService();