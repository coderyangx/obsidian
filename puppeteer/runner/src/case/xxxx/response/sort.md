import { Page } from 'puppeteer';
import { BaseCase } from '../../../app/case-mgr';
import { MetricToolkit } from '../../../metrics/metrics-toolkit';
import { averageMetrics } from '../../../metrics/metrics';

export class SortCase extends BaseCase {
  getKey (): string {
    return 'xtable-sort';
  }

  protected async onExecute (page: Page, params: any): Promise<any> {
    await page.waitForSelector('.toolbar');

    const toolKit = new MetricToolkit(page, ['memory', 'response']);

    try {
      await page.click('.toolbar__left .sort');
      await page.waitForSelector('.sort-container');

      await page.click('.sort-container > button');
      await page.waitForSelector('.sort-menu');

      await toolKit.start();

      await page.click('.sort-menu > li:nth-child(1)');
      await page.waitForSelector('.sort-container .sort-item');
    } catch (e) {
      throw new Error('排序功能挂了');
    }

    await toolKit.end();
    const ret = await toolKit.getMetrics();
    return ret;
  }

  protected onProcessResult (result: any[]) {
    return averageMetrics(result);
  }
}
