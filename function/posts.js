import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";

const jobsCollection = collection(firestore, "jobs");
const gigsCollection = collection(firestore, "gigs");


// =====================
// CREATE JOB POST
// =====================
export async function createJobPost(data) {
  try {
    const ref = await addDoc(jobsCollection, {
      ...data,
      proposals: 0,
      createdAt: serverTimestamp(),
    });
    return { status: 200, id: ref.id };
  } catch (error) {
    console.log("CREATE JOB ERROR:", error);
    return { status: 500, error: error.message };
  }
}


// =====================
// GET ALL JOBS
// =====================
export async function getAllJobs() {
  try {
    const q = query(jobsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter(j => !j.archived);
    return { status: 200, jobs };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// GET MY JOB POSTS
// =====================
export async function getMyJobs(uid) {
  try {
    const res = await getAllJobs();
    if (res.status !== 200) return res;
    return { status: 200, jobs: res.jobs.filter(j => j.postedByUid === uid) };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// CREATE GIG POST
// =====================
export async function createGigPost(data) {
  try {
    const ref = await addDoc(gigsCollection, {
      ...data,
      totalSales: 0,
      rating: 0,
      createdAt: serverTimestamp(),
    });
    return { status: 200, id: ref.id };
  } catch (error) {
    console.log("CREATE GIG ERROR:", error);
    return { status: 500, error: error.message };
  }
}


// =====================
// GET ALL GIGS
// =====================
export async function getAllGigs() {
  try {
    const q = query(gigsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const gigs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter(g => !g.archived);
    return { status: 200, gigs };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// GET MY GIGS
// =====================
export async function getMyGigs(uid) {
  try {
    const res = await getAllGigs();
    if (res.status !== 200) return res;
    return { status: 200, gigs: res.gigs.filter(g => g.sellerUid === uid) };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// UPDATE JOB POST
// =====================
export async function updateJobPost(id, data) {
  try {
    await updateDoc(doc(firestore, 'jobs', id), data);
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// UPDATE GIG POST
// =====================
export async function updateGigPost(id, data) {
  try {
    await updateDoc(doc(firestore, 'gigs', id), data);
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}


// =====================
// ARCHIVE (soft delete) — marks archived:true
// =====================
export async function archivePost(collectionName, id) {
  try {
    await updateDoc(doc(firestore, collectionName, id), { archived: true });
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}
