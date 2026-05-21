import Image from "next/image";

export default function DogCard({ dog }) {
  if (!dog) return null;

  return (
    <div className="bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm">
      <div className="w-full h-56 rounded-lg overflow-hidden bg-(--muted) mb-4">
        {dog.imageUrl ? (
          <Image
            src={dog.imageUrl}
            alt={dog.breed}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--muted-foreground) text-sm">
            No image available
          </div>
        )}
      </div>
      <h3 className="text-xl font-extrabold text-(--foreground)">{dog.breed}</h3>
      <p className="mt-2 text-sm text-(--muted-foreground)">{dog.funFact}</p>
    </div>
  );
}