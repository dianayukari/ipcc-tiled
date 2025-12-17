<script>
    import { onMount } from "svelte";
    import { motionTrigger, visualParams } from "$lib/stores";

    let lastTrigger = 0
    let burstStart = 0
    const burstDuration = 2000

    let container;
    let p5Instance; 

    onMount( async () => {
        const p5Module = await import('p5');
        const p5 = p5Module.default || p5Module;

        p5Instance = new p5((p) => {
            let t = 0;

            p.setup = () => {

                const size = Math.min(container.clientWidth || 600, window.innerHeight * 0.8 || 600);

                p.createCanvas(size, size);
                p.noFill()

            }

            p.draw = () => {

                const vp = $visualParams;
                const trigger = $motionTrigger

                if (trigger !== lastTrigger) {
                    lastTrigger = trigger;
                    burstStart = performance.now();
                }

                const now = performance.now();
                const inBurst = burstStart && (now - burstStart < burstDuration);

                p.stroke(`hsl(${vp.hue}, 70%, 60%)`);
                p.strokeWeight(vp.segments * 0.05);
                p.noFill();

                const segs = Math.max(1, Math.floor(vp.segments || 1));
                const baseStep = 10;
                const scale = vp.noiseScale || 0.01;

                for (let s = 0; s < segs; s++) {
                    const localT = t + s * 0.5;      // small per-segment phase shift

                    const x1 = p.width  * p.noise(localT * scale + 15);
                    const x2 = p.width  * p.noise(localT * scale + 15 + baseStep);
                    const x3 = p.width  * p.noise(localT * scale + 15 + 2 * baseStep);
                    const x4 = p.width  * p.noise(localT * scale + 15 + 3 * baseStep);

                    const y1 = p.height * p.noise(localT * scale + 55);
                    const y2 = p.height * p.noise(localT * scale + 55 + baseStep);
                    const y3 = p.height * p.noise(localT * scale + 55 + 2 * baseStep);
                    const y4 = p.height * p.noise(localT * scale + 55 + 3 * baseStep);

                    p.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
                }

                if (inBurst) {
                    t += vp.speed*20 || 0.005;
                }
            };

            p.windowResized = () => {
                const w = container.clientWidth || 600;
                const h = container.clientHeight || 600;
                p.resizeCanvas(w, h);
                p.background(255);
            };
        }, container);   

        return() => {
            if (p5Instance) p5Instance.remove()
        };
    });


</script>

<div class="sketch-container" bind:this={container}></div>

<style>
    .sketch-container {
        display: flex;
        justify-content: center;
        position: relative;
        width: 100%;
    }
</style>