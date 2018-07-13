module.exports = {
  exclude: {
    file     : [
      'jsconfig.json',
      'project.config.json',
      'package.json',
      'package-lock.json',
    ],
    extname  : ['.less'],
    directory: ['.svn', '.vscode', 'typings', 'node_modules'],
  },
}