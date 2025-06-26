import React from 'react'
import {getInterviewById} from "@/lib/action/general.action";
import {redirect} from "next/navigation";
import Image from "next/image";
import {getRandomInterviewCover} from "@/lib/utils";
import DisplayTechicons from "@/components/DisplayTechicons";
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/lib/action/auth.action";

const Page = async ({ params }: RouteParams) => {

    const {id} = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if(!interview) redirect('/')

    return (
       <>
           <div className='flex flex-row gap-4  justify-between mt-10'>

               <div className='flex flex-row gap-4 items-center max-sm:flex-row'>

                   <div className='flex flex-row gap-4 items-center'>

                       <Image src={getRandomInterviewCover()}
                              alt="coverImage"
                              width={40}
                              height={40}
                              className='rounded-full object-cover  size-[40px] '
                       />
                       <h3 className='capitalize'>{interview.role} Interview</h3>



                   </div>
                   <DisplayTechicons techStack={interview.techstack} />

               </div>

               <p className='bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize'>{interview.type}</p>

           </div>
           <Agent
               userName={user?.name}
               type={user?.id}
               interviewId={id}
               type="Interview"
               questions={interview.questions} />
       </>
    )
}
export default Page
