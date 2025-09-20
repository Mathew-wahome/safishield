declare const faceapi: any;

const MODEL_URL = '/models';

export async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    } catch (error) {
        console.error("Error loading face-api models:", error);
        throw new Error("Could not load face recognition models. Please check your network connection.");
    }
}

export async function getFullFaceDetection(input: HTMLVideoElement) {
    if (!input || input.paused || input.ended || input.readyState < 3) {
        return null;
    }
    return await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
}

export async function getFaceDescriptor(input: HTMLVideoElement): Promise<Float32Array | null> {
    const detection = await getFullFaceDetection(input);
    return detection ? detection.descriptor : null;
}

export function compareDescriptors(desc1: Float32Array, desc2: Float32Array): number {
    if (!desc1 || !desc2) return 1; // Max distance if one is invalid
    return faceapi.euclideanDistance(desc1, desc2);
}
