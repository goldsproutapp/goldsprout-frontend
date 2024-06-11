export enum StatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,

  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403
}
const unkownCode: StatusCode = StatusCode.BadRequest;

export function statusFrom(code: number): StatusCode {
  if (Object.values(StatusCode).includes(code)) return code;
  else return unkownCode;
}

const labelMapping: { [key in StatusCode]: string } = {
  [StatusCode.OK]: 'OK',
  [StatusCode.Created]: 'Created',
  [StatusCode.NoContent]: 'Success',
  [StatusCode.BadRequest]: 'Bad Request',
  [StatusCode.Unauthorized]: 'Unauthorised',
  [StatusCode.Forbidden]: 'Forbidden'
};

export function statusText(code: StatusCode): string {
  return labelMapping[code];
}

const successCodes: StatusCode[] = [StatusCode.OK, StatusCode.Created, StatusCode.NoContent];

export function isSuccessful(code: StatusCode): boolean {
  return successCodes.includes(code);
}
