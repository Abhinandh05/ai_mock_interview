import React from 'react'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import InterviewCard from "@/components/InterviewCard";
import {
    getCurrentUser,
    getInterviewsByUserId,
    getLatestInterviews
} from "@/lib/action/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="text-center mt-10">
                <p>Please sign in to view your interviews.</p>
                <Link href="/sign-in">
                    <Button className="mt-4">Go to Sign In</Button>
                </Link>
            </div>
        );
    }

    const [userInterviews, latestInterviews] = await Promise.all([
        getInterviewsByUserId(user.id),
        getLatestInterviews({ userId: user.id })
    ]);

    const hasPastInterviews = userInterviews && userInterviews.length > 0;
    const hasUpcomingInterviews = latestInterviews && latestInterviews.length > 0;

    return (
        <>
            <section className='card-cta mt-5'>
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview Ready with AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions & get instant feedback
                    </p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href='/interview'>Start an Interview</Link>
                    </Button>
                </div>
                <Image
                    src="/robot.png"
                    alt="robo-kuttan"
                    height={400}
                    width={400}
                    className='max-sm:hidden'
                />
            </section>

            <section className='flex flex-col gap-6 mt-8'>
                <h2>Your Interviews</h2>
                <div className='interviews-section'>
                    {hasPastInterviews ? (
                        userInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <p>You haven't taken any interviews yet.</p>
                    )}
                </div>
            </section>

            <section className='flex flex-col gap-6 mt-8'>
                <h2>Take an Interview</h2>
                <div className='interviews-section'>
                    {hasUpcomingInterviews ? (
                        latestInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <p>There are no new interviews available.</p>
                    )}
                </div>
            </section>
        </>
    );
};

export default Page;
