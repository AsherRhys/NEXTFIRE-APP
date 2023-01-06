import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import { UserContext } from "../lib/context";

import { useEffect, useState, useCallback, useContext, FormEvent } from "react";

import debounce from "lodash.debounce";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { signInWithPopup } from "@firebase/auth";

export default function Enter(): JSX.Element {
    const { user, username } = useContext(UserContext);

    // 1. user signed out <SignInButton />
    // 2. user signed in, but missing username <UsernameForm />
    // 3. user signed in, has username <SignOutButton />
    return (
        <main>
            <meta name="Enter" content="Sign up for this amazing app!" />
            {user ? (
                username ? (
                    <SignOutButton />
                ) : (
                    <UsernameForm />
                )
            ) : (
                <SignInButton />
            )}
        </main>
    );
}

// Sign in with Google button
function SignInButton(): JSX.Element {
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider);
    };

    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={"/google.png"} width="30px" /> Sign in with Google
        </button>
    );
}

// Sign out button
function SignOutButton(): JSX.Element {
    return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

// Username form
function UsernameForm(): JSX.Element | null {
    const [formValue, setFormValue] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) {
            return;
        }

        // Create refs for both documents
        const userDoc = doc(firestore, `users/${user.uid}`);
        const usernameDoc = doc(firestore, `usernames/${formValue}`);

        // Commit both docs together as a batch write.
        const batch = writeBatch(firestore);
        batch.set(userDoc, {
            username: formValue,
            photoURL: user.photoURL,
            displayName: user.displayName,
        });

        batch.set(usernameDoc, { uid: user.uid });
        await batch.commit();
    };

    const onChange = (e: any) => {
        // Force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if (re.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    };

    // Hit the database for username match after each debounced change
    // useCallback is required for debounce to work
    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (username.length >= 3) {
                const docRef = doc(firestore, `usernames/${username}`);
                const docSnapshot = await getDoc(docRef);

                const exists = docSnapshot.exists();
                console.log("Firestore read executed!");
                setIsValid(!exists);
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        checkUsername(formValue);
    }, [formValue]);

    if (!username) {
        return (
            <section>
                <h3>Choose Username</h3>
                <form onSubmit={onSubmit}>
                    <input
                        name="username"
                        placeholder="myname"
                        value={formValue}
                        onChange={onChange}
                    />
                    <UsernameMessage
                        username={formValue}
                        isValid={isValid}
                        loading={loading}
                    />
                    <button
                        type="submit"
                        className="btn-green"
                        disabled={!isValid}
                    >
                        Choose
                    </button>

                    <h3>Debug State</h3>
                    <div>
                        Username: {formValue}
                        <br />
                        Loading: {loading.toString()}
                        <br />
                        Username Valid: {isValid.toString()}
                    </div>
                </form>
            </section>
        );
    }

    return null;
}

interface UsernameMessageProps {
    username: string;
    isValid: boolean;
    loading: boolean;
}

function UsernameMessage(props: UsernameMessageProps): JSX.Element {
    if (props.loading) {
        return <p>Checking...</p>;
    } else if (props.isValid) {
        return <p className="text-success">{props.username} is available!</p>;
    } else if (props.username) {
        return <p className="text-danger">That username is taken!</p>;
    } else {
        return <p>Unexpected condition!</p>;
    }
}
