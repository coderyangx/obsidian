import { Page } from 'puppeteer';
import { MetricToolkit } from '../../../metrics/metrics-toolkit';
import { averageMetrics } from '../../../metrics/metrics';
import { BaseCase } from '../../../app/case-mgr';
import { CaseUtil } from '../../util';

export class FilterCase extends BaseCase {
  getKey (): string {
    return 'xtable-filter';
  }
  protected async onExecute (page: Page, params: any): Promise<any> {
    await page.waitForSelector('.toolbar');

    const toolTik = new MetricToolkit(page, ['response', 'memory']);

    try {
      await page.click('.toolbar__left .filter');
      await page.waitForSelector('.filter-container');

      await toolTik.start();

      await page.click('.filter-container .add');
      await page.waitForSelector('.filter-container .filter-item');

      await CaseUtil.sleep(3000);
    } catch (e) {
      throw new Error('筛选功能挂了');
    }

    await toolTik.end();
    const ret = await toolTik.getMetrics();
    return ret;
  }
  protected onProcessResult (result: any[]) {
    return averageMetrics(result);
  }
}
