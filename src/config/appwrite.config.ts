import { Client, Storage } from 'node-appwrite'
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from './env.config';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT) 
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY); 
  
const storage = new Storage(client);

export default storage