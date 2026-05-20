export async function callWithRetry(fn, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = i === retries - 1;
      if (isLastAttempt) throw err;
      console.warn(`Attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

// Retries a function up to `retries` times with a delay between each attempt
export async function withRetry(fn, retries = 2, delayMs = 500) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await fn();
            return result; // it worked, send it back
        } catch (err) {
            if (attempt === retries) throw err; // we've used all our attempts, give up
            await new Promise((resolve) => setTimeout(resolve, delayMs)); // wait before retrying
        }
    }
}

