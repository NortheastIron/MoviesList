import { TDict } from '@core';
import { GenresEnum } from '@features/movies/enums';

export const GENRES_DICT: TDict[] = [
    {key: '', name: ''},
    {key: GenresEnum.action, name: 'Action'},
    {key: GenresEnum.adventure, name: 'Adventure'},
    {key: GenresEnum.comedy, name: 'Comedy'},
    {key: GenresEnum.drama, name: 'Drama'},
    {key: GenresEnum.fantasy, name: 'Fantasy'},
    {key: GenresEnum.historical, name: 'Historical'}
  ];