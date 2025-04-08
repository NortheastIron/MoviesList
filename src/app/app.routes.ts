import { Routes } from '@angular/router';
import { MoviesPageComponent } from './pages/movies-page/movies-page.component';

export const routes: Routes = [
    {path: '', component: MoviesPageComponent},
    {path: '**', redirectTo: '/'}
];
