{
    "compilerOptions": {
        "target": "ESNext",
        "useDefineForClassFields": true,
        "lib": [
            "DOM",
            "DOM.Iterable",
            "ESNext"
        ],
        "sourceMap": true,
        "allowJs": true,
        "skipLibCheck": true,
        "esModuleInterop": false,
        "noImplicitAny": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "module": "ESNext",
        "moduleResolution": "Node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        // "noEmit": true,
        "jsx": "react-jsx",
        "declaration": true,
        "outDir": "./dist",
        "emitDeclarationOnly": false,
        "types": [
            "vite/client"
        ],
        "noUnusedParameters": true,
        "noUnusedLocals": true,
        "noUncheckedIndexedAccess": true,
    },
    "include": [
        "src"
    ],
    "baseUrl": "./",
    "references": [
        {
            "path": "./tsconfig.node.json"
        }
    ]
}