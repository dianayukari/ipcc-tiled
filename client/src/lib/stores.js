import { writable } from "svelte/store";

export const originalSentence = writable(
    'Human influence has likely increased the chance of compound extreme events since the 1950s'
);

export const visualParams = writable({ 
    segments: 0.5, 
    hue: 200, 
    speed: 0.05, 
    noiseScale: 0.01 });

export const currentSentence = writable('');
export const transformations = writable([]); 
export const actorGuess = writable('');
export const isComparing = writable(false);
export const loading = writable(false);
export const error = writable('');
export const patternStatus = writable('maintained')
export const showTextOverlay = writable(false)
export const overlaySentence = writable('')
export const motionTrigger = writable(0);
export const visualLog = writable([])
export const version = writable('')