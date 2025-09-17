"use client"
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

export default function Home() {
    const router = useRouter();

  return (
        <section id="hero" className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-500 via-purple-500 to-green-600 text-white h-[60vh] p-8">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, ease: "easeInOut" }}>
                <h2 className="text-6xl font-extrabold my-4 animate-fade-in">Welcome to Neuro Soft Ltd</h2>
                <p className="text-xl my-2 animate-fade-in">We offer amazing services to help you succeed.</p>
                <p className="text-xl my-2 animate-fade-in">And we are specialized in Web Application Development and Mobile Application Development</p>
                <button onClick={() => router.push("/dashboard/ivac")} className="mt-8 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl animate-bounce">Get Started</button>

            </motion.div>
        </section>

  );
}
