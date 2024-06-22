import { Scene } from "../engine/Scene";
import { Entity } from "../engine/Entity";
import { TransformComponent } from "../components/TransformComponent";
import { RenderComponent } from "../components/RenderComponent";
import { Component } from "../engine/Component"; // Added this import

export class MainMenuScene extends Scene {
  private menuItems: Entity[] = [];

  constructor() {
    super();
    this.initializeMenu();
  }

  private initializeMenu(): void {
    this.createMenuItem("Shape Fighter", 200, 100, "title");
    this.createMenuItem("Start Game", 200, 200, "start");
    this.createMenuItem("Options", 200, 250, "options");
    this.createMenuItem("Exit", 200, 300, "exit");
  }

  private createMenuItem(
    text: string,
    x: number,
    y: number,
    identifier: string
  ): Entity {
    const menuItem = new Entity();
    menuItem.addComponent(new TransformComponent(menuItem, x, y));
    menuItem.addComponent(new RenderComponent(menuItem, "white"));
    menuItem.addComponent(new MenuItemComponent(menuItem, identifier));
    this.addEntity(menuItem);
    this.menuItems.push(menuItem);
    return menuItem;
  }

  public getSelectedMenuItem(mouseX: number, mouseY: number): string | null {
    for (const menuItem of this.menuItems) {
      const transform = menuItem.getComponent(TransformComponent);
      const menuItemComponent = menuItem.getComponent(MenuItemComponent);
      if (transform && menuItemComponent) {
        const { x, y } = transform;
        if (
          mouseX >= x - 50 &&
          mouseX <= x + 50 &&
          mouseY >= y - 15 &&
          mouseY <= y + 15
        ) {
          return menuItemComponent.identifier;
        }
      }
    }
    return null;
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    // Add any menu-specific update logic here
  }
}

class MenuItemComponent extends Component {
  constructor(entity: Entity, public identifier: string) {
    super(entity);
  }

  public update(deltaTime: number): void {
    // Menu item-specific update logic can be added here if needed
  }
}

export {};
