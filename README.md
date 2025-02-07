# CsvCleanerApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Development server

Run `npm start` to start the development server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

> Note: Before starting the server, the WebAssembly file will be built and copied to the appropriate directory as part of the `build:wasm` process.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Building WebAssembly (WASM)

The project includes support for WebAssembly. To build the WASM file separately, you can run:

```bash
npm run build:wasm
```

This will:
1. Compile the AssemblyScript file located in `assembly/index.ts` to `build/release.wasm`.
2. Copy the generated `.wasm` file to the `src/assets/` directory.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI, use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Custom Scripts

### `npm run start`

Runs the following:
1. Builds the WebAssembly file (`npm run build:wasm`).
2. Starts the Angular development server (`ng serve`).

### `npm run build:wasm`

Combines the following steps:
1. **Compile AssemblyScript**: Converts `assembly/index.ts` to `build/release.wasm`.
   ```bash
   npm run asbuild
   ```
2. **Copy WASM file**: Moves the `.wasm` file to `src/assets/release.wasm`.
   ```bash
   npm run copy-wasm
   ```

### `npm run asbuild`

Compiles the AssemblyScript file to a `.wasm` file using the `asc` command:
```bash
asc assembly/index.ts --outFile build/release.wasm --target release
```

### `npm run copy-wasm`

Copies the compiled `.wasm` file to the `src/assets/` directory:
```bash
powershell Copy-Item build/release.wasm -Destination src/assets/release.wasm
```

### `npm run watch`

Watches for changes in the project and triggers a development build automatically:
```bash
ng build --watch --configuration development
```


