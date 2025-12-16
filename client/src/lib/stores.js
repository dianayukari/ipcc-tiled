import { writable } from "svelte/store";

export const originalSentence = writable(
    'Individual livelihoods have been affected through, for example, destruction of homes and infrastructure, and loss of property and income, human health and food security, with adverse effects on gender and social equity. (high confidence)'
);

export const abc_original = writable(
	'|:D2 D2 D4|F2 F2 F4|A2 A2 A4|G2 G2 G4|A2 A2 A4|F2 F2 F4|D2 D2 D4|C4 C4:|'
);

export const currentSentene = writable('');
export const transformations = writable([]); 
export const actorGuess = writable('');
export const isComparing = writable(false);
export const loading = writable(false);
export const error = writable('');
export const patternStatus = writable('maintained')
export const showTextOverlay = writable(false)
export const overlaySentence = writable('')

