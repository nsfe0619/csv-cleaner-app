import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsvCleanerComponent } from './components/csv-cleaner/csv-cleaner.component';

const routes: Routes = [
  { path: '', redirectTo: 'csv-cleaner', pathMatch: 'full' },
  { path: 'csv-cleaner', component: CsvCleanerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
