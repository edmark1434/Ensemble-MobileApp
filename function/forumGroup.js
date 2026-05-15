import { addDoc, arrayUnion, collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const forumGroupsCollection = collection(firestore, 'forumGroups');

async function createForumGroup(data) {
    try {
        const docRef = await addDoc(forumGroupsCollection, data);
        return {status:200, id: docRef.id, message: 'Forum group created successfully'};
    } catch (error) {
        throw error;
    }
}

async function getAllForumGroups() { 
    try {
        const forumGroupsSnapshot = await getDocs(forumGroupsCollection);
        const forumGroups = forumGroupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {status:200, data: forumGroups};
    } catch (error) {
        throw error;
    }
}


export { createForumGroup, getAllForumGroups };

async function addMemberToGroup(groupId, member) {
    try {
        const groupRef = doc(firestore, 'forumGroups', groupId);
        await updateDoc(groupRef, {
            members: arrayUnion(member)
        });
        return { status: 200, message: 'Member added' };
    } catch (error) {
        throw error;
    }
}

async function deleteForumGroup(groupId) {
    try {
        const groupRef = doc(firestore, 'forumGroups', groupId);
        await deleteDoc(groupRef);
        return { status: 200, message: 'Group deleted' };
    } catch (error) {
        throw error;
    }
}

async function updateForumGroup(groupId, data) {
    try {
        const groupRef = doc(firestore, 'forumGroups', groupId);
        await updateDoc(groupRef, data);
        return { status: 200, message: 'Group updated' };
    } catch (error) {
        throw error;
    }
}

export { addMemberToGroup, deleteForumGroup, updateForumGroup };
