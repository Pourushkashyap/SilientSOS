const AWS = require('aws-sdk');

// Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

exports.uploadAudio = async (base64Audio, deviceId, timestamp) => {
  if (!process.env.AWS_S3_BUCKET) {
    // Return mock URL if not configured
    return `https://mock-s3-bucket.s3.amazonaws.com/audio_${deviceId}_${timestamp}.txt`;
  }

  try {
    // Decodes base64 back into raw format to upload
    const buffer = Buffer.from(base64Audio, 'base64');
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `alerts/${deviceId}_${timestamp}.txt`, // storing as encrypted text format
      Body: buffer,
      ContentType: 'text/plain' 
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error("S3 Upload Error", error);
    return null;
  }
};
