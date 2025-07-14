import { fetch } from "expo/fetch";

export async function fetchWithRetries(url, options = {}, retryOptions = {}) {
    const {
        retries = 3,
        delay = 1000, // 1 second
        backoff = 2
    } = retryOptions;

    let attempts = 0;
    let currentDelay = delay;

    while (attempts < retries) {
        try {
            const response = await fetch(url, options);

            // You might want to define what a "successful" response is.
            // For example, treating 4xx or 5xx as failures that should trigger a retry.
            // Here, we'll assume any non-OK status should trigger a retry,
            // but you can customize this logic.
            if (!response.ok) {
                console.warn(`Request failed with status ${response.status}. Attempting retry ${attempts + 1}/${retries}...`);
                // If you want to retry only on specific status codes, you can add
                // an if condition here (e.g., if (response.status === 503 || response.status === 429))
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response; // Success!
        } catch (error) {
            attempts++;
            console.error(`Fetch attempt ${attempts} failed:`, error.message);

            if (attempts < retries) {
                console.log(`Retrying in ${currentDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= backoff; // Increase delay for next retry
            } else {
                throw new Error(`Failed to fetch ${url} after ${retries} attempts. Last error: ${error.message}`);
            }
        }
    }
}

