import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/action/auth.action";

// Make this layout dynamic (important)
export const dynamic = "force-dynamic";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
    const isUserAuthenticated = await isAuthenticated();
    if (isUserAuthenticated) redirect("/");

    return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
