'use client'
import Image from "next/image";
import styles from "./profile.module.css";
import cls from "classnames";
import React from 'react';

export default function NotLogged(  ) {
  return (
    <div className="text-center">
      <p className="my-10 text-black text-md font-[family-name:var(--font-hogfish)]">Your are not connected</p>
    </div>
  )
}
