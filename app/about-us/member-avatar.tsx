'use client';

type Member = {
  id: string;
  category: string;
  name: string;
  designation?: string;
  description?: string;
  image_url?: string;
};

export default function MemberAvatar({ member }: { member: Member }) {
  const imgSrc = member.image_url || '/assets/avatar.webp';
  return (
    <div className="w-full aspect-[4/3.8] bg-[#d5d5d5] rounded-xl flex items-end justify-center overflow-hidden border border-slate-200 shadow-xs">
      <img
        src={imgSrc}
        alt={member.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/avatar.webp';
        }}
      />
    </div>
  );
}
