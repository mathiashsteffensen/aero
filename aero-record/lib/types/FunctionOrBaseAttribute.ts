import Base from "../Base"

/* eslint-disable @typescript-eslint/ban-types */

export type FunctionOrBaseAttribute<TRecord> = Function | keyof Base<TRecord>

/* eslint-enable @typescript-eslint/ban-types */
