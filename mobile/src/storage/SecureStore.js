import EncryptedStorage from 'react-native-encrypted-storage';

class SecureStoreService {
  async saveSettings(settings) {
    try {
      await EncryptedStorage.setItem('SETTINGS', JSON.stringify(settings));
    } catch (e) {
      console.log('Error saving', e);
    }
  }

  async getSettings() {
    try {
      const data = await EncryptedStorage.getItem('SETTINGS');
      if (data) return JSON.parse(data);
      return {};
    } catch (e) {
      return {};
    }
  }

  async getDeviceId() {
    try {
      let id = await EncryptedStorage.getItem('DEVICE_ID');
      if (!id) {
        id = 'd_' + Math.random().toString(36).substring(7);
        await EncryptedStorage.setItem('DEVICE_ID', id);
      }
      return id;
    } catch (e) {
      return 'd_error';
    }
  }
}

export default new SecureStoreService();
