import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { auth, firestore } from "../firebase";

const userCollection = collection(firestore, "users");


// =====================
// SIGN UP (AUTH ONLY)
// =====================
async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}


// =====================
// SIGN IN (EMAIL/PASS)
// =====================
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      status: 200,
      user: userCredential.user,
    };

  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };
  }
}


// =====================
// CREATE FIRESTORE USER (SAFE)
// =====================
async function createUser(data) {
  try {

    await setDoc(doc(firestore, "users", data.uid), {
      uid: data.uid,
      email: data.email,
      fullName: data.fullName,
      username: data.username || "",
      bio: data.bio || "",
      createdAt: new Date(),
    });

    return { status: 200 };

  } catch (error) {
    console.log("CREATE USER ERROR:", error);

    return {
      status: 500,
      error: error.message,
    };
  }
}


// =====================
// GOOGLE + EMAIL SAFE FLOW
// =====================
async function signInOauth(userInfo) {
    try {
    const user = userInfo.user;
    const email = user.email;
    const existingUser = await getUserByEmail(email);

    // IF NOT EXIST → CREATE FIRESTORE USER
    if (existingUser.status === 404) {

      const userData = {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName,
        username: user.displayName ? user.displayName.split(' ')[0].toLowerCase() : "",
        bio: "",
      };

      await createUser(userData);
    }

    return {
      status: 200,
      user,
    };

  } catch (error) {
    console.log("GOOGLE AUTH ERROR:", error);

    return {
      status: 500,
      error: error.message,
    };
  }
}

async function getUserByUsername(username) {
    try {
        const q = query(
            userCollection,
            where("username", "==", username)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return {
                status: 200,
                user: snapshot.docs[0].data(),
            };
        }

        return {
            status: 404,
            error: "User not found",
        };
    } catch (error) {
        return {
            status: 500,
            error: error.message,
        };
    }
}

// =====================
// CHECK USER BY EMAIL
// =====================
async function getUserByEmail(email) {
  try {

    const q = query(
      userCollection,
      where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

      return {
        status: 200,
        user: snapshot.docs[0].data(),
      };
    }

    return {
      status: 404,
      error: "User not found",
    };

  } catch (error) {

    return {
      status: 500,
      error: error.message,
    };
  }
}

// =====================
// GET USER BY ID
// =====================
async function getUserById(uid) {
  try {
    const userDoc = await getDoc(doc(firestore, "users", uid));
    if (userDoc.exists()) {
      return {
        status: 200,
        user: userDoc.data(),
      };
    }
    return {
      status: 404,
      error: "User not found",
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };
  }
}

// =====================
// UPDATE USER
// =====================
async function updateUser(uid, data) {
  try {
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, data);
    return { status: 200 };
  } catch (error) {
    return {
      status: 500,
      error: error.message,
    };
  }
}


// =====================
// SIGN OUT
// =====================
async function signOutUser() {
  try {
    await signOut(auth);
    return { status: 200 };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// =====================
export {
  signUp,
  signIn,
  createUser,
  signInOauth,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  updateUser,
  signOutUser,
};