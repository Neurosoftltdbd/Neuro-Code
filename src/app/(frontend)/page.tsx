import Image from "next/image";
import Link from "next/link";
import {MainLayout} from "@/app/mainLayout";


export default function Home() {
  return (
<MainLayout>
    <main className="w-7xl mx-auto flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <section id="hero" className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white h-96 p-8">
            <h1 className="text-5xl font-extrabold mb-4 animate-fade-in">Welcome to Our Website</h1>
            <p className="text-xl mb-6 animate-fade-in">We offer amazing services to help you succeed.</p>
            <button className="mt-8 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl animate-bounce">Get Started</button>
        </section>
    </main>
</MainLayout>
  );
}
