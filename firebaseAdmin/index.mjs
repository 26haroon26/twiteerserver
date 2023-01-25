import admin from 'firebase-admin';
const {PRIVATE_KEY} = JSON.parse(process.env.PRIVATE_KEY)

var serviceAccount ={
    "type": "service_account",
    "project_id": `${process.env.PROJECT_ID}`,
    "private_key_id": `${process.env.PRIVATE_KEY_ID}`,
    "private_key": `${PRIVATE_KEY}`,
    "client_email": `firebase-adminsdk-xh28u@${process.env.PROJECT_ID}.iam.gserviceaccount.com`,
    "client_id": `${process.env.CLIENT_ID}`,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xh28u%40${process.env.projectID}.iam.gserviceaccount.com`
  }
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
});
const bucket = admin.storage().bucket(`gs://${process.env.PROJECT_ID}.appspot.com`);

export default bucket;