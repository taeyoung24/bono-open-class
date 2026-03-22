// components/Button.tsx
import React from 'react'

// 기본 버튼 속성(onClick, type, disabled 등)을 모두 물려받으면서, 
// 색상 테마를 결정할 'variant' 속성을 추가로 받습니다.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // 공통 스타일: 둥근 모서리, 포인터 커서, 트랜지션, disabled 상태 처리
  const baseStyle = "w-full font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  
  // variant에 따른 색상 스타일
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-50 text-gray-600 hover:bg-gray-100"
  }

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
