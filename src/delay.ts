export async function delay(ms: number): Promise<void> {
    if (ms < 0) {
        throw new Error("Delay duration cannot be negative");
    }

    try {
        console.log(`[delay] Start: waiting for ${ms}ms`);

        await new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });

        console.log(`[delay] Success: completed waiting for ${ms}ms`);
    } catch (error) {
        console.error(`[delay] Error: failed during delay.`, error);
        throw error;
    }
}
