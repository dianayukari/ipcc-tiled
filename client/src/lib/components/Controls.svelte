<script>
    import { get } from 'svelte/store';
    import {
        originalSentence,
        currentSentence,
        transformations,
        patternStatus,
        loading,
        actorGuess,
        visualParams,
		motionTrigger,
        visualLog
    } from '$lib/stores'
    import { transformSentence } from '$lib/api';

    function cleanText(text) {
        return text.replace(/\*\*/g, '');
    }

    function describeChange(prev, next, feature, patternStatus) {
        const parts = [];

        if (feature === 'vocab') {
            if (next.segments > 3) {
                parts.push('vocabulary became more complex');
            } else {
                parts.push('vocabulary became more simple');
            }
        }

        if (feature === 'modality') {
            if (next.hue >= 180 && next.hue <= 240) {
                parts.push('modality became more certain');
            } else if (next.hue >= 20 && next.hue <= 60) {
                parts.push('modality became less certain');
            }
        }

        if (feature === 'transitivity') {
            if (next.speed > 0.005) {
                parts.push('transitivity increased');
            } else {
                parts.push('transitivity decreased');
            }
        }

        return {
            feature,
            patternStatus,
            summary: parts.join('; '),
            timestamp: Date.now()
        };
    }

    async function handleTransform(feature) {
        loading.set(true);
        try {
            const baseText = $currentSentence || $originalSentence;
            const prevVp = get(visualParams);

            const result = await transformSentence(
                baseText,
                feature,
                $patternStatus,
            );

            currentSentence.set(result.text);
            actorGuess.set(result.actorGuess || '');

            console.log(result)

            const nextVp = {
                segments: result.segments,
                hue: result.hue,
                speed: result.speed,
                noiseScale: result.noiseScale
            };
            visualParams.set(nextVp);

            transformations.update(t => [
                ...t,
                { feature, patternStatus: $patternStatus, text: result.text, ...nextVp }
            ]);

            const entry = describeChange(prevVp, nextVp, feature, $patternStatus);
            visualLog.update(log => [...log, entry]);

            motionTrigger.update(n => n + 1);
        } finally {
            loading.set(false);
        }
    }

    async function handleFeatureClick(feature) {
        lastFeature = feature;
        await runTransform(feature);
    }

    async function handlePatternChange(event) {
        patternStatus.set(event.target.value);
        await runTransform(lastFeature);
    }

</script>

<div class="controls">
    <div class="transform-controls">
        <div class="buttons">
            <p class="grey-title">Change the linguistic features</p>
            <button on:click={()=>handleTransform('vocab')} disabled={$loading}>vocab</button>
            <button on:click={()=>handleTransform('modality') } disabled={$loading}>modality</button>
            <button on:click={()=>handleTransform('transitivity')} disabled={$loading}>transitivity</button>
        </div>
        <div class="dropdown">
            <select bind:value={$patternStatus} disabled={$loading}>
                <option value="maintained">maintain</option>
                <option value="changed">changed</option>
                <option value="omitted">omitted</option>
            </select>
            <p> uncertainty pattern</p>
        </div>
    </div>

    <div class="sentences">
        <p class="grey-title">IPCC</p>
        <p class="sentence">{$originalSentence}</p>
        {#if $currentSentence}
        <p class="grey-title">Translation</p>
        <p class="sentence">{cleanText($currentSentence)}</p>
        {/if}
    </div>

</div>

<style>

    .controls {
        max-width: 400px;
    }

    .grey-title {
        font-size: 14px;
        color: #A9A9A9;
        margin-bottom: 5px;
    }

    .transform-controls {
        display: flex;
        flex-direction: column;
    }

    .dropdown {
        display: flex;
        align-items: center;
    }

    button {
        background-color: #fff;
        font-size: 16px;
        color: #232222;
        /* border: solid #232222 2px; */
        border: none;
        cursor: pointer;
        border-radius: 8px;
        width: 110px;
        height: 35px;
        transition: 0.3s;
        margin: 10px 3px 10px 3px;
        box-shadow: 6px 6px 12px #c5c5c5,
             -6px -6px 12px #ffffff;
        font-family: "freight-sans-pro", sans-serif;
    }

    button:hover:enabled {
        border: solid #232222 2px;
        /* font-weight: bold; */
    }

    button:disabled {
        background-color: #EBEBEB;
        border: none;
        color: #A9A9A9;
        cursor: not-allowed;
    }

    select {
        font-family: "freight-sans-pro", sans-serif;
        font-size: 16px;
        background-color: #fff;
        color: #232222;
        border: none;
        border-bottom: solid #232222 1px;
        cursor: pointer;
        width: 110px;
        height: 35px;
        transition: 0.3s;
        margin: 0 5px;
        padding: 0 10px;
    }

    select:disabled {
        background-color: #EBEBEB;
        border: none;
        color: #A9A9A9;
        cursor: not-allowed;
        border-radius: 8px;
    }

    .sentence {
        margin-top: 0;
    }

</style>