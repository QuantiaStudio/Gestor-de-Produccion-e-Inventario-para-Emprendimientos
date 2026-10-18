/**
 * Mensajes de error de un campo. En las listas anidadas (como la fórmula de un producto) puede venir
 * en cambio un objeto con los errores de cada línea, indexado por su posición: { "1": { "campo": [...] } }.
 */
export type ErroresDeCampo = string[] | Record<string, Record<string, string[]>>;

/**
 * Cuerpo de las respuestas de error del backend Django (backend/API.md §3).
 * `errors` solo viene en los 400 por datos inválidos.
 */
export interface ErrorBackendDTO {
  detail: string;
  code: string;
  errors?: Record<string, ErroresDeCampo>;
}
