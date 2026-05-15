import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { firestore, storage } from "../firebase";

const assetsCollection = collection(firestore, "assets");
const purchasesCollection = collection(firestore, "purchases");

// =====================
// UPLOAD IMAGE TO STORAGE
// =====================
export async function uploadAssetImage(uri, fileName) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `asset-images/${Date.now()}_${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject({ status: 500, error: error.message }),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ status: 200, url: downloadURL });
        }
      );
    });
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// CREATE ASSET
// =====================
export async function createAsset(data) {
  try {
    const docRef = await addDoc(assetsCollection, {
      title: data.title,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      category: data.category,
      price: Number(data.price),
      image: data.image || "",
      description: data.description || "",
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      favoritedBy: [],
      comments: [],
      createdAt: serverTimestamp(),
    });
    return { status: 200, id: docRef.id };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// GET ALL ASSETS (buy tab — not owned by current user, not purchased)
// =====================
export async function getAllAssets() {
  try {
    const q = query(assetsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const assets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { status: 200, assets };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// GET MY ASSETS (assets created by current user)
// =====================
export async function getMyAssets(uid) {
  try {
    const q = query(assetsCollection, where("creatorId", "==", uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const assets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { status: 200, assets };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// GET PURCHASED ASSETS (via purchases collection)
// =====================
export async function getPurchasedAssets(uid) {
  try {
    const q = query(purchasesCollection, where("buyerId", "==", uid), orderBy("purchasedAt", "desc"));
    const snapshot = await getDocs(q);
    const assetIds = snapshot.docs.map((d) => d.data().assetId);

    if (assetIds.length === 0) return { status: 200, assets: [] };

    const assetDocs = await Promise.all(
      assetIds.map((id) => getDoc(doc(firestore, "assets", id)))
    );
    const assets = assetDocs
      .filter((d) => d.exists())
      .map((d) => ({ id: d.id, ...d.data() }));

    return { status: 200, assets };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// GET FAVORITED ASSETS
// =====================
export async function getFavoritedAssets(uid) {
  try {
    const q = query(assetsCollection, where("favoritedBy", "array-contains", uid));
    const snapshot = await getDocs(q);
    const assets = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { status: 200, assets };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// TOGGLE FAVORITE
// =====================
export async function toggleFavoriteAsset(assetId, uid, isCurrentlyFavorited) {
  try {
    const assetRef = doc(firestore, "assets", assetId);
    if (isCurrentlyFavorited) {
      await updateDoc(assetRef, { favoritedBy: arrayRemove(uid) });
    } else {
      await updateDoc(assetRef, { favoritedBy: arrayUnion(uid) });
    }
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// PURCHASE ASSET
// =====================
export async function purchaseAsset(assetId, buyerId) {
  try {
    // Check not already purchased
    const existing = await getDocs(
      query(purchasesCollection, where("assetId", "==", assetId), where("buyerId", "==", buyerId))
    );
    if (!existing.empty) return { status: 409, error: "Already purchased" };

    await addDoc(purchasesCollection, {
      assetId,
      buyerId,
      purchasedAt: serverTimestamp(),
    });

    // Increment download count
    await updateDoc(doc(firestore, "assets", assetId), {
      downloads: increment(1),
    });

    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// CHECK IF PURCHASED
// =====================
export async function checkIfPurchased(assetId, uid) {
  try {
    const q = query(
      purchasesCollection,
      where("assetId", "==", assetId),
      where("buyerId", "==", uid)
    );
    const snapshot = await getDocs(q);
    return { status: 200, purchased: !snapshot.empty };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// ADD COMMENT
// =====================
export async function addCommentToAsset(assetId, comment) {
  try {
    const assetRef = doc(firestore, "assets", assetId);
    await updateDoc(assetRef, {
      comments: arrayUnion(comment),
    });
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// UPDATE ASSET
// =====================
export async function updateAsset(assetId, data) {
  try {
    const assetRef = doc(firestore, "assets", assetId);
    await updateDoc(assetRef, data);
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
// DELETE ASSET
// =====================
export async function deleteAsset(assetId) {
  try {
    await deleteDoc(doc(firestore, "assets", assetId));
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}
