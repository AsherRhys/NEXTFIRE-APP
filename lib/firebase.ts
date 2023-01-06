import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import {
    getFirestore,
    collection,
    where,
    limit,
    query,
    orderBy,
    getDocs,
    QuerySnapshot,
    Timestamp,
    doc,
    DocumentSnapshot,
} from "firebase/firestore";
import { PostEntryData } from "../pages/[username]/[slug]";

const firebaseConfig = {
    apiKey: "AIzaSyDraEzYhNfq2tY2KF2aDYK1UcAbPDBGIww",
    authDomain: "nextfire-c5a2e.firebaseapp.com",
    projectId: "nextfire-c5a2e",
    storageBucket: "nextfire-c5a2e.appspot.com",
    messagingSenderId: "435618245483",
    appId: "1:435618245483:web:ad29df4b6ad7f7e7acfa2e",
    measurementId: "G-KZP5B3N1Q9",
};
export const fromMillis = Timestamp.fromMillis;

const defaultProject = initializeApp(firebaseConfig);
console.log(`Default project name: ${defaultProject.name}`);

export const firestore = getFirestore(defaultProject);
export const auth = getAuth(defaultProject);
export const googleAuthProvider = new GoogleAuthProvider();

export async function getUserWithUsername(username: string) {
    const usersRef = await collection(firestore, "users");
    const userQuery = query(
        usersRef,
        where("username", "==", username),
        limit(1)
    );

    const querySnapshot = await getDocs(userQuery);
    return querySnapshot.docs[0];
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} docSnapshot
 */
export function postToJSON(docSnapshot: DocumentSnapshot<PostEntryData>) {
    const data = docSnapshot.data() as PostEntryData;
    console.log("■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ", data);
    return {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis(),
    };
}
