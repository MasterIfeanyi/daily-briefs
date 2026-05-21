export default function Footer() {
  return (
    <footer className="w-full border-t border-(--border) mt-16 py-6 text-center">
      <p className="text-sm text-(--muted-foreground)">
        Powered by{" "}
        <a
          href="https://deepmind.google/models/gemma/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--brand) font-semibold hover:underline"
        >
          Gemma 4
        </a>
      </p>
    </footer>
  );
}