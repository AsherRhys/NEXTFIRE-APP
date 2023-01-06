import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import {
    collection,
    where,
    query,
    orderBy,
    limit,
    getDocs,
    Query,
} from "firebase/firestore";
import { PostEntryData } from "./[slug]";

export async function getServerSideProps({ query: querys }: any) {
    const { username } = querys;

    const userDoc = await getUserWithUsername(username);

    // If no user, short circuit to 404 page
    if (!userDoc) {
        return {
            notFound: true,
        };
    }
    // JSON serializable data
    let user = null;
    let posts = null;

    if (userDoc) {
        user = userDoc.data();
        const q = query(
            collection(userDoc.ref, "posts"),
            where("published", "==", true),
            orderBy("createdAt", "desc"),
            limit(5)
        ) as Query<PostEntryData>;
        posts = (await getDocs(q)).docs.map(postToJSON);
    }

    return {
        props: { user, posts }, // will be passed to the page component as props
    };
}

export default function UserProfilePage({
    user,
    posts,
}: {
    user: any;
    posts: any;
}) {
    console.log(posts);
    return (
        <main>
            <UserProfile user={user} />
            <PostFeed posts={posts} admin={null} />
        </main>
    );
}
