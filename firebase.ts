import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import { ApplicationFormData, CandidateApplication } from '../types';

// Dedicated Firebase project for applicant forms ONLY. Paste the new project's web keys here
// after creating it in the Firebase console. Until then, Firestore calls throw and the UI
// gracefully falls back to the REST endpoint (/api/applications), so nothing breaks.
export const firebaseConfig = {
  projectId: 'apathy-applications',
  appId: '1:690564876879:web:f5acb60ede4134d51b383a',
  apiKey: 'AIzaSyBqNhmbWvLJ-zAB4JPUWuyhEr6IAjn-7mE',
  authDomain: 'apathy-applications.firebaseapp.com',
  firestoreDatabaseId: '(default)',
  storageBucket: 'apathy-applications.firebasestorage.app',
  messagingSenderId: '690564876879',
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Shared with the staff portal (github.com/default5728/ac) — same dedicated applications project.
// The document shape is enforced by that project's firestore.rules, so every key must be present.
export const APPLICATIONS_COLLECTION = 'applications';
const APPLICATION_SOURCE = 'public_ac2_site';

export function validateApplication(data: ApplicationFormData): string | null {
  const nick = data.nick.trim();
  const cid = data.cid.trim();
  const phone = data.phone.trim();
  const discord = data.discord.trim();
  const docs = data.docs.trim();

  if (nick.length < 2 || nick.length > 64) return 'Ник должен быть от 2 до 64 символов';
  if (!/^[A-Za-zА-Яа-яЁё0-9_.\- ]+$/.test(nick))
    return 'Ник может содержать только буквы, цифры, пробел и символы _ . -';
  if (!/^[A-Za-z0-9]{1,32}$/.test(cid)) return 'CID должен состоять из букв и цифр (до 32 символов)';
  if (!/^[0-9\-+ ]{1,64}$/.test(phone)) return 'Телефон может содержать только цифры и символы - + пробел';
  if (discord.length < 2 || discord.length > 64) return 'Discord должен быть от 2 до 64 символов';
  if (!/^https:\/\/\S{8,290}$/.test(docs)) return 'Ссылка на скрин документов должна начинаться с https://';
  return null;
}

export async function submitApplicationToFirestore(
  data: ApplicationFormData
): Promise<CandidateApplication> {
  const ref = doc(collection(db, APPLICATIONS_COLLECTION));
  const record: CandidateApplication = {
    id: ref.id,
    nick: data.nick.trim().slice(0, 64),
    cid: data.cid.trim().toUpperCase().slice(0, 32),
    phone: data.phone.trim().slice(0, 64),
    discord: data.discord.trim().slice(0, 64),
    docs: data.docs.trim().slice(0, 300),
    status: 'pending',
    submittedAt: new Date().toISOString(),
    source: APPLICATION_SOURCE,
    reviewedAt: '',
    reviewerNotes: '',
    createdProfileId: '',
  };

  await setDoc(ref, record);
  return record;
}

export async function fetchApplicationsFromFirestore(): Promise<CandidateApplication[]> {
  const snap = await getDocs(
    query(collection(db, APPLICATIONS_COLLECTION), where('submittedAt', '>=', '0'))
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: String(data.id || d.id),
        nick: String(data.nick || ''),
        cid: String(data.cid || ''),
        phone: String(data.phone || ''),
        discord: String(data.discord || ''),
        docs: String(data.docs || ''),
        status: (data.status as CandidateApplication['status']) || 'pending',
        submittedAt: String(data.submittedAt || ''),
        source: String(data.source || ''),
        reviewedAt: String(data.reviewedAt || ''),
        reviewerNotes: String(data.reviewerNotes || ''),
        createdProfileId: String(data.createdProfileId || ''),
      };
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
