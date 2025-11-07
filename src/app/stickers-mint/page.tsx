import Image from "next/image";
import { MintComponent } from "@/components/MintComponent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white pt-8">
      <MintComponent />
    </main>
  );
}