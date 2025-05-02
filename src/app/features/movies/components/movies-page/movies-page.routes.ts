import { Routes } from "@angular/router";

export const MOVIES_PAGE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./movies-page.component').then(m => m.MoviesPageComponent),
        children: []
    }
];