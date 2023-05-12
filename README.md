# License Grabber

A command line utility for quickly collecting the license information from dependencies in a Node.js project. This tool was made with the purpose of easily being able to view, display and use your dependencies' licenses. It offers a number of different ways to format the license info, including JSON, plain text files, Markdown and HTML. There are [examples](https://github.com/TylerPop/license-grabber/tree/main/examples) in this repository of each of the output types.

## Installation

```
npm install -g license-grabber
```

> **Note** This package is intended to be used as a command line utility, and NOT imported into a JavaScript file. Therefore, to be used properly it must be installed globally (`-g`) via npm.

## Usage

After installation, the easiest way to get started is to navigate to your Node.js project directory and run the `license-grabber` command in your terminal:

```
cd my-project
license-grabber
```

Replace `my-project` with your project directory. Once the utility completes, you will find your `license_info.json` file located inside the current directory where you ran the command.

## Configuration

This utility comes with several different configuration options, allowing you more control over how your license info is generated. To see all the available options, run the help command or view the [options section](#options) below for more information.

```
license-grabber --help
```

The output will look something like this:

```
license-grabber [directory] <options>

Positionals:
  directory  The root directory of the project.                                   [string] [default: "."]

Options:
  -v, --version            Show version number                                                  [boolean]
  -h, --help               Show help                                                            [boolean]
  -t, --type               The type of output file that is generated
                                           [choices: "json", "txt", "markdown", "html"] [default: "json"]
  -o, --output-path        The directory where the output file(s) will be generated
                                                                                  [string] [default: "."]
  -n, --name               The name of the output file                 [string] [default: "license_info"]
  -P, --exclude-prod       Exclude licenses from production dependencies       [boolean] [default: false]
  -D, --exclude-dev        Exclude licenses from development dependencies      [boolean] [default: false]
  -N, --skip-node-modules  Skips checking the node_modules folder              [boolean] [default: false]
  -R, --skip-registry      Skips checking the NPM registry                     [boolean] [default: false]

Examples:
  license-grabber -t html -n licenses  Create an HTML output file and give it a custom name
  license-grabber -o ./documents -D    Choose a custom output path and exclude dev dependencies
```

## Options

### type

This is the type of output file that will be generated. Currently this utility supports 4 file types: `json`, `txt`, `markdown` or `html`. The default type is `json`.

> **Note** Choosing the `txt` type will create a directory based on the output name (`-n`). Inside that directory, you will find folders for each of the dependencies that contain a `.txt` file holding the license info. All other types create just a single output file.

### output-path

This is the path of the directory where you would like the output file(s) to be generated. This path should NOT include the name of the file, as that is a separate option available (see below). The default output path is the current directory.

### name

This is the name of the output file that will be generated. The default name is `license_info`. This name should NOT include the file type extension, as that is automatically added on by the utility when writing the output file. For example, if you run the command with these options:

```
license-grabber -t json -n output.json
```

You will end up with an output file that looks like this: `output.json.json`
Technically, this is still a valid JSON file but is a strange way to format a file and is not recommended.

### exclude-prod

This will exclude the production dependencies. These are packages listed under the `dependencies` section of the `package.json` file. The default is `false`, meaning production dependencies are included.

### exclude-dev

This will exclude the development dependencies. These are packages listed under the `devDependencies` section of the `package.json` file. The default is `false`, meaning development dependencies are included.

### skip-node-modules

If this option is passed, the utility will not look for a `node_modules` folder, and instead will go straight to checking the NPM registry for all license information. The default is `false`.

### skip-registry

If this option is passed, the utility will not check the NPM registry for license information. The default is `false`.
