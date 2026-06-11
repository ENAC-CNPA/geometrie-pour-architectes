// Compute Metrics for IEEE Paper

import { Extension } from "@speckle/viewer";
import Stats from "three/examples/jsm/libs/stats.module.js";

export class ComputeMetrics extends Extension {
  private stats = new Stats();

  private fpsValues: number[] = [];
  private startTime = 0;
  private collecting = false;

  public computeMetrics() {

    /* uncomment to display FPS directly on screen
    document.body.appendChild(this.stats.dom);
    */

    this.startTime = performance.now();
    this.collecting = true;

    console.log(
      "Collected frames and Median FPS will be computed in 30 seconds...",
    );
  }

  public onEarlyUpdate(deltaTime?: number) {
    this.stats.begin();

    if (this.collecting && deltaTime !== undefined) {
      const fps = 1000 / deltaTime;
      this.fpsValues.push(fps);

      if (performance.now() - this.startTime > 30000) {
        this.collecting = false;

        const median = this.computeMedian(this.fpsValues);

        console.log("Collected frames:", this.fpsValues.length);
        console.log("Median FPS:", median);
      }
    }
  }

  public onRender() {
    this.stats.end();
  }

  private computeMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }
}
