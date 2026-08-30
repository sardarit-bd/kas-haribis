import { ChevronRight } from 'lucide-react';
import { FiHome } from "react-icons/fi";
import BackBtn from "./Backbtn";

export default function ProductBreadcrumb({ breadcrumbs,backbtn=false }) {



  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 py-4">    
      <div className='mr-1'>
        {
        backbtn &&  <BackBtn/>
      }
      </div>
      <FiHome className='text-xl'/>
      {breadcrumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <a href={crumb.href} className="hover:text-yellow-600 font-light transition">
            {crumb.label}
          </a>
          {idx < breadcrumbs.length - 1 && (
            <ChevronRight size={16} className="text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  )
}

