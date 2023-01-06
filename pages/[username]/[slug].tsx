import styles from "../../styles/Post.module.css";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";

import {
    collection,
    collectionGroup,
    getDocs,
    getDoc,
    doc,
    CollectionReference,
    Timestamp,
    Query,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PostContent from "../../components/PostContext";

export interface PostEntryData {
    heartCount: number;
    published: boolean;
    slug: string;
    title: string;
    username: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function getStaticProps({ params }: any) {
    console.log("HERE IT IS...", params);
    const { username, slug } = params;
    console.log(username);
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;

    if (userDoc) {
        const postsRef = collection(
            firestore,
            "posts"
        ) as CollectionReference<PostEntryData>;

        const postRef = doc(postsRef, slug);

        post = postToJSON(await getDoc(postRef));

        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 5000,
    };
}

export async function getStaticPaths() {
    // Improve my using Admin SDK to select empty docs
    const query = collectionGroup(firestore, "posts") as Query<PostEntryData>;

    const snapshot = await getDocs(query);

    const paths = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<PostEntryData>) => {
            console.log(doc.data());
            const { slug, username } = doc.data();
            return {
                params: { username, slug },
            };
        }
    );

    return { paths, fallback: "blocking" };
}

export default function Post(props: any) {
    const postRef = doc(firestore, props.path);
    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || props.post;

    return (
        <main className={styles.container}>
            <section>
                <PostContent post={post} />
            </section>

            <aside className="card">
                <p>
                    <strong>{post.heartCount || 0} 🤍</strong>
                </p>
            </aside>
        </main>
    );
}
