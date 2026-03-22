'use client'

import { useState } from 'react'
import BadgeImage from './BadgeImage'

interface BadgeCardProps {
  badge: { id: number; name: string; description: string | null; imagePath: string }
  isEarned: boolean
  earnedInfo?: { id: string; earnedAt: Date; issuer: string }
  gradeInfo: { stars: string; label: string }
}

export default function BadgeCard({ badge, isEarned, earnedInfo, gradeInfo }: BadgeCardProps) {
  const [isPinned, setIsPinned] = useState(false)

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    // 여기에 transition-transform duration-200 active:scale-95 추가
    <div 
      className={`group aspect-[3/4] [perspective:1000px] cursor-pointer transition-transform duration-200 active:scale-95 select-none
        ${isEarned ? '' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
      onClick={() => setIsPinned(!isPinned)}
    >
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 8s linear infinite;
        }
      `}</style>

      <div className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] 
        ${isPinned ? '[transform:rotateY(-180deg)]' : 'group-hover:[transform:rotateY(-180deg)]'}`}
      >
        
        {/* --- [앞면] --- */}
        <div className={`absolute inset-0 flex flex-col items-center justify-between p-8 bg-white border border-gray-200 rounded-3xl [backface-visibility:hidden] hover:border-blue-400 transition-colors
           ${!isEarned && 'bg-gray-50/50'}`}
        >
          <div className="flex-1 w-full flex items-center justify-center p-2">
            <BadgeImage 
              src={badge.imagePath} 
              alt={badge.name} 
              className="w-auto h-full max-w-full max-h-[85%] object-contain pointer-events-none"
            />
          </div>
          <div className="w-full text-center mt-4 border-t border-gray-100 pt-3">
            <h3 className="font-semibold text-xs text-gray-400 truncate break-keep tracking-tight">
              {badge.name}
            </h3>
            {!isEarned && (
              <span className="text-[10px] font-bold text-gray-300 mt-1 block">
                미획득
              </span>
            )}
          </div>
        </div>

        {/* --- [뒷면] --- */}
        <div className={`absolute inset-0 flex flex-col p-5 bg-white border rounded-3xl [backface-visibility:hidden] [transform:rotateY(-180deg)]
          ${isEarned ? 'border-blue-400 bg-white' : 'border-gray-200 bg-gray-50'}`}
        >
          {/* 상단: 등급 라벨 */}
          <div className="w-full flex justify-center mb-2 shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 tracking-wider">
              <span className="text-blue-400">{gradeInfo.stars}</span>
              {gradeInfo.label}
            </span>
          </div>

          {/* 중앙 컨텐츠 */}
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-3 overflow-hidden">
            <h3 className="font-extrabold text-gray-900 text-base text-center leading-tight break-keep">
              {badge.name}
            </h3>
            
            <p className="text-xs text-gray-600 text-center leading-relaxed break-keep line-clamp-3">
              {badge.description || "이 스탬프는 신비에 싸여 있습니다. 조건은 비밀입니다."}
            </p>

            {isEarned && earnedInfo ? (
              <p className="text-xs font-bold text-gray-900 mt-1">
                발급일: {formatDate(earnedInfo.earnedAt)}
              </p>
            ) : (
              <div className="py-2 border-t border-gray-100 mt-2 w-full text-center">
                <p className="text-xs font-bold text-gray-400 break-keep">
                  신규 과제를 완료하여 활성화하세요.
                </p>
              </div>
            )}
          </div>

          {/* 하단: ID 전광판 */}
          {isEarned && earnedInfo && (
            <div className="w-full mt-2 shrink-0">
              <div className="w-full bg-gray-50 border border-gray-100 rounded-md py-1 overflow-hidden flex relative">
                <div className="animate-ticker flex whitespace-nowrap text-[10px] text-gray-400 font-mono items-center w-max">
                  <span className="px-4">
                    ID: {earnedInfo.id} <span className="mx-2 text-gray-300">|</span> 승인: {earnedInfo.issuer}
                  </span>
                  <span className="px-4">
                    ID: {earnedInfo.id} <span className="mx-2 text-gray-300">|</span> 승인: {earnedInfo.issuer}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}