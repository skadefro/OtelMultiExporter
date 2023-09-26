import {
    InstrumentType, ResourceMetrics, PushMetricExporter, AggregationTemporality
} from '@opentelemetry/sdk-metrics';
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { ExportResult } from '@opentelemetry/core';
export class MultiMetricExporter implements PushMetricExporter {
    private exporters: PushMetricExporter[];
    private isshutdown: boolean = false;
    constructor(exporters: PushMetricExporter[]) {
        this.exporters = exporters;
    }
    count() {
        return this.exporters.length;
    }
    addExporter(exporter: PushMetricExporter) {
        this.exporters.push(exporter);
    }
    export(metrics: ResourceMetrics, callback: (result: ExportResult) => void): void {
        if (!this.exporters) return;
        if (this.exporters.length == 0) return;
        for (let i = 0; this.exporters.length > i; i++) {
            try {
                this.exporters[i].export(metrics, callback);
            } catch (error) {
                console.error(error);
            }
        }
    }
    async shutdown(): Promise<void> {
        this.isshutdown = true;
        await Promise.all(this.exporters.map((e) => e.shutdown()));
    }
    async forceFlush(): Promise<void> {
        this.exporters.forEach((exporter) => {
        });

    }
    selectAggregationTemporality(instrumentType: InstrumentType): AggregationTemporality {
        var res: AggregationTemporality = AggregationTemporality.CUMULATIVE;
        for (let i = 0; this.exporters.length > i; i++) {
            var experter = this.exporters[i];
            try {
                // @ts-ignore
                res = experter.selectAggregationTemporality(instrumentType);
            } catch (error) {
                console.error(error);
            }
        }
        return res;
    }
}
export class MultiSpanExporter implements SpanExporter {
    private exporters: SpanExporter[];
    constructor(exporters: SpanExporter[]) {
        this.exporters = exporters;
    }
    addExporter(exporter: SpanExporter) {
        this.exporters.push(exporter);
    }
    export(
        spans: ReadableSpan[],
        callback: (result: ExportResult) => void,
    ): void {
        if (!this.exporters) return;
        if (this.exporters.length == 0) return;
        for (let i = 0; this.exporters.length > i; i++) {
            try {
                this.exporters[i].export(spans, callback);
            } catch (error) {
                console.error(error);
            }
        }
    }
    async shutdown(): Promise<void> {
        await Promise.all(this.exporters.map((e) => e.shutdown()));
    }
}
