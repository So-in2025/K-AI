import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '/src/services/firebase.ts';
import { User, IUserProfile } from '/src/types.ts';

export const createUserProfileDocument = async (userAuth: User): Promise<void> => {
    const userDocRef = doc(db, 'users', userAuth.uid);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) {
        const { uid, email, displayName, photoURL } = userAuth;
        const createdAt = serverTimestamp();
        const initialProfile: IUserProfile = {
            uid,
            email,
            displayName,
            photoURL,
            createdAt,
            // Add a welcome message from Kai for new users
            kaiConversation: [{ role: 'model', text: 'Hola, soy Kai. Estoy aquí para escucharte y apoyarte en tu camino. ¿Cómo te sientes hoy?' }]
        };

        try {
            await setDoc(userDocRef, initialProfile);
        } catch (error) {
            console.error("Error creating user profile", error);
        }
    }
};

export const getUserProfile = async (uid: string): Promise<IUserProfile | null> => {
    const userDocRef = doc(db, 'users', uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as IUserProfile;
        } else {
            console.warn("No such user profile!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<IUserProfile>): Promise<void> => {
    const userDocRef = doc(db, 'users', uid);
    try {
        // Use setDoc with merge: true to handle both creation and update, which is more robust
        await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
};