// app/lib/action/interview.action.ts
"use server";

import { db } from "@/firebase/admin";

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

interface SaveInterviewParams {
    userId: string;
    interviewId: string;
    transcript: SavedMessage[];
    role: string;
    type: string;
    level: string;
    techstack: string[];
    questions: string[];
}

export async function saveInterview({
                                        userId,
                                        interviewId,
                                        transcript,
                                        role,
                                        type,
                                        level,
                                        techstack,
                                        questions,
                                    }: SaveInterviewParams) {
    try {
        const createdAt = new Date().toISOString();

        const interviewData = {
            userId,
            transcript,
            createdAt,
            finalized: true,
            role,
            type,
            level,
            techstack,
            questions,
            coverImage: "/covers/reddit.png", // default or dynamic logic
        };

        await db.collection("interviews").doc(interviewId).set(interviewData, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error saving interview:", error);
        return { success: false };
    }
}
