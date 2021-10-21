# Image gallery

**!!! DO NOT RUN THIS APPLICATION ANYWHERE UNDER ANY CIRCUMSTANCES !!!**
*(Unless you want the machine it is running on to be hacked.)*

## Setup

* Connect to your server with SSH.
* Install Node.js 16:

  ```bash
  $> curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
  $> sudo apt-get install -y nodejs
  ```
* Install Git, clone the application and install its dependencies:

  ```bash
  $> sudo apt-get install -y git
  $> git clone https://github.com/MediaComem/comem-archidep-gallery.git
  $> cd comem-archidep-gallery
  $> npm ci
  ```
* Configure the application to listen on all network interfaces:

  ```bash
  $> printf 'GALLERY_LISTEN_HOST=0.0.0.0\nGALLERY_LISTEN_PORT=80\n' > .env
  ```
* Run the application:

  ```bash
  $> sudo node ./server.js
  ```
