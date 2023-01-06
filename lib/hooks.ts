import { auth, firestore } from "../lib/firebase";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

// Custom hook to read  auth record and user profile doc
export function useUserData() {
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState<string>();

    useEffect(() => {
        // turn off realtime subscription
        let unsubscribe;

        if (user) {
            const colRef = collection(firestore, "users");
            const docRef = doc(colRef, user.uid);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                setUsername(doc.data()?.username);
            });
        } else {
            setUsername(undefined);
        }

        return unsubscribe;
    }, [user]);

    return { user, username };
}
