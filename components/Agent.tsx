"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";

import { saveInterview } from "@/lib/action/interview.action";
import { createFeedback } from "@/lib/action/general.action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
               }: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");

    const [callEnded, setCallEnded] = useState(false);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallEnded(true);

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.log("VAPI Error:", error);

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async () => {
            try {
                const result = await createFeedback({
                    interviewId: interviewId!,
                    userId: userId!,
                    transcript: messages,
                    feedbackId,
                });

                console.log("Feedback Result:", result);

                if (result.success && result.feedbackId) {
                    router.push(`/interview/${interviewId}/feedback`);
                } else {
                    console.warn("Feedback creation failed, redirecting to /");
                    router.push("/");
                }
            } catch (error) {
                console.error("Error creating feedback:", error);
                router.push("/");
            }
        };

        const saveInterviewToDB = async () => {
            try {
                const res = await saveInterview({
                    userId: userId!,
                    interviewId: interviewId!,
                    transcript: messages,
                });

                console.log("Interview saved:", res);

                if (type !== "generate") {
                    await handleGenerateFeedback();
                } else {
                    router.push("/");
                }
            } catch (err) {
                console.error("Failed to save interview", err);
                router.push("/");
            }
        };

        if (callEnded && messages.length > 0) {
            setCallStatus(CallStatus.FINISHED);
            saveInterviewToDB();
        }
    }, [messages, callEnded]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            const formattedQuestions = questions?.map((q) => `- ${q}`).join("\n") || "";
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };

    const handleDisconnect = async () => {
        await vapi.stop();
        setCallEnded(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            {/* Neural network pattern overlay */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping animation-delay-2000"></div>
                <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-3000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        AI Interview Session
                    </h1>
                    <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
                </div>

                {/* Main interview view */}
                <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center">
                    {/* AI Interviewer Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className={cn(
                                        "w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300",
                                        isSpeaking
                                            ? "border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse"
                                            : "border-slate-600"
                                    )}>
                                        <Image
                                            src="/ai-avatar.png"
                                            alt="AI"
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>

                                    {/* Speaking indicator */}
                                    {isSpeaking && (
                                        <div className="absolute -inset-2 border-2 border-cyan-400 rounded-full animate-ping"></div>
                                    )}

                                    {/* Status indicator */}
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center",
                                        callStatus === "ACTIVE"
                                            ? "bg-green-500 animate-pulse"
                                            : callStatus === "CONNECTING"
                                                ? "bg-yellow-500 animate-spin"
                                                : "bg-slate-500"
                                    )}>
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">AI Interviewer</h3>
                                <p className="text-sm text-slate-400">
                                    {callStatus === "ACTIVE" ? (isSpeaking ? "Speaking..." : "Listening...") :
                                        callStatus === "CONNECTING" ? "Connecting..." :
                                            callStatus === "FINISHED" ? "Session Complete" :
                                                "Ready to Start"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Connection visualization */}
                    <div className="hidden lg:flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        callStatus === "ACTIVE"
                                            ? "bg-cyan-400 animate-pulse"
                                            : callStatus === "CONNECTING"
                                                ? "bg-yellow-400 animate-bounce"
                                                : "bg-slate-600",
                                        `animation-delay-${i * 100}`
                                    )}
                                />
                            ))}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 uppercase tracking-wider">
                            {callStatus === "ACTIVE" ? "Live Connection" :
                                callStatus === "CONNECTING" ? "Establishing..." :
                                    "Disconnected"}
                        </div>
                    </div>

                    {/* User Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        <Image
                                            src="/user-avatar.png"
                                            alt="User"
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>

                                    {/* User status indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{userName}</h3>
                                <p className="text-sm text-slate-400">Candidate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript Display */}
                {messages.length > 0 && (
                    <div className="mt-8 relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl blur opacity-30"></div>
                        <div className="relative bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Live Transcript
                                </h4>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">
                                    {messages.length} Messages
                                </div>
                            </div>

                            <div className="max-h-32 overflow-y-auto">
                                <p className="text-slate-300 leading-relaxed animate-fadeIn">
                                    {lastMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex justify-center mt-8">
                    {callStatus !== "ACTIVE" ? (
                        <button
                            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCall}
                            disabled={callStatus === "CONNECTING"}
                        >
                            {/* Button background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>

                            {/* Connecting animation */}
                            {callStatus === "CONNECTING" && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl animate-pulse"></div>
                            )}

                            <span className="relative flex items-center justify-center">
                                {callStatus === "CONNECTING" && (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                )}
                                {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Start Interview" : "Connecting..."}
                            </span>
                        </button>
                    ) : (
                        <button
                            className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            onClick={handleDisconnect}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>

                            <span className="relative flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                                End Interview
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes tilt {
                    0%, 50%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(1deg); }
                    75% { transform: rotate(-1deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-tilt {
                    animation: tilt 10s infinite linear;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animation-delay-100 { animation-delay: 100ms; }
                .animation-delay-200 { animation-delay: 200ms; }
                .animation-delay-300 { animation-delay: 300ms; }
                .animation-delay-400 { animation-delay: 400ms; }
                .animation-delay-1000 { animation-delay: 1000ms; }
                .animation-delay-2000 { animation-delay: 2000ms; }
                .animation-delay-3000 { animation-delay: 3000ms; }
                .animation-delay-4000 { animation-delay: 4000ms; }
            `}</style>
        </div>
    );
};

export default Agent;