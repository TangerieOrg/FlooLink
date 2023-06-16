import { Link } from "react-router-dom";

export default function FourOhFour() {
    return <div class="h-screen w-screen flex flex-col justify-center text-center">
        <h1 class="text-8xl font-extralight -mt-24">Four Oh Four</h1>
        <h2 class="mt-8 text-xl italic">Oh no! This page doesn't exist</h2>
        <span class="mx-auto mt-8">
            <Link to="/">
                <button class="transition duration-200  px-6 py-3 rounded-lg border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white text-2xl font-light">Home</button>
            </Link>
        </span>
    </div>
}