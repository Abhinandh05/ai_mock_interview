import React from "react";
import { getCurrentUser } from "@/lib/action/auth.action";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/action/general.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

type RouteParams = {
    params: {
        id: string;
    };
};

const Page = async ({ params }: RouteParams) => {
    const { id } = params;
    const user = await getCurrentUser();

    if (!user) {
        console.warn("No user found — redirecting.");
        redirect("/");
    }

    const interview = await getInterviewById(id);
    if (!interview) {
        console.warn("Interview not found — redirecting.");
        redirect("/");
    }

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user.id,
    });

    if (!feedback) {
        console.warn("No feedback found — redirecting.");
        redirect("/");
    }

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview - <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row justify-center mt-4">
                <div className="flex flex-row gap-5">
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression: <span className="text-primary-200 font-bold">{feedback.totalScore}</span>/100
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>{dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}</p>
                    </div>
                </div>
            </div>

            <hr className="my-4" />

            <p>{feedback.finalAssessment}</p>

            <div className="flex flex-col gap-4 mt-6">
                <h2>Breakdown of the Interview:</h2>
                {feedback.categoryScores?.map((category, index) => (
                    <div key={index}>
                        <p className="font-bold">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mt-6">
                <h3>Strengths</h3>
                <ul>
                    {feedback.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3 mt-6">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback.areasForImprovement?.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>

            <div className="buttons flex gap-3 mt-6">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">Back to dashboard</p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link href={`/interview/${id}`} className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-black text-center">Retake Interview</p>
                    </Link>
                </Button>
            </div>
        </section>
    );
};

export default Page;
