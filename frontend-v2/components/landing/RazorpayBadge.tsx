"use client";

import Image from "next/image";

export function RazorpayBadge() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[13px] font-normal leading-none tracking-[-0.01em] text-[#737373]">
      <span>Safe payments at</span>
      <span className="relative inline-flex h-[14px] items-center">
        <Image
          src="/razorpay-logo.svg"
          alt="Razorpay"
          width={88}
          height={18}
          className="h-[14px] w-auto"
          priority
        />
      </span>
    </p>
  );
}
