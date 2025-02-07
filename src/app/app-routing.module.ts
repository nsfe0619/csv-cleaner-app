import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsvTabsComponent } from './components/csv-tabs/csv-tabs.component';

const routes: Routes = [
  { path: '', redirectTo: 'csv-tabs', pathMatch: 'full' },
  { path: 'csv-tabs', component: CsvTabsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
