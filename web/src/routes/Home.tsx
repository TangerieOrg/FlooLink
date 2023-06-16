import { useSubtitle } from "@modules/useTitle"

export default function HomeRoute() {
    useSubtitle("Home")
    return <div class="min-h-screen w-full flex flex-col justify-center">
        <h1 class="text-2xl text-center">Hi</h1>
    </div>
}