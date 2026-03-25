# WebGPU utilities

WebGPU utilities provides a set of utilities for working with WebGPU.

## Development

Installing packages:

```sh
yarn install
yarn playwright install --with-deps # if --with-deps fails on your OS, then try without it, but you might need to install some dependencies manually.
```

During development, you can run the build with the following command:

```sh
yarn watch
```

To use the local version of the library in your project, you can run the following command:

```sh
yarn link
```

Then, in your project, you can run:

```sh
yarn link @donnerknalli/webgpu-utils
```

To unlink the package in your project, you can run:

```sh
npm unlink @donnerknalli/webgpu-utils
```

Then you can run the following command to unlink the package globally:

```sh
yarn unlink
```
