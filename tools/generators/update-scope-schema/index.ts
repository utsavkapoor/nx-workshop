import {
  Tree,
  formatFiles,
  installPackagesTask,
  readJson,
  updateJson
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';

function getAllScopes(nxJson) {
  const projects = Object.values(nxJson.projects);
  const allScopes: string[] = projects
    .map((project: any) =>
      project.tags.filter((tag) => tag.startsWith('scope:'))
    )
    .reduce((acc, tags) => [...acc, ...tags], [])
    .map((scope: string) => scope.slice(6));
  return Array.from(new Set(allScopes));
}

function replaceScopes(content: string, scopes: string[]): string {
  const joinScopes = scopes.map((s) => `'${s}'`).join(' | ');
  const PATTERN = /interface Schema \{\n.*\n.*\n\}/gm;
  return content.replace(
    PATTERN,
    `interface Schema {
  name: string;
  directory: ${joinScopes};
}`
  );
}

export default async function (tree: Tree) {
  const scopes = getAllScopes(readJson(tree, 'nx.json'));
  await updateJson(
    tree,
    'tools/generators/util-lib/schema.json',
    (schemaJson) => {
      const xPrompt = schemaJson.properties.directory['x-prompt'];
      xPrompt.items = scopes.map((scope: any) => {
        return {
          value: scope,
          label: scope
        };
      });
      return schemaJson;
    }
  );
  const content = tree.read('tools/generators/util-lib/index.ts', 'utf-8');
  const newContent = replaceScopes(content, scopes);
  tree.write('tools/util-lib/index.ts', newContent);
  await formatFiles(tree);
}
