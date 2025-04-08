import { AppEvents } from "./enums";

export type TCollectionParams = {
    pagination?: TPagination;
    filters?: TFilter;
    sorting?: TSorting[];
    // selection?: any;
};

export type TPagination = {
    number: number;
    size: number;
};
// по хорошему для более абстрактного сервиса, когда не только список фильмов но и другие запросы
export type TFilter = {
    [key: string]: any;
};

export type TSorting = {
    field: string;
    direction: string;
    priority?: number;
};

export type TAppEvents = {
    type: AppEvents;
    value?: any;
};