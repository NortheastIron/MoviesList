import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/movies', pathMatch: 'full'},
    { 
        path: 'movies',
        loadChildren: () => import('./features/movies').then(m => m.MOVIES_PAGE_ROUTES)
    },
    { path: '**', redirectTo: '/' }
];
