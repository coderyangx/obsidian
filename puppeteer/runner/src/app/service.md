import { ITask } from './interface';
import fetch from 'node-fetch';

const masterIP = 'http://snapshot.it.test.sankuai.com';
// const masterIP = 'http://localhost:9005';

export async function getNextTask (): Promise<ITask | undefined> {
  //   return mockTask;
  console.log('即将获取任务--------');
  const res = await fetch(`${masterIP}/api/tasks/next`);
  const json = (await res.json()) as any;

  let ret;
  if (json.code === 200) {
    if (json.data.task) {
      ret = json.data.task;
    }
  }

  console.log('获取任务完成------', ret);
  return ret;
}

export async function updateTaskResultSuccess (projectId: string, taskId: string, result: any) {
  const body = JSON.stringify({ projectId, taskId, result });
  console.log('即将更新正确结果------', body);
  await fetch(`${masterIP}/api/tasks/result/success`, {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  console.log('更新正确结果完成-------');
}

export async function updateTaskResultError (projectId: string, taskId: string, result: any) {
  const body = JSON.stringify({ projectId, taskId, result });
  console.log('即将更新异常结果-------', body);
  await fetch(`${masterIP}/api/tasks/result/error`, {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  console.log('更新异常结果完成-------');
}

export const mockTask: ITask = {
  caseKey: 'xtable-model-performance',
  //   caseParams: {
  //     isGantt: true,
  //     hideTable: false
  //   },
  //   copy: true,
  repeat: 1,
  reportParams: { column: '5W', groupItems: ['响应维度', '分组', '甘特图'] },
  taskId: '多选转单选',
  url: 'http://localhost:5173/?table=1&view=1',
  urlParams: { modelcase: '多选转单选' },
  taskConfig: { viewport: { devicePixelRatio: 2, height: 1500, width: 3000 } },
  projectId: '模型层性能测试'
};
