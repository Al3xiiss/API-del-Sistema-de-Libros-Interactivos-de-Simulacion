// Error con código HTTP, el errorHandler lo transforma en { error: mensaje } con ese código
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}