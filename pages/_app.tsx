import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/NavBar";
import styles from "../styles/Home.module.css";
import GetServerSideProps from "next/app";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../lib/context";
import { useUserData } from "../lib/hooks";

interface LoaderProps {
    Component: any;
    pageProps: any;
}

function MyApp({ Component, pageProps }: LoaderProps) {
    const userData = useUserData();

    return (
        <main className={styles.main}>
            <div className={styles.description}>
                <UserContext.Provider value={userData}>
                    <Navbar />
                    <Component {...pageProps} />
                    <Toaster />
                </UserContext.Provider>
            </div>
        </main>
    );
}

export default MyApp;
