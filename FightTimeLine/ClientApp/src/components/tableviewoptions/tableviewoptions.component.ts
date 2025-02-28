import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";


import { ITableOptions, ITableOptionSettings } from "src/core/ExportModels";

@Component({
  selector: "tableviewoptions",
  templateUrl: "./tableviewoptions.component.html",
  styleUrls: ["./tableviewoptions.component.css"],
})
export class TableViewOptionsComponent implements OnInit, OnDestroy {


  form: FormGroup;
  options: ITableOptions = {};
  private settingsInternal: ITableOptionSettings;
  subject = new Subject();
  subscription: Subscription;

  get settings(): ITableOptionSettings {
    return this.settingsInternal;
  }

  @Input() set settings(value: ITableOptionSettings) {
    this.settingsInternal = value;
    this.options = this.settingsInternal?.reduce((acc, s) => { acc[s.name] = s.initialValue || s.defaultValue; return acc; }, {});
    this.createForm(this.settingsInternal);
  }

  @Output() changed: EventEmitter<ITableOptions> = new EventEmitter<ITableOptions>();

  private createForm(opts: ITableOptionSettings) {
    const groups = {};

    if (opts) {
      for (const d of opts) {
        const value = d.initialValue || d.defaultValue;
        groups[d.name] = new FormControl(value);
      }
    }

    this.form = new FormGroup(groups);
  }

  public constructor() {

  }

  ngOnInit(): void {
    this.subscription = this.subject.pipe(
      debounceTime(400)
    ).subscribe(value => {
      this.changed.emit(value);
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  changeTagOptions(setting) {
    const opts = setting.options.items
      .filter(s => s.checked)
      .map(s => s.id);
    this.change(setting.name, opts);
  }

  change(name, value) {
    this.options[name] = value;

    const change = this.settingsInternal.find(s => s.name === name)?.onChange;
    if (change) {
      change(value);
    }

    this.subject.next(this.options);
  }
}
