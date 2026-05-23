export async function fetchDog() {
  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();

    const imageUrl = data.message;
    const breedRaw = imageUrl.split('/breeds/')[1].split('/')[0];
    const breed = breedRaw
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      imageUrl,
      breed,
      funFact: null, // AI will fill this in during the generate step
    };
  } catch (err) {
    console.error('Dog fetch failed:', err);
    return {
      imageUrl: null,
      breed: 'Unknown',
      funFact: null,
    };
  }
}