<script>
    import { onMount } from "svelte";
    import { motionTrigger, visualParams } from "$lib/stores";

    let lastTrigger = 0
    let burstStart = 0
    const burstDuration = 2000

    let container;
    let p5Instance;


    onMount(async () => {
        const p5Module = await import('p5');
        const p5 = p5Module.default || p5Module;


        p5Instance = new p5((p) => {
            let t = 0;


            p.setup = () => {
                const w = container.clientWidth || 600;
                const h = container.clientHeight || 600;
                p.createCanvas(w, h);
                p.background(255);
                p.noFill();
            };


            p.draw = () => {
                const vp = $visualParams;
                const trigger = $motionTrigger

                if (trigger !== lastTrigger) {
                    lastTrigger = trigger;
                    burstStart = performance.now();
                }

                const now = performance.now();
                const inBurst = burstStart && (now - burstStart < burstDuration);


                p.stroke(`hsl(${vp.hue}, 70%, 50%)`);
                p.strokeWeight(vp.segments * 0.1);


                // how “fast” noise space moves
                const s = vp.noiseScale || 0.01;
                const segs = Math.max(1, Math.floor(vp.segments || 1));


                for (let i = 0; i < segs; i++) {
                    const tt = t + i * 20 * s; // slight offset per segment


                    const x1 = p.width  * p.noise(tt + 15 * s);
                    const x2 = p.width  * p.noise(tt + 25 * s);
                    const x3 = p.width  * p.noise(tt + 35 * s);
                    const x4 = p.width  * p.noise(tt + 45 * s);


                    const y1 = p.height * p.noise(tt + 55 * s);
                    const y2 = p.height * p.noise(tt + 65 * s);
                    const y3 = p.height * p.noise(tt + 75 * s);
                    const y4 = p.height * p.noise(tt + 85 * s);


                    p.bezier(x1, y1, x2, y2, x3, y3, x4, y4);
                }

                if (inBurst) {
                    t += vp.speed || 0.005;
                }
            };


            p.windowResized = () => {
                const w = container.clientWidth || 600;
                const h = container.clientHeight || 600;
                p.resizeCanvas(w, h);
                p.background(255);
            };
        }, container);


        return () => {
            if (p5Instance) p5Instance.remove();
        };
    });
</script>


<div
    class="sketch-container"
    bind:this={container}
    style="width: 100%; height: 80vh;"
></div>