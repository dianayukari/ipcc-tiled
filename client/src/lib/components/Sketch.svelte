<script>
    import { onMount } from "svelte";
    import * as p5 from 'p5';
    import { transformations, patternStatus } from "$lib/stores";
	import { speed } from "p5";

    export let containerHeight = '70vh'

    let container;
    let p5Instance;
    let originalParams = { segments: 1, speed: 0.005, noiseScale: 0.01, hue: 200}
    let currentParams = { ...originalParams}

</script>