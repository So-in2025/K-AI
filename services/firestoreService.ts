
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { User, IUserProfile } from "../types";

export const createUserProfileDocument = async (userAuth: User, additionalData?: object): Promise<void> => {
    const userRef = doc(db, 'users', userAuth.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { uid, email, displayName, photoURL } = userAuth;
        const createdAt = serverTimestamp();
        
        const initialProfile: Partial<IUserProfile> = {
            uid,
            email,
            displayName,
            photoURL,
            createdAt,
            gardenGrowthPoints: 0,
            isSubscribed: false,
            cravings: [],
            wellnessLog: [],
            reminders: [],
            thoughtLabEntries: [],
            dopamineHits: [],
            habitLoops: [],
            therapySessions: [],
            kaiConversation: [],
            ...additionalData,
        };

        try {
            await setDoc(userRef, initialProfile, { merge: true });
        } catch (error) {
            console.error("Error creating user profile", error);
        }
    }
};

export const getUserProfile = async (uid: string): Promise<IUserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        return snapshot.data() as IUserProfile;
    } else {
        console.error("No such user profile!");
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<IUserProfile>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    try {
        await setDoc(userRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile", error);
    }
};
