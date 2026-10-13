/**
 * Slugs candidatos para seleccionar productos comprables en tiempo de ejecución.
 * No se fijan IDs ni precios: cada candidato se valida (botón "Add to cart" visible y
 * habilitado) y su precio se captura al ejecutar. Solo productos simples, sin atributos.
 */
export const PURCHASABLE_PRODUCT_CANDIDATES: readonly string[] = [
  'computing-and-internet',
  'fiction',
  'health-book',
  '141-inch-laptop',
];
