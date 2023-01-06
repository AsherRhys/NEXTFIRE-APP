import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import Link from "next/link";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import PostFeed from "../components/PostFeed";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";
import { useState } from "react";
import {
    collectionGroup,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    startAfter,
    Query,
} from "firebase/firestore";
import { PostEntryData } from "./[username]/[slug]";
const inter = Inter({ subsets: ["latin"] });

const LIMIT = 1;
export async function getServerSideProps({ context }: any) {
    const postsQuery = query(
        collectionGroup(firestore, "posts"),
        where("published", "==", true),
        orderBy("createdAt", "desc"),
        limit(LIMIT)
    ) as Query<PostEntryData>;

    const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

    return {
        props: { posts }, // will be passed to the page component as props
    };
}
export default function Home(props: any) {
    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);
    const [postsEnd, setPostsEnd] = useState(false);

    const getMorePosts = async () => {
        if (!posts || posts.length == 0) {
            return;
        }
        setLoading(true);
        const last = posts[posts.length - 1];

        const cursor =
            typeof last.createdAt === "number"
                ? fromMillis(last.createdAt)
                : last.createdAt;

        const querys = query(
            collectionGroup(firestore, "posts"),
            where("published", "==", true),
            orderBy("createdAt", "desc"),
            startAfter(cursor),
            limit(LIMIT)
        );

        const newPosts = (await getDocs(querys)).docs.map(({ doc }: any) =>
            doc.data()
        );

        setPosts(posts.concat(newPosts));
        setLoading(false);

        if (newPosts.length < LIMIT) {
            setPostsEnd(true);
        }
    };

    return (
        <main>
            <PostFeed posts={posts} admin={undefined} />

            {!loading && !postsEnd && (
                <button onClick={getMorePosts}>Load more</button>
            )}

            <Loader show={loading} />

            {postsEnd && "You have reached the end!"}
        </main>
    );
}
