export class AeroRecordError extends Error {}

export class InvalidEventError extends AeroRecordError {}

export class ConnectionError extends AeroRecordError {}

export class RecordNotFound extends AeroRecordError {}

export class RecordNotUnique extends AeroRecordError {}
