import { IFPSMetrics } from '../metrics';

const SingleFrameMaxRenderTime = 100; // 单位ms

export class FPSMonitor {
  private _beginTime = 0;
  private _prevTime = 0;
  private _fpsArr: Array<{ value: number }> = []; // 单帧耗时数组
  private _frameCount = 0;
  private _raf?: number; // 执行帧

  loop() {
    const time = performance.now();
    // console.log('每一帧执行时间：', time - this._prevTime, performance.now(), this._prevTime);
    this._fpsArr.push({ value: time - this._prevTime });
    this._prevTime = time;
    this._frameCount++;
    this._raf = requestAnimationFrame(() => {
      this.loop();
    });
  }

  start() {
    this._beginTime = performance.now();
    this._prevTime = this._beginTime;
    this._raf = requestAnimationFrame(() => {
      this.loop();
    });
  }

  stop() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = undefined;
    }
  }

  getFPSMetrics(): IFPSMetrics {
    return {
      worstFrameData: this._getWorstFrameData(),
      maxRenderTimePerFrame: this._getPerFrameMaxRenderTime(),
      averageFPS: this._getAverageFps(),
      // 总卡顿帧数
      jankFrameCount: this._fpsArr.filter((o) => o.value > SingleFrameMaxRenderTime).length,
      // 总帧数
      totalFrameCount: this._fpsArr.length
    };
  }

  /**
   * 计算 fps 的平均值
   */
  private _getAverageFps() {
    if (!this._fpsArr.length) {
      return undefined;
    }
    const totalRenderTime = this._fpsArr.reduce((acc, cur) => acc + cur.value, 0);
    const averageFps = 1000 / (totalRenderTime / this._fpsArr.length);
    console.log('fps-monitor----_getAverageFps：', this._fpsArr, totalRenderTime, averageFps.toFixed(2));

    return +averageFps.toFixed(2);
  }

  private _getPerFrameMaxRenderTime() {
    if (!this._fpsArr.length) {
      return;
    }
    console.log('fps-monitor----_getPerFrameMaxRenderTime', Math.max(...this._fpsArr.map((o) => o.value)));

    return Math.round(Math.max(...this._fpsArr.map((o) => o.value)));
  }

  /**
   * @param {*} frameCostArr 渲染每帧花费时间的数组
   * @returns worstStuckFps-worstTotalStuckFrames 最差的卡顿帧对应的fps-最差的卡顿帧对应的卡顿总帧数
   */
  private _getWorstFrameData() {
    if (!this._fpsArr.length) {
      return undefined;
    }
    let worstStuckFps: number | undefined; // 最差的卡顿帧对应的fps
    let stuckStart = 0; // 卡顿开始帧的下标
    let stuckEnd = 0; // 卡顿结束帧下标
    let worstTotalStuckFrames = 0; // 最差的卡顿帧对应的卡顿总帧数
    // 末尾加一个0后是为了避免最后一帧时长依然大于singleFrameMaxRenderTime导致无法正常计算stuckEnd的情况
    [...this._fpsArr, { value: 0 }].forEach((item, index) => {
      const isStuckFrame = item.value >= SingleFrameMaxRenderTime;

      if (isStuckFrame && (stuckStart < stuckEnd || stuckStart === 0)) {
        stuckStart = index;
      }
      // [20, 200, 100, 20]
      if (!isStuckFrame && this._fpsArr[index - 1].value >= SingleFrameMaxRenderTime && index > stuckStart) {
        stuckEnd = index;
      }
      if (stuckEnd > stuckStart) {
        const totalStuckFrames = stuckEnd - stuckStart;
        // 卡顿总时长
        const totalStuckTime = this._fpsArr.slice(stuckStart, stuckEnd).reduce((prev, cur) => +prev + +cur.value, 0);
        const stuckFps = (totalStuckFrames / totalStuckTime) * 1000; // (2 / 200+100) * 1000
        if (worstStuckFps === undefined || stuckFps < worstStuckFps) {
          worstStuckFps = stuckFps;
          worstTotalStuckFrames = totalStuckFrames;
        }
      }
    });
    if (worstStuckFps) {
      return {
        fps: +worstStuckFps.toFixed(2),
        count: worstTotalStuckFrames
      };
    }
    return undefined;
  }
}
