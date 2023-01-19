import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavRoute } from 'ngx-material-navigation';

const routes: NavRoute[] = [
    {
        title: 'Home',
        path: '',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }