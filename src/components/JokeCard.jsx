export default function JokeCard({ joke }) {
    return (
        <div className="bg-(--surface) border border-(--border) rounded-xl p-6 shadow-sm">
            <p className="text-lg text-(--foreground) font-semibold">{joke.setup}</p>
            <p className="mt-3 text-xl italic text-(--brand) font-extrabold">{joke.punchline}</p>
        </div>
    );
}