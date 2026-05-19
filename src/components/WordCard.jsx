export default function WordCard({ wordData }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-4xl font-extrabold text-foreground)]">{wordData.word}</h3>
      <p className="italic text-muted-foreground)] mt-1">{wordData.partOfSpeech}</p>
      <p className="mt-3 text-lg text-foreground">{wordData.definition}</p>

      <blockquote className="mt-4 border-l-4 border-brand pl-4 py-1 italic text-brand">
        &ldquo;{wordData.usedInSentence}&rdquo;
      </blockquote>

      <p className="mt-4 text-sm text--muted-foreground font-semibold">
        Origin: {wordData.origin}
      </p>
    </div>
  );
}