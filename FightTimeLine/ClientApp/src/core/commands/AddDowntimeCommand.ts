import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Utils } from "../Utils";
import { Guid } from "guid-typescript";
import { BossDownTimeMap } from "../Maps/index";
import { DowntimeData } from "./DowntimeData";


export class AddDowntimeCommand extends Command {

  serialize(): ICommandData {
    return {
      name: "addDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.data.start),
        end: Utils.formatTime(this.data.end),
        color: this.color,
        comment: this.comment
      }
    };
  }

  constructor(private id: string, private data: DowntimeData, private color: string, private comment: string) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.remove([this.id]);
    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {


    context.holders.bossDownTime.add(new BossDownTimeMap(context.presenter, this.id,
      this.data.startId || Guid.create().toString(),
      this.data.endId || Guid.create().toString(),
      {
        start: this.data.start,
        end: this.data.end,
        color: this.color || "",
        comment: this.comment || ""
      }));

    context.update({ updateDowntimeMarkers: true });
  }
}
