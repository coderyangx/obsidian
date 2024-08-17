export enum MetricsConfig {
  // 内存变化
  memoryRange = 'memoryRange',
  // 单帧最大渲染时长
  maxRenderTimePerFrame = 'maxRenderTimePerFrame',
  // 最小FPS（卡顿帧数量）
  worstFrameData = 'worstFrameData',
  // 平均FPS
  averageFPS = 'averageFPS',
  // 总卡顿帧数
  jankFrameCount = 'jankFrameCount',
  // 总帧数
  totalFrameCount = 'totalFrameCount',
  // 总时长
  totalTime = 'totalTime',
  // 渲染时长
  renderTime = 'renderTime',
  // 渲染次数
  renderCount = 'renderCount',
  // 自定义mark
  custom = 'custom',
  // load
  load = 'load'
}

export interface IMetrics extends IMemoryMetrics, IFPSMetrics, IResponseMetrics {}

export interface IMemoryMetrics {
  // 内存变化
  [MetricsConfig.memoryRange]?: [number, number];
}

export interface IFPSMetrics {
  // 单帧最大渲染时长
  [MetricsConfig.maxRenderTimePerFrame]?: number;
  // 最小FPS（卡顿帧数量）
  [MetricsConfig.worstFrameData]?: { fps: number; count: number };
  // 平均FPS
  [MetricsConfig.averageFPS]?: number;
  // 总卡顿帧数
  [MetricsConfig.jankFrameCount]?: number;
  // 总帧数
  [MetricsConfig.totalFrameCount]?: number;
}

export interface IResponseMetrics {
  // 总时长
  [MetricsConfig.totalTime]?: number;
  // 渲染时长
  [MetricsConfig.renderTime]?: number;
  // 渲染次数
  [MetricsConfig.renderCount]?: number;
  // 自定义指标
  [MetricsConfig.custom]?: Dictionary<number>;
}

/**
 * 计算平均指标
 * @param metrics IMetrics[]
 * @returns
 */
export function averageMetrics (metrics: IMetrics[]): IMetrics {
  return new Metrics().averageMetrics(metrics);
}

export interface Dictionary<T> {
  [key: string]: T;
}

class Metrics implements IMetrics {
  // 总时长
  public totalTime?: number;

  // 渲染时长
  public renderTime?: number;

  // 渲染次数
  public renderCount?: number;

  // 内存变化
  public memoryRange?: [number, number];

  // 单帧最大渲染时长
  public maxRenderTimePerFrame?: number;

  // 最小FPS（卡顿帧数量）
  public worstFrameData?: { fps: number; count: number };

  // 平均FPS
  public averageFPS?: number;

  // 总卡顿帧数
  public jankFrameCount?: number;

  // 总帧数
  public totalFrameCount?: number;

  // fst
  public fst? = [];

  averageMetrics (metrics: IMetrics[]): Dictionary<any> {
    console.log('averageMetrics,最终的指标数据', metrics);
    let totalTimeCount = 0;
    let renderTimeCount = 0;
    let memoryRangeCount = 0;
    let maxRenderTimePerFrameCount = 0;
    let worstFrameDataCount = 0;
    let averageFPSCount = 0;
    let jankFrameCountCount = 0;
    let totalFrameCountCount = 0;
    let fstCount = 0;

    const result: Dictionary<{ total: number; count: number }> = {};
    metrics.forEach((item) => {
      if (item.totalTime !== undefined) {
        totalTimeCount++;
        this.totalTime = item.totalTime + (this.totalTime || 0);
      }
      if (item.renderTime !== undefined) {
        renderTimeCount++;
        this.renderTime = item.renderTime + (this.renderTime || 0);
      }
      if (item.renderCount !== undefined) {
        this.renderCount = item.renderCount;
      }
      if (item.memoryRange) {
        memoryRangeCount++;
        this.memoryRange = [item.memoryRange[0] + (this.memoryRange ? this.memoryRange[0] : 0), item.memoryRange[1] + (this.memoryRange ? this.memoryRange[1] : 0)];
      }
      if (item.maxRenderTimePerFrame !== undefined) {
        maxRenderTimePerFrameCount++;
        this.maxRenderTimePerFrame = item.maxRenderTimePerFrame + (this.maxRenderTimePerFrame || 0);
      }
      if (item.worstFrameData) {
        worstFrameDataCount++;
        this.worstFrameData = { fps: item.worstFrameData.fps + (this.worstFrameData?.fps || 0), count: item.worstFrameData.count + (this.worstFrameData?.count || 0) };
      }
      if (item.averageFPS !== undefined) {
        averageFPSCount++;
        this.averageFPS = item.averageFPS + (this.averageFPS || 0);
      }
      if (item.jankFrameCount !== undefined) {
        jankFrameCountCount++;
        this.jankFrameCount = item.jankFrameCount + (this.jankFrameCount || 0);
      }
      if (item.totalFrameCount !== undefined) {
        totalFrameCountCount++;
        this.totalFrameCount = item.totalFrameCount + (this.totalFrameCount || 0);
      }
      if (item.fst !== undefined) {
        fstCount++;
        this.fst!.push(item.fst);
      }

      if (item.custom) {
        for (const key in item.custom) {
          if (Object.prototype.hasOwnProperty.call(item.custom, key)) {
            if (!result[key]) {
              result[key] = { total: item.custom[key]!, count: 1 };
            } else {
              result[key]!.total += item.custom[key]!;
              result[key]!.count += 1;
            }
          }
        }
      }
    });

    const customMetrics: Dictionary<number> = {};
    for (const key in result) {
      customMetrics[key] = result[key]!.total / result[key]!.count;
    }
    // TODO:
    // const fps = metrics.reduce((pre, cur) => pre + cur.averageFPS!, 0);
    // const aver = fps / 5;
    // console.log('metrics 自己计算的平均结果：', fps, aver);
    const jankFrameData = metrics.filter((item) => item.worstFrameData);

    return {
      totalTime: totalTimeCount > 0 ? this._round(this.totalTime! / totalTimeCount) : undefined,
      renderTime: renderTimeCount > 0 ? this._round(this.renderTime! / renderTimeCount) : undefined,
      renderCount: this.renderCount,
      memoryRange: memoryRangeCount > 0 ? [this._round(this.memoryRange![0] / memoryRangeCount), this._round(this.memoryRange![1] / memoryRangeCount)] : undefined,
      maxRenderTimePerFrame: maxRenderTimePerFrameCount > 0 ? this._round(this.maxRenderTimePerFrame! / maxRenderTimePerFrameCount) : undefined,
      worstFrameData: worstFrameDataCount > 0 ? { fps: this._round(this.worstFrameData!.fps / worstFrameDataCount), count: this._round(this.worstFrameData!.count / worstFrameDataCount) } : undefined,
      averageFPS: averageFPSCount > 0 ? this._round(this.averageFPS! / averageFPSCount) : undefined,
      jankFrameCount: jankFrameCountCount > 0 ? this._round(this.jankFrameCount! / jankFrameCountCount) : undefined,
      totalFrameCount: totalFrameCountCount > 0 ? this._round(this.totalFrameCount! / totalFrameCountCount) : undefined,
      custom: customMetrics,
      fst: this.fst,
      tp90: this.fst?.length && this._calculateTP(this.fst as any, 0.9),
      averageFst: fstCount > 0 ? this._round(this.fst!.reduce((v, pre) => v + pre, 0) / fstCount) : undefined,
      jankFrameData
    };
  }

  private _round (num: number) {
    return Math.round(num * 100) / 100;
  }

  /** 计算tp90值 */
  private _calculateTP (fstArr: number[], tp: number) {
    if (fstArr.length === 0) {
      throw new Error(`数据为空--${fstArr}`);
    }
    // 影响到了最后的输出，导致被排序
    const data = fstArr.slice();
    data.sort((a: number, b: number) => a - b);
    const len = data.length;
    const pos = Math.floor(tp * len);
    return data[pos];
  }
}
