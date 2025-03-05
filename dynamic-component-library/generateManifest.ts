const { Project, ts } = require("ts-morph");
const fs = require("fs");
const path = require("path");

// Initialize a TypeScript project
const project = new Project({
  tsConfigFilePath: "tsconfig.json", // Ensure it matches your project
});

const componentsManifest: any[] = [];

// Find all .tsx files in `src/components/`
const sourceFiles = project.getSourceFiles("./src/components/**/*.tsx");
console.log(`🔍 Found ${sourceFiles.length} source files`);
sourceFiles.forEach((sourceFile: import("ts-morph").SourceFile) => {
  sourceFile.getVariableDeclarations().forEach((variable) => {
    if (!variable.isExported()) return;

    debugger;
    const componentName = variable.getName();
    console.log(`Found component: ${componentName}`);

    if (!componentName) return;

    // Get type information (props interface)
    const typeNode = variable.getTypeNode();
    let propsInterface: string | null = null;
    let propsMetadata: Record<string, any> = {};

    if (typeNode && typeNode.getText().includes("React.FC")) {
      const match = typeNode.getText().match(/React.FC<([^>]+)>/);
      if (match) {
        propsInterface = match[1].trim();
        console.log(`Component ${componentName} uses props: ${propsInterface}`);

        const interfaceDeclaration = sourceFile.getInterface(propsInterface);
        if (interfaceDeclaration) {
          interfaceDeclaration
            .getProperties()
            .forEach((prop: import("ts-morph").PropertySignature) => {
              const propName = prop.getName();
              const propType = prop.getType().getText();
              const isOptional = prop.hasQuestionToken();

              propsMetadata[propName] = {
                type: propType,
                required: !isOptional,
              };
            });
        }
      }
    }

    console.log(`Extracted props for ${componentName}:`, propsMetadata);

    componentsManifest.push({
      file: sourceFile.getFilePath(),
      componentName,
      props: propsMetadata,
    });
  });
});

// Write manifest to JSON file
const manifestPath = path.join(__dirname, "/sharepoint/solution/infodash.component.manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(componentsManifest, null, 2));

console.log(`✅ Component manifest generated at: ${manifestPath}`);
