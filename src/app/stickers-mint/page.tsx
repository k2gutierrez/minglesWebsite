import Image from "next/image";
import { MintComponent } from "@/components/MintComponent";

export default function Home() {
  return (
    <>
      <div className="relative">
        <Image
          src={"/MinglesJugandoFinal.png"}
          alt="Mingles Stickers"
          width={500}
          height={200}
          className="w-full md:h-48 object-cover object-center"
        />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-9">
          <Image
            src={"/LogoNegro.png"}
            alt="Mingle Logo"
            width={70}
            height={70}
            className=""
          />
        </div>
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white pt-8">
        <MintComponent />
      </main>
    </>
  );
}