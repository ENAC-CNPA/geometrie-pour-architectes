// Compute Metrics for IEEE Paper

import { Extension } from "@speckle/viewer";
export class ComputeMetrics extends Extension {
  public computeMetricsBeforeLoading() {
    console.log("computeMetricsBeforeLoading");
    console.time("Step 1")
  }
  public computeMetricsAfterLoading() {
    console.timeEnd("Step 1")
    console.log("computeMetricsAfterLoading");
    console.time("Step 2")
  }
  public computeMetricsAfterExtensions() {
    console.timeEnd("Step 2")
    console.log("computeMetricsAfterExtensions");
  }
}
