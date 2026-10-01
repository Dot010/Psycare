module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: ["(^|/)src/app/", "\\.d\\.ts$"]
      },
      to: {},
    },
    {
      name: "app-layer-should-not-import-components",
      severity: "warn",
      from: {
        path: "^src/lib"
      },
      to: {
        path: "^src/app"
      }
    }
  ],
  options: {
    doNotFollow: {
      path: "node_modules"
    },
    tsConfig: {
      fileName: "tsconfig.json"
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"]
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+"
      }
    }
  }
};
