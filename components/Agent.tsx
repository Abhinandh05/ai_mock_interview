import React from 'react'
import Image from "next/image"
import { cn } from "@/lib/utils"
import { hidden } from "next/dist/lib/picocolors"

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface AgentProps {
    userName: string
}

const Agent = ({ userName }: AgentProps) => {
    const callStatus = CallStatus.FINISHED
    const isSpeaking = true;
    const messages = [
        'what is your name?',
        'My name is Kannan, nice to meet you '
    ];

    const lastMessage = messages[messages.length - 1]

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="Avatar"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interview</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="userAvatar"
                            height={540}
                            width={540}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className='transcript-border'>
                    <div className='transcript'>
                       <p key={lastMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                           {lastMessage}
                       </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call">
            <span
                className={cn(
                    "absolute animate-ping rounded-full opacity-75",
                    callStatus !== CallStatus.CONNECTING && hidden
                )}
            />
                        <span className='relative'>
              {callStatus === CallStatus.INACTIVE ||
              callStatus === CallStatus.FINISHED
                  ? "call"
                  : ". . ."}
            </span>
                    </button>
                ) : (
                    <button className="btn-disconnect">End</button>
                )}
            </div>
        </>
    )
}

export default Agent
