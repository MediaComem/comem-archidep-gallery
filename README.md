# Image gallery

**:warning: DO NOT RUN THIS APPLICATION ANYWHERE UNDER ANY CIRCUMSTANCES :warning:**

## Setup

- Connect to the server with SSH.
- [Install Node.js 18.x](https://github.com/nodesource/distributions/blob/master/README.md#debinstall):

  ```bash
  $> curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  $> sudo apt-get install -y nodejs
  ```

- Install Git, clone the application and install its dependencies:

  ```bash
  $> sudo apt-get install -y git
  $> git clone https://github.com/MediaComem/comem-archidep-gallery.git
  $> cd comem-archidep-gallery
  $> npm ci
  ```

- Configure the application to listen on all network interfaces:

  ```bash
  $> printf 'GALLERY_LISTEN_HOST=0.0.0.0\nGALLERY_LISTEN_PORT=80\n' > .env
  ```

## Run the application

- Connect to the server with SSH and move into the application directory if
  necessary:

  ```bash
  $> cd comem-archidep-gallery
  ```

- Run the application:

  **:warning: DO NOT DO THIS :warning:**

  ```bash
  $> sudo node ./server.js
  ```
