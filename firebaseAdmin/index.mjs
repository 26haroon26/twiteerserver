import admin from 'firebase-admin';

var serviceAccount ={
    "type": "service_account",
    "project_id": "mern-storage-bucket",
    "private_key_id": "2ef5f9b336b6175c87ce450ad0c8bdb55c62aae6",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWLCcmx+ShYe83\nkSgu9NYmf7egb7IJwXGEf1agLQGH+WgBoggaKbGl1SIef+YGeDMkWLDdJtl6sMLF\nW229u2A/OM5V2KtYJXPUVmn4tz/m33h2UF9SUc2/c3iYwEBy4+Ef2XqwUiwZFp6T\nvGaJbkxMyDj9VaP2PpwrCBoopuCeOlJkQxxYmfGjzp+PrpPdQYvtMAuuOjPPVZJw\nkwFRR49PSxc5oTCisoBLUtFetIDdAkXCBMADzxU+EDDF7EhtY0B+ce3PqHEPGDxJ\nVdO5ihP07/oNYiISat4zNt1IHEbOhWa8HOREH0bYnl/Z8TPiHa47uOQJrsOi6RPA\nwImPVjjrAgMBAAECggEASRVFAOdKPcW5Bymp4CgdIYMIip9CzjBsB64aRctFz/wM\nAS6k/CSJIdESdPzo5gFDVl5LcBPPN540wHrb/lf/1mMQidvHUGtrVKRuQfhqPmK4\nbQstE96lSnThTKKh+3KGgkNIqf1IXgFJeJlcFf6E29ihFdWQ/zjLOqXno0KauHMH\nR9/jAq1OhjdEP8j3ZC878WJBQ12E/DV1NPLYT28K9oEiuvaWNK+kvEpdxGCwbGdY\nrMFMg6GGIV26ST2HH9IzwcL+S6qm+tYuqY4zrbiH0qvVUtaeIaM7F+jDlP03lX/e\nSeP04i4yaI/d0VTLi+NTETAjVHDumor0Qld3LVKXJQKBgQD5NLkoEU0dqdY9A8Pt\nxSizuYpp7ERmzXQzQZbgE/McMWvDJP5x+SsCxWR9oUL/shW9VMDSCOFOo7PgxACx\n6ASGCfxnOBbNElG168EidZNrD6AFOjuSIFE2zgPiI0HNAwtRlC00rpEWXn4DOLSI\nwN9jwbB2EkxDzaPNvX0r6f2DTwKBgQDcAuvhfLcHAI9+kxGStN7+maDIQ8YwEyHJ\nS24+h6Kv2XIKAp05q8TXtfw5L3VOrENXkCyIvGu6AyT2pSX7WBkmtjQO9I4osIGq\nAm2abGYALDzPmLIwrdGwMlXE7VBUbzCd5VbYWheGw2WecYGpjEybL2lu4ZeLlvT8\nI/K4Sww5pQKBgQCJr4CRS6XQutI8WcU5rFHFosB/r2NHbUJDQ3zJhxwtunxwkBLp\nA6Ko4EiaRKvQvCLYvWffY7qgCUBL8d70bF17dS74FHw8h1+P5JaLpGxznWlrGfZp\n0OMuJXrtyU8EpybsxrKHRd+xfTmgLAdK+00xP4VwZsGuQIK9HHF4/snrbwKBgFFq\nU1eyCxjwQCmaytn7TLnyp+j0C5cmvU38N+Oz1aQ1V1oU9ZGt2r3oflm7EjH21UTF\n+XTwJP1ExJzxKEkGpOgKbOFL5n9wMctz8pM+odBWjnpUCzywVfRZ7BtfpmZYbyk/\nARA25pXcIPKtFkpjvMWAmgeKO8ZQKoBT3TINs4xxAoGAJGSSwNwP/zL7+9/V3UBX\nEN2vUSOZy0VLFlXUbZM1SFBGG2hqF+RohrmwY+lyKWSJAeDvOIg0s/cGigf+luRB\nDnRq7TN/CnX5p3/C00BpfCpFRZrflEujMYce+7l+0nMTsSCM9jlw/nXoygQSl1kF\naG2gxvAtZD2Q3RRRX055hUc=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xh28u@mern-storage-bucket.iam.gserviceaccount.com",
    "client_id": "117609177360247999996",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xh28u%40mern-storage-bucket.iam.gserviceaccount.com"
  }
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mern-storage-bucket.firebaseio.com"
});
const bucket = admin.storage().bucket("gs://mern-storage-bucket.appspot.com");

export default bucket;