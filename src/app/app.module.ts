import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CsvCleanerService } from './services/csv-cleaner.service';
import { CsvCleanerComponent } from './components/csv-cleaner/csv-cleaner.component';
import { CsvTabsComponent } from './components/csv-tabs/csv-tabs.component';
import { CsvCreatorComponent } from './components/csv-creator/csv-creator.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CsvCleanerComponent,
    CsvTabsComponent,
    CsvCreatorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [CsvCleanerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
