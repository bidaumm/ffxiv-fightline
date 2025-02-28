import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import { calculateDefsForAttack, calculateMitigationForAttack } from "../Defensives";
import { IExportCell, IExportColumn, ITableOptionSettings } from "../ExportModels";
import { Holders } from "../Holders";
import { BossAttackMap } from "../Maps";
import { BaseColumnTemplate, IColumnTemplate } from "../TableModels";
import { AttackNameColumn } from "./Columns/AttackNameColumn";
import { BossTargetColumn } from "./Columns/BossTargetColumn";
import { TimeColumn } from "./Columns/TimeColumn";

export class MitigationsTemplate extends AttackRowExportTemplate {
  public loadOptions(): ITableOptionSettings {
    return null;
  }
  public get name(): string {
    return "Mitigations";
  }

  constructor() {
    super();
  }

  getColumns(context: ExportTemplateContext): IColumnTemplate<BossAttackMap>[] {

    const jobs = context.holders.jobs.getAll().sort((a, b) => a.job.role - b.job.role);

    const partyJob = {
      translated: "Party",
      id: "party",
      order: -1
    };

    return [
      new TimeColumn(),
      new AttackNameColumn(context.presenter),
      new BossTargetColumn(),
      ...[partyJob, ...jobs].map(j => new MitigationColumn(j, context.holders))
    ];
  }
}

class MitigationColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap>{
  constructor(private it: {id: string, translated: string, job?: { icon?: string }}, private holders: Holders) {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    return {
      text: this.it.translated,
      name: this.it.id,
      icon: this.it.job?.icon,
      refId: this.it.id,
      width: "auto"
    } as IExportColumn;
  }

  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    const defs = calculateDefsForAttack(this.holders, attack.id);
    const mts = calculateMitigationForAttack(this.holders, defs, attack);
    return this.createJobCell(mts, this.it.id);
  }

  private createJobCell(mts: { name: string; id: string; mitigation: number; shield: number; icon: string; }[], v: string) {
    const mt = mts.find(m => m.id === v);
    let cell;
    if (mt) {
      cell = this.items([
        {
          text: (mt.mitigation * 100).toFixed() + "%",
          color: "blue",
          tooltip: "Mitigation",
          ignoreShowText: true
        },
        {
          text: mt.shield.toFixed() + "%",
          color: "red",
          tooltip: "Shield",
          ignoreShowText: true
        }
      ], {});
    } else {
      cell = this.items([], {});
    }
    return cell;
  }
}
