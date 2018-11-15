module.exports = {
  exclude: {
    file: [
      'jsconfig.json',
      '.babelrc',
      'build.bat',
      'gulpfile.js',
      'gulpfile-bak.js',
      'package.json',
      'package-lock.json',
      'project.config.json',
      'yarn.lock'
    ],
    extname: ['.less'],
    directory: ['.svn', '.vscode', 'typings', 'node_modules']
  }
}
