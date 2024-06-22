import { Scene } from "./Scene";

export abstract class System {
  protected scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }
}
