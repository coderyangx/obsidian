import { ElementHandle, Page } from 'puppeteer';
import { BaseCase } from '../../../app/case-mgr';
import { CaseUtil } from '../../util';
import { IFPSMetrics, IMemoryMetrics, averageMetrics } from '../../../metrics/metrics';
import { MetricToolkit } from '../../../metrics/metrics-toolkit';
import { GanttDom, GridDom, embedScrollContainer } from '../consts';

interface ICanvasScrollCaseParams {
  isGantt?: boolean;
  hideTable?: boolean;
  isEmbedTable?: boolean;
}

interface ICanvasScrollCaseResult extends IFPSMetrics, IMemoryMetrics {}

export class CanvasScrollCase extends BaseCase {
  getKey (): string {
    return 'xtable-canvas-scorll';
  }

  protected async onExecute (page: Page, params: ICanvasScrollCaseParams): Promise<ICanvasScrollCaseResult> {
    const toolkit = new MetricToolkit(page, ['fps', 'memory', 'response', 'load']);
    await toolkit.start({ load: true });

    let dom: ElementHandle<Element> | null;
    if (params.isGantt) {
      dom = await page.waitForSelector(GanttDom);
    } else {
      if (params.isEmbedTable) {
        dom = await page.waitForSelector(embedScrollContainer, { timeout: 100000 });
      } else {
        dom = await page.waitForSelector(GridDom, { timeout: 100000 });
      }
    }
    if (!dom) {
      throw Error('dom未准备好');
    }

    const bbox = (await dom.boundingBox())!;
    await page.evaluate(() => {
      window.console.log = () => {}
    });

    if (params.isGantt && params.hideTable) {
      const btnRect = await page.evaluate((canvasRoot) => {
        const element = (window as any).getZRenderElementWithTag(canvasRoot, 'gantt-grid-collapse-button')[0];
        if (!element) {
          throw Error('canvas节点异常');
        }
        const ret = element.getPaintRect();
        if (isNaN(ret.x) || isNaN(ret.y) || isNaN(ret.width) || isNaN(ret.height)) {
          throw Error('canvas节点异常');
        }
        return ret;
      }, dom);
      await page.mouse.click(bbox.x + btnRect.x + btnRect.width / 2, bbox.y + btnRect.y + btnRect.height / 2);
    }

    await toolkit.end({ load: true });
    await CaseUtil.sleep(3000);


    // 模拟滚动
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);

    const wheelTime = 16; // 滚动间隔时间
    const deltaY: number[] = [];
    for (let index = 0; index < 1000 / wheelTime; index++) {
      deltaY.push(Math.round(Math.random() * 80));
    }
    deltaY.push(...deltaY.map((o) => -o));

    const deltaX: number[] = [];
    for (let index = 0; index < 1000 / wheelTime; index++) {
      deltaX.push(Math.round(Math.random() * 50));
    }
    deltaX.push(...deltaX.map((o) => -o));

    const scrollTime = 10e3; // 滚动10秒
    const scale = Math.ceil(scrollTime / 1000 / 2);

    const tmpDeltaX = deltaX.slice();
    const tmpDeltaY = deltaY.slice();
    for (let i = 0; i < scale; i++) {
      deltaX.push(...tmpDeltaX);
      deltaY.push(...tmpDeltaY);
    }
    
    await CaseUtil.sleep(1000);
    await toolkit.start({ fps: true, memory: true });

    await new Promise((resolve) => {
      let i = 0;
      const timer = setInterval(() => {
        page.mouse.wheel({ deltaX: deltaX[i], deltaY: deltaY[i] }).catch(() => {});
        i++;
        if (i >= deltaX.length) {
          clearInterval(timer);
          resolve('');
        }
      }, wheelTime);
    });

    await toolkit.end({ fps: true, memory: true });


    await CaseUtil.sleep(3000);
    await toolkit.start({ response: true }, { 
      response: { 
        observeLongtask: false,
        beginMark: 'switch-view',
        endMark: 'zrender-refresh'
      }
    });

    await page.click('.tabs .sortItem:last-child');

    await toolkit.end({ response: true });


    const metrics = await toolkit.getMetrics();
    return metrics;
  }

  protected onProcessResult (result: ICanvasScrollCaseResult[]): ICanvasScrollCaseResult {
    let maxIndex: number | undefined;
    let minIndex: number | undefined;

    // 去掉最好最坏情况
    if (result.length >= 3) {
      // 根据 averageFPS * 0.6 + totalFrameCount * 0.4 来获得评分
      const scores = result.map((o) => {
        if (!o.averageFPS || !o.totalFrameCount) {
          return 0;
        }
        return o.averageFPS * 0.6 + o.totalFrameCount * 0.4;
      });

      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      maxIndex = scores.findIndex((o) => o === maxScore);
      minIndex = scores.findIndex((o) => o === minScore);
    }

    // const list = result.filter((_o, i) => i !== maxIndex && i !== minIndex);
    const list = result;
    const ret = averageMetrics(list);
    return ret;
  }
}
