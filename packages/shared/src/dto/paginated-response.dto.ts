import { type PaginationMeta } from '../types/common.types';

export class PaginatedResponseDto<T> {
  data: T[];

  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}
