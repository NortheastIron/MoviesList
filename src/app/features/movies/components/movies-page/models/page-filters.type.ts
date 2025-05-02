import { GenresEnum } from '@features/movies/enums';

export type TPageFilters = {
    inputSearch: {
      inputVal: string;
      searchVal: string;
    };
    createYear: string;
    addUpdateDate: string;
    genre: GenresEnum | string;
  };