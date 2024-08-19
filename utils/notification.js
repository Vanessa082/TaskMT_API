import { Notification } from 'node-notifier'; // Assuming you're using node-notifier for desktop notifications

// Function to send a notification
const sendNotification = (title, message) => {
  new Notification({
    title: title,
    message: message,
    sound: true, 
    wait: true
  }).show();
};

// Export the notification functions
export const notifyTaskCreated = (task) => {
  sendNotification('Task Created', `A new task "${task.title}" has been created.`);
};

export const notifyTaskUpdated = (task) => {
  sendNotification('Task Updated', `The task "${task.title}" has been updated.`);
};

export const notifyTaskDeleted = (task) => {
  sendNotification('Task Deleted', `The task "${task.title}" has been deleted.`);
};
