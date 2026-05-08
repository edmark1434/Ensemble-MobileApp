import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from "../../firebase";

const provider = new GoogleAuthProvider();
const userCollection = collection(firestore, "users");
async function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { status: 200, user: userCredential.user };
    }catch (error) {
        return { status: 500, error: error.message };
    }
}

async function createUser(data) { 
    try {
        if (!auth) {
            const userCredential = await signUp(data.email, data.password);
        }
        const user = userCredential.user;
        await addDoc(userCollection, {
            uid: user.uid,
            email: user.email,
            firstname: data.firstname,
            lastname: data.lastname,
        });
        return { status: 200, user: user };
    }catch (error) {
        return { status: 500, error: error.message };
    }
}

async function signInOauth() {
    try {
        const result = signInWithRedirect(auth, provider);
        const isExistingUser = await getUserByEmail(result.user.email);
        if (isExistingUser.status === 200) {
            return { status: 200, user: isExistingUser.user };  
        } else {
            const userData = await createUser({
                email: result.user.email,
                firstname: result.user.displayName || "",
                lastname: "",
            });
            return { status: 200, user: userData.user };
        }
    }catch (error) {
        return { status:500, error: error.message };
    }
}

async function getUserByEmail(email) {
    try {
        const q = query(userCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { status: 200, user: userDoc.data() };
        } else {
            return { status: 404, error: "User not found" };
        }
    } catch (error) {
        return { status: 500, error: error.message };
    }
}

export { getUserByEmail, signIn, signInOauth, signUp };

