'use client';

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

const BackBtn = () =>{
    const router = useRouter();
    return(
        <button className="bg-white border border-gray-200 shadow-sm p-2.5 rounded-lg cursor-pointer" onClick={() => router.back()}>
            <FaArrowLeft />
        </button>
    )
}

export default BackBtn;