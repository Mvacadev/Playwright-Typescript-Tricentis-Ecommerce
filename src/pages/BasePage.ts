import { expect, type Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

/** Base de todas las páginas: acceso al header y navegación con detección de soft-errors. */
export abstract class BasePage {
  readonly header: HeaderComponent;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
  }

  protected async visit(path: string): Promise<void> {
    await this.page.goto(path);
    await this.assertNoErrorPage();
  }

  /**
   * La aplicación redirige excepciones no controladas a `/errorpage.htm` con HTTP 200
   * (Matriz F-07), por lo que el status code no alcanza para detectar fallas.
   */
  async assertNoErrorPage(): Promise<void> {
    await expect(this.page, 'la aplicación no debe mostrar /errorpage.htm').not.toHaveURL(/errorpage\.htm/i);
  }
}
