import { Tree, formatFiles, installPackagesTask } from '@nrwl/devkit';
import { libraryGenerator, moveGenerator } from '@nrwl/workspace/generators';

interface Schema {
  name: string;
  directory: 'api' | 'store' | 'shared' | 'vide-games';
}

export default async function (tree: Tree, schema: Schema) {
  await libraryGenerator(tree, {
    name: `util-${schema.name}`,
    directory: schema.directory,
    tags: `type:util, scope:${schema.directory}`,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
