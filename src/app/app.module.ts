import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CsvCleanerService } from './services/csv-cleaner.service';
import { CsvCleanerComponent } from './components/csv-cleaner/csv-cleaner.component';

@NgModule({
  declarations: [
    AppComponent,
    CsvCleanerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [CsvCleanerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
