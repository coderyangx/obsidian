import { ElementHandle, Page } from 'puppeteer';
import { BaseCase } from '../../../app/case-mgr';
import { MetricToolkit } from '../../../metrics/metrics-toolkit';
import { averageMetrics } from '../../../metrics/metrics';
import { GridDom } from '../consts';
import { CaseUtil } from '../../util';

export class RedrawCase extends BaseCase {
  getKey (): string {
    return 'xtable-redraw';
  }
  protected async onExecute (page: Page, params: any): Promise<any> {
    const dom: ElementHandle<Element> | null = await page.waitForSelector(GridDom, { timeout: 100000 });
    if (!dom) {
      throw Error('dom未准备好');
    }

    const bbox = (await dom.boundingBox())!;

    await CaseUtil.sleep(3000);
    const toolkit = new MetricToolkit(page, ['response']);
    await toolkit.start({ response: true }, { response: { observeLongtask: false, beginMark: 'zrender-refresh', endMark: 'zrender-refresh' } });
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    await CaseUtil.sleep(1000);
    await toolkit.end();
    

    const metrics = await toolkit.getMetrics();
    return metrics;
  }
  protected onProcessResult (result: any[]) {
    return averageMetrics(result);
  }
}
