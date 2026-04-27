const AWS = require('aws-sdk');

// Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

exports.uploadAudio = async (base64Audio, deviceId, timestamp) => {
  return `dummy_audio_${deviceId}_${timestamp}`;
};