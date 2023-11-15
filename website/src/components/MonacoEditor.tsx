import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

/**
 * The MonacoEditor component is used in the tutorials to display and edit
 * code.
 *
 * @param props
 * @returns MonacoEditor component
 */
export default function MonacoEditor(props) {
  const editorRef = useRef();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const m2c2Modules = [
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/core/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/core/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/addons/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/addons/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/db/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/db/index.d.ts",
      },
      {
        url: "/_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_m2c2kit/declarations/m2c2kit/physics/index.d.ts",
        monacoUri: "file:///node_modules/@m2c2kit/physics/index.d.ts",
      },
    ];

    m2c2Modules.map((m2c2Module) =>
      fetch(m2c2Module.url)
        .then((response) => response.text())
        .then((data) => {
          /**
           * Remove all import and export statements from the m2c2kit library
           * declarations. For some reason, if we want the intellisense to
           * work without putting import statements in the monaco editor code,
           * which is what we do in the tutorial, we need to remove all import
           * and export statements from the m2c2kit library declarations.
           * Note: in CodeEditor.tsx, which is used in the playground, we
           * don't need to do this, because we do use import statements in the
           * playground code.
           */
          data = data.replace(/^import.*/, "");
          data = data.replace(/\nimport.*/g, "");
          data = data.replace(/\nexport.*/g, "");
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            data,
            m2c2Module.monacoUri,
          );
        }),
    );

    /**
     * Add a declaration for the game object, which is used in the tutorials,
     * so new learners don't have to deal with the concept of "this" in
     * JavaScript. In all the tutorials, "this" refers to the game object,
     * so we add a declaration for it here. Note: in the templates for
     * the tutorials, behind the scenes we automatically insert the
     * following line of code: const game = this;
     */
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      "declare const game: Game",
      "file:///game.js",
    );

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ES2020,
      noEmit: true,
    });
    props.updateCode(props.monacoCode);
    props.runCode(props.monacoCode);
  }

  function handleEditorChange(value) {
    props.updateCode(value);
  }

  return (
    <>
      <Editor
        height="400px"
        width={props.monacoWidth}
        // We need a unique path for each instance of the editor
        path={`index${props.consoleId}.ts`}
        defaultLanguage="javascript"
        value={props.monacoCode}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </>
  );
}
