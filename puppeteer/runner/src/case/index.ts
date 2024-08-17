import { CaseManager } from '../app/case-mgr';
import { CanvasScrollCase } from './xtable/fps/canvas-scroll';
import { ModelPerformance } from './xtable/model/model-performance';
import { ColumnConfigCase } from './xtable/response/column-config';
import { RedrawCase } from './xtable/response/redraw';
import { FilterCase } from './xtable/response/filter';
import { GroupCase } from './xtable/response/group';
import { LineHeightCase } from './xtable/response/line-height';
import { SortCase } from './xtable/response/sort';
import { FirstLoadCase } from './xtable/load/first-load';
import { SwitchViewCase } from './xtable/response/switch-view';
// 注册快搭测试用例
import FormEditorScrollCase from './kuaida/fps/form-editor-scroll';
import ComponentsLimitCase from './kuaida/response/components-limit';
import ComponentsCopyCase from './kuaida/response/components-copy';
import FormEditorFstCase from './kuaida/pageLoad/form-editor-fst';
import FormRenderFstCase from './kuaida/pageLoad/form-render-fst';

export function registerCases() {
  // 注册快搭滚动用例
  CaseManager.ins.registerCase(new FormEditorScrollCase());
  CaseManager.ins.registerCase(new ComponentsLimitCase());
  CaseManager.ins.registerCase(new ComponentsCopyCase());
  CaseManager.ins.registerCase(new FormEditorFstCase());
  CaseManager.ins.registerCase(new FormRenderFstCase());

  // TODO:
  // CaseManager.ins.registerCase(new CanvasScrollCase());
  // CaseManager.ins.registerCase(new ColumnConfigCase());
  // CaseManager.ins.registerCase(new FilterCase());
  // CaseManager.ins.registerCase(new GroupCase());
  // CaseManager.ins.registerCase(new LineHeightCase());
  // CaseManager.ins.registerCase(new SortCase());
  // CaseManager.ins.registerCase(new RedrawCase());
  // CaseManager.ins.registerCase(new FirstLoadCase());
  // CaseManager.ins.registerCase(new ModelPerformance());
  // CaseManager.ins.registerCase(new SwitchViewCase());
}
