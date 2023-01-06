import { User } from "firebase/auth";
import { createContext } from "react";

interface ContextData {
    user?: User | null;
    username?: string;
}

export const UserContext = createContext<ContextData>({});
