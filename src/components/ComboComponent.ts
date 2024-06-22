import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class ComboComponent extends Component {
  public comboCount: number = 0;
  public comboTimer: number = 0;
  private readonly comboTimeout: number = 2; // 2 seconds to continue the combo

  constructor(entity: Entity) {
    super(entity);
  }

  public update(deltaTime: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
  }

  public incrementCombo(): void {
    this.comboCount++;
    this.comboTimer = this.comboTimeout;
  }

  public resetCombo(): void {
    this.comboCount = 0;
    this.comboTimer = 0;
  }
}
