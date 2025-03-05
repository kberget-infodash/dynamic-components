'use strict';

const build = require('@microsoft/sp-build-web');
const gulp = require('gulp');

const fs = require('fs/promises');
const path = require('path');


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function extractComponentsFromTSX() {
//   try {

//     // Dynamically import globby since it's an ES module
//     const { globby } = await import('globby');

//     // Search for all .tsx files in the project
//     const tsxFiles = await globby(['./src/components/**/*.tsx']); // Ignore node_modules

//     const components = [];

//     console.log('tsxFiles:', tsxFiles);
//     for (const filePath of tsxFiles) {
//       const fileContent = await fs.readFile(filePath, 'utf8');

//       // Extract component name
//       // const componentNameMatch = fileContent.match(/export\s+const\s+(\w+)\s*:\s*React\.FC/);
//       const componentNameMatch = fileContent.match(/export\s+const\s+(\w+)\s*:\s*React\.FC\s*(?:<([\w<>,\s]+)>)?/);
//       const propsInterfaceMatch = fileContent.match(/export\s+interface\s+(\w+)\s*{([^}]+)}/);

//       if (!componentNameMatch || !propsInterfaceMatch) {
//         console.log('filePath', filePath);
//         continue;
//       }

//       const componentName = componentNameMatch[1];

//       // Extract props as key-value pairs
//       const propsString = propsInterfaceMatch[2].trim();
//       const props = {};
//       const propRegex = /\s*(\w+)\s*\??:\s*([\w<>]+)/g;

//       let match;
//       while ((match = propRegex.exec(propsString)) !== null) {
//         const propName = match[1];
//         const propType = match[2];
//         props[propName] = propType; // Store as { propName: propType }
//       }

//       // Extract component description from comment
//       let description = null;
//       const descriptionMatch = fileContent.match(/\/\*\*\s*\* Description:\s*([\s\S]*?)\*\//);
//       if (descriptionMatch) {
//         description = descriptionMatch[1].trim().replace(/\n\s*\*\s*/g, ' '); // Remove extra asterisks and new lines
//       }

//       components.push({
//         file: filePath,
//         componentName,
//         props,
//         description
//       });
//     }

//     // Write to manifest file
//     const manifestPath = path.join(__dirname, './sharepoint/solution/infodash.component.manifest.json');
//     const manifestDir = path.dirname(manifestPath); // Get directory path
//     // Ensure the directory exists
//     await fs.mkdir(manifestDir, { recursive: true });
//     await fs.writeFile(manifestPath, JSON.stringify(components, null, 2), 'utf8');
//     return components;
//   } catch (error) {
//     console.error('Error processing TSX files:', error);
//   }
// }

async function extractComponentsFromTSX() {
  try {
      // Dynamically import globby (ES module)
      const { globby } = await import('globby');

      // Search for all .tsx files
      const tsxFiles = await globby(['**/*.tsx', '!node_modules/**']);

      const components = [];

      for (const filePath of tsxFiles) {
          const fileContent = await fs.readFile(filePath, 'utf8');

          // Extract component name
          const componentMatch = fileContent.match(/export\s+const\s+(\w+)\s*:\s*React\.FC\s*<([\w<>,\s]+)>/);
          if (!componentMatch) continue;

          const componentName = componentMatch[1];

          // Extract JSDoc comment containing description, props, and notes
          const docCommentMatch = fileContent.match(/\/\*\*\s*([\s\S]*?)\*\//);
          let description = null, props = {}, notes = null;

          if (docCommentMatch) {
              const docComment = docCommentMatch[1].trim();

              // Extract description
              const descriptionMatch = docComment.match(/Description:\s*([\s\S]*?)(?=\* Props:|\* Notes:|$)/);
              if (descriptionMatch) {
                  description = descriptionMatch[1].trim().replace(/\n\s*\*\s*/g, ' ');
              }

              // Extract props
              const propsMatch = docComment.match(/Props:\s*([\s\S]*?)(?=\* Notes:|$)/);
              if (propsMatch) {
                  const propsString = propsMatch[1].trim();
                  const propRegex = /\s*(\w+)\s*:\s*([\w<>|[\]]+);?/g;

                  let match;
                  while ((match = propRegex.exec(propsString)) !== null) {
                      const propName = match[1];
                      const propType = match[2];
                      props[propName] = propType;
                  }
              }

              // Extract notes
              const notesMatch = docComment.match(/Notes:\s*([\s\S]*)/);
              if (notesMatch) {
                  notes = notesMatch[1].trim().replace(/\n\s*\*\s*/g, ' ');
              }
          }

          components.push({
              file: filePath,
              componentName,
              description,
              props,
              notes
          });
      }

      // Write results to manifest file
      const manifestPath = path.join(__dirname, './sharepoint/solution/infodash.component.manifest.json');
      await fs.mkdir(path.dirname(manifestPath), { recursive: true }); // Ensure directory exists
      await fs.writeFile(manifestPath, JSON.stringify(components, null, 2), 'utf8');

      console.log(`Component manifest created successfully: ${manifestPath}`);
      return components;
  } catch (error) {
      console.error('Error processing TSX files:', error);
  }
}



build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

gulp.task('watch-library', () => {
  return gulp.watch('src/**/*', gulp.series('build'));
});

gulp.task('extract-component-manifest', async () => {
  await extractComponentsFromTSX();
});

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));
