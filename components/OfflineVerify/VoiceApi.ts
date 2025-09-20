// Helper to normalize a vector (for cosine similarity, or just to scale features)
function normalize(vec: number[]): number[] {
    const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vec;
    return vec.map(val => val / magnitude);
}

// A simple function to calculate Euclidean distance between two vectors
function euclideanDistance(vec1: number[], vec2: number[]): number {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
        sum += (vec1[i] - vec2[i]) ** 2;
    }
    return Math.sqrt(sum);
}


export async function getVoiceFeatures(stream: MediaStream, durationInSeconds: number = 3): Promise<number[] | null> {
    return new Promise(async (resolve) => {
        try {
            const context = new AudioContext();
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            let allAudioData: number[] = [];
            
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                allAudioData.push(...Array.from(inputData));
            };

            setTimeout(() => {
                source.disconnect();
                processor.disconnect();
                context.close().catch(e => console.warn("Error closing AudioContext:", e));
                
                if(allAudioData.length === 0) {
                    resolve(null);
                    return;
                }

                // Defensive check to ensure the library is loaded via the window object
                if (typeof (window as any).speechRecognition === 'undefined' || typeof (window as any).speechRecognition.mfcc !== 'function') {
                    console.error("Fatal: speech-features.js library not loaded or 'mfcc' function not found.");
                    resolve(null);
                    return;
                }

                // Use speech-features to extract MFCCs
                const mfcc = (window as any).speechRecognition.mfcc(allAudioData, {
                    sampleRate: context.sampleRate,
                    frameSize: 1024,
                    frameStep: 512,
                    numFilters: 40,
                    numCeps: 13
                });

                if (!mfcc || mfcc.length === 0) {
                    resolve(null);
                    return;
                }
                
                // For simplicity, we average the MFCC vectors to get a single feature vector
                const averagedMfcc = mfcc[0].map((_, colIndex) => 
                    mfcc.map(row => row[colIndex]).reduce((acc, c) => acc + c, 0) / mfcc.length
                );

                resolve(normalize(averagedMfcc));

            }, durationInSeconds * 1000);

        } catch (error) {
            console.error("Error processing voice features:", error);
            resolve(null);
        }
    });
}

export function compareVoiceFeatures(feat1: number[], feat2: number[]): number {
    if (!feat1 || !feat2 || feat1.length !== feat2.length) return 1; // Max distance
    // Use Euclidean distance for simplicity
    return euclideanDistance(feat1, feat2);
}