import {apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId} from '$env/static/private'

export async function load() {
    return {
        firebaseCredentials : {
            apiKey,
            authDomain,
            projectId,
            storageBucket, 
            messagingSenderId,
            appId
        }
    }
  }