import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Lista editable de texto libre (comorbilidades, determinantes sociales, alertas clinicas):
 * agregar con Enter/coma, quitar con click. Two-way binding simple via [(value)], sin
 * ControlValueAccessor porque estos campos no necesitan validacion de formulario.
 */
@Component({
  selector: 'app-chip-list-input',
  imports: [MatChipsModule, MatIconModule, MatFormFieldModule],
  template: `
    <mat-form-field class="full-width" subscriptSizing="dynamic">
      @if (label) { <mat-label>{{ label }}</mat-label> }
      <mat-chip-grid #grid [attr.aria-label]="label">
        @for (item of value; track item) {
          <mat-chip-row (removed)="remove(item)">
            {{ item }}
            <button matChipRemove [attr.aria-label]="'Quitar ' + item">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
        <input
          [placeholder]="placeholder"
          [matChipInputFor]="grid"
          [matChipInputSeparatorKeyCodes]="separatorKeys"
          (matChipInputTokenEnd)="add($event)" />
      </mat-chip-grid>
      @if (hint) { <mat-hint>{{ hint }}</mat-hint> }
    </mat-form-field>
  `
})
export class ChipListInputComponent {
  @Input() label = '';
  @Input() placeholder = 'Escribir y presionar Enter';
  @Input() hint = '';
  @Input() value: string[] = [];
  @Output() valueChange = new EventEmitter<string[]>();

  readonly separatorKeys = [ENTER, COMMA];

  add(event: MatChipInputEvent): void {
    const v = (event.value || '').trim();
    if (v) {
      this.value = [...this.value, v];
      this.valueChange.emit(this.value);
    }
    event.chipInput.clear();
  }

  remove(item: string): void {
    this.value = this.value.filter(v => v !== item);
    this.valueChange.emit(this.value);
  }
}
