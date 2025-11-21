
import { Session } from '../types';

const DB_NAME = 'stoffhaus-app-db';
const DB_VERSION = 3; 
const STORE_NAME = 'sessions';

let db: IDBDatabase;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Database error: ' + request.error);
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      let store: IDBObjectStore;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        store = (event.target as any).transaction.objectStore(STORE_NAME);
      }
      
      if (event.oldVersion < 2) {
          store.createIndex('sessionName', 'name', { unique: false });
          store.createIndex('customerName', 'customerData.name', { unique: false });
          store.createIndex('customerEmail', 'customerData.email', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (event.oldVersion < 3) {
          // Fix: The old index pointed to 'customerData.name'. The new type is 'customerData.customerName'.
          if (store.indexNames.contains('customerName')) {
              store.deleteIndex('customerName');
          }
          store.createIndex('customerName', 'customerData.customerName', { unique: false });
      }
    };
  });
};

export const saveSession = async (session: Session): Promise<void> => {
  const db = await openDB();
  const sessionWithTimestamp = { ...session, updatedAt: new Date() };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(sessionWithTimestamp);
    
    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Save session error:', request.error);
        reject(request.error)
    };
  });
};

export const getSession = async (id: string): Promise<Session | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => {
        console.error('Get session error:', request.error);
        reject(request.error);
    };
  });
};

export const getAllSessions = async (): Promise<Session[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('updatedAt');
        const results: Session[] = [];
        
        const cursorRequest = index.openCursor(null, 'prev'); // sort by updatedAt descending

        cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                resolve(results);
            }
        };
        cursorRequest.onerror = () => {
             console.error('Get all sessions error:', cursorRequest.error);
             reject(cursorRequest.error);
        }
    });
};

const queryIndex = (indexName: string, range: IDBKeyRange): Promise<Session[]> => {
    return openDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index(indexName);
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }));
};


export const searchSessions = async (query: string): Promise<Session[]> => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return getAllSessions();
    }
    
    // For case-insensitive search, one would typically store a normalized/lowercase version of the fields.
    // For simplicity here, we'll do a prefix search.
    const range = IDBKeyRange.bound(normalizedQuery, normalizedQuery + '\uffff');

    try {
        const namePromise = queryIndex('sessionName', range);
        const customerNamePromise = queryIndex('customerName', range);
        const customerEmailPromise = queryIndex('customerEmail', range);

        const [nameResults, customerNameResults, customerEmailResults] = await Promise.all([
            namePromise,
            customerNamePromise,
            customerEmailPromise
        ]);

        const combinedResults = new Map<string, Session>();
        
        const processResults = (results: Session[]) => {
            results.forEach(session => {
                // Manual filtering for case-insensitivity as IndexedDB standard range queries are case-sensitive
                const sessionNameMatch = session.name.toLowerCase().includes(normalizedQuery);
                const customerNameMatch = session.customerData?.customerName?.toLowerCase().includes(normalizedQuery);
                const customerEmailMatch = session.customerData?.email?.toLowerCase().includes(normalizedQuery);

                if(sessionNameMatch || customerNameMatch || customerEmailMatch) {
                    combinedResults.set(session.id, session);
                }
            });
        };
        
        processResults(nameResults);
        processResults(customerNameResults);
        processResults(customerEmailResults);


        const uniqueResults = Array.from(combinedResults.values());
        
        uniqueResults.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return uniqueResults;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
};
