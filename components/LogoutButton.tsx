
"use client";

import { signOut } from "@/lib/action/auth.action";
import {toast} from "sonner";

export const LogoutButton = () => {
    const handleLogout = async () => {
        await signOut();
        window.location.href = "/sign-in";
        toast.success("Logout successful!");
    };

    return (
        <button onClick={handleLogout} className="btn-primary px-4 py-2 rounded">
            Logout
        </button>
    );
};
