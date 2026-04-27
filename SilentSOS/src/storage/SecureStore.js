import * as SecureStore from 'expo-secure-store';

class SecureStoreService {

  async saveSettings(settings) {
    try {
      await SecureStore.setItemAsync('SETTINGS', JSON.stringify(settings));
    } catch (e) {
      console.log('Error saving', e);
    }
  }

  async getSettings() {
    try {
      const data = await SecureStore.getItemAsync('SETTINGS');
      if (data) return JSON.parse(data);
      return {};
    } catch (e) {
      console.log('Error getting settings', e);
      return {};
    }
  }

  async getDeviceId() {
    try {
      let id = await SecureStore.getItemAsync('DEVICE_ID');

      if (!id) {
        id = 'd_' + Math.random().toString(36).substring(2, 10);
        await SecureStore.setItemAsync('DEVICE_ID', id);
      }

      return id;
    } catch (e) {
      console.log('Device ID error', e);
      return 'd_error';
    }
  }
}

export default new SecureStoreService();