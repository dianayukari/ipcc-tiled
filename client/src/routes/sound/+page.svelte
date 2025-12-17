<script>

    import { onMount } from "svelte";
    import {
        originalSentence, abc_original, currentSentence, transformations, 
        actorGuess, isComparing, loading, error, patternStatus, 
        showTextOverlay, overlaySentence
    } from '$lib/stores.js';
    import { transformSentence } from "$lib/api";
    import * as Tone from 'tone';
    import * as ABCJS from 'abcjs'

    let selectedFeature = null;
    let timeline = [];
    let playingDots = {};

    let originalAbcEl;
    let comparisonOriginalAbcEl;
    let comparisonFinalAbcEl;
    let timelineAbcEls = {};

    onMount(() => {
        renderABCInElement(originalAbcEl, $abc_original)
    });

    function renderABCInElement(element, abc) {
        if (!element) return;

        ABCJS.renderAbc(element, abc);
    }

    function getMusicBoxDots(abc) {
        
    }

    async function playMidi(abc, containerId) {
        
    }

    function parseABC(abc) {

    }

    async function handleTransform() {
        if (!selectedFeature) return;

        $loading = true;
        $error = '';

        try {
            const response = await transformSentence(
                timeline.length === 0 ? $originalSentence : timeline[timeline.length -1].sentence,
                selectedFeature,
                $patternStatus,
                $abc_original
            )

            const abcFull = `X:1\nT:IPCC Sonification\nM:4/4\nL:1/8\nK:${response.key}\nQ:1/4=${response.tempo}\n${response.abc}`

            const newEntry = {
                sentence: response.sentence,
                abc: response.abc,
                abcFull: abcFull,
                actor: response.actor,
                feature: selectedFeature,
                pattern: $patternStatus,
                key: response.key,
                tempo: response.tempo,
                range: response.range
            };

            timeline = [...timeline, newEntry];
            transformations.set(timeline);

            const index = timeline.length - 1;
            setTimeout(() => {
                if (timelineAbcEls[index]) {
                    renderABCInElement(timelineAbcEls[index], abcFull)
                }
            }, 0)
        } catch (err) {
            $error = err.message;
        } finally {
            $loading = false
            selectedFeature = null
        }
    }

    function handleFinish() {
        if(timeline.length === 0) return;
        $isComparing = true
    }

    function closeModal() {
        $isComparing = false
    }

    $:console.log($patternStatus)

</script>