# robot-gui4

Graphical control panel for SCARA robot.

![screenshot](https://github.com/thetooth/robot-gui/blob/master/pic.png?raw=true)

## Requirements

-   NATS server running on the controller target with jetstream and websockets configured
-   robot-ctrl instance connected to the same NATS server

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
